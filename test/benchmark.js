// Controlled paint-count comparison. This is not an FPS or page-speed benchmark.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');

const extension = path.resolve(process.env.EXTENSION_UNDER_TEST || path.join(__dirname, '..'));
const output = path.resolve(process.env.BENCHMARK_OUTPUT || path.join(__dirname, '../test-results/benchmark.json'));
const fixture = '<!doctype html><html lang="en"><meta charset="utf-8"><body style="font:18px system-ui;margin:80px"><h1 id="sample">Design is a conversation.</h1><button id="counter">Clicks: 0</button><script>let count=0;document.querySelector("button").onclick=()=>document.querySelector("button").textContent="Clicks: "+(++count)</script></body></html>';

async function main() {
  const server = http.createServer((request, response) => { response.writeHead(200, { 'Content-Type': 'text/html' }); response.end(fixture); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'scratcher-benchmark-'));
  let context;
  try {
    context = await chromium.launchPersistentContext(profile, {
      ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : { channel: 'chromium' }),
      headless: true, viewport: { width: 1440, height: 1000 },
      args: ['--no-sandbox', `--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
      ignoreDefaultArgs: ['--disable-extensions']
    });
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = `http://127.0.0.1:${server.address().port}`;
    await page.goto(base);
    const tab = await worker.evaluate(async url => (await chrome.tabs.query({})).find(item => item.url?.startsWith(url)), base);
    const send = message => worker.evaluate(async ({ id, message }) => chrome.tabs.sendMessage(id, message), { id: tab.id, message });
    let initialState;
    for (let attempt = 0; attempt < 20; attempt++) {
      try { initialState = await send({ type: 'GET_STATE' }); break; }
      catch (error) { if (attempt === 19) throw error; await new Promise(resolve => setTimeout(resolve, 25)); }
    }
    const initialHostCount = await page.locator('#style-scratcher-host').count();
    await page.locator('#counter').click();
    const nativeClickBeforeActivation = await page.locator('#counter').textContent();
    if (!initialState.isActive) await send({ type: 'TOGGLE_SCRATCHER' });
    await page.locator('.scratcher-dock').waitFor({ state: 'visible' });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const paintMethod = (await worker.evaluate(async id => chrome.scripting.executeScript({ target: { tabId: id }, func: () => {
      const canvas = window.StyleScratcher.getCanvas();
      const method = typeof canvas.renderNow === 'function' ? 'renderNow' : 'render';
      const original = canvas[method].bind(canvas);
      window.__benchmarkPaints = 0;
      canvas[method] = function (...args) { window.__benchmarkPaints++; return original(...args); };
      return method;
    } }), tab.id))[0].result;
    await page.evaluate(() => {
      const target = document.getElementById('sample');
      const rect = target.getBoundingClientRect();
      for (let i = 0; i < 240; i++) target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rect.x + 10, clientY: rect.y + 10 }));
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const paints = (await worker.evaluate(async id => chrome.scripting.executeScript({ target: { tabId: id }, func: () => window.__benchmarkPaints }), tab.id))[0].result;
    const report = { fixture: 'one-heading-v1', version: JSON.parse(fs.readFileSync(path.join(extension, 'manifest.json'), 'utf8')).version,
      browser: context.browser().version(), viewport: { width: 1440, height: 1000 }, initialState, initialHostCount,
      nativeClickBeforeActivation, burstEvents: 240, paintMethod, paints, pageErrors: errors };
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  } finally {
    if (context) await context.close();
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(profile, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
