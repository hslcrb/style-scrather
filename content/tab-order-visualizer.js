// Style Scratcher v4.0.0 - Accessibility Tab Order Flow Visualizer

class TabOrderVisualizer {
  constructor(shadowRoot) {
    this.shadowRoot = shadowRoot;
    this.isActive = false;
    this.container = null;
    this.svg = null;
    this.tabbableElements = [];

    if (typeof document !== 'undefined') {
      this.initDOM();
    }
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.className = 'scratcher-tab-order-stage';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483628;
      display: none;
    `;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.style.cssText = `
      width: 100%;
      height: 100%;
      overflow: visible;
    `;
    this.container.appendChild(this.svg);
    this.shadowRoot.appendChild(this.container);
  }

  /**
   * Find all sequential keyboard tabbable elements on the page according to W3C spec
   */
  findTabbableElements() {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]',
      '[contenteditable="true"]'
    ].join(',');

    const all = Array.from(document.querySelectorAll(selector));
    const host = document.getElementById('style-scratcher-host');

    // Filter out hidden, zero-sized elements or elements inside Style Scratcher host
    const visible = all.filter(el => {
      if (host && (el === host || host.contains(el))) return false;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      return true;
    });

    // Group by tabindex
    const positiveTabIndex = [];
    const zeroOrNaturalIndex = [];

    visible.forEach(el => {
      const ti = parseInt(el.getAttribute('tabindex'), 10);
      if (!isNaN(ti) && ti < 0) {
        // Excluded from sequential keyboard navigation
        return;
      }
      if (!isNaN(ti) && ti > 0) {
        positiveTabIndex.push({ element: el, tabIndex: ti });
      } else {
        zeroOrNaturalIndex.push({ element: el, tabIndex: 0 });
      }
    });

    // Positive tabindexes are navigated first in ascending order
    positiveTabIndex.sort((a, b) => a.tabIndex - b.tabIndex);

    // Combine
    this.tabbableElements = [...positiveTabIndex.map(item => item.element), ...zeroOrNaturalIndex.map(item => item.element)];
    return this.tabbableElements;
  }

  render() {
    if (!this.isActive) {
      this.clear();
      return;
    }

    this.clear();
    const elements = this.findTabbableElements();
    if (elements.length === 0) return;

    // 1. Draw connection flow lines between step N and step N+1
    for (let i = 0; i < elements.length - 1; i++) {
      const r1 = elements[i].getBoundingClientRect();
      const r2 = elements[i + 1].getBoundingClientRect();

      const x1 = r1.left + r1.width / 2;
      const y1 = r1.top + r1.height / 2;
      const x2 = r2.left + r2.width / 2;
      const y2 = r2.top + r2.height / 2;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', '#3B82F6');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-dasharray', '4 3');
      line.setAttribute('opacity', '0.6');
      this.svg.appendChild(line);
    }

    // 2. Draw circular badge with order number on each element
    elements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const order = index + 1;

      // Group
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // Element highlight outline
      const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      box.setAttribute('x', rect.left);
      box.setAttribute('y', rect.top);
      box.setAttribute('width', rect.width);
      box.setAttribute('height', rect.height);
      box.setAttribute('fill', 'rgba(59, 130, 246, 0.08)');
      box.setAttribute('stroke', '#2563EB');
      box.setAttribute('stroke-width', '1.5');
      box.setAttribute('rx', '4');
      g.appendChild(box);

      // Circle badge
      const cx = rect.left + 12;
      const cy = rect.top + 12;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', '11');
      circle.setAttribute('fill', '#2563EB');
      circle.setAttribute('stroke', '#FFFFFF');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))');
      g.appendChild(circle);

      // Number text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', cx);
      text.setAttribute('y', cy + 4);
      text.setAttribute('fill', '#FFFFFF');
      text.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
      text.setAttribute('font-size', '10px');
      text.setAttribute('font-weight', '700');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = order;
      g.appendChild(text);

      this.svg.appendChild(g);
    });
  }

  clear() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }

  toggle(forceState) {
    this.isActive = forceState !== undefined ? forceState : !this.isActive;
    this.container.style.display = this.isActive ? 'block' : 'none';
    if (this.isActive) {
      this.render();
    } else {
      this.clear();
    }
    return this.isActive;
  }
}

if (typeof window !== 'undefined') {
  window.TabOrderVisualizer = TabOrderVisualizer;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TabOrderVisualizer;
}
