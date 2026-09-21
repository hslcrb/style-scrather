// Style Scratcher v2.0 - Multi-Unit Measurement & Conversion Engine

class UnitConverter {
  constructor() {
    this.currentUnit = 'px'; // 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh' | 'pt'
    this.baseFontSize = 16; // default root font size in px
    this.updateBaseFontSize();
  }

  updateBaseFontSize() {
    try {
      if (typeof window !== 'undefined' && document.documentElement) {
        const rootFs = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
        if (rootFs && !isNaN(rootFs)) {
          this.baseFontSize = rootFs;
        }
      }
    } catch (e) {
      this.baseFontSize = 16;
    }
  }

  setUnit(unit) {
    const validUnits = ['px', 'rem', 'em', '%', 'vw', 'vh', 'pt'];
    if (validUnits.includes(unit)) {
      this.currentUnit = unit;
    }
  }

  getUnit() {
    return this.currentUnit;
  }

  /**
   * Convert px value to target unit
   * @param {number} px 
   * @param {string} unit 
   * @param {Object} context - { element, parentElement, isVertical }
   * @returns {{ value: number, formatted: string, rawPx: number }}
   */
  convert(px, unit = this.currentUnit, context = {}) {
    this.updateBaseFontSize();
    const rawPx = Math.round(px);

    if (unit === 'px') {
      return { value: rawPx, formatted: `${rawPx}px`, rawPx };
    }

    if (unit === 'rem') {
      const val = parseFloat((px / this.baseFontSize).toFixed(3));
      return { value: val, formatted: `${val}rem`, rawPx };
    }

    if (unit === 'em') {
      let elFs = this.baseFontSize;
      if (context.element) {
        try {
          elFs = parseFloat(window.getComputedStyle(context.element).fontSize) || this.baseFontSize;
        } catch {}
      }
      const val = parseFloat((px / elFs).toFixed(3));
      return { value: val, formatted: `${val}em`, rawPx };
    }

    if (unit === '%') {
      let parentDim = 1000;
      if (context.parentElement) {
        const pRect = context.parentElement.getBoundingClientRect();
        parentDim = context.isVertical ? pRect.height : pRect.width;
      } else {
        parentDim = context.isVertical ? window.innerHeight : window.innerWidth;
      }
      const val = parseFloat(((px / (parentDim || 1)) * 100).toFixed(1));
      return { value: val, formatted: `${val}%`, rawPx };
    }

    if (unit === 'vw') {
      const vw = window.innerWidth || 1920;
      const val = parseFloat(((px / vw) * 100).toFixed(2));
      return { value: val, formatted: `${val}vw`, rawPx };
    }

    if (unit === 'vh') {
      const vh = window.innerHeight || 1080;
      const val = parseFloat(((px / vh) * 100).toFixed(2));
      return { value: val, formatted: `${val}vh`, rawPx };
    }

    if (unit === 'pt') {
      // 1pt = 1/72 inch, 1px = 1/96 inch => 1px = 0.75pt
      const val = parseFloat((px * 0.75).toFixed(1));
      return { value: val, formatted: `${val}pt`, rawPx };
    }

    return { value: rawPx, formatted: `${rawPx}px`, rawPx };
  }

  /**
   * Format dual badge string e.g. "1.5rem (24px)"
   */
  formatBadge(px, unit = this.currentUnit, context = {}) {
    const res = this.convert(px, unit, context);
    if (unit === 'px') {
      return `${res.rawPx}px`;
    }
    return `${res.formatted} (${res.rawPx}px)`;
  }
}

if (typeof window !== 'undefined') {
  window.UnitConverter = UnitConverter;
}
