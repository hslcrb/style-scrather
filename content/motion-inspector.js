// Style Scratcher v2.0 - Motion & Animation Inspector & Playback Speed Controller

class MotionInspector {
  constructor() {
    this.playbackRate = 1.0;
    this.isPaused = false;
  }

  /**
   * Inspect animations and transitions on element
   * @param {Element} element 
   * @returns {Object}
   */
  inspect(element) {
    if (!element || !(element instanceof Element)) {
      return { hasAnimations: false, animations: [], transitions: [], webAnimationsCount: 0 };
    }

    const computed = window.getComputedStyle(element);
    const results = {
      hasAnimations: false,
      animations: [],
      transitions: [],
      webAnimationsCount: 0
    };

    // 1. CSS Keyframe Animations
    const animName = computed.animationName;
    if (animName && animName !== 'none') {
      const names = animName.split(',').map(s => s.trim());
      const durations = computed.animationDuration.split(',').map(s => s.trim());
      const timings = computed.animationTimingFunction.split(',').map(s => s.trim());
      const delays = computed.animationDelay.split(',').map(s => s.trim());
      const counts = computed.animationIterationCount.split(',').map(s => s.trim());

      names.forEach((name, i) => {
        results.animations.push({
          name: name,
          duration: durations[i] || durations[0] || '0s',
          timing: timings[i] || timings[0] || 'ease',
          delay: delays[i] || delays[0] || '0s',
          iteration: counts[i] || counts[0] || '1'
        });
      });
      results.hasAnimations = true;
    }

    // 2. CSS Transitions
    const transProp = computed.transitionProperty;
    if (transProp && transProp !== 'none' && transProp !== 'all 0s ease 0s') {
      const props = transProp.split(',').map(s => s.trim());
      const durations = computed.transitionDuration.split(',').map(s => s.trim());
      const timings = computed.transitionTimingFunction.split(',').map(s => s.trim());
      const delays = computed.transitionDelay.split(',').map(s => s.trim());

      props.forEach((prop, i) => {
        const dur = durations[i] || durations[0] || '0s';
        if (dur !== '0s' && dur !== '0ms') {
          results.transitions.push({
            property: prop,
            duration: dur,
            timing: timings[i] || timings[0] || 'ease',
            delay: delays[i] || delays[0] || '0s'
          });
          results.hasAnimations = true;
        }
      });
    }

    // 3. Web Animations API (WAAPI)
    try {
      if (element.getAnimations) {
        const waapi = element.getAnimations();
        results.webAnimationsCount = waapi.length;
        if (waapi.length > 0) results.hasAnimations = true;
      }
    } catch (e) {}

    return results;
  }

  /**
   * Set global animation playback rate (0.1x to 2.0x)
   * @param {number} rate 
   */
  setPlaybackRate(rate) {
    this.playbackRate = Math.max(0.05, Math.min(5.0, rate));
    try {
      const anims = document.getAnimations();
      anims.forEach(anim => {
        try { anim.playbackRate = this.playbackRate; } catch {}
      });
    } catch (e) {}
    return this.playbackRate;
  }

  /**
   * Toggle Pause/Play for all active animations
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    try {
      const anims = document.getAnimations();
      anims.forEach(anim => {
        try {
          if (this.isPaused) anim.pause();
          else anim.play();
        } catch {}
      });
    } catch (e) {}
    return this.isPaused;
  }

  /**
   * Parse cubic-bezier coordinates
   * @param {string} timingString 
   * @returns {[number, number, number, number]} [x1, y1, x2, y2]
   */
  static parseCubicBezier(timingString) {
    if (!timingString) return [0.25, 0.1, 0.25, 1.0];

    const presets = {
      'linear': [0.0, 0.0, 1.0, 1.0],
      'ease': [0.25, 0.1, 0.25, 1.0],
      'ease-in': [0.42, 0.0, 1.0, 1.0],
      'ease-out': [0.0, 0.0, 0.58, 1.0],
      'ease-in-out': [0.42, 0.0, 0.58, 1.0]
    };

    const trimmed = timingString.trim().toLowerCase();
    if (presets[trimmed]) return presets[trimmed];

    const match = timingString.match(/cubic-bezier\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/);
    if (match) {
      return [
        parseFloat(match[1]),
        parseFloat(match[2]),
        parseFloat(match[3]),
        parseFloat(match[4])
      ];
    }

    return [0.25, 0.1, 0.25, 1.0];
  }

  /**
   * Render Cubic-Bezier Curve as SVG HTML string
   * @param {[number, number, number, number]} coords
   * @param {number} size 
   * @returns {string} SVG HTML
   */
  static renderBezierSvg(coords, size = 100) {
    const [x1, y1, x2, y2] = coords;
    // Map coords from 0..1 to SVG viewbox (pad 10px)
    const pad = 12;
    const w = size - pad * 2;
    const h = size - pad * 2;

    const startX = pad;
    const startY = pad + h;
    const endX = pad + w;
    const endY = pad;

    const cp1X = pad + x1 * w;
    const cp1Y = pad + h - y1 * h;
    const cp2X = pad + x2 * w;
    const cp2Y = pad + h - y2 * h;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="bezier-svg">
        <!-- Background Grid -->
        <rect x="${pad}" y="${pad}" width="${w}" height="${h}" fill="#F9FAFB" stroke="#E5E7EB" rx="4" />
        <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="#E5E7EB" stroke-dasharray="2 2" />

        <!-- Control Handle 1 -->
        <line x1="${startX}" y1="${startY}" x2="${cp1X}" y2="${cp1Y}" stroke="#93C5FD" stroke-width="1.5" />
        <circle cx="${cp1X}" cy="${cp1Y}" r="3.5" fill="#2563EB" />

        <!-- Control Handle 2 -->
        <line x1="${endX}" y1="${endY}" x2="${cp2X}" y2="${cp2Y}" stroke="#FCA5A5" stroke-width="1.5" />
        <circle cx="${cp2X}" cy="${cp2Y}" r="3.5" fill="#EF4444" />

        <!-- Bezier Curve -->
        <path d="M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" />
      </svg>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.MotionInspector = MotionInspector;
}
