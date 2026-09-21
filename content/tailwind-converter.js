// Style Scratcher - Tailwind CSS Converter & Clean CSS Generator

class TailwindConverter {
  /**
   * Convert pixel values to Tailwind spacing tokens or arbitrary values
   * @param {number} px 
   * @param {string} prefix 
   * @returns {string}
   */
  static pxToSpacing(px, prefix = 'p') {
    const spacingMap = {
      0: '0',
      2: '0.5',
      4: '1',
      6: '1.5',
      8: '2',
      10: '2.5',
      12: '3',
      14: '3.5',
      16: '4',
      20: '5',
      24: '6',
      28: '7',
      32: '8',
      36: '9',
      40: '10',
      44: '11',
      48: '12',
      56: '14',
      64: '16',
      72: '18',
      80: '20'
    };

    const val = Math.round(px);
    if (spacingMap[val] !== undefined) {
      return `${prefix}-${spacingMap[val]}`;
    }
    return `${prefix}-[${val}px]`;
  }

  /**
   * Convert border-radius px to Tailwind rounded classes
   * @param {string} radiusStr 
   * @returns {string}
   */
  static radiusToTailwind(radiusStr) {
    const px = parseFloat(radiusStr) || 0;
    if (px === 0) return 'rounded-none';
    if (px <= 2) return 'rounded-sm';
    if (px <= 4) return 'rounded';
    if (px <= 6) return 'rounded-md';
    if (px <= 8) return 'rounded-lg';
    if (px <= 12) return 'rounded-xl';
    if (px <= 16) return 'rounded-2xl';
    if (px <= 24) return 'rounded-3xl';
    if (px > 500) return 'rounded-full';
    return `rounded-[${Math.round(px)}px]`;
  }

  /**
   * Parse RGB/RGBA string to Hex
   * @param {string} rgb 
   * @returns {string}
   */
  static rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return 'transparent';
    if (rgb.startsWith('#')) return rgb.toLowerCase();

