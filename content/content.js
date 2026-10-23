// Style Scratcher v4.1.0. - Content Script Orchestrator

(function () {
  // Prevent multiple injections
  if (window.__STYLE_SCRATCHER_INITIALIZED__) return;
  window.__STYLE_SCRATCHER_INITIALIZED__ = true;

  let isActive = false;
  let isInitialized = false;
  const activeListeners = [];
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

  // v4.0.0+ Modules
  let modeManager = null;
  let deviceMockup = null;
  let tabOrderVisualizer = null;
  let shortcutManager = null;
  let contextHud = null;
  let updateGuardian = null;

  let isAltPressed = false;
  let isSafeMode = true;

  function initStyleScratcher() {
    if (isInitialized) return;
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
    instantZoom = typeof InstantZoom !== 'undefined' ? new InstantZoom({ active: false, manageShortcuts: false }) : null;
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

    const currentVersion = typeof chrome !== 'undefined' && chrome.runtime?.getManifest
      ? chrome.runtime.getManifest().version : '4.1.0';
    updateGuardian = typeof UpdateGuardian !== 'undefined' ? new UpdateGuardian({ currentVersion }) : null;

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
      updateGuardian: updateGuardian,
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
        return handleHudAction(action, targetEl);
      });
    }

    isInitialized = true;

    console.log('[Style Scratcher] Studio initialized on demand.');
  }

  function selectElement(element) {
    modeManager?.select(element);
    styleTweaker.setElement(element);
    overlayCanvas.setSelectedElement(element);
    floatingDock?.updateElement();
  }

  async function copyText(text, message) {
    if (!navigator.clipboard?.writeText) throw new Error('이 페이지에서 클립보드를 사용할 수 없습니다.');
    await navigator.clipboard.writeText(text);
    floatingDock?.showToast(message);
  }

  async function handleHudAction(action, targetEl) {
    if (!isActive || !targetEl) return;
    const aliases = { 'copy-react': 'copyReact', 'copy-css': 'copyCss' };
    action = aliases[action] || action;
    try {
      if (action === 'inspect' || action === 'edit') {
        modeManager?.setMode(action);
        selectElement(targetEl);
        floatingDock.switchTab('inspector');
      } else if (action === 'font') {
        selectElement(targetEl);
        floatingDock.switchTab('fonts');
      } else if (action === 'mockup') {
        deviceMockup?.toggle(true);
        floatingDock.switchTab('mockup');
      } else if (action === 'taborder') {
        tabOrderVisualizer?.toggle();
      } else if (action === 'copyReact') {
        await copyText(ReactExporter.generateComponent(targetEl), 'React JSX 컴포넌트가 복사되었습니다.');
      } else if (action === 'copyCss') {
        const comp = window.getComputedStyle(targetEl);
        const css = `/* Style Scratcher CSS */\nwidth: ${comp.width};\nheight: ${comp.height};\ncolor: ${comp.color};\nbackground: ${comp.backgroundColor};`;
        await copyText(css, 'CSS가 복사되었습니다.');
      } else if (action === 'copy-tailwind') {
        await copyText(TailwindConverter.convert(targetEl).tailwind, 'Tailwind CSS가 복사되었습니다.');
      } else if (action === 'outlines') {
        const output = FontStudio.createTextOutlines(targetEl);
        if (!output?.svg) throw new Error('아웃라인으로 변환할 텍스트가 없습니다.');
        await copyText(output.svg, '텍스트 아웃라인 SVG가 복사되었습니다.');
      } else if (action === 'edit-text') {
        modeManager?.setMode('edit');
        selectElement(targetEl);
        const editable = AssetEditor.toggleContentEditable(targetEl);
        floatingDock.switchTab('assets');
        floatingDock.showToast(editable ? '직접 타이핑 모드가 켜졌습니다.' : '직접 타이핑 모드가 꺼졌습니다.');
      } else if (action === 'download-asset') {
        if (!ReactExporter.downloadAsset(targetEl)) throw new Error('다운로드할 이미지나 SVG를 찾지 못했습니다.');
      } else if (action === 'move-up' || action === 'move-down') {
        const moved = action === 'move-up' ? modeManager?.moveUp(targetEl) : modeManager?.moveDown(targetEl);
        if (moved) selectElement(targetEl);
      } else if (action === 'duplicate') {
        const clone = modeManager?.duplicate(targetEl);
        if (clone) selectElement(clone);
      } else if (action === 'delete' && modeManager?.removeElement(targetEl)) {
        selectElement(null);
        floatingDock?.showToast('요소가 삭제되었습니다.');
      }
    } catch (error) {
      floatingDock?.showToast(`작업 실패: ${error.message}`);
    }
  }

  function toggleInspector(state) {
    const next = state !== undefined ? !!state : !isActive;
    if (next === isActive) return isActive;
    if (next) initStyleScratcher();
    isActive = next;
    window.__STYLE_SCRATCHER_SET_INTERCEPTION__?.(isActive);
    overlayCanvas?.setActive?.(isActive);
    instantZoom?.setActive?.(isActive);
    contextHud?.setActive?.(isActive);
    floatingDock?.setActive?.(isActive);
    if (!isActive) {
      activeListeners.splice(0).forEach(({ type, listener, options }) => {
        window.removeEventListener(type, listener, options);
      });
      isAltPressed = false;
      precisionCursor?.toggle(false);
      tabOrderVisualizer?.toggle(false);
      deviceMockup?.toggle(false);
      pageController?.toggleFreeze(false);
      pageController?.toggleUnblock(false);
      motionInspector?.reset?.();
      interactionDetector?.reset?.();
      if (typeof AssetEditor !== 'undefined') AssetEditor.restoreContentEditable?.();
      modeManager?.clearSelection();
      overlayCanvas.setSelectedElement(null);
      overlayCanvas.setHoverElement(null);
      overlayCanvas.clear();
      styleTweaker.setElement(null);
      if (hostContainer) hostContainer.style.display = 'none';
      floatingDock?.container?.classList.add('hidden');
    } else {
      if (hostContainer) hostContainer.style.display = '';
      floatingDock?.container?.classList.remove('hidden');
      attachEventListeners();
      overlayCanvas.render();
    }
    return isActive;
  }

  function listen(type, listener, options) {
    window.addEventListener(type, listener, options);
    activeListeners.push({ type, listener, options });
  }

  function attachEventListeners() {
    // Mouse Move for Inspector Hover
    listen('mousemove', (e) => {
      if (!isActive) return;

      if (e.target === hostContainer || e.composedPath?.().includes(hostContainer)) return;

      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || target === hostContainer || hostContainer.contains(target)) return;

      if (target === document.documentElement || target === document.body) return;

      overlayCanvas.setHoverElement(target);
    }, { passive: true });

    // Click to Select & Lock Element (with Edit Studio Multi-Select Shift+Click)
    listen('click', (e) => {
      if (!isActive) return;

      if (e.target === hostContainer || e.composedPath?.().includes(hostContainer)) {
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
    listen('keydown', (e) => {
      if (!isActive) return;
      const activeEl = shadowRoot?.activeElement || document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable)) {
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

        if (shortcutManager.matchKey(e, 'toggleFreeze')) {
          e.preventDefault();
          pageController?.toggleFreeze();
          floatingDock?.renderCurrentTab();
          return;
        }

        if (shortcutManager.matchKey(e, 'toggleUnblock')) {
          e.preventDefault();
          pageController?.toggleUnblock();
          floatingDock?.renderCurrentTab();
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

      if (e.altKey && !e.ctrlKey && !e.metaKey && ['ArrowUp', 'ArrowDown'].includes(e.key) && modeManager?.getPrimaryElement()) {
        e.preventDefault();
        handleHudAction(e.key === 'ArrowUp' ? 'move-up' : 'move-down', modeManager.getPrimaryElement());
        return;
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

    listen('keyup', (e) => {
      if (e.key === 'Alt') {
        isAltPressed = false;
        overlayCanvas.render();
      }
    });

    // Window Resize / Scroll
    listen('scroll', () => {
      if (isActive) {
        overlayCanvas.render();
        tabOrderVisualizer?.scheduleRender?.();
      }
    }, { passive: true, capture: true });

    listen('resize', () => {
      if (isActive) {
        overlayCanvas.render();
        tabOrderVisualizer?.scheduleRender?.();
      }
    }, { passive: true });
  }

  function getState() {
    return { isActive, isGridActive: overlayCanvas ? overlayCanvas.isGridVisible : false };
  }

  // Merely probing the receiver must not create any UI or event handlers.
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (!request || !['TOGGLE_SCRATCHER', 'TOGGLE_GRID', 'OPEN_TAB', 'GET_STATE'].includes(request.type)) return false;
      try {
        if (request.type === 'TOGGLE_SCRATCHER') {
          toggleInspector();
        } else if (request.type === 'TOGGLE_GRID') {
          toggleInspector(true);
          overlayCanvas.toggleGrid();
        } else if (request.type === 'OPEN_TAB') {
          toggleInspector(true);
          floatingDock.switchTab(request.tabName || 'inspector');
        }
        sendResponse({ success: true, ...getState() });
      } catch (error) {
        sendResponse({ success: false, error: error.message, ...getState() });
      }
      return false;
    });
  }

  window.StyleScratcher = {
    toggle: toggleInspector,
    getState,
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

