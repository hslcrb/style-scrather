/* Optional interaction/layout checks. Run with Playwright and a Chromium build.
   CHROMIUM_EXECUTABLE=/path/to/chrome node test/interface-browser.js */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const screenshots = process.env.SCREENSHOT_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'style-scratcher-interface-'));
fs.mkdirSync(screenshots, { recursive: true });
const fixture = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Studio fixture</title><style>
*{box-sizing:border-box}body{margin:0;background:#f1eee9;color:#26212a;font:16px/1.6 system-ui}header{padding:30px 6vw;display:flex;gap:40px;border-bottom:1px solid #d8d1d6}header strong{margin-right:80px}.hero{padding:100px 7vw;max-width:800px}.hero p{max-width:390px;color:#756c78}.eyebrow{font-size:11px;letter-spacing:3px;color:#a15269}h1{font-size:64px;line-height:1.1;letter-spacing:-3px;margin:25px 0}.cards{display:flex;gap:15px;margin-top:35px}.card{background:#b2a5b4;width:180px;height:160px;border-radius:24px;box-shadow:0 25px 50px #50394e15}.card:nth-child(2){background:#c98094}.card:nth-child(3){background:#dac3b4}#target{padding:16px 28px;border-radius:16px;background:#E11D48;color:#fff;font:600 16px system-ui;border:0;margin-top:22px}.note{font-size:12px;margin-top:65px;color:#6b6470}
</style><header><strong>FORMA®</strong><span>Objects</span><span>Our practice</span><span>Journal</span></header><main class="hero"><span class="eyebrow">THOUGHTFULLY SHAPED. EVERY DAY.</span><h1>Good design.<br>Small details.</h1><p>A collection of things that feel right. Made with care, built for the moments in between.</p><button id="target" class="product-action primary-action">Explore the collection</button><div class="cards"><div class="card"></div><div class="card"></div><div class="card"></div></div><p class="note">A local fixture for interface verification.</p></main></html>`;
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/fixture') { response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end(fixture); return; }
  const filename = path.resolve(root, `.${pathname}`);
  if (!filename.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
  try {
    response.setHeader('Content-Type', filename.endsWith('.css') ? 'text/css' : filename.endsWith('.js') ? 'application/javascript' : 'text/html');
    response.end(fs.readFileSync(filename));
  } catch { response.writeHead(404); response.end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : { channel: 'chromium' }), headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/fixture`);
    const modules = ['unit-converter', 'tailwind-converter', 'palette-extractor', 'style-tweaker', 'color-suite', 'font-studio', 'mode-manager', 'css-beautifier', 'asset-editor', 'motion-inspector', 'graphics-inspector', 'react-exporter', 'components/floating-dock'];
    for (const name of modules) await page.addScriptTag({ url: `${base}/content/${name}.js` });
    await page.evaluate(base => {
      window.chrome = { runtime: { getManifest: () => ({ version: '4.1.0' }) } };
      const host = document.createElement('div'); host.id = 'style-scratcher-host'; host.dataset.styleScratcher = 'true'; document.body.append(host);
      const shadow = host.attachShadow({ mode: 'open' });
      const stylesheet = document.createElement('link'); stylesheet.rel = 'stylesheet'; stylesheet.href = `${base}/content/styles/shadow-styles.css`; shadow.append(stylesheet);
      const tweaker = new StyleTweaker(() => window.dock?.updateElement());
      const overlay = { render() {}, setSelectedElement() {}, setUnit() {}, isGridVisible: false, isBaselineVisible: false, gridConfig: { columns: 12, gutter: 20 }, toggleGrid() { this.isGridVisible = !this.isGridVisible; }, toggleBaseline() { this.isBaselineVisible = !this.isBaselineVisible; }, setGridConfig(value) { Object.assign(this.gridConfig, value); } };
      window.dock = new FloatingDock(shadow, { tweaker, overlayCanvas: overlay, updateGuardian: { currentVersion: '4.1.0', checkForUpdate: async () => ({ hasUpdate: false }) } });
      window.tweaker = tweaker;
    }, base);
    await page.locator('.inspector-welcome').waitFor();
    await page.waitForFunction(() => document.querySelector('#style-scratcher-host').shadowRoot.querySelector('link').sheet);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.scratcher-dock').screenshot({ animations: 'disabled', path: path.join(screenshots, 'studio-empty.png') });
    await page.screenshot({ animations: 'disabled', path: path.join(screenshots, 'studio-on-page.png') });
    await page.locator('#tab-inspector').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#tab-fonts').getAttribute('aria-selected'), 'true', 'Arrow keys switch tabs');
    await page.locator('#moreToolsBtn').click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#moreToolsBtn').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#moreToolsBtn').evaluate(el => el.getRootNode().activeElement === el), true, 'Escape restores menu button focus');
    await page.evaluate(() => { dock.switchTab('inspector'); tweaker.setElement(document.querySelector('#target')); });
    await page.locator('#radiusInput').fill('28');
    await page.locator('#radiusInput').press('Tab');
    assert.equal(await page.locator('#target').evaluate(el => el.style.borderTopLeftRadius), '28px', 'Inspector edits the selected DOM element');
    await page.locator('details[data-section="spacing"] summary').click();
    await page.locator('#paddingInput').fill('24');
    await page.locator('#paddingInput').press('Tab');
    assert.equal(await page.locator('details[data-section="spacing"]').getAttribute('open'), '', 'Disclosure survives input redraw');
    await page.locator('#dockBody').evaluate(el => { el.scrollTop = 0; });
    await page.locator('.scratcher-dock').screenshot({ animations: 'disabled', path: path.join(screenshots, 'studio-selected.png') });
    const tabs = ['inspector', 'mockup', 'fonts', 'assets', 'interaction', 'motion', 'graphics', 'tools', 'code', 'settings'];
    for (const tab of tabs) {
      await page.evaluate(tab => dock.switchTab(tab), tab);
      assert.equal(await page.locator('#retryPanelBtn').count(), 0, `${tab} renders successfully`);
      assert.equal(await page.locator('#dockBody').evaluate(el => el.scrollWidth <= el.clientWidth + 1), true, `${tab} does not overflow horizontally`);
    }
    await page.evaluate(() => dock.switchTab('inspector'));
    await page.locator('#moveDockBtn').focus();
    const before = await page.locator('.scratcher-dock').boundingBox();
    await page.keyboard.press('ArrowLeft');
    const after = await page.locator('.scratcher-dock').boundingBox();
    assert.ok(after.x < before.x, 'Keyboard moves the studio');
    await page.locator('#minimizeBtn').click();
    assert.equal(await page.locator('#dockBody').isVisible(), false);
    await page.locator('#minimizeBtn').click();
    assert.equal(await page.locator('#dockBody').isVisible(), true);
    await page.setViewportSize({ width: 320, height: 600 });
    for (const tab of tabs) {
      await page.evaluate(tab => { dock.switchTab(tab); dock.clampPosition(); }, tab);
      const box = await page.locator('.scratcher-dock').boundingBox();
      assert.ok(box.x >= 11 && box.y >= 11 && box.x + box.width <= 309 && box.y + box.height <= 589, `${tab} stays inside a 320px viewport`);
      assert.equal(await page.locator('#dockBody').evaluate(el => el.scrollWidth <= el.clientWidth + 1), true, `${tab} fits at 320px`);
    }
    await page.evaluate(() => dock.switchTab('inspector'));
    await page.locator('.scratcher-dock').screenshot({ animations: 'disabled', path: path.join(screenshots, 'studio-narrow.png') });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.scratcher-dock').evaluate(el => getComputedStyle(el).transitionDuration), '0s');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ result: 'passed', checks: '10 panels at desktop and 320px, keyboard tabs/menu/drag, minimize, live editing, disclosure persistence, reduced motion', screenshots }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
