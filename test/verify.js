// Style Scratcher v3.0.2 - Automated Verification Test Suite

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 [Style Scratcher v3.0.2] Running Comprehensive Verification Test Suite...\n');

// 1. Verify Manifest V3 & Version 3.0.2
console.log('1. Verifying manifest.json v3.0.2...');
const manifestPath = path.join(__dirname, '..', 'manifest.json');
assert(fs.existsSync(manifestPath), 'manifest.json must exist');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.strictEqual(manifest.manifest_version, 3, 'Manifest version must be 3');
assert.strictEqual(manifest.version, '3.0.2', 'Extension version must be 3.0.2');
assert(manifest.action && manifest.action.default_popup, 'Popup must be declared');
assert(manifest.content_scripts && manifest.content_scripts.length > 0, 'Content scripts must be declared');
const scripts = manifest.content_scripts[0].js;
assert(scripts.includes('content/color-suite.js'), 'color-suite.js must be in manifest');
assert(scripts.includes('content/asset-editor.js'), 'asset-editor.js must be in manifest');
assert(scripts.includes('content/precision-cursor.js'), 'precision-cursor.js must be in manifest');
assert(scripts.includes('content/instant-zoom.js'), 'instant-zoom.js must be in manifest');
console.log('   ✅ manifest.json is valid Manifest V3 (v3.0.2) with all content scripts.\n');

// 2. Test ColorSuite (EyeDropper, WCAG Contrast Ratio, Color Presets)
console.log('2. Testing ColorSuite (Sensory Contrast & Color Engine)...');
const colorSuiteCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'color-suite.js'), 'utf8');
const colorSandbox = { window: {} };
vm.createContext(colorSandbox);
vm.runInContext(colorSuiteCode, colorSandbox);
const ColorSuite = colorSandbox.window.ColorSuite;

assert(typeof ColorSuite.getContrastRatio === 'function', 'getContrastRatio must be a function');
const blackWhiteContrast = ColorSuite.getContrastRatio('#000000', '#ffffff');
assert.strictEqual(blackWhiteContrast.ratio, 21, 'Black/White contrast ratio must be 21:1');
assert.strictEqual(blackWhiteContrast.passesAA, true, 'Black/White must pass AA');
assert.strictEqual(blackWhiteContrast.passesAAA, true, 'Black/White must pass AAA');
assert.strictEqual(blackWhiteContrast.score, 'AAA', 'Black/White score must be AAA');

const lowContrast = ColorSuite.getContrastRatio('#777777', '#888888');
assert(lowContrast.ratio < 4.5, 'Gray/Gray must fail AA contrast');
assert.strictEqual(lowContrast.passesAA, false);

const hexRgb = ColorSuite.hexToRgb('#2563eb');
assert.strictEqual(hexRgb[0], 37);
assert.strictEqual(hexRgb[1], 99);
assert.strictEqual(hexRgb[2], 235);

assert(Array.isArray(ColorSuite.getPresets()), 'Color presets must be an array');
assert(ColorSuite.getPresets().length >= 10, 'Should provide rich designer presets');
console.log('   ✅ ColorSuite passed WCAG contrast calculation (21:1 AAA), hex converter, and presets.\n');

// 3. Test AssetEditor (Text, Image Swapping, SVG Vector Manipulation)
console.log('3. Testing AssetEditor (Live Text, Image, and SVG Manipulation)...');
const assetEditorCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'asset-editor.js'), 'utf8');

// Setup DOM mock for AssetEditor
class MockNode {
  constructor(type, content = '') {
    this.nodeType = type;
    this.textContent = content;
  }
}
class MockElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.style = {};
    this.attributes = {};
    this.childNodes = [];
    this.children = [];
    this.textContent = '';
    this.innerText = '';
    this.isContentEditable = false;
    this.contentEditable = false;
    this.parentNode = null;
    this.classList = {
      add: (c) => this.classes = this.classes ? `${this.classes} ${c}` : c,
      remove: (c) => this.classes = (this.classes || '').replace(c, '').trim()
    };
  }
  appendChild(child) {
    if (child) child.parentNode = this;
    this.childNodes.push(child);
    this.children.push(child);
    return child;
  }
  getAttribute(name) { return this.attributes[name] || null; }
  setAttribute(name, val) { this.attributes[name] = val; }
  closest(sel) {
    if (sel.toLowerCase() === this.tagName.toLowerCase()) return this;
    return null;
  }
  focus() {}
}

const assetSandbox = {
  window: {
    getComputedStyle: (el) => ({
      fill: el.style.fill || '#000000',
      stroke: el.style.stroke || 'none',
      strokeWidth: el.style.strokeWidth || '1px',
      opacity: el.style.opacity || '1',
      backgroundImage: el.style.backgroundImage || 'none'
    })
  },
  Element: MockElement,
  Node: { TEXT_NODE: 3, ELEMENT_NODE: 1 },
  DOMParser: class {
    parseFromString(str) {
      const svg = new MockElement('svg');
      svg.outerHTML = str;
      return { querySelector: () => svg };
    }
  },
  document: {
    importNode: (node) => node
  }
};
vm.createContext(assetSandbox);
vm.runInContext(assetEditorCode, assetSandbox);
const AssetEditor = assetSandbox.window.AssetEditor;

