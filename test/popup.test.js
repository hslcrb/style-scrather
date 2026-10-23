const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../popup/popup.js'), 'utf8');

class Element {
  constructor() {
    this.listeners = {};
    this.attributes = {};
    this.style = {};
    this.dataset = {};
    this.textContent = '';
    this.hidden = false;
    this.disabled = false;
    const classes = new Set();
    this.classList = {
      add: (...values) => values.forEach(value => classes.add(value)),
      remove: (...values) => values.forEach(value => classes.delete(value)),
      contains: value => classes.has(value),
      toggle: (value, force) => {
        const add = force === undefined ? !classes.has(value) : force;
        if (add) classes.add(value); else classes.delete(value);
        return add;
      },
    };
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(type, listener) { this.listeners[type] = listener; }
  querySelector() { return new Element(); }
  async click() { if (!this.disabled) await this.listeners.click?.({ target: this }); }
}

async function popup({ sendMessage, query, executeScript, noBrowser = false } = {}) {
  const nodes = new Map();
  const calls = { messages: [], injections: [], closed: 0 };
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, new Element());
    return nodes.get(id);
  };
  const events = {};
  const document = {
    body: new Element(),
    getElementById: get,
    addEventListener: (name, callback) => { events[name] = callback; },
  };
  const manifest = { version: '4.1.0', content_scripts: [{ js: ['content/update-guardian.js', 'content/content.js'] }] };
  const chrome = noBrowser ? undefined : {
    runtime: { getManifest: () => manifest },
    tabs: {
      query: query || (async () => [{ id: 7, url: 'https://example.com/design' }]),
      sendMessage: async (id, message) => {
        calls.messages.push({ id, ...message });
        return sendMessage ? sendMessage(message, calls.messages.length) : { isActive: false, isGridActive: false };
      },
    },
    scripting: { executeScript: async options => {
      calls.injections.push(options);
      if (executeScript) return executeScript(options);
      return [];
    } },
  };
  vm.runInNewContext(source, { document, chrome, window: { close: () => calls.closed++ }, URL, setTimeout, clearTimeout, console });
  await events.DOMContentLoaded();
  return { get, calls, manifest };
}

test('opening a popup only probes the page and never injects or activates', async () => {
  const app = await popup({ sendMessage: async () => { throw new Error('Could not establish connection. Receiving end does not exist.'); } });
  assert.equal(app.calls.injections.length, 0);
  assert.deepEqual(app.calls.messages.map(message => message.type), ['GET_STATE']);
  assert.equal(app.get('toggleInspectorBtn').disabled, false);
});

test('an explicit start injects the manifest list once, including the update guardian', async () => {
  const app = await popup({ sendMessage: async (message, count) => {
    if (count <= 2) throw new Error('Receiving end does not exist.');
    return { isActive: true, isGridActive: false };
  } });
  await app.get('toggleInspectorBtn').click();
  assert.equal(app.calls.injections.length, 1);
  assert.deepEqual(Array.from(app.calls.injections[0].files), app.manifest.content_scripts[0].js);
  assert.equal(app.get('toggleInspectorBtn').attributes['aria-pressed'], 'true');
});

test('a missing toggle response cannot become a false success', async () => {
  const app = await popup({ sendMessage: async message => message.type === 'GET_STATE' ? { isActive: false, isGridActive: false } : null });
  await app.get('toggleInspectorBtn').click();
  assert.equal(app.get('toggleInspectorBtn').classList.contains('active'), false);
  assert.equal(app.get('restrictedBanner').hidden, false);
  assert.equal(app.get('retryConnectionBtn').hidden, false);
  assert.equal(app.get('toggleInspectorBtn').disabled, false);
});

test('palette closes only after the page acknowledges opening it', async () => {
  const app = await popup({ sendMessage: async message => message.type === 'GET_STATE' ? { isActive: false, isGridActive: false } : null });
  await app.get('openPaletteBtn').click();
  assert.equal(app.calls.closed, 0);
});

test('pending requests disable all actions and cannot double toggle', async () => {
  let release;
  const app = await popup({ sendMessage: async message => {
    if (message.type === 'GET_STATE') return { isActive: false, isGridActive: false };
    return new Promise(resolve => { release = resolve; });
  } });
  const pending = app.get('toggleInspectorBtn').click();
  await Promise.resolve();
  assert.equal(app.get('toggleInspectorBtn').disabled, true);
  assert.equal(app.get('toggleGridBtn').disabled, true);
  assert.equal(app.get('openPaletteBtn').disabled, true);
  await app.get('toggleInspectorBtn').click();
  release({ isActive: true, isGridActive: false });
  await pending;
  assert.equal(app.calls.messages.filter(message => message.type === 'TOGGLE_SCRATCHER').length, 1);
  assert.equal(app.get('toggleInspectorBtn').disabled, false);
});

test('browser context and restricted URLs have explicit disabled states', async () => {
  const preview = await popup({ noBrowser: true });
  assert.match(preview.get('restrictedBannerText').textContent, /Chrome|확장/);
  assert.equal(preview.get('toggleInspectorBtn').disabled, true);
  const restricted = await popup({ query: async () => [{ id: 7, url: 'chrome://extensions' }] });
  assert.equal(restricted.calls.messages.length, 0);
  assert.equal(restricted.get('toggleInspectorBtn').disabled, true);
});

test('a URL merely mentioning the web store remains inspectable', async () => {
  const app = await popup({ query: async () => [{ id: 7, url: 'https://example.com/?from=chromewebstore.google.com' }] });
  assert.equal(app.calls.messages.length, 1);
  assert.equal(app.get('toggleInspectorBtn').disabled, false);
});

test('retry reconnects without replaying an uncertain toggle', async () => {
  const app = await popup({ sendMessage: async message => message.type === 'TOGGLE_SCRATCHER' ? null : { isActive: true, isGridActive: false } });
  await app.get('toggleInspectorBtn').click();
  await app.get('retryConnectionBtn').click();
  assert.deepEqual(app.calls.messages.map(message => message.type), ['GET_STATE', 'TOGGLE_SCRATCHER', 'GET_STATE']);
  assert.equal(app.get('restrictedBanner').hidden, true);
});
