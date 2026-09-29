import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

export function startServer() {
  const port = Number(process.env.PORT || 5173);
  const server = createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, 'http://localhost').pathname,
      );
      let file = path.resolve(root, '.' + pathname);
      const relativePath = path.relative(root, file);
      if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      let status = 200;
      try {
        if ((await stat(file)).isDirectory())
          file = path.join(file, 'index.html');
        await stat(file);
      } catch {
        file = path.join(root, '404.html');
        status = 404;
      }
      const body = await readFile(file);
      response.writeHead(status, {
        'Content-Type':
          contentTypes[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response
        .writeHead(400)
        .end('Unable to serve this request. Run npm run build first.');
    }
  });
  server.listen(port, '127.0.0.1', () =>
    console.log(`Bareeq: http://127.0.0.1:${port}`),
  );
  server.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  return server;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  startServer();
