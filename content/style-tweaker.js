// Style Scratcher - Real-time Element Style Tweaker & Sandbox

class StyleTweaker {
  constructor(onChangeCallback) {
    this.currentElement = null;
    this.originalStyles = new Map(); // WeakMap or Map storing original element styles
    this.modifiedProps = new Set();
    this.onChange = onChangeCallback || (() => {});
  }

  setElement(el) {
    if (this.currentElement === el) return;
    this.currentElement = el;

    if (el && !this.originalStyles.has(el)) {
      // Save original inline style attribute string
      this.originalStyles.set(el, el.getAttribute('style') || '');
    }
    this.modifiedProps.clear();
    this.notify();
  }

  getElement() {
    return this.currentElement;
  }

  getComputed() {
    if (!this.currentElement) return null;
    return window.getComputedStyle(this.currentElement);
  }

  applyStyle(prop, val) {
    if (!this.currentElement) return;
    this.currentElement.style[prop] = val;
    this.modifiedProps.add(prop);
    this.notify();
  }

  // --- Border Radius Controls ---
  setUnifiedRadius(px) {
    const val = `${Math.max(0, px)}px`;
    this.applyStyle('borderTopLeftRadius', val);
    this.applyStyle('borderTopRightRadius', val);
    this.applyStyle('borderBottomRightRadius', val);
    this.applyStyle('borderBottomLeftRadius', val);
  }

  setCornerRadius(corner, px) {
    const propMap = {
      'tl': 'borderTopLeftRadius',
      'tr': 'borderTopRightRadius',
      'br': 'borderBottomRightRadius',
      'bl': 'borderBottomLeftRadius'
    };
    const prop = propMap[corner];
    if (prop) {
      this.applyStyle(prop, `${Math.max(0, px)}px`);
    }
  }

  // --- Spacing (Padding / Margin) Controls ---
  setPadding(side, px) {
    const propMap = {
      'top': 'paddingTop',
      'right': 'paddingRight',
      'bottom': 'paddingBottom',
      'left': 'paddingLeft',
      'all': 'padding'
    };
    const prop = propMap[side];
    if (prop) {
      this.applyStyle(prop, `${px}px`);
    }
  }

  setMargin(side, px) {
    const propMap = {
      'top': 'marginTop',
      'right': 'marginRight',
      'bottom': 'marginBottom',
      'left': 'marginLeft',
      'all': 'margin'
    };
    const prop = propMap[side];
    if (prop) {
      this.applyStyle(prop, `${px}px`);
    }
  }

  // --- Color Controls ---
  setColor(type, colorVal) {
    if (type === 'background') this.applyStyle('backgroundColor', colorVal);
    else if (type === 'text') this.applyStyle('color', colorVal);
    else if (type === 'border') this.applyStyle('borderColor', colorVal);
  }

  // --- Typography Controls ---
  setFontSize(px) {
    this.applyStyle('fontSize', `${Math.max(8, px)}px`);
  }

  setFontWeight(weight) {
    this.applyStyle('fontWeight', weight);
  }

  setLineHeight(val) {
    this.applyStyle('lineHeight', val);
  }

  setLetterSpacing(px) {
    this.applyStyle('letterSpacing', `${px}px`);
  }

  setTextAlign(align) {
    this.applyStyle('textAlign', align);
  }

  // --- Effects ---
  setOpacity(val) {
    this.applyStyle('opacity', val);
  }

  // --- Reset Functionality ---
  resetCurrentElement() {
    if (!this.currentElement) return;

    if (this.originalStyles.has(this.currentElement)) {
      const orig = this.originalStyles.get(this.currentElement);
      if (orig) {
        this.currentElement.setAttribute('style', orig);
      } else {
        this.currentElement.removeAttribute('style');
      }
    }
    this.modifiedProps.clear();
    this.notify();
  }

  hasModifications() {
    return this.modifiedProps.size > 0;
  }

  notify() {
    this.onChange(this.currentElement);
  }
}

if (typeof window !== 'undefined') {
  window.StyleTweaker = StyleTweaker;
}
