// Style Scratcher v4.0.2. - Floating Dock Component (White Minimal Studio UI)

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

    // v4.0.0 Modules
    this.modeManager = options.modeManager || (typeof ModeManager !== 'undefined' ? new ModeManager({ shadowRoot }) : null);
    this.deviceMockup = options.deviceMockup || (typeof DeviceMockup !== 'undefined' ? new DeviceMockup(this.shadowRoot) : null);
    this.fontStudio = options.fontStudio || (typeof FontStudio !== 'undefined' ? FontStudio : null);
    this.tabOrderVisualizer = options.tabOrderVisualizer || (typeof TabOrderVisualizer !== 'undefined' ? new TabOrderVisualizer(this.shadowRoot) : null);
    this.shortcutManager = options.shortcutManager || (typeof ShortcutManager !== 'undefined' ? new ShortcutManager() : null);
    this.reactExporter = options.reactExporter || (typeof ReactExporter !== 'undefined' ? ReactExporter : null);
    this.updateGuardian = options.updateGuardian || (typeof UpdateGuardian !== 'undefined' ? new UpdateGuardian({ currentVersion: '4.0.2' }) : null);

    this.isSafeMode = options.isSafeMode !== undefined ? options.isSafeMode : true;
    this.onToggleSafeMode = options.onToggleSafeMode || (() => {});
    this.onToggleInspector = options.onToggleInspector || (() => {});
    
    this.container = null;
    this.currentTab = 'inspector';
    this.isMinimized = false;
    this.siteStylesheets = [];
    this.extractedPalette = null;
    this.extractedFonts = [];

    this.initDOM();
    this.initDrag();
    this.initUpdateChecker();
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.className = 'scratcher-dock';
    this.container.innerHTML = `
      <!-- Header / Drag Handle -->
      <div class="dock-header" id="dockHeader">
        <div class="dock-brand">
          <div class="dock-logo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="3" y1="9" x2="21" y2="9"></line>
            </svg>
          </div>
          <span class="dock-title">Style Scratcher</span>
          <span class="dock-badge">v4.0.2.</span>
        </div>

        <!-- Mode Switcher (Inspect vs Edit Studio) -->
        <div class="mode-switch-group" id="modeSwitchGroup">
          <button class="mode-switch-btn ${!this.modeManager || this.modeManager.getMode() === 'inspect' ? 'active' : ''}" id="btnModeInspect" title="검사 모드: 거리 측정 및 스타일 분석">검사</button>
          <button class="mode-switch-btn ${this.modeManager && this.modeManager.getMode() === 'edit' ? 'active' : ''}" id="btnModeEdit" title="편집 모드: DOM 순서 이동 및 폰트/텍스트 편집">편집</button>
        </div>

        <div class="dock-controls">
          <button class="icon-btn" id="minimizeBtn" title="최소화/펼치기">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="icon-btn" id="closeDockBtn" title="닫기 (Alt+S)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Auto Update Notification Banner (v4.0.2.) -->
      <div class="dock-update-banner" id="dockUpdateBanner" style="display: none;"></div>

      <!-- Navigation Tabs (v4.0.2. Comprehensive Suite) -->
      <div class="dock-tabs" id="dockTabs">
        <button class="tab-btn active" data-tab="inspector">인스펙터</button>
        <button class="tab-btn" data-tab="mockup">목업</button>
        <button class="tab-btn" data-tab="fonts">폰트</button>
        <button class="tab-btn" data-tab="assets">에셋</button>
        <button class="tab-btn" data-tab="interaction">인터랙션</button>
        <button class="tab-btn" data-tab="motion">모션</button>
        <button class="tab-btn" data-tab="graphics">WebGL</button>
        <button class="tab-btn" data-tab="tools">도구</button>
        <button class="tab-btn" data-tab="code">코드</button>
        <button class="tab-btn" data-tab="settings">설정</button>
      </div>

      <!-- Tab Content Body -->
      <div class="dock-body" id="dockBody">
        <!-- Dynamic Content Injected Here -->
      </div>

      <!-- Toast Container -->
      <div class="scratcher-toast" id="scratcherToast">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span id="toastMsg">클립보드에 복사되었습니다.</span>
      </div>
    `;

    this.shadowRoot.appendChild(this.container);

    // Bind Mode Switcher
    const btnInspect = this.container.querySelector('#btnModeInspect');
    const btnEdit = this.container.querySelector('#btnModeEdit');

    btnInspect?.addEventListener('click', () => {
      btnInspect.classList.add('active');
      btnEdit.classList.remove('active');
      this.modeManager?.setMode('inspect');
      this.showToast('검사 모드 (Inspect Mode)로 전환되었습니다.');
      this.renderCurrentTab();
    });

    btnEdit?.addEventListener('click', () => {
      btnEdit.classList.add('active');
      btnInspect.classList.remove('active');
      this.modeManager?.setMode('edit');
      this.showToast('편집 모드 (Edit Studio Mode)로 전환되었습니다.');
      this.renderCurrentTab();
    });

    // Bind Tab switching
    const tabBtns = this.container.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.switchTab(btn.dataset.tab);
      });
    });

    // Minimize & Close Buttons
    this.container.querySelector('#minimizeBtn').addEventListener('click', () => this.toggleMinimize());
    this.container.querySelector('#closeDockBtn').addEventListener('click', () => this.onToggleInspector());

    // Render Initial Tab
    this.renderCurrentTab();
  }


  showToast(message) {
    const toast = this.container.querySelector('#scratcherToast');
    const msg = this.container.querySelector('#toastMsg');
    msg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    const tabBtns = this.container.querySelectorAll('.tab-btn');
    tabBtns.forEach(b => {
      if (b.dataset.tab === tabName) b.classList.add('active');
      else b.classList.remove('active');
    });
    this.renderCurrentTab();
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    const tabs = this.container.querySelector('#dockTabs');
    const body = this.container.querySelector('#dockBody');
    if (this.isMinimized) {
      tabs.style.display = 'none';
      body.style.display = 'none';
      this.container.classList.add('minimized');
    } else {
      tabs.style.display = 'grid';
      body.style.display = 'flex';
      this.container.classList.remove('minimized');
    }
  }

  
  initUpdateChecker() {
    if (!this.updateGuardian) return;
    setTimeout(async () => {
      try {
        const update = await this.updateGuardian.checkForUpdate();
        if (update && update.hasUpdate) {
          this.showUpdateBanner(update);
        }
      } catch (err) {
        // silent catch
      }
    }, 1500);
  }

  showUpdateBanner(update) {
    const banner = this.container?.querySelector('#dockUpdateBanner');
    if (!banner) return;

    banner.innerHTML = `
      <div class="update-banner-info">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>새 버전 발견: <strong>${update.latestDisplayVersion}</strong></span>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <button class="update-banner-btn" id="btnBannerUpdate">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          원클릭 업데이트
        </button>
        <button class="update-banner-close" id="btnCloseUpdateBanner" title="닫기">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `;
    banner.style.display = 'flex';

    banner.querySelector('#btnBannerUpdate')?.addEventListener('click', () => {
      this.updateGuardian.triggerDownload(update.zipUrl, `style-scrather-${update.latestDisplayVersion.replace(/\.+$/, '')}.zip`);
      this.showToast(`${update.latestDisplayVersion} ZIP 다운로드가 시작되었습니다.`);
    });

    banner.querySelector('#btnCloseUpdateBanner')?.addEventListener('click', () => {
      banner.style.display = 'none';
    });
  }

  initDrag() {
    const header = this.container.querySelector('#dockHeader');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = this.container.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      this.container.style.right = 'auto';
      this.container.style.left = `${initialLeft}px`;
      this.container.style.top = `${initialTop}px`;

      const onMouseMove = (moveEvt) => {
        if (!isDragging) return;
        const dx = moveEvt.clientX - startX;
        const dy = moveEvt.clientY - startY;
        const newLeft = Math.max(10, Math.min(window.innerWidth - this.container.offsetWidth - 10, initialLeft + dx));
        const newTop = Math.max(10, Math.min(window.innerHeight - 50, initialTop + dy));
        this.container.style.left = `${newLeft}px`;
        this.container.style.top = `${newTop}px`;
      };

      const onMouseUp = () => {
        isDragging = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  updateElement() {
    this.renderCurrentTab();
  }

  renderCurrentTab() {
    const body = this.container.querySelector('#dockBody');
    if (!body) return;

    if (this.currentTab === 'inspector') {
      this.renderInspectorTab(body);
    } else if (this.currentTab === 'mockup') {
      this.renderMockupTab(body);
    } else if (this.currentTab === 'fonts') {
      this.renderFontsTab(body);
    } else if (this.currentTab === 'assets') {
      this.renderAssetsTab(body);
    } else if (this.currentTab === 'interaction') {
      this.renderInteractionTab(body);
    } else if (this.currentTab === 'motion') {
      this.renderMotionTab(body);
    } else if (this.currentTab === 'graphics') {
      this.renderGraphicsTab(body);
    } else if (this.currentTab === 'tools') {
      this.renderToolsTab(body);
    } else if (this.currentTab === 'code') {
      this.renderCodeTab(body);
    } else if (this.currentTab === 'settings') {
      this.renderSettingsTab(body);
    }
  }

  // ==========================================
  // TAB 1: Inspector & Units
  // ==========================================
  renderInspectorTab(container) {
    const el = this.tweaker.getElement();
    if (!el) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="empty-title">검사할 요소를 클릭하세요</div>
          <div class="empty-desc">웹 페이지의 아무 요소를 클릭하면 피그마처럼 고정되며 단위별 거리, 곡률, 여백을 실시간으로 튜닝할 수 있습니다.</div>
        </div>
      `;
      return;
    }

    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const tag = el.tagName.toLowerCase();
    const className = (typeof el.className === 'string' && el.className.trim()) ? `.${el.className.trim().split(/\s+/).join('.')}` : '';

    const currentUnit = this.unitConverter ? this.unitConverter.getUnit() : 'px';

    const currentRadius = parseFloat(computed.borderTopLeftRadius) || 0;
    const pt = Math.round(parseFloat(computed.paddingTop) || 0);
    const pr = Math.round(parseFloat(computed.paddingRight) || 0);
    const pb = Math.round(parseFloat(computed.paddingBottom) || 0);
    const pl = Math.round(parseFloat(computed.paddingLeft) || 0);

    const mt = Math.round(parseFloat(computed.marginTop) || 0);
    const mr = Math.round(parseFloat(computed.marginRight) || 0);
    const mb = Math.round(parseFloat(computed.marginBottom) || 0);
    const ml = Math.round(parseFloat(computed.marginLeft) || 0);

    const bgHex = TailwindConverter.rgbToHex(computed.backgroundColor);
    const colorHex = TailwindConverter.rgbToHex(computed.color);
    const borderHex = TailwindConverter.rgbToHex(computed.borderTopColor);
    const fontSize = Math.round(parseFloat(computed.fontSize) || 16);

    // Format dimensions in current unit
    let dimStr = `${Math.round(rect.width)} × ${Math.round(rect.height)} px`;
    if (this.unitConverter && currentUnit !== 'px') {
      const wConv = this.unitConverter.convert(rect.width, currentUnit, { element: el });
      const hConv = this.unitConverter.convert(rect.height, currentUnit, { element: el, isVertical: true });
      dimStr = `${wConv.formatted} × ${hConv.formatted}`;
    }

    // Calculate WCAG contrast
    const contrast = typeof ColorSuite !== 'undefined' ? ColorSuite.getContrastRatio(colorHex, bgHex) : { ratio: 4.5, score: 'AA', passesAA: true };
    const presets = typeof ColorSuite !== 'undefined' ? ColorSuite.getPresets() : [];

    // Figma AutoLayout Sizing Telemetry (v4.0.0)
    const autolayout = typeof FontStudio !== 'undefined' && FontStudio.detectAutolayoutSizing
      ? FontStudio.detectAutolayoutSizing(el)
      : { widthSizing: 'Fixed', heightSizing: 'Fixed', widthBadge: 'Fixed', heightBadge: 'Fixed' };
    const isEditMode = this.modeManager && this.modeManager.getMode() === 'edit';
    const selectedCount = this.modeManager ? this.modeManager.getSelectedElements().length : 1;

    container.innerHTML = `
      <!-- Safe Mode (Click Invalidation) Toggle Banner -->
      <div class="safe-mode-banner ${this.isSafeMode ? '' : 'disabled'}">
        <div>
          <div class="safe-mode-title">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            안전 검사 모드 (클릭 무효화)
          </div>
          <div class="safe-mode-desc">링크/버튼 클릭 시 페이지 이동을 차단하고 요소만 선택합니다.</div>
        </div>
        <input type="checkbox" id="safeModeCheckbox" ${this.isSafeMode ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px;">
      </div>

      <!-- Unit Selector Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
        <span class="section-title" style="margin: 0;">측정 단위 (Unit)</span>
        <span style="font-size: 10px; color: #9CA3AF;">기준: 1rem = ${this.unitConverter?.baseFontSize || 16}px</span>
      </div>
      <div class="unit-selector-bar" id="unitSelectorBar">
        <button class="unit-chip ${currentUnit === 'px' ? 'active' : ''}" data-unit="px">px</button>
        <button class="unit-chip ${currentUnit === 'rem' ? 'active' : ''}" data-unit="rem">rem</button>
        <button class="unit-chip ${currentUnit === 'em' ? 'active' : ''}" data-unit="em">em</button>
        <button class="unit-chip ${currentUnit === '%' ? 'active' : ''}" data-unit="%">%</button>
        <button class="unit-chip ${currentUnit === 'vw' ? 'active' : ''}" data-unit="vw">vw</button>
        <button class="unit-chip ${currentUnit === 'vh' ? 'active' : ''}" data-unit="vh">vh</button>
        <button class="unit-chip ${currentUnit === 'pt' ? 'active' : ''}" data-unit="pt">pt</button>
      </div>

      <!-- Element Meta Banner -->
      <div class="element-meta-card">
        <div class="meta-header">
          <span class="element-tag-pill">&lt;${tag}&gt;</span>
          <span class="element-dim-badge">${dimStr}</span>
        </div>
        ${className ? `<div class="element-classes" title="${className}">${className}</div>` : ''}

        <!-- Figma AutoLayout Hug / Fill / Fixed Telemetry Badges (v4.0.0) -->
        <div class="autolayout-badge-container">
          <span class="al-badge al-badge-${autolayout.widthSizing.toLowerCase()}" title="Figma 너비 정책">너비: ${autolayout.widthBadge}</span>
          <span class="al-badge al-badge-${autolayout.heightSizing.toLowerCase()}" title="Figma 높이 정책">높이: ${autolayout.heightBadge}</span>
        </div>

        ${isEditMode ? `
        <!-- Edit Studio Action Bar (v4.0.0) -->
        <div class="edit-studio-bar" style="margin-top: 8px;">
          <span style="font-size: 10px; font-weight: 700; color: #E11D48;">편집 모드 (${selectedCount}개 선택)</span>
          <div class="edit-action-btn-group">
            <button class="edit-action-btn" id="btnDomMoveUp" title="DOM 상위로 이동">▲ 위로</button>
            <button class="edit-action-btn" id="btnDomMoveDown" title="DOM 하위로 이동">▼ 아래로</button>
            <button class="edit-action-btn" id="btnDomDuplicate" title="요소 복제">복제</button>
            <button class="edit-action-btn" id="btnDomDelete" style="color: #EF4444;" title="요소 삭제">삭제</button>
          </div>
        </div>
        ` : ''}

        <div class="btn-group" style="margin-top: 6px;">
          <button class="btn-secondary" id="unlockBtn">선택 해제 (Esc)</button>
          <button class="btn-secondary" id="resetStylesBtn">스타일 초기화</button>
        </div>
      </div>

      <!-- 1. Border Radius Tweaker -->
      <div class="tweak-section">
        <div class="section-title">
          <span>모서리 둥글기 (Border Radius)</span>
          <button class="section-reset-btn" id="toggleCornerDetails">4모서리 개별 조절</button>
        </div>
        <div class="tweak-row">
          <span class="tweak-label">전체 곡률</span>
          <div class="tweak-control-group">
            <input type="range" class="range-slider" id="radiusSlider" min="0" max="64" value="${currentRadius}">
            <input type="number" class="num-input" id="radiusInput" min="0" max="100" value="${currentRadius}">
            <span style="font-size: 10px; color: #6B7280;">px</span>
          </div>
        </div>

        <div class="corner-radius-grid" id="cornerDetailsGrid" style="display: none;">
          <div class="corner-item">
            <span>좌상 (TL)</span>
            <input type="number" class="num-input" id="tlRadiusInput" min="0" value="${Math.round(parseFloat(computed.borderTopLeftRadius) || 0)}">
          </div>
          <div class="corner-item">
            <span>우상 (TR)</span>
            <input type="number" class="num-input" id="trRadiusInput" min="0" value="${Math.round(parseFloat(computed.borderTopRightRadius) || 0)}">
          </div>
          <div class="corner-item">
            <span>좌하 (BL)</span>
            <input type="number" class="num-input" id="blRadiusInput" min="0" value="${Math.round(parseFloat(computed.borderBottomLeftRadius) || 0)}">
          </div>
          <div class="corner-item">
            <span>우하 (BR)</span>
            <input type="number" class="num-input" id="brRadiusInput" min="0" value="${Math.round(parseFloat(computed.borderBottomRightRadius) || 0)}">
          </div>
        </div>
      </div>

      <!-- 2. Box Model (Margin & Padding) -->
      <div class="tweak-section">
        <div class="section-title">
          <span>박스 모델 (Margin & Padding)</span>
        </div>
        <div class="box-model-diagram">
          <div class="bm-margin">
            <span class="bm-label">Margin</span>
            <span class="bm-val bm-margin-t">${mt}</span>
            <span class="bm-val bm-margin-b">${mb}</span>
            <span class="bm-val bm-margin-l">${ml}</span>
            <span class="bm-val bm-margin-r">${mr}</span>

            <div class="bm-padding">
              <span class="bm-label">Padding</span>
              <span class="bm-val bm-padding-t">${pt}</span>
              <span class="bm-val bm-padding-b">${pb}</span>
              <span class="bm-val bm-padding-l">${pl}</span>
              <span class="bm-val bm-padding-r">${pr}</span>

              <div class="bm-content">
                ${dimStr}
              </div>
            </div>
          </div>
        </div>

        <div class="tweak-row" style="margin-top: 4px;">
          <span class="tweak-label">Padding 조절</span>
          <div class="tweak-control-group">
            <input type="range" class="range-slider" id="paddingSlider" min="0" max="64" value="${pt}">
            <input type="number" class="num-input" id="paddingInput" min="0" value="${pt}">
            <span style="font-size: 10px; color: #6B7280;">px</span>
          </div>
        </div>
      </div>

      <!-- 3. Sensory Colors Tweaker -->
      <div class="color-suite-box">
        <div class="color-action-bar">
          <span class="section-title" style="margin: 0;">감각적 컬러 스위트</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="contrast-pill ${contrast.passesAA ? 'pass' : 'fail'}" title="명도 대비율">
              대비 ${contrast.ratio}:1 [${contrast.score}]
            </span>
            <button class="eyedropper-btn" id="eyeDropperBtn">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 3px;"><path d="M2 22s5-1 8-4l9-9a2.828 2.828 0 0 0-4-4l-9 9c-3 3-4 8-4 8z"></path><path d="M14.5 5.5l4 4"></path></svg>스포이트
            </button>
          </div>
        </div>

        <!-- Presets Row -->
        <div class="color-presets-row" id="colorPresetsRow">
          ${presets.map(p => `<div class="preset-color-dot" style="background-color: ${p};" data-color="${p}" title="${p}"></div>`).join('')}
        </div>

        <div class="tweak-row">
          <span class="tweak-label">배경색 (Background)</span>
          <div class="color-picker-group">
            <div class="color-swatch-wrapper" style="background-color: ${bgHex};">
              <input type="color" class="native-color-picker" id="bgColorPicker" value="${bgHex.startsWith('#') && bgHex.length === 7 ? bgHex : '#ffffff'}">
            </div>
            <input type="text" class="color-hex-input" id="bgHexInput" value="${bgHex}">
          </div>
        </div>

        <div class="tweak-row">
          <span class="tweak-label">텍스트색 (Text Color)</span>
          <div class="color-picker-group">
            <div class="color-swatch-wrapper" style="background-color: ${colorHex};">
              <input type="color" class="native-color-picker" id="textColorPicker" value="${colorHex.startsWith('#') && colorHex.length === 7 ? colorHex : '#000000'}">
            </div>
            <input type="text" class="color-hex-input" id="textHexInput" value="${colorHex}">
          </div>
        </div>
      </div>
    `;

    // Safe Mode Checkbox Event
    const safeModeCheckbox = container.querySelector('#safeModeCheckbox');
    safeModeCheckbox.addEventListener('change', (e) => {
      this.isSafeMode = e.target.checked;
      this.onToggleSafeMode(this.isSafeMode);
      this.showToast(this.isSafeMode ? '안전 검사 모드 활성화 (링크 이동 차단)' : '안전 검사 모드 해제');
      this.renderInspectorTab(container);
    });

    // EyeDropper API Event
    const eyeBtn = container.querySelector('#eyeDropperBtn');
    eyeBtn.addEventListener('click', async () => {
      if (typeof ColorSuite !== 'undefined') {
        const hex = await ColorSuite.pickColorWithEyeDropper();
        if (hex) {
          this.tweaker.setColor('background', hex);
          this.showToast(`추출된 색상 ${hex} 적용 완료`);
          this.renderInspectorTab(container);
        }
      }
    });

    // Preset Color Dots Event
    container.querySelectorAll('.preset-color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const c = dot.dataset.color;
        this.tweaker.setColor('background', c);
        this.renderInspectorTab(container);
      });
    });

    // Bind Unit Selector Chips
    container.querySelectorAll('.unit-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const u = chip.dataset.unit;
        if (this.unitConverter) {
          this.unitConverter.setUnit(u);
        }
        if (this.overlayCanvas) {
          this.overlayCanvas.setUnit(u);
        }
        this.renderInspectorTab(container);
      });
    });

    // Bind Reset & Unlock
    container.querySelector('#unlockBtn').addEventListener('click', () => {
      this.overlayCanvas.setSelectedElement(null);
      this.tweaker.setElement(null);
    });

    container.querySelector('#resetStylesBtn').addEventListener('click', () => {
      this.tweaker.resetCurrentElement();
      this.overlayCanvas.render();
      this.showToast('스타일이 복원되었습니다.');
    });

    // Edit Studio DOM Actions (v4.0.0)
    container.querySelector('#btnDomMoveUp')?.addEventListener('click', () => {
      if (this.modeManager && this.modeManager.moveUp(el)) {
        this.showToast('요소를 위로 이동했습니다.');
        this.overlayCanvas?.render();
      }
    });

    container.querySelector('#btnDomMoveDown')?.addEventListener('click', () => {
      if (this.modeManager && this.modeManager.moveDown(el)) {
        this.showToast('요소를 아래로 이동했습니다.');
        this.overlayCanvas?.render();
      }
    });

    container.querySelector('#btnDomDuplicate')?.addEventListener('click', () => {
      if (this.modeManager) {
        const dup = this.modeManager.duplicateElement(el);
        if (dup) {
          this.showToast('요소가 복제되었습니다.');
          this.tweaker.setElement(dup);
          this.renderCurrentTab();
        }
      }
    });

    container.querySelector('#btnDomDelete')?.addEventListener('click', () => {
      if (this.modeManager && this.modeManager.removeElement(el)) {
        this.showToast('요소가 삭제되었습니다.');
        this.tweaker.setElement(null);
        this.renderCurrentTab();
      }
    });

    // Radius Slider & Input
    const rSlider = container.querySelector('#radiusSlider');
    const rInput = container.querySelector('#radiusInput');
    const updateRadius = (val) => {
      rSlider.value = val;
      rInput.value = val;
      this.tweaker.setUnifiedRadius(val);
      this.overlayCanvas.render();
    };
    rSlider.addEventListener('input', (e) => updateRadius(e.target.value));
    rInput.addEventListener('change', (e) => updateRadius(e.target.value));

    // Corner toggle
    const cornerToggleBtn = container.querySelector('#toggleCornerDetails');
    const cornerGrid = container.querySelector('#cornerDetailsGrid');
    cornerToggleBtn.addEventListener('click', () => {
      const isHidden = cornerGrid.style.display === 'none';
      cornerGrid.style.display = isHidden ? 'grid' : 'none';
      cornerToggleBtn.textContent = isHidden ? '간편 조절' : '4모서리 개별 조절';
    });

    ['tl', 'tr', 'bl', 'br'].forEach(corner => {
      const input = container.querySelector(`#${corner}RadiusInput`);
      if (input) {
        input.addEventListener('input', (e) => {
          this.tweaker.setCornerRadius(corner, parseFloat(e.target.value) || 0);
          this.overlayCanvas.render();
        });
      }
    });

    // Padding Slider & Input
    const pSlider = container.querySelector('#paddingSlider');
    const pInput = container.querySelector('#paddingInput');
    pSlider.addEventListener('input', (e) => {
      pInput.value = e.target.value;
      this.tweaker.setPadding('all', e.target.value);
      this.overlayCanvas.render();
    });
    pInput.addEventListener('change', (e) => {
      pSlider.value = e.target.value;
      this.tweaker.setPadding('all', e.target.value);
      this.overlayCanvas.render();
    });

    // Colors
    const bindColor = (pickerId, inputId, type) => {
      const picker = container.querySelector(`#${pickerId}`);
      const input = container.querySelector(`#${inputId}`);
      picker.addEventListener('input', (e) => {
        input.value = e.target.value;
        picker.parentElement.style.backgroundColor = e.target.value;
        this.tweaker.setColor(type, e.target.value);
      });
      input.addEventListener('change', (e) => {
        picker.value = e.target.value;
        picker.parentElement.style.backgroundColor = e.target.value;
        this.tweaker.setColor(type, e.target.value);
      });
    };
    bindColor('bgColorPicker', 'bgHexInput', 'background');
    bindColor('textColorPicker', 'textHexInput', 'text');
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
          <span style="font-size: 10px; color: #64748B;">비율 유지 샌드박스</span>
        </div>

        <div class="tool-banner">
          <div>
            <div class="tool-meta-title">목업 시뮬레이터 창</div>
            <div class="tool-meta-desc">웹사이트 화면을 디바이스 프레임으로 래핑</div>
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
            <span class="preset-dim">820 × 1180 (4:3)</span>
          </button>
          <button class="preset-btn ${currentPreset === 'iphone' ? 'active' : ''}" data-preset="iphone">
            <span class="preset-name">iPhone 16 Pro</span>
            <span class="preset-dim">393 × 852 (19.5:9)</span>
          </button>
          <button class="preset-btn ${currentPreset === 'galaxy' ? 'active' : ''}" data-preset="galaxy">
            <span class="preset-name">Galaxy S25 Ultra</span>
            <span class="preset-dim">412 × 915 (20:9)</span>
          </button>
        </div>

        <div class="mockup-controls-bar">
          <button class="btn-secondary" id="btnMockupRotate" style="padding: 4px 8px; font-size: 11px;">
            ${isLandscape ? '가로 모드' : '세로 모드'}
          </button>
          <span style="font-size: 10.5px; font-weight: 600; color: #475569;">배율:</span>
          <input type="range" class="mockup-scale-slider" id="mockupScaleInput" min="0.25" max="1.2" step="0.05" value="${currentScale / 100}">
          <span id="mockupScaleLabel" style="font-size: 11px; font-weight: 700; min-width: 36px; text-align: right;">${currentScale}%</span>
        </div>
      </div>
    `;

    container.querySelector('#btnToggleMockup')?.addEventListener('click', () => {
      if (this.deviceMockup) {
        const active = this.deviceMockup.toggle();
        this.showToast(active ? '디바이스 목업 시뮬레이터가 열렸습니다.' : '시뮬레이터가 닫혔습니다.');
        this.renderMockupTab(container);
      }
    });

    container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (this.deviceMockup) {
          this.deviceMockup.setPreset(preset);
          if (!this.deviceMockup.isActive) this.deviceMockup.toggle(true);
          this.showToast(`${preset.toUpperCase()} 프리셋이 적용되었습니다.`);
          this.renderMockupTab(container);
        }
      });
    });

    container.querySelector('#btnMockupRotate')?.addEventListener('click', () => {
      if (this.deviceMockup) {
        this.deviceMockup.toggleOrientation();
        this.renderMockupTab(container);
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
    const el = this.tweaker.getElement();
    const computed = el ? window.getComputedStyle(el) : null;
    const currentFamily = computed ? computed.fontFamily.replace(/['"]/g, '').split(',')[0].trim() : 'Inter';
    const currentSize = computed ? Math.round(parseFloat(computed.fontSize) || 16) : 16;
    const currentWeight = computed ? computed.fontWeight : '400';
    const textContent = el ? (el.innerText || el.textContent || '').trim() : '';

    container.innerHTML = `
      <div class="font-studio-section">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span class="section-title" style="margin: 0;">피그마 폰트 스튜디오</span>
          <span style="font-size: 10px; color: #E11D48; font-weight: 600;">Google Fonts 실시간 주입</span>
        </div>

        ${el ? `
          <!-- 1. Font Family Picker -->
          <div class="tweak-row">
            <span class="tweak-label">폰트 패밀리</span>
            <select class="font-select-field" id="fontFamilySelect">
              ${(FontStudio?.CURATED_FONTS || []).map(f => `
                <option value="${f.name}" ${currentFamily.toLowerCase().includes(f.name.toLowerCase()) ? 'selected' : ''}>${f.name} (${f.google ? 'Google' : 'System'})</option>
              `).join('')}
            </select>
          </div>

          <!-- 2. Font Properties Grid -->
          <div class="font-props-grid">
            <div class="font-prop-card">
              <span class="tweak-label">크기 (Size)</span>
              <div class="tweak-control-group">
                <input type="number" class="num-input" id="fontSizeInput" min="8" max="120" value="${currentSize}">
                <span style="font-size: 10px; color: #64748B;">px</span>
              </div>
            </div>
            <div class="font-prop-card">
              <span class="tweak-label">굵기 (Weight)</span>
              <select class="num-input" id="fontWeightSelect" style="width: 100%;">
                <option value="300" ${currentWeight === '300' ? 'selected' : ''}>300 Light</option>
                <option value="400" ${currentWeight === '400' ? 'selected' : ''}>400 Regular</option>
                <option value="500" ${currentWeight === '500' ? 'selected' : ''}>500 Medium</option>
                <option value="600" ${currentWeight === '600' ? 'selected' : ''}>600 SemiBold</option>
                <option value="700" ${currentWeight === '700' ? 'selected' : ''}>700 Bold</option>
                <option value="800" ${currentWeight === '800' ? 'selected' : ''}>800 ExtraBold</option>
              </select>
            </div>
          </div>

          <!-- 3. Direct Text Content Live Editor -->
          <div class="tweak-section">
            <div class="section-title">
              <span>내용 직접 편집 (Text Content)</span>
            </div>
            <textarea class="live-text-area" id="fontStudioTextArea" placeholder="선택된 요소의 텍스트를 실시간으로 변경하세요...">${textContent}</textarea>
          </div>

          <!-- 4. Text Outlining (SVG Vector Conversion) -->
          <button class="btn-secondary-action" id="btnCreateOutlines" style="margin-top: 4px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            텍스트 아웃라인화 (Create Outlines) SVG 복사
          </button>
        ` : `
          <div class="empty-state">
            <div class="empty-title">텍스트 요소를 선택하세요</div>
            <div class="empty-desc">웹페이지의 타이틀, 본문, 버튼 등을 선택하면 피그마처럼 즉시 폰트를 교체하고 텍스트 내용을 바꿀 수 있습니다.</div>
          </div>
        `}

        <div class="hud-divider" style="margin: 8px 0;"></div>

        <!-- 5. WebFont Extractor -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span class="section-title" style="margin: 0;">웹폰트 (@font-face) 추출</span>
          <button class="section-reset-btn" id="btnExtractWebFonts">폰트 스캔</button>
        </div>
        <div id="webFontsList" style="display: flex; flex-direction: column; gap: 6px; max-height: 140px; overflow-y: auto;">
          <div style="font-size: 10px; color: #94A3B8; text-align: center; padding: 8px;">'폰트 스캔'을 누르면 페이지에 로드된 @font-face 소스를 추출합니다.</div>
        </div>

        <!-- 6. Parallel Non-Blocking Glyph Harvester -->
        <div class="glyph-harvest-box">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: 700; color: #1E293B;">병렬 백그라운드 글리프 수확기</span>
            <span class="dock-badge" id="glyphStatusBadge">대기 중</span>
          </div>
          <div style="font-size: 10px; color: #64748B;">글리프 제한 웹폰트 시 한글·라틴·특수문자 전 음절을 렉 없이 병렬 스캔</div>
          <div class="glyph-progress-bar-container">
            <div class="glyph-progress-bar-fill" id="glyphProgressBar"></div>
          </div>
          <button class="btn-primary-action" id="btnStartHarvest">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            병렬 글리프 수확 시작 (Non-blocking)
          </button>
        </div>
      </div>
    `;

    // Event Bindings
    if (el) {
      container.querySelector('#fontFamilySelect')?.addEventListener('change', (e) => {
        const font = e.target.value;
        if (typeof FontStudio !== 'undefined') {
          FontStudio.applyFont(el, font);
          this.overlayCanvas?.render();
          this.showToast(`'${font}' 폰트가 적용되었습니다.`);
        }
      });

      container.querySelector('#fontSizeInput')?.addEventListener('change', (e) => {
        el.style.fontSize = `${e.target.value}px`;
        this.overlayCanvas?.render();
      });

      container.querySelector('#fontWeightSelect')?.addEventListener('change', (e) => {
        el.style.fontWeight = e.target.value;
        this.overlayCanvas?.render();
      });

      container.querySelector('#fontStudioTextArea')?.addEventListener('input', (e) => {
        el.innerText = e.target.value;
        this.overlayCanvas?.render();
      });

      container.querySelector('#btnCreateOutlines')?.addEventListener('click', () => {
        if (typeof FontStudio !== 'undefined') {
          const out = FontStudio.createTextOutlines(el);
          if (out && out.svg) {
            navigator.clipboard.writeText(out.svg).then(() => {
              this.showToast('벡터 아웃라인 SVG가 클립보드에 복사되었습니다.');
            });
          }
        }
      });
    }

    container.querySelector('#btnExtractWebFonts')?.addEventListener('click', async () => {
      const list = container.querySelector('#webFontsList');
      list.innerHTML = `<div style="text-align: center; color: #E11D48; font-size: 10px; padding: 6px;">웹폰트 스캔 중...</div>`;
      if (typeof FontStudio !== 'undefined') {
        const fonts = await FontStudio.extractWebFonts();
        if (!fonts || fonts.length === 0) {
          list.innerHTML = `<div style="text-align: center; color: #94A3B8; font-size: 10px; padding: 6px;">감지된 외부 @font-face 웹폰트가 없습니다.</div>`;
          return;
        }
        list.innerHTML = fonts.map((f, i) => `
          <div style="display: flex; align-items: center; justify-content: space-between; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; padding: 5px 8px;">
            <div>
              <span style="font-size: 11px; font-weight: 700; color: #0F172A;">${f.family}</span>
              <span style="font-size: 9.5px; color: #64748B;">(${f.weight} / ${f.style})</span>
            </div>
            ${f.url ? `<button class="copy-mini-btn" data-url="${f.url}" style="font-size: 9.5px;">URL 복사</button>` : '<span style="font-size: 9px; color: #10B981;">내장됨</span>'}
          </div>
        `).join('');

        list.querySelectorAll('[data-url]').forEach(btn => {
          btn.addEventListener('click', () => {
            navigator.clipboard.writeText(btn.dataset.url).then(() => this.showToast('폰트 URL이 복사되었습니다.'));
          });
        });
      }
    });

    container.querySelector('#btnStartHarvest')?.addEventListener('click', async () => {
      const progressBar = container.querySelector('#glyphProgressBar');
      const statusBadge = container.querySelector('#glyphStatusBadge');
      const btnHarvest = container.querySelector('#btnStartHarvest');
      btnHarvest.disabled = true;
      btnHarvest.textContent = '수확 진행 중...';

      if (typeof FontStudio !== 'undefined') {
        await FontStudio.harvestGlyphs(currentFamily, (percent, done, total) => {
          progressBar.style.width = `${percent}%`;
          statusBadge.textContent = `${percent}% (${done}/${total})`;
        });
        statusBadge.textContent = '수확 완료';
        btnHarvest.disabled = false;
        btnHarvest.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 병렬 글리프 수확 완료 (재실행 가능)';
        this.showToast('모든 글리프 음절 병렬 조사가 완료되었습니다.');
      }
    });
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
        <span class="section-title" style="margin: 0;">실시간 에셋 & 콘텐츠 편집</span>
        <span class="prop-tag">&lt;${tag}&gt; [${assetType.toUpperCase()}]</span>
      </div>

      <!-- 1. Text Content Editor -->
      <div class="asset-editor-card" style="margin-bottom: 10px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #1E293B; display: inline-flex; align-items: center; gap: 5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg> 텍스트 내용 실시간 수정</span>
          <button class="btn-secondary" id="toggleContentEditableBtn" style="padding: 2px 8px; font-size: 10px;">
            ${isEditable ? '직접 타이핑 끄기' : '요소 직접 타이핑 (contentEditable)'}
          </button>
        </div>
        <textarea class="live-text-area" id="liveTextarea" placeholder="텍스트 내용을 입력하면 즉시 DOM에 반영됩니다...">${textVal}</textarea>
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
          <span style="font-size: 11px; font-weight: 700; color: #1E293B; display: inline-flex; align-items: center; gap: 5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> 이미지 소스 교체 (Image Swapper)</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <input type="text" class="asset-input-field" id="imgUrlInput" placeholder="새 이미지 URL 입력 (https://...)" value="${imgSrc}">
          <button class="btn-primary" id="applyImgUrlBtn" style="white-space: nowrap; padding: 0 10px; font-size: 11px;">적용</button>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn-secondary" id="randomUnsplashBtn" style="flex: 1; font-size: 10px; justify-content: center;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 3px;"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>고화질 Unsplash 랜덤
          </button>
          <button class="btn-secondary" id="uploadImageBtn" style="flex: 1; font-size: 10px; justify-content: center;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 3px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>로컬 이미지 업로드
          </button>
          <input type="file" id="localFileInput" accept="image/*" style="display: none;">
        </div>
      </div>

      <!-- 3. SVG & Vector Editor -->
      <div class="asset-editor-card">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #1E293B; display: inline-flex; align-items: center; gap: 5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg> SVG 벡터 속성 & XML 코드 조작</span>
          ${svgInfo ? '<span class="prop-tag" style="background:#FFF1F2;color:#E11D48;">SVG 감지됨</span>' : ''}
        </div>
        ${svgInfo ? `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div class="tweak-row">
              <span class="tweak-label">채우기 (Fill)</span>
              <div class="color-picker-group">
                <div class="color-swatch-wrapper" style="background-color: ${svgInfo.fill.startsWith('#') ? svgInfo.fill : '#F43F5E'};">
                  <input type="color" class="native-color-picker" id="svgFillPicker" value="${svgInfo.fill.startsWith('#') && svgInfo.fill.length === 7 ? svgInfo.fill : '#f43f5e'}">
                </div>
                <input type="text" class="color-hex-input" id="svgFillInput" value="${svgInfo.fill}">
              </div>
            </div>

            <div class="tweak-row">
              <span class="tweak-label">윤곽선 (Stroke)</span>
              <div class="color-picker-group">
                <div class="color-swatch-wrapper" style="background-color: ${svgInfo.stroke.startsWith('#') ? svgInfo.stroke : '#1E293B'};">
                  <input type="color" class="native-color-picker" id="svgStrokePicker" value="${svgInfo.stroke.startsWith('#') && svgInfo.stroke.length === 7 ? svgInfo.stroke : '#1e293b'}">
                </div>
                <input type="text" class="color-hex-input" id="svgStrokeInput" value="${svgInfo.stroke}">
              </div>
            </div>

            <div class="tweak-row">
              <span class="tweak-label">선 두께 (Stroke Width)</span>
              <div class="tweak-control-group">
                <input type="range" class="range-slider" id="svgStrokeWidthSlider" min="0" max="24" step="0.5" value="${svgInfo.strokeWidth}">
                <input type="number" class="num-input" id="svgStrokeWidthInput" min="0" max="24" step="0.5" value="${svgInfo.strokeWidth}">
                <span style="font-size: 10px; color: #6B7280;">px</span>
              </div>
            </div>

            <div style="margin-top: 4px;">
              <span class="tweak-label" style="display: block; margin-bottom: 4px;">SVG XML 원본 코드 직접 수정</span>
              <textarea class="live-text-area" id="svgXmlTextarea" style="font-family: ui-monospace, monospace; font-size: 10px; min-height: 80px;">${svgInfo.xml}</textarea>
              <button class="btn-primary" id="applySvgXmlBtn" style="width: 100%; margin-top: 6px; justify-content: center; font-size: 11px;">
                SVG XML 코드 업데이트 반영
              </button>
            </div>
          </div>
        ` : `
          <div style="font-size: 11px; color: #94A3B8; text-align: center; padding: 10px 6px;">
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
        this.renderAssetsTab(container);
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
        this.showToast('고화질 Unsplash 이미지가 적용되었습니다.');
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
            this.renderAssetsTab(container);
          } else {
            this.showToast('SVG XML 파싱에 실패했습니다. 올바른 XML 문법인지 확인하세요.');
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
      eventsListHtml = `<div style="text-align: center; padding: 16px; color: #9CA3AF; font-size: 11px;">감지된 이벤트 리스너가 없습니다.</div>`;
    } else {
      events.forEach(evt => {
        eventsListHtml += `
          <div class="event-item-card">
            <div class="event-header">
              <span class="event-badge">${evt.type}</span>
              <span style="font-size: 9px; color: #6B7280;">${evt.isInline ? '인라인 핸들러' : 'addEventListener'}</span>
            </div>
            <pre class="event-code-snippet">${evt.handler.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </div>
        `;
      });
    }

    container.innerHTML = `
      <div class="section-title">가상 클래스 강제 활성화 (Force Pseudo-State)</div>
      <div class="pseudo-toggle-group">
        <button class="pseudo-btn ${isHoverForced ? 'active' : ''}" data-pseudo="hover">:hover</button>
        <button class="pseudo-btn ${isActiveForced ? 'active' : ''}" data-pseudo="active">:active</button>
        <button class="pseudo-btn ${isFocusForced ? 'active' : ''}" data-pseudo="focus">:focus</button>
        <button class="pseudo-btn" id="clearPseudoBtn">초기화</button>
      </div>

      <div class="section-title" style="margin-top: 14px;">등록된 자바스크립트 이벤트 (${events.length}개)</div>
      <div style="display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto;">
        ${eventsListHtml}
      </div>
    `;

    container.querySelectorAll('[data-pseudo]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.pseudo;
        if (this.interactionDetector) {
          const active = this.interactionDetector.togglePseudo(el, p);
          btn.classList.toggle('active', active);
        }
      });
    });

    container.querySelector('#clearPseudoBtn').addEventListener('click', () => {
      if (this.interactionDetector) {
        this.interactionDetector.clearForcedPseudos(el);
        this.renderInteractionTab(container);
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
          <div style="padding: 6px 10px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 11px;">
            <div style="font-weight: 600; color: #E11D48;">@keyframes ${a.name}</div>
            <div style="color: #6B7280; font-size: 10px; margin-top: 2px;">
              지속 시간: <strong>${a.duration}</strong> • 타이밍: <strong>${a.timing}</strong> • 반복: <strong>${a.iteration}</strong>
            </div>
          </div>
        `;
      });
    }

    let transListHtml = '';
    if (motion.transitions.length > 0) {
      motion.transitions.forEach(t => {
        transListHtml += `
          <div style="padding: 6px 10px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 11px;">
            <div style="font-weight: 600; color: #111827;">${t.property}</div>
            <div style="color: #6B7280; font-size: 10px; margin-top: 2px;">
              지속: <strong>${t.duration}</strong> • 타이밍: <strong>${t.timing}</strong>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = `
      <div class="section-title">글로벌 재생 속도 컨트롤러 (Slow-Mo)</div>
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

      <div class="section-title" style="margin-top: 14px;">가속도 곡선 (Cubic-Bezier Easing)</div>
      <div class="bezier-box">
        <div>${bezierSvg}</div>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
          <span style="font-weight: 600; color: #111827;">${motion.animations[0]?.timing || 'ease'}</span>
          <span style="font-family: ui-monospace, monospace; font-size: 10px; color: #6B7280;">
            [${defaultCoords.map(n => n.toFixed(2)).join(', ')}]
          </span>
          <span style="font-size: 10px; color: #9CA3AF;">Figma/CSS 표준 가속도 곡선</span>
        </div>
      </div>

      <div class="section-title" style="margin-top: 14px;">적용된 CSS 애니메이션 & 트랜지션</div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${animListHtml || transListHtml || '<div style="color: #9CA3AF; font-size: 11px; text-align: center; padding: 12px;">선택된 요소에 애니메이션이 없습니다.</div>'}
      </div>
    `;

    container.querySelectorAll('[data-speed]').forEach(btn => {
      btn.addEventListener('click', () => {
        const rate = parseFloat(btn.dataset.speed);
        if (this.motionInspector) {
          this.motionInspector.setPlaybackRate(rate);
        }
        this.renderMotionTab(container);
      });
    });

    container.querySelector('#motionPauseBtn').addEventListener('click', () => {
      if (this.motionInspector) {
        this.motionInspector.togglePause();
      }
      this.renderMotionTab(container);
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
            <span class="telemetry-val" style="color: #E11D48;">${graphics.contextType}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">버퍼 해상도</span>
            <span class="telemetry-val">${graphics.bufferSize}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">CSS 렌더링 크기</span>
            <span class="telemetry-val">${graphics.cssSize}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">DPR 픽셀 밀도</span>
            <span class="telemetry-val">${graphics.dprRatio}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">추정 VRAM 점유율</span>
            <span class="telemetry-val">${graphics.estimatedVram}</span>
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
              <span class="telemetry-val" style="font-size: 10px;">${graphics.webgl.renderer}</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">GPU 벤더</span>
              <span class="telemetry-val" style="font-size: 10px;">${graphics.webgl.vendor}</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">최대 텍스처 크기</span>
              <span class="telemetry-val">${graphics.webgl.maxTextureSize} px</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">지원 확장 수</span>
              <span class="telemetry-val">${graphics.webgl.extensionsCount}개</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">안티앨리어싱 (AA)</span>
              <span class="telemetry-val">${graphics.webgl.antialias}</span>
            </div>
          </div>
        ` : ''}
      `;
    } else if (graphics.type === 'svg') {
      detailsHtml = `
        <div class="telemetry-grid">
          <div class="telemetry-item">
            <span class="telemetry-label">viewBox</span>
            <span class="telemetry-val">${graphics.viewBox}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">표시 크기</span>
            <span class="telemetry-val">${graphics.displaySize}</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">패스 (Paths) 개수</span>
            <span class="telemetry-val">${graphics.pathsCount}개</span>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">기본 도형 (Shapes)</span>
            <span class="telemetry-val">${graphics.shapesCount}개</span>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="section-title">그래픽 요소 심층 분석 (&lt;${graphics.type}&gt;)</div>
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
      <div class="section-title">접근성 및 편의 도구 (Power Tools)</div>

      <!-- W3C Tab Order Flow Visualizer (v4.0.0) -->
      <div class="tool-banner" style="margin-bottom: 8px;">
        <div>
          <div class="tool-meta-title">W3C 키보드 탭 순서 흐름 (Tab Order)</div>
          <div class="tool-meta-desc">포커스 순번 넘버 배지 및 탭 이동 흐름선 시각화</div>
        </div>
        <button class="toggle-switch-btn ${isTabOrderOn ? 'active' : ''}" id="toggleTabOrderBtn">
          ${isTabOrderOn ? 'ON' : 'OFF'}
        </button>
      </div>

      <!-- Precision Crosshair Cursor & Live Coordinates (v4.0.0 2.5px 50% opacity) -->
      <div class="tool-banner" style="margin-bottom: 8px;">
        <div>
          <div class="tool-meta-title">정밀 십자선 커서 & 좌표 (Alt + C)</div>
          <div class="tool-meta-desc">2.5px 두께 50% 반투명 헤어라인 및 실시간 (X, Y) 픽셀 좌표</div>
        </div>
        <button class="toggle-switch-btn ${isCursorOn ? 'active' : ''}" id="toggleCursorBtn">
          ${isCursorOn ? 'ON' : 'OFF'}
        </button>
      </div>

      <!-- Instant Zoom In / Zoom Out (v4.0.0 Alt++, Alt--, Alt+0) -->
      <div class="tool-banner" style="margin-bottom: 8px;">
        <div style="flex: 1; padding-right: 10px;">
          <div class="tool-meta-title">인스턴트 줌 (Alt + / - / 0)</div>
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
          <div class="tool-meta-title">복사 & 우클릭 차단 해제 (Alt + U)</div>
          <div class="tool-meta-desc">user-select 및 우클릭/드래그 방지 스크립트 무력화</div>
        </div>
        <button class="toggle-switch-btn ${isUnblocked ? 'active' : ''}" id="toggleUnblockBtn">
          ${isUnblocked ? '해제됨 (Active)' : '해제하기'}
        </button>
      </div>

      <!-- DOM & Script Freeze -->
      <div class="tool-banner" style="margin-top: 8px;">
        <div>
          <div class="tool-meta-title">스크립트 & 툴팁 프리징 (Freeze)</div>
          <div class="tool-meta-desc">마우스를 떼면 사라지는 툴팁/드롭다운 고정</div>
        </div>
        <button class="toggle-switch-btn ${isFrozen ? 'active freeze' : ''}" id="toggleFreezeBtn">
          ${isFrozen ? '고정됨 (Frozen)' : '화면 멈추기'}
        </button>
      </div>

      <div class="section-title" style="margin-top: 14px;">피그마 커스텀 그리드 설정</div>

      <!-- Responsive Grid Toggle -->
      <div class="tool-banner">
        <div>
          <div class="tool-meta-title">반응형 컬럼 그리드 표시</div>
          <div class="tool-meta-desc">Figma 레이아웃 컬럼 가이드라인</div>
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
        this.renderToolsTab(container);
      }
    });

    // Precision Cursor Toggle
    container.querySelector('#toggleCursorBtn')?.addEventListener('click', () => {
      if (this.precisionCursor) {
        const active = this.precisionCursor.toggle();
        this.showToast(active ? '정밀 십자선 커서가 활성화되었습니다.' : '십자선 커서가 비활성화되었습니다.');
        this.renderToolsTab(container);
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
        this.renderToolsTab(container);
      }
    });

    container.querySelector('#toggleFreezeBtn').addEventListener('click', () => {
      if (this.pageController) {
        const frozen = this.pageController.toggleFreeze();
        this.showToast(frozen ? '화면 인터랙션이 프리징되었습니다.' : '프리징이 해제되었습니다.');
        this.renderToolsTab(container);
      }
    });

    container.querySelector('#toggleGridToolBtn').addEventListener('click', () => {
      if (this.overlayCanvas) {
        this.overlayCanvas.toggleGrid();
        this.renderToolsTab(container);
      }
    });

    container.querySelector('#toggleBaseToolBtn').addEventListener('click', () => {
      if (this.overlayCanvas) {
        this.overlayCanvas.toggleBaseline();
        this.renderToolsTab(container);
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
    const el = this.tweaker.getElement();
    const converted = el ? TailwindConverter.convert(el) : null;
    const reactComponent = (el && typeof ReactExporter !== 'undefined') ? ReactExporter.generateComponent(el) : null;

    container.innerHTML = `
      <div class="section-title">스마트 코드 추출 (Smart Code)</div>
      ${converted ? `
        <!-- React JSX Component Card (v4.0.0) -->
        <div class="code-card" style="margin-bottom: 8px;">
          <div class="code-header">
            <span class="code-lang-tag">React (JSX) Component</span>
            <button class="copy-mini-btn" id="copyReactBtn">JSX 복사</button>
          </div>
          <pre class="code-content">${(reactComponent || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>

        <!-- Tailwind CSS Card -->
        <div class="code-card" style="margin-bottom: 8px;">
          <div class="code-header">
            <span class="code-lang-tag">Tailwind CSS Classes</span>
            <button class="copy-mini-btn" id="copyTailwindBtn">복사</button>
          </div>
          <pre class="code-content">${converted.tailwind || '(추출된 유틸리티 없음)'}</pre>
        </div>

        <!-- Clean CSS Rules Card -->
        <div class="code-card" style="margin-bottom: 8px;">
          <div class="code-header">
            <span class="code-lang-tag">Clean CSS</span>
            <button class="copy-mini-btn" id="copyCssBtn">복사</button>
          </div>
          <pre class="code-content">${converted.cleanCss}</pre>
        </div>

        <!-- One-click Asset Downloader (v4.0.0) -->
        <button class="btn-secondary-action" id="btnDownloadAssets" style="margin-bottom: 12px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          요소 및 하위 에셋 일괄 다운로드 (SVG/IMG)
        </button>
      ` : `
        <div style="text-align: center; padding: 12px; color: #9CA3AF; font-size: 11px;">
          요소를 선택하면 React JSX, Tailwind 및 Clean CSS 코드가 생성됩니다.
        </div>
      `}

      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px;">
        <span class="section-title" style="margin: 0;">난독화 해제된 사이트 CSS</span>
        <button class="section-reset-btn" id="loadSiteCssBtn">스타일시트 불러오기</button>
      </div>
      <div class="search-input-box" style="margin-top: 6px;">
        <input type="text" class="site-search-input" id="cssSearchInput" placeholder="클래스, 셀렉터 또는 속성 검색...">
      </div>
      <div id="cssSheetsList" style="display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto; margin-top: 6px;">
        <div style="text-align: center; padding: 12px; color: #6B7280; font-size: 11px;">
          '스타일시트 불러오기'를 누르면 사이트의 번들 CSS를 미화하여 표시합니다.
        </div>
      </div>
    `;

    if (converted) {
      container.querySelector('#copyReactBtn')?.addEventListener('click', () => {
        if (reactComponent) {
          navigator.clipboard.writeText(reactComponent).then(() => this.showToast('React 컴포넌트 코드가 복사되었습니다.'));
        }
      });
      container.querySelector('#copyTailwindBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(converted.tailwind).then(() => this.showToast('Tailwind 클래스가 복사되었습니다.'));
      });
      container.querySelector('#copyCssBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(converted.cleanCss).then(() => this.showToast('Clean CSS가 복사되었습니다.'));
      });
      container.querySelector('#btnDownloadAssets')?.addEventListener('click', async () => {
        if (typeof ReactExporter !== 'undefined') {
          const count = await ReactExporter.downloadAllAssets(el);
          this.showToast(`${count}개의 에셋 다운로드를 시작했습니다.`);
        }
      });
    }

    container.querySelector('#loadSiteCssBtn').addEventListener('click', async () => {
      const listContainer = container.querySelector('#cssSheetsList');
      listContainer.innerHTML = `<div style="text-align: center; padding: 12px; color: #E11D48;">스타일시트 파싱 및 난독화 해제 중...</div>`;
      this.siteStylesheets = await CssBeautifier.extractSiteStylesheets();
      this.displayFilteredCss(listContainer, '');
    });

    const searchInput = container.querySelector('#cssSearchInput');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const listContainer = container.querySelector('#cssSheetsList');
      this.displayFilteredCss(listContainer, query);
    });

    if (this.siteStylesheets && this.siteStylesheets.length > 0) {
      this.displayFilteredCss(container.querySelector('#cssSheetsList'), '');
    }
  }

  displayFilteredCss(container, query) {
    if (!this.siteStylesheets || this.siteStylesheets.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 12px; color: #9CA3AF;">추출된 스타일시트가 없습니다.</div>`;
      return;
    }

    let html = '';
    this.siteStylesheets.forEach((sheet, idx) => {
      let content = sheet.css;
      if (query) {
        const lines = content.split('\n');
        const matched = [];
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(query)) {
            const start = Math.max(0, i - 2);
            const end = Math.min(lines.length, i + 6);
            matched.push(lines.slice(start, end).join('\n'));
            i = end;
          }
        }
        content = matched.join('\n\n/* ----- 일치 결과 ----- */\n\n');
        if (!content) return;
      }

      html += `
        <div class="code-card">
          <div class="code-header">
            <span class="code-lang-tag">${sheet.source}</span>
            <button class="copy-mini-btn" data-copy-idx="${idx}">복사</button>
          </div>
          <pre class="code-content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
      `;
    });

    container.innerHTML = html || `<div style="text-align: center; padding: 12px; color: #6B7280;">'${query}'에 일치하는 결과가 없습니다.</div>`;

    container.querySelectorAll('[data-copy-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.copyIdx, 10);
        const code = this.siteStylesheets[idx]?.css || '';
        navigator.clipboard.writeText(code).then(() => this.showToast('스타일시트가 복사되었습니다.'));
      });
    });
  }

  // ==========================================
  // TAB 7: Settings & Shortcut Customization (v4.0.0)
  // ==========================================
  renderSettingsTab(container) {
    const shortcuts = this.shortcutManager ? this.shortcutManager.getShortcuts() : {
      toggleInspector: 'alt+s',
      toggleEditMode: 'alt+e',
      instantZoomIn: 'alt+=',
      instantZoomOut: 'alt+-',
      resetZoom: 'alt+0',
      toggleGrid: 'alt+g',
      togglePrecisionCursor: 'alt+c',
      toggleTabOrder: 'alt+t'
    };

    const actionLabels = {
      toggleInspector: '인스펙터 토글 (Alt + S)',
      toggleEditMode: '검사 / 편집 모드 전환 (Alt + E)',
      instantZoomIn: '인스턴트 줌인 (Alt + +)',
      instantZoomOut: '인스턴트 줌아웃 (Alt + -)',
      resetZoom: '줌 배율 초기화 (Alt + 0)',
      toggleGrid: '반응형 그리드 토글 (Alt + G)',
      togglePrecisionCursor: '정밀 십자선 커서 토글 (Alt + C)',
      toggleTabOrder: 'W3C 탭 순서 시각화 토글 (Alt + T)'
    };

    const curVer = this.updateGuardian ? this.updateGuardian.currentVersion : '4.0.2';
    const curDisplayVer = typeof UpdateGuardian !== 'undefined' ? UpdateGuardian.formatDisplayVersion(curVer) : 'v4.0.2.';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        
        <!-- 1. Brand Identity & Strict Dot Version Standard -->
        <div class="brand-identity-card">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="section-title" style="margin: 0;">브랜드 아이덴티티 & 규격</span>
            <span class="version-standard-badge">${curDisplayVer}</span>
          </div>
          
          <div class="brand-color-row">
            <div class="brand-color-swatch" title="공식 브랜드 컬러: #E11D48"></div>
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="brand-color-name">공식 브랜드 컬러</span>
                <span class="brand-color-code">#E11D48 (Studio Crimson)</span>
              </div>
              <span style="font-size: 10px; color: #64748B;">UI 액센트, 선택 하이라이트 및 룰러에 일관되게 적용</span>
            </div>
          </div>

          <div style="font-size: 10.5px; color: #475569; background: #FFFFFF; border: 1px solid #E2E8F0; padding: 6px 8px; border-radius: 4px; line-height: 1.5;">
            <strong>버전 표기 표준 체계:</strong> 사용자 노출 인터페이스 및 문서에서는 반드시 <strong>'vX.Y.Z.'</strong>처럼 끝에 마침표(dot)를 포함하는 표준 규격을 엄격 준수합니다.
          </div>
        </div>

        <!-- 2. GitHub Releases Auto-Detection & One-Click Update Guardian -->
        <div class="update-guardian-card">
          <div class="update-status-row">
            <span class="section-title" style="margin: 0;">GitHub 릴리즈 자동 감지 & 업데이트</span>
            <span class="update-status-badge up-to-date" id="settingsUpdateBadge">최신 버전 확인 완료</span>
          </div>

          <div id="settingsUpdateDetail" style="font-size: 11px; color: #475569; line-height: 1.5;">
            GitHub 원격 릴리즈 저장소를 감지하여 새 버전 배포 시 1초 만에 알림을 제공하고 원클릭 다운로드를 지원합니다.
          </div>

          <div style="display: flex; gap: 6px;">
            <button class="btn-primary-action" id="btnCheckUpdateNow" style="flex: 1; height: 30px; font-size: 11px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right: 4px;">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              지금 업데이트 확인
            </button>
            <button class="btn-secondary-action" id="btnOpenReleasesPage" style="width: auto; padding: 0 10px; height: 30px; font-size: 11px;">
              릴리즈 목록
            </button>
          </div>

          <div id="settingsUpdateBox" style="display: none; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 6px; padding: 10px; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; font-weight: 700; color: #9F1239;" id="settingsNewVerTitle">새 버전 발견</span>
              <span class="dock-badge" id="settingsNewVerBadge" style="background: #E11D48; color: #fff;">v4.0.2.</span>
            </div>
            <p style="font-size: 10.5px; color: #475569;" id="settingsNewVerNotes">새로운 기능과 안정성 개선이 포함되어 있습니다.</p>
            <button class="btn-primary-action" id="btnOneClickUpdate" style="height: 32px; font-size: 11px; background: #E11D48;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right: 4px;">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              원클릭 ZIP 다운로드 & 업데이트
            </button>
          </div>
        </div>

        <!-- 3. Shortcuts Settings Table -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="section-title" style="margin: 0;">단축키 커스텀 설정</span>
            <span style="font-size: 10px; color: #64748B;">키 입력 시 자동 저장</span>
          </div>

          <table class="shortcut-table">
            <thead>
              <tr>
                <th>기능명</th>
                <th style="text-align: right;">단축키</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(shortcuts).map(([action, key]) => `
                <tr>
                  <td>
                    <div style="font-weight: 600; color: #1E293B;">${actionLabels[action] || action}</div>
                  </td>
                  <td style="text-align: right;">
                    <input type="text" class="shortcut-input" data-action="${action}" value="${key}" placeholder="단축키 입력">
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <button class="shortcut-reset-btn" id="btnResetShortcuts">
            모든 단축키를 기본값으로 되돌리기
          </button>
        </div>

      </div>
    `;

    // Shortcut events
    container.querySelectorAll('.shortcut-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const act = input.dataset.action;
        const val = e.target.value.trim();
        if (this.shortcutManager && val) {
          this.shortcutManager.setShortcut(act, val);
          this.showToast(`'${actionLabels[act] || act}' 단축키가 '${val}'(으)로 변경되었습니다.`);
        }
      });
    });

    container.querySelector('#btnResetShortcuts')?.addEventListener('click', () => {
      if (this.shortcutManager) {
        this.shortcutManager.resetToDefaults();
        this.showToast('모든 단축키가 기본값으로 복원되었습니다.');
        this.renderSettingsTab(container);
      }
    });

    // Update Guardian Events in Settings Tab
    const badge = container.querySelector('#settingsUpdateBadge');
    const updateBox = container.querySelector('#settingsUpdateBox');
    const btnCheck = container.querySelector('#btnCheckUpdateNow');
    const btnOpenReleases = container.querySelector('#btnOpenReleasesPage');
    const btnOneClick = container.querySelector('#btnOneClickUpdate');

    btnOpenReleases?.addEventListener('click', () => {
      window.open('https://github.com/hslcrb/style-scrather/releases', '_blank');
    });

    btnCheck?.addEventListener('click', async () => {
      if (!this.updateGuardian) return;
      btnCheck.disabled = true;
      btnCheck.textContent = '업데이트 확인 중...';
      try {
        const res = await this.updateGuardian.checkForUpdate(true);
        btnCheck.disabled = false;
        btnCheck.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right: 4px;"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>지금 업데이트 확인`;

        if (res.hasUpdate) {
          badge.className = 'update-status-badge has-update';
          badge.textContent = `새 버전 ${res.latestDisplayVersion} 출시`;
          updateBox.style.display = 'flex';
          container.querySelector('#settingsNewVerTitle').textContent = res.releaseTitle || `새 버전 ${res.latestDisplayVersion}`;
          container.querySelector('#settingsNewVerBadge').textContent = res.latestDisplayVersion;
          container.querySelector('#settingsNewVerNotes').textContent = res.releaseNotes ? res.releaseNotes.slice(0, 140) + '...' : '새로운 업데이트를 확인하세요.';
          
          btnOneClick.onclick = () => {
            this.updateGuardian.triggerDownload(res.zipUrl, `style-scrather-${res.latestDisplayVersion.replace(/\\.+$/, '')}.zip`);
            this.showToast(`${res.latestDisplayVersion} ZIP 다운로드가 시작되었습니다.`);
          };
          this.showToast(`신규 버전 ${res.latestDisplayVersion}이 발견되었습니다!`);
        } else {
          badge.className = 'update-status-badge up-to-date';
          badge.textContent = '최신 버전 유지 중';
          updateBox.style.display = 'none';
          this.showToast(`현재 최신 버전(${curDisplayVer})을 사용 중입니다.`);
        }
      } catch (err) {
        btnCheck.disabled = false;
        btnCheck.textContent = '지금 업데이트 확인';
        this.showToast('업데이트 확인 실패: 네트워크 상태를 확인하세요.');
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.FloatingDock = FloatingDock;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingDock;
}
