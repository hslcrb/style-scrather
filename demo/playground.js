// This fixture never injects the extension itself. Load the real unpacked extension.
const counter = document.getElementById('counter');
let clicks = 0;
counter.addEventListener('click', () => { counter.textContent = `클릭: ${++clicks}`; });
