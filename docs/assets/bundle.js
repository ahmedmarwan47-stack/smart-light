/*
 * Smart Light — named product bundles.
 *
 * Each bundle is one card in the product grid that reads as a single product
 * with ONE fixed price. Opening it reveals a builder: the shopper spreads
 * `size` units across the bundle's four products however they like. Any mix
 * totalling exactly `size` costs `price` — the price never moves with the mix.
 *
 * Add a bundle, rename one, change its size or swap a product entirely from
 * the BUNDLES array below; the cards, the pages and the cart all follow.
 */
/*
 * Variant axes. A product can go into a bundle more than once under different
 * variants -- 4 bulbs as 2 warm and 2 white -- so a line in the builder is a
 * product AND a variant, never just a product. Variants never move the price:
 * every unit counts as one of the bundle's `size`, whichever variant it is.
 *
 * All four products in a bundle share the bundle's axes, so they hang off the
 * bundle rather than off each item.
 */
const BULB_AXES = [
  { name: 'Light', options: ['Warm', 'White', 'Blue', 'Tri-Color'] },
  { name: 'Watt', options: ['5 W', '16 W', '24 W'] },
  { name: 'Cap Base', options: ['E26', 'E27', 'G4'] },
];

const SPOTLIGHT_AXES = [
  { name: 'Light', options: ['Warm', 'White', 'Tri-Color'] },
  { name: 'Watt', options: ['5 W', '7 W', '12 W'] },
];

const DOWNLIGHT_AXES = [
  { name: 'Light', options: ['Warm', 'White', 'Tri-Color'] },
  { name: 'Watt', options: ['12 W', '18 W', '24 W'] },
];

const BUNDLES = [
  {
    slug: 'home-essentials-bulb-pack',
    name: 'Home Essentials Bulb Pack',
    tagline: 'Any 12 bulbs — one fixed price',
    size: 12,
    price: 999,
    compareAt: 1260, // what `size` of the priciest item would have cost
    axes: BULB_AXES,
    items: [
      { name: 'LED Classic Bulbs',                slug: 'led-classic-bulbs',            unit: 105, img: 'https://backend.smartlighteg.com/storage/media/3f320e9c-fb1d-4e74-9e7d-f705b9a310b0.webp' },
      { name: 'LED Classic Bulb 12W & 3 Colours', slug: 'led-classic-bulb-3-colours',   unit: 100, img: 'https://backend.smartlighteg.com/storage/media/9f4dff33-70a9-4a0b-8571-f7eea768d58a.webp' },
      { name: 'LED Candle 6W & 3 Colours Lamp',   slug: 'led-candle-3-colours-lamp',    unit: 88,  img: 'https://backend.smartlighteg.com/storage/media/c81edcf6-1711-4a00-a8f8-90de155926d3.webp' },
      { name: 'LED Candle Lamps',                 slug: 'led-candle-lamps',             unit: 66,  img: 'https://backend.smartlighteg.com/storage/media/d344a736-a16f-4b08-b5dc-109825b0bfc5.webp' },
    ],
  },
  {
    slug: 'spotlight-starter-pack',
    name: 'Spotlight Starter Pack',
    tagline: 'Any 10 spotlights — one fixed price',
    size: 10,
    price: 699,
    compareAt: 920,
    axes: SPOTLIGHT_AXES,
    items: [
      { name: 'LED Spotlight Lamps',                              slug: 'led-spotlight-lamps',                            unit: 63, img: 'https://backend.smartlighteg.com/storage/media/84a67c24-79d9-4eda-87a3-c5c517c1532f.webp' },
      { name: 'LED Spotlight 5W & 3 Colours Lamp',                slug: 'led-spotlight-3-colours-lamp',                   unit: 81, img: 'https://backend.smartlighteg.com/storage/media/84a67c24-79d9-4eda-87a3-c5c517c1532f.webp' },
      { name: 'LED Recessed Directional Spotlights',              slug: 'led-recessed-directional-spotlights',            unit: 69, img: 'https://backend.smartlighteg.com/storage/media/1171d315-319d-407c-888b-1fdc49f039b0.webp' },
      { name: 'LED Recessed Directional Spotlights 5W & 3 Colours', slug: 'led-recessed-directional-spotlights-3-colours', unit: 92, img: 'https://backend.smartlighteg.com/storage/media/1171d315-319d-407c-888b-1fdc49f039b0.webp' },
    ],
  },
  {
    slug: 'downlight-pro-pack',
    name: 'Downlight Pro Pack',
    tagline: 'Any 8 downlights — one fixed price',
    size: 8,
    price: 899,
    compareAt: 1024,
    axes: DOWNLIGHT_AXES,
    items: [
      { name: 'Round Recessed LED Plastic Downlights',  slug: 'round-recessed-led-plastic-downlights',  unit: 105, img: 'https://backend.smartlighteg.com/storage/media/b2420529-393c-47c1-8d76-94ee675c10c4.webp' },
      { name: 'Square Recessed LED Plastic Downlights', slug: 'square-recessed-led-plastic-downlights', unit: 105, img: 'https://backend.smartlighteg.com/storage/media/9a8c4ec1-2cbf-4c8c-bdc8-50e4d83a3649.webp' },
      { name: 'Round Recessed LED Wefit Downlights',    slug: 'round-recessed-led-wefit-downlights',    unit: 128, img: 'https://backend.smartlighteg.com/storage/media/502b5648-7251-45eb-94da-a627ae57963c.webp' },
      { name: 'Recessed LED COB Downlights',            slug: 'recessed-led-cob-downlights',           unit: 119, img: 'https://backend.smartlighteg.com/storage/media/3edb2ca9-9dd7-4ca9-9411-f29a6b5eb77d.webp' },
    ],
  },
];

