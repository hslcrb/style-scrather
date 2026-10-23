// Engine compatibility checks retained from the original suite.
// Real DOM, lifecycle, async failures and UI are covered by behavioral/browser suites.

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

async function main() {
console.log('Style Scratcher — engine compatibility checks\n');

// 1. Verify the actual package/manifest contract.
console.log('1. Verifying the manifest and package version...');
const manifestPath = path.join(__dirname, '..', 'manifest.json');
assert(fs.existsSync(manifestPath), 'manifest.json must exist');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.strictEqual(manifest.manifest_version, 3, 'Manifest version must be 3');
assert.strictEqual(manifest.version, require('../package.json').version, 'Package and manifest versions must match');
assert(manifest.action && manifest.action.default_popup, 'Popup must be declared');
assert(manifest.content_scripts && manifest.content_scripts.length > 0, 'Content scripts must be declared');

const scripts = manifest.content_scripts[0].js;
const expectedScripts = [
  'content/mode-manager.js',
  'content/device-mockup.js',
  'content/tab-order-visualizer.js',
  'content/font-studio.js',
  'content/context-hud.js',
  'content/shortcut-manager.js',
  'content/react-exporter.js',
  'content/update-guardian.js',
  'content/precision-cursor.js',
  'content/instant-zoom.js',
  'content/color-suite.js',
  'content/asset-editor.js'
];
expectedScripts.forEach(s => {
  assert(scripts.includes(s), `${s} must be in manifest.json content_scripts`);
});
console.log(`   Manifest V3 v${manifest.version}: required content scripts present.\n`);

// 2. Test ModeManager (Inspect Mode vs Edit Studio Mode, Multi-select, DOM Reordering)
console.log('2. Testing ModeManager (Mode Switching, Multi-Select, DOM Operations)...');
const ModeManager = require('../content/mode-manager.js');

// Mock DOM elements
class MockDomNode {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.style = {};
    this.children = [];
    this.childNodes = [];
    this.parentNode = null;
  }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    this.childNodes.push(child);
    return child;
  }
  insertBefore(newChild, refChild) {
    this.removeChild(newChild);
    newChild.parentNode = this;
    if (!refChild) {
      this.children.push(newChild);
      this.childNodes.push(newChild);
      return newChild;
    }
    const idx = this.children.indexOf(refChild);
    if (idx === -1) {
      this.children.push(newChild);
      this.childNodes.push(newChild);
      return newChild;
    }
    this.children.splice(idx, 0, newChild);
    this.childNodes.splice(idx, 0, newChild);
    return newChild;
  }
  get nextSibling() {
    return this.nextElementSibling;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      this.childNodes.splice(idx, 1);
      child.parentNode = null;
      return child;
    }
    return null;
  }
  cloneNode(deep) {
    const clone = new MockDomNode(this.tagName, `${this.id}-clone`);
    clone.style = { ...this.style };
    return clone;
  }
  get previousElementSibling() {
    if (!this.parentNode) return null;
    const idx = this.parentNode.children.indexOf(this);
    return idx > 0 ? this.parentNode.children[idx - 1] : null;
  }
  get nextElementSibling() {
    if (!this.parentNode) return null;
    const idx = this.parentNode.children.indexOf(this);
    return idx >= 0 && idx < this.parentNode.children.length - 1 ? this.parentNode.children[idx + 1] : null;
  }
}

const modeMgr = new ModeManager();
assert.strictEqual(modeMgr.getMode(), 'inspect', 'Initial mode must be inspect');
modeMgr.setMode('edit');
assert.strictEqual(modeMgr.getMode(), 'edit', 'Mode must switch to edit');
assert.strictEqual(modeMgr.toggleMode(), 'inspect', 'Toggling should switch to inspect');
assert.strictEqual(modeMgr.toggleMode(), 'edit', 'Toggling should switch back to edit');

