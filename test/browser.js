// Real Manifest V3 smoke checks. npm ci && npx playwright install chromium first.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { createServer } = require('../scripts/serve.js');

const fixtureRoot = path.resolve(__dirname, '..');
const root = path.resolve(process.env.EXTENSION_UNDER_TEST || fixtureRoot);
const output = path.resolve(process.env.TEST_OUTPUT_DIR || path.join(root, 'test-results/browser'));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'style-scratcher-chromium-'));
const report = { version: JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8')).version, checks: [], pageErrors: [], metrics: {} };
fs.mkdirSync(output, { recursive: true });

async function main() {
  const server = createServer({ root: fixtureRoot });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let context;
  try {
    context = await chromium.launchPersistentContext(profile, {
      ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : { channel: 'chromium' }),
      headless: true, viewport: { width: 1440, height: 1000 },
      args: ['--no-sandbox', `--disable-extensions-except=${root}`, `--load-extension=${root}`],
      ignoreDefaultArgs: ['--disable-extensions']
    });
    report.browser = context.browser().version();
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const extensionId = worker.url().split('/')[2];
    const page = await context.newPage();
    page.on('pageerror', error => report.pageErrors.push(error.message));
    await page.goto(`${base}/demo/`, { waitUntil: 'load' });
    const tab = await worker.evaluate(async url => (await chrome.tabs.query({})).find(item => item.url?.startsWith(url)), `${base}/demo/`);
    assert.ok(tab?.id, 'Fixture tab should be visible to the real extension');
    const send = message => worker.evaluate(async ({ id, message }) => chrome.tabs.sendMessage(id, message), { id: tab.id, message });
    const inspect = async (action, value) => {
      const results = await worker.evaluate(async ({ id, action, value }) => chrome.scripting.executeScript({
        target: { tabId: id }, args: [action, value],
        func: (action, value) => {
          const app = window.StyleScratcher;
          if (action === 'selected') return app.getTweaker()?.getElement()?.id;
          if (action === 'tab') { app.getDock().switchTab(value); return app.getDock().currentTab; }
          if (action === 'tune') { app.getTweaker().setFontSize(value); return getComputedStyle(app.getTweaker().getElement()).fontSize; }
          if (action === 'reset') { app.getTweaker().resetCurrentElement(); return app.getTweaker().getElement().getAttribute('style'); }
          if (action === 'start-counting') {
            const canvas = app.getCanvas();
            window.__scratcherPaints = 0;
            const key = typeof canvas.renderNow === 'function' ? 'renderNow' : 'render';
            const original = canvas[key].bind(canvas);
            canvas[key] = function (...args) { window.__scratcherPaints++; return original(...args); };
            return key;
          }
          if (action === 'paints') return window.__scratcherPaints;
          if (action === 'clear-count') { window.__scratcherPaints = 0; return 0; }
          if (action === 'no-motion') return !app.getInstantZoom()?.isZoomed && !app.getPageController()?.isFrozen;
          if (action === 'export') return { css: app.getTweaker().getComputed().fontSize, jsx: ReactExporter.generateComponent(app.getTweaker().getElement()) };
        }
      }), { id: tab.id, action, value });
      return results[0].result;
    };
    const check = async (name, run) => {
      await run();
      report.checks.push(name);
      console.log(`PASS ${name}`);
    };
    await check('The extension stays inactive until explicitly enabled', async () => {
      let state;
      for (let attempt = 0; attempt < 20; attempt++) {
        try { state = await send({ type: 'GET_STATE' }); break; }
        catch (error) { if (attempt === 19) throw error; await new Promise(resolve => setTimeout(resolve, 25)); }
      }
      assert.equal(state.isActive, false);
      assert.equal(await page.locator('#style-scratcher-host').count(), 0);
      await page.locator('#counter').click();
      assert.equal(await page.locator('#counter').textContent(), '클릭: 1');
      report.metrics.idleHostCount = 0;
    });
    await check('Enable, select a real element, edit CSS and restore it', async () => {
      assert.equal((await send({ type: 'TOGGLE_SCRATCHER' })).isActive, true);
      await page.locator('.scratcher-dock').waitFor({ state: 'visible', timeout: 5000 });
      await page.locator('#sample-title').click();
      assert.equal(await inspect('selected'), 'sample-title');
      assert.equal(await inspect('tune', 42), '42px');
      assert.equal(await page.locator('#sample-title').evaluate(el => getComputedStyle(el).fontSize), '42px');
      await inspect('reset');
      assert.equal(await page.locator('#sample-title').getAttribute('style'), null);
    });
    await check('All ten studio panels render with a real selected element', async () => {
      for (const tab of ['inspector', 'mockup', 'fonts', 'assets', 'interaction', 'motion', 'graphics', 'tools', 'code', 'settings']) {
        assert.equal(await inspect('tab', tab), tab);
        assert.ok((await page.locator('#dockBody').innerText()).trim().length > 0, `${tab} must have content`);
      }
      await inspect('tab', 'inspector');
      assert.equal(report.pageErrors.length, 0, report.pageErrors.join('\n'));
    });
    await check('240 same-target pointer events are coalesced before painting', async () => {
      report.metrics.paintMethod = await inspect('start-counting');
      await page.evaluate(() => {
        const el = document.getElementById('sample-title');
        const rect = el.getBoundingClientRect();
        for (let n = 0; n < 240; n++) el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rect.x + 10, clientY: rect.y + 10 }));
      });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const paints = await inspect('paints');
      report.metrics.pointerBurstEvents = 240;
      report.metrics.pointerBurstPaints = paints;
      assert.ok(paints <= 2, `Expected at most two paints, received ${paints}`);
    });
    await check('Repeated script injection does not duplicate the studio', async () => {
      await worker.evaluate(async id => chrome.scripting.executeScript({ target: { tabId: id }, files: chrome.runtime.getManifest().content_scripts[0].js }), tab.id);
      assert.equal(await page.locator('#style-scratcher-host').count(), 1);
      assert.equal((await send({ type: 'GET_STATE' })).isActive, true);
    });
    await page.screenshot({ path: path.join(output, 'studio-desktop.png') });
    await check('The studio stays in bounds at 390px and 320px widths', async () => {
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
        const box = await page.locator('.scratcher-dock').boundingBox();
        assert.ok(box.x >= -1 && box.x + box.width <= width + 1, `Dock outside ${width}px viewport: ${JSON.stringify(box)}`);
      }
      await page.screenshot({ path: path.join(output, 'studio-compact.png') });
      await page.setViewportSize({ width: 1440, height: 1000 });
    });
    await check('A real popup reads the inspected tab without activating anything', async () => {
      const popup = await context.newPage();
      popup.on('pageerror', error => report.pageErrors.push(error.message));
      await page.bringToFront();
      await popup.goto(`chrome-extension://${extensionId}/popup/popup.html`);
      await popup.locator('#toggleInspectorBtn:not([disabled])').waitFor({ state: 'visible', timeout: 5000 });
      assert.match(await popup.locator('#toggleBtnText').textContent(), /끄기|종료/);
      await popup.screenshot({ path: path.join(output, 'popup-active.png') });
      await popup.locator('#toggleInspectorBtn').click();
      await popup.waitForFunction(() => !document.getElementById('toggleInspectorBtn').disabled);
      assert.equal((await send({ type: 'GET_STATE' })).isActive, false);
      await popup.close();
    });
    await check('Deactivation restores normal clicks and stops overlay painting', async () => {
      await inspect('clear-count');
      await page.locator('#counter').click();
      assert.equal(await page.locator('#counter').textContent(), '클릭: 2');
      await page.mouse.move(100, 100);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
      assert.equal(await inspect('paints'), 0);
      assert.equal(await page.locator('.scratcher-dock').isVisible(), false);
      report.metrics.inactivePaints = 0;
    });
    if (fs.existsSync(path.join(root, 'website/index.html'))) {
      await check('Introduction loads at root and stays within mobile viewports', async () => {
        const site = await context.newPage();
        site.on('pageerror', error => report.pageErrors.push(error.message));
        await site.goto(base);
        assert.equal(await site.locator('h1').count(), 1);
        await site.screenshot({ path: path.join(output, 'website-desktop.png'), fullPage: true });
        for (const width of [768, 390, 320]) {
          await site.setViewportSize({ width, height: 844 });
          assert.ok(await site.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        }
        await site.screenshot({ path: path.join(output, 'website-mobile.png'), fullPage: true });
        await site.close();
      });
    }
    assert.deepEqual(report.pageErrors, []);
    report.success = true;
  } finally {
    if (context) await context.close();
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(profile, { recursive: true, force: true });
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  }
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
