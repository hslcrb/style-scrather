// Style Scratcher v2.0 - Event Listener Interceptor (Main World Bridge)

(function () {
  if (window.__STYLE_SCRATCHER_INTERCEPTOR_ACTIVE__) return;
  window.__STYLE_SCRATCHER_INTERCEPTOR_ACTIVE__ = true;

  const eventRegistry = new WeakMap();

  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (this instanceof Element && listener) {
      let listeners = eventRegistry.get(this);
      if (!listeners) {
        listeners = [];
        eventRegistry.set(this, listeners);
      }

      // Record listener details
      const fnStr = typeof listener === 'function' ? listener.toString() : (listener.handleEvent ? listener.handleEvent.toString() : '[Object Handler]');
      const fnName = typeof listener === 'function' ? (listener.name || '익명 함수 (anonymous)') : 'handleEvent';

      listeners.push({
        type: type,
        name: fnName,
        source: fnStr.slice(0, 300),
        capture: typeof options === 'boolean' ? options : (options && options.capture) || false,
        once: (options && options.once) || false,
        timestamp: Date.now()
      });
    }

    return originalAddEventListener.call(this, type, listener, options);
  };

  EventTarget.prototype.removeEventListener = function (type, listener, options) {
    if (this instanceof Element && listener) {
      const listeners = eventRegistry.get(this);
      if (listeners) {
        const idx = listeners.findIndex(l => l.type === type);
        if (idx !== -1) {
          listeners.splice(idx, 1);
        }
      }
    }
    return originalRemoveEventListener.call(this, type, listener, options);
  };

  // Expose registry query function globally
  window.__STYLE_SCRATCHER_GET_EVENTS__ = function (element) {
    if (!element || !(element instanceof Element)) return [];
    return eventRegistry.get(element) || [];
  };
})();
