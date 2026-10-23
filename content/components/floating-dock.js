// Style Scratcher — Liquid Studio. Safe to inject more than once.
(() => {
if (typeof window !== 'undefined' && window.FloatingDock) return;

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

class FloatingDock {
  constructor(shadowRoot, options = {}) {
    this.shadowRoot = shadowRoot;
    this.tweaker = options.tweaker;
    this.overlayCanvas = options.overlayCanvas;
    this.unitConverter = options.unitConverter || (typeof UnitConverter !== 'undefined' ? new UnitConverter() : null);
    this.interactionDetector = options.interactionDetector || (typeof InteractionDetector !== 'undefined' ? new InteractionDetector() : null);
    this.pageController = options.pageController || (typeof PageController !== 'undefined' ? new PageController() : null);
    this.motionInspector = options.motionInspector || (typeof MotionInspector !== 'undefined' ? new MotionInspector() : null);
    this.instantZoom = options.instantZoom || (typeof InstantZoom !== 'undefined' ? new InstantZoom() : null);
    this.precisionCursor = options.precisionCursor || (typeof PrecisionCursor !== 'undefined' ? new PrecisionCursor(this.shadowRoot) : null);
    this.modeManager = options.modeManager || (typeof ModeManager !== 'undefined' ? new ModeManager({ shadowRoot }) : null);
    this.deviceMockup = options.deviceMockup || (typeof DeviceMockup !== 'undefined' ? new DeviceMockup(this.shadowRoot) : null);
    this.fontStudio = options.fontStudio || (typeof FontStudio !== 'undefined' ? FontStudio : null);
    this.tabOrderVisualizer = options.tabOrderVisualizer || (typeof TabOrderVisualizer !== 'undefined' ? new TabOrderVisualizer(this.shadowRoot) : null);
    this.shortcutManager = options.shortcutManager || (typeof ShortcutManager !== 'undefined' ? new ShortcutManager() : null);
    this.reactExporter = options.reactExporter || (typeof ReactExporter !== 'undefined' ? ReactExporter : null);
    this.version = typeof chrome !== 'undefined' && chrome.runtime?.getManifest ? chrome.runtime.getManifest().version : '4.1.0';
    this.updateGuardian = options.updateGuardian || (typeof UpdateGuardian !== 'undefined' ? new UpdateGuardian({ currentVersion: this.version }) : null);
    this.isSafeMode = options.isSafeMode !== undefined ? options.isSafeMode : true;
    this.onToggleSafeMode = options.onToggleSafeMode || (() => {});
    this.onToggleInspector = options.onToggleInspector || (() => {});
    this.currentTab = 'inspector';
    this.isActive = false;
    this.activationEpoch = 0;
    this.clampFrame = null;
    this.updateTimer = null;
    this.toastTimer = null;
    this.isMinimized = false;
    this.siteStylesheets = [];
    this.extractedPalette = null;
    this.extractedFonts = [];
    this.tabNames = { inspector: '검사', fonts: '타이포', assets: '에셋', code: '코드', mockup: '디바이스', interaction: '인터랙션', motion: '모션', graphics: '그래픽', tools: '페이지 도구', settings: '설정' };
    this.disclosureState = new Map();
    this.initDOM();
    this.initDrag();
    this.setActive(options.active !== false);
  }

  setActive(active) {
    const next = !!active;
    if (this.isActive === next) return;
    this.isActive = next;
    this.activationEpoch++;
    if (next) {
      document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
      window.addEventListener('resize', this.onWindowResize);
      this.renderCurrentTab();
      // The first stylesheet load owns the default position; re-clamp explicit positions after reveal.
      if (this.container.style.left) this.scheduleClamp();
      this.initUpdateChecker();
    } else {
      document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
      window.removeEventListener('resize', this.onWindowResize);
      if (this.clampFrame !== null) cancelAnimationFrame(this.clampFrame);
      this.clampFrame = null;
      clearTimeout(this.updateTimer);
      clearTimeout(this.toastTimer);
      this.updateTimer = this.toastTimer = null;
      this.stopDrag?.();
      this.toggleToolsMenu(false);
      this.container.querySelector('#scratcherToast').classList.remove('show');
    }
  }

  scheduleClamp() {
    if (!this.isActive || this.clampFrame !== null) return;
    this.clampFrame = requestAnimationFrame(() => {
      this.clampFrame = null;
      if (this.isActive) this.clampPosition();
    });
  }

  initDOM() {
    this.container = document.createElement('section');
    this.container.className = 'scratcher-dock';
    this.container.setAttribute('aria-label', 'Style Scratcher 스튜디오');
    this.container.setAttribute('lang', 'ko');
    this.container.innerHTML = `
      <header class="dock-header" id="dockHeader">
        <div class="dock-brand">
          <div class="dock-logo" aria-hidden="true"><svg width="28" height="28" aria-hidden="true" viewBox="0 0 64 64"><g fill="none" stroke="#E11D48" stroke-linecap="round" stroke-linejoin="round"><g stroke-width="3.5"><path d="M17 25 L17 20 Q17 17 20 17 L25 17"/><path d="M39 17 L44 17 Q47 17 47 20 L47 25"/><path d="M47 39 L47 44 Q47 47 44 47 L39 47"/><path d="M25 47 L20 47 Q17 47 17 44 L17 39"/></g><g stroke-width="2.2" opacity=".68"><path d="M32 6 L32 10"/><path d="M54 32 L58 32"/><path d="M32 54 L32 58"/><path d="M6 32 L10 32"/></g></g><circle cx="32" cy="32" r="3.3" fill="#E11D48"/></svg></div>
          <div><span class="dock-title">Style Scratcher</span><span class="dock-subtitle">LIQUID STUDIO <span class="dock-version">v${escapeHtml(this.version)}</span></span></div>
        </div>
        <div class="dock-controls">
          <button class="icon-btn" id="moveDockBtn" title="드래그 또는 방향키로 위치 이동 · Home으로 원위치" aria-label="스튜디오 위치 이동. 방향키로 이동, Home으로 원위치"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18M3 12h18m-9-9-3 3m3-3 3 3m-3 15-3-3m3 3 3-3M3 12l3-3m-3 3 3 3m15-3-3-3m3 3-3 3"/></svg></button>
          <button class="icon-btn" id="minimizeBtn" title="스튜디오 접기" aria-label="스튜디오 접기" aria-expanded="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14"/></svg></button>
          <button class="icon-btn" id="closeDockBtn" title="스튜디오 종료 (Alt + S)" aria-label="스튜디오 종료"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M6 18 18 6"/></svg></button>
        </div>
      </header>
      <div class="dock-workspace-bar">
        <div class="mode-switch-group" aria-label="작업 모드">
          <button class="mode-switch-btn" id="btnModeInspect" aria-pressed="true">검사</button>
          <button class="mode-switch-btn" id="btnModeEdit" aria-pressed="false">편집</button>
        </div>
        <span class="workspace-note"><i></i>현재 페이지에서 작업 중</span>
      </div>
      <div class="dock-update-banner" id="dockUpdateBanner" hidden></div>
      <nav class="dock-navigation" aria-label="스튜디오 패널">
        <div class="dock-tabs" id="dockTabs" role="tablist" aria-label="주요 도구">
          <button class="tab-btn active" data-tab="inspector" id="tab-inspector" role="tab" aria-selected="true" aria-controls="dockBody">검사</button>
          <button class="tab-btn" data-tab="fonts" id="tab-fonts" role="tab" aria-selected="false" aria-controls="dockBody" tabindex="-1">타이포</button>
          <button class="tab-btn" data-tab="assets" id="tab-assets" role="tab" aria-selected="false" aria-controls="dockBody" tabindex="-1">에셋</button>
          <button class="tab-btn" data-tab="code" id="tab-code" role="tab" aria-selected="false" aria-controls="dockBody" tabindex="-1">코드</button>
        </div>
        <button class="more-tools-btn" id="moreToolsBtn" aria-haspopup="menu" aria-expanded="false" aria-controls="moreToolsMenu"><span id="moreToolsLabel">더 보기</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
        <div class="more-tools-menu" id="moreToolsMenu" role="menu" aria-label="전문 도구" hidden>
          <span class="menu-heading" aria-hidden="true">EXPLORE THE DETAILS</span>
          <button data-tab="mockup" role="menuitemradio" aria-checked="false"><span>디바이스 목업</span><small>뷰포트와 방향</small></button>
          <button data-tab="interaction" role="menuitemradio" aria-checked="false"><span>인터랙션</span><small>이벤트와 상태</small></button>
          <button data-tab="motion" role="menuitemradio" aria-checked="false"><span>모션</span><small>재생 속도와 곡선</small></button>
          <button data-tab="graphics" role="menuitemradio" aria-checked="false"><span>그래픽</span><small>Canvas · SVG · WebGL</small></button>
          <button data-tab="tools" role="menuitemradio" aria-checked="false"><span>페이지 도구</span><small>그리드 · 줌 · 접근성</small></button>
          <button data-tab="settings" role="menuitemradio" aria-checked="false"><span>설정</span><small>단축키와 업데이트</small></button>
        </div>
      </nav>
      <div class="dock-panel-heading"><span id="panelEyebrow">ELEMENT INSPECTOR</span><span id="panelName">검사</span></div>
      <div class="dock-body" id="dockBody" role="tabpanel" aria-labelledby="tab-inspector" tabindex="0"></div>
      <footer class="dock-footer"><span><i></i>편집 내용은 현재 페이지에만 적용됩니다.</span><kbd>Esc <span>선택 해제</span></kbd></footer>
      <div class="scratcher-toast" id="scratcherToast" role="status" aria-live="polite" aria-atomic="true"><span class="toast-dot" aria-hidden="true"></span><span id="toastMsg"></span></div>
      <span class="sr-only" id="dockAnnounce" role="status" aria-live="polite"></span>
    `;
    this.shadowRoot.appendChild(this.container);
    ['Inspect', 'Edit'].forEach(mode => this.container.querySelector(`#btnMode${mode}`).addEventListener('click', () => {
      this.modeManager?.setMode(mode.toLowerCase());
      this.renderCurrentTab();
      this.showToast(mode === 'Edit' ? '편집 모드 · 선택한 요소를 수정할 수 있습니다.' : '검사 모드로 전환했습니다.');
    }));
    this.container.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
      this.switchTab(button.dataset.tab);
      if (button.closest('#moreToolsMenu')) this.toggleToolsMenu(false, true);
    }));
    this.container.querySelector('#moreToolsBtn').addEventListener('click', () => this.toggleToolsMenu());
    this.container.querySelector('#minimizeBtn').addEventListener('click', () => this.toggleMinimize());
    this.container.querySelector('#closeDockBtn').addEventListener('click', () => this.onToggleInspector());
    this.container.addEventListener('keydown', event => this.handleNavigationKey(event));
    this.onDocumentPointerDown = event => {
      if (!event.composedPath().includes(this.container)) this.toggleToolsMenu(false);
    };
    this.container.addEventListener('focusout', () => {
      queueMicrotask(() => {
        if (!this.isActive) return;
        const focus = this.shadowRoot.activeElement;
        if (!focus?.closest('.dock-navigation')) this.toggleToolsMenu(false);
      });
    });
  }

  toggleToolsMenu(force, restoreFocus = false) {
    const menu = this.container.querySelector('#moreToolsMenu');
    const button = this.container.querySelector('#moreToolsBtn');
    const open = force === undefined ? menu.hidden : force;
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open) (menu.querySelector('button[aria-checked="true"]') || menu.querySelector('button'))?.focus();
    else if (restoreFocus) button.focus();
  }

  handleNavigationKey(event) {
    const target = event.target;
    if (target.closest('#moreToolsMenu')) {
      const buttons = Array.from(this.container.querySelectorAll('#moreToolsMenu button'));
      const current = buttons.indexOf(target);
      let next;
      if (event.key === 'ArrowDown') next = (current + 1) % buttons.length;
      if (event.key === 'ArrowUp') next = (current + buttons.length - 1) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next !== undefined) { event.preventDefault(); event.stopPropagation(); buttons[next].focus(); }
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); this.toggleToolsMenu(false, true); }
      if (event.key === 'Tab') this.toggleToolsMenu(false, true);
      return;
    }
    if (target.id === 'moreToolsBtn' && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); this.toggleToolsMenu(true); return;
    }
    if (event.key === 'Escape' && !this.container.querySelector('#moreToolsMenu').hidden) {
      event.preventDefault(); event.stopPropagation(); this.toggleToolsMenu(false, true); return;
    }
    if (target.getAttribute('role') === 'tab') {
      const tabs = Array.from(this.container.querySelectorAll('[role="tab"]'));
      const current = tabs.indexOf(target);
      let next;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); event.stopPropagation(); this.switchTab(tabs[next].dataset.tab); tabs[next].focus(); }
    }
  }

  showToast(message, kind = 'success') {
    if (this.isActive === false) return;
    const toast = this.container.querySelector('#scratcherToast');
    this.container.querySelector('#toastMsg').textContent = message;
    toast.dataset.kind = kind;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove('show'), kind === 'error' ? 5500 : 3200);
  }

  async copyText(text, message = '클립보드에 복사했습니다.') {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard-unavailable');
      await navigator.clipboard.writeText(String(text));
      this.showToast(message);
      return true;
    } catch {
      this.showToast('복사하지 못했습니다. 브라우저의 클립보드 권한을 확인하거나 코드를 직접 선택해 복사해주세요.', 'error');
      return false;
    }
  }

  async performAction(button, action, label = '처리 중…') {
    if (button?.disabled) return;
    const original = button?.innerHTML;
    const originTab = this.currentTab;
    if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = label; }
    try { return await action(); }
    catch (error) { this.showToast(`작업을 완료하지 못했습니다. ${error?.message || '다시 시도해주세요.'}`, 'error'); }
    finally {
      if (button) { button.disabled = false; button.removeAttribute('aria-busy'); button.innerHTML = original; }
      if (button?.isConnected === false && this.currentTab === originTab && this.container?.isConnected) this.renderCurrentTab();
    }
  }

  switchTab(tabName) {
    if (!Object.hasOwn(this.tabNames, tabName)) return false;
    const changed = this.currentTab !== tabName;
    this.currentTab = tabName;
    if (this.isMinimized) this.toggleMinimize();
    this.container.querySelectorAll('[data-tab]').forEach(button => {
      const active = button.dataset.tab === tabName;
      button.classList.toggle('active', active);
      if (button.getAttribute('role') === 'tab') {
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      } else button.setAttribute('aria-checked', String(active));
    });
    const mainTab = this.container.querySelector(`#tab-${tabName}`);
    const more = this.container.querySelector('#moreToolsBtn');
    more.classList.toggle('active', !mainTab);
    this.container.querySelector('#moreToolsLabel').textContent = mainTab ? '더 보기' : this.tabNames[tabName];
    this.container.querySelector('#dockBody').setAttribute('aria-labelledby', mainTab ? mainTab.id : 'moreToolsBtn');
    if (!mainTab) this.container.querySelector('[role="tab"]').tabIndex = 0;
    this.renderCurrentTab(!changed);
    if (changed) this.container.querySelector('#dockBody').scrollTop = 0;
    return true;
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.toggleToolsMenu(false);
    this.container.classList.toggle('minimized', this.isMinimized);
    const button = this.container.querySelector('#minimizeBtn');
    button.setAttribute('aria-expanded', String(!this.isMinimized));
    button.setAttribute('aria-label', this.isMinimized ? '스튜디오 펼치기' : '스튜디오 접기');
    button.title = this.isMinimized ? '스튜디오 펼치기' : '스튜디오 접기';
    this.clampPosition();
  }

  initUpdateChecker() {
    if (!this.isActive || !this.updateGuardian || this.updateTimer !== null) return;
    const epoch = this.activationEpoch;
    this.updateTimer = setTimeout(async () => {
      this.updateTimer = null;
      try {
        const update = await this.updateGuardian.checkForUpdate();
        if (this.isActive && this.activationEpoch === epoch && update?.hasUpdate) this.showUpdateBanner(update);
      } catch { /* A manual retry remains available in Settings. */ }
    }, 1500);
  }

  showUpdateBanner(update) {
    const banner = this.container.querySelector('#dockUpdateBanner');
    banner.innerHTML = `<span>새 버전 <strong>${escapeHtml(update.latestDisplayVersion)}</strong></span><button class="update-banner-btn" id="btnBannerUpdate">ZIP 받기</button><button class="update-banner-close" id="btnCloseUpdateBanner" aria-label="업데이트 알림 닫기">×</button>`;
    banner.hidden = false;
    banner.querySelector('#btnBannerUpdate').addEventListener('click', event => this.performAction(event.currentTarget, async () => {
      await this.updateGuardian.triggerDownload(update.zipUrl, `style-scrather-${String(update.latestDisplayVersion).replace(/\.+$/, '')}.zip`);
      this.showToast('ZIP 다운로드를 요청했습니다. 설치 후 확장 프로그램을 다시 불러오세요.');
    }, '받는 중…'));
    banner.querySelector('#btnCloseUpdateBanner').addEventListener('click', () => { banner.hidden = true; });
  }

  clampPosition(left, top) {
    const rect = this.container.getBoundingClientRect();
    const inset = 12;
    const x = Math.max(inset, Math.min(left ?? rect.left, window.innerWidth - rect.width - inset));
    const y = Math.max(inset, Math.min(top ?? rect.top, window.innerHeight - rect.height - inset));
    this.container.style.left = `${x}px`;
    this.container.style.top = `${y}px`;
    this.container.style.right = 'auto';
  }

  initDrag() {
    const header = this.container.querySelector('#dockHeader');
    let drag = null;
    header.addEventListener('pointerdown', event => {
      if (event.button !== 0 || (event.target.closest('button') && !event.target.closest('#moveDockBtn'))) return;
      const rect = this.container.getBoundingClientRect();
      drag = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, pointerId: event.pointerId };
      header.setPointerCapture(event.pointerId);
      this.container.classList.add('dragging');
      event.preventDefault();
    });
    header.addEventListener('pointermove', event => {
      if (drag) this.clampPosition(drag.left + event.clientX - drag.x, drag.top + event.clientY - drag.y);
    });
    const stop = () => {
      const pointerId = drag?.pointerId;
      drag = null;
      if (pointerId !== undefined && header.hasPointerCapture?.(pointerId)) header.releasePointerCapture(pointerId);
      this.container.classList.remove('dragging');
    };
    this.stopDrag = stop;
    header.addEventListener('pointerup', stop);
    header.addEventListener('pointercancel', stop);
    header.addEventListener('lostpointercapture', stop);
    this.container.querySelector('#moveDockBtn').addEventListener('keydown', event => {
      const step = event.shiftKey ? 8 : 32;
      const directions = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (event.key === 'Home') {
        event.preventDefault(); this.clampPosition(window.innerWidth - this.container.offsetWidth - 20, 20);
      } else if (directions[event.key]) {
        event.preventDefault(); event.stopPropagation();
        const rect = this.container.getBoundingClientRect();
        this.clampPosition(rect.left + directions[event.key][0], rect.top + directions[event.key][1]);
      } else return;
      const rect = this.container.getBoundingClientRect();
      this.container.querySelector('#dockAnnounce').textContent = `스튜디오 위치: 가로 ${Math.round(rect.left)}, 세로 ${Math.round(rect.top)} 픽셀`;
    });
    this.onWindowResize = () => this.scheduleClamp();
  }

  updateElement() { if (!this.isUpdatingControl) this.renderCurrentTab(); }

  renderCurrentTab(preserveFocus = true) {
    if (this.isActive === false) return;
    const body = this.container.querySelector('#dockBody');
    const focus = this.shadowRoot.activeElement;
    const hadFocus = preserveFocus && body.contains(focus);
    const focusId = hadFocus ? focus.id : null;
    const focusData = hadFocus && !focusId ? ['unit', 'pseudo', 'speed', 'preset', 'section'].find(name => focus.dataset[name]) : null;
    const focusValue = focusData ? focus.dataset[focusData] : null;
    const scrollTop = body.scrollTop;
    body.querySelectorAll('details[data-section]').forEach(section => this.disclosureState.set(`${this.renderedTab || this.currentTab}:${section.dataset.section}`, section.open));
    const isEdit = this.modeManager?.getMode() === 'edit';
    ['Inspect', 'Edit'].forEach(mode => {
      const button = this.container.querySelector(`#btnMode${mode}`);
      const active = mode === 'Edit' ? isEdit : !isEdit;
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
    const headings = { inspector: 'ELEMENT INSPECTOR', fonts: 'TYPOGRAPHY STUDIO', assets: 'CONTENT & ASSETS', code: 'PALETTE & CODE', mockup: 'RESPONSIVE PREVIEW', interaction: 'EVENTS & STATES', motion: 'MOTION STUDY', graphics: 'GRAPHICS INSPECTOR', tools: 'PAGE TOOLKIT', settings: 'YOUR WORKSPACE' };
    this.container.querySelector('#panelEyebrow').textContent = headings[this.currentTab];
    this.container.querySelector('#panelName').textContent = this.tabNames[this.currentTab];
    const renderers = { inspector: 'renderInspectorTab', fonts: 'renderFontsTab', assets: 'renderAssetsTab', code: 'renderCodeTab', mockup: 'renderMockupTab', interaction: 'renderInteractionTab', motion: 'renderMotionTab', graphics: 'renderGraphicsTab', tools: 'renderToolsTab', settings: 'renderSettingsTab' };
    try {
      this[renderers[this.currentTab]](body);
      this.renderedTab = this.currentTab;
      this.enhanceControls(body);
    } catch {
      body.innerHTML = '<div class="empty-state"><div class="empty-title">패널을 불러오지 못했습니다.</div><p class="empty-desc">요소를 다시 선택하거나 패널을 새로 열어주세요.</p><button class="btn-secondary" id="retryPanelBtn">다시 시도</button></div>';
      body.querySelector('#retryPanelBtn').addEventListener('click', () => this.renderCurrentTab());
    }
    body.querySelectorAll('details[data-section]').forEach(section => {
      const key = `${this.currentTab}:${section.dataset.section}`;
      if (this.disclosureState.has(key)) section.open = this.disclosureState.get(key);
    });
    if (hadFocus) {
      const nextFocus = focusId ? body.querySelector(`#${CSS.escape(focusId)}`) : focusData ? body.querySelector(`[data-${focusData}="${CSS.escape(focusValue)}"]`) : null;
      (nextFocus || body).focus({ preventScroll: true });
    }
    body.scrollTop = scrollTop;
  }

  enhanceControls(body) {
    const labels = { safeModeCheckbox: '요소 선택 시 링크 이동 차단', radiusSlider: '모서리 둥글기', radiusInput: '모서리 둥글기 픽셀', tlRadiusInput: '좌상 모서리 픽셀', trRadiusInput: '우상 모서리 픽셀', blRadiusInput: '좌하 모서리 픽셀', brRadiusInput: '우하 모서리 픽셀', paddingSlider: '안쪽 여백', paddingInput: '안쪽 여백 픽셀', bgColorPicker: '배경색 선택', bgHexInput: '배경색 값', textColorPicker: '글자색 선택', textHexInput: '글자색 값', mockupScaleInput: '디바이스 미리보기 배율', fontFamilySelect: '글꼴', fontSizeInput: '글자 크기 픽셀', fontWeightSelect: '글자 굵기', fontStudioTextArea: '선택한 요소의 텍스트', liveTextarea: '선택한 요소의 텍스트', imgUrlInput: '이미지 URL', localFileInput: '로컬 이미지', svgFillPicker: 'SVG 채우기 색 선택', svgFillInput: 'SVG 채우기 값', svgStrokePicker: 'SVG 윤곽 색 선택', svgStrokeInput: 'SVG 윤곽 색 값', svgStrokeWidthSlider: 'SVG 선 두께', svgStrokeWidthInput: 'SVG 선 두께 픽셀', svgXmlTextarea: 'SVG 원본 코드', gridColsSlider: '그리드 컬럼 수', gridGutterSlider: '그리드 간격 픽셀', cssSearchInput: '스타일시트 검색' };
    body.querySelectorAll('input, select, textarea').forEach(input => {
      if (!input.getAttribute('aria-label')) input.setAttribute('aria-label', labels[input.id] || input.closest('tr')?.querySelector('td')?.textContent.trim() || input.placeholder || '값');
    });
    body.querySelectorAll('button').forEach(button => {
      button.type = 'button';
      if (!button.textContent.trim() && button.title) button.setAttribute('aria-label', button.title);
    });
    body.querySelectorAll('.toggle-switch-btn, .unit-chip, .pseudo-btn[data-pseudo], .speed-chip, .preset-btn').forEach(button => {
      button.setAttribute('aria-pressed', String(button.classList.contains('active')));
      const title = button.closest('.tool-banner')?.querySelector('.tool-meta-title')?.textContent;
      if (title) button.setAttribute('aria-label', title);
    });
    this.container.querySelectorAll('svg').forEach(svg => { if (!svg.getAttribute('role')) svg.setAttribute('aria-hidden', 'true'); });
  }

  // ==========================================
  // TAB 1: Inspector & Units
  // ==========================================
  renderInspectorTab(container) {
    const el = this.tweaker?.getElement();
    if (!el || el.isConnected === false) {
      container.innerHTML = `
        <div class="inspector-welcome">
          <div class="welcome-art" aria-hidden="true"><div class="welcome-selection"><span></span><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m5 3 14 9-7 1-3 7Z"/></svg></div><i class="welcome-orbit"></i></div>
          <span class="welcome-eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</span>
          <h2>어떤 스타일이 궁금한가요?</h2>
          <p>페이지의 요소 위로 마우스를 옮기고,<br>클릭해서 자세히 살펴보세요.</p>
          <ol class="welcome-steps"><li><span>01</span><div><strong>살펴보기</strong><small>크기와 간격을 한눈에</small></div></li><li><span>02</span><div><strong>선택하기</strong><small>클릭으로 요소 고정</small></div></li><li><span>03</span><div><strong>다듬기</strong><small>색상과 모양을 직접 조절</small></div></li></ol>
          <div class="welcome-tip"><kbd>Alt</kbd><span>요소 선택 후 누른 채 이동하면 거리를 측정합니다.</span></div>
        </div>`;
      return;
    }
    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const tag = el.tagName.toLowerCase();
    const classes = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).map(value => `.${value}`).join(' ') : '';
    const unit = this.unitConverter?.getUnit() || 'px';
    const number = property => Math.round(parseFloat(computed[property]) || 0);
    const radius = number('borderTopLeftRadius');
    const pt = number('paddingTop'), pr = number('paddingRight'), pb = number('paddingBottom'), pl = number('paddingLeft');
    const mt = number('marginTop'), mr = number('marginRight'), mb = number('marginBottom'), ml = number('marginLeft');
    const bg = TailwindConverter.rgbToHex(computed.backgroundColor);
    const color = TailwindConverter.rgbToHex(computed.color);
    const validHex = value => /^#[\da-f]{6}$/i.test(value);
    const bgPicker = validHex(bg) ? bg : '#ffffff';
    const colorPicker = validHex(color) ? color : '#17151c';
    let dimensions = `${Math.round(rect.width)} × ${Math.round(rect.height)} px`;
    if (this.unitConverter && unit !== 'px') {
      dimensions = `${this.unitConverter.convert(rect.width, unit, { element: el }).formatted} × ${this.unitConverter.convert(rect.height, unit, { element: el, isVertical: true }).formatted}`;
    }
    // A transparent or image background cannot be judged from two flat colors.
    const opaqueColors = validHex(bg) && validHex(color) && !/rgba|transparent/.test(computed.backgroundColor) && !/rgba/.test(computed.color) && computed.backgroundImage === 'none';
    const contrast = opaqueColors && typeof ColorSuite !== 'undefined' ? ColorSuite.getContrastRatio(color, bg) : null;
    const presets = typeof ColorSuite !== 'undefined' ? ColorSuite.getPresets() : [];
    const layout = this.fontStudio?.detectAutolayoutSizing?.(el);
    const edit = this.modeManager?.getMode() === 'edit';
    const selected = this.modeManager?.getSelectedElements().length || 1;
    container.innerHTML = `
      <div class="element-meta-card">
        <span class="card-eyebrow">SELECTED ELEMENT</span>
        <div class="meta-header"><span class="element-tag-pill">&lt;${escapeHtml(tag)}&gt;</span><span class="element-dim-badge">${escapeHtml(dimensions)}</span></div>
        ${classes ? `<div class="element-classes" title="${escapeHtml(classes)}">${escapeHtml(classes)}</div>` : '<span class="element-classes">클래스가 없는 요소</span>'}
        <div class="btn-group"><button class="btn-secondary" id="unlockBtn">선택 해제 <kbd>Esc</kbd></button><button class="btn-secondary" id="resetStylesBtn">스타일 복원</button></div>
        ${edit ? `<div class="edit-studio-bar"><span>${selected}개 선택</span><div class="edit-action-btn-group"><button class="edit-action-btn" id="btnDomMoveUp">위로</button><button class="edit-action-btn" id="btnDomMoveDown">아래로</button><button class="edit-action-btn" id="btnDomDuplicate">복제</button><button class="edit-action-btn danger" id="btnDomDelete">삭제</button></div></div>` : ''}
      </div>
      <label class="safe-mode-banner ${this.isSafeMode ? '' : 'disabled'}"><div><span class="safe-mode-title">요소 선택 시 링크 이동 차단</span><span class="safe-mode-desc">검사하는 동안 페이지 이동을 막습니다.</span></div><input type="checkbox" id="safeModeCheckbox" ${this.isSafeMode ? 'checked' : ''}></label>
      <details class="studio-section" data-section="appearance" open><summary><span>모양과 색상</span><small>Appearance</small></summary><div class="section-content">
        <div class="tweak-row"><label class="tweak-label" for="radiusInput">둥글기</label><div class="tweak-control-group"><input type="range" class="range-slider" id="radiusSlider" min="0" max="${Math.max(64, radius)}" value="${radius}"><input type="number" class="num-input" id="radiusInput" min="0" max="9999" value="${radius}"><span class="input-unit">px</span></div></div>
        <button class="section-reset-btn corner-toggle" id="toggleCornerDetails" aria-expanded="false" aria-controls="cornerDetailsGrid">모서리별로 조절</button>
        <div class="corner-radius-grid" id="cornerDetailsGrid" hidden>${[['tl', '좌상', 'borderTopLeftRadius'], ['tr', '우상', 'borderTopRightRadius'], ['bl', '좌하', 'borderBottomLeftRadius'], ['br', '우하', 'borderBottomRightRadius']].map(([id, title, property]) => `<label class="corner-item"><span>${title}</span><input type="number" class="num-input" id="${id}RadiusInput" min="0" max="9999" value="${number(property)}"></label>`).join('')}</div>
        <div class="section-divider"></div>
        <div class="tweak-row"><label class="tweak-label" for="bgHexInput">배경색</label><div class="color-picker-group"><div class="color-swatch-wrapper" style="background-color:${bgPicker}"><input type="color" class="native-color-picker" id="bgColorPicker" value="${bgPicker}"></div><input type="text" class="color-hex-input" id="bgHexInput" value="${escapeHtml(bg)}" spellcheck="false"></div></div>
        <div class="tweak-row"><label class="tweak-label" for="textHexInput">글자색</label><div class="color-picker-group"><div class="color-swatch-wrapper" style="background-color:${colorPicker}"><input type="color" class="native-color-picker" id="textColorPicker" value="${colorPicker}"></div><input type="text" class="color-hex-input" id="textHexInput" value="${escapeHtml(color)}" spellcheck="false"></div></div>
        <div class="color-action-bar"><span class="contrast-pill ${contrast ? contrast.passesAA ? 'pass' : 'fail' : ''}" title="단색 전경·배경 기준 참고값">${contrast ? `${contrast.ratio}:1 · ${contrast.score}` : '투명 배경·이미지 대비는 별도 확인'}</span><button class="eyedropper-btn" id="eyeDropperBtn" ${typeof window.EyeDropper === 'undefined' ? 'disabled title="이 환경에서는 스포이트를 사용할 수 없습니다."' : ''}>스포이트</button></div>
        <div class="color-presets-row" aria-label="배경색 프리셋">${presets.filter(validHex).map(preset => `<button class="preset-color-dot" style="background-color:${preset}" data-color="${preset}" title="배경색 ${preset}" aria-label="배경색 ${preset}"></button>`).join('')}</div>
      </div></details>
      <details class="studio-section" data-section="spacing"><summary><span>간격</span><small>Spacing</small></summary><div class="section-content">
        <div class="box-model-diagram"><div class="bm-margin"><span class="bm-label">MARGIN</span><span class="bm-val bm-margin-t">${mt}</span><span class="bm-val bm-margin-b">${mb}</span><span class="bm-val bm-margin-l">${ml}</span><span class="bm-val bm-margin-r">${mr}</span><div class="bm-padding"><span class="bm-label">PADDING</span><span class="bm-val bm-padding-t">${pt}</span><span class="bm-val bm-padding-b">${pb}</span><span class="bm-val bm-padding-l">${pl}</span><span class="bm-val bm-padding-r">${pr}</span><div class="bm-content">${escapeHtml(dimensions)}</div></div></div></div>
        <div class="tweak-row"><label class="tweak-label" for="paddingInput">안쪽 여백</label><div class="tweak-control-group"><input type="range" class="range-slider" id="paddingSlider" min="0" max="${Math.max(64, pt)}" value="${pt}"><input type="number" class="num-input" id="paddingInput" min="0" max="9999" value="${pt}"><span class="input-unit">px</span></div></div>
      </div></details>
      <details class="studio-section" data-section="measurement"><summary><span>측정 단위와 레이아웃</span><small>Measure</small></summary><div class="section-content"><div class="unit-selector-bar" aria-label="측정 단위">${['px', 'rem', 'em', '%', 'vw', 'vh', 'pt'].map(value => `<button class="unit-chip ${unit === value ? 'active' : ''}" data-unit="${value}">${value}</button>`).join('')}</div><p class="muted-copy">1rem = ${Number(this.unitConverter?.baseFontSize) || 16}px · 편집 값은 px 기준입니다.</p>${layout ? `<div class="autolayout-badge-container"><span class="al-badge">너비 ${escapeHtml(layout.widthBadge)}</span><span class="al-badge">높이 ${escapeHtml(layout.heightBadge)}</span></div>` : ''}</div></details>
    `;
    const apply = (action, refresh = false) => {
      this.isUpdatingControl = true;
      try { action(); } finally { this.isUpdatingControl = false; }
      this.overlayCanvas?.render();
      if (refresh) this.renderCurrentTab();
    };
    container.querySelector('#safeModeCheckbox').addEventListener('change', event => {
      this.isSafeMode = event.target.checked;
      this.onToggleSafeMode(this.isSafeMode);
      this.renderCurrentTab();
    });
    container.querySelector('#unlockBtn').addEventListener('click', () => {
      this.modeManager?.clearSelection();
      this.overlayCanvas?.setSelectedElement(null);
      this.tweaker.setElement(null);
      this.renderCurrentTab();
    });
    container.querySelector('#resetStylesBtn').addEventListener('click', () => {
      apply(() => this.tweaker.resetCurrentElement(), true);
      this.showToast('선택한 요소의 스타일을 복원했습니다.');
    });
    ['Up', 'Down'].forEach(direction => container.querySelector(`#btnDomMove${direction}`)?.addEventListener('click', () => {
      const moved = this.modeManager?.[`move${direction}`](el);
      this.showToast(moved ? '요소 순서를 변경했습니다.' : '이 방향으로 더 이동할 수 없습니다.', moved ? 'success' : 'info');
      this.overlayCanvas?.render();
    }));
    container.querySelector('#btnDomDuplicate')?.addEventListener('click', () => {
      const duplicate = this.modeManager?.duplicateElement(el);
      if (duplicate) { this.modeManager.select(duplicate); this.overlayCanvas?.setSelectedElement(duplicate); this.tweaker.setElement(duplicate); this.renderCurrentTab(); this.showToast('요소를 복제했습니다.'); }
    });
    container.querySelector('#btnDomDelete')?.addEventListener('click', () => {
      if (this.modeManager?.removeElement(el)) { this.modeManager.clearSelection(); this.overlayCanvas?.setSelectedElement(null); this.tweaker.setElement(null); this.renderCurrentTab(); this.showToast('요소를 삭제했습니다. 페이지를 새로고침하면 복원됩니다.'); }
    });
    const bindNumber = (sliderId, inputId, setter) => {
      const slider = container.querySelector(`#${sliderId}`), input = container.querySelector(`#${inputId}`);
      const update = value => { const number = Math.max(0, Math.min(9999, Number(value) || 0)); slider.max = Math.max(Number(slider.max), number); slider.value = number; input.value = number; apply(() => setter(number)); };
      slider.addEventListener('input', event => update(event.target.value));
      slider.addEventListener('change', () => this.renderCurrentTab());
      input.addEventListener('change', event => { update(event.target.value); this.renderCurrentTab(); });
    };
    bindNumber('radiusSlider', 'radiusInput', value => this.tweaker.setUnifiedRadius(value));
    bindNumber('paddingSlider', 'paddingInput', value => this.tweaker.setPadding('all', value));
    container.querySelector('#toggleCornerDetails').addEventListener('click', event => {
      const grid = container.querySelector('#cornerDetailsGrid');
      grid.hidden = !grid.hidden;
      event.currentTarget.setAttribute('aria-expanded', String(!grid.hidden));
    });
    ['tl', 'tr', 'bl', 'br'].forEach(corner => container.querySelector(`#${corner}RadiusInput`).addEventListener('change', event => apply(() => this.tweaker.setCornerRadius(corner, Math.max(0, Math.min(9999, Number(event.target.value) || 0))))));
    [['bgColorPicker', 'bgHexInput', 'background'], ['textColorPicker', 'textHexInput', 'text']].forEach(([pickerId, inputId, type]) => {
      const picker = container.querySelector(`#${pickerId}`), input = container.querySelector(`#${inputId}`);
      picker.addEventListener('input', event => { input.value = event.target.value; picker.parentElement.style.backgroundColor = event.target.value; apply(() => this.tweaker.setColor(type, event.target.value)); });
      picker.addEventListener('change', () => this.renderCurrentTab());
      input.addEventListener('change', event => {
        const value = event.target.value.trim();
        if (!CSS.supports('color', value)) { input.setAttribute('aria-invalid', 'true'); this.showToast('올바른 색상 값을 입력해주세요. 예: #E11D48 또는 rgb(225, 29, 72)', 'error'); return; }
        apply(() => this.tweaker.setColor(type, value), true);
      });
    });
    container.querySelector('#eyeDropperBtn').addEventListener('click', event => this.performAction(event.currentTarget, async () => {
      const hex = await ColorSuite.pickColorWithEyeDropper();
      if (hex) { apply(() => this.tweaker.setColor('background', hex), true); this.showToast(`${hex} 배경색을 적용했습니다.`); }
    }, '색상 선택…'));
    container.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => apply(() => this.tweaker.setColor('background', button.dataset.color), true)));
    container.querySelectorAll('[data-unit]').forEach(button => button.addEventListener('click', () => {
      this.unitConverter?.setUnit(button.dataset.unit);
      this.overlayCanvas?.setUnit(button.dataset.unit);
      this.renderCurrentTab();
    }));
  }

  // ==========================================
  // TAB: Device Mockup & Viewport Simulator (v4.0.0)
  // ==========================================
  renderMockupTab(container) {
    const isMockupOn = this.deviceMockup ? this.deviceMockup.isActive : false;
    const currentPreset = this.deviceMockup ? this.deviceMockup.currentPreset : 'iphone';
    const currentScale = this.deviceMockup ? Math.round(this.deviceMockup.scale * 100) : 85;
    const isLandscape = this.deviceMockup ? this.deviceMockup.isLandscape : false;

    container.innerHTML = `
      <div class="mockup-panel">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span class="section-title" style="margin: 0;">디바이스 뷰포트 시뮬레이터</span>
          <span style="font-size: 11px; color: var(--ss-muted);">프레임 미리보기</span>
        </div>

        <div class="tool-banner">
          <div>
            <div class="tool-meta-title">목업 시뮬레이터 창</div>
            <div class="tool-meta-desc">페이지를 프레임 안에 표시합니다. 일부 사이트는 임베드를 제한합니다.</div>
          </div>
          <button class="toggle-switch-btn ${isMockupOn ? 'active' : ''}" id="btnToggleMockup">
            ${isMockupOn ? 'ON' : 'OFF'}
          </button>
        </div>

        <span class="section-title" style="margin-top: 6px;">디바이스 프리셋 (Presets)</span>
        <div class="preset-grid">
          <button class="preset-btn ${currentPreset === 'tv' ? 'active' : ''}" data-preset="tv">
            <span class="preset-name">Smart TV</span>
            <span class="preset-dim">1920 × 1080 (16:9)</span>
          </button>
          <button class="preset-btn ${currentPreset === 'desktop' ? 'active' : ''}" data-preset="desktop">
            <span class="preset-name">Desktop Studio</span>
            <span class="preset-dim">1440 × 900 (16:10)</span>
          </button>
          <button class="preset-btn ${currentPreset === 'ipad' ? 'active' : ''}" data-preset="ipad">
            <span class="preset-name">iPad Pro</span>
            <span class="preset-dim">820 × 1180</span>
          </button>
          <button class="preset-btn ${currentPreset === 'iphone' ? 'active' : ''}" data-preset="iphone">
            <span class="preset-name">iPhone</span>
            <span class="preset-dim">393 × 852 (19.5:9)</span>
          </button>
          <button class="preset-btn ${currentPreset === 'galaxy' ? 'active' : ''}" data-preset="galaxy">
            <span class="preset-name">Galaxy</span>
            <span class="preset-dim">412 × 915 (20:9)</span>
          </button>
        </div>

        <div class="mockup-controls-bar">
          <button class="btn-secondary" id="btnMockupRotate" style="padding: 4px 8px; font-size: 11px;">
            ${isLandscape ? '가로 모드' : '세로 모드'}
          </button>
          <span style="font-size: 11px; font-weight: 600; color: var(--ss-muted);">배율:</span>
          <input type="range" class="mockup-scale-slider" id="mockupScaleInput" min="0.25" max="1.2" step="0.05" value="${currentScale / 100}">
          <span id="mockupScaleLabel" style="font-size: 11px; font-weight: 700; min-width: 36px; text-align: right;">${currentScale}%</span>
        </div>
      </div>
    `;

    container.querySelector('#btnToggleMockup')?.addEventListener('click', () => {
      if (this.deviceMockup) {
        const active = this.deviceMockup.toggle();
        this.showToast(active ? '디바이스 목업 시뮬레이터가 열렸습니다.' : '시뮬레이터가 닫혔습니다.');
        this.renderCurrentTab();
      }
    });

    container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (this.deviceMockup) {
          this.deviceMockup.setPreset(preset);
          if (!this.deviceMockup.isActive) this.deviceMockup.toggle(true);
          this.showToast(`${preset.toUpperCase()} 프리셋이 적용되었습니다.`);
          this.renderCurrentTab();
        }
      });
    });

    container.querySelector('#btnMockupRotate')?.addEventListener('click', () => {
      if (this.deviceMockup) {
        this.deviceMockup.toggleOrientation();
        this.renderCurrentTab();
      }
    });

    const scaleSlider = container.querySelector('#mockupScaleInput');
    const scaleLabel = container.querySelector('#mockupScaleLabel');
    scaleSlider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      scaleLabel.textContent = `${Math.round(val * 100)}%`;
      if (this.deviceMockup) {
        this.deviceMockup.setScale(val);
      }
    });
  }

  // ==========================================
  // TAB: Figma Font Studio & WebFont Harvester (v4.0.0)
  // ==========================================
  renderFontsTab(container) {
    const el = this.tweaker?.getElement();
    const studio = this.fontStudio || (typeof FontStudio !== 'undefined' ? FontStudio : null);
    const computed = el ? window.getComputedStyle(el) : null;
    const family = computed ? computed.fontFamily.replace(/['"]/g, '').split(',')[0].trim() : 'sans-serif';
    const size = computed ? Math.round(parseFloat(computed.fontSize) || 16) : 16;
    const weight = computed?.fontWeight || '400';
    const text = el ? (el.innerText || el.textContent || '').trim() : '';
    const fonts = (studio?.CURATED_FONTS || []).filter(font => font.name.toLowerCase() !== family.toLowerCase());
    const result = this.harvestResult?.family === family ? this.harvestResult.value : null;
    container.innerHTML = `
      ${el ? `<details class="studio-section" data-section="type-editor" open><summary><span>선택한 텍스트</span><small>Live edit</small></summary><div class="section-content">
        <div class="tweak-row"><label class="tweak-label" for="fontFamilySelect">글꼴</label><select class="font-select-field" id="fontFamilySelect"><option value="${escapeHtml(family)}" selected>${escapeHtml(family)} · 현재</option>${fonts.map(font => `<option value="${escapeHtml(font.name)}">${escapeHtml(font.name)}${font.google ? ' · Google' : ''}</option>`).join('')}</select></div>
        <p class="muted-copy">Google 표시 글꼴은 선택하면 Google Fonts에서 불러옵니다.</p>
        <div class="font-props-grid"><label class="font-prop-card"><span class="tweak-label">크기</span><div class="tweak-control-group"><input type="number" class="num-input" id="fontSizeInput" min="8" max="256" value="${size}"><span class="input-unit">px</span></div></label><label class="font-prop-card"><span class="tweak-label">굵기</span><select class="font-select-field" id="fontWeightSelect">${[100, 200, 300, 400, 500, 600, 700, 800, 900].map(value => `<option value="${value}" ${String(value) === weight ? 'selected' : ''}>${value}</option>`).join('')}</select></label></div>
        <label class="field-label" for="fontStudioTextArea">텍스트 내용</label><textarea class="live-text-area" id="fontStudioTextArea" spellcheck="false">${escapeHtml(text)}</textarea><p class="muted-copy">입력하면 선택한 요소의 내용을 텍스트로 교체합니다.</p>
        <div class="btn-group"><button class="btn-secondary" id="btnCreateOutlines">SVG 복사</button><button class="btn-secondary" id="btnDownloadOutlineSvg">SVG 저장</button></div><p class="muted-copy">화면에 렌더링한 글자를 윤곽으로 추출합니다. 복잡한 줄바꿈과 글자 배치는 원본과 다를 수 있습니다.</p>
      </div></details>` : `<div class="empty-state"><div class="empty-title">텍스트를 선택해보세요.</div><p class="empty-desc">제목, 본문, 버튼을 클릭하면 글꼴과 크기를 바꾸고 텍스트를 직접 편집할 수 있습니다.</p></div>`}
      <details class="studio-section" data-section="webfonts" open><summary><span>페이지 웹폰트</span><small>Font files</small></summary><div class="section-content"><p class="muted-copy">접근할 수 있는 @font-face 규칙에서 폰트 주소를 찾습니다.</p><button class="btn-secondary-action" id="btnExtractWebFonts" ${this.fontScanPending ? 'disabled' : ''}>${this.fontScanPending ? '폰트 확인 중…' : '웹폰트 스캔'}</button><div id="webFontsList" class="font-results"></div></div></details>
      <details class="studio-section" data-section="glyphs"><summary><span>문자 폭 실측</span><small>Advanced</small></summary><div class="section-content"><p class="muted-copy">${escapeHtml(family)} · 지정 글꼴과 대체 글꼴에서 문자 폭을 측정합니다. 글리프 지원률을 판정하지 않습니다.</p><span class="dock-badge" id="glyphStatusBadge">${result ? `${result.measuredCount ?? result.glyphs.length}개 폭 측정` : this.harvestPending ? '측정 중…' : '측정 전'}</span><div class="glyph-progress-bar-container" role="progressbar" aria-label="문자 폭 측정 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${result ? 100 : 0}" id="glyphProgress"><div class="glyph-progress-bar-fill" id="glyphProgressBar" style="width:${result ? 100 : 0}%"></div></div><button class="btn-primary-action" id="btnStartHarvest" ${this.harvestPending ? 'disabled' : ''}>${this.harvestPending ? '문자 폭 측정 중…' : '문자 폭 측정'}</button><button class="btn-secondary-action" id="btnExportGlyphData" ${result ? '' : 'hidden'}>측정 데이터 저장 · JSON</button></div></details>
    `;
    if (el) {
      container.querySelector('#fontFamilySelect').addEventListener('change', async event => {
        const select = event.target;
        select.disabled = true;
        try {
          if (!studio) throw new Error('폰트 도구를 불러올 수 없습니다.');
          await studio.applyFont(el, select.value);
          this.overlayCanvas?.render();
          this.showToast(`${select.value} 글꼴을 적용했습니다.`);
          if (this.currentTab === 'fonts') this.renderCurrentTab();
        } catch (error) { this.showToast(`글꼴 적용 실패: ${error.message}`, 'error'); }
        finally { select.disabled = false; }
      });
      container.querySelector('#fontSizeInput').addEventListener('change', event => { el.style.fontSize = `${Math.max(8, Math.min(256, Number(event.target.value) || 16))}px`; this.overlayCanvas?.render(); });
      container.querySelector('#fontWeightSelect').addEventListener('change', event => { el.style.fontWeight = event.target.value; this.overlayCanvas?.render(); });
      container.querySelector('#fontStudioTextArea').addEventListener('input', event => { el.innerText = event.target.value; this.overlayCanvas?.render(); });
      const outline = async (button, download) => this.performAction(button, async () => {
        if (!studio) throw new Error('폰트 도구를 불러올 수 없습니다.');
        await new Promise(resolve => requestAnimationFrame(resolve));
        const output = studio.createTextOutlines(el);
        if (!output?.svg) throw new Error('윤곽으로 변환할 텍스트가 없습니다.');
        if (download) {
          const url = URL.createObjectURL(new Blob([output.svg], { type: 'image/svg+xml;charset=utf-8' }));
          const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'style-scratcher-text.svg';
          document.body.append(anchor); anchor.click(); anchor.remove();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          this.showToast('SVG 파일 다운로드를 요청했습니다.');
        } else await this.copyText(output.svg, '텍스트 윤곽 SVG를 복사했습니다.');
      }, '윤곽 추출 중…');
      container.querySelector('#btnCreateOutlines').addEventListener('click', event => outline(event.currentTarget, false));
      container.querySelector('#btnDownloadOutlineSvg').addEventListener('click', event => outline(event.currentTarget, true));
    }
    this.renderWebFonts(container.querySelector('#webFontsList'));
    container.querySelector('#btnExtractWebFonts').addEventListener('click', event => this.performAction(event.currentTarget, async () => {
      if (!studio) throw new Error('폰트 도구를 불러올 수 없습니다.');
      this.fontScanPending = true;
      const list = container.querySelector('#webFontsList');
      list.textContent = '웹폰트 규칙을 확인하고 있습니다…';
      try {
        this.extractedFonts = await studio.extractWebFonts();
        this.fontsScanned = true;
        this.renderWebFonts(list);
      } catch (error) { list.textContent = '폰트 목록을 불러오지 못했습니다. 다시 스캔해주세요.'; throw error; }
      finally { this.fontScanPending = false; }
    }, '폰트 확인 중…'));
    container.querySelector('#btnStartHarvest').addEventListener('click', event => this.performAction(event.currentTarget, async () => {
      if (!studio) throw new Error('폰트 도구를 불러올 수 없습니다.');
      this.harvestPending = true;
      const badge = container.querySelector('#glyphStatusBadge');
      const progressBar = container.querySelector('#glyphProgressBar');
      const progress = container.querySelector('#glyphProgress');
      const selected = this.tweaker?.getElement();
      const measuredFamily = selected ? window.getComputedStyle(selected).fontFamily.replace(/['"]/g, '').split(',')[0].trim() : family;
      try {
        const output = await studio.harvestGlyphs(measuredFamily, percent => {
          progressBar.style.width = `${percent}%`;
          progress.setAttribute('aria-valuenow', String(percent));
          badge.textContent = `${percent}% 측정 중`;
        });
        this.harvestResult = { family: measuredFamily, value: output };
        this.showToast(`${output.measuredCount ?? output.glyphs.length}개 문자의 폭을 측정했습니다.`);
      } finally { this.harvestPending = false; if (this.currentTab === 'fonts') this.renderCurrentTab(); }
    }, '문자 폭 측정 중…'));
    container.querySelector('#btnExportGlyphData').addEventListener('click', event => this.performAction(event.currentTarget, async () => {
      const saved = this.harvestResult;
      if (!saved) throw new Error('먼저 문자 폭 측정을 실행해주세요.');
      const measurements = { fontFamily: saved.family, measurementFontSizePx: 24, measurementOnly: true, coverageDetermined: false, totalGlyphs: saved.value.totalGlyphs, measuredCount: saved.value.measuredCount ?? saved.value.glyphs.length, glyphs: saved.value.glyphs.map(({ char, code, width, fallbackWidth }) => ({ char, code, width, fallbackWidth })) };
      const url = URL.createObjectURL(new Blob([JSON.stringify(measurements, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'style-scratcher-glyph-widths.json';
      document.body.append(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      this.showToast('문자 폭 측정 데이터 다운로드를 요청했습니다.');
    }, 'JSON 생성 중…'));
  }

  renderWebFonts(list) {
    const fonts = this.extractedFonts || [];
    if (!fonts.length) { list.innerHTML = `<p class="muted-copy">${this.fontsScanned ? '접근 가능한 웹폰트가 없습니다.' : '스캔하면 폰트 이름과 파일 주소가 표시됩니다.'}</p>`; return; }
    list.innerHTML = fonts.slice(0, 100).map((font, index) => `<div class="font-result"><div class="font-result-meta"><strong title="${escapeHtml(font.family)}">${escapeHtml(font.family)}</strong><small>${escapeHtml(font.weight)} · ${escapeHtml(font.style)} · ${escapeHtml(font.format || 'font')}</small></div>${font.url ? `<div class="font-result-actions"><button class="copy-mini-btn" data-font-copy="${index}" aria-label="${escapeHtml(font.family)} 폰트 URL 복사">URL</button><button class="download-font-btn" data-font-download="${index}" aria-label="${escapeHtml(font.family)} 폰트 다운로드">저장</button></div>` : '<span class="muted-copy">내장 글꼴</span>'}</div>`).join('');
    list.querySelectorAll('[data-font-copy]').forEach(button => button.addEventListener('click', () => this.copyText(fonts[Number(button.dataset.fontCopy)].url, '폰트 URL을 복사했습니다.')));
    list.querySelectorAll('[data-font-download]').forEach(button => button.addEventListener('click', () => this.performAction(button, async () => {
      const font = fonts[Number(button.dataset.fontDownload)];
      const result = await this.fontStudio.downloadFontFile(font.url, font.family, font.weight);
      if (!result?.success) throw new Error('폰트 파일을 다운로드하지 못했습니다.');
      this.showToast(result.method === 'link-fallback' ? '폰트 주소를 열었습니다. 브라우저에서 파일을 저장해주세요.' : `${result.filename} 다운로드를 요청했습니다.`);
    }, '받는 중…')));
  }

  // ==========================================
  // TAB: Live Asset & Content Editor (v3.0.0)
  // ==========================================
  renderAssetsTab(container) {
    const el = this.tweaker.getElement();
    if (!el) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></div>
          <div class="empty-title">선택된 요소가 없습니다</div>
          <div class="empty-desc">웹 페이지의 요소(텍스트, 이미지, SVG 아이콘 등)를 클릭하여 실시간으로 내용을 교체하고 편집하세요.</div>
        </div>
      `;
      return;
    }

    const assetType = typeof AssetEditor !== 'undefined' ? AssetEditor.identifyType(el) : 'container';
    const tag = el.tagName.toLowerCase();
    const textVal = typeof AssetEditor !== 'undefined' ? AssetEditor.getText(el) : (el.innerText || el.textContent || '');
    const imgSrc = typeof AssetEditor !== 'undefined' ? AssetEditor.getImageSrc(el) : '';
    const svgInfo = typeof AssetEditor !== 'undefined' ? AssetEditor.getSvgInfo(el) : null;
    const isEditable = el.isContentEditable;

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span class="section-title" style="margin: 0;">선택한 요소의 콘텐츠</span>
        <span class="prop-tag">&lt;${tag}&gt; [${assetType.toUpperCase()}]</span>
      </div>

      <!-- 1. Text Content Editor -->
      <div class="asset-editor-card" style="margin-bottom: 10px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: var(--ss-ink); display: inline-flex; align-items: center; gap: 5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg> 텍스트 편집</span>
          <button class="btn-secondary" id="toggleContentEditableBtn" style="padding: 2px 8px; font-size: 11px;">
            ${isEditable ? '직접 타이핑 끄기' : '페이지에서 직접 입력'}
          </button>
        </div>
        <textarea class="live-text-area" id="liveTextarea" placeholder="텍스트 내용을 입력하면 즉시 DOM에 반영됩니다...">${escapeHtml(textVal)}</textarea>
        ${isEditable ? `
          <div class="editable-active-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            페이지 본문에서 커서를 두고 직접 타이핑할 수 있습니다.
          </div>
        ` : ''}
      </div>

      <!-- 2. Image & Media Swapper -->
      <div class="asset-editor-card" style="margin-bottom: 10px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: var(--ss-ink); display: inline-flex; align-items: center; gap: 5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> 이미지 교체</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <input type="text" class="asset-input-field" id="imgUrlInput" placeholder="새 이미지 URL 입력 (https://...)" value="${escapeHtml(imgSrc)}">
          <button class="btn-primary" id="applyImgUrlBtn" style="white-space: nowrap; padding: 0 10px; font-size: 11px;">적용</button>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn-secondary" id="randomUnsplashBtn" style="flex: 1; font-size: 11px; justify-content: center;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 3px;"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>샘플 이미지 · Unsplash
          </button>
          <button class="btn-secondary" id="uploadImageBtn" style="flex: 1; font-size: 11px; justify-content: center;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 3px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>로컬 이미지 업로드
          </button>
          <input type="file" id="localFileInput" accept="image/*" style="display: none;">
        </div>
      </div>

      <!-- 3. SVG & Vector Editor -->
      <div class="asset-editor-card">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: var(--ss-ink); display: inline-flex; align-items: center; gap: 5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg> SVG 속성과 원본 코드</span>
          ${svgInfo ? '<span class="prop-tag" style="background:#FFF1F2;color:#E11D48;">SVG 감지됨</span>' : ''}
        </div>
        ${svgInfo ? `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div class="tweak-row">
              <span class="tweak-label">채우기 (Fill)</span>
              <div class="color-picker-group">
                <div class="color-swatch-wrapper" style="background-color: ${/^#[\da-f]{6}$/i.test(svgInfo.fill) ? svgInfo.fill : '#F43F5E'};">
                  <input type="color" class="native-color-picker" id="svgFillPicker" value="${/^#[\da-f]{6}$/i.test(svgInfo.fill) && svgInfo.fill.length === 7 ? svgInfo.fill : '#f43f5e'}">
                </div>
                <input type="text" class="color-hex-input" id="svgFillInput" value="${escapeHtml(svgInfo.fill)}">
              </div>
            </div>

            <div class="tweak-row">
              <span class="tweak-label">윤곽선 (Stroke)</span>
              <div class="color-picker-group">
                <div class="color-swatch-wrapper" style="background-color: ${/^#[\da-f]{6}$/i.test(svgInfo.stroke) ? svgInfo.stroke : 'var(--ss-ink)'};">
                  <input type="color" class="native-color-picker" id="svgStrokePicker" value="${/^#[\da-f]{6}$/i.test(svgInfo.stroke) && svgInfo.stroke.length === 7 ? svgInfo.stroke : '#1e293b'}">
                </div>
                <input type="text" class="color-hex-input" id="svgStrokeInput" value="${escapeHtml(svgInfo.stroke)}">
              </div>
            </div>

            <div class="tweak-row">
              <span class="tweak-label">선 두께 (Stroke Width)</span>
              <div class="tweak-control-group">
                <input type="range" class="range-slider" id="svgStrokeWidthSlider" min="0" max="24" step="0.5" value="${escapeHtml(svgInfo.strokeWidth)}">
                <input type="number" class="num-input" id="svgStrokeWidthInput" min="0" max="24" step="0.5" value="${escapeHtml(svgInfo.strokeWidth)}">
                <span style="font-size: 11px; color: var(--ss-muted);">px</span>
              </div>
            </div>

            <div style="margin-top: 4px;">
              <span class="tweak-label" style="display: block; margin-bottom: 4px;">SVG XML 원본 코드 직접 수정</span>
              <textarea class="live-text-area" id="svgXmlTextarea" style="font-family: ui-monospace, monospace; font-size: 11px; min-height: 80px;">${escapeHtml(svgInfo.xml)}</textarea>
              <button class="btn-primary" id="applySvgXmlBtn" style="width: 100%; margin-top: 6px; justify-content: center; font-size: 11px;">
                SVG 코드 적용
              </button>
            </div>
          </div>
        ` : `
          <div style="font-size: 11px; color: var(--ss-muted); text-align: center; padding: 10px 6px;">
            선택된 요소에 SVG 벡터가 포함되어 있지 않습니다.<br>
            아이콘 또는 SVG 그래픽을 선택하면 fill, stroke, 및 원본 XML을 실시간으로 조작할 수 있습니다.
          </div>
        `}
      </div>
    `;

    // Bind Live Text Input
    const textarea = container.querySelector('#liveTextarea');
    textarea?.addEventListener('input', (e) => {
      if (typeof AssetEditor !== 'undefined') {
        AssetEditor.setText(el, e.target.value);
        this.overlayCanvas?.render();
      }
    });

    // Toggle contentEditable
    container.querySelector('#toggleContentEditableBtn')?.addEventListener('click', () => {
      if (typeof AssetEditor !== 'undefined') {
        const active = AssetEditor.toggleContentEditable(el);
        this.showToast(active ? '요소 직접 타이핑 모드가 활성화되었습니다.' : '직접 타이핑 모드가 비활성화되었습니다.');
        this.renderCurrentTab();
      }
    });

    // Image URL Apply
    const applyImg = () => {
      const url = container.querySelector('#imgUrlInput')?.value.trim();
      if (url && typeof AssetEditor !== 'undefined') {
        AssetEditor.setImageSrc(el, url);
        this.showToast('새 이미지가 적용되었습니다.');
        this.overlayCanvas?.render();
      }
    };
    container.querySelector('#applyImgUrlBtn')?.addEventListener('click', applyImg);
    container.querySelector('#imgUrlInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyImg();
    });

    // Random Unsplash
    container.querySelector('#randomUnsplashBtn')?.addEventListener('click', () => {
      if (typeof AssetEditor !== 'undefined') {
        const url = AssetEditor.setRandomUnsplash(el, 'design');
        const input = container.querySelector('#imgUrlInput');
        if (input) input.value = url;
        this.showToast('Unsplash 샘플 이미지 주소를 적용했습니다.');
        this.overlayCanvas?.render();
      }
    });

    // File Upload
    const fileInput = container.querySelector('#localFileInput');
    container.querySelector('#uploadImageBtn')?.addEventListener('click', () => {
      fileInput?.click();
    });
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file && typeof AssetEditor !== 'undefined') {
        const reader = new FileReader();
        reader.onload = (re) => {
          AssetEditor.setImageSrc(el, re.target.result);
          this.showToast('로컬 이미지가 업로드되어 적용되었습니다.');
          this.overlayCanvas?.render();
        };
        reader.onerror = () => this.showToast('이미지 파일을 읽지 못했습니다. 다른 파일을 선택해주세요.', 'error');
        reader.readAsDataURL(file);
      }
    });

    // SVG Bindings
    if (svgInfo && typeof AssetEditor !== 'undefined') {
      const fillPicker = container.querySelector('#svgFillPicker');
      const fillInput = container.querySelector('#svgFillInput');
      const strokePicker = container.querySelector('#svgStrokePicker');
      const strokeInput = container.querySelector('#svgStrokeInput');
      const strokeWidthSlider = container.querySelector('#svgStrokeWidthSlider');
      const strokeWidthInput = container.querySelector('#svgStrokeWidthInput');
      const applyXmlBtn = container.querySelector('#applySvgXmlBtn');
      const xmlArea = container.querySelector('#svgXmlTextarea');

      fillPicker?.addEventListener('input', (e) => {
        fillInput.value = e.target.value;
        fillPicker.parentElement.style.backgroundColor = e.target.value;
        AssetEditor.setSvgProperty(svgInfo.targetElement, 'fill', e.target.value);
      });
      fillInput?.addEventListener('change', (e) => {
        fillPicker.value = e.target.value;
        fillPicker.parentElement.style.backgroundColor = e.target.value;
        AssetEditor.setSvgProperty(svgInfo.targetElement, 'fill', e.target.value);
      });

      strokePicker?.addEventListener('input', (e) => {
        strokeInput.value = e.target.value;
        strokePicker.parentElement.style.backgroundColor = e.target.value;
        AssetEditor.setSvgProperty(svgInfo.targetElement, 'stroke', e.target.value);
      });
      strokeInput?.addEventListener('change', (e) => {
        strokePicker.value = e.target.value;
        strokePicker.parentElement.style.backgroundColor = e.target.value;
        AssetEditor.setSvgProperty(svgInfo.targetElement, 'stroke', e.target.value);
      });

      strokeWidthSlider?.addEventListener('input', (e) => {
        strokeWidthInput.value = e.target.value;
        AssetEditor.setSvgProperty(svgInfo.targetElement, 'strokeWidth', e.target.value);
      });
      strokeWidthInput?.addEventListener('change', (e) => {
        strokeWidthSlider.value = e.target.value;
        AssetEditor.setSvgProperty(svgInfo.targetElement, 'strokeWidth', e.target.value);
      });

      applyXmlBtn?.addEventListener('click', () => {
        const newXml = xmlArea?.value;
        if (newXml) {
          const replaced = AssetEditor.setSvgXml(svgInfo.svgElement, newXml);
          if (replaced) {
            this.showToast('SVG XML이 성공적으로 업데이트되었습니다.');
            this.tweaker.setElement(replaced);
            this.renderCurrentTab();
          } else {
            this.showToast('SVG XML 파싱에 실패했습니다. 올바른 XML 문법인지 확인하세요.', 'error');
          }
        }
      });
    }
  }

  // ==========================================
  // TAB 2: Interaction & Event Listeners
  // ==========================================
  renderInteractionTab(container) {
    const el = this.tweaker.getElement();
    if (!el) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
          <div class="empty-title">선택된 요소가 없습니다</div>
          <div class="empty-desc">요소를 클릭하면 걸려있는 자바스크립트 이벤트와 :hover, :focus 가상 상태를 제어할 수 있습니다.</div>
        </div>
      `;
      return;
    }

    const isHoverForced = this.interactionDetector ? this.interactionDetector.isPseudoForced(el, 'hover') : false;
    const isActiveForced = this.interactionDetector ? this.interactionDetector.isPseudoForced(el, 'active') : false;
    const isFocusForced = this.interactionDetector ? this.interactionDetector.isPseudoForced(el, 'focus') : false;

    const events = this.interactionDetector ? this.interactionDetector.getEventListeners(el) : [];

    let eventsListHtml = '';
    if (events.length === 0) {
      eventsListHtml = `<div style="text-align: center; padding: 16px; color: var(--ss-muted); font-size: 11px;">감지된 이벤트 리스너가 없습니다.</div>`;
    } else {
      events.forEach(evt => {
        eventsListHtml += `
          <div class="event-item-card">
            <div class="event-header">
              <span class="event-badge">${escapeHtml(evt.type)}</span>
              <span style="font-size: 11px; color: var(--ss-muted);">${evt.isInline ? '인라인 핸들러' : 'addEventListener'}</span>
            </div>
            <pre class="event-code-snippet">${escapeHtml(evt.handler)}</pre>
          </div>
        `;
      });
    }

    container.innerHTML = `
      <div class="section-title">상태 시뮬레이션</div>
      <p class="muted-copy">표식과 이벤트로 상태를 근사합니다. 브라우저의 실제 가상 클래스 강제 적용과는 다릅니다.</p>
      <div class="pseudo-toggle-group">
        <button class="pseudo-btn ${isHoverForced ? 'active' : ''}" data-pseudo="hover">:hover</button>
        <button class="pseudo-btn ${isActiveForced ? 'active' : ''}" data-pseudo="active">:active</button>
        <button class="pseudo-btn ${isFocusForced ? 'active' : ''}" data-pseudo="focus">:focus</button>
        <button class="pseudo-btn" id="clearPseudoBtn">초기화</button>
      </div>

      <div class="section-title" style="margin-top: 14px;">확인 가능한 이벤트 (${events.length}개)</div>
      <div style="display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto;">
        ${eventsListHtml}
      </div><p class="muted-copy">인라인 속성·현재 실행 환경에서 확인한 정보입니다. 전체 리스너 목록은 아닙니다.</p>
    `;

    container.querySelectorAll('[data-pseudo]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.pseudo;
        if (this.interactionDetector) {
          const active = this.interactionDetector.togglePseudo(el, p);
          btn.classList.toggle('active', active);
          btn.setAttribute('aria-pressed', String(active));
        }
      });
    });

    container.querySelector('#clearPseudoBtn').addEventListener('click', () => {
      if (this.interactionDetector) {
        this.interactionDetector.clearForcedPseudos(el);
        this.renderCurrentTab();
      }
    });
  }

  // ==========================================
  // TAB 3: Motion & Animation Inspector
  // ==========================================
  renderMotionTab(container) {
    const el = this.tweaker.getElement();
    const motion = this.motionInspector ? this.motionInspector.inspect(el) : { hasAnimations: false, animations: [], transitions: [] };
    const currentRate = this.motionInspector ? this.motionInspector.playbackRate : 1.0;
    const isPaused = this.motionInspector ? this.motionInspector.isPaused : false;

    // Cubic-Bezier curve SVG
    const defaultCoords = motion.animations[0]?.timing
      ? MotionInspector.parseCubicBezier(motion.animations[0].timing)
      : [0.25, 0.1, 0.25, 1.0];
    const bezierSvg = MotionInspector.renderBezierSvg(defaultCoords, 90);

    let animListHtml = '';
    if (motion.animations.length > 0) {
      motion.animations.forEach(a => {
        animListHtml += `
          <div style="padding: 6px 10px; background: var(--ss-raised); border: 1px solid #E5E7EB; border-radius: 6px; font-size: 11px;">
            <div style="font-weight: 600; color: #E11D48;">@keyframes ${escapeHtml(a.name)}</div>
            <div style="color: var(--ss-muted); font-size: 11px; margin-top: 2px;">
              지속 시간: <strong>${escapeHtml(a.duration)}</strong> • 타이밍: <strong>${escapeHtml(a.timing)}</strong> • 반복: <strong>${escapeHtml(a.iteration)}</strong>
            </div>
          </div>
        `;
      });
    }

    let transListHtml = '';
    if (motion.transitions.length > 0) {
      motion.transitions.forEach(t => {
        transListHtml += `
          <div style="padding: 6px 10px; background: var(--ss-raised); border: 1px solid #E5E7EB; border-radius: 6px; font-size: 11px;">
            <div style="font-weight: 600; color: var(--ss-ink);">${escapeHtml(t.property)}</div>
            <div style="color: var(--ss-muted); font-size: 11px; margin-top: 2px;">
              지속: <strong>${escapeHtml(t.duration)}</strong> • 타이밍: <strong>${escapeHtml(t.timing)}</strong>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = `
      <div class="section-title">페이지 애니메이션 재생 속도</div>
      <div class="motion-card">
        <div class="speed-control-group">
          <button class="speed-chip ${currentRate === 0.1 ? 'active' : ''}" data-speed="0.1">0.1x</button>
          <button class="speed-chip ${currentRate === 0.25 ? 'active' : ''}" data-speed="0.25">0.25x</button>
          <button class="speed-chip ${currentRate === 0.5 ? 'active' : ''}" data-speed="0.5">0.5x</button>
          <button class="speed-chip ${currentRate === 1.0 ? 'active' : ''}" data-speed="1.0">1.0x</button>
          <button class="speed-chip ${currentRate === 2.0 ? 'active' : ''}" data-speed="2.0">2.0x</button>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-secondary ${isPaused ? 'active' : ''}" id="motionPauseBtn" style="flex: 1;">
            ${isPaused ? '▶ 애니메이션 재개' : '⏸ 애니메이션 일시정지'}
          </button>
        </div>
      </div>

      <div class="section-title" style="margin-top: 14px;">이징 곡선</div>
      <div class="bezier-box">
        <div>${bezierSvg}</div>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
          <span style="font-weight: 600; color: var(--ss-ink);">${escapeHtml(motion.animations[0]?.timing || 'ease')}</span>
          <span style="font-family: ui-monospace, monospace; font-size: 11px; color: var(--ss-muted);">
            [${defaultCoords.map(n => n.toFixed(2)).join(', ')}]
          </span>
          <span style="font-size: 11px; color: var(--ss-muted);">Figma/CSS 표준 가속도 곡선</span>
        </div>
      </div>

      <div class="section-title" style="margin-top: 14px;">적용된 애니메이션과 전환</div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${(animListHtml + transListHtml) || '<div style="color: var(--ss-muted); font-size: 11px; text-align: center; padding: 12px;">선택된 요소에 애니메이션이 없습니다.</div>'}
      </div>
    `;

    container.querySelectorAll('[data-speed]').forEach(btn => {
      btn.addEventListener('click', () => {
        const rate = parseFloat(btn.dataset.speed);
        if (this.motionInspector) {
          this.motionInspector.setPlaybackRate(rate);
        }
        this.renderCurrentTab();
      });
    });

    container.querySelector('#motionPauseBtn').addEventListener('click', () => {
      if (this.motionInspector) {
        this.motionInspector.togglePause();
      }
      this.renderCurrentTab();
    });
  }

  // ==========================================
  // TAB 4: Graphics & WebGL / Canvas / SVG
  // ==========================================
  renderGraphicsTab(container) {
    const el = this.tweaker.getElement();
    const graphics = GraphicsInspector.inspect(el);

    if (!graphics) {
      // Find canvases on page to suggest
      const canvases = document.querySelectorAll('canvas');
      const svgs = document.querySelectorAll('svg');

      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.8"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 0-20"></path></svg></div>
          <div class="empty-title">그래픽 요소를 선택하세요</div>
          <div class="empty-desc">
            현재 페이지에 <strong>&lt;canvas&gt; ${canvases.length}개</strong>, <strong>&lt;svg&gt; ${svgs.length}개</strong>가 있습니다.<br>
            캔버스 또는 SVG를 클릭하면 GPU 렌더러와 버퍼 해상도를 분석합니다.
          </div>
        </div>
      `;
      return;
    }

    let detailsHtml = '';

    if (graphics.type === 'canvas') {
      detailsHtml = `
        <div class="telemetry-grid">
          <div class="telemetry-item">
            <span class="telemetry-label">컨텍스트 타입</span>
            <span class="telemetry-val" style="color: #E11D48;">${escapeHtml(graphics.contextType)}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">버퍼 해상도</span>
            <span class="telemetry-val">${escapeHtml(graphics.bufferSize)}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">CSS 렌더링 크기</span>
            <span class="telemetry-val">${escapeHtml(graphics.cssSize)}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">DPR 픽셀 밀도</span>
            <span class="telemetry-val">${escapeHtml(graphics.dprRatio)}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">추정 VRAM 점유율</span>
            <span class="telemetry-val">${escapeHtml(graphics.estimatedVram)}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">레티나 선명도 (Crisp)</span>
            <span class="telemetry-val" style="color: ${graphics.isCrisp ? '#10B981' : '#EF4444'};">
              ${graphics.isCrisp ? '최적 (1:1 매핑)' : '흐릿함 (스케일 왜곡)'}
            </span>
          </div>
        </div>

        ${graphics.webgl ? `
          <div class="section-title" style="margin-top: 14px;">GPU & WebGL 하드웨어 텔레메트리</div>
          <div class="telemetry-grid">
            <div class="telemetry-item" style="grid-column: 1/-1;">
              <span class="telemetry-label">GPU 렌더러</span>
              <span class="telemetry-val" style="font-size: 11px;">${escapeHtml(graphics.webgl.renderer)}</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">GPU 벤더</span>
              <span class="telemetry-val" style="font-size: 11px;">${escapeHtml(graphics.webgl.vendor)}</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">최대 텍스처 크기</span>
              <span class="telemetry-val">${escapeHtml(graphics.webgl.maxTextureSize)} px</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">지원 확장 수</span>
              <span class="telemetry-val">${escapeHtml(graphics.webgl.extensionsCount)}개</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">안티앨리어싱 (AA)</span>
              <span class="telemetry-val">${escapeHtml(graphics.webgl.antialias)}</span>
            </div>
          </div>
        ` : ''}
      `;
    } else if (graphics.type === 'svg') {
      detailsHtml = `
        <div class="telemetry-grid">
          <div class="telemetry-item">
            <span class="telemetry-label">viewBox</span>
            <span class="telemetry-val">${escapeHtml(graphics.viewBox)}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">표시 크기</span>
            <span class="telemetry-val">${escapeHtml(graphics.displaySize)}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">패스 (Paths) 개수</span>
            <span class="telemetry-val">${escapeHtml(graphics.pathsCount)}개</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">기본 도형 (Shapes)</span>
            <span class="telemetry-val">${escapeHtml(graphics.shapesCount)}개</span>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="section-title">그래픽 요소 심층 분석 (&lt;${escapeHtml(graphics.type)}&gt;)</div>
      ${detailsHtml}
    `;
  }

  // ==========================================
  // TAB 5: Tools & Accessibility (v4.0.0)
  // ==========================================
  renderToolsTab(container) {
    const isUnblocked = this.pageController ? this.pageController.isUnblocked : false;
    const isFrozen = this.pageController ? this.pageController.isFrozen : false;
    const isGridOn = this.overlayCanvas ? this.overlayCanvas.isGridVisible : false;
    const isBaseOn = this.overlayCanvas ? this.overlayCanvas.isBaselineVisible : false;
    const isCursorOn = this.precisionCursor ? this.precisionCursor.isActive : false;
    const isTabOrderOn = this.tabOrderVisualizer ? this.tabOrderVisualizer.isActive : false;
    const gridCols = this.overlayCanvas?.gridConfig?.columns || 12;
    const gridGutter = this.overlayCanvas?.gridConfig?.gutter || 20;

    container.innerHTML = `
      <div class="section-title">페이지 도구</div>

      <!-- W3C Tab Order Flow Visualizer (v4.0.0) -->
      <div class="tool-banner" style="margin-bottom: 8px;">
        <div>
          <div class="tool-meta-title">키보드 탐색 순서</div>
          <div class="tool-meta-desc">페이지 일부 요소의 포커스 순서를 표시합니다.</div>
        </div>
        <button class="toggle-switch-btn ${isTabOrderOn ? 'active' : ''}" id="toggleTabOrderBtn">
          ${isTabOrderOn ? 'ON' : 'OFF'}
        </button>
      </div>

      <!-- Precision Crosshair Cursor & Live Coordinates (v4.0.0 2.5px 50% opacity) -->
      <div class="tool-banner" style="margin-bottom: 8px;">
        <div>
          <div class="tool-meta-title">정밀 십자선과 좌표</div>
          <div class="tool-meta-desc">커서 위치와 정렬 기준선을 확인합니다.</div>
        </div>
        <button class="toggle-switch-btn ${isCursorOn ? 'active' : ''}" id="toggleCursorBtn">
          ${isCursorOn ? 'ON' : 'OFF'}
        </button>
      </div>

      <!-- Instant Zoom In / Zoom Out (v4.0.0 Alt++, Alt--, Alt+0) -->
      <div class="tool-banner" style="margin-bottom: 8px;">
        <div style="flex: 1; padding-right: 10px;">
          <div class="tool-meta-title">페이지 확대 / 축소</div>
          <div class="tool-meta-desc">
            마우스 커서 중심 확대/축소 및 원복
          </div>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="btn-secondary" id="btnZoomIn" style="padding: 4px 8px; font-size: 11px;">+ 줌인</button>
          <button class="btn-secondary" id="btnZoomOut" style="padding: 4px 8px; font-size: 11px;">- 줌아웃</button>
          <button class="btn-secondary" id="btnZoomReset" style="padding: 4px 8px; font-size: 11px;">원복</button>
        </div>
      </div>

      <!-- Copy & Right-Click Unblocker -->
      <div class="tool-banner">
        <div>
          <div class="tool-meta-title">선택과 우클릭 허용</div>
          <div class="tool-meta-desc">일부 텍스트 선택·우클릭 제한을 완화합니다.</div>
        </div>
        <button class="toggle-switch-btn ${isUnblocked ? 'active' : ''}" id="toggleUnblockBtn">
          ${isUnblocked ? '해제됨 (Active)' : '해제하기'}
        </button>
      </div>

      <!-- DOM & Script Freeze -->
      <div class="tool-banner" style="margin-top: 8px;">
        <div>
          <div class="tool-meta-title">화면 고정</div>
          <div class="tool-meta-desc">일부 움직임과 마우스 이벤트를 일시 중지합니다.</div>
        </div>
        <button class="toggle-switch-btn ${isFrozen ? 'active freeze' : ''}" id="toggleFreezeBtn">
          ${isFrozen ? '고정됨 (Frozen)' : '화면 멈추기'}
        </button>
      </div>

      <div class="section-title" style="margin-top: 14px;">그리드 설정</div>

      <!-- Responsive Grid Toggle -->
      <div class="tool-banner">
        <div>
          <div class="tool-meta-title">반응형 컬럼 그리드 표시</div>
          <div class="tool-meta-desc">컬럼 간격과 정렬을 확인합니다.</div>
        </div>
        <button class="toggle-switch-btn ${isGridOn ? 'active' : ''}" id="toggleGridToolBtn">
          ${isGridOn ? 'ON' : 'OFF'}
        </button>
      </div>

      <!-- Grid Columns Slider -->
      <div class="tweak-row" style="margin-top: 8px;">
        <span class="tweak-label">컬럼 수 (Columns)</span>
        <div class="tweak-control-group">
          <input type="range" class="range-slider" id="gridColsSlider" min="1" max="24" value="${gridCols}">
          <span id="gridColsVal" style="font-size: 11px; font-weight: 700; min-width: 24px;">${gridCols}</span>
        </div>
      </div>

      <!-- Grid Gutter Slider -->
      <div class="tweak-row">
        <span class="tweak-label">간격 (Gutter)</span>
        <div class="tweak-control-group">
          <input type="range" class="range-slider" id="gridGutterSlider" min="0" max="64" value="${gridGutter}">
          <span id="gridGutterVal" style="font-size: 11px; font-weight: 700; min-width: 32px;">${gridGutter}px</span>
        </div>
      </div>

      <!-- 8px Baseline Grid -->
      <div class="tool-banner" style="margin-top: 8px;">
        <div>
          <div class="tool-meta-title">8px 베이스라인 그리드</div>
          <div class="tool-meta-desc">수직 리듬 및 타이포그래피 정렬 점검</div>
        </div>
        <button class="toggle-switch-btn ${isBaseOn ? 'active' : ''}" id="toggleBaseToolBtn">
          ${isBaseOn ? 'ON' : 'OFF'}
        </button>
      </div>
    `;

    // Tab Order Visualizer Toggle
    container.querySelector('#toggleTabOrderBtn')?.addEventListener('click', () => {
      if (this.tabOrderVisualizer) {
        const active = this.tabOrderVisualizer.toggle();
        this.showToast(active ? 'W3C 탭 순서 흐름이 시각화되었습니다.' : '탭 순서 시각화가 꺼졌습니다.');
        this.renderCurrentTab();
      }
    });

    // Precision Cursor Toggle
    container.querySelector('#toggleCursorBtn')?.addEventListener('click', () => {
      if (this.precisionCursor) {
        const active = this.precisionCursor.toggle();
        this.showToast(active ? '정밀 십자선 커서가 활성화되었습니다.' : '십자선 커서가 비활성화되었습니다.');
        this.renderCurrentTab();
      }
    });

    // Instant Zoom Step Buttons
    container.querySelector('#btnZoomIn')?.addEventListener('click', () => {
      if (this.instantZoom) this.instantZoom.zoomIn();
    });
    container.querySelector('#btnZoomOut')?.addEventListener('click', () => {
      if (this.instantZoom) this.instantZoom.zoomOut();
    });
    container.querySelector('#btnZoomReset')?.addEventListener('click', () => {
      if (this.instantZoom) this.instantZoom.resetZoom();
    });

    container.querySelector('#toggleUnblockBtn').addEventListener('click', () => {
      if (this.pageController) {
        const active = this.pageController.toggleUnblock();
        this.showToast(active ? '복사 및 우클릭 제한이 해제되었습니다.' : '복사 제한이 복구되었습니다.');
        this.renderCurrentTab();
      }
    });

    container.querySelector('#toggleFreezeBtn').addEventListener('click', () => {
      if (this.pageController) {
        const frozen = this.pageController.toggleFreeze();
        this.showToast(frozen ? '화면 인터랙션이 프리징되었습니다.' : '프리징이 해제되었습니다.');
        this.renderCurrentTab();
      }
    });

    container.querySelector('#toggleGridToolBtn').addEventListener('click', () => {
      if (this.overlayCanvas) {
        this.overlayCanvas.toggleGrid();
        this.renderCurrentTab();
      }
    });

    container.querySelector('#toggleBaseToolBtn').addEventListener('click', () => {
      if (this.overlayCanvas) {
        this.overlayCanvas.toggleBaseline();
        this.renderCurrentTab();
      }
    });

    // Custom Grid Sliders
    const colSlider = container.querySelector('#gridColsSlider');
    const colVal = container.querySelector('#gridColsVal');
    colSlider?.addEventListener('input', (e) => {
      colVal.textContent = e.target.value;
      if (this.overlayCanvas) {
        this.overlayCanvas.setGridConfig({ columns: parseInt(e.target.value, 10) });
      }
    });

    const gutterSlider = container.querySelector('#gridGutterSlider');
    const gutterVal = container.querySelector('#gridGutterVal');
    gutterSlider?.addEventListener('input', (e) => {
      gutterVal.textContent = `${e.target.value}px`;
      if (this.overlayCanvas) {
        this.overlayCanvas.setGridConfig({ gutter: parseInt(e.target.value, 10) });
      }
    });
  }

  // ==========================================
  // TAB 6: Code Export & CSS De-minifier (v4.0.0 React & Asset Downloader)
  // ==========================================
  renderCodeTab(container) {
    const el = this.tweaker?.getElement();
    const converted = el && typeof TailwindConverter !== 'undefined' ? TailwindConverter.convert(el) : null;
    const component = el && this.reactExporter ? this.reactExporter.generateComponent(el) : '';
    container.innerHTML = `
      <details class="studio-section" data-section="palette" open><summary><span>사이트 팔레트</span><small>Colors & fonts</small></summary><div class="section-content"><p class="muted-copy">페이지 일부 요소와 접근 가능한 CSS에서 자주 쓰는 색상을 찾습니다.</p><button class="btn-secondary-action" id="scanPaletteBtn">팔레트 스캔</button><div class="palette-results" id="paletteResults" aria-live="polite"></div></div></details>
      ${converted ? `<details class="studio-section" data-section="element-code" open><summary><span>선택한 요소의 코드</span><small>Export</small></summary><div class="section-content"><p class="muted-copy">계산된 스타일을 바탕으로 만든 시작용 코드입니다. 동작과 반응형 규칙은 직접 확인해주세요.</p>
        ${component ? `<div class="code-card"><div class="code-header"><span class="code-lang-tag">React JSX</span><button class="copy-mini-btn" id="copyReactBtn">복사</button></div><pre class="code-content" tabindex="0">${escapeHtml(component.slice(0, 20000))}</pre>${component.length > 20000 ? '<p class="muted-copy">미리보기 일부 표시 · 복사하면 전체 코드를 가져옵니다.</p>' : ''}</div>` : ''}
        <div class="code-card"><div class="code-header"><span class="code-lang-tag">Tailwind CSS</span><button class="copy-mini-btn" id="copyTailwindBtn">복사</button></div><pre class="code-content" tabindex="0">${escapeHtml(converted.tailwind || '추출된 유틸리티가 없습니다.')}</pre></div>
        <div class="code-card"><div class="code-header"><span class="code-lang-tag">CSS</span><button class="copy-mini-btn" id="copyCssBtn">복사</button></div><pre class="code-content" tabindex="0">${escapeHtml(converted.cleanCss)}</pre></div>
        <button class="btn-secondary-action" id="btnDownloadAssets">선택 요소의 에셋 저장</button><p class="muted-copy">선택한 이미지, SVG 또는 배경 이미지 한 개를 저장합니다.</p>
      </div></details>` : '<div class="empty-state"><div class="empty-title">요소를 코드로 가져오세요.</div><p class="empty-desc">페이지의 요소를 선택하면 CSS, Tailwind 클래스와 React JSX를 확인할 수 있습니다.</p></div>'}
      <details class="studio-section" data-section="stylesheets"><summary><span>사이트 스타일시트</span><small>CSS explorer</small></summary><div class="section-content"><button class="btn-secondary-action" id="loadSiteCssBtn" ${this.cssScanPending ? 'disabled' : ''}>${this.cssScanPending ? '스타일시트 확인 중…' : '스타일시트 불러오기'}</button><input type="search" class="site-search-input" id="cssSearchInput" placeholder="클래스, 셀렉터, 속성 검색" aria-label="스타일시트 검색"><div class="stylesheet-results" id="cssSheetsList"><p class="muted-copy">접근 가능한 스타일시트의 CSS를 읽기 좋게 정리합니다.</p></div></div></details>
    `;
    this.renderPalette(container.querySelector('#paletteResults'));
    container.querySelector('#scanPaletteBtn').addEventListener('click', event => this.performAction(event.currentTarget, async () => {
      if (typeof PaletteExtractor === 'undefined') throw new Error('팔레트 도구를 불러올 수 없습니다.');
      await new Promise(resolve => requestAnimationFrame(resolve));
      this.extractedPalette = PaletteExtractor.extract();
      this.renderPalette(container.querySelector('#paletteResults'));
      this.showToast('페이지 색상 샘플을 추출했습니다. 색상을 클릭하면 복사됩니다.');
    }, '색상 확인 중…'));
    container.querySelector('#copyReactBtn')?.addEventListener('click', () => this.copyText(component, 'React JSX를 복사했습니다.'));
    container.querySelector('#copyTailwindBtn')?.addEventListener('click', () => this.copyText(converted.tailwind, 'Tailwind 클래스를 복사했습니다.'));
    container.querySelector('#copyCssBtn')?.addEventListener('click', () => this.copyText(converted.cleanCss, 'CSS를 복사했습니다.'));
    container.querySelector('#btnDownloadAssets')?.addEventListener('click', event => this.performAction(event.currentTarget, async () => {
      if (!this.reactExporter) throw new Error('에셋 내보내기 도구를 불러올 수 없습니다.');
      const asset = await this.reactExporter.downloadAsset(el);
      this.showToast(asset ? `${asset.filename} 다운로드를 요청했습니다.` : '선택 요소에 저장할 이미지, SVG 또는 배경 이미지가 없습니다.', asset ? 'success' : 'info');
    }, '에셋 확인 중…'));
    container.querySelector('#loadSiteCssBtn').addEventListener('click', event => this.performAction(event.currentTarget, async () => {
      if (typeof CssBeautifier === 'undefined') throw new Error('CSS 도구를 불러올 수 없습니다.');
      this.cssScanPending = true;
      const list = container.querySelector('#cssSheetsList');
      list.textContent = '스타일시트를 읽고 있습니다…';
      try {
        this.siteStylesheets = await CssBeautifier.extractSiteStylesheets();
        this.displayFilteredCss(list, '');
      } catch (error) { list.textContent = '스타일시트를 불러오지 못했습니다. 다시 시도해주세요.'; throw error; }
      finally { this.cssScanPending = false; }
    }, '스타일시트 확인 중…'));
    container.querySelector('#cssSearchInput').addEventListener('input', event => this.displayFilteredCss(container.querySelector('#cssSheetsList'), event.target.value.trim()));
    if (this.siteStylesheets?.length) this.displayFilteredCss(container.querySelector('#cssSheetsList'), '');
  }

  renderPalette(container) {
    if (!container) return;
    if (!this.extractedPalette) { container.innerHTML = '<p class="muted-copy">스캔한 색상을 클릭하면 HEX 값을 복사합니다.</p>'; return; }
    const colors = (this.extractedPalette.colors || []).filter(color => /^#[\da-f]{6}$/i.test(color.hex)).slice(0, 32);
    const fonts = (this.extractedPalette.fonts || []).slice(0, 8);
    container.innerHTML = `${colors.length ? `<div class="palette-grid">${colors.map(color => `<button class="palette-item" data-palette-color="${color.hex}" title="${color.hex} 복사" aria-label="${color.hex} 색상 복사"><span class="palette-swatch" style="background:${color.hex}"></span><span class="palette-hex">${color.hex}</span></button>`).join('')}</div>` : '<p class="muted-copy">추출할 수 있는 색상이 없습니다.</p>'}${fonts.length ? `<div class="palette-fonts">${fonts.map(font => `<span class="al-badge">${escapeHtml(font.family)}</span>`).join('')}</div>` : ''}<p class="muted-copy">${this.extractedPalette.sampledElements !== undefined ? `${Number(this.extractedPalette.sampledElements)}개 요소 샘플` : '페이지 일부 요소 샘플'}${this.extractedPalette.truncated ? ' · 검사 범위 제한에 도달했습니다.' : ''} · 프레임과 Shadow DOM은 포함하지 않습니다.</p>`;
    container.querySelectorAll('[data-palette-color]').forEach(button => button.addEventListener('click', () => this.copyText(button.dataset.paletteColor, `${button.dataset.paletteColor} 색상을 복사했습니다.`)));
  }

  displayFilteredCss(container, query) {
    if (!this.siteStylesheets?.length) { container.innerHTML = '<p class="muted-copy">추출된 스타일시트가 없습니다.</p>'; return; }
    const normalized = String(query).toLowerCase();
    let html = '';
    this.siteStylesheets.slice(0, 50).forEach((sheet, index) => {
      let content = String(sheet.css || '');
      if (normalized) {
        const lines = content.split('\n');
        const matches = [];
        let length = 0;
        for (let line = 0; line < lines.length && length < 24000; line++) {
          if (!lines[line].toLowerCase().includes(normalized)) continue;
          const end = Math.min(lines.length, line + 6);
          const snippet = lines.slice(Math.max(0, line - 2), end).join('\n');
          matches.push(snippet); length += snippet.length; line = end - 1;
        }
        content = matches.join('\n\n/* 다음 결과 */\n\n');
        if (!content) return;
      }
      const truncated = content.length > 24000;
      html += `<div class="code-card"><div class="code-header"><span class="code-lang-tag" title="${escapeHtml(sheet.source)}">${escapeHtml(sheet.source)}</span><button class="copy-mini-btn" data-copy-idx="${index}">전체 복사</button></div><pre class="code-content" tabindex="0">${escapeHtml(content.slice(0, 24000))}</pre>${truncated ? '<p class="muted-copy preview-note">미리보기는 일부만 표시됩니다. 전체 복사를 이용하세요.</p>' : ''}</div>`;
    });
    container.innerHTML = html || `<p class="muted-copy">“${escapeHtml(query)}”에 일치하는 결과가 없습니다.</p>`;
    if (this.siteStylesheets.length > 50) container.insertAdjacentHTML('beforeend', '<p class="muted-copy">처음 50개 스타일시트를 표시하고 있습니다.</p>');
    container.querySelectorAll('[data-copy-idx]').forEach(button => button.addEventListener('click', () => this.copyText(this.siteStylesheets[Number(button.dataset.copyIdx)]?.css || '', '스타일시트 전체를 복사했습니다.')));
  }

  // ==========================================
  // TAB 7: Settings & Shortcut Customization (v4.0.0)
  // ==========================================
  renderSettingsTab(container) {
    const shortcuts = this.shortcutManager?.getShortcuts() || { toggleScratcher: 'Alt+S', toggleMode: 'Alt+E', zoomIn: 'Alt+=', zoomOut: 'Alt+-', zoomReset: 'Alt+0', toggleGrid: 'Alt+G', toggleCursor: 'Alt+C', toggleFreeze: 'Alt+F', toggleUnblock: 'Alt+U', toggleTabOrder: 'Alt+T' };
    const labels = { toggleMode: '검사 / 편집 전환', zoomIn: '화면 확대', zoomOut: '화면 축소', zoomReset: '배율 초기화', toggleGrid: '컬럼 그리드', toggleCursor: '정밀 십자선', toggleFreeze: '화면 고정', toggleUnblock: '선택 / 우클릭 허용', toggleTabOrder: '키보드 탐색 순서' };
    const version = this.version || this.updateGuardian?.currentVersion || '4.1.0';
    container.innerHTML = `
      <div class="studio-about"><div class="about-heading"><strong>Style Scratcher</strong><span>v${escapeHtml(version)}</span></div><p>웹을 더 가까이.<br>작은 디테일을 발견하고, 직접 다듬어보세요.</p><span class="about-license">Open source · Apache-2.0</span></div>
      <details class="studio-section" data-section="shortcuts" open><summary><span>페이지 단축키</span><small>Keyboard</small></summary><div class="section-content"><p class="muted-copy">검사기를 켜고 끄는 전역 단축키는 Chrome의 <code>chrome://extensions/shortcuts</code>에서 설정합니다. 기본값은 Alt+S입니다.</p><p class="muted-copy">아래 단축키는 스튜디오 실행 중에 동작합니다. 예: Alt+K · 이 사이트에 저장되며 입력 후 Tab을 누르면 적용합니다.</p><table class="shortcut-table"><thead><tr><th>기능</th><th>단축키</th></tr></thead><tbody>${Object.entries(shortcuts).filter(([action]) => action !== 'toggleScratcher').map(([action, key]) => `<tr><td>${escapeHtml(labels[action] || action)}</td><td><input class="shortcut-input" type="text" data-action="${escapeHtml(action)}" value="${escapeHtml(key)}" aria-label="${escapeHtml(labels[action] || action)} 단축키" spellcheck="false" ${this.shortcutManager ? '' : 'disabled'}></td></tr>`).join('')}</tbody></table><button class="shortcut-reset-btn" id="btnResetShortcuts" ${this.shortcutManager ? '' : 'disabled'}>기본 단축키로 되돌리기</button></div></details>
      <details class="studio-section" data-section="updates"><summary><span>업데이트</span><small>Releases</small></summary><div class="section-content"><div class="update-status-row"><span>현재 v${escapeHtml(version)}</span><span class="update-status-badge" id="settingsUpdateBadge">아직 확인하지 않음</span></div><p class="muted-copy" id="settingsUpdateDetail">GitHub의 공개 릴리즈에서 새 버전을 확인합니다.</p><div class="btn-group"><button class="btn-primary-action" id="btnCheckUpdateNow" ${this.updateGuardian ? '' : 'disabled'}>업데이트 확인</button><button class="btn-secondary-action" id="btnOpenReleasesPage">릴리즈 목록</button></div><div class="update-download" id="settingsUpdateBox" hidden><strong id="settingsNewVerTitle"></strong><span class="dock-badge" id="settingsNewVerBadge"></span><p class="muted-copy" id="settingsNewVerNotes"></p><button class="btn-primary-action" id="btnOneClickUpdate">ZIP 다운로드</button><p class="muted-copy">압축을 해제해 설치 폴더를 교체하고 Chrome 확장 프로그램 화면에서 새로고침하세요.</p></div></div></details>
    `;
    const normalize = value => value.toLowerCase().replace(/\s+/g, '');
    container.querySelectorAll('.shortcut-input').forEach(input => input.addEventListener('change', event => {
      const action = input.dataset.action;
      const value = event.target.value.trim();
      if (!/^(?:(?:alt|ctrl|control|shift|meta|cmd)\+)+[a-z0-9=\-]$/i.test(value.replace(/\s+/g, ''))) {
        input.setAttribute('aria-invalid', 'true'); this.showToast('Alt+K처럼 보조 키와 문자·숫자를 입력해주세요.', 'error'); return;
      }
      const duplicate = Object.entries(this.shortcutManager?.getShortcuts() || {}).some(([other, key]) => other !== action && normalize(key) === normalize(value));
      if (duplicate) { input.setAttribute('aria-invalid', 'true'); this.showToast('다른 기능에서 사용하는 단축키입니다. 다른 조합을 입력해주세요.', 'error'); return; }
      this.shortcutManager?.setShortcut(action, value);
      input.removeAttribute('aria-invalid');
      this.showToast('현재 사이트에 단축키를 저장했습니다.');
    }));
    container.querySelector('#btnResetShortcuts').addEventListener('click', () => { this.shortcutManager?.resetToDefaults(); this.renderCurrentTab(); this.showToast('기본 단축키로 되돌렸습니다.'); });
    container.querySelector('#btnOpenReleasesPage').addEventListener('click', () => window.open('https://github.com/hslcrb/style-scrather/releases', '_blank', 'noopener,noreferrer'));
    const updateState = result => {
      if (!result || result.success === false) throw new Error('릴리즈를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.');
      const badge = container.querySelector('#settingsUpdateBadge');
      const box = container.querySelector('#settingsUpdateBox');
      badge.className = `update-status-badge ${result.hasUpdate ? 'has-update' : 'up-to-date'}`;
      badge.textContent = result.hasUpdate ? '새 버전 있음' : '새 릴리즈 없음';
      box.hidden = !result.hasUpdate;
      if (result.hasUpdate) {
        container.querySelector('#settingsNewVerTitle').textContent = result.releaseTitle || '새 버전';
        container.querySelector('#settingsNewVerBadge').textContent = result.latestDisplayVersion;
        const notes = result.releaseNotes || '릴리즈 목록에서 변경 사항을 확인하세요.';
        container.querySelector('#settingsNewVerNotes').textContent = notes.length > 200 ? `${notes.slice(0, 200)}…` : notes;
        container.querySelector('#btnOneClickUpdate').onclick = event => this.performAction(event.currentTarget, async () => {
          await this.updateGuardian.triggerDownload(result.zipUrl, `style-scrather-${String(result.latestDisplayVersion).replace(/\.+$/, '')}.zip`);
          this.showToast('ZIP 다운로드를 요청했습니다. 설치 후 확장 프로그램을 다시 불러오세요.');
        }, '받는 중…');
      }
    };
    if (this.updateGuardian?.lastResult?.success !== false && this.updateGuardian?.lastResult) updateState(this.updateGuardian.lastResult);
    container.querySelector('#btnCheckUpdateNow').addEventListener('click', event => this.performAction(event.currentTarget, async () => {
      const badge = container.querySelector('#settingsUpdateBadge');
      badge.className = 'update-status-badge'; badge.textContent = '확인 중…';
      try {
        const result = await this.updateGuardian.checkForUpdate(true);
        updateState(result);
        this.showToast(result.hasUpdate ? '새 버전을 확인했습니다.' : '현재 버전보다 새로운 릴리즈가 없습니다.');
      } catch (error) { badge.textContent = '확인하지 못함'; throw error; }
    }, '확인 중…'));
  }

}

if (typeof window !== 'undefined') {
  window.FloatingDock = FloatingDock;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingDock;
}

})();