const CART_KEY = 'sl_bundle_cart';
// Lines are what the builder stores now: one entry per product+variant.
const linesKey = (b) => `sl_bundle_lines_${b.slug}`;
// The pre-variants key, still read once so an in-progress bundle survives.
const qtyKey = (b) => `sl_bundle_qty_${b.slug}`;

// The site's own add-to-cart glyph, reused verbatim so the buttons match.
const PLUS_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-white" aria-hidden="true"><path d="M14.1608 7.5166H8.50621V1.84003C8.50621 1.57601 8.28619 1.33398 8.00016 1.33398C7.73614 1.33398 7.49411 1.55401 7.49411 1.84003V7.5166H1.83955C1.57552 7.5166 1.3335 7.73662 1.3335 8.02265C1.3335 8.28668 1.55352 8.5287 1.83955 8.5287H7.51611V14.1613C7.51611 14.4253 7.73614 14.6673 8.02216 14.6673C8.28619 14.6673 8.52822 14.4473 8.52822 14.1613V8.5067H14.1608C14.4248 8.5067 14.6668 8.28668 14.6668 8.00065C14.6668 7.73662 14.4248 7.5166 14.1608 7.5166Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"></path></svg>`;

/* ---------------------------------------------------------------- helpers */

// Where this script is served from, so the same file works under the dev
// mirror (/_bundle/bundle.js -> "") and on a project page
// (/smart-light/assets/bundle.js -> "/smart-light").
const BASE = (() => {
  const src = document.currentScript?.src
    || document.querySelector('script[src*="bundle.js"]')?.src
    || '';
  try {
    return new URL(src, location.href).pathname
      .replace(/\/(?:_bundle|assets)\/bundle\.js.*$/, '');
  } catch { return ''; }
})();

// Product shots are published as plain files, so the same URL works whether a
// Next image optimizer is in front of us or not.
const img = (src) => `${BASE}/assets/media/${src.split('/').pop()}`;

const egp = (n) => `EGP ${n.toLocaleString('en-US')}`;

// The site prints prices with the piastres in a smaller weight; match it.
const money = (n) =>
  `<span>${egp(Math.floor(n))}.</span><span class="font-medium text-sm no-underline">00</span>`;

const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

// Query form, not a fake route: the static host and Next's router both
// resolve this to the real homepage document.
const bundleHref = (b) => `${BASE}/?bundle=${b.slug}`;

// Run fn from a MutationObserver without the observer seeing fn's own writes
// and calling us straight back. Coalesces bursts into one frame.
function guard(fn) {
  let busy = false;
  let pending = false;
  const run = () => {
    // Mutations arriving mid-run are not dropped: they queue one trailing pass,
    // otherwise a final React render can land with nothing left to retrigger us.
    if (busy) { pending = true; return; }
    busy = true;
    requestAnimationFrame(() => {
      try { fn(); } finally {
        busy = false;
        if (pending) { pending = false; run(); }
      }
    });
  };
  return run;
}

/* ------------------------------------------------------------ builder state */

// A variant is an option per axis, in axis order: ['Warm', '16 W', 'E27'].
// Nothing in the builder defaults a variant -- you choose it. This exists only
// to give carts saved before variants a variant to land on.
const defaultVariant = (b) => b.axes.map((a) => a.options[0]);
const variantLabel = (v) => v.join(' \u00b7 ');
// Identity of a line, so the same product+variant merges instead of doubling.
const lineKey = (i, v) => `${i}|${v.join('|')}`;

function loadLines(b) {
  const valid = (l) => l
    && Number.isInteger(l.i) && l.i >= 0 && l.i < b.items.length
    && Array.isArray(l.v) && l.v.length === b.axes.length
    && l.v.every((opt, k) => b.axes[k].options.includes(opt))
    && Number.isInteger(l.n) && l.n > 0;

  try {
    const saved = JSON.parse(localStorage.getItem(linesKey(b)));
    if (Array.isArray(saved) && saved.every(valid)
      && saved.reduce((a, l) => a + l.n, 0) <= b.size) {
      return saved.map((l) => ({ i: l.i, v: l.v.slice(), n: l.n }));
    }
  } catch { /* first visit, or storage blocked */ }

  // Written before variants existed: one line per product, default variant.
  try {
    const old = JSON.parse(localStorage.getItem(qtyKey(b)));
    if (Array.isArray(old) && old.length === b.items.length
      && old.every((n) => Number.isInteger(n) && n >= 0)
      && old.reduce((a, c) => a + c, 0) <= b.size) {
      return old.flatMap((n, i) => (n > 0 ? [{ i, v: defaultVariant(b), n }] : []));
    }
  } catch { /* nothing to carry over */ }

  return [];
}

/* ------------------------------------------------------------------- cart */

// Bundles live in their own demo cart. Each added bundle counts as ONE product.
function readCart() {
  let v;
  try { v = JSON.parse(localStorage.getItem(CART_KEY)); } catch { return []; }
  if (!Array.isArray(v)) return [];

  // Repair lines written by older versions (no qty, no compareAt) and drop any
  // whose bundle no longer exists, so one stale entry can't break the drawer.
  return v.flatMap((l) => {
    const b = BUNDLES.find((x) => x.slug === l?.slug);
    if (!b) return [];
    return [{
      slug: b.slug,
      name: l.name || b.name,
      price: Number(l.price) || b.price,
      compareAt: Number(l.compareAt) || b.compareAt,
      img: l.img || b.items[0].img,
      mix: Array.isArray(l.mix) ? l.mix : [],
      qty: Number.isInteger(l.qty) && l.qty > 0 ? l.qty : 1,
    }];
  });
}

function writeCart(v) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(v)); } catch { /* ignore */ }
  syncBadges();
}

