// Style Scratcher - Popup Controller

document.addEventListener('DOMContentLoaded', async () => {
  const toggleInspectorBtn = document.getElementById('toggleInspectorBtn');
  const toggleBtnText = document.getElementById('toggleBtnText');
  const toggleGridBtn = document.getElementById('toggleGridBtn');
  const openPaletteBtn = document.getElementById('openPaletteBtn');
  const statusIndicator = document.getElementById('statusIndicator');

  // Helper to send message to active tab
  async function sendTabMessage(payload) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return null;
    try {
      return await chrome.tabs.sendMessage(tab.id, payload);
    } catch (err) {
      console.warn('[Style Scratcher Popup] Message send failed:', err);
      return null;
    }
  }

  // Fetch initial state from active tab
  const response = await sendTabMessage({ type: 'GET_STATE' });
  if (response) {
    updateUI(response);
  }

  function updateUI(state) {
    if (state.isActive) {
      toggleInspectorBtn.classList.add('active');
      toggleBtnText.textContent = '인스펙터 끄기';
      statusIndicator.style.backgroundColor = '#10B981';
    } else {
      toggleInspectorBtn.classList.remove('active');
      toggleBtnText.textContent = '인스펙터 켜기';
      statusIndicator.style.backgroundColor = '#9CA3AF';
    }

    if (state.isGridActive) {
      toggleGridBtn.classList.add('active');
    } else {
      toggleGridBtn.classList.remove('active');
    }
  }

  // Toggle Inspector
  toggleInspectorBtn.addEventListener('click', async () => {
    const res = await sendTabMessage({ type: 'TOGGLE_SCRATCHER' });
    if (res) updateUI(res);
  });

  // Toggle Grid
  toggleGridBtn.addEventListener('click', async () => {
    const res = await sendTabMessage({ type: 'TOGGLE_GRID' });
    if (res) updateUI(res);
  });

  // Open Palette in Floating Dock
  openPaletteBtn.addEventListener('click', async () => {
    await sendTabMessage({ type: 'OPEN_TAB', tabName: 'palette' });
    window.close();
  });
});