    const matches = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!matches) return rgb;

    const r = parseInt(matches[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(matches[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(matches[3], 10).toString(16).padStart(2, '0');
    
    if (matches[4] !== undefined && parseFloat(matches[4]) < 1) {
      const a = Math.round(parseFloat(matches[4]) * 255).toString(16).padStart(2, '0');
      return `#${r}${g}${b}${a}`;
    }
    return `#${r}${g}${b}`;
  }

  /**
   * Convert computed styles of an element into clean Tailwind classes
   * @param {Element} element 
   * @returns {{ tailwind: string, cleanCss: string, html: string }}
   */
  static convert(element) {
    if (!element || !(element instanceof Element)) {
      return { tailwind: '', cleanCss: '', html: '' };
    }

    const computed = window.getComputedStyle(element);
    const tw = [];
    const cssRules = [];

    // 1. Layout & Display
    const display = computed.display;
    if (display === 'flex') {
      tw.push('flex');
      cssRules.push(`display: flex;`);

      if (computed.flexDirection === 'column') tw.push('flex-col');
      if (computed.alignItems === 'center') tw.push('items-center');
      else if (computed.alignItems === 'flex-start') tw.push('items-start');
      else if (computed.alignItems === 'flex-end') tw.push('items-end');

      if (computed.justifyContent === 'center') tw.push('justify-center');
      else if (computed.justifyContent === 'space-between') tw.push('justify-between');
      else if (computed.justifyContent === 'flex-start') tw.push('justify-start');
      else if (computed.justifyContent === 'flex-end') tw.push('justify-end');

      const gap = parseFloat(computed.gap) || 0;
      if (gap > 0) tw.push(this.pxToSpacing(gap, 'gap'));
    } else if (display === 'grid') {
      tw.push('grid');
      cssRules.push(`display: grid;`);
    } else if (display === 'inline-flex') {
      tw.push('inline-flex');
      cssRules.push(`display: inline-flex;`);
    } else if (display === 'inline-block') {
      tw.push('inline-block');
      cssRules.push(`display: inline-block;`);
    }

    // 2. Padding
    const pt = parseFloat(computed.paddingTop) || 0;
    const pr = parseFloat(computed.paddingRight) || 0;
    const pb = parseFloat(computed.paddingBottom) || 0;
    const pl = parseFloat(computed.paddingLeft) || 0;

    if (pt > 0 || pr > 0 || pb > 0 || pl > 0) {
      cssRules.push(`padding: ${pt}px ${pr}px ${pb}px ${pl}px;`);
      if (pt === pr && pr === pb && pb === pl) {
        tw.push(this.pxToSpacing(pt, 'p'));
      } else if (pt === pb && pr === pl) {
        tw.push(this.pxToSpacing(pt, 'py'));
        tw.push(this.pxToSpacing(pr, 'px'));
      } else {
        if (pt > 0) tw.push(this.pxToSpacing(pt, 'pt'));
        if (pr > 0) tw.push(this.pxToSpacing(pr, 'pr'));
        if (pb > 0) tw.push(this.pxToSpacing(pb, 'pb'));
        if (pl > 0) tw.push(this.pxToSpacing(pl, 'pl'));
      }
    }

    // 3. Margin
    const mt = parseFloat(computed.marginTop) || 0;
    const mr = parseFloat(computed.marginRight) || 0;
    const mb = parseFloat(computed.marginBottom) || 0;
    const ml = parseFloat(computed.marginLeft) || 0;

    if (mt > 0 || mr > 0 || mb > 0 || ml > 0) {
      cssRules.push(`margin: ${mt}px ${mr}px ${mb}px ${ml}px;`);
      if (mt === mr && mr === mb && mb === ml) {
        tw.push(this.pxToSpacing(mt, 'm'));
      } else if (mt === mb && mr === ml) {
        tw.push(this.pxToSpacing(mt, 'my'));
        tw.push(this.pxToSpacing(mr, 'mx'));
      } else {
        if (mt > 0) tw.push(this.pxToSpacing(mt, 'mt'));
        if (mr > 0) tw.push(this.pxToSpacing(mr, 'mr'));
        if (mb > 0) tw.push(this.pxToSpacing(mb, 'mb'));
        if (ml > 0) tw.push(this.pxToSpacing(ml, 'ml'));
      }
    }

    // 4. Border Radius
    const tlRadius = computed.borderTopLeftRadius;
    const trRadius = computed.borderTopRightRadius;
    const brRadius = computed.borderBottomRightRadius;
    const blRadius = computed.borderBottomLeftRadius;

    if (tlRadius && (parseFloat(tlRadius) > 0 || parseFloat(trRadius) > 0)) {
      cssRules.push(`border-radius: ${tlRadius} ${trRadius} ${brRadius} ${blRadius};`);
      if (tlRadius === trRadius && trRadius === brRadius && brRadius === blRadius) {
        tw.push(this.radiusToTailwind(tlRadius));
      } else {
        tw.push(`rounded-tl-[${Math.round(parseFloat(tlRadius))}px]`);
        tw.push(`rounded-tr-[${Math.round(parseFloat(trRadius))}px]`);
        tw.push(`rounded-br-[${Math.round(parseFloat(brRadius))}px]`);
        tw.push(`rounded-bl-[${Math.round(parseFloat(blRadius))}px]`);
      }
    }

    // 5. Background Color
    const bg = computed.backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      const hex = this.rgbToHex(bg);
      cssRules.push(`background-color: ${hex};`);
      if (hex === '#ffffff') tw.push('bg-white');
      else if (hex === '#000000') tw.push('bg-black');
      else tw.push(`bg-[${hex}]`);
    }

    // 6. Text Color & Typography
    const color = computed.color;
    if (color) {
      const hex = this.rgbToHex(color);
      cssRules.push(`color: ${hex};`);
      if (hex === '#ffffff') tw.push('text-white');
      else if (hex === '#000000') tw.push('text-black');
      else tw.push(`text-[${hex}]`);
    }

    const fontSize = parseFloat(computed.fontSize) || 16;
    cssRules.push(`font-size: ${Math.round(fontSize)}px;`);
    if (fontSize <= 12) tw.push('text-xs');
    else if (fontSize <= 14) tw.push('text-sm');
    else if (fontSize <= 16) tw.push('text-base');
    else if (fontSize <= 18) tw.push('text-lg');
    else if (fontSize <= 20) tw.push('text-xl');
    else if (fontSize <= 24) tw.push('text-2xl');
    else if (fontSize <= 30) tw.push('text-3xl');
    else if (fontSize <= 36) tw.push('text-4xl');
    else tw.push(`text-[${Math.round(fontSize)}px]`);

    const fontWeight = computed.fontWeight;
    if (fontWeight === '700' || fontWeight === 'bold') { tw.push('font-bold'); cssRules.push('font-weight: 700;'); }
    else if (fontWeight === '600') { tw.push('font-semibold'); cssRules.push('font-weight: 600;'); }
    else if (fontWeight === '500') { tw.push('font-medium'); cssRules.push('font-weight: 500;'); }
    else if (fontWeight === '400' || fontWeight === 'normal') { tw.push('font-normal'); }

    if (computed.textAlign && computed.textAlign !== 'start' && computed.textAlign !== 'left') {
      tw.push(`text-${computed.textAlign}`);
      cssRules.push(`text-align: ${computed.textAlign};`);
    }

    // 7. Border
    const borderWidth = parseFloat(computed.borderTopWidth) || 0;
    if (borderWidth > 0 && computed.borderTopStyle !== 'none') {
      const bHex = this.rgbToHex(computed.borderTopColor);
      cssRules.push(`border: ${borderWidth}px ${computed.borderTopStyle} ${bHex};`);
      tw.push(borderWidth === 1 ? 'border' : `border-[${borderWidth}px]`);
      tw.push(`border-[${bHex}]`);
    }

    // 8. Box Shadow
    const shadow = computed.boxShadow;
    if (shadow && shadow !== 'none') {
      cssRules.push(`box-shadow: ${shadow};`);
      tw.push('shadow-md');
    }

    // Formatted Clean CSS Block
    const tag = element.tagName.toLowerCase();
    const cleanCss = `${tag} {\n  ${cssRules.join('\n  ')}\n}`;

    // HTML Snippet
    let outer = element.outerHTML;
    // If huge innerHTML, truncate inner content for readability
    if (element.children.length > 0) {
      const clone = element.cloneNode(false);
      clone.innerHTML = '...';
      outer = clone.outerHTML;
    }

    return {
      tailwind: tw.join(' '),
      cleanCss: cleanCss,
      html: outer
    };
  }
}

if (typeof window !== 'undefined') {
  window.TailwindConverter = TailwindConverter;
}
