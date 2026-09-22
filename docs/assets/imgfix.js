(function () {
  var BASE = "/smart-light";
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

  fetch(BASE + '/assets/image-map.json?v=' + "320fa398")
    .then(function (r) { return r.json(); })
    .then(function (m) { MAP = m; sweep(); })
    .catch(function () { /* fall back to prefixing only */ });

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset'],
  });
  document.addEventListener('DOMContentLoaded', sweep);
  schedule();
})();
