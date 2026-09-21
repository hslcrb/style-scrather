// Style Scratcher v2.1.0 - Instant Zoom In/Out Engine (Figma-style momentary canvas zoom)

class InstantZoom {
  constructor(options = {}) {
    this.isZoomed = false;
    this.isHolding = false;
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.maxScale = 2.4; // 240% magnification
    this.zoomTarget = document.body;
    this.originalStyle = '';
    this.indicator = null;
    this.onZoomChange = options.onZoomChange || (() => {});

    this.initMouseTracker();
    this.initIndicator();
    this.initKeyListeners();
  }

  initMouseTracker() {
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      if (!this.isZoomed && this.zoomTarget) {
        this.zoomTarget.style.transformOrigin = `${this.mouseX}px ${this.mouseY}px`;
      }
    }, { passive: true });
  }

  initIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.id = 'style-scratcher-zoom-badge';
    this.indicator.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-30px);
      background: rgba(17, 24, 39, 0.92);
      color: #FFFFFF;
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      pointer-events: none;
      z-index: 2147483647;
      opacity: 0;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    this.indicator.innerHTML = `
      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #3B82F6;"></span>
      <span>인스턴트 줌 (2.4x) • 손을 떼면 원복</span>
    `;
    const target = document.body || document.documentElement;
    if (target && target.appendChild) {
      target.appendChild(this.indicator);
    }
  }

  initKeyListeners() {
    // Hold Z to Instant Zoom In, Release Z to fast Zoom Out
    window.addEventListener('keydown', (e) => {
      // Don't trigger when typing in input, textarea, or contenteditable
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }

      if ((e.key === 'z' || e.key === 'Z') && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) {
        this.startZoom();
      }
    });

    window.addEventListener('keyup', (e) => {
      if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey) {
        this.endZoom();
      }
    });
  }

  startZoom(customScale = this.maxScale) {
    if (this.isZoomed) return;
    this.isZoomed = true;

    const body = document.body;
    if (!body) return;

    // Set transform-origin right at cursor position
    body.style.transformOrigin = `${this.mouseX}px ${this.mouseY}px`;
    
    // Zoom-in Curve: Silky, gentle, deep deceleration (520ms)
    body.style.transition = 'transform 520ms cubic-bezier(0.16, 1, 0.3, 1)';
    body.style.transform = `scale(${customScale})`;

    if (this.indicator) {
      this.indicator.style.transform = 'translateX(-50%) translateY(0)';
      this.indicator.style.opacity = '1';
    }

    this.onZoomChange(true);
  }

  endZoom() {
    if (!this.isZoomed) return;
    this.isZoomed = false;

    const body = document.body;
    if (!body) return;

    // Zoom-out Curve: Much faster than zoom-in (200ms vs 520ms), snappy cubic-bezier
    body.style.transition = 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)';
    body.style.transform = 'scale(1)';

    if (this.indicator) {
      this.indicator.style.transform = 'translateX(-50%) translateY(-30px)';
      this.indicator.style.opacity = '0';
    }

    // Clean up transform after animation finishes
    setTimeout(() => {
      if (!this.isZoomed && body) {
        body.style.transition = '';
        body.style.transform = '';
      }
    }, 220);

    this.onZoomChange(false);
  }
}

if (typeof window !== 'undefined') {
  window.InstantZoom = InstantZoom;
}
