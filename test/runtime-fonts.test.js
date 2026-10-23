const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function studio(document) {
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../content/font-studio.js'), 'utf8'), {
    window, document, setTimeout, clearTimeout
  });
  return window.FontStudio;
}

function outlineStudio() {
  return studio({ createElement() { return { getContext() { return {
    measureText() { return { width: 24 }; }, fillText() {},
    getImageData(x, y, width, height) { return { data: new Uint8ClampedArray(width * height * 4) }; }
  }; } }; } });
}

test('glyph measurement rejects missing Canvas instead of inventing available glyphs', async () => {
  await assert.rejects(studio(undefined).harvestGlyphs('Example'), /Canvas/);
});

test('positive measured width does not claim font-specific glyph coverage', async () => {
  const FontStudio = studio({ createElement() { return { getContext() { return {
    font: '', measureText() { return { width: 9.5 }; }
  }; } }; } });
  let progress = 0;
  const result = await FontStudio.harvestGlyphs('Unavailable Font', value => { progress = value; });
  assert.equal(result.measurementOnly, true);
  assert.equal(result.coverageDetermined, false);
  assert.equal(result.coveragePct, null);
  assert.equal(result.supportedCount, null);
  assert.equal(result.measuredCount, result.glyphs.length);
  assert.equal(result.measurementFontSize, 24);
  assert.equal(progress, 100);
  assert.ok(result.glyphs.every(glyph => glyph.width === 9.5 && glyph.supported === null && glyph.available === null));
});

test('SVG font export requires supplied outline paths for every glyph', () => {
  const FontStudio = studio();
  assert.throws(() => FontStudio.buildSvgFont('Example', [{ char: 'A', code: '0041', width: 12 }]), /경로|path/i);
  assert.throws(() => FontStudio.buildSvgFont('Example', []), /경로|path/i);
});

test('SVG font export preserves real paths and escapes font attributes', () => {
  const FontStudio = studio();
  const glyphs = [{ char: 'A', code: '0041', width: 600, pathData: 'M 0 0 L 300 800 L 600 0 Z' }];
  const result = FontStudio.buildSvgFont('Demo"><script>&', glyphs);
  assert.ok(!result.includes('<script>'));
  assert.ok(result.includes('font-family="Demo&quot;&gt;&lt;script&gt;&amp;"'));
  assert.ok(result.includes('d="M 0 0 L 300 800 L 600 0 Z"'));
  assert.ok(result.includes('horiz-adv-x="600"'));
  assert.throws(() => FontStudio.buildSvgFont('Demo', [{ ...glyphs[0], pathData: 'M 0 0" onload="bad' }]), /경로|path/i);
  assert.throws(() => FontStudio.buildSvgFont('Demo', [{ ...glyphs[0], code: '41;" onload="bad' }]), /코드|code/i);
});

test('text outline XML escapes text and replaces characters forbidden by XML 1.0', () => {
  const result = outlineStudio().createTextOutlines({ textContent: 'A & <B> -- \u0001 \uD800' });
  assert.ok(result.svg.includes('<desc>A &amp; &lt;B&gt; -- \uFFFD \uFFFD</desc>'));
  assert.ok(!result.svg.includes('<!-- Original Text:'));
});

test('text outline XML cannot turn typography metadata or color into markup', () => {
  const hostile = '--><script>globalThis.injected=true</script><!--';
  const result = outlineStudio().createTextOutlines({ textContent: 'A' }, {
    fontFamily: hostile, fontWeight: hostile, fontStyle: hostile,
    color: 'red" onload="alert(1)'
  });
  assert.ok(!result.svg.includes('<script>'));
  assert.ok(!result.svg.includes('<!-- Font:'));
  assert.ok(result.svg.includes('fill="red&quot; onload=&quot;alert(1)"'));
});
