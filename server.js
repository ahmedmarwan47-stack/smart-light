// Local mirror of https://www.smartlighteg.com
// Serves files from ./mirror; anything missing is fetched from the origin once, saved, then served locally.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const ORIGIN = 'https://www.smartlighteg.com';
const ROOT = path.join(__dirname, 'mirror');
const PORT = process.env.PORT || 3000;
// /bundle has no counterpart upstream: serve the homepage document so the real
// header, footer and stylesheets load, then bundle.js swaps in the builder.
const isBundle = (p) => /^(\/ar)?\/bundle\/[a-z0-9-]+$/.test(p);
// ?bundle=<slug> is the homepage document with a builder on top.
const bundleQuery = (u) => /[?&]bundle=[a-z0-9-]+/.test(u);
const TYPES = { '.js': 'application/javascript', '.css': 'text/css' };
const INJECT = '<link rel="stylesheet" href="/_bundle/bundle.css"><script defer src="/_bundle/bundle.js"></script></head>';
fs.mkdirSync(ROOT, { recursive: true });

function keyFor(url) {
  const u = new URL(url, 'http://x');
  let p = decodeURIComponent(u.pathname);
  if (p.endsWith('/')) p += 'index';
  let name = p.replace(/[^a-zA-Z0-9._\/\[\]-]/g, '_');
  if (u.search) name += '__' + crypto.createHash('md5').update(u.search).digest('hex').slice(0, 10);
  return path.join(ROOT, name);
}

async function handle(req, res) {
  const pathOnly = req.url.split('?')[0];
  const upstream = (isBundle(pathOnly) || bundleQuery(req.url))
    ? (pathOnly.startsWith('/ar') ? '/ar' : '/')
    : req.url;
  const file = keyFor(upstream);
  if (!file.startsWith(ROOT)) { res.writeHead(400); return res.end(); }
  const metaFile = file + '.meta.json';
  if (!(fs.existsSync(file) && fs.statSync(file).isFile())) {
    if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
    const r = await fetch(ORIGIN + upstream, { headers: { 'accept': req.headers.accept || '*/*', 'accept-language': 'en', 'user-agent': req.headers['user-agent'] || 'Mozilla/5.0' }, redirect: 'manual' });
    if (r.status >= 300 && r.status < 400) {
      const loc = (r.headers.get('location') || '/').replace(ORIGIN, '');
      res.writeHead(r.status, { location: loc }); return res.end();
    }
    const buf = Buffer.from(await r.arrayBuffer());
    if (r.status !== 200) { res.writeHead(r.status, { 'content-type': r.headers.get('content-type') || 'text/plain' }); return res.end(buf); }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, buf);
    fs.writeFileSync(metaFile, JSON.stringify({ type: r.headers.get('content-type') }));
    console.log('fetched', upstream);
  }
  let type = TYPES[path.extname(file)] || 'application/octet-stream';
  try { type = JSON.parse(fs.readFileSync(metaFile)).type || type; } catch {}
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
  if (!type.includes('text/html')) return fs.createReadStream(file).pipe(res);
  res.end(fs.readFileSync(file, 'utf8').replace('</head>', INJECT));
}

http.createServer((q, s) => handle(q, s).catch(e => { console.error(e); s.writeHead(502); s.end('mirror error'); }))
  .listen(PORT, () => console.log(`Mirror running at http://localhost:${PORT}`));
