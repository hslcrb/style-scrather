// Style Scratcher - Figma-like Canvas Overlay Engine (Guides, Rulers, Dimensions, 12-Col Grid)

class OverlayCanvas {
  constructor(shadowRoot, unitConverter = null) {
    this.shadowRoot = shadowRoot;
    this.unitConverter = unitConverter || (typeof UnitConverter !== 'undefined' ? new UnitConverter() : null);
    this.svg = null;
    this.hoverElement = null;
    this.selectedElement = null;
    this.selectedElements = []; // v4.0.0 Multi-selection support
    this.isGridVisible = false;
    this.isBaselineVisible = false;
    this.gridConfig = {
      columns: 12,
      gutter: 20,
      margin: 'auto',
      maxContainer: 1200,
      color: '#EF4444',
      opacity: 0.08
    };
    this.tabOrderVisualizer = null;
    this.initSvgOverlay();
  }

  setUnit(unit) {
    if (this.unitConverter) {
      this.unitConverter.setUnit(unit);
      this.render();
    }
  }

  setGridConfig(config = {}) {
    this.gridConfig = { ...this.gridConfig, ...config };
    if (this.isGridVisible) {
      this.render();
    }
  }

  setTabOrderVisualizer(visualizer) {
    this.tabOrderVisualizer = visualizer;
  }

