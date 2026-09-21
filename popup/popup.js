// Style Scratcher v3.0.2 - Popup Controller (Auto-Injector & Connection Guardian)

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
  'content/css-beautifier.js',
  'content/tailwind-converter.js',
  'content/palette-extractor.js',
  'content/overlay-canvas.js',
  'content/style-tweaker.js',
  'content/components/floating-dock.js',
  'content/content.js'
];

/**
 * Check if the URL is restricted by Chrome extension security policies
 */
function isRestrictedUrl(url) {
  if (!url) return true;
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('view-source:') ||
    url.startsWith('chrome-search://') ||
    url.includes('chromewebstore.google.com') ||
    url.includes('chrome.google.com/webstore')
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  const toggleInspectorBtn = document.getElementById('toggleInspectorBtn');
  const toggleBtnText = document.getElementById('toggleBtnText');
  const toggleGridBtn = document.getElementById('toggleGridBtn');
  const openPaletteBtn = document.getElementById('openPaletteBtn');
  const statusIndicator = document.getElementById('statusIndicator');
  const restrictedBanner = document.getElementById('restrictedBanner');

  // Query Active Tab
  let activeTab = null;
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tabs && tabs.length > 0 ? tabs[0] : null;
  } catch (err) {
    // Cannot query tabs
  }

  if (!activeTab || !activeTab.id) {
    showRestricted('활성화된 브라우저 탭을 찾을 수 없습니다.');
    return;
  }

  // Check Chrome security restrictions
  if (isRestrictedUrl(activeTab.url)) {
    showRestricted('현재 페이지(Chrome 시스템 페이지/웹스토어)는 보안 정책상 실행이 제한됩니다. 일반 웹사이트(http/https)에서 이용해주세요.');
    return;
  }

  function showRestricted(msg) {
    if (restrictedBanner) {
      restrictedBanner.style.display = 'flex';
      const txt = document.getElementById('restrictedBannerText') || restrictedBanner.querySelector('span');
      if (txt) txt.textContent = msg;
    }
    if (statusIndicator) {
      statusIndicator.style.backgroundColor = '#F59E0B';
      statusIndicator.title = msg;
    }
    if (toggleInspectorBtn) {
      toggleInspectorBtn.disabled = true;
      toggleInspectorBtn.style.opacity = '0.5';
      toggleInspectorBtn.style.cursor = 'not-allowed';
    }
    if (toggleGridBtn) {
      toggleGridBtn.disabled = true;
      toggleGridBtn.style.opacity = '0.5';
      toggleGridBtn.style.cursor = 'not-allowed';
    }
    if (openPaletteBtn) {
      openPaletteBtn.disabled = true;
      openPaletteBtn.style.opacity = '0.5';
      openPaletteBtn.style.cursor = 'not-allowed';
    }
  }

  /**
   * Dynamically inject content scripts into the active tab if not already present
   */
  async function ensureInjected(tabId) {
    if (typeof chrome !== 'undefined' && chrome.scripting && chrome.scripting.executeScript) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: CONTENT_SCRIPTS
        });
        // Short pause to allow DOM initialization
        await new Promise(resolve => setTimeout(resolve, 80));
        return true;
      } catch (e) {
        // Injection failed (e.g. restricted domain)
        return false;
      }
    }
    return false;
  }

  /**
   * Helper to send message to active tab with auto-injection on connection errors
   */
  async function sendTabMessage(payload, retryWithInject = true) {
    if (!activeTab || !activeTab.id) return null;
    try {
      return await chrome.tabs.sendMessage(activeTab.id, payload);
    } catch (err) {
      const errMsg = err?.message || String(err);
      // If receiving end does not exist, tab was open before extension reload -> auto-inject!
      if (retryWithInject && (errMsg.includes('Receiving end does not exist') || errMsg.includes('Could not establish connection'))) {
        const injected = await ensureInjected(activeTab.id);
        if (injected) {
          try {
            return await chrome.tabs.sendMessage(activeTab.id, payload);
          } catch (retryErr) {
            return null;
          }
        }
      }
      return null;
    }
  }

  // Fetch initial state from active tab
  const response = await sendTabMessage({ type: 'GET_STATE' });
  if (response) {
    updateUI(response);
  } else {
    statusIndicator.style.backgroundColor = '#9CA3AF';
    statusIndicator.title = '클릭하여 인스펙터를 켜면 즉시 활성화됩니다.';
  }

  function updateUI(state) {
    if (state && state.isActive) {
      toggleInspectorBtn.classList.add('active');
      toggleBtnText.textContent = '인스펙터 끄기';
      statusIndicator.style.backgroundColor = '#10B981';
      statusIndicator.title = 'Style Scratcher 인스펙터 동작 중';
    } else {
      toggleInspectorBtn.classList.remove('active');
      toggleBtnText.textContent = '인스펙터 켜기';
      statusIndicator.style.backgroundColor = '#9CA3AF';
      statusIndicator.title = 'Style Scratcher 대기 중';
    }

    if (state && state.isGridActive) {
      toggleGridBtn.classList.add('active');
    } else {
      toggleGridBtn.classList.remove('active');
    }
  }

  // Toggle Inspector Button
  toggleInspectorBtn.addEventListener('click', async () => {
    const res = await sendTabMessage({ type: 'TOGGLE_SCRATCHER' });
    if (res) {
      updateUI(res);
    } else {
      // Injected and toggled
      updateUI({ isActive: true, isGridActive: false });
    }
  });

  // Toggle Grid Button
  toggleGridBtn.addEventListener('click', async () => {
    const res = await sendTabMessage({ type: 'TOGGLE_GRID' });
    if (res) updateUI(res);
  });

  // Open Palette in Floating Dock
  openPaletteBtn.addEventListener('click', async () => {
    await sendTabMessage({ type: 'OPEN_TAB', tabName: 'code' });
    window.close();
  });
});