// A. identifyType
const pEl = new MockElement('p');
assert.strictEqual(AssetEditor.identifyType(pEl), 'text', 'Paragraph should be identified as text');
const imgEl = new MockElement('img');
assert.strictEqual(AssetEditor.identifyType(imgEl), 'image', 'Image should be identified as image');
const svgEl = new MockElement('svg');
assert.strictEqual(AssetEditor.identifyType(svgEl), 'svg', 'SVG should be identified as svg');

// B. Text Editing
pEl.textContent = 'Hello World';
assert.strictEqual(AssetEditor.getText(pEl), 'Hello World');
AssetEditor.setText(pEl, 'Updated Antigravity');
assert.strictEqual(AssetEditor.getText(pEl), 'Updated Antigravity');

// C. Image Swapping
imgEl.src = 'https://example.com/old.png';
assert.strictEqual(AssetEditor.getImageSrc(imgEl), 'https://example.com/old.png');
AssetEditor.setImageSrc(imgEl, 'https://example.com/new.png');
assert.strictEqual(AssetEditor.getImageSrc(imgEl), 'https://example.com/new.png');
const unsplashUrl = AssetEditor.setRandomUnsplash(imgEl);
assert(unsplashUrl.includes('images.unsplash.com'), 'Should apply valid Unsplash URL');

// D. SVG Attributes
svgEl.outerHTML = '<svg width="24" height="24"><path d="M0 0"/></svg>';
AssetEditor.setSvgProperty(svgEl, 'fill', '#2563EB');
assert.strictEqual(svgEl.getAttribute('fill'), '#2563EB');
AssetEditor.setSvgProperty(svgEl, 'strokeWidth', 3);
assert.strictEqual(svgEl.getAttribute('stroke-width'), 3);
console.log('   ✅ AssetEditor passed Text, Image, and SVG manipulation tests.\n');

// 4. Test PrecisionCursor (Figma-Style Hairline Crosshairs & Coordinates)
console.log('4. Testing PrecisionCursor (Crosshair Hairline & Coordinate Badges)...');
const cursorCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'precision-cursor.js'), 'utf8');
let mouseMoveHandler = null;
const targetEl = new MockElement('button');

const cursorSandbox = {
  window: {
    innerWidth: 1920,
    innerHeight: 1080,
    addEventListener: (evt, handler) => {
      if (evt === 'mousemove') mouseMoveHandler = handler;
    }
  },
  document: {
    createElement: (tag) => new MockElement(tag),
    elementFromPoint: (x, y) => targetEl
  }
};
vm.createContext(cursorSandbox);
vm.runInContext(cursorCode, cursorSandbox);
const PrecisionCursor = cursorSandbox.window.PrecisionCursor;

const mockShadow = { appendChild: () => {} };
const pCursor = new PrecisionCursor(mockShadow);
assert.strictEqual(pCursor.isActive, false, 'Should start inactive');
const turnedOn = pCursor.toggle();
assert.strictEqual(turnedOn, true, 'Toggle should return true');
assert.strictEqual(pCursor.isActive, true, 'isActive should be true');
assert.strictEqual(pCursor.overlay.style.display, 'block');

// Test cursor mousemove event handling
assert(typeof mouseMoveHandler === 'function', 'MouseMove listener must be registered');
mouseMoveHandler({ clientX: 340, clientY: 520 });
assert.strictEqual(pCursor.lineH.style.top, '520px');
assert.strictEqual(pCursor.lineV.style.left, '340px');
assert(pCursor.badge.innerHTML.includes('X: 340'), 'Badge must include X coordinate');
assert(pCursor.badge.innerHTML.includes('Y: 520'), 'Badge must include Y coordinate');
assert(pCursor.badge.innerHTML.includes('&lt;button&gt;') || pCursor.badge.innerHTML.includes('<button>'), 'Badge must include tag name');
console.log('   ✅ PrecisionCursor passed activation and live coordinate tracking.\n');

// 5. Test InstantZoom (Figma-Style Momentary Canvas Zoom In/Out)
console.log('5. Testing InstantZoom (520ms In / 200ms Out Curve Engine)...');
const zoomCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'instant-zoom.js'), 'utf8');
const fakeBody = { style: {}, appendChild: () => {} };
const zoomSandbox = {
  window: {
    innerWidth: 1920,
    innerHeight: 1080,
    addEventListener: () => {}
  },
  document: {
    body: fakeBody,
    activeElement: null,
    createElement: () => ({ style: {}, innerHTML: '', appendChild: () => {} })
  },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
};
vm.createContext(zoomSandbox);
vm.runInContext(zoomCode, zoomSandbox);
const InstantZoom = zoomSandbox.window.InstantZoom;
const iz = new InstantZoom();

