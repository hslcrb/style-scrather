// Style Scratcher v3.0.0 - Precision Crosshair & Coordinate Pointer

class PrecisionCursor {
  constructor(shadowRoot) {
    this.shadowRoot = shadowRoot;
    this.isActive = false;
    this.overlay = null;
    this.lineH = null;
    this.lineV = null;
    this.badge = null;

    this.initDOM();
    this.initListeners();
  }

  initDOM() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'scratcher-precision-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483635;
      display: none;
    `;

    // Horizontal line - v4.0.0: 2.5px thickness with 50% opacity
    this.lineH = document.createElement('div');
    this.lineH.style.cssText = `
      position: absolute;
      left: 0;
      width: 100%;
      height: 2.5px;
      background: rgba(37, 99, 235, 0.5);
      box-shadow: 0 0 2px rgba(37, 99, 235, 0.3);
      pointer-events: none;
    `;

    // Vertical line - v4.0.0: 2.5px thickness with 50% opacity
    this.lineV = document.createElement('div');
    this.lineV.style.cssText = `
      position: absolute;
      top: 0;
      height: 100%;
      width: 2.5px;
      background: rgba(37, 99, 235, 0.5);
      box-shadow: 0 0 2px rgba(37, 99, 235, 0.3);
      pointer-events: none;
    `;

    // Coordinate Badge
    this.badge = document.createElement('div');
    this.badge.style.cssText = `
      position: absolute;
      background: #0F172A;
      color: #FFFFFF;
      padding: 4px 8px;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.15);
      transition: transform 0.05s ease;
    `;

    this.overlay.appendChild(this.lineH);
    this.overlay.appendChild(this.lineV);
    this.overlay.appendChild(this.badge);
    this.shadowRoot.appendChild(this.overlay);
  }

  initListeners() {
    window.addEventListener('mousemove', (e) => {
      if (!this.isActive) return;

      const x = e.clientX;
      const y = e.clientY;

      this.lineH.style.top = `${y}px`;
      this.lineV.style.left = `${x}px`;

      // Position badge with offset to avoid cursor overlap
      const offsetX = x + 16 > window.innerWidth - 140 ? -140 : 16;
      const offsetY = y + 24 > window.innerHeight - 40 ? -32 : 16;

      this.badge.style.left = `${x + offsetX}px`;
      this.badge.style.top = `${y + offsetY}px`;

      // Get element tag
      let tagStr = '';
      const target = document.elementFromPoint(x, y);
      if (target && target.tagName) {
        const t = target.tagName.toLowerCase();
        const c = target.className && typeof target.className === 'string' ? `.${target.className.split(/\s+/)[0]}` : '';
        tagStr = ` • <${t}${c}>`;
      }

      this.badge.innerHTML = `<span style="color: #FB7185;">X: ${Math.round(x)}</span> <span style="color: #F87171;">Y: ${Math.round(y)}</span>${tagStr}`;
    }, { passive: true });
  }

  toggle(forceState) {
    this.isActive = forceState !== undefined ? forceState : !this.isActive;
    this.overlay.style.display = this.isActive ? 'block' : 'none';
    return this.isActive;
  }
}

if (typeof window !== 'undefined') {
  window.PrecisionCursor = PrecisionCursor;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PrecisionCursor;
}
