const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../content/update-guardian.js'), 'utf8');

test('content update checks use the extension worker and do not touch page storage', async () => {
  let calls = 0;
  const window = {};
  vm.runInNewContext(source, {
    window, console: { warn() {} },
    chrome: { runtime: { sendMessage: async message => {
      assert.equal(message.type, 'GET_LATEST_RELEASE');
      calls++;
      return { success: true, release: { tag_name: 'v4.2.0', name: 'Refresh', assets: [] } };
    } } },
    localStorage: { getItem() { throw new Error('Page storage must not be used'); } },
    fetch: async () => { throw new Error('Use the worker'); }, AbortController, setTimeout, clearTimeout
  });
  const guardian = new window.UpdateGuardian({ currentVersion: '4.1.0' });
  const results = await Promise.all([guardian.checkForUpdate(), guardian.checkForUpdate()]);
  assert.ok(results.every(result => result.success && result.hasUpdate));
  assert.equal(results[0].latestVersion, '4.2.0');
  assert.equal(calls, 1);
});