// Add the site's cart count and ours. The site's own count is whatever it
// rendered before we touched the badge, so stash it once.
// Every write here must be a no-op when nothing changed: we run from a
// MutationObserver, so a blind write would retrigger us forever.
function syncBadges() {
  const extra = readCart().reduce((a, l) => a + l.qty, 0);
  document.querySelectorAll('header span').forEach((s) => {
    if (!s.className.includes('B84C00') || s.children.length) return;
    if (s.dataset.slBase === undefined) s.dataset.slBase = s.textContent.trim() || '0';
    const next = String(Number(s.dataset.slBase) + extra);
    if (s.textContent !== next) s.textContent = next;
  });
}

function openSiteCart() {
  const badge = [...document.querySelectorAll('header span')]
    .find((s) => s.className.includes('B84C00') && !s.children.length);
  badge?.closest('button')?.click();
  // React mounts the drawer a tick or two after the click, and it re-renders a
  // few times while it settles — keep filling it in until our rows are in.
  let tries = 0;
  const timer = setInterval(() => {
    renderCartLines();
    if (document.querySelector('[data-sl-line]') || ++tries > 20) clearInterval(timer);
  }, 100);
}

// The cart drawer is the site's own React panel. We render our bundles as extra
// rows inside its real item list, using its own markup so they are
// indistinguishable from a normal product line.

const TRASH_PATH = 'M18.3377 3.3002H15.4502V2.66269C15.4502 1.5377 14.5502 0.637695 13.4252 0.637695H10.5377C9.4127 0.637695 8.5127 1.5377 8.5127 2.66269V3.3002H5.6252C4.5377 3.3002 3.6377 4.2002 3.6377 5.28769V6.41269C3.6377 7.2377 4.1252 7.91269 4.8377 8.21269L5.4377 21.1877C5.5127 22.4252 6.4877 23.3627 7.7252 23.3627H16.1627C17.4002 23.3627 18.4127 22.3877 18.4502 21.1877L19.1252 8.17519C19.8377 7.87519 20.3252 7.16269 20.3252 6.3752V5.2502C20.3252 4.2002 19.4252 3.3002 18.3377 3.3002ZM10.2377 2.66269C10.2377 2.4752 10.3877 2.3252 10.5752 2.3252H13.4627C13.6502 2.3252 13.8002 2.4752 13.8002 2.66269V3.3002H10.2752V2.66269H10.2377ZM5.3627 5.28769C5.3627 5.1377 5.4752 4.9877 5.6627 4.9877H18.3377C18.4877 4.9877 18.6377 5.1002 18.6377 5.28769V6.41269C18.6377 6.5627 18.5252 6.71269 18.3377 6.71269H5.6627C5.5127 6.71269 5.3627 6.60019 5.3627 6.41269V5.28769ZM16.2002 21.6752H7.8002C7.4627 21.6752 7.2002 21.4127 7.2002 21.1127L6.6002 8.40019H17.4377L16.8377 21.1127C16.8002 21.4127 16.5377 21.6752 16.2002 21.6752Z';

const CART_TRASH = `<span class="w-4 h-4 text-gray-40"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${TRASH_PATH}" fill="currentColor"></path></svg></span>`;

