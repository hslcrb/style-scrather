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
