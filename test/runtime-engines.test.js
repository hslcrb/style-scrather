const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function environment(...scripts) {
  const listeners = new Map();
  const frames = new Map();
  const timers = new Map();
  let nextId = 0;
  function target() {
    return {
      addEventListener(type, fn) {
        if (!listeners.has(this)) listeners.set(this, new Map());
        const events = listeners.get(this);
        if (!events.has(type)) events.set(type, new Set());
        events.get(type).add(fn);
      },
      removeEventListener(type, fn) { listeners.get(this)?.get(type)?.delete(fn); },
      dispatch(type, event) { for (const fn of listeners.get(this)?.get(type) || []) fn(event); }
    };
  }
  function node(tag = 'div') {
    const attrs = new Map();
    return Object.assign(target(), {
      tagName: tag.toUpperCase(), style: {}, children: [], parentNode: null, textContent: '', innerHTML: '',
      setAttribute(key, value) { attrs.set(key, String(value)); },
      getAttribute(key) { return attrs.has(key) ? attrs.get(key) : null; },
      removeAttribute(key) { attrs.delete(key); },
      appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
      removeChild(child) { this.children.splice(this.children.indexOf(child), 1); child.parentNode = null; },
      get firstChild() { return this.children[0] || null; },
      contains(child) { return this.children.includes(child); },
      remove() { this.parentNode?.removeChild(this); },
      querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; }
    });
  }
  const window = Object.assign(target(), { innerWidth: 1200, innerHeight: 800,
    getComputedStyle: () => ({ fontSize: '16px' }) });
  const document = Object.assign(target(), {
    body: node('body'), head: node('head'), documentElement: node('html'), activeElement: null,
    createElement: node, createElementNS: (_, tag) => node(tag),
    getElementById: () => null, getAnimations: () => [], elementFromPoint: () => null
  });
  const context = vm.createContext({ window, document, console: { log() {}, warn() {} },
    requestAnimationFrame: fn => { frames.set(++nextId, fn); return nextId; },
    cancelAnimationFrame: id => frames.delete(id),
    setTimeout: fn => { timers.set(++nextId, fn); return nextId; },
    clearTimeout: id => timers.delete(id)
  });
  for (const file of scripts) vm.runInContext(fs.readFileSync(path.join(__dirname, '../content', file), 'utf8'), context);
  return { window, document, node, frames, timers, context,
    count(type) { return listeners.get(window)?.get(type)?.size || 0; },
    flushFrame() { const pending = [...frames.values()]; frames.clear(); for (const fn of pending) fn(); }
  };
}

test('unfreezing removes freeze handlers without removing the copy unblocker', () => {
  const env = environment('page-controller.js');
  const controller = new env.window.PageController();
  controller.toggleUnblock(true);
  controller.toggleFreeze(true);
  controller.toggleFreeze(false);
  assert.equal(env.count('mouseout'), 0);
  assert.equal(env.count('copy'), 1);
  controller.toggleUnblock(false);
  assert.equal(env.count('copy'), 0);
});

test('unblock mode is idempotent and restores original inline event handlers', () => {
  const env = environment('page-controller.js');
  const original = () => false;
  env.document.oncopy = original;
  const controller = new env.window.PageController();
  controller.toggleUnblock(true);
  controller.toggleUnblock(true);
  assert.equal(env.count('copy'), 1);
  controller.toggleUnblock(false);
  assert.equal(env.document.oncopy, original);
});

test('zoom leaves the page styles untouched until used and restores them on deactivation', () => {
  const env = environment('instant-zoom.js');
  const original = { transform: 'translateX(10px)', transformOrigin: 'left top', transition: 'opacity 1s' };
  Object.assign(env.document.body.style, original);
  const zoom = new env.window.InstantZoom({ manageShortcuts: false });
  env.window.dispatch('mousemove', { clientX: 25, clientY: 50 });
  assert.deepEqual(env.document.body.style, original);
  zoom.zoomIn();
  assert.equal(zoom.currentScale, 1.25);
  zoom.setActive(false);
  assert.equal(zoom.currentScale, 1);
  assert.deepEqual(env.document.body.style, original);
  assert.equal(env.count('mousemove'), 0);
  assert.equal(env.count('keydown'), 0);
  assert.equal(env.timers.size, 0);
});

test('the zoom engine leaves shortcuts to the orchestrator when requested', () => {
  const env = environment('instant-zoom.js');
  const zoom = new env.window.InstantZoom({ manageShortcuts: false });
  env.window.dispatch('keydown', { key: '+', altKey: true, preventDefault() {} });
  assert.equal(zoom.currentScale, 1);
});

