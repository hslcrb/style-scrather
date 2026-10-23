const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createServer } = require('../scripts/serve.js');

test('preview server serves public pages and blocks repository traversal', async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'scratcher-server-'));
  fs.mkdirSync(path.join(root, 'website'));
  fs.mkdirSync(path.join(root, 'icons'));
  fs.mkdirSync(path.join(root, '.git'));
  fs.writeFileSync(path.join(root, 'website/index.html'), '<h1>Preview</h1>');
  fs.writeFileSync(path.join(root, 'website/site.css'), 'body{color:red}');
  fs.writeFileSync(path.join(root, 'icons/mark.svg'), '<svg/>');
  fs.writeFileSync(path.join(root, '.git/config'), 'private config');
  fs.writeFileSync(path.join(root, 'package.json'), '{"private":true}');
  const server = createServer({ root });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const request = (url, method = 'GET') => new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: server.address().port, path: url, method }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
  assert.equal((await request('/')).body, '<h1>Preview</h1>');
  assert.equal((await request('/website/')).status, 200);
  assert.match((await request('/site.css?v=1')).headers['content-type'], /text\/css/);
  assert.match((await request('/icons/mark.svg')).headers['content-type'], /image\/svg\+xml/);
  assert.equal((await request('/icons/mark.svg', 'HEAD')).body, '');
  assert.equal((await request('/missing')).status, 404);
  for (const url of ['/.git/config', '/website/../.git/config', '/%2e%2e/package.json', '/website/%2e%2e/package.json', '/website/%00', '/website/%ZZ']) {
    assert.ok((await request(url)).status >= 400, `must reject ${url}`);
  }
  assert.equal((await request('/package.json')).status, 404);
  assert.equal((await request('/', 'POST')).status, 405);
});