// The same glyph a step down, for a variant line whose count is at one.
const STEP_TRASH = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="${TRASH_PATH}" fill="currentColor"></path></svg>`;

const CART_MINUS = `<svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primaryBlue"><path d="M13.0001 1H1.00012" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"></path></svg>`;

const CART_PLUS = PLUS_SVG.replace('text-white', 'text-primaryBlue').replace('w-full h-full', 'w-4 h-4');

const CART_BTN = 'flex items-center justify-center w-4 h-4 xl:w-6 xl:w-6 hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed';

// The site's wishlist heart, reused verbatim so bundle cards match.
const HEART_PATH = 'M11 20.2812C10.5532 20.2812 10.1063 20.1094 9.76253 19.8C8.9719 19.1125 8.25003 18.4937 7.5969 17.9438C5.63753 16.2594 3.91877 14.85 2.71565 13.4062C1.30627 11.6875 0.618774 10.0719 0.618774 8.25C0.618774 6.49687 1.23752 4.84688 2.33752 3.64375C3.4719 2.40625 5.05315 1.71875 6.73753 1.71875C8.0094 1.71875 9.21253 2.13125 10.2438 2.92188C10.5188 3.12812 10.7594 3.33438 11 3.60938C11.2407 3.36875 11.4813 3.12812 11.7563 2.92188C12.7875 2.13125 13.9563 1.71875 15.2625 1.71875C16.9813 1.71875 18.5282 2.40625 19.6625 3.64375C20.7969 4.84688 21.3813 6.49687 21.3813 8.25C21.3813 10.0719 20.7282 11.6875 19.2844 13.4062C18.0813 14.85 16.3625 16.2937 14.4032 17.9438C13.75 18.4937 12.9938 19.1469 12.2032 19.8C11.8938 20.1094 11.4469 20.2812 11 20.2812ZM6.73753 3.26562C5.46565 3.26562 4.2969 3.78125 3.43752 4.675C2.61252 5.60313 2.16565 6.875 2.16565 8.25C2.16565 9.65938 2.71565 11 3.8844 12.4094C5.01877 13.75 6.66878 15.1594 8.5594 16.775C9.21253 17.325 9.96877 17.9781 10.7594 18.6656C10.8969 18.7687 11.1032 18.7687 11.2407 18.6656C12.0313 17.9781 12.7875 17.3594 13.4406 16.775C15.3657 15.125 17.0157 13.75 18.1157 12.4094C19.2844 11 19.8344 9.65938 19.8344 8.25C19.8344 6.875 19.3532 5.60312 18.5282 4.70937C17.6688 3.78125 16.5 3.26562 15.2625 3.26562C14.3344 3.26562 13.475 3.575 12.7188 4.125C12.4094 4.36562 12.1344 4.64062 11.8594 4.95C11.6532 5.19062 11.3438 5.3625 11 5.3625C10.6563 5.3625 10.3813 5.225 10.1407 4.95C9.86565 4.64062 9.59065 4.36562 9.28128 4.125C8.5594 3.575 7.70003 3.26562 6.73753 3.26562Z';

const FAV_KEY = 'sl_bundle_favs';

const readFavs = () => {
  try { const v = JSON.parse(localStorage.getItem(FAV_KEY)); return Array.isArray(v) ? v : []; }
  catch { return []; }
};

function toggleFav(slug, btn) {
  const favs = readFavs();
  const i = favs.indexOf(slug);
  if (i < 0) favs.push(slug); else favs.splice(i, 1);
  try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch { /* ignore */ }
  paintFav(btn, favs.includes(slug));
}

function paintFav(btn, on) {
  btn.querySelector('path').setAttribute('fill', on ? '#0072C8' : '#626A76');
  btn.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist');
  btn.setAttribute('aria-pressed', String(on));
}

function heartButton(slug) {
  const on = readFavs().includes(slug);
  return `
    <div class="flex justify-center items-center bg-gray-10 hover:bg-gray-20 rounded-full size-6 xs:size-7 md:size-10 transition-colors shrink-0">
      <div class="flex flex-col items-end gap-2">
        <button type="button" data-sl-fav="${slug}" aria-pressed="${on}"
                aria-label="${on ? 'Remove from wishlist' : 'Add to wishlist'}"
                class="grid h-9 w-9 place-items-center rounded-full ">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-[22px] md:w-[22px]">
            <path d="${HEART_PATH}" fill="${on ? '#0072C8' : '#626A76'}"></path>
          </svg>
        </button>
      </div>
    </div>`;
}

const cartTotal = () => readCart().reduce((a, l) => a + l.price * l.qty, 0);

// Spend this much on goods (delivery excluded) and delivery is free.
const FREE_SHIP = 1500;

function cartPanel() {
  const heading = [...document.querySelectorAll('span, h1, h2, h3, p')]
    .find((e) => !e.children.length && /^my cart$/i.test(e.textContent.trim()));
  if (heading) return heading.closest('.flex.h-fit') || heading.closest('[role="dialog"]');
  // Empty cart: the panel shows a message instead of a heading.
  const empty = [...document.querySelectorAll('div')]
    .find((e) => !e.children.length && /your cart is empty/i.test(e.textContent));
  return empty ? (empty.closest('.flex.h-fit') || empty.closest('[role="dialog"]')) : null;
}

// One bundle row in the site's own cart-line markup, plus one addition it has
// no equivalent for: the mix. Two bundles can hold the same products in
// different variants, so without it they would be two identical-looking rows.
function cartRow(line, i) {
  return `
  <li class="flex items-center justify-between  first:pt-0" data-sl-line="${i}">
    <div class="flex gap-2.5">
      <a class="relative block rounded-xl overflow-hidden border aspect-square h-16" href="/bundle/${line.slug}">
        <img alt="${line.name}" class="object-cover w-full h-full" src="${img(line.img)}">
      </a>
      <div class="flex flex-col gap-1">
        <a href="/bundle/${line.slug}"><h6 class="font-semibold text-primaryDark text-sm">${line.name}</h6></a>
        ${line.mix.length ? `<ul class="sl-cart-mix">${line.mix.map((m) => `
          <li>${m.qty} &times; ${m.name}${m.variant ? ` &mdash; ${m.variant}` : ''}</li>`).join('')}</ul>` : ''}
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-primaryBlue"><span class="whitespace-nowrap">${egp(line.price)}.00</span></span>
          <span class="text-xs font-semibold text-secondaryText line-through"><span class="whitespace-nowrap">${egp(line.compareAt)}.00</span></span>
        </div>
      </div>
    </div>
    <div class="flex flex-col items-end gap-2">
      <div class="flex flex-row items-center gap-3" role="group" aria-labelledby="quantity-label">
        <div class="flex items-center justify-between bg-white border-2 border-primaryBlue rounded-full h-8 md:h-[45px] gap-1.5 px-2 py-2 md:py-4">
          <button class="${CART_BTN}" type="button" data-sl-dec="${i}"
                  aria-label="${line.qty > 1 ? 'Decrease quantity' : 'Remove from cart'}">${line.qty > 1 ? CART_MINUS : CART_TRASH}</button>
          <span class="text-base font-semibold min-w-[32px] text-primaryBlue text-center" aria-label="Quantity: ${line.qty}">${line.qty}</span>
          <button class="${CART_BTN}" type="button" data-sl-inc="${i}" aria-label="Increase quantity">${CART_PLUS}</button>
        </div>
      </div>
    </div>
  </li>`;
}

// Fold our bundles into the drawer's Total. Re-reads React's own figure
// whenever it changes, so repeated runs never compound.
function syncTotal(panel) {
  const li = [...panel.querySelectorAll('li')]
    .find((n) => /^total$/i.test(n.firstElementChild?.textContent.trim() || ''));
  const span = li?.querySelector('.whitespace-nowrap');
  const ours = cartTotal();
  if (!span) return;

  const cur = span.textContent.trim();
  const isOurs = span.dataset.slOut === cur;
  if (!ours && !isOurs) return;

  const base = isOurs ? Number(span.dataset.slBase) : (parseFloat(cur.replace(/[^\d.]/g, '')) || 0);
  const out = `EGP ${(base + ours).toFixed(2)}`;
  if (cur === out) return;
  span.dataset.slBase = String(base);
  span.dataset.slOut = out;
  span.textContent = out;
}

// Read a money figure out of a labelled row in the drawer's totals list.
function totalsRow(panel, label) {
  const li = [...panel.querySelectorAll('li')]
    .find((n) => new RegExp(`^${label}$`, 'i').test(n.firstElementChild?.textContent.trim() || ''));
  return li?.querySelector('.whitespace-nowrap') || null;
}

/* "Add X more for free delivery" progress bar: caption above the bar, hidden
   on an empty basket, flipping to the earned line at the threshold. Reuses the
   builder's own .sl-bar, so it reads as part of the site. */
function renderFreeShip(panel) {
  // The site's own goods total is whatever React rendered before syncTotal
  // folded our bundles in — stash it there, so nothing is counted twice.
  const totalSpan = totalsRow(panel, 'total');
  const stashed = totalSpan && totalSpan.dataset.slBase;
  const siteTotal = stashed !== undefined && stashed !== ''
    ? Number(stashed)
    : parseFloat((totalSpan?.textContent || '').replace(/[^\d.]/g, '')) || 0;

  const shipSpan = totalsRow(panel, 'shipping fees');
  const shipping = parseFloat((shipSpan?.textContent || '').replace(/[^\d.]/g, '')) || 0;

  // Delivery is not part of what earns free delivery.
  const sub = Math.max(0, siteTotal - shipping) + cartTotal();
  const empty = sub <= 0;

  let box = panel.querySelector('[data-sl-freeship]');
  if (!box) {
    box = el(`<div data-sl-freeship class="sl-freeship">
      <p class="sl-freeship-msg" data-sl-freeship-msg></p>
      <div class="sl-bar">
        <div class="sl-bar-fill" data-sl-freeship-fill style="width:0%"></div>
      </div>
    </div>`);
    // Above the promo field, where the reference puts it.
    const promo = panel.querySelector('input[placeholder*="Promo" i], input[placeholder*="promo" i]');
    const anchor = promo?.closest('div')?.parentElement || panel.querySelector('ul.styled-scrollbar')?.parentElement;
    if (anchor) anchor.parentElement.insertBefore(box, anchor);
    else panel.appendChild(box);
  }

  if (box.hidden !== empty) box.hidden = empty;
  if (empty) return;

  const toFree = Math.max(0, FREE_SHIP - sub);
  const pct = Math.min(100, (sub / FREE_SHIP) * 100);

  const fill = box.querySelector('[data-sl-freeship-fill]');
  const width = `${pct}%`;
  if (fill.style.width !== width) fill.style.width = width;

  const msg = box.querySelector('[data-sl-freeship-msg]');
  const html = toFree > 0
    ? `Add <span class="sl-freeship-amt">${egp(toFree)}</span> for free delivery`
    : 'Free delivery unlocked';
  if (msg.innerHTML !== html) msg.innerHTML = html;
  msg.classList.toggle('is-done', toFree === 0);
}

function renderCartLines() {
  const panel = cartPanel();
  if (!panel) return;
  const cart = readCart();

  // Nothing of ours to show: clean up anything we left behind.
  if (!cart.length) {
    panel.querySelectorAll('[data-sl-line]').forEach((n) => n.remove());
    panel.querySelectorAll('[data-sl-list]').forEach((n) => n.remove());
    syncTotal(panel);
    renderFreeShip(panel);
    return;
  }

  // Use the drawer's own item list, or stand one up when the site cart is empty.
  let list = panel.querySelector('ul.styled-scrollbar');
  if (!list) {
    list = panel.querySelector('[data-sl-list]');
    if (!list) {
      list = el('<ul data-sl-list class="flex flex-col gap-2 overflow-y-auto max-h-[150px] styled-scrollbar px-4"></ul>');
      const empty = [...panel.querySelectorAll('div')]
        .find((n) => !n.children.length && /your cart is empty/i.test(n.textContent));
      const emptyBox = empty?.closest('div');
      const hide = (n) => { if (n && n.style.display !== 'none') n.style.display = 'none'; };
      hide(emptyBox);
      // The empty state also draws a big cart glyph above the message.
      const glyph = emptyBox?.previousElementSibling;
      if (glyph && !glyph.textContent.trim() && glyph.querySelector('svg')) hide(glyph);
      (emptyBox?.parentElement || panel).prepend(list);
    }
  }

  const sig = JSON.stringify(cart);
  if (list.dataset.slSig !== sig) {
    list.dataset.slSig = sig;
    list.querySelectorAll('[data-sl-line]').forEach((n) => n.remove());
    list.insertAdjacentHTML('beforeend', cart.map(cartRow).join(''));
  }

  if (!list.dataset.slBound) {
    list.dataset.slBound = '1';
    list.addEventListener('click', (e) => {
      const dec = e.target.closest('[data-sl-dec]');
      const inc = e.target.closest('[data-sl-inc]');
      if (!dec && !inc) return;
      e.preventDefault();
      e.stopPropagation();
      const next = readCart();
      const i = Number((dec || inc).dataset.slDec ?? (dec || inc).dataset.slInc);
      if (inc) next[i].qty += 1;
      else if (next[i].qty > 1) next[i].qty -= 1;
      else next.splice(i, 1);
      list.dataset.slSig = '';
      writeCart(next);
      renderCartLines();
    });
  }

  syncTotal(panel);
  renderFreeShip(panel);
}

/* ------------------------------------------------------- the product card */

// A card that looks exactly like a neighbouring product card, so a bundle
// reads as one product with one price.
function bundleCard(b) {
  const collage = b.items
    .map((it) => `<img src="${img(it.img)}" alt="${it.name}" loading="lazy">`)
    .join('');

  return el(`
    <div class="bg-white rounded-2xl lg:w-full overflow-hidden h-full flex flex-col" data-sl-bundle-card="${b.slug}">
      <a class="block group relative" href="${bundleHref(b)}">
        <div class="relative h-[220px] overflow-hidden">
          <div class="sl-card-collage group-hover:scale-105 transition-transform ease-in-out duration-700">
            ${collage}
          </div>
          <span class="absolute bottom-3 right-3 bg-navyBlue text-white text-xs font-semibold
                       rounded-full px-3 py-1">Pick any ${b.size}</span>
        </div>
      </a>
      <div class="flex flex-1 flex-col justify-between md:gap-6 gap-3 px-2 py-2 sm:px-3 sm:py-4">
        <div class="flex flex-col gap-4">
          <p class="font-normal text-primary-navy md:text-base text-sm line-clamp-2 leading-[130%]">
            <a class="hover:text-primaryBlue transition-colors line-clamp-1" href="${bundleHref(b)}">${b.name}</a>
          </p>
          <div class="flex flex-col md:flex-row md:items-end gap-1 md:gap-2 whitespace-nowrap">
            <span class="leading-[130%] text-xl font-semibold text-primaryBlue">${money(b.price)}</span>
            <span class="leading-[130%] text-sm md:text-base font-medium text-secondaryText">
              <span class="line-through">${egp(b.compareAt)}.</span><span class="font-medium text-[10px] md:text-xs no-underline">00</span>
            </span>
          </div>
        </div>
        <div class="flex justify-between items-center gap-1 md:gap-3 w-full mt-auto">
          <div class="w-full">
            <a href="${bundleHref(b)}" class="flex items-center justify-center xs:gap-2.5 gap-1 bg-primaryBlue hover:bg-primary-800
                      rounded-full transition-colors w-full max-w-[175px] h-[30px] xs:h-[38px] xl:h-[46px]
                      xl:px-[28px] xl:py-[12px] py-0.5 px-1 sm:px-4 sm:py-2">
              <span class="font-medium xl:text-base text-xs xs:text-sm text-white text-nowrap">Build Bundle</span>
            </a>
          </div>
          ${heartButton(b.slug)}
        </div>
      </div>
    </div>`);
}

// Drop the bundle cards in at the front of the "Featured Products" carousel.
function injectCards() {
  if (document.querySelector('[data-sl-bundle-card]')) return true;

  const heading = [...document.querySelectorAll('h1,h2,h3')]
    .find((h) => /featured products/i.test(h.textContent));
  const swiper = heading?.closest('section')?.querySelector('.swiper');
  const wrapper = swiper?.querySelector('.swiper-wrapper');
  // Wait for a real slide to copy sizing from: on a cold load the wrapper can
  // mount empty, and measuring nothing would throw.
  if (!wrapper?.querySelector('.swiper-slide')) return false;

  // Borrow the live slide width so the cards line up with their neighbours.
  const width = getComputedStyle(wrapper.querySelector('.swiper-slide')).width;
  [...BUNDLES].reverse().forEach((b) => {
    const slide = el('<div class="swiper-slide h-auto"></div>');
    slide.style.width = width;
    slide.appendChild(bundleCard(b));
    wrapper.prepend(slide);
  });
  swiper.swiper?.update();
  return true;
}

/* ----------------------------------------------------------- the builder */

/* --------------------------------------------------------- variant rows */

// One product's block. Collapsed until something is picked; once it is, the
// product's own line disappears and each variant gets a line of its own.
function rowMarkup(b, i, lines, picker, done) {
  const it = b.items[i];
  const mine = lines.filter((l) => l.i === i);
  const n = mine.reduce((a, l) => a + l.n, 0);
  const open = !!picker && picker.i === i;

  const head = `
    <div class="sl-row-head">
      <div class="sl-row-img"><img src="${img(it.img)}" alt="${it.name}" loading="lazy"></div>
      <div class="sl-row-info">
        <p class="sl-row-name">${it.name}</p>
        <p class="sl-row-meta">Sold separately at ${egp(it.unit)}</p>
      </div>
      ${n > 0 ? `<span class="sl-row-count">${n} in bundle</span>` : `
      <div class="sl-stepper" role="group" aria-label="Quantity of ${it.name}">
        <button type="button" class="sl-step" disabled aria-label="Remove one ${it.name}">&minus;</button>
        <output class="sl-qty" aria-live="polite">0</output>
        <button type="button" class="sl-step" data-act="picker" data-i="${i}" ${done || open ? 'disabled' : ''}
                aria-label="Choose a variant of ${it.name}">+</button>
      </div>`}
    </div>`;

  // Nothing picked and nothing being picked: the row stays a single line.
  if (n === 0 && !open) return `<div class="sl-row" data-row="${i}">${head}</div>`;

  const lineRows = mine.map((l) => {
    const key = lineKey(l.i, l.v);
    const label = variantLabel(l.v);
    // At one, the minus becomes the delete: there is no zero to sit at, so
    // the line goes. Same move the site's own cart drawer makes.
    const last = l.n < 2;
    return `
      <div class="sl-line" data-line="${key}">
        <p class="sl-line-name">${label}</p>
        <div class="sl-stepper" role="group" aria-label="Quantity of ${it.name}, ${label}">
          <button type="button" class="sl-step${last ? ' is-remove' : ''}" data-act="dec" data-key="${key}"
                  aria-label="${last ? `Remove ${label} from the bundle` : `Remove one ${label}`}">${last ? STEP_TRASH : '&minus;'}</button>
          <output class="sl-qty" aria-live="polite">${l.n}</output>
          <button type="button" class="sl-step" data-act="inc" data-key="${key}" ${done ? 'disabled' : ''}
                  aria-label="Add one ${label}">+</button>
        </div>
      </div>`;
  }).join('');

  // The picker takes the link's place rather than sitting beside it, so the
  // counter above it never leaves the screen.
  const tail = open
    ? pickerMarkup(b, i, picker.v, done)
    : `
      <button type="button" class="sl-add-variant" data-act="picker" data-i="${i}" ${done ? 'disabled' : ''}>
        <span class="sl-add-variant-icon" aria-hidden="true">+</span>Add another variant
      </button>`;

  return `
    <div class="sl-row${n > 0 ? ' is-picked' : ''}${open ? ' is-open' : ''}" data-row="${i}">
      ${head}
      <div class="sl-row-body">
        ${mine.length ? `<div class="sl-lines">${lineRows}</div>` : ''}
        ${tail}
      </div>
    </div>`;
}

// The same axes the product pages use, inline inside the row. Nothing is
// chosen up front -- picking the variant IS the act of adding one, so there
// is no default to accept by accident.
function pickerMarkup(b, i, draft, done) {
  const ready = draft.every((o) => o !== null);

  const axes = b.axes.map((a, k) => `
    <div class="sl-axis">
      <p class="sl-axis-name">${a.name}</p>
      <div class="sl-chips">
        ${a.options.map((o) => `
          <button type="button" class="sl-chip${draft[k] === o ? ' is-on' : ''}"
                  data-act="chip" data-axis="${k}" data-opt="${o}"
                  aria-pressed="${draft[k] === o}">${o}</button>`).join('')}
      </div>
    </div>`).join('');

  return `
    <div class="sl-picker" role="group" aria-label="Choose a variant of ${b.items[i].name}">
      ${axes}
      <div class="sl-picker-actions">
        <button type="button" class="sl-picker-add" data-act="commit" ${done || !ready ? 'disabled' : ''}>Add to bundle</button>
        <button type="button" class="sl-link" data-act="cancel">Cancel</button>
      </div>
      ${ready ? '' : '<p class="sl-picker-hint">Choose an option in each row to add it.</p>'}
    </div>`;
}

function builderMarkup(b) {
  // Gallery: one frame per product in the bundle, using the same stage and
  // thumbnail pill the real product pages use.
  const thumbs = b.items.map((it, i) => `
    <button type="button" class="sl-thumb${i === 0 ? ' is-active' : ''}" data-thumb="${i}"
            role="tab" aria-selected="${i === 0}" aria-label="Show ${it.name}">
      <img src="${img(it.img)}" alt="" loading="lazy">
    </button>`).join('');

  return `
  <section class="sl-bundle-page" data-bundle="${b.slug}">
    <div class="container-custom">
      <nav class="sl-crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a><span>/</span><span aria-current="page">${b.name}</span>
      </nav>

      <div class="sl-grid">
        <div class="sl-hero">
          <div class="sl-stage">
            <img data-stage src="${img(b.items[0].img)}" alt="${b.items[0].name}">
          </div>
          <span class="sl-hero-badge">Bundle of ${b.size}</span>
          <div class="sl-thumbs" role="tablist" aria-label="${b.name} gallery">${thumbs}</div>
        </div>

        <div class="sl-panel">
          <h1 class="sl-title">${b.name}</h1>
          <p class="sl-sub">${b.tagline}. Mix the four products below any way you like — the price stays the same.</p>

          <div class="sl-price">
            <span class="sl-price-now">${egp(b.price)}</span>
            <span class="sl-price-was">${egp(b.compareAt)}</span>
          </div>

          <div class="sl-progress">
            <div class="sl-progress-head">
              <span class="sl-count"><strong data-total>0</strong> of ${b.size} selected</span>
              <span class="sl-left" data-left>${b.size} left to pick</span>
            </div>
            <div class="sl-bar"><div class="sl-bar-fill" data-fill style="width:0%"></div></div>
          </div>

          <div class="sl-rows" data-rows></div>

          <div class="sl-quick">
            <button type="button" class="sl-link" data-act="clear">Clear all</button>
          </div>

          <div class="sl-cta">
            <button type="button" class="sl-add" data-act="add" disabled>
              <span class="sl-add-icon" data-icon hidden>${PLUS_SVG}</span>
              <span data-label>Pick ${b.size} products to continue</span>
            </button>
            <p class="sl-note">Free delivery · 4-year warranty on every product in the bundle</p>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function mountBuilder(b) {
  if (document.querySelector('.sl-bundle-page')) return;
  const main = document.querySelector('main');
  if (!main) return;

  document.documentElement.classList.add('sl-bundle-active');
  const root = el(builderMarkup(b));
  main.after(root);
  document.title = `${b.name} - Smart Light`;

  // One entry per product+variant: { i: item index, v: variant, n: units }.
  let lines = loadLines(b);
  // Which row has its variant picker open, and the draft variant inside it.
  let picker = null;

  const total = () => lines.reduce((a, l) => a + l.n, 0);
  const remaining = () => b.size - total();
  const complete = () => remaining() === 0;
  const findLine = (key) => lines.find((l) => lineKey(l.i, l.v) === key);

  // Adding a variant already in the bundle bumps that line instead of
  // opening a second, identical one.
  function addLine(i, v) {
    if (complete()) return;
    const found = findLine(lineKey(i, v));
    if (found) { found.n += 1; return; }
    lines.push({ i, v: v.slice(), n: 1 });
    lines.sort((a, c) => a.i - c.i);
  }

  function save() {
    try {
      localStorage.setItem(linesKey(b), JSON.stringify(lines));
      // Its job is done; leaving it would shadow nothing but confuse.
      localStorage.removeItem(qtyKey(b));
    } catch { /* storage blocked */ }
  }

  function paint() {
    const t = total();
    const done = complete();

    root.querySelector('[data-total]').textContent = t;
    root.querySelector('[data-fill]').style.width = `${(t / b.size) * 100}%`;

    const left = root.querySelector('[data-left]');
    left.textContent = done ? 'Bundle complete' : `${remaining()} left to pick`;
    left.classList.toggle('is-done', done);

    // Rows change shape as lines come and go, so they are redrawn rather than
    // patched. The whole mechanic is still one rule: `done` disables every +.
    root.querySelector('[data-rows]').innerHTML =
      b.items.map((it, i) => rowMarkup(b, i, lines, picker, done)).join('');

    const add = root.querySelector('[data-act="add"]');
    add.disabled = !done;
    add.querySelector('[data-icon]').hidden = !done;
    add.querySelector('[data-label]').textContent = done
      ? `Add bundle to cart — ${egp(b.price)}`
      : `Add ${remaining()} more to continue`;
  }

  function showGallery(i) {
    const stage = root.querySelector('[data-stage]');
    stage.src = img(b.items[i].img);
    stage.alt = b.items[i].name;
    root.querySelectorAll('[data-thumb]').forEach((t) => {
      const on = Number(t.dataset.thumb) === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
  }

  // One bundle = one line in the cart, priced at the bundle's fixed price and
  // counted like any other product. Re-adding the same mix bumps its quantity.
  // The mix now names the variant too, so two bundles of the same products in
  // different variants are two lines, not one -- and read as two in the drawer.
  function addToCart() {
    const mix = lines.map((l) => ({
      name: b.items[l.i].name,
      variant: variantLabel(l.v),
      qty: l.n,
    }));

    const cart = readCart();
    const same = cart.find((l) => l.slug === b.slug && JSON.stringify(l.mix) === JSON.stringify(mix));
    if (same) {
      same.qty += 1;
    } else {
      cart.push({
        slug: b.slug,
        name: b.name,
        price: b.price,
        compareAt: b.compareAt,
        img: b.items[lines[0].i].img,
        mix,
        qty: 1,
      });
    }
    writeCart(cart);
    openSiteCart();
    renderCartLines();
  }

  root.addEventListener('click', (e) => {
    const thumb = e.target.closest('[data-thumb]');
    if (thumb) return showGallery(Number(thumb.dataset.thumb));

    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const i = Number(btn.dataset.i);
    const line = findLine(btn.dataset.key);

    switch (btn.dataset.act) {
      case 'inc': if (line && !complete()) line.n += 1; break;
      case 'dec':
        if (!line) break;
        // One is the floor, not zero: below it the line has no reason to exist,
        // so the button has turned into a delete and takes the whole line.
        if (line.n > 1) line.n -= 1;
        else lines = lines.filter((l) => lineKey(l.i, l.v) !== btn.dataset.key);
        break;
      // Nothing preselected: an axis stays empty until it is chosen.
      case 'picker': picker = { i, v: b.axes.map(() => null) }; break;
      case 'chip': if (picker) picker.v[Number(btn.dataset.axis)] = btn.dataset.opt; break;
      case 'commit':
        if (picker && picker.v.every((o) => o !== null)) { addLine(picker.i, picker.v); picker = null; }
        break;
      case 'cancel': picker = null; break;
      case 'clear': lines = []; picker = null; break;
      case 'add': return addToCart();
      default: return;
    }
    save();
    paint();
  });

  paint();
}

/* ------------------------------------------------------------------ boot */

// A bundle opens on the homepage document with ?bundle=<slug>. Next's router
// only ever sees a route it knows, so it hydrates the page normally instead of
// falling through to its not-found boundary and tearing the shell down.
const ENTRY = (location.pathname.startsWith(BASE) ? location.pathname.slice(BASE.length) : location.pathname)
  .replace(/\/+$/, '') || '/';
const CURRENT = BUNDLES.find((b) => {
  const slug = new URLSearchParams(location.search).get('bundle');
  return slug ? b.slug === slug
    : ENTRY === `/bundle/${b.slug}` || ENTRY === `/ar/bundle/${b.slug}`;
});

function boot() {
  if (CURRENT) {
    // Hydration reconciles our node away and drops our query, so keep restoring
    // both until Next has settled.
    const here = bundleHref(CURRENT);
    const hold = () => {
      document.documentElement.classList.add('sl-bundle-active');
      if (location.pathname + location.search !== here) {
        history.replaceState(history.state, '', here);
      }
      mountBuilder(CURRENT);
      syncBadges();
      renderCartLines();
    };
    hold();
    const until = Date.now() + 8000;
    const timer = setInterval(() => { hold(); if (Date.now() > until) clearInterval(timer); }, 150);
    new MutationObserver(guard(hold)).observe(document.body, { childList: true, subtree: true });
    return;
  }

  document.documentElement.classList.remove('sl-bundle-active');

  const onHome = ENTRY === '/' || ENTRY === '/ar';
  // Everywhere else: keep the cart badge honest, fill the drawer when opened,
  // and keep the bundle cards in the carousel. All three are idempotent, so the
  // observer settles as soon as the page does.
  const sync = () => {
    // Each step is independent: a failure in one must not stop the others, and
    // must never stop the heartbeat.
    try { syncBadges(); } catch (e) { /* keep going */ }
    try { renderCartLines(); } catch (e) { /* keep going */ }
    if (onHome) { try { injectCards(); } catch (e) { /* keep going */ } }
  };
  sync();
  new MutationObserver(guard(sync)).observe(document.body, { childList: true, subtree: true });

  // A slow heartbeat as well as the observer: on a cold load the carousel can
  // mount later than any mutation we happen to be watching, and a re-render can
  // drop our cards long after hydration looked finished.
  setInterval(sync, 1000);

  // Wishlist hearts on the bundle cards.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-sl-fav]');
    if (!btn) return;
    e.preventDefault();
    toggleFav(btn.dataset.slFav, btn);
  });

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
