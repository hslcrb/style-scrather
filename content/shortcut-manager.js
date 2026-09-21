// Style Scratcher v4.0.0 - Shortcut Manager & Keybinding Customizer

class ShortcutManager {
  static DEFAULTS = {
    zoomIn: 'Alt+=',       // Alt + +
    zoomOut: 'Alt+-',      // Alt + -
    zoomReset: 'Alt+0',    // Alt + 0
    toggleScratcher: 'Alt+S',
    toggleCursor: 'Alt+C',
    toggleFreeze: 'Alt+F',
    toggleUnblock: 'Alt+U',
    toggleGrid: 'Alt+G',
    toggleTabOrder: 'Alt+T',
    toggleMode: 'Alt+E'
  };

  static LABELS = {
    zoomIn: '인스턴트 줌인 (Zoom In)',
    zoomOut: '인스턴트 줌아웃 (Zoom Out)',
    zoomReset: '줌 100% 리셋 (Reset Zoom)',
    toggleScratcher: 'Style Scratcher 인스펙터 토글',
    toggleCursor: '정밀 십자선 커서 & 좌표 토글',
    toggleFreeze: '화면 및 툴팁 프리징 (Freeze)',
    toggleUnblock: '복사 및 우클릭 차단 해제',
    toggleGrid: '12컬럼 / 커스텀 그리드 토글',
    toggleTabOrder: '접근성 Tab 키 순서 시각화',
    toggleMode: '검사 모드 / 편집 모드 전환'
  };

  constructor() {
    this.shortcuts = { ...ShortcutManager.DEFAULTS };
    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem('style_scratcher_shortcuts');
      if (saved) {
        this.shortcuts = { ...ShortcutManager.DEFAULTS, ...JSON.parse(saved) };
      }
    } catch (e) {
      // LocalStorage restricted or unavailable
    }
  }

  save() {
    try {
      localStorage.setItem('style_scratcher_shortcuts', JSON.stringify(this.shortcuts));
    } catch (e) {}
  }

  _mapAction(action) {
    const map = {
      instantZoomIn: 'zoomIn',
      instantZoomOut: 'zoomOut',
      resetZoom: 'zoomReset',
      toggleEditMode: 'toggleMode',
      toggleInspector: 'toggleScratcher',
      togglePrecisionCursor: 'toggleCursor'
    };
    return map[action] || action;
  }

  get(action) {
    const act = this._mapAction(action);
    return this.shortcuts[act] || ShortcutManager.DEFAULTS[act] || '';
  }

  getShortcut(action) {
    return this.get(action);
  }

  set(action, combo) {
    const act = this._mapAction(action);
    this.shortcuts[act] = combo;
    this.save();
  }

  setShortcut(action, combo) {
    this.set(action, combo);
  }

  resetToDefaults() {
    this.shortcuts = { ...ShortcutManager.DEFAULTS };
    this.save();
    return { ...this.shortcuts };
  }

  getAll() {
    return { ...this.shortcuts };
  }

  getShortcuts() {
    return this.getAll();
  }

  matchKey(e, action) {
    return this.matches(e, action);
  }

  /**
   * Check if a KeyboardEvent matches a registered action shortcut
   */
  matches(e, action) {
    const act = this._mapAction(action);
    const combo = this.get(act);
    if (!combo) return false;

    const parts = combo.split('+').map(p => p.trim().toLowerCase());
    const needsAlt = parts.includes('alt');
    const needsCtrl = parts.includes('ctrl') || parts.includes('control');
    const needsShift = parts.includes('shift');
    const needsMeta = parts.includes('meta') || parts.includes('cmd');

    if (!!e.altKey !== needsAlt) return false;
    if (!!e.ctrlKey !== needsCtrl) return false;
    if (!!e.shiftKey !== needsShift) return false;
    if (!!e.metaKey !== needsMeta) return false;

    // Last part is the key
    const targetKey = parts[parts.length - 1];
    const eventKey = (e.key || '').toLowerCase();

    if (targetKey === '=' && (eventKey === '=' || eventKey === '+' || e.code === 'Equal')) return true;
    if (targetKey === '-' && (eventKey === '-' || eventKey === '_' || e.code === 'Minus')) return true;
    if (targetKey === '0' && (eventKey === '0' || e.code === 'Digit0' || e.code === 'Numpad0')) return true;

    return eventKey === targetKey || (e.code && e.code.toLowerCase() === `key${targetKey}`);
  }
}

if (typeof window !== 'undefined') {
  window.ShortcutManager = ShortcutManager;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShortcutManager;
}
