// Style Scratcher v4.0.0 - Content Script Orchestrator

(function () {
  // Prevent multiple injections
  if (window.__STYLE_SCRATCHER_INITIALIZED__) return;
  window.__STYLE_SCRATCHER_INITIALIZED__ = true;

  let isActive = true;
  let shadowRoot = null;
  let hostContainer = null;
  let overlayCanvas = null;
  let styleTweaker = null;
  let floatingDock = null;
  let unitConverter = null;
  let interactionDetector = null;
  let pageController = null;
  let motionInspector = null;
  let instantZoom = null;
  let precisionCursor = null;

  // v4.0.0 Modules
  let modeManager = null;
  let deviceMockup = null;
  let tabOrderVisualizer = null;
  let shortcutManager = null;
  let contextHud = null;

  let isAltPressed = false;
  let isSafeMode = true;

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
      styleLink.href = '../content/styles/shadow-styles.css';
    }
    shadowRoot.appendChild(styleLink);

    // 3. Initialize Engines
    unitConverter = new UnitConverter();
    interactionDetector = new InteractionDetector();
    pageController = new PageController();
    motionInspector = new MotionInspector();
    instantZoom = typeof InstantZoom !== 'undefined' ? new InstantZoom() : null;
    precisionCursor = typeof PrecisionCursor !== 'undefined' ? new PrecisionCursor(shadowRoot) : null;

    overlayCanvas = new OverlayCanvas(shadowRoot, unitConverter);

    // v4.0.0 New Engines
    modeManager = typeof ModeManager !== 'undefined' ? new ModeManager({ shadowRoot }) : null;
    deviceMockup = typeof DeviceMockup !== 'undefined' ? new DeviceMockup(shadowRoot) : null;
    tabOrderVisualizer = typeof TabOrderVisualizer !== 'undefined' ? new TabOrderVisualizer(shadowRoot) : null;
    shortcutManager = typeof ShortcutManager !== 'undefined' ? new ShortcutManager() : null;

    if (overlayCanvas && tabOrderVisualizer) {
      overlayCanvas.setTabOrderVisualizer(tabOrderVisualizer);
    }

    styleTweaker = new StyleTweaker((element) => {
      if (floatingDock) {
        floatingDock.updateElement();
      }
    });

    floatingDock = new FloatingDock(shadowRoot, {
      tweaker: styleTweaker,
      overlayCanvas: overlayCanvas,
      unitConverter: unitConverter,
      interactionDetector: interactionDetector,
      pageController: pageController,
      motionInspector: motionInspector,
      instantZoom: instantZoom,
      precisionCursor: precisionCursor,
      modeManager: modeManager,
      deviceMockup: deviceMockup,
      fontStudio: typeof FontStudio !== 'undefined' ? FontStudio : null,
      tabOrderVisualizer: tabOrderVisualizer,
      shortcutManager: shortcutManager,
      reactExporter: typeof ReactExporter !== 'undefined' ? ReactExporter : null,
      isSafeMode: isSafeMode,
      onToggleSafeMode: (state) => {
        isSafeMode = state;
        return isSafeMode;
      },
      onToggleInspector: () => toggleInspector()
    });

    // Smart Alternating Context Menu HUD (v4.0.0)
    if (typeof ContextHud !== 'undefined') {
      contextHud = new ContextHud(shadowRoot, (action, targetEl) => {
        handleHudAction(action, targetEl);
      });
    }

    // 4. Attach Window/Document Listeners
    attachEventListeners();

    console.log('[Style Scratcher v4.0.0] Initialized with Edit Studio, Device Mockups, Figma Font Studio, Glyph Harvester, Tab Order Visualizer, and Smart Context HUD.');
  }

  function handleHudAction(action, targetEl) {
    if (!targetEl) return;

    if (action === 'inspect') {
      modeManager?.setMode('inspect');
      styleTweaker.setElement(targetEl);
      overlayCanvas.setSelectedElement(targetEl);
      floatingDock.switchTab('inspector');
    } else if (action === 'edit') {
      modeManager?.setMode('edit');
      modeManager?.select(targetEl);
      styleTweaker.setElement(targetEl);
      overlayCanvas.setSelectedElement(targetEl);
      floatingDock.switchTab('inspector');
    } else if (action === 'font') {
      styleTweaker.setElement(targetEl);
      overlayCanvas.setSelectedElement(targetEl);
      floatingDock.switchTab('fonts');
    } else if (action === 'mockup') {
      deviceMockup?.toggle(true);
      floatingDock.switchTab('mockup');
    } else if (action === 'taborder') {
      tabOrderVisualizer?.toggle();
    } else if (action === 'copyReact') {
      if (typeof ReactExporter !== 'undefined') {
        const jsx = ReactExporter.generateComponent(targetEl);
        navigator.clipboard.writeText(jsx).then(() => {
          floatingDock?.showToast('React JSX 컴포넌트가 복사되었습니다.');
        });
      }
    } else if (action === 'copyCss') {
      const comp = window.getComputedStyle(targetEl);
      const css = `/* Style Scratcher CSS */\nwidth: ${comp.width};\nheight: ${comp.height};\ncolor: ${comp.color};\nbackground: ${comp.backgroundColor};`;
      navigator.clipboard.writeText(css).then(() => {
        floatingDock?.showToast('Clean CSS가 복사되었습니다.');
      });
    } else if (action === 'delete') {
      if (modeManager?.removeElement(targetEl)) {
        styleTweaker.setElement(null);
        overlayCanvas.setSelectedElement(null);
        floatingDock?.showToast('요소가 삭제되었습니다.');
        floatingDock?.updateElement();
      }
    }
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

      if (hostContainer && hostContainer.contains(e.target)) return;

      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || target === hostContainer || hostContainer.contains(target)) return;

      if (target === document.documentElement || target === document.body) return;

      overlayCanvas.setHoverElement(target);
    }, { passive: true });

    // Click to Select & Lock Element (with Edit Studio Multi-Select Shift+Click)
    window.addEventListener('click', (e) => {
      if (!isActive) return;

      if (hostContainer && (e.target === hostContainer || hostContainer.contains(e.target))) {
        return;
      }

      if (e.composedPath && e.composedPath().some(el => el === hostContainer)) {
        return;
      }

      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || target === document.body || target === document.documentElement) return;

      if (isSafeMode) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (modeManager && modeManager.getMode() === 'edit' && e.shiftKey) {
        // Multi-selection in Edit Mode
        modeManager.toggleSelect(target);
        overlayCanvas.setSelectedElements(modeManager.getSelectedElements());
        styleTweaker.setElement(modeManager.getPrimaryElement());
        floatingDock.updateElement();
      } else {
        // Single selection
        modeManager?.select(target);
        styleTweaker.setElement(target);
        overlayCanvas.setSelectedElements([target]);
        floatingDock.updateElement();
      }
    }, true);

    // Keyboard Shortcuts (Managed by ShortcutManager v4.0.0)
    window.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }

      if (shortcutManager) {
        if (shortcutManager.matchKey(e, 'toggleInspector')) {
          e.preventDefault();
          toggleInspector();
          return;
        }

        if (shortcutManager.matchKey(e, 'toggleEditMode')) {
          e.preventDefault();
          if (modeManager) {
            const nextMode = modeManager.toggleMode();
            floatingDock?.showToast(nextMode === 'edit' ? '편집 모드 (Edit Studio)로 전환되었습니다.' : '검사 모드로 전환되었습니다.');
            floatingDock?.renderCurrentTab();
          }
          return;
        }

        if (shortcutManager.matchKey(e, 'instantZoomIn')) {
          e.preventDefault();
          instantZoom?.zoomIn();
          return;
        }

        if (shortcutManager.matchKey(e, 'instantZoomOut')) {
          e.preventDefault();
          instantZoom?.zoomOut();
          return;
        }

        if (shortcutManager.matchKey(e, 'resetZoom')) {
          e.preventDefault();
          instantZoom?.resetZoom();
          return;
        }

        if (shortcutManager.matchKey(e, 'toggleGrid')) {
          e.preventDefault();
          if (overlayCanvas) {
            const on = overlayCanvas.toggleGrid();
            floatingDock?.showToast(on ? '그리드가 활성화되었습니다.' : '그리드가 꺼졌습니다.');
            floatingDock?.renderCurrentTab();
          }
          return;
        }

        if (shortcutManager.matchKey(e, 'togglePrecisionCursor')) {
          e.preventDefault();
          if (precisionCursor) {
            const active = precisionCursor.toggle();
            floatingDock?.showToast(active ? '정밀 십자선 커서가 활성화되었습니다.' : '십자선 커서가 꺼졌습니다.');
            floatingDock?.renderCurrentTab();
          }
          return;
        }

        if (shortcutManager.matchKey(e, 'toggleTabOrder')) {
          e.preventDefault();
          if (tabOrderVisualizer) {
            const active = tabOrderVisualizer.toggle();
            floatingDock?.showToast(active ? 'W3C 탭 순서 흐름이 켜졌습니다.' : '탭 순서 흐름이 꺼졌습니다.');
            floatingDock?.renderCurrentTab();
          }
          return;
        }
      }

      // Escape to Deselect / Unlock
      if (e.key === 'Escape') {
        modeManager?.clearSelection();
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

    // Window Resize / Scroll
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

  window.StyleScratcher = {
    toggle: toggleInspector,
    getCanvas: () => overlayCanvas,
    getTweaker: () => styleTweaker,
    getDock: () => floatingDock,
    getUnitConverter: () => unitConverter,
    getPageController: () => pageController,
    getMotionInspector: () => motionInspector,
    getInstantZoom: () => instantZoom,
    getPrecisionCursor: () => precisionCursor,
    getModeManager: () => modeManager,
    getDeviceMockup: () => deviceMockup,
    getTabOrderVisualizer: () => tabOrderVisualizer,
    getShortcutManager: () => shortcutManager,
    getContextHud: () => contextHud,
    isSafeMode: () => isSafeMode,
    setSafeMode: (val) => { isSafeMode = !!val; return isSafeMode; }
  };
})();

