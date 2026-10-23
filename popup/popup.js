// The popup only observes on open. Page activation requires an explicit action.
(() => {
  const isMissingReceiver = error => /Receiving end does not exist|Could not establish connection/i.test(error?.message || String(error));

  function isRestrictedUrl(value) {
    try {
      const url = new URL(value);
      return !['http:', 'https:', 'file:'].includes(url.protocol) ||
        url.hostname === 'chromewebstore.google.com' ||
        (url.hostname === 'chrome.google.com' && /^\/webstore(?:\/|$)/.test(url.pathname));
    } catch {
      return true;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const $ = id => document.getElementById(id);
    const controls = [$('toggleInspectorBtn'), $('toggleGridBtn'), $('openPaletteBtn')];
    const browser = typeof chrome !== 'undefined' ? chrome : null;
    let activeTab = null;
    let state = { isActive: false, isGridActive: false };
    let pending = false;
    let unavailable = false;

    function status(label, kind) {
      $('statusText').textContent = label;
      $('statusIndicator').dataset.state = kind;
    }

    function notice(message, retry = false) {
      $('restrictedBanner').hidden = !message;
      $('restrictedBannerText').textContent = message || '';
      $('retryConnectionBtn').hidden = !retry;
      if (message) status('연결 확인', 'error');
    }

    function render() {
      controls.forEach(button => { button.disabled = pending || unavailable; });
      $('retryConnectionBtn').disabled = pending;
      $('toggleInspectorBtn').classList.toggle('active', state.isActive);
      $('toggleInspectorBtn').setAttribute('aria-pressed', state.isActive);
      $('toggleInspectorBtn').setAttribute('aria-busy', pending);
      $('toggleGridBtn').classList.toggle('active', state.isGridActive);
      $('toggleGridBtn').setAttribute('aria-pressed', state.isGridActive);
      $('toggleBtnText').textContent = pending ? '페이지 연결 중…' : state.isActive ? '인스펙터 종료' : '인스펙터 시작';
      $('gridDescription').textContent = state.isGridActive ? '그리드 표시 중 · 클릭하여 끄기' : '12컬럼으로 정렬 보기';
      $('actionHint').textContent = state.isActive ? '페이지에서 요소를 클릭해 선택하세요.' : '시작하면 페이지 위에 스튜디오가 열립니다.';
      if (pending) status('연결 중', 'loading');
      else if ($('restrictedBanner').hidden) status(state.isActive ? '사용 중' : '준비됨', state.isActive ? 'active' : 'idle');
    }

    function confirmState(response) {
      if (!response || typeof response.isActive !== 'boolean' || typeof response.isGridActive !== 'boolean' || response.success === false) {
        throw new Error('페이지가 실행 결과를 확인하지 못했습니다. 다시 연결한 뒤 실행해주세요.');
      }
      state = { isActive: response.isActive, isGridActive: response.isGridActive };
    }

    async function send(payload, allowInjection) {
      try {
        return await browser.tabs.sendMessage(activeTab.id, payload);
      } catch (error) {
        if (!allowInjection || !isMissingReceiver(error)) throw error;
        const files = [...new Set((browser.runtime.getManifest().content_scripts || []).flatMap(entry => entry.js || []))];
        if (!files.length || !browser.scripting?.executeScript) throw new Error('확장 프로그램을 다시 불러온 뒤 시도해주세요.');
        await browser.scripting.executeScript({ target: { tabId: activeTab.id }, files });
        return browser.tabs.sendMessage(activeTab.id, payload);
      }
    }

    function describeError(error) {
      const message = error?.message || '';
      if (/No tab|tab was closed|Invalid tab/i.test(message)) return '페이지가 닫혔습니다. 웹사이트를 연 뒤 다시 연결해주세요.';
      if (/Cannot access|Missing host permission|not allowed|extensions gallery/i.test(message)) {
        return activeTab?.url?.startsWith('file:')
          ? '이 파일에 접근할 수 없습니다. 확장 프로그램 설정에서 파일 URL 접근을 허용해주세요.'
          : '이 페이지에 접근할 수 없습니다. 일반 웹사이트에서 다시 시도해주세요.';
      }
      if (/실행 결과|확장 프로그램을/.test(message)) return message;
      return '페이지와 연결하지 못했습니다. 페이지를 새로고침하거나 다시 연결해주세요.';
    }

    async function run(payload, closeAfter = false) {
      if (pending || unavailable) return;
      pending = true;
      notice('');
      render();
      try {
        confirmState(await send(payload, true));
        if (closeAfter) window.close();
      } catch (error) {
        notice(describeError(error), true);
      } finally {
        pending = false;
        render();
      }
    }

    async function connect(allowInjection = false) {
      pending = true;
      unavailable = false;
      notice('');
      render();
      try {
        if (!browser?.tabs?.query || !browser?.runtime?.getManifest) {
          unavailable = true;
          $('pageHostname').textContent = 'Chrome 확장 프로그램에서 열어주세요';
          notice('이 화면은 Chrome 확장 프로그램의 팝업입니다. 설치한 뒤 브라우저 도구 모음에서 열어주세요.');
          return;
        }
        $('versionLabel').textContent = `v${browser.runtime.getManifest().version}`;
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        activeTab = tabs?.[0];
        if (activeTab?.id === undefined) throw new Error('No tab');
        const url = activeTab.url || activeTab.pendingUrl;
        if (isRestrictedUrl(url)) {
          unavailable = true;
          $('pageHostname').textContent = '검사할 수 없는 페이지';
          notice('Chrome 내부 화면과 웹 스토어에서는 실행할 수 없습니다. 일반 웹사이트에서 열어주세요.');
          return;
        }
        const parsed = new URL(url);
        $('pageHostname').textContent = parsed.hostname || '로컬 파일';
        $('pageHostname').title = url;
        try {
          confirmState(await send({ type: 'GET_STATE' }, allowInjection));
        } catch (error) {
          // A page opened before installation has no receiver yet. It is ready
          // for an explicit start; merely opening the popup must do no work.
          if (!allowInjection && isMissingReceiver(error)) state = { isActive: false, isGridActive: false };
          else throw error;
        }
      } catch (error) {
        notice(describeError(error), true);
        if (!activeTab) unavailable = true;
      } finally {
        pending = false;
        render();
      }
    }

    $('toggleInspectorBtn').addEventListener('click', () => run({ type: 'TOGGLE_SCRATCHER' }));
    $('toggleGridBtn').addEventListener('click', () => run({ type: 'TOGGLE_GRID' }));
    $('openPaletteBtn').addEventListener('click', () => run({ type: 'OPEN_TAB', tabName: 'code' }, true));
    // Reconnect by querying state, never by repeating an uncertain mutation.
    $('retryConnectionBtn').addEventListener('click', () => connect(true));
    await connect();
  });
})();
