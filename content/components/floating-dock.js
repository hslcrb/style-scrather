// Style Scratcher v2.0 - Floating Dock Component (White Minimal Studio UI)

class FloatingDock {
  constructor(shadowRoot, options = {}) {
    this.shadowRoot = shadowRoot;
    this.tweaker = options.tweaker;
    this.overlayCanvas = options.overlayCanvas;
    this.unitConverter = options.unitConverter || (typeof UnitConverter !== 'undefined' ? new UnitConverter() : null);
    this.interactionDetector = options.interactionDetector || (typeof InteractionDetector !== 'undefined' ? new InteractionDetector() : null);
    this.pageController = options.pageController || (typeof PageController !== 'undefined' ? new PageController() : null);
    this.motionInspector = options.motionInspector || (typeof MotionInspector !== 'undefined' ? new MotionInspector() : null);
    this.onToggleInspector = options.onToggleInspector || (() => {});
    
    this.container = null;
    this.currentTab = 'inspector'; // 'inspector' | 'interaction' | 'motion' | 'graphics' | 'tools' | 'code'
    this.isMinimized = false;
    this.siteStylesheets = [];
    this.extractedPalette = null;

    this.initDOM();
    this.initDrag();
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
          <span class="dock-badge">v2.0</span>
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

      <!-- Navigation Tabs (v2.0 Expanded) -->
      <div class="dock-tabs" id="dockTabs">
        <button class="tab-btn active" data-tab="inspector">인스펙터</button>
        <button class="tab-btn" data-tab="interaction">인터랙션</button>
        <button class="tab-btn" data-tab="motion">모션/속도</button>
        <button class="tab-btn" data-tab="graphics">그래픽/WebGL</button>
        <button class="tab-btn" data-tab="tools">도구 & 해제</button>
        <button class="tab-btn" data-tab="code">코드 & CSS</button>
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
      tabs.style.display = 'flex';
      body.style.display = 'flex';
      this.container.classList.remove('minimized');
    }
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

    container.innerHTML = `
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
        <div class="btn-group" style="margin-top: 4px;">
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

      <!-- 3. Colors Tweaker -->
      <div class="tweak-section">
        <div class="section-title">
          <span>색상 (Colors)</span>
        </div>
        <div class="tweak-row">
          <span class="tweak-label">배경색</span>
          <div class="color-picker-group">
            <div class="color-swatch-wrapper" style="background-color: ${bgHex};">
              <input type="color" class="native-color-picker" id="bgColorPicker" value="${bgHex.startsWith('#') && bgHex.length === 7 ? bgHex : '#ffffff'}">
            </div>
            <input type="text" class="color-hex-input" id="bgHexInput" value="${bgHex}">
          </div>
        </div>
        <div class="tweak-row">
          <span class="tweak-label">텍스트 색상</span>
          <div class="color-picker-group">
            <div class="color-swatch-wrapper" style="background-color: ${colorHex};">
              <input type="color" class="native-color-picker" id="textColorPicker" value="${colorHex.startsWith('#') && colorHex.length === 7 ? colorHex : '#000000'}">
            </div>
            <input type="text" class="color-hex-input" id="textHexInput" value="${colorHex}">
          </div>
        </div>
      </div>
    `;

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
  // TAB 2: Interaction & Event Listeners
  // ==========================================
  renderInteractionTab(container) {
    const el = this.tweaker.getElement();
    if (!el) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚡</div>
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
            <div style="font-weight: 600; color: #2563EB;">@keyframes ${a.name}</div>
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
          <div class="empty-icon">🎨</div>
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
            <span class="telemetry-val" style="color: #2563EB;">${graphics.contextType}</span>
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
  // TAB 5: Tools & Unblocker
  // ==========================================
  renderToolsTab(container) {
    const isUnblocked = this.pageController ? this.pageController.isUnblocked : false;
    const isFrozen = this.pageController ? this.pageController.isFrozen : false;
    const isGridOn = this.overlayCanvas ? this.overlayCanvas.isGridVisible : false;
    const isBaseOn = this.overlayCanvas ? this.overlayCanvas.isBaselineVisible : false;

    container.innerHTML = `
      <div class="section-title">접근성 및 편의 도구 (Power Tools)</div>

      <!-- Copy & Right-Click Unblocker -->
      <div class="tool-banner">
        <div>
          <div class="tool-meta-title">복사 & 우클릭 차단 해제</div>
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

      <div class="section-title" style="margin-top: 14px;">피그마 레이아웃 가이드</div>

      <!-- 12-Col Grid -->
      <div class="tool-banner">
        <div>
          <div class="tool-meta-title">12컬럼 반응형 그리드</div>
          <div class="tool-meta-desc">Figma 12-Col 레이아웃 정렬선 표시</div>
        </div>
        <button class="toggle-switch-btn ${isGridOn ? 'active' : ''}" id="toggleGridToolBtn">
          ${isGridOn ? 'ON' : 'OFF'}
        </button>
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
  }

  // ==========================================
  // TAB 6: Code Export & CSS De-minifier
  // ==========================================
  renderCodeTab(container) {
    const el = this.tweaker.getElement();
    const converted = el ? TailwindConverter.convert(el) : null;

    container.innerHTML = `
      <div class="section-title">스마트 코드 추출 (Smart Code)</div>
      ${converted ? `
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
      ` : `
        <div style="text-align: center; padding: 12px; color: #9CA3AF; font-size: 11px;">
          요소를 선택하면 Tailwind 및 Clean CSS 코드가 생성됩니다.
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
      container.querySelector('#copyTailwindBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(converted.tailwind).then(() => this.showToast('Tailwind 클래스가 복사되었습니다.'));
      });
      container.querySelector('#copyCssBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(converted.cleanCss).then(() => this.showToast('Clean CSS가 복사되었습니다.'));
      });
    }

    container.querySelector('#loadSiteCssBtn').addEventListener('click', async () => {
      const listContainer = container.querySelector('#cssSheetsList');
      listContainer.innerHTML = `<div style="text-align: center; padding: 12px; color: #2563EB;">스타일시트 파싱 및 난독화 해제 중...</div>`;
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
}

if (typeof window !== 'undefined') {
  window.FloatingDock = FloatingDock;
}
