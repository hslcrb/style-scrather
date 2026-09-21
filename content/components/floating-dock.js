// Style Scratcher - Floating Dock Component (White Minimal Studio UI)

class FloatingDock {
  constructor(shadowRoot, options = {}) {
    this.shadowRoot = shadowRoot;
    this.tweaker = options.tweaker;
    this.overlayCanvas = options.overlayCanvas;
    this.onToggleInspector = options.onToggleInspector || (() => {});
    
    this.container = null;
    this.currentTab = 'inspector'; // 'inspector' | 'code' | 'palette' | 'site-css' | 'grid'
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
          <span class="dock-badge">INSPECT</span>
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

      <!-- Navigation Tabs -->
      <div class="dock-tabs" id="dockTabs">
        <button class="tab-btn active" data-tab="inspector">인스펙터</button>
        <button class="tab-btn" data-tab="code">코드 추출</button>
        <button class="tab-btn" data-tab="palette">컬러 & 폰트</button>
        <button class="tab-btn" data-tab="site-css">CSS 난독화 해제</button>
        <button class="tab-btn" data-tab="grid">그리드 & 반응형</button>
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

      // Unset right positioning to allow free dragging
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

  // Update whenever active inspected element changes
  updateElement() {
    if (this.currentTab === 'inspector' || this.currentTab === 'code') {
      this.renderCurrentTab();
    }
  }

  renderCurrentTab() {
    const body = this.container.querySelector('#dockBody');
    if (!body) return;

    if (this.currentTab === 'inspector') {
      this.renderInspectorTab(body);
    } else if (this.currentTab === 'code') {
      this.renderCodeTab(body);
    } else if (this.currentTab === 'palette') {
      this.renderPaletteTab(body);
    } else if (this.currentTab === 'site-css') {
      this.renderSiteCssTab(body);
    } else if (this.currentTab === 'grid') {
      this.renderGridTab(body);
    }
  }

  // ==========================================
  // TAB 1: Inspector & Live Tweaker
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
          <div class="empty-desc">웹 페이지 위의 아무 요소를 클릭하면 피그마처럼 고정되어 실시간으로 라디우스, 마진, 패딩, 색상을 바꿀 수 있습니다.</div>
        </div>
      `;
      return;
    }

    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const tag = el.tagName.toLowerCase();
    const className = (typeof el.className === 'string' && el.className.trim()) ? `.${el.className.trim().split(/\s+/).join('.')}` : '';

    // Values for controls
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

    container.innerHTML = `
      <!-- Element Meta Banner -->
      <div class="element-meta-card">
        <div class="meta-header">
          <span class="element-tag-pill">&lt;${tag}&gt;</span>
          <span class="element-dim-badge">${Math.round(rect.width)} × ${Math.round(rect.height)} px</span>
        </div>
        ${className ? `<div class="element-classes" title="${className}">${className}</div>` : ''}
        <div class="btn-group" style="margin-top: 4px;">
          <button class="btn-secondary" id="unlockBtn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
            </svg>
            선택 해제 (Esc)
          </button>
          <button class="btn-secondary" id="resetStylesBtn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            스타일 초기화
          </button>
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
                ${Math.round(rect.width)} × ${Math.round(rect.height)}
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
        <div class="tweak-row">
          <span class="tweak-label">테두리 색상</span>
          <div class="color-picker-group">
            <div class="color-swatch-wrapper" style="background-color: ${borderHex};">
              <input type="color" class="native-color-picker" id="borderColorPicker" value="${borderHex.startsWith('#') && borderHex.length === 7 ? borderHex : '#e5e7eb'}">
            </div>
            <input type="text" class="color-hex-input" id="borderHexInput" value="${borderHex}">
          </div>
        </div>
      </div>

      <!-- 4. Typography Tweaker -->
      <div class="tweak-section">
        <div class="section-title">
          <span>타이포그래피 (Typography)</span>
        </div>
        <div class="tweak-row">
          <span class="tweak-label">폰트 크기</span>
          <div class="tweak-control-group">
            <input type="range" class="range-slider" id="fontSizeSlider" min="10" max="48" value="${fontSize}">
            <input type="number" class="num-input" id="fontSizeInput" min="8" max="100" value="${fontSize}">
            <span style="font-size: 10px; color: #6B7280;">px</span>
          </div>
        </div>
        <div class="tweak-row">
          <span class="tweak-label">폰트 굵기</span>
          <div class="btn-group" style="flex: 1;">
            <button class="btn-secondary ${computed.fontWeight === '400' ? 'active' : ''}" data-weight="400">Regular</button>
            <button class="btn-secondary ${computed.fontWeight === '500' ? 'active' : ''}" data-weight="500">Medium</button>
            <button class="btn-secondary ${computed.fontWeight === '600' ? 'active' : ''}" data-weight="600">Semibold</button>
            <button class="btn-secondary ${computed.fontWeight === '700' ? 'active' : ''}" data-weight="700">Bold</button>
          </div>
        </div>
      </div>
    `;

    // Bind Inspector Events
    container.querySelector('#unlockBtn').addEventListener('click', () => {
      this.overlayCanvas.setSelectedElement(null);
      this.tweaker.setElement(null);
    });

    container.querySelector('#resetStylesBtn').addEventListener('click', () => {
      this.tweaker.resetCurrentElement();
      this.overlayCanvas.render();
      this.showToast('스타일이 원래대로 복원되었습니다.');
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

    // 4 Corners Toggle
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
    const updatePadding = (val) => {
      pSlider.value = val;
      pInput.value = val;
      this.tweaker.setPadding('all', val);
      this.overlayCanvas.render();
    };
    pSlider.addEventListener('input', (e) => updatePadding(e.target.value));
    pInput.addEventListener('change', (e) => updatePadding(e.target.value));

    // Color Pickers
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
    bindColor('borderColorPicker', 'borderHexInput', 'border');

    // Font Size
    const fsSlider = container.querySelector('#fontSizeSlider');
    const fsInput = container.querySelector('#fontSizeInput');
    const updateFontSize = (val) => {
      fsSlider.value = val;
      fsInput.value = val;
      this.tweaker.setFontSize(val);
      this.overlayCanvas.render();
    };
    fsSlider.addEventListener('input', (e) => updateFontSize(e.target.value));
    fsInput.addEventListener('change', (e) => updateFontSize(e.target.value));

    // Font Weight Buttons
    container.querySelectorAll('[data-weight]').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('[data-weight]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.tweaker.setFontWeight(btn.dataset.weight);
        this.overlayCanvas.render();
      });
    });
  }

  // ==========================================
  // TAB 2: Code Export (Clean CSS / Tailwind / HTML)
  // ==========================================
  renderCodeTab(container) {
    const el = this.tweaker.getElement();
    if (!el) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <div class="empty-title">선택된 요소가 없습니다</div>
          <div class="empty-desc">요소를 클릭하면 클린 CSS, Tailwind 클래스, HTML 코드가 즉시 생성됩니다.</div>
        </div>
      `;
      return;
    }

