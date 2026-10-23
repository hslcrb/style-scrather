const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../content/components/floating-dock.js'), 'utf8');
function load(overrides = {}) {
  const context = vm.createContext({ window: { innerWidth: 320, innerHeight: 480 }, navigator: {}, setTimeout, clearTimeout, ...overrides });
  vm.runInContext(source, context);
  return { context, Dock: context.window.FloatingDock };
}

function control() {
  const attributes = new Map();
  return { disabled: false, innerHTML: '<span>Run</span>', setAttribute: (key, value) => attributes.set(key, value), removeAttribute: key => attributes.delete(key), attributes };
}

test('duplicate injection keeps the existing FloatingDock constructor', () => {
  const { context, Dock } = load();
  vm.runInContext(source, context);
  assert.equal(context.window.FloatingDock, Dock);
});

test('position clamping keeps the whole dock inside a narrow viewport', () => {
  const { Dock } = load();
  const dock = Object.create(Dock.prototype);
  dock.container = { style: {}, getBoundingClientRect: () => ({ left: 900, top: -50, width: 296, height: 456 }) };
  dock.clampPosition();
  assert.equal(dock.container.style.left, '12px');
  assert.equal(dock.container.style.top, '12px');
  assert.equal(dock.container.style.right, 'auto');
});

test('clipboard rejection becomes readable feedback and a false result', async () => {
  const { Dock } = load({ navigator: { clipboard: { writeText: async () => { throw new Error('Permission denied'); } } } });
  const dock = Object.create(Dock.prototype);
  const notices = [];
  dock.showToast = (...args) => notices.push(args);
  assert.equal(await dock.copyText('test'), false);
  assert.equal(notices[0][1], 'error');
  assert.match(notices[0][0], /클립보드 권한/);
});

test('unsupported clipboard does not throw or claim success', async () => {
  const { Dock } = load();
  const dock = Object.create(Dock.prototype);
  dock.showToast = () => {};
  assert.equal(await dock.copyText('test'), false);
});

test('pending action prevents duplicates, then restores controls on failure', async () => {
  const { Dock } = load();
  const dock = Object.create(Dock.prototype);
  const button = control();
  const notices = [];
  dock.showToast = (...args) => notices.push(args);
  let reject;
  let executions = 0;
  const action = () => { executions++; return new Promise((resolve, fail) => { reject = fail; }); };
  const first = dock.performAction(button, action);
  assert.equal(button.disabled, true);
  assert.equal(button.attributes.get('aria-busy'), 'true');
  await dock.performAction(button, action);
  assert.equal(executions, 1);
  reject(new Error('Network unavailable'));
  await first;
  assert.equal(button.disabled, false);
  assert.equal(button.attributes.has('aria-busy'), false);
  assert.equal(button.innerHTML, '<span>Run</span>');
  assert.equal(notices[0][1], 'error');
});

test('a newer toast cancels the old dismissal timer', () => {
  const timers = new Map();
  let nextTimer = 0;
  const { Dock } = load({ setTimeout: callback => { const id = ++nextTimer; timers.set(id, callback); return id; }, clearTimeout: id => timers.delete(id) });
  const dock = Object.create(Dock.prototype);
  const classes = new Set();
  const toast = { dataset: {}, classList: { add: value => classes.add(value), remove: value => classes.delete(value) } };
  const message = {};
  dock.container = { querySelector: selector => selector === '#toastMsg' ? message : toast };
  dock.showToast('first');
  dock.showToast('second', 'error');
  assert.equal(timers.size, 1);
  assert.equal(message.textContent, 'second');
  assert.equal(toast.dataset.kind, 'error');
  assert.equal(classes.has('show'), true);
});
