// Style Scratcher v3.0.0 - Sensory Color Suite & EyeDropper System

class ColorSuite {
  /**
   * Calculate relative luminance according to WCAG 2.1
   */
  static getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  /**
   * Parse hex string to RGB
   */
  static hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return [0, 0, 0];
    let h = hex.replace('#', '').trim();
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    if (h.length < 6) return [0, 0, 0];
    const num = parseInt(h.slice(0, 6), 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  /**
   * Calculate WCAG Contrast Ratio between two hex colors (e.g. 4.5:1)
   */
  static getContrastRatio(hex1, hex2) {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    const lum1 = this.getLuminance(...rgb1);
    const lum2 = this.getLuminance(...rgb2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);

    return {
      ratio: parseFloat(ratio.toFixed(2)),
      score: ratio >= 7.0 ? 'AAA' : (ratio >= 4.5 ? 'AA' : (ratio >= 3.0 ? 'AA Large' : 'Fail')),
      passesAA: ratio >= 4.5,
      passesAAA: ratio >= 7.0
    };
  }

  /**
   * Invoke Native EyeDropper API (Chrome 95+)
   * @returns {Promise<string|null>} sampled hex code
   */
  static async pickColorWithEyeDropper() {
    if (typeof window !== 'undefined' && window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        return result.sRGBHex;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[ColorSuite] EyeDropper error:', err);
        }
        return null;
      }
    }
    return null;
  }

  /**
   * Curated Designer Preset Palette
   */
  static getPresets() {
    return [
      '#FFFFFF', '#F8FAFC', '#E2E8F0', '#94A3B8',
      '#475569', '#1E293B', '#0F172A', '#000000',
      '#E11D48', '#F43F5E', '#FB7185', '#FFF1F2',
      '#7C3AED', '#8B5CF6', '#10B981', '#EF4444'
    ];
  }
}

if (typeof window !== 'undefined') {
  window.ColorSuite = ColorSuite;
}
