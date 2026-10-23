const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../content/content.js'), 'utf8');

function runtime(extras = {}) {
  const listeners = new Map();
  const constructed = [];
  const nodes = [];
  let receiver;
  function node() {
    return {
      children: [], style: {}, classList: { add() {}, remove() {} },
      setAttribute() {}, contains() { return false; },
      appendChild(child) { this.children.push(child); },
      attachShadow() { return node(); }, remove() {}
    };
  }
  function engine(name, extra = {}) {
    return class {
      constructor(...args) {
        constructed.push(name);
        this.name = name;
        this.args = args;
        this.isActive = true;
        this.isGridVisible = false;
        this.container = node();
        Object.assign(this, extra);
      }
      setActive(value) { this.isActive = value; }
      toggle(value) { this.isActive = value === undefined ? !this.isActive : value; return this.isActive; }
      setTabOrderVisualizer() {}
      clear() {}
      render() {}
      renderCurrentTab() {}
      setSelectedElement(value) { this.selected = value; }
      setSelectedElements(value) { this.selected = value; }
      setHoverElement(value) { this.hover = value; }
      setElement(value) { this.element = value; }
      toggleGrid() { this.isGridVisible = !this.isGridVisible; return this.isGridVisible; }
      switchTab(name) { this.tab = name; }
      clearSelection() { this.selectionCleared = true; }
      updateElement() {}
      showToast(message) { this.lastToast = message; }
      resetZoom() { this.reset = true; }
      toggleUnblock(value) { this.isUnblocked = value; }
      toggleFreeze(value) { this.isFrozen = value; }
      close() { this.closed = true; }
      matchKey(event, action) { return action === 'instantZoomIn' && event.key === '+'; }
      zoomIn() { this.zoomCalls = (this.zoomCalls || 0) + 1; }
    };
  }
  const window = {
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); }
  };
  const document = {
    readyState: 'complete', documentElement: node(), body: node(), activeElement: null,
    createElement() { const value = node(); nodes.push(value); return value; },
    elementFromPoint() { return null; }
  };
  const context = {
    window, document, console: { log() {}, warn() {}, error() {} },
    chrome: { runtime: {
      getURL: value => value, getManifest: () => ({ version: '4.1.0' }),
      onMessage: { addListener(fn) { receiver = fn; } }
    } }
  };
  for (const name of ['UnitConverter', 'InteractionDetector', 'PageController', 'MotionInspector',
    'InstantZoom', 'PrecisionCursor', 'OverlayCanvas', 'ModeManager', 'DeviceMockup',
    'TabOrderVisualizer', 'ShortcutManager', 'StyleTweaker', 'FloatingDock', 'ContextHud', 'UpdateGuardian']) {
    context[name] = engine(name);
  }
  Object.assign(context, extras);
  vm.runInNewContext(source, context);
  return {
    window, constructed, nodes, document,
    request(message) { let response; receiver(message, {}, result => { response = result; }); return response; },
    dispatch(type, event) { for (const fn of listeners.get(type) || []) fn(event); },
    listenerCount() { return [...listeners.values()].reduce((sum, set) => sum + set.size, 0); }
  };
}

test('loading content and GET_STATE leave the page and engines untouched', () => {
  const page = runtime();
  assert.equal(page.request({ type: 'GET_STATE' }).isActive, false);
  assert.equal(page.request({ type: 'GET_STATE' }).isGridActive, false);
  assert.equal(page.constructed.length, 0);
  assert.equal(page.document.documentElement.children.length, 0);
  assert.equal(page.listenerCount(), 0);
});

test('toggle initializes once and reuses the same studio after deactivation', () => {
  const page = runtime();
  assert.equal(page.request({ type: 'TOGGLE_SCRATCHER' }).isActive, true);
  const count = page.constructed.length;
  const host = page.document.documentElement.children[0];
  assert.equal(page.request({ type: 'TOGGLE_SCRATCHER' }).isActive, false);
  assert.equal(page.listenerCount(), 0);
  assert.equal(page.request({ type: 'TOGGLE_SCRATCHER' }).isActive, true);
  assert.equal(page.constructed.length, count);
  assert.equal(page.document.documentElement.children[0], host);
});

test('deactivation releases all page interaction modes', () => {
  const page = runtime();
  page.request({ type: 'OPEN_TAB', tabName: 'inspector' });
  const api = page.window.StyleScratcher;
  api.getPageController().toggleFreeze(true);
  api.getPageController().toggleUnblock(true);
  api.getPrecisionCursor().toggle(true);
  api.getTabOrderVisualizer().toggle(true);
  api.getDeviceMockup().toggle(true);
  page.request({ type: 'TOGGLE_SCRATCHER' });
  assert.equal(api.getPageController().isFrozen, false);
  assert.equal(api.getPageController().isUnblocked, false);
  assert.equal(api.getPrecisionCursor().isActive, false);
  assert.equal(api.getTabOrderVisualizer().isActive, false);
  assert.equal(api.getDeviceMockup().isActive, false);
  assert.equal(api.getInstantZoom().isActive, false);
  assert.equal(api.getContextHud().isActive, false);
  assert.equal(api.getCanvas().isActive, false);
});

test('inactive keyboard events do not perform studio actions', () => {
  const page = runtime();
  page.request({ type: 'OPEN_TAB' });
  page.request({ type: 'TOGGLE_SCRATCHER' });
  let prevented = false;
  page.dispatch('keydown', { key: '+', preventDefault() { prevented = true; } });
  assert.equal(prevented, false);
  assert.equal(page.window.StyleScratcher.getInstantZoom().zoomCalls || 0, 0);
});

test('grid and tab actions activate on demand and return truthful state', () => {
  const page = runtime();
  const grid = page.request({ type: 'TOGGLE_GRID' });
  assert.equal(grid.isActive, true);
  assert.equal(grid.isGridActive, true);
  const tab = page.request({ type: 'OPEN_TAB', tabName: 'fonts' });
  assert.equal(tab.success, true);
  assert.equal(tab.isActive, true);
  assert.equal(page.window.StyleScratcher.getDock().tab, 'fonts');
});

test('the emitted copy-react HUD action reaches the exporter and clipboard', async () => {
  const copied = [];
  const page = runtime({
    ReactExporter: { generateComponent: () => '<Fixture />' },
    navigator: { clipboard: { writeText: async text => copied.push(text) } }
  });
  page.request({ type: 'OPEN_TAB' });
  await page.window.StyleScratcher.getContextHud().args[1]('copy-react', {});
  assert.deepEqual(copied, ['<Fixture />']);
});

test('clipboard denial from a HUD action is handled with feedback', async () => {
  const page = runtime({
    ReactExporter: { generateComponent: () => '<Fixture />' },
    navigator: { clipboard: { writeText: async () => { throw new Error('Permission denied'); } } }
  });
  page.request({ type: 'OPEN_TAB' });
  await page.window.StyleScratcher.getContextHud().args[1]('copy-react', {});
  assert.match(page.window.StyleScratcher.getDock().lastToast || '', /Permission denied/);
});
