// Style Scratcher v4.0.0 - Instant Zoom & Step Zoom Engine (Alt++ / Alt+- / Alt+0)

class InstantZoom {
  constructor(options = {}) {
    this.isZoomed = false;
    this.currentScale = 1.0;
    this.mouseX = (typeof window !== 'undefined' ? window.innerWidth : 1920) / 2;
    this.mouseY = (typeof window !== 'undefined' ? window.innerHeight : 1080) / 2;
    this.maxScale = 3.0;
    this.minScale = 0.4;
    this.zoomTarget = typeof document !== 'undefined' ? document.body : null;
    this.indicator = null;
    this.onZoomChange = options.onZoomChange || (() => {});

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      this.initMouseTracker();
      this.initIndicator();
      this.initKeyListeners();
    }
  }

  initMouseTracker() {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      if (this.currentScale === 1.0 && this.zoomTarget) {
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
      <span class="zoom-label">줌 배율: 100%</span>
    `;
    const target = document.body || document.documentElement;
    if (target && target.appendChild) {
      target.appendChild(this.indicator);
    }
  }

  showBadge(text) {
    if (!this.indicator) return;
    const label = this.indicator.querySelector('.zoom-label');
    if (label) label.textContent = text;
    this.indicator.style.transform = 'translateX(-50%) translateY(0)';
    this.indicator.style.opacity = '1';

    clearTimeout(this._badgeTimer);
    this._badgeTimer = setTimeout(() => {
      if (this.indicator) {
        this.indicator.style.transform = 'translateX(-50%) translateY(-30px)';
        this.indicator.style.opacity = '0';
      }
    }, 1800);
  }

  initKeyListeners() {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    window.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }

      // Alt + + or Alt + = (Zoom In)
      if (e.altKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        this.zoomIn();
      }
      // Alt + - (Zoom Out)
      else if (e.altKey && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        this.zoomOut();
      }
      // Alt + 0 (Reset Zoom)
      else if (e.altKey && e.key === '0') {
        e.preventDefault();
        this.resetZoom();
      }
      // Fallback hold Z (Legacy support)
      else if ((e.key === 'z' || e.key === 'Z') && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) {
        this.startZoom();
      }
    });

    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    window.addEventListener('keyup', (e) => {
      if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        this.endZoom();
      }
    });
  }

  applyScale(newScale, duration = 280) {
    const body = (typeof document !== 'undefined' ? document.body : null) || this.zoomTarget;
    if (!body) return;

    this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, Math.round(newScale * 100) / 100));
    this.isZoomed = this.currentScale !== 1.0;

    body.style.transformOrigin = `${this.mouseX}px ${this.mouseY}px`;
    body.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;

    if (this.currentScale === 1.0) {
      body.style.transform = 'scale(1)';
      setTimeout(() => {
        if (this.currentScale === 1.0 && body) {
          body.style.transition = '';
          body.style.transform = '';
        }
      }, duration + 20);
    } else {
      body.style.transform = `scale(${this.currentScale})`;
    }

    this.showBadge(`줌 배율: ${Math.round(this.currentScale * 100)}% (Alt + / - / 0)`);
    this.onZoomChange(this.isZoomed, this.currentScale);
  }

  zoomIn(delta = 0.25) {
    this.applyScale(this.currentScale + delta, 260);
  }

  zoomOut(delta = 0.25) {
    this.applyScale(this.currentScale - delta, 260);
  }

  resetZoom() {
    this.applyScale(1.0, 200);
  }

  startZoom(customScale = 2.4) {
    this.applyScale(customScale, 450);
  }

  endZoom() {
    this.resetZoom();
  }
}

if (typeof window !== 'undefined') {
  window.InstantZoom = InstantZoom;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InstantZoom;
}

