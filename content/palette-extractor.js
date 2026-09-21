// Style Scratcher - Site Color Palette & Font Extractor

class PaletteExtractor {
  /**
   * Convert any rgb/rgba string to hex
   */
  static rgbToHex(rgbStr) {
    if (!rgbStr) return null;
    if (rgbStr.startsWith('#')) return rgbStr.toUpperCase();
    if (rgbStr === 'transparent' || rgbStr === 'rgba(0, 0, 0, 0)') return null;

    const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;

    const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }

  /**
   * Determine if a hex color is dark
   */
  static isDarkColor(hex) {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return false;
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    // HSP equation
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp < 127.5;
  }

  /**
   * Extract all unique colors and fonts used across the page
   * @param {number} maxElements 
   * @returns {{ colors: Array<{ hex: string, count: number, isDark: boolean }>, fonts: Array<{ family: string, count: number }> }}
   */
  static extract() {
    const colorCounts = new Map();
    const fontCounts = new Map();

    const addColor = (rawVal) => {
      const hex = this.rgbToHex(rawVal);
      if (hex) {
        colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
      }
    };

    const addFont = (familyStr) => {
      if (!familyStr) return;
      // Clean font stack e.g. "Inter", -apple-system, sans-serif -> "Inter"
      const firstFont = familyStr.split(',')[0].replace(/['"]/g, '').trim();
      if (firstFont && firstFont.length > 1) {
        fontCounts.set(firstFont, (fontCounts.get(firstFont) || 0) + 1);
      }
    };

    // 1. Scan DOM elements
    const elements = document.querySelectorAll('body *:not([data-style-scratcher])');
    const sampleSize = Math.min(elements.length, 300); // sampling for performance

    for (let i = 0; i < sampleSize; i++) {
      const el = elements[i];
      // Skip hidden elements or scratcher elements
      if (el.offsetParent === null && el.tagName !== 'BODY') continue;

      try {
        const computed = window.getComputedStyle(el);
        addColor(computed.backgroundColor);
        addColor(computed.color);
        addColor(computed.borderTopColor);
        addFont(computed.fontFamily);
      } catch (e) {
        // ignore detached or inaccessible nodes
      }
    }

    // 2. Scan Stylesheet text for color patterns (#hex, rgb)
    const sheets = Array.from(document.styleSheets);
    sheets.forEach(sheet => {
      try {
        if (!sheet.cssRules) return;
        const rules = Array.from(sheet.cssRules);
        rules.forEach(rule => {
          if (!rule.cssText) return;
          const hexMatches = rule.cssText.match(/#[0-9a-fA-F]{3,6}\b/g);
          if (hexMatches) {
            hexMatches.forEach(h => {
              let norm = h.toUpperCase();
              if (norm.length === 4) {
                norm = `#${norm[1]}${norm[1]}${norm[2]}${norm[2]}${norm[3]}${norm[3]}`;
              }
              colorCounts.set(norm, (colorCounts.get(norm) || 0) + 1);
            });
          }
        });
      } catch (cors) {
        // ignore cross-origin security errors
      }
    });

    // Format & Sort Colors
    const sortedColors = Array.from(colorCounts.entries())
      .map(([hex, count]) => ({
        hex,
        count,
        isDark: this.isDarkColor(hex)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 32); // top 32 colors

    // Format & Sort Fonts
    const sortedFonts = Array.from(fontCounts.entries())
      .map(([family, count]) => ({
        family,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      colors: sortedColors,
      fonts: sortedFonts
    };
  }
}

if (typeof window !== 'undefined') {
  window.PaletteExtractor = PaletteExtractor;
}
