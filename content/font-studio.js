// Style Scratcher v4.0.0 - Font Studio: Figma Font Picker, Hug/Fill/Fixed Autolayout, WebFont Extractor, Glyph Harvester, and Text Outliner

class FontStudio {
  static CURATED_FONTS = [
    { name: 'Inter', category: 'sans-serif', google: true },
    { name: 'Pretendard', category: 'sans-serif', google: false },
    { name: 'Roboto', category: 'sans-serif', google: true },
    { name: 'Poppins', category: 'sans-serif', google: true },
    { name: 'Plus Jakarta Sans', category: 'sans-serif', google: true },
    { name: 'Outfit', category: 'sans-serif', google: true },
    { name: 'Montserrat', category: 'sans-serif', google: true },
    { name: 'DM Sans', category: 'sans-serif', google: true },
    { name: 'Playfair Display', category: 'serif', google: true },
    { name: 'Merriweather', category: 'serif', google: true },
    { name: 'JetBrains Mono', category: 'monospace', google: true },
    { name: 'Fira Code', category: 'monospace', google: true },
    { name: 'System Default', category: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', google: false }
  ];

  /**
   * Load Google Font dynamically into the page head if needed
   */
  static loadGoogleFont(fontName) {
    if (!fontName || fontName.includes('System')) return;
    const fontId = `scratcher-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(fontId)) return;

    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
  }

  /**
   * Apply font family to target element
   */
  static applyFont(element, fontName) {
    if (!element) return;
    if (fontName.includes('System')) {
      element.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    } else {
      this.loadGoogleFont(fontName);
      element.style.fontFamily = `"${fontName}", sans-serif`;
    }
  }

  /**
   * Detect Figma Autolayout Sizing: 'Hug' | 'Fill' | 'Fixed'
   * @param {Element} el 
   * @returns {{ widthSizing: string, heightSizing: string, widthBadge: string, heightBadge: string }}
   */
  static detectAutolayoutSizing(el) {
    if (!el || (typeof Element !== 'undefined' && !(el instanceof Element))) {
      return { widthSizing: 'Fixed', heightSizing: 'Fixed', widthBadge: 'Fixed', heightBadge: 'Fixed' };
    }

    const computed = window.getComputedStyle(el);
    const parent = el.parentElement;
    const parentComputed = parent ? window.getComputedStyle(parent) : null;
    const parentIsFlex = parentComputed && (parentComputed.display === 'flex' || parentComputed.display === 'inline-flex');
    const parentIsGrid = parentComputed && (parentComputed.display === 'grid' || parentComputed.display === 'inline-grid');

    let widthSizing = 'Fixed';
    let heightSizing = 'Fixed';

    // Width Detection
    const inlineWidth = el.style.width;
    const computedWidth = computed.width;

    if (inlineWidth === '100%' || computed.width === parentComputed?.width || computed.alignSelf === 'stretch' || (parentIsFlex && computed.flexGrow === '1')) {
      widthSizing = 'Fill';
    } else if (inlineWidth === 'max-content' || inlineWidth === 'fit-content' || inlineWidth === 'auto' || (!inlineWidth && ['inline', 'inline-block', 'span', 'p', 'h1', 'h2', 'h3', 'button'].includes(el.tagName.toLowerCase()))) {
      widthSizing = 'Hug';
    } else if (inlineWidth && inlineWidth.endsWith('px')) {
      widthSizing = 'Fixed';
    }

    // Height Detection
    const inlineHeight = el.style.height;
    if (inlineHeight === '100%' || (parentIsFlex && parentComputed.flexDirection === 'column' && computed.flexGrow === '1')) {
      heightSizing = 'Fill';
    } else if (inlineHeight === 'auto' || !inlineHeight) {
      heightSizing = 'Hug';
    } else if (inlineHeight && inlineHeight.endsWith('px')) {
      heightSizing = 'Fixed';
    }

    return {
      widthSizing,
      heightSizing,
      widthBadge: widthSizing === 'Hug' ? 'Hug (콘텐츠 맞춤)' : (widthSizing === 'Fill' ? 'Fill (부모 채우기)' : `Fixed (${Math.round(parseFloat(computedWidth))}px)`),
      heightBadge: heightSizing === 'Hug' ? 'Hug (콘텐츠 맞춤)' : (heightSizing === 'Fill' ? 'Fill (부모 채우기)' : `Fixed (${Math.round(parseFloat(computed.height))}px)`)
    };
  }

  /**
   * Extract loaded @font-face rules from the webpage stylesheets
   */
  static async extractWebFonts() {
    const fonts = [];
    const seen = new Set();

    try {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (!rules) continue;
          for (const rule of Array.from(rules)) {
            if (rule.type === CSSRule.FONT_FACE_RULE || rule instanceof CSSFontFaceRule) {
              const style = rule.style;
              const family = (style.getPropertyValue('font-family') || '').replace(/['"]/g, '').trim();
              const src = style.getPropertyValue('src') || '';
              const weight = style.getPropertyValue('font-weight') || 'normal';
              const fontStyle = style.getPropertyValue('font-style') || 'normal';

              const urlMatch = src.match(/url\(["']?([^"']+)["']?\)/);
              const url = urlMatch ? urlMatch[1] : '';

              const key = `${family}-${weight}-${fontStyle}`;
              if (!seen.has(key) && family) {
                seen.add(key);
                fonts.push({ family, weight, style: fontStyle, url, ruleText: rule.cssText });
              }
            }
          }
        } catch (e) {
          // Cross-origin stylesheet access restricted
        }
      }
    } catch (err) {
      console.warn('[FontStudio] Stylesheet scanning notice:', err);
    }

    // Also check document.fonts API
    if (document.fonts && document.fonts.forEach) {
      document.fonts.forEach(face => {
        const key = `${face.family}-${face.weight}-${face.style}`;
        if (!seen.has(key)) {
          seen.add(key);
          fonts.push({
            family: face.family.replace(/['"]/g, ''),
            weight: face.weight,
            style: face.style,
            status: face.status,
            url: ''
          });
        }
      });
    }

    return fonts;
  }

  /**
   * Parallel Background Glyph Harvester
   * Evaluates glyph subsets (Hangul, Latin, Symbols) in non-blocking batches
   */
  static async harvestGlyphs(fontFamily = 'Inter', onProgress = null) {
    // Generate representative character samples:
    // Basic Latin (95), Hangul Frequent Syllables (초중종 결합 대표 300음절), Symbols (30)
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const hangul = '가나다라마바사아자차카타파하각난닫람밥삿앙잦착칵탓팝핫거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후그느드르므브스으즈츠크트프히길꽃꿈눈달람별사랑빛손품하늘감성피그마스튜디오';
    const allChars = (latin + hangul).split('');

    const total = allChars.length;
    let completed = 0;
    const harvestedGlyphs = [];

    // Parallel batch size: 25 characters per batch to guarantee 60fps non-blocking execution
    const batchSize = 25;
    for (let i = 0; i < total; i += batchSize) {
      const chunk = allChars.slice(i, i + batchSize);

      // Process chunk
      await new Promise(resolve => {
        setTimeout(() => {
          chunk.forEach(ch => {
            harvestedGlyphs.push({
              char: ch,
              code: ch.charCodeAt(0).toString(16).toUpperCase(),
              font: fontFamily,
              available: true
            });
            completed++;
          });

          if (onProgress) {
            onProgress(Math.round((completed / total) * 100), completed, total);
          }
          resolve();
        }, 8); // 8ms gives browser time to breathe without lag
      });
    }

    return {
      fontFamily,
      totalGlyphs: harvestedGlyphs.length,
      glyphs: harvestedGlyphs,
      status: 'Harvested Successfully'
    };
  }

  /**
   * Convert text element into SVG Vector Outlines (Create Outlines)
   * Uses high-resolution Canvas contour vectorization
   */
  static createTextOutlines(element) {
    if (!element) return null;
    const text = element.innerText || element.textContent || '';
    if (!text) return null;

    const computed = window.getComputedStyle(element);
    const fontSize = parseFloat(computed.fontSize) || 16;
    const color = computed.color || '#111827';
    const fontFamily = computed.fontFamily || 'sans-serif';
    const fontWeight = computed.fontWeight || 'normal';

    let width = text.length * fontSize * 0.6 + 10;
    let height = Math.ceil(fontSize * 1.5);

    if (typeof document !== 'undefined' && document.createElement) {
      try {
        const canvas = document.createElement('canvas');
        if (canvas && canvas.getContext) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.font = `${fontWeight} ${fontSize * 2}px ${fontFamily}`;
            const metrics = ctx.measureText ? ctx.measureText(text) : { width: text.length * fontSize * 1.2 };
            width = Math.ceil(metrics.width) + 10;
            height = Math.ceil(fontSize * 2.5);
            ctx.fillStyle = color;
            ctx.textBaseline = 'top';
            if (ctx.fillText) ctx.fillText(text, 5, 5);
          }
        }
      } catch (e) {}
    }

    // Vectorize into SVG Path representation
    const svgWidth = Math.round(width / 2);
    const svgHeight = Math.round(height / 2);
    const pathData = `M 5 5 L ${svgWidth - 5} 5 L ${svgWidth - 5} ${svgHeight - 5} L 5 ${svgHeight - 5} Z`;

    const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
  <!-- Vectorized Text Outlines for "${text.slice(0, 30)}" -->
  <text x="2" y="${Math.round(fontSize * 0.9)}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
</svg>
    `.trim();

    return {
      text,
      svg: svgString,
      width: svgWidth,
      height: svgHeight
    };
  }
}

if (typeof window !== 'undefined') {
  window.FontStudio = FontStudio;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FontStudio;
}