    const converted = TailwindConverter.convert(el);

    container.innerHTML = `
      <!-- Tailwind CSS Card -->
      <div class="code-card">
        <div class="code-header">
          <span class="code-lang-tag">Tailwind CSS Classes</span>
          <button class="copy-mini-btn" id="copyTailwindBtn">클래스 복사</button>
        </div>
        <pre class="code-content" id="tailwindCodeBlock">${converted.tailwind || '(추출된 유틸리티 클래스가 없습니다)'}</pre>
      </div>

      <!-- Clean CSS Rules Card -->
      <div class="code-card">
        <div class="code-header">
          <span class="code-lang-tag">Clean CSS</span>
          <button class="copy-mini-btn" id="copyCssBtn">CSS 복사</button>
        </div>
        <pre class="code-content" id="cssCodeBlock">${converted.cleanCss}</pre>
      </div>

      <!-- HTML Outer Structure Card -->
      <div class="code-card">
        <div class="code-header">
          <span class="code-lang-tag">HTML Tag</span>
          <button class="copy-mini-btn" id="copyHtmlBtn">HTML 복사</button>
        </div>
        <pre class="code-content" id="htmlCodeBlock">${converted.html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </div>
    `;

    // Copy handlers
    const setupCopy = (btnId, text) => {
      const btn = container.querySelector(`#${btnId}`);
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(text).then(() => {
          this.showToast('클립보드에 복사되었습니다.');
        });
      });
    };

    setupCopy('copyTailwindBtn', converted.tailwind);
    setupCopy('copyCssBtn', converted.cleanCss);
    setupCopy('copyHtmlBtn', converted.html);
  }

  // ==========================================
  // TAB 3: Site Palette & Typography
  // ==========================================
  renderPaletteTab(container) {
    if (!this.extractedPalette) {
      this.extractedPalette = PaletteExtractor.extract();
    }

    const { colors, fonts } = this.extractedPalette;

    let colorsHtml = '';
    colors.forEach(item => {
      colorsHtml += `
        <div class="palette-item" data-hex="${item.hex}" title="클릭하여 복사 또는 적용">
          <div class="palette-swatch" style="background-color: ${item.hex};"></div>
          <span class="palette-hex">${item.hex}</span>
          <span class="palette-count">${item.count}곳 사용</span>
        </div>
      `;
    });

    let fontsHtml = '';
    fonts.forEach(f => {
      fontsHtml += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 11px;">
          <span style="font-weight: 600; font-family: ${f.family}, sans-serif;">${f.family}</span>
          <span style="color: #6B7280; font-size: 10px;">${f.count}회 감지</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span class="section-title" style="margin: 0;">사이트 고유 색상 (${colors.length}개 발견)</span>
        <button class="section-reset-btn" id="rescanPaletteBtn">다시 스캔</button>
      </div>
      <div class="palette-grid">
        ${colorsHtml || '<div style="grid-column: 1/-1; text-align: center; color: #9CA3AF;">감지된 색상이 없습니다.</div>'}
      </div>

      <div class="section-title" style="margin-top: 10px;">사용 중인 글꼴 (${fonts.length}종)</div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${fontsHtml || '<div style="color: #9CA3AF; font-size: 11px;">감지된 폰트가 없습니다.</div>'}
      </div>
    `;

    // Click color to copy
    container.querySelectorAll('.palette-item').forEach(item => {
      item.addEventListener('click', () => {
        const hex = item.dataset.hex;
        navigator.clipboard.writeText(hex).then(() => {
          this.showToast(`색상 코드 ${hex} 가 복사되었습니다.`);
        });
      });
    });

    container.querySelector('#rescanPaletteBtn').addEventListener('click', () => {
      this.extractedPalette = PaletteExtractor.extract();
      this.renderPaletteTab(container);
    });
  }

  // ==========================================
  // TAB 4: Site CSS De-minifier & Search
  // ==========================================
  async renderSiteCssTab(container) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span class="section-title" style="margin: 0;">난독화 해제된 CSS 뷰어</span>
        <button class="section-reset-btn" id="extractCssBtn">스타일시트 불러오기</button>
      </div>
      <div class="search-input-box">
        <input type="text" class="site-search-input" id="cssSearchInput" placeholder="클래스, 셀렉터 또는 속성 검색 (예: .btn, radius, color)...">
      </div>
      <div id="cssSheetsList" style="display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto;">
        <div style="text-align: center; padding: 20px; color: #6B7280; font-size: 11px;">
          '스타일시트 불러오기'를 누르면 사이트의 모든 CSS를 난독화 해제하여 깔끔하게 정렬해 보여줍니다.
        </div>
      </div>
    `;

    const loadStylesheets = async () => {
      const listContainer = container.querySelector('#cssSheetsList');
      listContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: #2563EB;">스타일시트 파싱 및 난독화 해제 중...</div>`;
      this.siteStylesheets = await CssBeautifier.extractSiteStylesheets();
      this.displayFilteredCss(listContainer, '');
    };

    container.querySelector('#extractCssBtn').addEventListener('click', loadStylesheets);

    const searchInput = container.querySelector('#cssSearchInput');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const listContainer = container.querySelector('#cssSheetsList');
      this.displayFilteredCss(listContainer, query);
    });

    if (this.siteStylesheets.length > 0) {
      this.displayFilteredCss(container.querySelector('#cssSheetsList'), '');
    }
  }

  displayFilteredCss(container, query) {
    if (!this.siteStylesheets || this.siteStylesheets.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 20px; color: #9CA3AF;">추출된 스타일시트가 없습니다.</div>`;
      return;
    }

    let html = '';
    this.siteStylesheets.forEach((sheet, idx) => {
      let content = sheet.css;
      if (query) {
        // Filter CSS lines containing query
        const lines = content.split('\n');
        const matched = [];
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(query)) {
            // grab some context lines
            const start = Math.max(0, i - 2);
            const end = Math.min(lines.length, i + 6);
            matched.push(lines.slice(start, end).join('\n'));
            i = end;
          }
        }
        content = matched.join('\n\n/* ----- 다음 검색 결과 ----- */\n\n');
        if (!content) return; // skip this sheet if no match
      }

      html += `
        <div class="code-card">
          <div class="code-header">
            <span class="code-lang-tag">${sheet.source} (${sheet.rulesCount} rules)</span>
            <button class="copy-mini-btn" data-copy-idx="${idx}">CSS 복사</button>
          </div>
          <pre class="code-content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
      `;
    });

    if (!html && query) {
      html = `<div style="text-align: center; padding: 20px; color: #6B7280; font-size: 11px;">'${query}' 에 일치하는 스타일 규칙을 찾을 수 없습니다.</div>`;
    }

    container.innerHTML = html;

    container.querySelectorAll('[data-copy-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.copyIdx, 10);
        const code = this.siteStylesheets[idx]?.css || '';
        navigator.clipboard.writeText(code).then(() => {
          this.showToast('스타일시트가 복사되었습니다.');
        });
      });
    });
  }

  // ==========================================
  // TAB 5: Grid & Viewport Guides
  // ==========================================
  renderGridTab(container) {
    const isGridOn = this.overlayCanvas.isGridVisible;
    const isBaseOn = this.overlayCanvas.isBaselineVisible;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let breakpoint = 'Desktop (LG)';
    if (vw < 640) breakpoint = 'Mobile (SM)';
    else if (vw < 768) breakpoint = 'Mobile Landscape (MD)';
    else if (vw < 1024) breakpoint = 'Tablet (LG)';
    else if (vw < 1280) breakpoint = 'Laptop (XL)';
    else breakpoint = 'Desktop Wide (2XL)';

    container.innerHTML = `
      <div class="section-title">피그마 레이아웃 가이드</div>

      <!-- 12-Column Grid Toggle -->
      <div class="tweak-section">
        <div class="tweak-row">
          <div>
            <div style="font-weight: 600; font-size: 12px; color: #111827;">12컬럼 반응형 그리드</div>
            <div style="font-size: 10px; color: #6B7280;">Figma 12-Col 그리드 가이드라인 표시</div>
          </div>
          <button class="btn-secondary ${isGridOn ? 'active' : ''}" id="dockToggleGridBtn" style="width: auto; padding: 0 12px;">
            ${isGridOn ? '그리드 끄기' : '그리드 켜기'}
          </button>
        </div>
      </div>

      <!-- 8px Baseline Grid -->
      <div class="tweak-section">
        <div class="tweak-row">
          <div>
            <div style="font-weight: 600; font-size: 12px; color: #111827;">8px 베이스라인 그리드</div>
            <div style="font-size: 10px; color: #6B7280;">수직 리듬 및 타이포그래피 정렬 점검</div>
          </div>
          <button class="btn-secondary ${isBaseOn ? 'active' : ''}" id="dockToggleBaselineBtn" style="width: auto; padding: 0 12px;">
            ${isBaseOn ? '베이스라인 끄기' : '베이스라인 켜기'}
          </button>
        </div>
      </div>

      <!-- Responsive Viewport Info -->
      <div class="tweak-section">
        <div class="section-title" style="margin-bottom: 4px;">현재 뷰포트 정보</div>
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding: 4px 0;">
          <span style="color: #6B7280;">해상도</span>
          <span style="font-weight: 600; font-family: ui-monospace, monospace;">${vw} × ${vh} px</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding: 4px 0;">
          <span style="color: #6B7280;">반응형 브레이크포인트</span>
          <span class="dock-badge">${breakpoint}</span>
        </div>
      </div>
    `;

    container.querySelector('#dockToggleGridBtn').addEventListener('click', () => {
      const active = this.overlayCanvas.toggleGrid();
      this.renderGridTab(container);
    });

    container.querySelector('#dockToggleBaselineBtn').addEventListener('click', () => {
      const active = this.overlayCanvas.toggleBaseline();
      this.renderGridTab(container);
    });
  }
}

if (typeof window !== 'undefined') {
  window.FloatingDock = FloatingDock;
}
