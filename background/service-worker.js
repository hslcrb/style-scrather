// Style Scratcher v4.0.3. - Background Service Worker (Manifest V3)

const CONTENT_SCRIPTS = chrome.runtime.getManifest().content_scripts
  .flatMap(entry => entry.js || []);
const MAX_FONT_BYTES = 16 * 1024 * 1024;

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
  console.log('[Style Scratcher v4.0.3.] Extension installed successfully.');
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
