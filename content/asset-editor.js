// Style Scratcher v3.0.0 - Live Asset & Content Editor (Text, Images, SVG)

class AssetEditor {
  /**
   * Determine asset type of an element
   * @param {Element} element 
   * @returns {'svg' | 'image' | 'text' | 'container'}
   */
  static identifyType(element) {
    if (!element || !(element instanceof Element)) return 'container';
    const tag = element.tagName.toLowerCase();

    if (tag === 'svg' || element.closest('svg')) {
      return 'svg';
    }
    if (tag === 'img' || (element.style && element.style.backgroundImage)) {
      return 'image';
    }
    // If element contains primarily direct text
    if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
      return 'text';
    }
    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'button', 'a', 'label', 'li'].includes(tag)) {
      return 'text';
    }

    return 'container';
  }

  // --- 1. Text Editing ---
  static getText(element) {
    if (!element) return '';
    return element.innerText || element.textContent || '';
  }

  static setText(element, newText) {
    if (!element) return;
    if (element.children.length === 0) {
      element.textContent = newText;
    } else {
      element.innerText = newText;
    }
  }

  static toggleContentEditable(element) {
    if (!element) return false;
    const isEditable = element.isContentEditable;
    element.contentEditable = !isEditable;
    if (!isEditable) {
      element.focus();
    }
    return !isEditable;
  }

  // --- 2. Image Replacing ---
  static getImageSrc(element) {
    if (!element) return '';
    if (element.tagName.toLowerCase() === 'img') {
      return element.src || '';
    }
    const bg = element.style.backgroundImage || window.getComputedStyle(element).backgroundImage;
    const match = bg.match(/url\(["']?([^"']*)["']?\)/);
    return match ? match[1] : '';
  }

  static setImageSrc(element, newSrc) {
    if (!element || !newSrc) return;
    if (element.tagName.toLowerCase() === 'img') {
      element.src = newSrc;
    } else {
      element.style.backgroundImage = `url("${newSrc}")`;
    }
  }

  static setRandomUnsplash(element, keyword = 'design') {
    const randomId = Math.floor(Math.random() * 1000);
    const url = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80&sig=${randomId}`;
    this.setImageSrc(element, url);
    return url;
  }

  // --- 3. SVG & Vector Editing ---
  static getSvgTarget(element) {
    if (!element) return null;
    if (element.tagName.toLowerCase() === 'svg') return element;
    return element.closest('svg');
  }

  static getSvgInfo(element) {
    const svg = this.getSvgTarget(element);
    if (!svg) return null;

    const fill = element.getAttribute('fill') || window.getComputedStyle(element).fill || 'currentColor';
    const stroke = element.getAttribute('stroke') || window.getComputedStyle(element).stroke || 'none';
    const strokeWidth = element.getAttribute('stroke-width') || window.getComputedStyle(element).strokeWidth || '1';
    const opacity = element.getAttribute('opacity') || window.getComputedStyle(element).opacity || '1';

    return {
      svgElement: svg,
      targetElement: element,
      fill: fill,
      stroke: stroke,
      strokeWidth: parseFloat(strokeWidth) || 1,
      opacity: parseFloat(opacity) || 1,
      xml: svg.outerHTML
    };
  }

  static setSvgProperty(element, prop, value) {
    if (!element) return;
    if (prop === 'fill') {
      element.setAttribute('fill', value);
      element.style.fill = value;
    } else if (prop === 'stroke') {
      element.setAttribute('stroke', value);
      element.style.stroke = value;
    } else if (prop === 'strokeWidth') {
      element.setAttribute('stroke-width', value);
      element.style.strokeWidth = `${value}px`;
    } else if (prop === 'opacity') {
      element.setAttribute('opacity', value);
      element.style.opacity = value;
    }
  }

  static setSvgXml(svgElement, newXml) {
    if (!svgElement || !newXml) return;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(newXml, 'image/svg+xml');
      const newSvg = doc.querySelector('svg');
      if (newSvg && svgElement.parentNode) {
        const imported = document.importNode(newSvg, true);
        svgElement.parentNode.replaceChild(imported, svgElement);
        return imported;
      }
    } catch (err) {
      console.warn('[AssetEditor] SVG replacement failed:', err);
    }
    return null;
  }
}

if (typeof window !== 'undefined') {
  window.AssetEditor = AssetEditor;
}
