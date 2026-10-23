const test = require('node:test');
const assert = require('node:assert/strict');
const ReactExporter = require('../content/react-exporter.js');

function element(tag, { text = '', attrs = {}, className = '', singleText = true } = {}) {
  return {
    tagName: tag.toUpperCase(), className, id: attrs.id || '', style: {},
    childNodes: singleText ? [{ nodeType: 3 }] : [{ nodeType: 1 }],
    textContent: text, innerText: text,
    getAttribute(name) { return Object.hasOwn(attrs, name) ? attrs[name] : null; }
  };
}

// Decode the emitted string expressions. JSON.parse also rejects broken quoting,
// unescaped newlines, or accidental code instead of a literal string value.
function stringsIn(jsx) {
  return [...jsx.matchAll(/\{("(?:[^"\\]|\\.)*")\}/g)].map(match => JSON.parse(match[1]));
}

test('JSX preserves special text as a string instead of markup or expressions', () => {
  const value = 'Say "hello" <em> & {name} \\ path\n다음 줄';
  const output = ReactExporter.generateComponent(element('p', { text: value }));
  assert.deepEqual(stringsIn(output), ['Say "hello" <em> & {name} \\ path\n다음 줄']);
  assert.match(output, /<p>\{[\s\S]*\}<\/p>/);
});

test('JSX preserves quotes and entity-like text in attributes, including empty alt', () => {
  const output = ReactExporter.generateComponent(element('img', {
    className: 'card "quoted"',
    attrs: { id: 'id-{value}', src: '/image?label="a"&literal=&amp;', alt: '', href: '/<next>', target: '_blank' }
  }));
  assert.deepEqual(stringsIn(output), ['card "quoted"', 'id-{value}', '/image?label="a"&literal=&amp;', '', '/<next>', '_blank']);
  assert.match(output, /alt=\{""\}/);
});

test('JSX quotes Tailwind arbitrary values and the nested-content preview', t => {
  global.TailwindConverter = { convert: () => ({ tailwind: 'before:content-["a&b"]' }) };
  t.after(() => { delete global.TailwindConverter; });
  const output = ReactExporter.generateComponent(element('div', {
    text: 'Nested {value} <span> "text"', singleText: false
  }));
  assert.deepEqual(stringsIn(output), ['before:content-["a&b"]', 'Nested {value} <span> "text"']);
});

test('HTML void elements have no children or closing tag in JSX', () => {
  for (const tag of ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']) {
    const output = ReactExporter.generateComponent(element(tag, { text: 'must not render' }));
    assert.ok(output.includes(`<${tag} />`), `${tag} must be self-closing`);
    assert.ok(!output.includes('must not render'), `${tag} must not have children`);
    assert.ok(!output.includes(`</${tag}>`), `${tag} must not have a closing tag`);
  }
  for (const tag of ['div', 'video', 'textarea']) {
    const output = ReactExporter.generateComponent(element(tag, { text: 'keep me' }));
    assert.ok(output.includes(`</${tag}>`), `${tag} must retain its closing tag`);
    assert.deepEqual(stringsIn(output), ['keep me']);
  }
});

function captureDownloads(t) {
  const files = [];
  t.mock.method(ReactExporter, 'triggerDownload', (url, filename) => { files.push({ url, filename }); });
  t.after(async () => {
    // Drain the pre-fix fire-and-forget path as well, so a failing regression
    // cannot leak pending work or blob URLs into another test.
    await new Promise(resolve => setImmediate(resolve));
    for (const file of files) if (file.url.startsWith('blob:')) URL.revokeObjectURL(file.url);
  });
  return files;
}

test('an HTTP error is rejected without downloading its error page', async t => {
  const files = captureDownloads(t);
  t.mock.method(globalThis, 'fetch', async () => new Response('Not found', { status: 404 }));
  await assert.rejects(ReactExporter.fetchAndDownload('https://assets.test/missing.png', 'missing.png'), /404/);
  assert.deepEqual(files, []);
});

test('image and background downloads propagate HTTP failure to their caller', async t => {
  const files = captureDownloads(t);
  t.mock.method(globalThis, 'fetch', async () => new Response('Not found', { status: 404 }));
  const image = Object.assign(element('img'), { src: 'https://assets.test/missing.png', closest: () => null });
  const background = Object.assign(element('div'), { closest: () => null, style: { backgroundImage: 'url("https://assets.test/missing.png")' } });
  for (const target of [image, background]) {
    await assert.rejects(Promise.resolve(ReactExporter.downloadAsset(target)), /404/);
  }
  assert.deepEqual(files, []);
});

test('a successful image download awaits the bytes before reporting metadata', async t => {
  const files = captureDownloads(t);
  const nativeFetch = globalThis.fetch;
  t.mock.method(globalThis, 'fetch', async () => new Response('image bytes', { headers: { 'Content-Type': 'image/png' } }));
  const image = Object.assign(element('img'), { src: 'https://assets.test/photo.png?cache=1', closest: () => null });
  const result = await ReactExporter.downloadAsset(image);
  assert.deepEqual(result, { type: 'image', filename: 'photo.png', src: 'https://assets.test/photo.png?cache=1' });
  assert.equal(files.length, 1, 'completion must mean that the download was requested');
  assert.equal(files[0].filename, 'photo.png');
  const response = await nativeFetch(files[0].url);
  assert.equal(response.headers.get('Content-Type'), 'image/png');
  assert.equal(await response.text(), 'image bytes');
});

test('network and response-body failures do not fall back to an unchecked URL', async t => {
  const files = captureDownloads(t);
  const request = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Network unavailable'); });
  await assert.rejects(ReactExporter.fetchAndDownload('https://assets.test/image.png', 'image.png'), /Network unavailable/);
  request.mock.mockImplementation(async () => {
    const response = new Response('unreadable');
    response.blob = async () => { throw new Error('Body interrupted'); };
    return response;
  });
  await assert.rejects(ReactExporter.fetchAndDownload('https://assets.test/image.png', 'image.png'), /Body interrupted/);
  assert.deepEqual(files, []);
});

test('SVG and absent assets keep their result contract when awaited', async t => {
  const files = captureDownloads(t);
  const svg = Object.assign(element('svg'), { outerHTML: '<svg viewBox="0 0 10 10"></svg>' });
  const result = await ReactExporter.downloadAsset(svg);
  assert.equal(result.type, 'svg');
  assert.match(result.filename, /^asset-vector-\d+\.svg$/);
  assert.equal(await (await fetch(files[0].url)).text(), '<svg viewBox="0 0 10 10"></svg>');
  const noAsset = Object.assign(element('div'), { closest: () => null, style: { backgroundImage: 'none' } });
  assert.equal(await ReactExporter.downloadAsset(noAsset), null);
  assert.equal(await ReactExporter.downloadAsset(null), null);
});
