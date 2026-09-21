// Style Scratcher v4.0.0 - Responsive Device Mockup & Viewport Simulator (TV, Desktop, Tablet, Mobile)

class DeviceMockup {
  constructor(shadowRoot) {
    this.shadowRoot = shadowRoot;
    this.isActive = false;
    this.container = null;
    this.currentPreset = 'iphone'; // 'tv' | 'desktop' | 'ipad' | 'iphone' | 'galaxy'
    this.scale = 0.85;
    this.isLandscape = false;

    this.presets = {
      tv: {
        name: 'Smart TV (4K 16:9)',
        width: 1920,
        height: 1080,
        aspectRatio: '16 / 9',
        defaultScale: 0.45,
        type: 'tv',
        frameClass: 'device-frame-tv'
      },
      desktop: {
        name: 'Studio Display (16:10)',
        width: 1440,
        height: 900,
        aspectRatio: '16 / 10',
        defaultScale: 0.55,
        type: 'desktop',
        frameClass: 'device-frame-desktop'
      },
      ipad: {
        name: 'iPad Pro (4:3)',
        width: 820,
        height: 1180,
        aspectRatio: '820 / 1180',
        defaultScale: 0.65,
        type: 'tablet',
        frameClass: 'device-frame-ipad'
      },
      iphone: {
        name: 'iPhone 16 Pro',
        width: 393,
        height: 852,
        aspectRatio: '393 / 852',
        defaultScale: 0.85,
        type: 'mobile',
        frameClass: 'device-frame-iphone'
      },
      galaxy: {
        name: 'Galaxy S25 Ultra',
        width: 412,
        height: 915,
        aspectRatio: '412 / 915',
        defaultScale: 0.82,
        type: 'mobile',
        frameClass: 'device-frame-galaxy'
      }
    };

    if (typeof document !== 'undefined') {
      this.initDOM();
    }
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.className = 'scratcher-mockup-stage';
    this.container.style.display = 'none';

    this.container.innerHTML = `
      <!-- Mockup Control Bar -->
      <div class="mockup-toolbar">
        <div class="mockup-brand">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span style="font-weight: 700;">디바이스 뷰포트 시뮬레이터</span>
        </div>

        <div class="mockup-preset-chips" id="mockupPresetChips">
          <button class="mockup-chip" data-preset="tv">📺 TV (16:9)</button>
          <button class="mockup-chip" data-preset="desktop">💻 Desktop</button>
          <button class="mockup-chip" data-preset="ipad">📱 iPad</button>
          <button class="mockup-chip active" data-preset="iphone">📱 iPhone 16</button>
          <button class="mockup-chip" data-preset="galaxy">📱 Galaxy S25</button>
        </div>

        <div class="mockup-scale-group">
          <button class="btn-icon-subtle" id="mockupRotateBtn" title="가로/세로 회전">🔄</button>
          <span style="font-size: 11px; color: #64748B;">배율:</span>
          <input type="range" class="range-slider" id="mockupScaleSlider" min="0.25" max="1.3" step="0.05" value="0.85" style="width: 80px;">
          <span id="mockupScaleText" style="font-size: 11px; font-weight: 700; min-width: 38px;">85%</span>
        </div>

        <button class="btn-secondary" id="closeMockupBtn" style="padding: 4px 10px; font-size: 11px;">
          ✕ 시뮬레이터 닫기
        </button>
      </div>

      <!-- Mockup Viewport Canvas -->
      <div class="mockup-viewport-area">
        <div class="device-bezel" id="deviceBezel">
          <!-- Device Camera / Speaker Notches -->
          <div class="device-notch" id="deviceNotch"></div>
          
          <!-- Embedded Live Iframe -->
          <iframe id="mockupIframe" class="mockup-iframe" src="about:blank" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
        </div>
      </div>
    `;

    this.shadowRoot.appendChild(this.container);
    this.bindEvents();
  }

