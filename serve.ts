// Hearth Ledger — local preview server (Node 22, standard library only).
//
// Serves app/ at http://localhost:8080 so the site can be opened in desktop
// Chrome and at a phone size exactly as the grader's static host would serve
// it: app/index.html at /, every other file under app/ at its own path, and
// nothing else. It is a development helper only; the entry itself is the
// static files, and main.ts is what hands them in.
//
//   node serve.ts            (port 8080)
//   node serve.ts --port 8090

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const appRoot = resolve(join(repoRoot, 'app'));

const mediaTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const portFlag = process.argv.indexOf('--port');
const port = portFlag >= 0 ? Number(process.argv[portFlag + 1] || 8080) : 8080;

const server = createServer((req, res) => {
  const rawPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const relPath = rawPath === '/' ? 'index.html' : rawPath.replace(/^\/+/, '');
  const filePath = resolve(join(appRoot, normalize(relPath)));
  if (!filePath.startsWith(appRoot) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found\n');
    return;
  }
  res.writeHead(200, {
    'content-type': mediaTypes[extname(filePath)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`Hearth Ledger preview at http://localhost:${port}/`);
});
