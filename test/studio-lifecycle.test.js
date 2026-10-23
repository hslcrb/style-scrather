const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture(guardian = { checkForUpdate: async () => ({ hasUpdate: false }) }, active = true) {
  const timers = new Map(), frames = new Map();
  let nextId = 0, renders = 0, banners = 0, measurements = 0;
  const visibility = { value: false };
  function node() {
    const listeners = new Map(), controls = new Map(), attributes = new Map(), classes = new Set();
    return {
      style: {}, dataset: {}, hidden: true, scrollTop: 0, isConnected: true,
      classList: { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value), toggle() {} },
      setAttribute: (key, value) => attributes.set(key, value), getAttribute: key => attributes.get(key), removeAttribute: key => attributes.delete(key),
      addEventListener(type, handler) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(handler); },
      removeEventListener(type, handler) { listeners.get(type)?.delete(handler); },
      dispatch(type, event = {}) { for (const handler of listeners.get(type) || []) handler(event); },
      count: type => listeners.get(type)?.size || 0,
      appendChild() {}, contains: () => false, focus() {},
      querySelector(selector) { if (!controls.has(selector)) controls.set(selector, node()); return controls.get(selector); },
      querySelectorAll: () => [],
      getBoundingClientRect() { measurements++; return visibility.value ? { left: 1200, top: 20, width: 360, height: 600 } : { left: 0, top: 0, width: 0, height: 0 }; }
    };
  }
  const document = Object.assign(node(), { createElement: node });
  const window = Object.assign(node(), { innerWidth: 1440, innerHeight: 1000 });
  const context = vm.createContext({ window, document, navigator: {}, queueMicrotask,
    setTimeout: callback => { const id = ++nextId; timers.set(id, callback); return id; },
    clearTimeout: id => timers.delete(id),
    requestAnimationFrame: callback => { const id = ++nextId; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id)
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../content/components/floating-dock.js'), 'utf8'), context);
  const Dock = window.FloatingDock;
  Dock.prototype.renderInspectorTab = () => { renders++; };
  Dock.prototype.showUpdateBanner = () => { banners++; };
  const dock = new Dock(node(), { active, updateGuardian: guardian });
  return { dock, window, document, timers, frames, visibility,
    renders: () => renders, banners: () => banners, measurements: () => measurements,
    flushFrames() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); },
    startTimers() { const callbacks = [...timers.values()]; timers.clear(); return callbacks.map(callback => callback()); }
  };
}

test('dock global listeners attach once while active and fully detach on close', () => {
  const env = fixture();
  assert.equal(env.document.count('pointerdown'), 1);
  assert.equal(env.window.count('resize'), 1);
  assert.equal(env.frames.size, 0, 'initial activation keeps the stylesheet default position');
  env.dock.setActive(false);
  assert.equal(env.document.count('pointerdown'), 0);
  assert.equal(env.window.count('resize'), 0);
  const position = { ...env.dock.container.style };
  env.document.dispatch('pointerdown', { composedPath: () => [] });
  env.window.dispatch('resize');
  env.flushFrames();
  assert.deepEqual(env.dock.container.style, position);
  env.dock.setActive(true);
  env.dock.setActive(true);
  assert.equal(env.document.count('pointerdown'), 1);
  assert.equal(env.window.count('resize'), 1);
});

test('activation defers clamping until visible and close cancels UI timers', () => {
  const env = fixture(undefined, false);
  assert.equal(env.document.count('pointerdown'), 0);
  assert.equal(env.timers.size, 0);
  env.dock.container.style.left = '1200px';
  env.dock.setActive(true);
  assert.equal(env.measurements(), 0);
  env.visibility.value = true;
  env.flushFrames();
  assert.equal(env.dock.container.style.left, '1068px');
  env.dock.showToast('Pending');
  env.window.dispatch('resize');
  assert.ok(env.timers.size > 0 && env.frames.size > 0);
  env.dock.setActive(false);
  assert.equal(env.timers.size, 0);
  assert.equal(env.frames.size, 0);
  assert.equal(env.dock.container.querySelector('#scratcherToast').classList.contains('show'), false);
  const renders = env.renders();
  env.dock.showToast('Late result');
  env.dock.renderCurrentTab();
  assert.equal(env.timers.size, 0);
  assert.equal(env.renders(), renders);
});

test('an update response from an old activation cannot change the reopened dock', async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const env = fixture({ checkForUpdate: () => pending });
  const callbacks = env.startTimers();
  env.dock.setActive(false);
  env.dock.setActive(true);
  resolve({ hasUpdate: true });
  await Promise.all(callbacks);
  assert.equal(env.banners(), 0);
  await Promise.all(env.startTimers());
  assert.equal(env.banners(), 1);
});