// Test Multi-Selection
const elA = new MockDomNode('div', 'a');
const elB = new MockDomNode('div', 'b');
const parentEl = new MockDomNode('section', 'parent');
parentEl.appendChild(elA);
parentEl.appendChild(elB);

modeMgr.select(elA);
assert.strictEqual(modeMgr.getSelectedElements().length, 1);
assert.strictEqual(modeMgr.getPrimaryElement(), elA);

modeMgr.toggleSelect(elB);
assert.strictEqual(modeMgr.getSelectedElements().length, 2, 'Shift multi-select should hold 2 elements');
modeMgr.toggleSelect(elA);
assert.strictEqual(modeMgr.getSelectedElements().length, 1, 'Toggle select should deselect element A');

// Test DOM Reordering
assert.strictEqual(parentEl.children[0], elA);
assert.strictEqual(parentEl.children[1], elB);
modeMgr.moveDown(elA);
assert.strictEqual(parentEl.children[0], elB, 'elB should now be first');
assert.strictEqual(parentEl.children[1], elA, 'elA should now be second');
modeMgr.moveUp(elA);
assert.strictEqual(parentEl.children[0], elA, 'elA should be restored to first');

// Test Duplicate & Remove
const dup = modeMgr.duplicateElement(elA);
assert(dup, 'Duplicate element should be returned');
assert.strictEqual(parentEl.children.length, 3, 'Parent should now have 3 children');
modeMgr.removeElement(dup);
assert.strictEqual(parentEl.children.length, 2, 'Parent should be back to 2 children');
console.log('   ✅ ModeManager passed mode switching, multi-selection, and DOM reordering.\n');

// 3. Test DeviceMockup (TV, Desktop, iPad, iPhone, Galaxy)
console.log('3. Testing DeviceMockup (Responsive Viewport Simulator)...');
const DeviceMockup = require('../content/device-mockup.js');
const dm = new DeviceMockup();

const presets = dm.getPresets();
assert(presets.tv, 'Must have TV preset');
assert.strictEqual(presets.tv.aspectRatio, '16 / 9');
assert(presets.desktop, 'Must have Desktop preset');
assert(presets.ipad, 'Must have iPad preset');
assert(presets.iphone, 'Must have iPhone 16 Pro preset');
assert(presets.galaxy, 'Must have Galaxy S25 Ultra preset');

dm.setPreset('tv');
assert.strictEqual(dm.currentPreset, 'tv');
dm.setScale(0.5);
assert.strictEqual(dm.scale, 0.5);
dm.toggleOrientation();
assert.strictEqual(dm.isLandscape, true, 'Orientation should toggle to landscape');
dm.toggleOrientation();
assert.strictEqual(dm.isLandscape, false, 'Orientation should toggle back to portrait');
console.log('   ✅ DeviceMockup passed all device presets (TV 16:9, Desktop, iPad, iPhone, Galaxy) and scale.\n');

// Actual focus ordering is exercised in runtime-engines.test.js.

// 5. Test FontStudio (AutoLayout Detection, Google Fonts, WebFont Harvester, SVG Outliner)
console.log('4. Testing FontStudio (Hug/Fill/Fixed Autolayout & Parallel Harvester)...');
const FontStudio = require('../content/font-studio.js');

assert(Array.isArray(FontStudio.CURATED_FONTS), 'Curated fonts must be an array');
assert(FontStudio.CURATED_FONTS.some(f => f.name === 'Inter'), 'Inter font must be present');
assert(FontStudio.CURATED_FONTS.some(f => f.name === 'Pretendard'), 'Pretendard font must be present');

// Test Figma Autolayout Detection: Hug, Fill, Fixed
const flexParent = new MockDomNode('div');
const childFill = new MockDomNode('div');
childFill.style.width = '100%';
childFill.style.height = 'auto';
childFill.parentElement = flexParent;

const origGetComputedStyle = global.window ? global.window.getComputedStyle : null;
global.window = {
  getComputedStyle: (el) => ({
    width: el.style.width || '100px',
    height: el.style.height || '40px',
    display: el.style.display || 'block',
    flexDirection: 'row',
    flexGrow: '0',
    alignSelf: 'auto',
    fontSize: '16px',
    color: '#111827',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600'
  })
};

