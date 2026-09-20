// Serve docs/ under the project-page subpath, the way GitHub Pages will.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', 'docs');
const BASE = process.env.BASE_PATH ?? '/smart-light';
const PORT = process.env.PORT || 4000;
const TYPES = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.webp':'image/webp',
  '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.ico':'image/x-icon',
  '.woff2':'font/woff2', '.woff':'font/woff', '.json':'application/json', '.mp4':'video/mp4', '.txt':'text/plain' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length) || '/';
  else if (BASE) { res.writeHead(404); return res.end('outside base path'); }
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(400); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end('not found: ' + p); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`preview: http://localhost:${PORT}${BASE}/`));
