// Style Scratcher v4.0.0 - React (JSX) Exporter & Asset Downloader

class ReactExporter {
  /**
   * Generate clean React (JSX) component code from DOM element
   * @param {Element} element 
   * @returns {{ jsx: string, tailwind: string, componentName: string }}
   */
  static generateReact(element) {
    const isValidEl = element && (
      (typeof Element !== 'undefined' && element instanceof Element) ||
      (element.tagName && typeof element.tagName === 'string')
    );
    if (!isValidEl) {
      return { jsx: '', tailwind: '', componentName: 'Component' };
    }

    const tag = element.tagName.toLowerCase();
    const componentName = tag.charAt(0).toUpperCase() + tag.slice(1) + 'Block';

    // Get Tailwind classes if TailwindConverter exists
    const tw = typeof TailwindConverter !== 'undefined' ? TailwindConverter.convert(element).tailwind : '';

    // Fallback className from style if tw not available and no className
    const styleClassName = !tw && !element.className && element.style
      ? Object.entries(element.style).filter(([, v]) => v).map(([k]) => `has-${k}`).join(' ')
      : '';

    // Convert DOM element attributes to JSX
    const formatAttrs = (el) => {
      const attrs = [];
      if (tw) {
        attrs.push(`className="${tw}"`);
      } else if (el.className && typeof el.className === 'string') {
        attrs.push(`className="${el.className.trim()}"`);
      } else if (styleClassName) {
        attrs.push(`className="${styleClassName}"`);
      }

      if (el.id) attrs.push(`id="${el.id}"`);
      const getAttr = el.getAttribute ? (a) => el.getAttribute(a) : () => null;
      if (getAttr('src')) attrs.push(`src="${getAttr('src')}"`);
      if (getAttr('alt')) attrs.push(`alt="${getAttr('alt')}"`);
      if (getAttr('href')) attrs.push(`href="${getAttr('href')}"`);
      if (getAttr('target')) attrs.push(`target="${getAttr('target')}"`);

      return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
    };

    const childNodes = element.childNodes || [];
    const text = childNodes.length === 1 && childNodes[0] && childNodes[0].nodeType === 3
      ? (element.textContent || '').trim()
      : '';

    const isSelfClosing = ['img', 'input', 'hr', 'br'].includes(tag);

    let innerContent = text;
    if (!innerContent && !isSelfClosing) {
      innerContent = `\n    {/* Content of <${tag}> */}\n    ${element.innerText ? element.innerText.slice(0, 100).trim() : ''}\n  `;
    }

    const jsxTag = isSelfClosing
      ? `<${tag}${formatAttrs(element)} />`
      : `<${tag}${formatAttrs(element)}>${innerContent}</${tag}>`;

    const fullComponent = `
import React from 'react';

export default function GeneratedComponent() {
  return (
    ${jsxTag}
  );
}
    `.trim();

    return {
      jsx: fullComponent,
      tailwind: tw,
      componentName
    };
  }

  /**
   * Download image, SVG, or background asset to user's disk
   */
  static downloadAsset(element) {
    if (!element) return null;
    const tag = element.tagName.toLowerCase();

    // 1. SVG element
    const svgTarget = tag === 'svg' ? element : element.closest('svg');
    if (svgTarget) {
      const svgXml = svgTarget.outerHTML;
      const blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const filename = `asset-vector-${Date.now()}.svg`;
      this.triggerDownload(url, filename);
      return { type: 'svg', filename };
    }

    // 2. <img> Tag
    if (tag === 'img' && element.src) {
      const src = element.src;
      const filename = src.split('/').pop().split('?')[0] || `image-${Date.now()}.png`;
      this.fetchAndDownload(src, filename);
      return { type: 'image', filename, src };
    }

    // 3. Background Image
    const bg = element.style?.backgroundImage || window.getComputedStyle(element).backgroundImage;
    const match = bg ? bg.match(/url\(["']?([^"']*)["']?\)/) : null;
    if (match && match[1]) {
      const src = match[1];
      const filename = src.split('/').pop().split('?')[0] || `background-${Date.now()}.png`;
      this.fetchAndDownload(src, filename);
      return { type: 'background', filename, src };
    }

    return null;
  }

  static triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  static async fetchAndDownload(url, filename) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      this.triggerDownload(objUrl, filename);
    } catch (e) {
      // Fallback direct link
      this.triggerDownload(url, filename);
    }
  }
}

// generateComponent() is an alias for generateReact() with simplified output
ReactExporter.generateComponent = function(element) {
  const result = ReactExporter.generateReact(element);
  return result ? result.jsx : '';
};

if (typeof window !== 'undefined') {
  window.ReactExporter = ReactExporter;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReactExporter;
}
