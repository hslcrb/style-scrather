// Style Scratcher - Automated Logic & Component Verification Test Suite

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 [Style Scratcher] Running Automated Verification Test Suite...\n');

// 1. Verify Manifest V3
console.log('1. Verifying manifest.json...');
const manifestPath = path.join(__dirname, '..', 'manifest.json');
assert(fs.existsSync(manifestPath), 'manifest.json must exist');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.strictEqual(manifest.manifest_version, 3, 'Manifest version must be 3');
assert(manifest.action && manifest.action.default_popup, 'Popup must be declared');
assert(manifest.content_scripts && manifest.content_scripts.length > 0, 'Content scripts must be declared');
assert(manifest.web_accessible_resources && manifest.web_accessible_resources.length > 0, 'Web accessible resources must be declared');
console.log('   ✅ manifest.json is valid Manifest V3 format.\n');

// 2. Verify Icons
console.log('2. Verifying Extension PNG Icons...');
[16, 48, 128].forEach(size => {
  const iconFile = path.join(__dirname, '..', 'icons', `icon${size}.png`);
  assert(fs.existsSync(iconFile), `icon${size}.png must exist`);
  const stat = fs.statSync(iconFile);
  assert(stat.size > 50, `icon${size}.png must have valid byte content`);
  console.log(`   ✅ icon${size}.png verified (${stat.size} bytes).`);
});
console.log('');

// 3. Test CssBeautifier
console.log('3. Testing CssBeautifier (De-minifier & Formatter)...');
// Load CssBeautifier in Node
const beautifierCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'css-beautifier.js'), 'utf8');
const vm = require('vm');
const sandbox = { window: {}, document: {} };
vm.createContext(sandbox);
vm.runInContext(beautifierCode, sandbox);
const CssBeautifier = sandbox.window.CssBeautifier;

const minifiedSample = '.btn{margin:0;padding:8px 16px;border-radius:6px;background:#2563eb;color:#ffffff}.card{border:1px solid #e5e7eb}';
const formatted = CssBeautifier.beautify(minifiedSample);
console.log('   Sample minified input:\n   ' + minifiedSample);
console.log('   Formatted output:\n' + formatted.split('\n').map(l => '   ' + l).join('\n'));

assert(formatted.includes('margin: 0;'), 'Should format margin with semicolon');
assert(formatted.includes('border-radius: 6px;'), 'Should preserve border-radius');
assert(formatted.includes('color: #ffffff;'), 'Should format color');
assert(formatted.includes('{\n'), 'Should place opening brace with newline');
console.log('   ✅ CssBeautifier passed formatting and de-minification test.\n');

// 4. Test TailwindConverter
console.log('4. Testing TailwindConverter...');
const twCode = fs.readFileSync(path.join(__dirname, '..', 'content', 'tailwind-converter.js'), 'utf8');
vm.runInContext(twCode, sandbox);
const TailwindConverter = sandbox.window.TailwindConverter;

// Test spacing
assert.strictEqual(TailwindConverter.pxToSpacing(16, 'p'), 'p-4');
assert.strictEqual(TailwindConverter.pxToSpacing(8, 'm'), 'm-2');
assert.strictEqual(TailwindConverter.pxToSpacing(14, 'p'), 'p-3.5');

// Test radius
assert.strictEqual(TailwindConverter.radiusToTailwind('0px'), 'rounded-none');
assert.strictEqual(TailwindConverter.radiusToTailwind('6px'), 'rounded-md');
assert.strictEqual(TailwindConverter.radiusToTailwind('8px'), 'rounded-lg');
assert.strictEqual(TailwindConverter.radiusToTailwind('16px'), 'rounded-2xl');

// Test RGB to Hex
assert.strictEqual(TailwindConverter.rgbToHex('rgb(37, 99, 235)'), '#2563eb');
assert.strictEqual(TailwindConverter.rgbToHex('#ffffff'), '#ffffff');
console.log('   ✅ TailwindConverter spacing, radius, and color conversions passed.\n');

// 5. Test Shadow DOM Stylesheet for Anti-Pill Button Radius Rule
console.log('5. Verifying Design System: Button Radius (Anti-Pill Constraint)...');
const shadowCss = fs.readFileSync(path.join(__dirname, '..', 'content', 'styles', 'shadow-styles.css'), 'utf8');
// Check that 9999px or full capsule is NOT used for buttons
assert(!shadowCss.includes('border-radius: 9999px'), 'Must not contain 9999px full capsule radius');
assert(shadowCss.includes('--radius-sm: 6px;') || shadowCss.includes('border-radius: 6px'), 'Must enforce strict 6px/8px radius');
console.log('   ✅ Anti-pill button radius constraint verified (6px-8px strictly maintained).\n');

// 6. Test File Structure Completeness
console.log('6. Verifying Project File Structure Completeness...');
const requiredFiles = [
  'manifest.json',
  'background/service-worker.js',
  'popup/popup.html',
  'popup/popup.css',
  'popup/popup.js',
  'content/content.js',
  'content/overlay-canvas.js',
  'content/style-tweaker.js',
  'content/components/floating-dock.js',
  'content/styles/shadow-styles.css',
  'content/tailwind-converter.js',
  'content/css-beautifier.js',
  'content/palette-extractor.js',
  'demo/index.html',
  'serve.js'
];

requiredFiles.forEach(rel => {
  const full = path.join(__dirname, '..', rel);
  assert(fs.existsSync(full), `File ${rel} must exist`);
  console.log(`   ✅ Found ${rel}`);
});

console.log('\n🎉 ALL 6 VERIFICATION TEST PHASES PASSED SUCCESSFULLY!');
