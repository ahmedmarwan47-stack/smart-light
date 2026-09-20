# Smart Light — bundle builder

A local mirror of [smartlighteg.com](https://www.smartlighteg.com/) with a
**named product bundles** feature added on top.

**Live:** https://ahmedmarwan47-stack.github.io/smart-light/

## The bundle mechanic

Each bundle is one card in the product grid that reads as a single product with
**one fixed price**. Opening it reveals a builder: the shopper spreads N units
across four products however they like. Any mix totalling exactly N costs the
same — the price never moves with the mix.

| Bundle | Pick | Price | Was |
| --- | --- | --- | --- |
| Home Essentials Bulb Pack | any 12 bulbs | EGP 999 | 1,260 |
| Spotlight Starter Pack | any 10 spotlights | EGP 699 | 920 |
| Downlight Pro Pack | any 8 downlights | EGP 899 | 1,024 |

A bundle added to the cart appears as a single product line in the site's own
cart drawer, with a quantity counter like any other product.

Everything is driven by the `BUNDLES` array at the top of
`mirror/_bundle/bundle.js` — add a bundle, rename one, change its size or swap a
product, and the cards, pages and cart all follow.

## Layout

    mirror/            the mirrored site; mirror/_bundle/ is the feature source
    docs/              the built static site that GitHub Pages serves
    server.js          dev server: mirrors on demand, injects the feature
    tools/build-static.js   turns mirror/ into docs/
    tools/preview.js   serves docs/ at the deploy subpath

## Working on it

Dev server — fetches anything not yet mirrored from the live site and caches it:

    node server.js          # http://localhost:3000

Build and preview exactly what Pages will serve:

    node tools/build-static.js
    node tools/preview.js    # http://localhost:4000/smart-light/

`BASE_PATH` controls the deploy prefix (default `/smart-light`). Build for a
root domain with `BASE_PATH= node tools/build-static.js`.

## What the build has to fix

GitHub Pages is a plain file host, so the build bakes in what the dev server
does at request time:

- injects the bundle CSS/JS into every document;
- converts Next's `/_next/image?url=...&w=...` optimizer URLs into real files;
- rewrites root-absolute paths to sit under the project-page subpath, including
  the webpack runtime's hardcoded public path (otherwise chunk loading 404s and
  the hydrated app tears itself down);
- restores Next's `[locale]` / `[slug]` folder names, which the mirror's
  filename sanitising had flattened;
- serves bundles at `/?bundle=<slug>` — a route Next already knows — with
  `/bundle/<slug>/` kept as a redirect;
- ships `assets/imgfix.js`, which repairs image URLs that React re-renders from
  its own props after hydration.

## Note

This is a mirror for design work, not a running store. Checkout, search and
live product data still point at the real backend and will not work here.
