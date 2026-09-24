// Servidor estático opcional, feito apenas com módulos nativos do Node.js.
// node server.mjs        → somente neste computador
// node server.mjs --lan  → também acessível pelo celular na mesma rede
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, relative, extname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const host = process.argv.includes('--lan') ? '0.0.0.0' : '127.0.0.1';
const port = 8080;
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };

const server = createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    const url = new URL(req.url, `http://localhost:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    const target = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const rel = relative(root, target).replaceAll('\\', '/');
    const allowed = ['index.html', 'style.css', 'game.js'].includes(rel) ||
      (rel.startsWith('assets/') && Boolean(mime[extname(target)]));
    if (rel.startsWith('..') || isAbsolute(rel) || !allowed) { res.writeHead(404).end('Não encontrado'); return; }
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type': mime[extname(target)], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404).end('Não encontrado'); }
});
server.on('error', error => { console.error(`Não foi possível abrir o servidor: ${error.message}`); process.exitCode = 1; });
server.listen(port, host, () => {
  console.log(`Wanzeller: http://localhost:${port}`);
  if (host === '0.0.0.0') console.log(`Celular: http://IP-DO-COMPUTADOR:${port} (mesma rede Wi-Fi).`);
  console.log('Pressione Ctrl+C para encerrar.');
});