  bindEvents() {
    // Preset Switching
    this.container.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setPreset(btn.dataset.preset);
      });
    });

    // Scale Slider
    const slider = this.container.querySelector('#mockupScaleSlider');
    const scaleTxt = this.container.querySelector('#mockupScaleText');
    slider.addEventListener('input', (e) => {
      this.scale = parseFloat(e.target.value);
      scaleTxt.textContent = `${Math.round(this.scale * 100)}%`;
      this.applyDeviceStyles();
    });

    // Rotate
    this.container.querySelector('#mockupRotateBtn').addEventListener('click', () => {
      this.isLandscape = !this.isLandscape;
      this.applyDeviceStyles();
    });

    // Close
    this.container.querySelector('#closeMockupBtn').addEventListener('click', () => {
      this.toggle(false);
    });
  }

  getPresets() {
    return this.presets;
  }

  setScale(scaleVal) {
    this.scale = Math.max(0.2, Math.min(1.5, parseFloat(scaleVal) || 0.85));
    if (this.container) {
      this.applyDeviceStyles();
    }
  }

  toggleOrientation() {
    this.isLandscape = !this.isLandscape;
    if (this.container) {
      this.applyDeviceStyles();
    }
    return this.isLandscape;
  }

  setPreset(presetKey) {
    if (!this.presets[presetKey]) return;
    this.currentPreset = presetKey;
    const p = this.presets[presetKey];
    this.scale = p.defaultScale;

    if (this.container) {
      // Update Chips UI
      this.container.querySelectorAll('[data-preset]').forEach(b => {
        b.classList.toggle('active', b.dataset.preset === presetKey);
      });

      const slider = this.container.querySelector('#mockupScaleSlider');
      const scaleTxt = this.container.querySelector('#mockupScaleText');
      if (slider) slider.value = this.scale;
      if (scaleTxt) scaleTxt.textContent = `${Math.round(this.scale * 100)}%`;

      this.applyDeviceStyles();
    }
  }

  applyDeviceStyles() {
    if (!this.container) return;
    const bezel = this.container.querySelector('#deviceBezel');
    const iframe = this.container.querySelector('#mockupIframe');
    const notch = this.container.querySelector('#deviceNotch');
    const p = this.presets[this.currentPreset];
    if (!p) return;

    let w = p.width;
    let h = p.height;
    if (this.isLandscape && (p.type === 'mobile' || p.type === 'tablet')) {
      [w, h] = [h, w];
    }

    // Set Iframe dimensions to device resolution
    if (iframe) {
      iframe.style.width = `${w}px`;
      iframe.style.height = `${h}px`;
    }

    // Apply scale transform with maintained aspect ratio
    if (bezel) {
      bezel.className = `device-bezel ${p.frameClass} ${this.isLandscape ? 'landscape' : ''}`;
      bezel.style.transform = `scale(${this.scale})`;
      bezel.style.transformOrigin = 'center center';
      bezel.style.aspectRatio = p.aspectRatio;
    }

    // Toggle notch
    if (notch) {
      if (p.type === 'mobile') {
        notch.style.display = 'block';
      } else {
        notch.style.display = 'none';
      }
    }
  }

  toggle(forceState) {
    this.isActive = forceState !== undefined ? forceState : !this.isActive;
    if (this.container) {
      this.container.style.display = this.isActive ? 'flex' : 'none';

      if (this.isActive) {
        const iframe = this.container.querySelector('#mockupIframe');
        // Load current site URL into iframe
        try {
          if (iframe && (!iframe.src || iframe.src === 'about:blank')) {
            iframe.src = typeof window !== 'undefined' ? window.location.href : 'about:blank';
          }
        } catch (e) {
          if (iframe && typeof window !== 'undefined') iframe.src = window.location.href;
        }
        this.applyDeviceStyles();
      }
    }
    return this.isActive;
  }
}

if (typeof window !== 'undefined') {
  window.DeviceMockup = DeviceMockup;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DeviceMockup;
}
