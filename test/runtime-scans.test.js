const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function load(file, context) {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../content', file), 'utf8'), context);
}

test('palette sampling bounds DOM visits and stylesheet work on a large page', () => {
  let visits = 0;
  let styleReads = 0;
  let rulesRead = 0;
  const node = { offsetParent: {}, tagName: 'DIV', closest() { return null; } };
  const rules = new Proxy({ length: 1000000 }, { get(target, property) {
    if (property === 'length') return target.length;
    if (typeof property === 'symbol') return undefined;
    rulesRead++;
    return { cssText: 'body { color: #123456; }' };
  } });
  const context = { window: { getComputedStyle() { styleReads++; return { color: 'rgb(18, 52, 86)' }; } },
    document: {
      body: {}, styleSheets: [{ cssRules: rules }], getElementById() { return null; },
      createTreeWalker() { return { nextNode() { visits++; return visits <= 1000000 ? node : null; } }; },
      querySelectorAll() { throw new Error('Whole-page NodeList must not be created'); }
    }
  };
  load('palette-extractor.js', context);
  const result = context.window.PaletteExtractor.extract();
  assert.ok(visits <= 2000);
  assert.ok(styleReads <= 300);
  assert.ok(rulesRead <= 2000);
  assert.equal(result.truncated, true);
  assert.ok(result.colors.some(color => color.hex === '#123456'));
});

test('tab-order scan stops after bounded candidates and excludes disabled tabindex elements', () => {
  let visits = 0;
  const candidate = {
    matches(selector) { return selector !== ':disabled'; }, closest() { return null; },
    getBoundingClientRect() { return { width: 10, height: 10 }; }, getAttribute() { return null; }
  };
  const context = { window: { getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '0' }) },
    document: {
      body: {}, getElementById() { return null; },
      createTreeWalker() { return { nextNode() {
        visits++;
        if (visits === 1) return { ...candidate, matches() { return true; } };
        return visits <= 1000000 ? candidate : null;
      } }; },
      querySelectorAll() { throw new Error('Whole-page NodeList must not be created'); }
    }
  };
  load('tab-order-visualizer.js', context);
  const visualizer = Object.create(context.window.TabOrderVisualizer.prototype);
  const elements = visualizer.findTabbableElements();
  assert.equal(elements.length, 250, 'transparent focusable elements remain in keyboard order');
  assert.ok(visits <= 5000);
  assert.equal(visualizer.isTruncated, true);
});

test('font URLs resolve relative to the owning stylesheet', async () => {
  const context = { window: {}, URL, CSSRule: { FONT_FACE_RULE: 5 },
    document: {
      baseURI: 'https://page.test/docs/page.html',
      styleSheets: [{ href: 'https://cdn.test/styles/main.css', cssRules: [{ type: 5, cssText: '',
        style: { getPropertyValue: property => ({
          'font-family': 'Fixture', src: 'url(../fonts/demo.woff2) format("woff2")'
        })[property] || '' }
      }] }]
    }
  };
  load('font-studio.js', context);
  const fonts = await context.window.FontStudio.extractWebFonts();
  assert.equal(fonts[0].url, 'https://cdn.test/fonts/demo.woff2');
});
