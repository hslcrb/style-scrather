// Style Scratcher - Figma-like Canvas Overlay Engine (Guides, Rulers, Dimensions, 12-Col Grid)

class OverlayCanvas {
  constructor(shadowRoot, unitConverter = null) {
    this.shadowRoot = shadowRoot;
    this.unitConverter = unitConverter || (typeof UnitConverter !== 'undefined' ? new UnitConverter() : null);
    this.svg = null;
    this.hoverElement = null;
    this.selectedElement = null;
    this.isGridVisible = false;
    this.isBaselineVisible = false;
    this.initSvgOverlay();
  }

  setUnit(unit) {
    if (this.unitConverter) {
      this.unitConverter.setUnit(unit);
      this.render();
    }
  }

  initSvgOverlay() {
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

    // 2. Render 12-Column Grid if active
    if (this.isGridVisible) {
      this.render12ColumnGrid();
    }

    // 3. Render Selected (Locked) Element Box
    let selRect = null;
    if (this.selectedElement && document.body.contains(this.selectedElement)) {
      selRect = this.selectedElement.getBoundingClientRect();
      this.renderSelectionBox(selRect, this.selectedElement);
    }

    // 4. Render Hover Element Box
    let hoverRect = null;
    if (this.hoverElement && document.body.contains(this.hoverElement) && this.hoverElement !== this.selectedElement) {
      hoverRect = this.hoverElement.getBoundingClientRect();
      this.renderHoverBox(hoverRect, this.hoverElement);
    }

    // 5. Render Figma Smart Distance Guides between Selected and Hover
    if (selRect && hoverRect) {
      this.renderDistanceGuides(selRect, hoverRect);
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

    // Badge: Tag Name + Dimensions
    const tag = el.tagName.toLowerCase();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const badgeText = `${tag} • ${w} × ${h}px`;
    this.renderBadge(g, rect.left, rect.top - 24, badgeText, '#2563EB', '#FFFFFF');

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
    outline.setAttribute('fill', 'rgba(59, 130, 246, 0.06)');
    outline.setAttribute('stroke', '#3B82F6');
    outline.setAttribute('stroke-width', '1');
    outline.setAttribute('stroke-dasharray', '4 2');
    g.appendChild(outline);

    // Badge
    const tag = el.tagName.toLowerCase();
    const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/)[0]}` : '';
    const badgeText = `${tag}${cls} (${Math.round(rect.width)} × ${Math.round(rect.height)})`;
    this.renderBadge(g, rect.left, Math.max(4, rect.top - 20), badgeText, '#1E293B', '#F8FAFC');

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
    const textWidth = text.length * 6.5 + 8;
    const height = 16;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x - textWidth / 2);
    rect.setAttribute('y', y - height / 2);
    rect.setAttribute('width', textWidth);
    rect.setAttribute('height', height);
    rect.setAttribute('rx', '4');
    rect.setAttribute('ry', '4');
    rect.setAttribute('fill', bg);
    g.appendChild(rect);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', y + 3.5);
    label.setAttribute('fill', '#FFFFFF');
    label.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
    label.setAttribute('font-size', '10px');
    label.setAttribute('font-weight', '600');
    label.setAttribute('text-anchor', 'middle');
    label.textContent = text;
    g.appendChild(label);
  }

  renderBadge(g, x, y, text, bg, color) {
    const safeY = Math.max(4, y);
    const textWidth = text.length * 6.5 + 12;
    const height = 18;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', safeY);
    rect.setAttribute('width', textWidth);
    rect.setAttribute('height', height);
    rect.setAttribute('rx', '4');
    rect.setAttribute('ry', '4');
    rect.setAttribute('fill', bg);
    g.appendChild(rect);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x + textWidth / 2);
    label.setAttribute('y', safeY + 12.5);
    label.setAttribute('fill', color);
    label.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
    label.setAttribute('font-size', '10px');
    label.setAttribute('font-weight', '600');
    label.setAttribute('text-anchor', 'middle');
    label.textContent = text;
    g.appendChild(label);
  }

  /**
   * 12-Column Responsive Layout Grid
   */
  render12ColumnGrid() {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const maxContainer = Math.min(vw - 48, 1200);
    const margin = (vw - maxContainer) / 2;
    const gutter = 20;
    const cols = 12;
    const colWidth = (maxContainer - (cols - 1) * gutter) / cols;

    for (let i = 0; i < cols; i++) {
      const x = margin + i * (colWidth + gutter);
      const colRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      colRect.setAttribute('x', x);
      colRect.setAttribute('y', 0);
      colRect.setAttribute('width', colWidth);
      colRect.setAttribute('height', vh);
      colRect.setAttribute('fill', 'rgba(239, 68, 68, 0.04)');
      colRect.setAttribute('stroke', 'rgba(239, 68, 68, 0.15)');
      colRect.setAttribute('stroke-width', '1');
      g.appendChild(colRect);

      // Column number at top
      const colNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      colNum.setAttribute('x', x + colWidth / 2);
      colNum.setAttribute('y', 16);
      colNum.setAttribute('fill', '#EF4444');
      colNum.setAttribute('font-size', '9px');
      colNum.setAttribute('font-weight', '600');
      colNum.setAttribute('text-anchor', 'middle');
      colNum.textContent = `${i + 1}`;
      g.appendChild(colNum);
    }

    this.svg.appendChild(g);
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
