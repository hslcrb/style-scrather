// Style Scratcher v4.0.2. - Background Service Worker (Manifest V3)

const CONTENT_SCRIPTS = [
  'content/event-interceptor.js',
  'content/unit-converter.js',
  'content/instant-zoom.js',
  'content/interaction-detector.js',
  'content/graphics-inspector.js',
  'content/page-controller.js',
  'content/motion-inspector.js',
  'content/color-suite.js',
  'content/asset-editor.js',
  'content/precision-cursor.js',
  'content/mode-manager.js',
  'content/device-mockup.js',
  'content/tab-order-visualizer.js',
  'content/font-studio.js',
  'content/context-hud.js',
  'content/shortcut-manager.js',
  'content/react-exporter.js',
  'content/update-guardian.js',
  'content/css-beautifier.js',
  'content/tailwind-converter.js',
  'content/palette-extractor.js',
  'content/overlay-canvas.js',
  'content/style-tweaker.js',
  'content/components/floating-dock.js',
  'content/content.js'
];

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Style Scratcher v4.0.2.] Extension installed successfully.');
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
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SCRATCHER' }).catch(() => {});
          }, 80);
        } catch (injectErr) {
          // Ignore restricted page injection errors
        }
      }
    }
  }
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    sendResponse({ success: true, version: '4.0.2', displayVersion: 'v4.0.2.' });
  }
  return true;
});
