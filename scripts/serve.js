// Local preview only. Expose public assets, never repository metadata or dependencies.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.md': 'text/plain; charset=utf-8'
};
const PUBLIC_ROOTS = new Set(['website', 'demo', 'icons', 'content', 'popup', 'docs']);

function createServer({ root = path.resolve(__dirname, '..') } = {}) {
  const realRoot = fs.realpathSync(root);
  return http.createServer(async (req, res) => {
    const reply = (status, text) => {
      res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : text);
    };
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.setHeader('Allow', 'GET, HEAD');
      return reply(405, 'Method not allowed');
    }
    let pathname;
    try { pathname = decodeURIComponent((req.url || '/').split('?')[0]); }
    catch { return reply(400, 'Invalid URL encoding'); }
    if (/[\u0000-\u001f\\]/.test(pathname)) return reply(400, 'Invalid path');
    const parts = pathname.split('/').filter(Boolean);
    if (parts.some(part => part.startsWith('.'))) return reply(403, 'Forbidden');
    const base = PUBLIC_ROOTS.has(parts[0]) ? realRoot : path.join(realRoot, 'website');
    let candidate = path.resolve(base, ...parts);
    if (!candidate.startsWith(`${realRoot}${path.sep}`)) return reply(403, 'Forbidden');
    try {
      let stat = await fs.promises.stat(candidate);
      if (stat.isDirectory()) {
        if (!pathname.endsWith('/')) {
          res.writeHead(308, { Location: `${pathname}/` });
          return res.end();
        }
        candidate = path.join(candidate, 'index.html');
        stat = await fs.promises.stat(candidate);
      }
      if (!stat.isFile()) return reply(404, 'Not found');
      const realFile = await fs.promises.realpath(candidate);
      if (!realFile.startsWith(`${realRoot}${path.sep}`)) return reply(403, 'Forbidden');
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(realFile).toLowerCase()] || 'application/octet-stream',
        'Content-Length': stat.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'
      });
      if (req.method === 'HEAD') return res.end();
      const stream = fs.createReadStream(realFile);
      stream.on('error', () => res.destroy());
      stream.pipe(res);
    } catch (error) {
      reply(error.code === 'EACCES' ? 403 : 404, 'Not found');
    }
  });
}

function startServer() {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be 0–65535');
  const server = createServer();
  server.on('error', error => { console.error(`Preview server: ${error.message}`); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => {
    console.log(`Style Scratcher → http://127.0.0.1:${server.address().port}/`);
    console.log('Interactive fixture → /demo/');
  });
  return server;
}

if (require.main === module) startServer();
module.exports = { createServer, startServer };
