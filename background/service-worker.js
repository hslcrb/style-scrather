// Style Scratcher - Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Style Scratcher] Extension installed successfully.');
});

// Command shortcut listener (e.g. Alt+S)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-scratcher') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SCRATCHER' }).catch((err) => {
        console.warn('[Style Scratcher] Tab not ready for toggle message:', err);
      });
    }
  }
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    sendResponse({ success: true });
  }
  return true;
});