const sizingFill = FontStudio.detectAutolayoutSizing(childFill);
assert.strictEqual(sizingFill.widthSizing, 'Fill', '100% width must detect as Fill');
assert.strictEqual(sizingFill.heightSizing, 'Hug', 'auto height must detect as Hug');

const childFixed = new MockDomNode('div');
childFixed.style.width = '240px';
childFixed.style.height = '64px';
const sizingFixed = FontStudio.detectAutolayoutSizing(childFixed);
assert.strictEqual(sizingFixed.widthSizing, 'Fixed', 'Explicit 240px must detect as Fixed');
assert.strictEqual(sizingFixed.heightFixed || sizingFixed.heightSizing, 'Fixed', 'Explicit 64px must detect as Fixed');

// A DOM-less environment cannot provide real glyph measurements or outlines.
await assert.rejects(() => FontStudio.harvestGlyphs('Inter'), /Canvas 2D/);
const textEl = new MockDomNode('p');
textEl.innerText = 'Style Scratcher Studio';
assert.throws(() => FontStudio.createTextOutlines(textEl), /Canvas 2D/);

// Test W3C SVG Font Builder
const testGlyphs = [
  { char: 'A', code: '0041', width: 14, pathData: 'M 10 10 L 40 10 L 40 90 L 10 90 Z' },
  { char: '가', code: 'AC00', width: 20, pathData: 'M 20 20 L 80 20 L 80 80 L 20 80 Z' }
];
const svgFont = FontStudio.buildSvgFont('StudioFont', testGlyphs);
assert(svgFont.includes('<font id="StudioFont"'), 'SVG Font must include font tag with id');
assert(svgFont.includes('<glyph unicode="&#x0041;"'), 'SVG Font must include Latin glyph');
assert(svgFont.includes('<glyph unicode="&#xAC00;"'), 'SVG Font must include Hangul glyph');
console.log('   FontStudio layout, unsupported-Canvas errors and supplied-path SVG serialization passed.\n');

// 6. Test ContextHud (Smart Alternating Right-Click State Machine)
console.log('5. Testing ContextHud (Smart Alternating Right-Click HUD)...');
const ContextHud = require('../content/context-hud.js');
let hudActionTriggered = null;
const hud = new ContextHud(null, (action) => {
  hudActionTriggered = action;
});

assert.strictEqual(hud.state, 'READY_FOR_HUD', 'Initial state must be READY_FOR_HUD');

// 1st Right-Click: Intercepts and opens HUD
let prevented = false;
let stopped = false;
const fakeEvt1 = {
  clientX: 100,
  clientY: 150,
  preventDefault: () => { prevented = true; },
  stopPropagation: () => { stopped = true; }
};
const intercepted1 = hud.handleContextMenu(fakeEvt1, textEl);
assert.strictEqual(intercepted1, true, '1st right click must intercept');
assert.strictEqual(hud.state, 'HUD_OPEN', 'State must be HUD_OPEN');
assert.strictEqual(prevented, true, 'Event must be prevented on 1st right click');

// Click Outside: Dismisses HUD and transitions to ALLOW_NATIVE_NEXT
hud.handleClickOutside({ clientX: 0, clientY: 0 });
assert.strictEqual(hud.state, 'ALLOW_NATIVE_NEXT', 'State must transition to ALLOW_NATIVE_NEXT');

// 2nd Right-Click: ALLOWS native browser context menu, then resets to READY_FOR_HUD
prevented = false;
const fakeEvt2 = {
  clientX: 100,
  clientY: 150,
  preventDefault: () => { prevented = true; },
  stopPropagation: () => { stopped = true; }
};
const intercepted2 = hud.handleContextMenu(fakeEvt2, textEl);
assert.strictEqual(intercepted2, false, '2nd right click must NOT be intercepted (native allowed)');
assert.strictEqual(prevented, false, 'Event must NOT be prevented, allowing browser native menu');
assert.strictEqual(hud.state, 'READY_FOR_HUD', 'State must reset to READY_FOR_HUD for next cycle');
console.log('   ✅ ContextHud verified smart ping-pong alternating context menu state machine.\n');