  initSvgOverlay() {
    if (typeof document === 'undefined') return;
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'scratcher-overlay-svg');
    this.svg.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483630;
      overflow: visible;
    `;
    this.shadowRoot.appendChild(this.svg);
  }

  clear() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }

  setHoverElement(el) {
    this.hoverElement = el;
    this.render();
  }

  setSelectedElement(el) {
    this.selectedElement = el;
    this.selectedElements = el ? [el] : [];
    this.render();
  }

  setSelectedElements(elements) {
    this.selectedElements = Array.isArray(elements) ? elements : (elements ? [elements] : []);
    this.selectedElement = this.selectedElements[0] || null;
    this.render();
  }

  toggleGrid(visible) {
    this.isGridVisible = visible !== undefined ? visible : !this.isGridVisible;
    this.render();
    return this.isGridVisible;
  }

  toggleBaseline(visible) {
    this.isBaselineVisible = visible !== undefined ? visible : !this.isBaselineVisible;
    this.render();
    return this.isBaselineVisible;
  }

  render() {
    this.clear();

    // 1. Render 8px Baseline Grid if active
    if (this.isBaselineVisible) {
      this.renderBaselineGrid();
    }

    // 2. Render Custom Responsive Column Grid if active (v4.0.0)
    if (this.isGridVisible) {
      this.renderCustomGrid();
    }

    // 3. Render Selected Elements (Multi-select or single)
    let selRect = null;
    if (this.selectedElements && this.selectedElements.length > 0) {
      this.selectedElements.forEach(el => {
        if (el && document.body.contains(el)) {
          const r = el.getBoundingClientRect();
          this.renderSelectionBox(r, el);
        }
      });
      if (this.selectedElement && document.body.contains(this.selectedElement)) {
        selRect = this.selectedElement.getBoundingClientRect();
      }
    } else if (this.selectedElement && document.body.contains(this.selectedElement)) {
      selRect = this.selectedElement.getBoundingClientRect();
      this.renderSelectionBox(selRect, this.selectedElement);
    }

    // 4. Render Hover Element Box
    let hoverRect = null;
    const isAlreadySelected = this.selectedElements.includes(this.hoverElement) || this.hoverElement === this.selectedElement;
    if (this.hoverElement && document.body.contains(this.hoverElement) && !isAlreadySelected) {
      hoverRect = this.hoverElement.getBoundingClientRect();
      this.renderHoverBox(hoverRect, this.hoverElement);
    }

    // 5. Render Figma Smart Distance Guides between Primary Selected and Hover
    if (selRect && hoverRect) {
      this.renderDistanceGuides(selRect, hoverRect);
    }

    // 6. Render Tab Order Flow if visualizer is active (v4.0.0)
    if (this.tabOrderVisualizer && this.tabOrderVisualizer.isActive) {
      this.tabOrderVisualizer.renderToSvg(this.svg);
    }
  }

  renderSelectionBox(rect, el) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Outline
    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    outline.setAttribute('x', rect.left);
    outline.setAttribute('y', rect.top);
    outline.setAttribute('width', Math.max(1, rect.width));
    outline.setAttribute('height', Math.max(1, rect.height));
    outline.setAttribute('fill', 'rgba(37, 99, 235, 0.04)');
    outline.setAttribute('stroke', '#2563EB');
    outline.setAttribute('stroke-width', '1.5');
    g.appendChild(outline);

    // 4 Corner Handles (Figma style)
    const handleSize = 6;
    const corners = [
      [rect.left - handleSize / 2, rect.top - handleSize / 2],
      [rect.right - handleSize / 2, rect.top - handleSize / 2],
      [rect.right - handleSize / 2, rect.bottom - handleSize / 2],
      [rect.left - handleSize / 2, rect.bottom - handleSize / 2],
    ];

    corners.forEach(([cx, cy]) => {
      const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      handle.setAttribute('x', cx);
      handle.setAttribute('y', cy);
      handle.setAttribute('width', handleSize);
      handle.setAttribute('height', handleSize);
      handle.setAttribute('fill', '#FFFFFF');
      handle.setAttribute('stroke', '#2563EB');
      handle.setAttribute('stroke-width', '1.5');
      g.appendChild(handle);
    });

    // Badge: Tag Name + Dimensions (High Visibility)
    const tag = el.tagName.toLowerCase();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const badgeText = `<${tag}> • ${w} × ${h}px`;
    this.renderBadge(g, rect.left, rect.top - 28, badgeText, '#2563EB', '#FFFFFF');

    this.svg.appendChild(g);
  }

  renderHoverBox(rect, el) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Outline
    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    outline.setAttribute('x', rect.left);
    outline.setAttribute('y', rect.top);
    outline.setAttribute('width', Math.max(1, rect.width));
    outline.setAttribute('height', Math.max(1, rect.height));
    outline.setAttribute('fill', 'rgba(59, 130, 246, 0.08)');
    outline.setAttribute('stroke', '#3B82F6');
    outline.setAttribute('stroke-width', '1.5');
    outline.setAttribute('stroke-dasharray', '4 2');
    g.appendChild(outline);

    // Badge
    const tag = el.tagName.toLowerCase();
    const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/)[0]}` : '';
    const badgeText = `<${tag}${cls}> (${Math.round(rect.width)} × ${Math.round(rect.height)})`;
    this.renderBadge(g, rect.left, Math.max(6, rect.top - 28), badgeText, '#0F172A', '#FFFFFF');

