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

function panel() {
  return { innerHTML: '', querySelectorAll: () => [], querySelector: () => ({ addEventListener() {}, style: {} }) };
}

test('stylesheet source labels and search text render as text', () => {
  const { Dock } = load();
  const dock = Object.create(Dock.prototype);
  const view = panel();
  dock.siteStylesheets = [{ source: '<img data-hostile="source">', css: 'p::before { content: "&lt;"; }' }];
  dock.displayFilteredCss(view, '');
  assert.equal(view.innerHTML.includes('<img data-hostile'), false);
  assert.ok(view.innerHTML.includes('&amp;lt;'), 'literal entities must not change the displayed CSS');
  dock.displayFilteredCss(view, '<img data-hostile="search">');
  assert.equal(view.innerHTML.includes('<img data-hostile'), false);
});

test('font editor escapes selected page text and font names', () => {
  const payload = '</textarea><img data-hostile="text">';
  const { Dock } = load({ window: { getComputedStyle: () => ({ fontFamily: 'Inter', fontSize: '16px', fontWeight: '400' }) }, FontStudio: { CURATED_FONTS: [{ name: '<img data-hostile="font">', google: false }] } });
  const dock = Object.create(Dock.prototype);
  dock.tweaker = { getElement: () => ({ innerText: payload }) };
  dock.fontStudio = { CURATED_FONTS: [{ name: '<img data-hostile="font">', google: false }] };
  dock.extractedFonts = [];
  const view = panel();
  dock.renderFontsTab(view);
  assert.equal(view.innerHTML.includes('<img data-hostile'), false);
  assert.ok(view.innerHTML.includes('&lt;/textarea&gt;'));
});

test('asset editor escapes textarea and attribute values from the page', () => {
  const payload = '</textarea><img data-hostile="asset">';
  const { Dock } = load({ AssetEditor: { identifyType: () => 'image', getText: () => payload, getImageSrc: () => 'https://example.com/" data-hostile="url', getSvgInfo: () => null } });
  const dock = Object.create(Dock.prototype);
  dock.tweaker = { getElement: () => ({ tagName: 'IMG', isContentEditable: false }) };
  const view = panel();
  dock.renderAssetsTab(view);
  assert.equal(view.innerHTML.includes('<img data-hostile'), false);
  assert.equal(view.innerHTML.includes('" data-hostile="url'), false);
});

test('motion panel includes both animations and transitions on one element', () => {
  const { Dock } = load({ MotionInspector: { parseCubicBezier: () => [0, 0, 1, 1], renderBezierSvg: () => '<svg></svg>' } });
  const dock = Object.create(Dock.prototype);
  dock.tweaker = { getElement: () => ({}) };
  dock.motionInspector = { playbackRate: 1, isPaused: false, inspect: () => ({ animations: [{ name: 'fade-animation', timing: 'ease', duration: '1s', iteration: 1 }], transitions: [{ property: 'opacity-transition', timing: 'ease', duration: '1s' }] }) };
  const view = panel();
  dock.renderMotionTab(view);
  assert.ok(view.innerHTML.includes('fade-animation'));
  assert.ok(view.innerHTML.includes('opacity-transition'));
});

test('the code panel downloads the selected asset and reports absent or failed assets', async () => {
  const { Dock } = load({ TailwindConverter: { convert: () => ({ tailwind: '', cleanCss: 'color: red;' }) } });
  const selected = { tagName: 'IMG' };
  for (const result of [{ filename: 'photo.png' }, null, new Error('HTTP 404')]) {
    const dock = Object.create(Dock.prototype);
    const controls = new Map();
    const notices = [], calls = [];
    const view = {
      innerHTML: '', querySelectorAll: () => [],
      querySelector(selector) {
        if (!controls.has(selector)) controls.set(selector, { ...control(), addEventListener(name, listener) { this[name] = listener; } });
        return controls.get(selector);
      }
    };
    dock.tweaker = { getElement: () => selected };
    dock.reactExporter = {
      generateComponent: () => '<img />',
      async downloadAsset(element) { calls.push(element); if (result instanceof Error) throw result; return result; }
    };
    dock.showToast = (...args) => notices.push(args);
    dock.renderCodeTab(view);
    const button = controls.get('#btnDownloadAssets');
    await button.click({ currentTarget: button });
    assert.deepEqual(calls, [selected]);
    assert.equal(button.disabled, false);
    if (result instanceof Error) assert.equal(notices[0][1], 'error');
    else if (result) assert.match(notices[0][0], /photo\.png/);
    else assert.equal(notices[0][1], 'info');
  }
});

test('glyph measurement reads the current font and survives a panel switch', async () => {
  let currentFamily = 'serif';
  const { Dock } = load({ window: { getComputedStyle: () => ({ fontFamily: currentFamily, fontSize: '16px', fontWeight: '400' }) } });
  const dock = Object.create(Dock.prototype);
  const controls = new Map();
  let panelReplaced = false, measuredFamily, refreshes = 0;
  const view = {
    innerHTML: '', querySelectorAll: () => [],
    querySelector(selector) {
      if (panelReplaced) return null;
      if (!controls.has(selector)) controls.set(selector, { ...control(), style: {}, value: 'System Default', addEventListener(name, listener) { this[name] = listener; } });
      return controls.get(selector);
    }
  };
  dock.tweaker = { getElement: () => ({ innerText: 'Text' }) };
  dock.currentTab = 'fonts';
  dock.renderCurrentTab = () => { refreshes++; };
  dock.showToast = () => {};
  dock.fontStudio = {
    CURATED_FONTS: [],
    async applyFont() { currentFamily = 'sans-serif'; },
    async harvestGlyphs(family, progress) {
      measuredFamily = family;
      panelReplaced = true;
      dock.currentTab = 'code';
      progress(50);
      return { measuredCount: 1, glyphs: [{ char: 'A', width: 9 }] };
    }
  };
  dock.renderFontsTab(view);
  const select = controls.get('#fontFamilySelect');
  await select.change({ target: select });
  assert.equal(refreshes, 1, 'font labels refresh after applying a new family');
  const button = controls.get('#btnStartHarvest');
  await button.click({ currentTarget: button });
  assert.equal(measuredFamily, 'sans-serif');
  assert.equal(dock.harvestResult.family, 'sans-serif');
  assert.equal(dock.harvestPending, false);
  assert.equal(button.disabled, false);
});
