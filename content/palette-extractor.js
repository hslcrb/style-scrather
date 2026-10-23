// Style Scratcher - Site Color Palette & Font Extractor

(function () {
if (typeof window !== 'undefined' && window.PaletteExtractor) return;

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

    // Sample without creating a NodeList for the entire page.
    const root = document.body || document.documentElement;
    let scannedElements = 0;
    let sampledElements = 0;
    let scannedRules = 0;
    let cssCharacters = 0;
    let truncated = false;
    if (root) {
      const walker = document.createTreeWalker(root, 1 /* SHOW_ELEMENT */);
      while (scannedElements < 2000 && sampledElements < 300) {
        const el = walker.nextNode();
        if (!el) break;
        scannedElements++;
        if (el.closest?.('[data-style-scratcher]')) continue;
        if (el.offsetParent === null && el.tagName !== 'BODY') continue;
        try {
          const computed = window.getComputedStyle(el);
          addColor(computed.backgroundColor);
          addColor(computed.color);
          addColor(computed.borderTopColor);
          addFont(computed.fontFamily);
          sampledElements++;
        } catch {}
      }
      truncated = scannedElements >= 2000 || sampledElements >= 300;
    }

    // CSS can contain enormous generated rule sets; cap both count and text.
    const sheets = document.styleSheets || [];
    for (let s = 0; s < Math.min(sheets.length, 100); s++) {
      if (scannedRules >= 2000 || cssCharacters >= 200000) { truncated = true; break; }
      try {
        const rules = sheets[s].cssRules;
        if (!rules) continue;
        for (let r = 0; r < rules.length; r++) {
          if (scannedRules >= 2000 || cssCharacters >= 200000) { truncated = true; break; }
          scannedRules++;
          const fullText = rules[r].cssText || '';
          const text = fullText.slice(0, 200000 - cssCharacters);
          if (text.length < fullText.length) truncated = true;
          cssCharacters += text.length;
          for (const hex of text.match(/#[0-9a-fA-F]{3,6}\b/g) || []) {
            let norm = hex.toUpperCase();
            if (norm.length === 4) norm = `#${norm[1]}${norm[1]}${norm[2]}${norm[2]}${norm[3]}${norm[3]}`;
            colorCounts.set(norm, (colorCounts.get(norm) || 0) + 1);
          }
        }
      } catch {}
    }
    if (sheets.length > 100) truncated = true;

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
      fonts: sortedFonts,
      sampledElements, scannedElements, scannedRules, truncated
    };
  }
}

if (typeof window !== 'undefined') {
  window.PaletteExtractor = PaletteExtractor;
}
})();
