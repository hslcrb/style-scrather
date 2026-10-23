const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../background/service-worker.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../manifest.json'), 'utf8'));

function worker(overrides = {}) {
  let messageListener;
  let commandListener;
  const injected = [];
  const chrome = {
    runtime: {
      id: 'test-extension',
      getManifest: () => manifest,
      onInstalled: { addListener() {} },
      onMessage: { addListener(fn) { messageListener = fn; } }
    },
    commands: { onCommand: { addListener(fn) { commandListener = fn; } } },
    tabs: { query: async () => [{ id: 7 }], sendMessage: async () => ({ isActive: true }) },
    scripting: { executeScript: async (options) => { injected.push(options); } },
    ...overrides.chrome
  };
  vm.runInNewContext(source, {
    chrome, console: { log() {}, warn() {} }, fetch: overrides.fetch || fetch,
    URL, Uint8Array, ArrayBuffer, AbortController, btoa, setTimeout, clearTimeout
  });
  return {
    injected,
    command: () => commandListener('toggle-scratcher'),
    request: (message) => new Promise(resolve => {
      const held = messageListener(message, { id: chrome.runtime.id }, resolve);
      if (held !== true) resolve(undefined);
    })
  };
}

test('font bytes are converted in a worker without FileReader', async () => {
  const service = worker({ fetch: async () => new Response(new Uint8Array([0, 127, 255]), {
    headers: { 'Content-Type': 'font/woff2' }
  }) });
  const result = await service.request({ type: 'FETCH_FONT_BUFFER', url: 'https://example.test/font.woff2' });
  assert.equal(result.success, true, result.error);
  assert.equal(result.dataUrl, 'data:font/woff2;base64,AH//');
  assert.equal(result.size, 3);
});

test('font downloads reject oversized responses before reading their body', async () => {
  let read = false;
  const service = worker({ fetch: async () => ({
    ok: true,
    headers: new Headers({ 'Content-Length': String(32 * 1024 * 1024) }),
    arrayBuffer: async () => { read = true; return new ArrayBuffer(0); },
    blob: async () => { read = true; return new Blob(); }
  }) });
  const result = await service.request({ type: 'FETCH_FONT_BUFFER', url: 'https://example.test/huge.woff2' });
  assert.equal(result.success, false);
  assert.match(result.error, /16 MB|too large/i);
  assert.equal(read, false);
});

test('font proxy rejects non-HTTP addresses without fetching', async () => {
  let calls = 0;
  const service = worker({ fetch: async () => { calls++; return new Response(); } });
  const result = await service.request({ type: 'FETCH_FONT_BUFFER', url: 'file:///etc/passwd' });
  assert.equal(result.success, false);
  assert.equal(calls, 0);
});

test('shortcut injection follows manifest order and sends toggle after injection', async () => {
  const calls = [];
  let ready = false;
  const service = worker({ chrome: {
    tabs: {
      query: async () => [{ id: 7 }],
      sendMessage: async (id, message) => {
        calls.push(message.type);
        if (!ready) throw new Error('Receiving end does not exist.');
        return { isActive: message.type === 'TOGGLE_SCRATCHER' };
      }
    },
    scripting: { executeScript: async ({ files }) => {
      assert.deepEqual(Array.from(files), manifest.content_scripts.flatMap(entry => entry.js || []));
      ready = true;
      calls.push('INJECT');
    } }
  } });
  await service.command();
  assert.equal(calls.at(-1), 'TOGGLE_SCRATCHER');
  assert.ok(calls.indexOf('INJECT') < calls.length - 1);
});

test('status version comes from manifest', async () => {
  const result = await worker().request({ type: 'GET_STATUS' });
  assert.equal(result.version, manifest.version);
});

test('release checks coalesce across callers and persist the cache across workers', async () => {
  let fetches = 0;
  const cache = {};
  const options = {
    fetch: async () => { fetches++; return new Response(JSON.stringify({ tag_name: 'v9.0.0', assets: [] })); },
    chrome: { storage: { local: {
      get: async key => ({ [key]: cache[key] }),
      set: async value => Object.assign(cache, value)
    } } }
  };
  const service = worker(options);
  const results = await Promise.all(Array.from({ length: 10 }, () => service.request({ type: 'GET_LATEST_RELEASE' })));
  assert.ok(results.every(result => result?.success));
  assert.equal(fetches, 1);
  await service.request({ type: 'GET_LATEST_RELEASE', forceRefresh: true });
  assert.equal(fetches, 1, 'forced refreshes still respect the one-minute request floor');
  const restarted = worker(options);
  assert.equal((await restarted.request({ type: 'GET_LATEST_RELEASE' })).release.tag_name, 'v9.0.0');
  assert.equal(fetches, 1);
});

test('failed release checks are briefly cached instead of repeated per page', async () => {
  let fetches = 0;
  const service = worker({ fetch: async () => { fetches++; return new Response('', { status: 429 }); } });
  const result = await service.request({ type: 'GET_LATEST_RELEASE' });
  assert.equal(result?.success, false);
  assert.match(result.error, /429/);
  await service.request({ type: 'GET_LATEST_RELEASE' });
  assert.equal(fetches, 1);
});
