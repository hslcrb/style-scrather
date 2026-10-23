// Observes listeners added in the extension's isolated world while inspection is active.
// Host-page JavaScript listeners registered in the main world are not visible here.
(function () {
  if (window.__STYLE_SCRATCHER_SET_INTERCEPTION__) return;
  let eventRegistry = new WeakMap();
  const originalAdd = EventTarget.prototype.addEventListener;
  const originalRemove = EventTarget.prototype.removeEventListener;
  const captureOf = options => typeof options === 'boolean' ? options : !!options?.capture;

  function observedAdd(type, listener, options) {
    const result = originalAdd.call(this, type, listener, options);
    if (this instanceof Element && listener && !options?.signal?.aborted) {
      const listeners = eventRegistry.get(this) || [];
      const capture = captureOf(options);
      if (listeners.length < 100 && !listeners.some(item => item.type === type && item.listener === listener && item.capture === capture)) {
        let source = '[Handler]';
        try { source = String(typeof listener === 'function' ? listener : listener.handleEvent).slice(0, 300); } catch {}
        listeners.push({ type, listener, capture, source,
          name: typeof listener === 'function' ? listener.name || '익명 함수 (anonymous)' : 'handleEvent',
          once: !!options?.once, timestamp: Date.now() });
        eventRegistry.set(this, listeners);
      }
    }
    return result;
  }

  function observedRemove(type, listener, options) {
    const result = originalRemove.call(this, type, listener, options);
    const listeners = eventRegistry.get(this);
    if (listeners) {
      const index = listeners.findIndex(item => item.type === type && item.listener === listener && item.capture === captureOf(options));
      if (index !== -1) listeners.splice(index, 1);
    }
    return result;
  }

  window.__STYLE_SCRATCHER_INTERCEPTOR_ACTIVE__ = false;
  window.__STYLE_SCRATCHER_SET_INTERCEPTION__ = active => {
    active = !!active;
    if (active === window.__STYLE_SCRATCHER_INTERCEPTOR_ACTIVE__) return;
    window.__STYLE_SCRATCHER_INTERCEPTOR_ACTIVE__ = active;
    if (active) {
      EventTarget.prototype.addEventListener = observedAdd;
      EventTarget.prototype.removeEventListener = observedRemove;
    } else {
      if (EventTarget.prototype.addEventListener === observedAdd) EventTarget.prototype.addEventListener = originalAdd;
      if (EventTarget.prototype.removeEventListener === observedRemove) EventTarget.prototype.removeEventListener = originalRemove;
      eventRegistry = new WeakMap();
    }
  };

  window.__STYLE_SCRATCHER_GET_EVENTS__ = element => (eventRegistry.get(element) || [])
    .map(({ listener, ...details }) => details);
})();