test('the context menu attaches only while active', () => {
  const env = environment('context-hud.js');
  const hud = new env.window.ContextHud(env.node(), { active: false });
  assert.equal(env.count('contextmenu'), 0);
  hud.setActive(true);
  assert.equal(env.count('contextmenu'), 1);
  hud.setActive(false);
  assert.equal(env.count('contextmenu'), 0);
  assert.equal(hud.container.style.display, 'none');
});

test('precision cursor renders host class names as text and detaches when disabled', () => {
  const env = environment('precision-cursor.js');
  const cursor = new env.window.PrecisionCursor(env.node());
  env.document.elementFromPoint = () => ({ tagName: 'DIV', className: '<img/src=x/onerror=alert(1)>' });
  cursor.toggle(true);
  env.window.dispatch('mousemove', { clientX: 10, clientY: 15 });
  env.flushFrame();
  assert.ok(cursor.badge.textContent.includes('<img/src=x/onerror=alert(1)>'));
  assert.ok(!cursor.badge.innerHTML.includes('<img'));
  cursor.toggle(false);
  assert.equal(env.count('mousemove'), 0);
});

test('animation reset restores original rates and does not play animations already paused', () => {
  const env = environment('motion-inspector.js');
  const running = { playbackRate: 2, playState: 'running', pause() { this.playState = 'paused'; }, play() { this.playState = 'running'; } };
  const paused = { playbackRate: 0.5, playState: 'paused', pause() {}, play() { throw new Error('Must remain paused'); } };
  env.document.getAnimations = () => [running, paused];
  const inspector = new env.window.MotionInspector();
  inspector.setPlaybackRate(0.25);
  inspector.togglePause();
  inspector.reset();
  assert.equal(running.playbackRate, 2);
  assert.equal(running.playState, 'running');
  assert.equal(paused.playbackRate, 0.5);
  assert.equal(paused.playState, 'paused');
});

test('overlay updates coalesce into one frame and inactive rendering stops', () => {
  const env = environment('overlay-canvas.js');
  const overlay = new env.window.OverlayCanvas(env.node());
  let paints = 0;
  overlay.renderCustomGrid = () => { paints++; };
  overlay.toggleGrid(true);
  for (let i = 0; i < 100; i++) overlay.render();
  assert.equal(paints, 0);
  assert.equal(env.frames.size, 1);
  env.flushFrame();
  assert.equal(paints, 1);
  overlay.render();
  overlay.setActive(false);
  env.flushFrame();
  overlay.render();
  assert.equal(paints, 1);
  assert.equal(env.frames.size, 0);
});

test('tab-order mode does not call a missing method or rescan on hover paint', () => {
  const env = environment('overlay-canvas.js');
  const overlay = new env.window.OverlayCanvas(env.node());
  overlay.setTabOrderVisualizer({ isActive: true });
  assert.doesNotThrow(() => { overlay.render(); env.flushFrame(); });
});

test('pixel measurement does not read root computed style for each distance badge', () => {
  const env = environment('unit-converter.js');
  let reads = 0;
  env.window.getComputedStyle = () => { reads++; return { fontSize: '16px' }; };
  const converter = new env.window.UnitConverter();
  reads = 0;
  for (let i = 0; i < 100; i++) converter.formatBadge(i);
  assert.equal(reads, 0);
});

test('temporary content editing restores both missing and existing editable attributes', () => {
  const env = environment('asset-editor.js');
  const element = env.node();
  Object.defineProperty(element, 'contentEditable', {
    get() { return this.getAttribute('contenteditable') || 'inherit'; },
    set(value) { this.setAttribute('contenteditable', String(value)); }
  });
  Object.defineProperty(element, 'isContentEditable', { get() { return this.getAttribute('contenteditable') === 'true'; } });
  element.focus = () => {};
  env.window.AssetEditor.toggleContentEditable(element);
  assert.equal(element.getAttribute('contenteditable'), 'true');
  env.window.AssetEditor.restoreContentEditable();
  assert.equal(element.getAttribute('contenteditable'), null);
  element.setAttribute('contenteditable', 'true');
  env.window.AssetEditor.toggleContentEditable(element);
  env.window.AssetEditor.restoreContentEditable();
  assert.equal(element.getAttribute('contenteditable'), 'true');
});

test('reset releases focus simulation markers and stored element references', () => {
  const env = environment('interaction-detector.js');
  const detector = new env.window.InteractionDetector();
  const classes = new Set();
  let focused = false;
  const element = { classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
    focus() { focused = true; }, blur() { focused = false; } };
  detector.togglePseudo(element, 'focus', true);
  assert.equal(detector.isPseudoForced(element, 'focus'), true);
  detector.reset();
  assert.equal(focused, false);
  assert.equal(classes.size, 0);
  assert.equal(detector.forcedPseudos.size, 0);
});
