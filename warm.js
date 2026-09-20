// Pre-downloads the homepage and every asset/page it references so the mirror works offline.
const base = 'http://localhost:' + (process.env.PORT || 3000);
const seen = new Set(), queue = ['/', '/ar'];
(async () => {
  while (queue.length) {
    const u = queue.shift(); if (seen.has(u)) continue; seen.add(u);
    const r = await fetch(base + u); const t = r.headers.get('content-type') || '';
    if (!r.ok || !/html|css|javascript|json/.test(t)) continue;
    const body = await r.text();
    for (const m of body.matchAll(/["'(=\s](\/(?:_next|images|fonts|storage|favicon|icons|manifest)[^"'\s)\\<>]*)/g)) {
      const p = m[1].replace(/&amp;/g, '&').replace(/\\u0026/g, '&');
      if (!seen.has(p) && !queue.includes(p)) queue.push(p);
    }
    for (const m of body.matchAll(/href="(\/[a-z0-9\-\/]*)"/g)) if (!seen.has(m[1]) && seen.size < 150) queue.push(m[1]);
  }
  console.log('warmed', seen.size, 'urls');
})();
