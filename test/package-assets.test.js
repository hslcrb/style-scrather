const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { build } = require('../scripts/build.js');

function fixture(t, change) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'scratcher-package-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const manifest = {
    manifest_version: 3, version: '1.0.0',
    background: { service_worker: 'background/worker.js' },
    action: { default_popup: 'popup/index.html', default_icon: { 16: 'icons/mark.png' } },
    content_scripts: [{ js: ['content/main.js'] }],
    web_accessible_resources: [{ resources: ['content/styles/shadow.css', 'icons/*'], matches: ['<all_urls>'] }]
  };
  change(manifest);
  const files = {
    LICENSE: 'fixture', 'manifest.json': JSON.stringify(manifest),
    'background/worker.js': '', 'popup/index.html': '<p>Popup</p>',
    'content/main.js': '', 'icons/mark.png': 'fixture'
  };
  for (const [name, value] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), value);
  }
  return root;
}

test('package rejects a missing web-accessible stylesheet', t => {
  const root = fixture(t, () => {});
  assert.throws(() => build(root), /Missing manifest asset: content\/styles\/shadow\.css/);
  assert.equal(fs.existsSync(path.join(root, 'dist')), false);
});

test('package rejects a missing declared content stylesheet', t => {
  const root = fixture(t, manifest => {
    manifest.web_accessible_resources = [];
    manifest.content_scripts[0].css = ['content/styles/injected.css'];
  });
  assert.throws(() => build(root), /Missing manifest asset: content\/styles\/injected\.css/);
});

test('package rejects an unmatched accessible resource wildcard', t => {
  const root = fixture(t, manifest => {
    manifest.web_accessible_resources[0].resources = ['icons/missing-*.png'];
  });
  assert.throws(() => build(root), /Missing manifest asset: icons\/missing-\*\.png/);
});
