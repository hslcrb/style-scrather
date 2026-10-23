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
      headless: true, acceptDownloads: true, viewport: { width: 1440, height: 1000 },
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
        target: { tabId: id }, args: [action, value ?? null],
        func: async (action, value) => {
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
          if (action === 'font-result') return { pending: app.getDock().harvestPending, result: app.getDock().harvestResult, family: getComputedStyle(app.getTweaker().getElement()).fontFamily.replace(/['"]/g, '').split(',')[0].trim() };
          if (action === 'select-image') {
            const el = document.createElement('img');
            el.id = 'download-fixture'; el.src = new URL('/icons/icon48.png', location.href).href;
            document.querySelector('main').append(el);
            await el.decode();
            app.getTweaker().setElement(el); app.getDock().switchTab('code');
          }
          if (action === 'remove-image') document.getElementById('download-fixture')?.remove();
          if (action === 'outlines') {
            const run = (text, options = {}, family) => {
              const el = document.createElement('span'); el.style.cssText = 'font:32px sans-serif'; el.textContent = text;
              if (family) el.style.fontFamily = JSON.stringify(family);
              document.body.append(el);
              const outline = FontStudio.createTextOutlines(el, options); el.remove();
              const xml = new DOMParser().parseFromString(outline.svg, 'image/svg+xml');
              return { width: outline.width, height: outline.height, path: outline.pathData, loops: outline.loopsCount,
                valid: !xml.querySelector('parsererror'), scripts: xml.querySelectorAll('script').length,
                paths: xml.querySelectorAll('path').length, attributes: xml.querySelector('path')?.getAttributeNames().sort() };
            };
            return [run('A & B <tag> -- \u0001 \uD800'), run('Ag', {}, '--><script>bad</script><!--'), run('W', { color: 'red" onload="alert(1)' })];
          }
          if (action === 'restore-modes') {
            app.toggle(true);
            const target = document.getElementById('sample-title');
            const body = document.body, originalStyle = body.getAttribute('style');
            body.style.setProperty('transform', 'translate(0px, 0px)', 'important');
            body.style.setProperty('transform-origin', '20% 30%', 'important');
            body.style.setProperty('transition', 'color 0.2s', 'important');
            const styles = () => ['transform', 'transform-origin', 'transition'].map(name => [name, body.style.getPropertyValue(name), body.style.getPropertyPriority(name)]);
            const before = styles();
            const running = target.animate([{ opacity: 0.8 }, { opacity: 1 }], { duration: 60000, iterations: Infinity });
            const paused = target.animate([{ opacity: 0.9 }, { opacity: 1 }], { duration: 60000, iterations: Infinity });
            running.playbackRate = 1.5; paused.playbackRate = 0.75; paused.pause();
            await Promise.all([running.ready, paused.ready]);
            const sentinel = () => {};
            const previousCopy = document.oncopy;
            document.oncopy = sentinel;
            const events = { copy: 0, mouseout: 0 };
            const count = event => { events[event.type]++; };
            for (const name of Object.keys(events)) target.addEventListener(name, count);
            const fire = () => { for (const name of Object.keys(events)) target.dispatchEvent(new Event(name, { bubbles: true, cancelable: true })); };
            const zoom = app.getInstantZoom(), controller = app.getPageController();
            const cursor = app.getPrecisionCursor(), tabs = app.getTabOrderVisualizer();
            zoom.zoomIn(); controller.toggleFreeze(true); controller.toggleUnblock(true); cursor.toggle(true); tabs.toggle(true);
            app.getCanvas().toggleGrid(true); app.getCanvas().toggleBaseline(true);
            fire();
            const active = { zoomed: zoom.isZoomed, frozen: controller.isFrozen, unblocked: controller.isUnblocked, cursor: cursor.isActive, tabs: tabs.isActive, running: running.playState, events: { ...events } };
            app.toggle(false);
            fire();
            const after = { styles: styles(), zoomed: zoom.isZoomed, scale: zoom.currentScale, zoomListeners: zoom.listeners.length,
              frozen: controller.isFrozen, unblocked: controller.isUnblocked, freezeListeners: controller.freezeListeners.length, unblockListeners: controller.activeListeners.length,
              handlers: controller.originalHandlers.length, pausedAnimations: controller.pausedAnimations.length, unblockStyle: !!document.getElementById('style-scratcher-unblocker'),
              cursor: cursor.isActive, cursorDisplay: cursor.overlay.style.display, tabs: tabs.isActive, tabDisplay: tabs.container.style.display, tabFrame: tabs.frameId,
              running: running.playState, paused: paused.playState, copyRestored: document.oncopy === sentinel, events: { ...events }, grid: app.getState().isGridActive, baseline: app.getCanvas().isBaselineVisible };
            for (const name of Object.keys(events)) target.removeEventListener(name, count);
            document.oncopy = previousCopy;
            app.toggle(true);
            const motion = app.getMotionInspector();
            motion.setPlaybackRate(0.25); motion.togglePause();
            const controlled = { running: running.playState, rate: running.playbackRate };
            app.toggle(false);
            const restoredMotion = { running: running.playState, paused: paused.playState, runningRate: running.playbackRate, pausedRate: paused.playbackRate, remembered: motion.originalAnimations.size };
            running.cancel(); paused.cancel();
            if (originalStyle === null) body.removeAttribute('style'); else body.setAttribute('style', originalStyle);
            return { before, active, after, controlled, restoredMotion };
          }
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
    await check('Real Canvas outlines contain distinct, valid and escaped SVG geometry', async () => {
      const results = await inspect('outlines');
      for (const result of results) {
        assert.ok(result.width > 0 && result.height > 0 && result.loops > 0);
        assert.match(result.path, /^M/);
        assert.equal(result.valid, true);
        assert.equal(result.scripts, 0);
        assert.equal(result.paths, 1);
        assert.deepEqual(result.attributes, ['d', 'fill', 'fill-rule']);
      }
      assert.notEqual(results[1].path, results[2].path);
    });
    await check('Font measurements use the edited family and survive switching panels', async () => {
      await send({ type: 'TOGGLE_SCRATCHER' });
      await page.locator('#sample-title').click();
      await inspect('tab', 'fonts');
      await page.locator('#fontFamilySelect').selectOption('System Default');
      await page.locator('#fontFamilySelect:not([disabled])').waitFor();
      await page.locator('details[data-section="glyphs"] summary').click();
      await page.locator('#btnStartHarvest').click();
      await inspect('tab', 'code');
      let state;
      for (let attempt = 0; attempt < 40; attempt++) {
        state = await inspect('font-result');
        if (!state.pending) break;
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      assert.equal(state.pending, false);
      assert.equal(state.result.family, state.family);
      assert.equal(state.result.value.measurementOnly, true);
      assert.equal(state.result.value.coverageDetermined, false);
      assert.equal(state.result.value.supportedCount, null);
      await inspect('tab', 'settings');
      assert.equal(await page.locator('input[data-action="toggleScratcher"]').count(), 0);
      assert.match(await page.locator('#dockBody').innerText(), /chrome:\/\/extensions\/shortcuts/);
    });
    await check('The code panel downloads the selected image through the real extension', async () => {
      await inspect('select-image');
      const waiting = page.waitForEvent('download', { timeout: 5000 });
      await page.locator('#btnDownloadAssets').click();
      const download = await waiting;
      assert.equal(download.suggestedFilename(), 'icon48.png');
      assert.equal(await download.failure(), null);
      const saved = path.join(output, 'downloaded-icon48.png');
      await download.saveAs(saved);
      assert.deepEqual(fs.readFileSync(saved), fs.readFileSync(path.join(fixtureRoot, 'icons/icon48.png')));
      await inspect('remove-image');
      await send({ type: 'TOGGLE_SCRATCHER' });
    });
    await check('Closing restores auxiliary modes, original styles, event handlers and animations', async () => {
      const result = await inspect('restore-modes');
      assert.deepEqual(result.active, { zoomed: true, frozen: true, unblocked: true, cursor: true, tabs: true, running: 'paused', events: { copy: 0, mouseout: 0 } });
      assert.deepEqual(result.after, { styles: result.before, zoomed: false, scale: 1, zoomListeners: 0, frozen: false, unblocked: false,
        freezeListeners: 0, unblockListeners: 0, handlers: 0, pausedAnimations: 0, unblockStyle: false,
        cursor: false, cursorDisplay: 'none', tabs: false, tabDisplay: 'none', tabFrame: null,
        running: 'running', paused: 'paused', copyRestored: true, events: { copy: 1, mouseout: 1 }, grid: false, baseline: false });
      assert.deepEqual(result.controlled, { running: 'paused', rate: 0.25 });
      assert.deepEqual(result.restoredMotion, { running: 'running', paused: 'paused', runningRate: 1.5, pausedRate: 0.75, remembered: 0 });
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
