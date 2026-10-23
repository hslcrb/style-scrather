// Style Scratcher v2.0 - Page Controller (Copy Unblocker & Script/DOM Freezer)

(function () {
if (typeof window !== 'undefined' && window.PageController) return;

class PageController {
  constructor() {
    this.isUnblocked = false;
    this.isFrozen = false;
    this.unblockStyleTag = null;
    this.activeListeners = [];
    this.freezeListeners = [];
    this.originalHandlers = [];
    this.pausedAnimations = [];
  }

  /**
   * Toggle Copy Protection & Right-Click Unblocker
   * @param {boolean} forceState
   */
  toggleUnblock(forceState) {
    const next = forceState !== undefined ? !!forceState : !this.isUnblocked;
    if (next === this.isUnblocked) return next;
    this.isUnblocked = next;

    if (this.isUnblocked) {
      this.enableUnblock();
    } else {
      this.disableUnblock();
    }

    return this.isUnblocked;
  }

  enableUnblock() {
    // 1. Force enable user-select via high-priority stylesheet
    if (!this.unblockStyleTag) {
      this.unblockStyleTag = document.createElement('style');
      this.unblockStyleTag.id = 'style-scratcher-unblocker';
      this.unblockStyleTag.textContent = `
        *, *::before, *::after {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }
      `;
      (document.head || document.documentElement).appendChild(this.unblockStyleTag);
    }

    // 2. Intercept blocking events in capture phase
    const blockingEvents = ['contextmenu', 'selectstart', 'copy', 'cut', 'dragstart'];
    const bypassHandler = (e) => {
      // Allow the default browser action to happen, stop host scripts from canceling
      e.stopPropagation();
    };

    blockingEvents.forEach(evt => {
      window.addEventListener(evt, bypassHandler, true);
      document.addEventListener(evt, bypassHandler, true);
      this.activeListeners.push({ evt, handler: bypassHandler });
    });

    // 3. Nullify on* properties
    try {
      for (const target of [document, document.body].filter(Boolean)) {
        for (const property of ['oncontextmenu', 'onselectstart', 'oncopy']) {
          this.originalHandlers.push({ target, property, value: target[property] });
          target[property] = null;
        }
      }
    } catch (e) {}

    console.log('[Style Scratcher] Copy & Right-Click protection unblocked.');
  }

  disableUnblock() {
    if (this.unblockStyleTag && this.unblockStyleTag.parentNode) {
      this.unblockStyleTag.parentNode.removeChild(this.unblockStyleTag);
      this.unblockStyleTag = null;
    }

    this.activeListeners.forEach(({ evt, handler }) => {
      window.removeEventListener(evt, handler, true);
      document.removeEventListener(evt, handler, true);
    });
    this.activeListeners = [];
    this.originalHandlers.splice(0).forEach(({ target, property, value }) => {
      // Preserve handlers the page changed while this mode was enabled.
      if (target[property] === null) target[property] = value;
    });

    console.log('[Style Scratcher] Copy protection restored.');
  }

  /**
   * Toggle Page & Interaction Freeze (Keeps hover tooltips & menus open)
   * @param {boolean} forceState
   */
  toggleFreeze(forceState) {
    const next = forceState !== undefined ? !!forceState : !this.isFrozen;
    if (next === this.isFrozen) return next;
    this.isFrozen = next;

    if (this.isFrozen) {
      this.enableFreeze();
    } else {
      this.disableFreeze();
    }

    return this.isFrozen;
  }

  enableFreeze() {
    // 1. Prevent disappearance of hover tooltips / menus by blocking blur & mouseleave
    const freezeHandler = (e) => {
      // If event targets scratcher dock, allow it
      if (e.target.closest && e.target.closest('#style-scratcher-host')) return;
      e.stopPropagation();
      e.preventDefault();
    };

    const transientEvents = ['mouseleave', 'mouseout', 'pointerout', 'blur'];
    transientEvents.forEach(evt => {
      window.addEventListener(evt, freezeHandler, true);
      this.freezeListeners.push({ evt, handler: freezeHandler });
    });

    // 2. Pause all running animations
    try {
      const anims = document.getAnimations();
      this.pausedAnimations = anims.filter(a => a.playState === 'running');
      this.pausedAnimations.forEach(a => a.pause());
    } catch (e) {}

    console.log('[Style Scratcher] Page & Menu interaction frozen.');
  }

  disableFreeze() {
    this.freezeListeners.splice(0).forEach(({ evt, handler }) => {
      window.removeEventListener(evt, handler, true);
    });
    // Resume animations
    try {
      this.pausedAnimations.forEach(a => {
        try { if (a.playState === 'paused') a.play(); } catch {}
      });
      this.pausedAnimations = [];
    } catch (e) {}

    console.log('[Style Scratcher] Page un-frozen.');
  }
}

if (typeof window !== 'undefined') {
  window.PageController = PageController;
}
})();
