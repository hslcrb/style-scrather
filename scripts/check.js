const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { validateManifestAssets } = require('./manifest-assets.js');
const root = path.resolve(__dirname, '..');
const manifest = require('../manifest.json');
const pkg = require('../package.json');
assert.equal(manifest.manifest_version, 3, 'Manifest V3 required');
assert.equal(manifest.version, pkg.version, 'Package and manifest versions must match');
assert.ok(manifest.description.length <= 132, 'Manifest description exceeds Chrome limit');
for (const group of manifest.content_scripts || []) {
  assert.equal(new Set(group.js || []).size, (group.js || []).length, 'Duplicate injected script');
}
let checked = 0;
const files = [];
const walk = dir => {
  for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
    if (file.name.startsWith('.') || ['node_modules', 'dist', 'test-results'].includes(file.name)) continue;
    const filename = path.join(dir, file.name);
    if (file.isDirectory()) walk(filename);
    else if (file.isFile()) {
      files.push(path.relative(root, filename).split(path.sep).join('/'));
      if (file.name.endsWith('.js')) {
        new vm.Script(fs.readFileSync(filename, 'utf8'), { filename: path.relative(root, filename) });
        checked++;
      }
    }
  }
};
walk(root);
const refs = validateManifestAssets(manifest, files);
console.log(`Syntax: ${checked} JavaScript files. Manifest: ${refs.length} referenced files. Versions: ${manifest.version}.`);
