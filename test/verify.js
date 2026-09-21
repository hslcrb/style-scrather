// Style Scratcher v2.0 - Automated Verification Test Suite

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 [Style Scratcher v2.0] Running Comprehensive Verification Test Suite...\n');

// 1. Verify Manifest V3 & Version 2.0.0
console.log('1. Verifying manifest.json v2.0.0...');
const manifestPath = path.join(__dirname, '..', 'manifest.json');
assert(fs.existsSync(manifestPath), 'manifest.json must exist');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.strictEqual(manifest.manifest_version, 3, 'Manifest version must be 3');
assert.strictEqual(manifest.version, '2.0.0', 'Extension version must be 2.0.0');
assert(manifest.action && manifest.action.default_popup, 'Popup must be declared');
assert(manifest.content_scripts && manifest.content_scripts.length > 0, 'Content scripts must be declared');
console.log('   ✅ manifest.json is valid Manifest V3 (v2.0.0).\n');

// 2. Test UnitConverter (Multi-Unit Engine)
console.log('2. Testing UnitConverter (Multi-Unit Distance Engine)...');
const unitCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'unit-converter.js'), 'utf8');
const sandbox = { window: { innerWidth: 1920, innerHeight: 1080 }, document: {} };
vm.createContext(sandbox);
vm.runInContext(unitCode, sandbox);
const UnitConverter = sandbox.window.UnitConverter;
const uc = new UnitConverter();

// Test px
const pxRes = uc.convert(32, 'px');
assert.strictEqual(pxRes.formatted, '32px');

// Test rem (16px base -> 32px = 2rem)
const remRes = uc.convert(32, 'rem');
assert.strictEqual(remRes.formatted, '2rem');

// Test pt (32px * 0.75 = 24pt)
const ptRes = uc.convert(32, 'pt');
assert.strictEqual(ptRes.formatted, '24pt');

// Test vw
const vwRes = uc.convert(192, 'vw');
assert(vwRes.formatted.includes('vw'));

// Test formatBadge
assert.strictEqual(uc.formatBadge(32, 'px'), '32px');
assert.strictEqual(uc.formatBadge(32, 'rem'), '2rem (32px)');
console.log('   ✅ UnitConverter passed px, rem, pt, vw conversions and badge formatting.\n');

// 3. Test MotionInspector & Cubic-Bezier
console.log('3. Testing MotionInspector & Cubic-Bezier Parser...');
const motionCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'motion-inspector.js'), 'utf8');
vm.runInContext(motionCode, sandbox);
const MotionInspector = sandbox.window.MotionInspector;

const linearCoords = MotionInspector.parseCubicBezier('linear');
assert.strictEqual(linearCoords[0], 0);
assert.strictEqual(linearCoords[1], 0);
assert.strictEqual(linearCoords[2], 1);
assert.strictEqual(linearCoords[3], 1);

const customCoords = MotionInspector.parseCubicBezier('cubic-bezier(0.42, 0.0, 0.58, 1.0)');
assert.strictEqual(customCoords[0], 0.42);
assert.strictEqual(customCoords[2], 0.58);

const svgOutput = MotionInspector.renderBezierSvg(customCoords, 90);
assert(svgOutput.includes('<svg'), 'Should render valid SVG for bezier curve');
assert(svgOutput.includes('<path d="M'), 'Should render bezier path');
console.log('   ✅ MotionInspector passed cubic-bezier parsing and SVG rendering.\n');

// 4. Test GraphicsInspector
console.log('4. Testing GraphicsInspector...');
const graphicsCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'graphics-inspector.js'), 'utf8');
vm.runInContext(graphicsCode, sandbox);
const GraphicsInspector = sandbox.window.GraphicsInspector;
assert(typeof GraphicsInspector.inspectCanvas === 'function');
assert(typeof GraphicsInspector.inspectSvg === 'function');
console.log('   ✅ GraphicsInspector module validated.\n');

// 5. Test PageController (Unblock & Freeze)
console.log('5. Testing PageController (Unblocker & Freezer)...');
const pageCtrlCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'page-controller.js'), 'utf8');
vm.runInContext(pageCtrlCode, sandbox);
const PageController = sandbox.window.PageController;
const pc = new PageController();
assert.strictEqual(pc.isUnblocked, false);
assert.strictEqual(pc.isFrozen, false);
console.log('   ✅ PageController initialized successfully.\n');

// 6. Test InteractionDetector
console.log('6. Testing InteractionDetector...');
const interCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'interaction-detector.js'), 'utf8');
vm.runInContext(interCode, sandbox);
const InteractionDetector = sandbox.window.InteractionDetector;
const id = new InteractionDetector();
assert(typeof id.getEventListeners === 'function');
assert(typeof id.togglePseudo === 'function');
console.log('   ✅ InteractionDetector methods validated.\n');

// 7. Verify Design System: Anti-Pill Button Radius Rule
console.log('7. Verifying Design System: Strict Non-Pill Radius...');
const shadowCss = fs.readFileSync(path.join(__dirname, '..', 'content', 'styles', 'shadow-styles.css'), 'utf8');
assert(!shadowCss.includes('border-radius: 9999px'), 'Must not contain full capsule 9999px button radius');
assert(shadowCss.includes('border-radius: 6px') || shadowCss.includes('--radius-sm: 6px'), 'Must strictly maintain 6px-8px radius');
console.log('   ✅ Strict non-pill radius constraint preserved.\n');

// 8. Project Files Completeness
console.log('8. Verifying File Completeness for v2.0...');
const v2Files = [
  'manifest.json',
  'content/event-interceptor.js',
  'content/unit-converter.js',
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
  'demo/index.html',
  'README.md',
  'LICENSE'
];

v2Files.forEach(rel => {
  const full = path.join(__dirname, '..', rel);
  assert(fs.existsSync(full), `File ${rel} must exist`);
  console.log(`   ✅ Found ${rel}`);
});

console.log('\n🎉 ALL 8 VERIFICATION TEST PHASES FOR v2.0 PASSED SUCCESSFULLY!');
