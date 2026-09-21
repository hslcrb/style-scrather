// Style Scratcher - Content Script Orchestrator

(function () {
  // Prevent multiple injections
  if (window.__STYLE_SCRATCHER_INITIALIZED__) return;
  window.__STYLE_SCRATCHER_INITIALIZED__ = true;

  let isActive = true; // start active or controllable via Alt+S / Popup
  let shadowRoot = null;
  let hostContainer = null;
  let overlayCanvas = null;
  let styleTweaker = null;
  let floatingDock = null;
  let isAltPressed = false;

  function initStyleScratcher() {
    // 1. Create Shadow DOM Host
    hostContainer = document.createElement('div');
    hostContainer.id = 'style-scratcher-host';
    hostContainer.setAttribute('data-style-scratcher', 'true');
    hostContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      overflow: visible;
      z-index: 2147483640;
    `;
    document.documentElement.appendChild(hostContainer);

    shadowRoot = hostContainer.attachShadow({ mode: 'open' });

    // 2. Inject Stylesheet into Shadow DOM
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      styleLink.href = chrome.runtime.getURL('content/styles/shadow-styles.css');
    } else {
      // Fallback for standalone demo mode
      styleLink.href = '../content/styles/shadow-styles.css';
    }
    shadowRoot.appendChild(styleLink);

    // 3. Initialize Engines
    overlayCanvas = new OverlayCanvas(shadowRoot);

    styleTweaker = new StyleTweaker((element) => {
      if (floatingDock) {
        floatingDock.updateElement();
      }
    });

    floatingDock = new FloatingDock(shadowRoot, {
      tweaker: styleTweaker,
      overlayCanvas: overlayCanvas,
      onToggleInspector: () => toggleInspector()
    });

    // 4. Attach Window/Document Listeners
    attachEventListeners();

    console.log('[Style Scratcher] Initialized successfully. Press Alt+S to toggle.');
  }

  function toggleInspector(state) {
    isActive = state !== undefined ? state : !isActive;
    if (!isActive) {
      overlayCanvas.clear();
      overlayCanvas.setSelectedElement(null);
      overlayCanvas.setHoverElement(null);
      styleTweaker.setElement(null);
      if (floatingDock && floatingDock.container) {
        floatingDock.container.classList.add('hidden');
      }
    } else {
      if (floatingDock && floatingDock.container) {
        floatingDock.container.classList.remove('hidden');
      }
    }
    return isActive;
  }

  function attachEventListeners() {
    // Mouse Move for Inspector Hover
    window.addEventListener('mousemove', (e) => {
      if (!isActive) return;

      // Don't inspect our own elements or when dragging dock
      if (hostContainer && hostContainer.contains(e.target)) return;

      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || target === hostContainer || hostContainer.contains(target)) return;

      // Ignore html, body root elements
      if (target === document.documentElement || target === document.body) return;

      overlayCanvas.setHoverElement(target);
    }, { passive: true });

    // Click to Select & Lock Element
    window.addEventListener('click', (e) => {
      if (!isActive) return;

      // Ignore clicks inside Style Scratcher Host
      if (hostContainer && (e.target === hostContainer || hostContainer.contains(e.target))) {
        return;
      }

      // If clicking inside Shadow DOM
      if (e.composedPath && e.composedPath().some(el => el === hostContainer)) {
        return;
      }

      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || target === document.body || target === document.documentElement) return;

      // Prevent link clicks / form submit while inspecting
      e.preventDefault();
      e.stopPropagation();

      // Lock element in tweaker & canvas
      styleTweaker.setElement(target);
      overlayCanvas.setSelectedElement(target);
      floatingDock.updateElement();
    }, true);

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Alt + S to Toggle Scratcher
      if (e.altKey && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) {
        e.preventDefault();
        toggleInspector();
        return;
      }

      // Escape to Deselect / Unlock
      if (e.key === 'Escape') {
        overlayCanvas.setSelectedElement(null);
        styleTweaker.setElement(null);
        floatingDock.updateElement();
        return;
      }

      // Alt key for distance measuring mode
      if (e.key === 'Alt' && !isAltPressed) {
        isAltPressed = true;
        overlayCanvas.render();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'Alt') {
        isAltPressed = false;
        overlayCanvas.render();
      }
    });

    // Window Resize / Scroll: Redraw SVG overlays
    window.addEventListener('scroll', () => {
      if (isActive) overlayCanvas.render();
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (isActive) overlayCanvas.render();
    }, { passive: true });
  }

  // Listen for Messages from Extension Background or Popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'TOGGLE_SCRATCHER') {
        const state = toggleInspector();
        sendResponse({ isActive: state, isGridActive: overlayCanvas.isGridVisible });
      } else if (request.type === 'TOGGLE_GRID') {
        const gridState = overlayCanvas.toggleGrid();
        sendResponse({ isActive: isActive, isGridActive: gridState });
      } else if (request.type === 'OPEN_TAB') {
        if (!isActive) toggleInspector(true);
        if (floatingDock) floatingDock.switchTab(request.tabName || 'inspector');
        sendResponse({ success: true });
      } else if (request.type === 'GET_STATE') {
        sendResponse({
          isActive: isActive,
          isGridActive: overlayCanvas ? overlayCanvas.isGridVisible : false
        });
      }
      return true;
    });
  }

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStyleScratcher);
  } else {
    initStyleScratcher();
  }

  // Export to window for debugging or standalone embedding
  window.StyleScratcher = {
    toggle: toggleInspector,
    getCanvas: () => overlayCanvas,
    getTweaker: () => styleTweaker,
    getDock: () => floatingDock
  };
})();
