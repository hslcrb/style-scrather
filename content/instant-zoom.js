// Style Scratcher v4.0.0 - Instant Zoom & Step Zoom Engine (Alt++ / Alt+- / Alt+0)

(function () {
if (typeof window !== 'undefined' && window.InstantZoom) return;

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
    this.isActive = false;
    this.manageShortcuts = options.manageShortcuts !== false;
    this.listeners = [];
    this.originalStyles = null;

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      this.initIndicator();
    }
    this.setActive(options.active !== false);
  }

  listen(type, handler, options) {
    window.addEventListener(type, handler, options);
    this.listeners.push({ type, handler, options });
  }

  setActive(active) {
    if (this.isActive === !!active) return;
    this.isActive = !!active;
    if (this.isActive) {
      this.initMouseTracker();
      if (this.manageShortcuts) this.initKeyListeners();
      if (typeof window !== 'undefined' && window.addEventListener) {
        this.listen('blur', () => this.resetZoom());
      }
    } else {
      this.listeners.splice(0).forEach(({ type, handler, options }) => window.removeEventListener(type, handler, options));
      this.restoreStyles();
      this.currentScale = 1;
      this.isZoomed = false;
      clearTimeout(this._badgeTimer);
      if (this.indicator) this.indicator.style.opacity = '0';
    }
  }

  restoreStyles() {
    if (!this.originalStyles || !this.zoomTarget) return;
    const style = this.zoomTarget.style;
    for (const [property, saved] of Object.entries(this.originalStyles)) {
      const cssName = property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      if (style.setProperty) style.setProperty(cssName, saved.value, saved.priority);
      else style[property] = saved.value;
    }
    this.originalStyles = null;
  }

  initMouseTracker() {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    this.listen('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
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
      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #F43F5E;"></span>
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
    this.listen('keydown', (e) => {
      const activeEl = e.composedPath?.()[0] || document.activeElement;
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
    this.listen('keyup', (e) => {
      if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        this.endZoom();
      }
    });
  }

  applyScale(newScale, duration = 280) {
    if (!this.isActive) return;
    const body = (typeof document !== 'undefined' ? document.body : null) || this.zoomTarget;
    if (!body) return;

    this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, Math.round(newScale * 100) / 100));
    this.isZoomed = this.currentScale !== 1.0;

    if (this.currentScale === 1.0) {
      this.restoreStyles();
    } else {
      if (!this.originalStyles) {
        this.zoomTarget = body;
        this.originalStyles = {};
        for (const property of ['transform', 'transformOrigin', 'transition']) {
          const cssName = property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
          this.originalStyles[property] = { value: body.style[property] || '', priority: body.style.getPropertyPriority?.(cssName) || '' };
        }
      }
      const original = this.originalStyles.transform.value;
      body.style.transformOrigin = `${this.mouseX}px ${this.mouseY}px`;
      body.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      body.style.transform = `${original && original !== 'none' ? `${original} ` : ''}scale(${this.currentScale})`;
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
})();
