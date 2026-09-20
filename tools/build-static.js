/*
 * Build a static, GitHub-Pages-ready copy of the mirror into docs/.
 * (GitHub Pages only serves from the repo root or /docs.)
 *
 * The local dev server does three things at request time that Pages cannot:
 *   1. injects the bundle CSS/JS into every HTML document,
 *   2. serves /bundle/<slug> from the homepage document,
 *   3. serves Next's /_next/image?url=...&w=... optimizer URLs.
 * This script bakes all three into real files, and rewrites every absolute
 * path to sit under BASE (the project-page subpath).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC = path.join(__dirname, '..', 'mirror');
const OUT = path.join(__dirname, '..', 'docs');
const BASE = process.env.BASE_PATH ?? '/smart-light';

// Same key the dev server used when it cached a query-string URL.
const qhash = (search) => crypto.createHash('md5').update(search).digest('hex').slice(0, 10);

const EXT = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/avif': 'avif', 'image/gif': 'gif', 'image/svg+xml': 'svg' };

const metaOf = (file) => {
  try { return JSON.parse(fs.readFileSync(`${file}.meta.json`, 'utf8')); } catch { return {}; }
};

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (!e.name.endsWith('.meta.json')) out.push(p);
  }
  return out;
};

// The dev server sanitized filenames, turning Next's dynamic-route folders
// ([locale], [slug]) into _locale_ / _slug_. Put the brackets back so the
// chunk URLs the browser asks for actually resolve.
const unmangle = (rel) => rel.split(path.sep)
  .map((seg) => seg.replace(/^_([A-Za-z0-9.]+)_$/, '[$1]'))
  .join(path.sep);

const write = (rel, data) => {
  const dest = path.join(OUT, unmangle(rel));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, data);
};

/* --------------------------------------------------------------- version */

// Cache-bust the injected assets. Without this the HTML points at a stable
// filename, and Pages' own cache headers plus the browser's disk cache can keep
// serving a previous build long after a deploy.
const bundleJs = fs.readFileSync(path.join(SRC, '_bundle', 'bundle.js'), 'utf8');
const bundleCss = fs.readFileSync(path.join(SRC, '_bundle', 'bundle.css'), 'utf8');
const VERSION = crypto.createHash('md5')
  .update(bundleJs + bundleCss + fs.readFileSync(__filename, 'utf8'))
  .digest('hex').slice(0, 8);

/* ----------------------------------------------------------------- inputs */

fs.rmSync(OUT, { recursive: true, force: true });

const files = walk(SRC);
const rel = (f) => path.relative(SRC, f);

const htmlPages = [];   // mirrored documents, keyed by their clean route
const images = new Map(); // hash -> {file, ext}
const passthrough = [];

for (const f of files) {
  const r = rel(f);
  const type = (metaOf(f).type || '').split(';')[0];
  const base = path.basename(r);

  if (r.startsWith('_next/image__')) {
    images.set(base.slice('image__'.length), { file: f, ext: EXT[type] || 'webp' });
    continue;
  }
  // Documents fetched with a query string are Next's RSC payloads — a static
  // site never asks for them.
  if (base.includes('__')) continue;
  if (r.startsWith('_bundle/')) continue; // published separately, under assets/

  if (type === 'text/html') htmlPages.push({ route: r, file: f });
  else passthrough.push({ r, file: f });
}

/* ------------------------------------------------------------- rewriting */

// Collect every optimizer URL we rewrite, so we can point bundle.js at real
// files too: backend media uuid -> the widest variant we actually have.
const mediaByUuid = new Map();