assert.strictEqual(iz.isZoomed, false, 'Should start unzoomed');
iz.startZoom();
assert.strictEqual(iz.isZoomed, true, 'isZoomed should be true after startZoom');
assert(fakeBody.style.transform.includes('scale(2.4)'), 'Body transform should be scale(2.4)');
assert(fakeBody.style.transition.includes('520ms'), 'Zoom-in transition must be smooth (520ms)');

iz.endZoom();
assert.strictEqual(iz.isZoomed, false, 'isZoomed should be false after endZoom');
assert.strictEqual(fakeBody.style.transform, 'scale(1)', 'Body transform should return to scale(1)');
assert(fakeBody.style.transition.includes('200ms'), 'Zoom-out transition must be faster than zoom-in (200ms vs 520ms)');
console.log('   ✅ InstantZoom passed smooth zoom-in (520ms) and snappy zoom-out (200ms) tests.\n');

// 6. Test UnitConverter (Multi-Unit Engine)
console.log('6. Testing UnitConverter (Multi-Unit Distance Engine)...');
const unitCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'unit-converter.js'), 'utf8');
const sandbox = { window: { innerWidth: 1920, innerHeight: 1080 }, document: {} };
vm.createContext(sandbox);
vm.runInContext(unitCode, sandbox);
const UnitConverter = sandbox.window.UnitConverter;
const uc = new UnitConverter();

assert.strictEqual(uc.convert(32, 'px').formatted, '32px');
assert.strictEqual(uc.convert(32, 'rem').formatted, '2rem');
assert.strictEqual(uc.convert(32, 'pt').formatted, '24pt');
assert.strictEqual(uc.formatBadge(32, 'px'), '32px');
console.log('   ✅ UnitConverter passed multi-unit conversions.\n');

// 7. Verify Golden Ratio (φ = 1.618) Typography Scale & Design System
console.log('7. Verifying Golden Ratio (φ = 1.618) Modular Hierarchy & Design System...');
const shadowCss = fs.readFileSync(path.join(__dirname, '..', 'content', 'styles', 'shadow-styles.css'), 'utf8');
assert(shadowCss.includes('--golden-ratio: 1.618'), 'shadow-styles.css must declare --golden-ratio: 1.618');
assert(shadowCss.includes('--phi: 1.6180339887'), 'shadow-styles.css must declare high-precision phi');
assert(shadowCss.includes('--gr-leading-golden: 1.618'), 'shadow-styles.css must declare golden line-height');
assert(shadowCss.includes('--gr-font-label: 14px'), 'Golden Ratio label step must be defined');
assert(shadowCss.includes('--gr-font-title: 17.8px'), 'Golden Ratio title step must be defined');

const popupCss = fs.readFileSync(path.join(__dirname, '..', 'popup', 'popup.css'), 'utf8');
assert(popupCss.includes('--golden-ratio: 1.618'), 'popup.css must declare --golden-ratio: 1.618');

// Check Popup Connection Guardian & Auto-Injector
const popupJs = fs.readFileSync(path.join(__dirname, '..', 'popup', 'popup.js'), 'utf8');
assert(popupJs.includes('isRestrictedUrl'), 'popup.js must contain isRestrictedUrl security checker');
assert(popupJs.includes('ensureInjected'), 'popup.js must contain ensureInjected auto-injector');
assert(popupJs.includes('CONTENT_SCRIPTS'), 'popup.js must declare complete CONTENT_SCRIPTS dependency array');

const serviceWorkerJs = fs.readFileSync(path.join(__dirname, '..', 'background', 'service-worker.js'), 'utf8');
assert(serviceWorkerJs.includes('executeScript'), 'service-worker.js must support dynamic auto-injection fallback');

assert(!shadowCss.includes('border-radius: 9999px'), 'Must not contain full capsule 9999px button radius');
assert(shadowCss.includes('border-radius: 6px') || shadowCss.includes('--radius-sm: 6px'), 'Must strictly maintain 6px-8px radius');

const overlayCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'overlay-canvas.js'), 'utf8');
assert(overlayCode.includes("'font-size', '12px'"), 'Overlay badges must have enlarged 12px font for readability');
assert(overlayCode.includes("'font-weight', '700'"), 'Overlay badges must have 700 bold weight');
console.log('   ✅ Golden Ratio 1.618 typography system, Connection Guardian, and 12px/700 badges verified.\n');

// 8. Project Files Completeness for v3.0.2
console.log('8. Verifying File Completeness for v3.0.2...');
const v32Files = [
  'manifest.json',
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
  'README.md',
  'LICENSE'
];

v32Files.forEach(rel => {
  const full = path.join(__dirname, '..', rel);
  assert(fs.existsSync(full), `File ${rel} must exist`);
  console.log(`   ✅ Found ${rel}`);
});

console.log('\n🎉 ALL 8 VERIFICATION TEST PHASES FOR v3.0.2 PASSED BRILLIANTLY!');
