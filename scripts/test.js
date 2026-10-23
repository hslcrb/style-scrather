// Run suites in separate processes: the legacy suite mutates browser globals.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const files = ['verify.js', ...fs.readdirSync(path.join(root, 'test')).filter(name => name.endsWith('.test.js')).sort()];
for (const file of files) {
  console.log(`\nTest suite: ${file}`);
  const result = spawnSync(process.execPath, [path.join(root, 'test', file)], { cwd: root, stdio: 'inherit' });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`\n${files.length} test suites passed.`);
