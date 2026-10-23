const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('runtime scripts can be injected twice without duplicate globals or message handlers', () => {
  const root = path.join(__dirname, '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  // FloatingDock has its own interface test; this verifies the runtime-owned scripts.
  const files = manifest.content_scripts.flatMap(entry => entry.js || [])
    .filter(file => file !== 'content/components/floating-dock.js');
  let receivers = 0;
  class EventTarget {
    addEventListener() {}
    removeEventListener() {}
  }
  class Element extends EventTarget {}
  const window = {};
  const context = vm.createContext({ window, EventTarget, Element,
    chrome: { runtime: { onMessage: { addListener() { receivers++; } } } }
  });
  for (const file of files) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  const first = { ...window };
  assert.doesNotThrow(() => {
    for (const file of files) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  });
  assert.equal(receivers, 1);
  for (const key of Object.keys(first)) assert.equal(window[key], first[key], key);
});

test('event observation is reversible and removes the exact listener identity', () => {
  class EventTarget { addEventListener() {} removeEventListener() {} }
  class Element extends EventTarget {}
  const add = EventTarget.prototype.addEventListener;
  const window = {};
  const context = vm.createContext({ window, EventTarget, Element });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../content/event-interceptor.js'), 'utf8'), context);
  assert.equal(EventTarget.prototype.addEventListener, add, 'loading alone must not patch browser event methods');
  window.__STYLE_SCRATCHER_SET_INTERCEPTION__(true);
  const node = new Element();
  function first() {}
  function second() {}
  node.addEventListener('click', first);
  node.addEventListener('click', second);
  node.addEventListener('click', first);
  node.removeEventListener('click', second);
  const events = window.__STYLE_SCRATCHER_GET_EVENTS__(node);
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'first');
  window.__STYLE_SCRATCHER_SET_INTERCEPTION__(false);
  assert.equal(EventTarget.prototype.addEventListener, add);
  assert.equal(window.__STYLE_SCRATCHER_GET_EVENTS__(node).length, 0);
});
