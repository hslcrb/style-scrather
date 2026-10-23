// Style Scratcher v4.1.0. - Background Service Worker (Manifest V3)

const CONTENT_SCRIPTS = chrome.runtime.getManifest().content_scripts
  .flatMap(entry => entry.js || []);
const MAX_FONT_BYTES = 16 * 1024 * 1024;
const RELEASE_CACHE_KEY = 'style_scratcher_release_v1';
let releaseCache = null;
let releaseRequest = null;

function getLatestRelease(forceRefresh = false) {
  if (releaseRequest) return releaseRequest;
  releaseRequest = (async () => {
    if (!releaseCache) {
      try { releaseCache = (await chrome.storage?.local?.get(RELEASE_CACHE_KEY))?.[RELEASE_CACHE_KEY]; } catch {}
    }
    const ttl = forceRefresh ? 60000 : (releaseCache?.result?.success ? 30 * 60000 : 5 * 60000);
    if (releaseCache?.result && Date.now() - releaseCache.timestamp >= 0 && Date.now() - releaseCache.timestamp < ttl) {
      return releaseCache.result;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let result;
    try {
      const response = await fetch('https://api.github.com/repos/hslcrb/style-scrather/releases/latest', {
        headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal, credentials: 'omit'
      });
      if (!response.ok) throw new Error(`GitHub API error: HTTP ${response.status}`);
      const release = await response.json();
      if (typeof release.tag_name !== 'string') throw new Error('Invalid GitHub release response.');
      result = { success: true, release: {
        tag_name: release.tag_name.slice(0, 100), name: String(release.name || '').slice(0, 300),
        body: String(release.body || '').slice(0, 12000), html_url: release.html_url,
        zipball_url: release.zipball_url, published_at: release.published_at,
        assets: Array.isArray(release.assets) ? release.assets.slice(0, 50).map(asset => ({
          name: String(asset.name || '').slice(0, 300), browser_download_url: asset.browser_download_url
        })) : []
      } };
    } catch (error) {
      result = { success: false, error: error.message };
    } finally {
      clearTimeout(timeout);
    }
    releaseCache = { timestamp: Date.now(), result };
    try { await chrome.storage?.local?.set({ [RELEASE_CACHE_KEY]: releaseCache }); } catch {}
    return result;
  })().finally(() => { releaseRequest = null; });
  return releaseRequest;
}

async function fetchFontData(urlString) {
  const url = new URL(urlString);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Font URL must use HTTP or HTTPS without credentials.');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url.href, { signal: controller.signal, credentials: 'omit' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (Number(response.headers.get('content-length')) > MAX_FONT_BYTES) {
      controller.abort();
      throw new Error('Font is too large (maximum 16 MB).');
    }

    let bytes;
    if (response.body && typeof response.body.getReader === 'function') {
      const reader = response.body.getReader();
      const chunks = [];
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > MAX_FONT_BYTES) {
            controller.abort();
            await reader.cancel();
            throw new Error('Font is too large (maximum 16 MB).');
          }
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }
      bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
    } else {
      bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength > MAX_FONT_BYTES) throw new Error('Font is too large (maximum 16 MB).');
    }
    const mime = (response.headers.get('content-type') || 'application/octet-stream').split(';')[0];
    const safeMime = /^[\w.+-]+\/[\w.+-]+$/.test(mime) ? mime : 'application/octet-stream';
    const binaryChunks = [];
    for (let i = 0; i < bytes.length; i += 8192) {
      binaryChunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
    }
    return { success: true, dataUrl: `data:${safeMime};base64,${btoa(binaryChunks.join(''))}`, size: bytes.length };
  } finally {
    clearTimeout(timeout);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log(`[Style Scratcher ${chrome.runtime.getManifest().version}] Extension installed.`);
});

// Command shortcut listener (e.g. Alt+S)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-scratcher') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;

    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SCRATCHER' });
    } catch (err) {
      // If content script is not running yet, auto-inject and retry
      if (chrome.scripting && chrome.scripting.executeScript) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: CONTENT_SCRIPTS
          });
          await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SCRATCHER' });
        } catch (injectErr) {
          // Ignore restricted page injection errors
        }
      }
    }
  }
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return false;
  if (message.type === 'GET_STATUS') {
    const version = chrome.runtime.getManifest().version;
    sendResponse({ success: true, version, displayVersion: `v${version}.` });
    return false;
  }

  if (message.type === 'GET_LATEST_RELEASE') {
    getLatestRelease(message.forceRefresh === true).then(sendResponse);
    return true;
  }

  // Background CORS-free font resource fetcher
  if (message.type === 'FETCH_FONT_BUFFER') {
    fetchFontData(message.url)
      .then(sendResponse)
      .catch(err => {
        sendResponse({ success: false, error: err.message });
      });
    return true; // async response
  }

  return false;
});
