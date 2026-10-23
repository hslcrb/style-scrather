// Style Scratcher v2.0 - Interaction & Pseudo-Class Detector

(function () {
if (typeof window !== 'undefined' && window.InteractionDetector) return;

class InteractionDetector {
  constructor() {
    this.forcedPseudos = new Map(); // element -> Set of active pseudo classes
  }

  /**
   * Extract all active event listeners and inline handlers on element
   * @param {Element} element 
   * @returns {Array<{ type: string, handler: string, isInline: boolean }>}
   */
  getEventListeners(element) {
    if (!element || !(element instanceof Element)) return [];
    const results = [];

    // 1. Check inline on* attributes
    const commonEvents = [
      'click', 'dblclick', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave',
      'mouseover', 'mouseout', 'mousemove', 'keydown', 'keyup', 'keypress',
      'input', 'change', 'submit', 'focus', 'blur', 'scroll', 'touchstart'
    ];

    commonEvents.forEach(evt => {
      const attrName = `on${evt}`;
      const inlineHandler = element.getAttribute(attrName);
      if (inlineHandler) {
        results.push({
          type: evt,
          handler: inlineHandler.slice(0, 250),
          isInline: true
        });
      }
    });

    // 2. Query intercepted listeners from event-interceptor bridge
    if (typeof window !== 'undefined' && window.__STYLE_SCRATCHER_GET_EVENTS__) {
      try {
        const intercepted = window.__STYLE_SCRATCHER_GET_EVENTS__(element);
        if (Array.isArray(intercepted)) {
          intercepted.forEach(item => {
            results.push({
              type: item.type,
              handler: item.source || item.name || '[Function]',
              isInline: false,
              capture: item.capture
            });
          });
        }
      } catch (e) {}
    }

    // 3. Fallback: check DOM element properties directly (e.g. el.onclick)
    commonEvents.forEach(evt => {
      const prop = `on${evt}`;
      if (element[prop] && typeof element[prop] === 'function') {
        const fnStr = element[prop].toString();
        // check if not already added
        if (!results.some(r => r.type === evt && r.handler === fnStr)) {
          results.push({
            type: evt,
            handler: fnStr.slice(0, 250),
            isInline: false
          });
        }
      }
    });

    return results;
  }

  /**
   * Toggle forced pseudo class (:hover, :active, :focus)
   * @param {Element} element 
   * @param {string} pseudo - 'hover' | 'active' | 'focus'
   * @param {boolean} force
   */
  togglePseudo(element, pseudo, force) {
    if (!element || !['hover', 'active', 'focus'].includes(pseudo)) return false;

    let set = this.forcedPseudos.get(element);
    if (!set) {
      set = new Set();
      this.forcedPseudos.set(element, set);
    }

    const shouldEnable = force !== undefined ? force : !set.has(pseudo);
    if (shouldEnable) {
      set.add(pseudo);
      element.classList.add(`__scratcher_${pseudo}__`);
      // Dispatch synthetic event to trigger JS hover listeners if any
      if (pseudo === 'hover') {
        element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
      } else if (pseudo === 'focus') {
        try { element.focus(); } catch {}
      }
    } else {
      set.delete(pseudo);
      element.classList.remove(`__scratcher_${pseudo}__`);
      if (pseudo === 'hover') {
        element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true, cancelable: true }));
      } else if (pseudo === 'focus') {
        try { element.blur(); } catch {}
      }
    }

    if (set.size === 0) this.forcedPseudos.delete(element);
    return shouldEnable;
  }

  isPseudoForced(element, pseudo) {
    if (!element) return false;
    const set = this.forcedPseudos.get(element);
    return set ? set.has(pseudo) : false;
  }

  clearForcedPseudos(element) {
    if (!element) return;
    const set = this.forcedPseudos.get(element);
    if (set) {
      for (const pseudo of [...set]) this.togglePseudo(element, pseudo, false);
    }
  }

  reset() {
    for (const element of [...this.forcedPseudos.keys()]) this.clearForcedPseudos(element);
  }
}

if (typeof window !== 'undefined') {
  window.InteractionDetector = InteractionDetector;
}
})();
