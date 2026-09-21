// Style Scratcher v4.0.0 - Context Menu HUD (Smart Alternating Right-Click Toggle)

class ContextHud {
  constructor(shadowRoot, options = {}) {
    this.shadowRoot = shadowRoot;
    this.container = null;
    this.targetElement = null;
    this.state = 'READY_FOR_HUD'; // 'READY_FOR_HUD' | 'HUD_OPEN' | 'ALLOW_NATIVE_NEXT'

    this.onAction = typeof options === 'function' ? options : (options.onAction || (() => {}));
    if (this.shadowRoot && typeof document !== 'undefined') {
      this.initDOM();
    }
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      this.initListeners();
    }
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.className = 'scratcher-context-hud';
    this.container.style.display = 'none';

    this.shadowRoot.appendChild(this.container);
  }

  initListeners() {
    // 1. Contextmenu Right-Click Listener on Window
    window.addEventListener('contextmenu', (e) => {
      const host = document.getElementById('style-scratcher-host');
      if (host && (e.target === host || host.contains(e.target))) {
        return; // Inside style-scratcher
      }

      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (target && target !== document.documentElement && target !== document.body) {
        this.handleContextMenu(e, target);
      }
    }, true);

    // 2. Click Anywhere Outside to Dismiss HUD
    window.addEventListener('click', (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      const isInsideHud = this.container && path.includes(this.container);
      if (!isInsideHud) {
        this.handleClickOutside(e);
      }
    }, true);
  }

  handleContextMenu(e, target) {
    if (this.state === 'ALLOW_NATIVE_NEXT') {
      this.state = 'READY_FOR_HUD';
      return false; // Not intercepted -> Native allowed!
    }

    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    this.targetElement = target;
    this.openAt(e ? e.clientX : 0, e ? e.clientY : 0, target);
    return true; // Intercepted
  }

  handleClickOutside(e) {
    if (this.state === 'HUD_OPEN') {
      this.close();
      this.state = 'ALLOW_NATIVE_NEXT';
      return true;
    }
    return false;
  }

  openAt(x, y, target) {
    this.targetElement = target;
    this.state = 'HUD_OPEN';

    if (this.container) {
      this.renderItems(target);
      this.container.style.display = 'block';
      this.container.style.left = `${Math.min(x, (typeof window !== 'undefined' ? window.innerWidth : 1920) - 240)}px`;
      this.container.style.top = `${Math.min(y, (typeof window !== 'undefined' ? window.innerHeight : 1080) - 300)}px`;
    }
  }

  close() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  renderItems(target, x = 0, y = 0) {
    if (!this.container || !target) return;
    const tag = target.tagName ? target.tagName.toLowerCase() : 'element';
    const cls = target.className && typeof target.className === 'string' ? `.${target.className.split(/\s+/)[0]}` : '';
    const hasImage = tag === 'img' || (target.style && target.style.backgroundImage) || target.closest('svg');

    this.container.innerHTML = `
      <div class="hud-header">
        <span class="hud-tag">&lt;${tag}${cls}&gt;</span>
        <span class="hud-close" id="hudCloseBtn"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
      </div>
      <div class="hud-menu">
        <button class="hud-item" data-act="edit-text">
          <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 5px;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>내용 직접 타이핑</span>
          <kbd>Double Click</kbd>
        </button>
        <button class="hud-item" data-act="outlines">
          <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 5px;"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>텍스트 아웃라인화 (Create Outlines)</span>
        </button>
        <div class="hud-divider"></div>
        <button class="hud-item" data-act="copy-tailwind">
          <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 5px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Tailwind CSS 복사</span>
        </button>
        <button class="hud-item" data-act="copy-react">
          <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 5px;"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>React (JSX) 컴포넌트 복사</span>
        </button>
        ${hasImage ? `
          <button class="hud-item" data-act="download-asset">
            <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 5px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>이미지 / SVG 에셋 다운로드</span>
          </button>
        ` : ''}
        <div class="hud-divider"></div>
        <button class="hud-item" data-act="move-up">
          <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 5px;"><polyline points="18 15 12 9 6 15"></polyline></svg>형제 요소 위로 이동</span>
          <kbd>Alt + ↑</kbd>
        </button>
        <button class="hud-item" data-act="move-down">
          <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 5px;"><polyline points="6 9 12 15 18 9"></polyline></svg>형제 요소 아래로 이동</span>
          <kbd>Alt + ↓</kbd>
        </button>
        <button class="hud-item" data-act="duplicate">
          <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 5px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><rect x="3" y="3" width="13" height="13" rx="2" ry="2"></rect></svg>요소 복제 (Duplicate)</span>
        </button>
        <button class="hud-item danger" data-act="delete">
          <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 5px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>요소 삭제 (Delete)</span>
        </button>
      </div>
    `;

    // Position gracefully inside viewport bounds
    const hudWidth = 240;
    const hudHeight = 310;
    const posX = Math.max(10, Math.min(window.innerWidth - hudWidth - 10, x));
    const posY = Math.max(10, Math.min(window.innerHeight - hudHeight - 10, y));

    this.container.style.left = `${posX}px`;
    this.container.style.top = `${posY}px`;
    this.container.style.display = 'flex';

    // Bind action events
    this.container.querySelector('#hudCloseBtn')?.addEventListener('click', () => {
      this.close();
      this.state = 'ALLOW_NATIVE_NEXT';
    });

    this.container.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.act;
        this.onAction(action, this.targetElement);
        this.close();
        this.state = 'ALLOW_NATIVE_NEXT';
      });
    });
  }

  close() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}

if (typeof window !== 'undefined') {
  window.ContextHud = ContextHud;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextHud;
}