// 7. Test ShortcutManager (Alt++ / Alt+- / Alt+0 / Alt+E & Custom Persistence)
console.log('6. Testing ShortcutManager (Custom Shortcuts & Defaults)...');
const ShortcutManager = require('../content/shortcut-manager.js');

// Mock localStorage
const storageMock = {};
global.localStorage = {
  getItem: (k) => storageMock[k] || null,
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: (k) => { delete storageMock[k]; }
};

const sm = new ShortcutManager();
assert.strictEqual(sm.getShortcut('instantZoomIn').toLowerCase(), 'alt+=');
assert.strictEqual(sm.getShortcut('instantZoomOut').toLowerCase(), 'alt+-');
assert.strictEqual(sm.getShortcut('resetZoom').toLowerCase(), 'alt+0');
assert.strictEqual(sm.getShortcut('toggleEditMode').toLowerCase(), 'alt+e');

// Test Key Matching
const zoomInEvt = { altKey: true, key: '+', code: 'Equal' };
assert.strictEqual(sm.matchKey(zoomInEvt, 'instantZoomIn'), true);

const zoomOutEvt = { altKey: true, key: '-', code: 'Minus' };
assert.strictEqual(sm.matchKey(zoomOutEvt, 'instantZoomOut'), true);

const resetZoomEvt = { altKey: true, key: '0', code: 'Digit0' };
assert.strictEqual(sm.matchKey(resetZoomEvt, 'resetZoom'), true);

const editModeEvt = { altKey: true, key: 'e', code: 'KeyE' };
assert.strictEqual(sm.matchKey(editModeEvt, 'toggleEditMode'), true);

// Test Custom Mapping & Reset
sm.setShortcut('toggleEditMode', 'ctrl+shift+e');
assert.strictEqual(sm.getShortcut('toggleEditMode'), 'ctrl+shift+e');
sm.resetToDefaults();
assert.strictEqual(sm.getShortcut('toggleEditMode').toLowerCase(), 'alt+e', 'Reset must restore default alt+e');
console.log('   ✅ ShortcutManager passed Alt key matching, custom remapping, and resetToDefaults.\n');

// 8. Test ReactExporter (Clean JSX & Tailwind Conversion)
console.log('7. Testing ReactExporter (React JSX & Tailwind Exporter)...');
const ReactExporter = require('../content/react-exporter.js');

const cardEl = new MockDomNode('button');
cardEl.innerText = 'Confirm';
cardEl.style.backgroundColor = 'rgb(37, 99, 235)';
cardEl.style.borderRadius = '6px';
cardEl.style.padding = '8px 16px';

const jsx = ReactExporter.generateComponent(cardEl);
assert(jsx.includes('export default function GeneratedComponent()'), 'Must export functional React component');
assert(jsx.includes('<button'), 'Must generate valid JSX button');
assert(jsx.includes('Confirm'), 'Must retain inner text');
assert(jsx.includes('className='), 'Must include Tailwind CSS className');
console.log('   ✅ ReactExporter passed clean JSX component generation with Tailwind classes.\n');

// Cursor escaping, activation and listener cleanup are behavioral regression cases.

// 10. Test InstantZoom (Step Zooming Alt++ / Alt+- / Alt+0)
console.log('8. Testing InstantZoom (Alt Step Zooming & 100% Reset)...');
const InstantZoom = require('../content/instant-zoom.js');
const zoomBody = new MockDomNode('body');
const zoom = new InstantZoom();
zoom.zoomTarget = zoomBody;