    this.svg.appendChild(g);
  }

  /**
   * Figma Smart Rulers & Distance measurements
   */
  renderDistanceGuides(r1, r2) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const color = '#EF4444'; // Red Figma ruler color

    // Check spatial relationships
    const isAbove = r2.bottom <= r1.top;
    const isBelow = r2.top >= r1.bottom;
    const isLeft = r2.right <= r1.left;
    const isRight = r2.left >= r1.right;

    const formatDist = (pxVal) => {
      if (this.unitConverter) {
        return this.unitConverter.formatBadge(pxVal);
      }
      return `${pxVal}px`;
    };

    // 1. Vertical Gap (One strictly above/below the other)
    if (isAbove) {
      const gap = Math.round(r1.top - r2.bottom);
      const x = Math.max(r1.left, r2.left) + Math.min(r1.width, r2.width) / 2;
      this.drawLine(g, x, r2.bottom, x, r1.top, color);
      this.renderDistanceBadge(g, x, r2.bottom + gap / 2, formatDist(gap), color);
    } else if (isBelow) {
      const gap = Math.round(r2.top - r1.bottom);
      const x = Math.max(r1.left, r2.left) + Math.min(r1.width, r2.width) / 2;
      this.drawLine(g, x, r1.bottom, x, r2.top, color);
      this.renderDistanceBadge(g, x, r1.bottom + gap / 2, formatDist(gap), color);
    }

    // 2. Horizontal Gap (One strictly left/right of the other)
    if (isLeft) {
      const gap = Math.round(r1.left - r2.right);
      const y = Math.max(r1.top, r2.top) + Math.min(r1.height, r2.height) / 2;
      this.drawLine(g, r2.right, y, r1.left, y, color);
      this.renderDistanceBadge(g, r2.right + gap / 2, y, formatDist(gap), color);
    } else if (isRight) {
      const gap = Math.round(r2.left - r1.right);
      const y = Math.max(r1.top, r2.top) + Math.min(r1.height, r2.height) / 2;
      this.drawLine(g, r1.right, y, r2.left, y, color);
      this.renderDistanceBadge(g, r1.right + gap / 2, y, formatDist(gap), color);
    }

    // 3. Overlapping or Nested: Distance to 4 edges (Figma Alt-inside measure)
    if (!isAbove && !isBelow && !isLeft && !isRight) {
      // Top distance
      const topDiff = Math.round(Math.abs(r1.top - r2.top));
      const midX = (Math.max(r1.left, r2.left) + Math.min(r1.right, r2.right)) / 2;
      if (topDiff > 0) {
        this.drawLine(g, midX, Math.min(r1.top, r2.top), midX, Math.max(r1.top, r2.top), color);
        this.renderDistanceBadge(g, midX, Math.min(r1.top, r2.top) + topDiff / 2, formatDist(topDiff), color);
      }

      // Bottom distance
      const botDiff = Math.round(Math.abs(r1.bottom - r2.bottom));
      if (botDiff > 0) {
        this.drawLine(g, midX, Math.min(r1.bottom, r2.bottom), midX, Math.max(r1.bottom, r2.bottom), color);
        this.renderDistanceBadge(g, midX, Math.min(r1.bottom, r2.bottom) + botDiff / 2, formatDist(botDiff), color);
      }

      // Left distance
      const leftDiff = Math.round(Math.abs(r1.left - r2.left));
      const midY = (Math.max(r1.top, r2.top) + Math.min(r1.bottom, r2.bottom)) / 2;
      if (leftDiff > 0) {
        this.drawLine(g, Math.min(r1.left, r2.left), midY, Math.max(r1.left, r2.left), midY, color);
        this.renderDistanceBadge(g, Math.min(r1.left, r2.left) + leftDiff / 2, midY, formatDist(leftDiff), color);
      }

      // Right distance
      const rightDiff = Math.round(Math.abs(r1.right - r2.right));
      if (rightDiff > 0) {
        this.drawLine(g, Math.min(r1.right, r2.right), midY, Math.max(r1.right, r2.right), midY, color);
        this.renderDistanceBadge(g, Math.min(r1.right, r2.right) + rightDiff / 2, midY, formatDist(rightDiff), color);
      }
    }

    this.svg.appendChild(g);
  }

  drawLine(g, x1, y1, x2, y2, color) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '3 2');
    g.appendChild(line);

    // End caps
    const cap1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cap1.setAttribute('cx', x1);
    cap1.setAttribute('cy', y1);
    cap1.setAttribute('r', '2.5');
    cap1.setAttribute('fill', color);
    g.appendChild(cap1);

    const cap2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cap2.setAttribute('cx', x2);
    cap2.setAttribute('cy', y2);
    cap2.setAttribute('r', '2.5');
    cap2.setAttribute('fill', color);
    g.appendChild(cap2);
  }

  renderDistanceBadge(g, x, y, text, bg) {
    const textWidth = text.length * 7.8 + 14;
    const height = 22;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x - textWidth / 2);
    rect.setAttribute('y', y - height / 2);
    rect.setAttribute('width', textWidth);
    rect.setAttribute('height', height);
    rect.setAttribute('rx', '6');
    rect.setAttribute('ry', '6');
    rect.setAttribute('fill', bg);
    rect.setAttribute('stroke', '#FFFFFF');
    rect.setAttribute('stroke-width', '1.2');
    rect.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))');
    g.appendChild(rect);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', y + 4.5);
    label.setAttribute('fill', '#FFFFFF');
    label.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
    label.setAttribute('font-size', '12px');
    label.setAttribute('font-weight', '700');
    label.setAttribute('text-anchor', 'middle');
    label.textContent = text;
    g.appendChild(label);
  }

  renderBadge(g, x, y, text, bg, color) {
    const safeY = Math.max(6, y);
    const textWidth = text.length * 7.8 + 18;
    const height = 24;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', safeY);
    rect.setAttribute('width', textWidth);
    rect.setAttribute('height', height);
    rect.setAttribute('rx', '6');
    rect.setAttribute('ry', '6');
    rect.setAttribute('fill', bg);
    rect.setAttribute('stroke', '#FFFFFF');
    rect.setAttribute('stroke-width', '1.2');
    rect.setAttribute('filter', 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))');
    g.appendChild(rect);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x + textWidth / 2);
    label.setAttribute('y', safeY + 16.5);
    label.setAttribute('fill', color);
    label.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
    label.setAttribute('font-size', '12px');
    label.setAttribute('font-weight', '700');
    label.setAttribute('text-anchor', 'middle');
    label.textContent = text;
    g.appendChild(label);
  }

  /**
   * Custom Responsive Layout Grid (v4.0.0)
   */
  renderCustomGrid() {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const cols = Math.max(1, parseInt(this.gridConfig.columns, 10) || 12);
    const gutter = Math.max(0, parseInt(this.gridConfig.gutter, 10) || 20);
    const maxContainer = Math.min(vw - 24, parseInt(this.gridConfig.maxContainer, 10) || 1200);

    let margin = (vw - maxContainer) / 2;
    if (typeof this.gridConfig.margin === 'number' && this.gridConfig.margin >= 0) {
      margin = this.gridConfig.margin;
    }
    margin = Math.max(12, margin);

    const totalAvailableWidth = vw - (margin * 2);
    const colWidth = Math.max(10, (totalAvailableWidth - (cols - 1) * gutter) / cols);

    const baseColor = this.gridConfig.color || '#EF4444';
    const op = Math.max(0.01, Math.min(1, parseFloat(this.gridConfig.opacity) || 0.08));

    for (let i = 0; i < cols; i++) {
      const x = margin + i * (colWidth + gutter);
      if (x + colWidth > vw) break;

      const colRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      colRect.setAttribute('x', x);
      colRect.setAttribute('y', 0);
      colRect.setAttribute('width', colWidth);
      colRect.setAttribute('height', vh);
      colRect.setAttribute('fill', baseColor);
      colRect.setAttribute('fill-opacity', op);
      colRect.setAttribute('stroke', baseColor);
      colRect.setAttribute('stroke-opacity', Math.min(1, op * 2.5));
      colRect.setAttribute('stroke-width', '1');
      g.appendChild(colRect);

      // Column number at top
      const colNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      colNum.setAttribute('x', x + colWidth / 2);
      colNum.setAttribute('y', 16);
      colNum.setAttribute('fill', baseColor);
      colNum.setAttribute('font-size', '10px');
      colNum.setAttribute('font-weight', '700');
      colNum.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
      colNum.setAttribute('text-anchor', 'middle');
      colNum.textContent = `${i + 1}`;
      g.appendChild(colNum);
    }

    this.svg.appendChild(g);
  }

  render12ColumnGrid() {
    this.renderCustomGrid();
  }

  /**
   * 8px Baseline Grid
   */
  renderBaselineGrid() {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    for (let y = 0; y < vh; y += 8) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', 0);
      line.setAttribute('y1', y);
      line.setAttribute('x2', vw);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(59, 130, 246, 0.08)');
      line.setAttribute('stroke-width', '1');
      g.appendChild(line);
    }

    this.svg.appendChild(g);
  }
}

if (typeof window !== 'undefined') {
  window.OverlayCanvas = OverlayCanvas;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OverlayCanvas;
}
