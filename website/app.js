/* The site preview is deliberately scoped to three local example elements. */
(() => {
  'use strict';
  const targets = [...document.querySelectorAll('[data-demo-target]')];
  const colorInput = document.getElementById('demo-color');
  const radiusInput = document.getElementById('demo-radius');
  const fontInput = document.getElementById('demo-font');
  const cssOutput = document.getElementById('demo-css');
  const status = document.getElementById('demo-status');
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const swatches = [...document.querySelectorAll('[data-color]')];
  const initialStyles = new Map(targets.map(element => [element, element.getAttribute('style')]));
  let selected = targets.find(element => element.dataset.demoTarget === 'button');
  let activePanel = 'style';
  const classNames = { heading: 'collection-heading', button: 'collection-button', object: 'object-card' };
  const labels = { heading: '제목', button: '버튼', object: '오브제 카드' };

  function hexColor(value) {
    const parts = value.match(/[\d.]+/g);
    if (!parts || parts.length < 3) return '#17151c';
    return '#' + parts.slice(0, 3).map(number => Math.round(Number(number)).toString(16).padStart(2, '0')).join('');
  }
  function colorProperty() { return selected.dataset.demoTarget === 'heading' ? 'color' : 'background-color'; }
  function fillRange(input) {
    const fraction = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min));
    input.style.setProperty('--progress', `${fraction * 100}%`);
  }
  function updateDimensions() {
    const rect = selected.getBoundingClientRect();
    document.getElementById('element-size').textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
  }
  function updateCode(style) {
    const property = colorProperty();
    cssOutput.textContent = `.${classNames[selected.dataset.demoTarget]} {\n  ${property}: ${hexColor(style.getPropertyValue(property))};${selected.dataset.demoTarget !== 'heading' ? `\n  color: ${hexColor(style.color)};` : ''}\n  border-radius: ${style.borderRadius};\n  font-size: ${style.fontSize};\n}`;
  }
  function refreshControls() {
    const style = getComputedStyle(selected);
    const type = selected.dataset.demoTarget;
    const color = hexColor(style.getPropertyValue(colorProperty()));
    const sizes = { heading: [24, 64], button: [8, 18], object: [6, 14] };
    [fontInput.min, fontInput.max] = sizes[type];
    document.getElementById('element-tag').textContent = selected.tagName.toLowerCase();
    document.getElementById('element-name').textContent = `.${classNames[type]}`;
    document.getElementById('color-label').textContent = type === 'heading' ? '글자색' : '배경색';
    colorInput.setAttribute('aria-label', type === 'heading' ? '글자색 직접 선택' : '배경색 직접 선택');
    colorInput.value = color;
    document.getElementById('color-value').textContent = color.toUpperCase();
    radiusInput.value = parseFloat(style.borderRadius) || 0;
    fontInput.value = parseFloat(style.fontSize) || 12;
    document.getElementById('radius-value').textContent = `${parseFloat(style.borderRadius) || 0} px`;
    document.getElementById('font-value').textContent = `${parseFloat(style.fontSize) || 12} px`;
    swatches.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === color)));
    fillRange(radiusInput);
    fillRange(fontInput);
    updateDimensions();
    updateCode(style);
  }
  function select(element) {
    selected = element;
    targets.forEach(target => {
      target.classList.toggle('is-selected', target === element);
      target.setAttribute('aria-pressed', String(target === element));
    });
    refreshControls();
    status.textContent = `${labels[element.dataset.demoTarget]} 선택됨. 스타일을 직접 바꿔 보세요.`;
  }
  function showPanel(name, moveFocus = false) {
    activePanel = name;
    tabs.forEach(tab => {
      const active = tab.id === `${name}-tab`;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) tab.focus();
    });
    document.getElementById('style-panel').hidden = name !== 'style';
    document.getElementById('code-panel').hidden = name !== 'code';
  }
  function setColor(color) {
    selected.style.setProperty(colorProperty(), color);
    // Keep preview labels legible when a custom light or dark fill is chosen.
    if (selected.dataset.demoTarget !== 'heading') {
      const rgb = color.slice(1).match(/.{2}/g).map(value => parseInt(value, 16) / 255);
      const luminance = rgb.map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
        .reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
      selected.style.color = luminance > .179 ? '#17151c' : '#ffffff';
    }
    refreshControls();
    status.textContent = '변경 내용이 이 예제에 반영되었습니다.';
  }
  targets.forEach(element => {
    element.addEventListener('click', () => select(element));
    if (element.tagName !== 'BUTTON') element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(element); }
    });
  });
  swatches.forEach(button => button.addEventListener('click', () => setColor(button.dataset.color)));
  colorInput.addEventListener('input', () => setColor(colorInput.value));
  radiusInput.addEventListener('input', () => { selected.style.borderRadius = `${radiusInput.value}px`; refreshControls(); });
  fontInput.addEventListener('input', () => { selected.style.fontSize = `${fontInput.value}px`; refreshControls(); });
  tabs.forEach(tab => {
    tab.addEventListener('click', () => showPanel(tab.id.startsWith('code') ? 'code' : 'style'));
    tab.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        showPanel(event.key === 'Home' ? 'style' : event.key === 'End' ? 'code' : activePanel === 'style' ? 'code' : 'style', true);
      }
    });
  });
  document.getElementById('reset-demo').addEventListener('click', () => {
    targets.forEach(element => {
      const original = initialStyles.get(element);
      if (original === null) element.removeAttribute('style');
      else element.setAttribute('style', original);
    });
    select(targets.find(element => element.dataset.demoTarget === 'button'));
    status.textContent = '예제의 모든 스타일을 처음으로 되돌렸습니다.';
  });
  async function copy(text, onSuccess, onFailure) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      onSuccess();
    } catch { onFailure(); }
  }
  document.getElementById('copy-css').addEventListener('click', () => copy(cssOutput.textContent,
    () => { status.textContent = 'CSS를 클립보드에 복사했습니다.'; },
    () => { showPanel('code'); document.getElementById('code-panel').focus(); status.textContent = '복사 권한이 없어요. 코드를 선택해 직접 복사하세요.'; }));
  document.getElementById('copy-install').addEventListener('click', event => {
    const button = event.currentTarget;
    const output = document.getElementById('install-copy-status');
    const command = document.getElementById('install-command');
    copy(command.textContent,
      () => { button.textContent = '복사됨 ✓'; output.textContent = '설치 명령어를 복사했습니다.'; },
      () => { button.textContent = '직접 선택해 복사'; output.textContent = '복사 권한이 없어 명령어를 선택했습니다. 직접 복사하세요.';
        const range = document.createRange(); range.selectNodeContents(command); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); });
  });
  document.querySelectorAll('.mobile-menu a').forEach(anchor => anchor.addEventListener('click', () => { anchor.closest('details').open = false; }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { const menu = document.querySelector('.mobile-menu'); if (menu.open) { menu.open = false; menu.querySelector('summary').focus(); } }
  });
  document.querySelectorAll('[data-demo-control]').forEach(control => { control.disabled = false; });
  if ('ResizeObserver' in window) new ResizeObserver(() => { updateDimensions(); updateCode(getComputedStyle(selected)); }).observe(document.querySelector('.sample-page'));
  window.addEventListener('resize', refreshControls);
  refreshControls();
})();