assert.strictEqual(zoom.currentScale, 1.0);
zoom.zoomIn(0.25);
assert.strictEqual(zoom.currentScale, 1.25, 'zoomIn should increase scale to 1.25');
zoom.zoomIn(0.25);
assert.strictEqual(zoom.currentScale, 1.5, 'zoomIn should increase scale to 1.5');
zoom.zoomOut(0.25);
assert.strictEqual(zoom.currentScale, 1.25, 'zoomOut should decrease scale to 1.25');
zoom.resetZoom();
assert.strictEqual(zoom.currentScale, 1.0, 'resetZoom should return to 1.0');
console.log('   ✅ InstantZoom passed step zooming and reset.\n');

// 11. Test Custom Grid Configuration in OverlayCanvas
console.log('9. Testing Custom Grid in OverlayCanvas...');
const OverlayCanvas = require('../content/overlay-canvas.js');
const oc = new OverlayCanvas({ appendChild: () => {} });
assert.strictEqual(oc.gridConfig.columns, 12);
oc.setGridConfig({ columns: 16, gutter: 24, color: '#3B82F6' });
assert.strictEqual(oc.gridConfig.columns, 16);
assert.strictEqual(oc.gridConfig.gutter, 24);
assert.strictEqual(oc.gridConfig.color, '#3B82F6');
console.log('   ✅ OverlayCanvas passed custom grid configuration (16 cols, 24px gutter).\n');

// 12. Runtime files and preserved release history.
console.log('10. Verifying runtime files and release history...');
const v4Files = [
  'manifest.json',
  'content/mode-manager.js',
  'content/device-mockup.js',
  'content/tab-order-visualizer.js',
  'content/font-studio.js',
  'content/context-hud.js',
  'content/shortcut-manager.js',
  'content/react-exporter.js',
  'content/update-guardian.js',
  'content/color-suite.js',
  'content/asset-editor.js',
  'content/precision-cursor.js',
  'content/event-interceptor.js',
  'content/unit-converter.js',
  'content/instant-zoom.js',
  'content/interaction-detector.js',
  'content/graphics-inspector.js',
  'content/page-controller.js',
  'content/motion-inspector.js',
  'content/css-beautifier.js',
  'content/tailwind-converter.js',
  'content/palette-extractor.js',
  'content/overlay-canvas.js',
  'content/style-tweaker.js',
  'content/components/floating-dock.js',
  'content/styles/shadow-styles.css',
  'content/content.js',
  'background/service-worker.js',
  'popup/popup.js',
  'popup/popup.html',
  'popup/popup.css',
  'demo/index.html',
  'docs/releases/release-notes-v4.0.3.md',
  'README.md',
  'LICENSE'
];

v4Files.forEach(rel => {
  const full = path.join(__dirname, '..', rel);
  assert(fs.existsSync(full), `File ${rel} must exist`);

});

// Studio layout and all ten panels are tested through behavior, not CSS text matching.
console.log('11. Testing release version parsing and comparison...');
const UpdateGuardian = require('../content/update-guardian.js');

// Test UpdateGuardian version parsing & comparison
assert.deepStrictEqual(UpdateGuardian.parseVersion('v4.0.3.'), [4, 0, 3]);
assert.deepStrictEqual(UpdateGuardian.parseVersion('4.0.3'), [4, 0, 3]);
assert.strictEqual(UpdateGuardian.isNewer('v4.0.4.', '4.0.3'), true);
assert.strictEqual(UpdateGuardian.isNewer('v4.0.3.', '4.0.3'), false);
assert.strictEqual(UpdateGuardian.isNewer('v4.0.2.', '4.0.3'), false);
assert.strictEqual(UpdateGuardian.formatDisplayVersion('4.0.3'), 'v4.0.3.');
assert.strictEqual(UpdateGuardian.formatDisplayVersion('v1.1.1.'), 'v1.1.1.');
console.log('   ✅ UpdateGuardian module verified: Semantic version parser and comparison accurate.');

console.log('\nEngine compatibility checks passed.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