const IMG_URL = /\/_next\/image\?(?:\\u0026|&amp;|[^"'\s),\\<>])+/g;

// source url -> { width: published file }, handed to the runtime shim so
// client-rendered images can be resolved too.
const imageMap = {};

function rewriteImages(text) {
  return text.replace(IMG_URL, (match) => {
    const search = match.slice('/_next/image'.length)
      .replace(/\\u0026/g, '&')
      .replace(/&amp;/g, '&');
    const hit = images.get(qhash(search));
    if (!hit) return match; // never cached; leave it (will 404, but rare)

    const params = new URLSearchParams(search);
    const url = decodeURIComponent(params.get('url') || '');
    const w = Number(params.get('w')) || 0;
    const out = `${qhash(search)}.${hit.ext}`;

    if (url) {
      (imageMap[url] ||= {})[w] = out;
      const uuid = url.split('/').pop();
      const best = mediaByUuid.get(uuid);
      if (!best || w > best.w) mediaByUuid.set(uuid, { w, ...hit });
    }
    return `${BASE}/_next/img/${out}`;
  });
}

// Root-relative asset and link paths need the project-page prefix.
const ASSET_DIRS = '_next|images|fonts|icons|storage|assets';
function rewritePaths(text) {
  return text
    .replace(new RegExp(`(["'\\s,(])\\/(${ASSET_DIRS})\\/`, 'g'), `$1${BASE}/$2/`)
    .replace(/(href|src|action)="\/(?!\/)/g, `$1="${BASE}/`)
    .replace(/(href|src)="\/"/g, `$1="${BASE}/"`)
    .replace(/"\/(favicon|android-icon|apple-icon|ms-icon|manifest|browserconfig|robots|sitemap)/g,
      `"${BASE}/$1`);
}

const INJECT = `<link rel="stylesheet" href="${BASE}/assets/bundle.css?v=${VERSION}">`
  + `<script src="${BASE}/assets/imgfix.js?v=${VERSION}"></script>`
  + `<script defer src="${BASE}/assets/bundle.js?v=${VERSION}"></script></head>`;

function buildDoc(html) {
  let out = rewriteImages(html);
  out = rewritePaths(out);
  // Undo the prefix where it was applied twice or to an already-absolute URL.
  out = out.split(`${BASE}${BASE}/`).join(`${BASE}/`);
  return out.replace('</head>', INJECT);
}

/* -------------------------------------------------------------- emitting */

const routeToPath = (route) => (route === 'index' ? 'index.html' : `${route}/index.html`);

let homepage = null;
for (const { route, file } of htmlPages) {
  const html = buildDoc(fs.readFileSync(file, 'utf8'));
  write(routeToPath(route), html);
  if (route === 'index') homepage = html;
}

for (const { r, file } of passthrough) {
  // Next's webpack runtime hardcodes its public path, so chunk loading would
  // 404 under a project-page subpath and tear the hydrated app down.
  if (BASE && /_next\/static\/chunks\/webpack-.*\.js$/.test(r)) {
    write(r, fs.readFileSync(file, 'utf8').split('.p="/_next/"').join(`.p="${BASE}/_next/"`));
    continue;
  }
  write(r, fs.readFileSync(file));
}

for (const [hash, { file, ext }] of images) {
  write(path.join('_next', 'img', `${hash}.${ext}`), fs.readFileSync(file));
}

/* ------------------------------------------------ bundle assets + routes */

// Every bundle product image becomes a plain file under assets/media.
const slugs = [...bundleJs.matchAll(/storage\/media\/([0-9a-f-]+\.webp)/g)].map((m) => m[1]);
let copied = 0;
for (const name of new Set(slugs)) {
  const hit = mediaByUuid.get(name);
  if (!hit) { console.warn('  ! no cached variant for', name); continue; }
  const bytes = fs.readFileSync(hit.file);
  write(path.join('assets', 'media', name), bytes);
  // The dev mirror serves the same paths, so keep a copy there too.
  const devDir = path.join(SRC, 'assets', 'media');
  fs.mkdirSync(devDir, { recursive: true });
  fs.writeFileSync(path.join(devDir, name), bytes);
  copied++;
}

write(path.join('assets', 'bundle.js'), bundleJs);
write(path.join('assets', 'bundle.css'), bundleCss);

// Bundles open at /?bundle=<slug>, which is a route Next already knows, so its
// router hydrates the page instead of tearing the shell down. /bundle/<slug>/
// stays as a pretty entry point that forwards there.
const redirect = (slug) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Redirecting…</title>
<meta http-equiv="refresh" content="0; url=${BASE}/?bundle=${slug}">
<link rel="canonical" href="${BASE}/?bundle=${slug}">
<script>location.replace(${JSON.stringify(`${BASE}/?bundle=${slug}`)});</script>
</head><body><a href="${BASE}/?bundle=${slug}">Continue to the bundle builder</a></body></html>`;
// Only the top-level BUNDLES entries, which are the ones with a `name:` on the
// following line — the per-item slugs sit inline after their own `name:`.
const bundleSlugs = [...bundleJs.matchAll(/slug:\s*'([a-z0-9-]+)',\s*\n\s*name:/g)]
  .map((m) => m[1]);
for (const slug of bundleSlugs) write(path.join('bundle', slug, 'index.html'), redirect(slug));

/* ------------------------------------------------------- runtime img shim */

// Hydration re-renders images from React's own props, reintroducing both
// unprefixed paths and /_next/image optimizer URLs that no static host can
// answer. This shim rewrites them back as they appear.
write(path.join('assets', 'image-map.json'), JSON.stringify(imageMap));
write(path.join('assets', 'imgfix.js'), `(function () {
  var BASE = ${JSON.stringify(BASE)};
  var MAP = null;

  function pick(url, want) {
    var sizes = MAP && MAP[url];
    if (!sizes) return null;
    var widths = Object.keys(sizes).map(Number).sort(function (a, b) { return a - b; });
    var hit = widths.find(function (w) { return w >= want; });
    return sizes[hit != null ? hit : widths[widths.length - 1]];
  }

  function fix(raw) {
    if (!raw) return raw;
    var i = raw.indexOf('/_next/image?');
    if (i >= 0) {
      var p = new URLSearchParams(raw.slice(raw.indexOf('?', i)));
      var url = p.get('url') || '';
      var file = pick(url, Number(p.get('w')) || 0);
      if (file) return BASE + '/_next/img/' + file;
      // Not cached: fall back to the original asset, prefixed.
      return url.charAt(0) === '/' ? BASE + url : url;
    }
    // Root-absolute asset path that lost the deploy prefix.
    if (BASE && raw.charAt(0) === '/' && raw.slice(0, BASE.length) !== BASE) return BASE + raw;
    return raw;
  }

  var fixSet = function (v) {
    return v.split(',').map(function (part) {
      var s = part.trim(); var sp = s.lastIndexOf(' ');
      var u = sp > 0 ? s.slice(0, sp) : s;
      return fix(u) + (sp > 0 ? s.slice(sp) : '');
    }).join(', ');
  };

  function sweep() {
    var nodes = document.querySelectorAll('img[src*="/_next/image"], img[srcset*="/_next/image"], source[srcset*="/_next/image"]'
      + (BASE ? ', img[src^="/"], img[srcset^="/"], source[srcset^="/"]' : ''));
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var src = n.getAttribute('src');
      if (src) { var f = fix(src); if (f !== src) n.setAttribute('src', f); }
      var ss = n.getAttribute('srcset');
      if (ss) { var g = fixSet(ss); if (g !== ss) n.setAttribute('srcset', g); }
    }
  }

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    setTimeout(function () { queued = false; sweep(); }, 0);
  }

  fetch(BASE + '/assets/image-map.json?v=' + "${VERSION}")
    .then(function (r) { return r.json(); })
    .then(function (m) { MAP = m; sweep(); })
    .catch(function () { /* fall back to prefixing only */ });

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset'],
  });
  document.addEventListener('DOMContentLoaded', sweep);
  schedule();
})();
`);

/* ---------------------------------------------------------------- extras */

write('.nojekyll', '');
if (process.env.CNAME) write('CNAME', process.env.CNAME);

console.log(`pages        ${htmlPages.length}`);
console.log(`bundle pages ${bundleSlugs.length} (${bundleSlugs.join(', ')})`);
console.log(`images       ${images.size}`);
console.log(`media copied ${copied}/${new Set(slugs).size}`);
console.log(`other files  ${passthrough.length}`);
console.log(`base path    ${BASE || '(root)'}`);
console.log(`asset version ${VERSION}`);
