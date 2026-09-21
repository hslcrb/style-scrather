// Style Scratcher v2.0 - Graphics & WebGL / Canvas / SVG Deep Inspector

class GraphicsInspector {
  /**
   * Inspect a graphic element (canvas, svg, img, or video)
   * @param {Element} element 
   * @returns {Object|null}
   */
  static inspect(element) {
    if (!element || !(element instanceof Element)) return null;

    const tag = element.tagName.toLowerCase();
    if (tag === 'canvas') {
      return this.inspectCanvas(element);
    } else if (tag === 'svg' || element.closest('svg')) {
      const svg = tag === 'svg' ? element : element.closest('svg');
      return this.inspectSvg(svg);
    } else if (tag === 'img') {
      return this.inspectImage(element);
    }

    return null;
  }

  static inspectCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const bufW = canvas.width;
    const bufH = canvas.height;
    const cssW = Math.round(rect.width);
    const cssH = Math.round(rect.height);
    const dprX = cssW > 0 ? (bufW / cssW).toFixed(2) : '1.0';
    const dprY = cssH > 0 ? (bufH / cssH).toFixed(2) : '1.0';

    // Memory footprint (RGBA 4 bytes per pixel)
    const bytes = bufW * bufH * 4;
    const memFormatted = bytes > 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;

    const info = {
      type: 'canvas',
      bufferSize: `${bufW} × ${bufH} px`,
      cssSize: `${cssW} × ${cssH} px`,
      dprRatio: `${dprX}x`,
      estimatedVram: memFormatted,
      contextType: 'Unknown',
      isCrisp: Math.abs(parseFloat(dprX) - (window.devicePixelRatio || 1)) < 0.2,
      webgl: null
    };

    // Safely probe contexts
    try {
      let gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        info.contextType = canvas.getContext('webgl2') ? 'WebGL 2.0' : 'WebGL 1.0';
        
        let renderer = 'Standard WebGL';
        let vendor = 'Standard Vendor';
        
        // Debug renderer extension for GPU card name
        const dbgExt = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbgExt) {
          renderer = gl.getParameter(dbgExt.UNMASKED_RENDERER_WEBGL) || renderer;
          vendor = gl.getParameter(dbgExt.UNMASKED_VENDOR_WEBGL) || vendor;
        } else {
          renderer = gl.getParameter(gl.RENDERER) || renderer;
          vendor = gl.getParameter(gl.VENDOR) || vendor;
        }

        const exts = gl.getSupportedExtensions() || [];
        const attrs = gl.getContextAttributes() || {};

        info.webgl = {
          renderer: renderer,
          vendor: vendor,
          version: gl.getParameter(gl.VERSION),
          shadingLanguage: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          extensionsCount: exts.length,
          antialias: attrs.antialias ? 'On' : 'Off',
          alpha: attrs.alpha ? 'True' : 'False',
          powerPreference: attrs.powerPreference || 'default'
        };
      } else {
        const ctx2d = canvas.getContext('2d');
        if (ctx2d) {
          info.contextType = 'Canvas 2D';
        }
      }
    } catch (e) {
      info.contextType = 'Canvas (Inaccessible/Active Context)';
    }

    return info;
  }

  static inspectSvg(svg) {
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.getAttribute('viewBox') || 'None';
    const paths = svg.querySelectorAll('path').length;
    const shapes = svg.querySelectorAll('circle, rect, polygon, polyline, ellipse, line').length;
    const defs = svg.querySelectorAll('defs, linearGradient, radialGradient, filter, clipPath').length;

    return {
      type: 'svg',
      viewBox: viewBox,
      displaySize: `${Math.round(rect.width)} × ${Math.round(rect.height)} px`,
      pathsCount: paths,
      shapesCount: shapes,
      defsCount: defs,
      isScalable: viewBox !== 'None'
    };
  }

  static inspectImage(img) {
    const rect = img.getBoundingClientRect();
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const cssW = Math.round(rect.width);
    const cssH = Math.round(rect.height);

    return {
      type: 'image',
      naturalSize: `${naturalW} × ${naturalH} px`,
      displaySize: `${cssW} × ${cssH} px`,
      aspectRatio: naturalH > 0 ? (naturalW / naturalH).toFixed(2) : '1.0',
      src: (img.currentSrc || img.src).split('/').pop() || 'Inline',
      isScaledUp: cssW > naturalW || cssH > naturalH
    };
  }
}

if (typeof window !== 'undefined') {
  window.GraphicsInspector = GraphicsInspector;
}
