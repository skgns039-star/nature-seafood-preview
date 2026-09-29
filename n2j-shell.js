/* N2J SITE-SHELL v1.1 (2026-09-29) — domain-independent links for the GitHub Pages preview and any later domain.
 * User: "도메인 추후 바꿀 거고 깃허브에 배포된 거에 적용토록 하고 추후 도메인 바꿔도 적용되도록 해".
 * Adds nothing visible: the site's own links stay relative (shop.html …); this block only
 *  1) /link-guard: a link written with an old own address (*.github.io preview, *.imweb.me) opens the same page on the
 *     domain the visitor is on now (external sites — Kakao, Naver, FTC … — are never touched),
 *  2) iMweb official paths (/?mode=login|join, /shop_cart, /shop_mypage) land on the matching preview page,
 *  3) cta_hide_on_paths: the floating CTA (.ns-floating) is hidden on the cart and my-page only.
 * The site base is taken from this script's own URL, so it works at a sub-path (/nature-seafood-preview/) or a root domain. */
(() => {
  'use strict';
  if (window.__n2jShell) return;   // duplicate-run guard
  window.__n2jShell = true;
  const base = new URL('.', document.currentScript.src);
  // on iMweb (imweb-map.js, not preview) the pages are iMweb paths: map through NATURE_IMWEB.route, never *.html here
  const IM = window.NATURE_IMWEB && !window.NATURE_IMWEB.preview ? window.NATURE_IMWEB : null;
  const OLD_OWN = /(^|\.)github\.io$|(^|\.)imweb\.me$/i;                         // previous own hosts
  const OFFICIAL = { shop_cart: 'cart.html', shop_mypage: 'mypage.html' };       // iMweb path → preview page
  const MODE = { login: 'login.html', join: 'login.html' };                     // /?mode=… (no separate join page in the preview)
  const CTA_HIDE = ['cart.html', 'mypage.html'];

  const page = u => {                                                           // same page on the current site, or null
    if (IM) { const seg = u.pathname.split('/').filter(Boolean), last = seg[seg.length - 1] || '', r = IM.route(last + u.search + u.hash); return r !== last + u.search + u.hash ? new URL(r, location.origin) : (OFFICIAL[last] || u.searchParams.get('mode') ? new URL(u.pathname + u.search, location.origin) : null); }
    const mode = u.searchParams.get('mode');
    if (mode && MODE[mode]) return new URL(MODE[mode], base);
    const seg = u.pathname.split('/').filter(Boolean), last = seg[seg.length - 1] || '';
    if (OFFICIAL[last]) return new URL(OFFICIAL[last], base);
    if (!last || /\.html$/.test(last)) return new URL((last || 'index.html') + u.search + u.hash, base);
    return null;
  };
  const own = u => u.host !== location.host && OLD_OWN.test(u.hostname);

  // 2) arrived on an iMweb-style address of this site → the matching page
  const here = new URL(location.href);
  if (!IM && here.searchParams.get('mode') && MODE[here.searchParams.get('mode')]) { location.replace(page(here)); return; }

  // 1) link guard — rewrite once, and again at click time for links other scripts fill in later (config.js NATURE_LINKS)
  const fix = a => {
    let u; try { u = new URL(a.getAttribute('href'), location.href); } catch { return; }
    if (!own(u) && !(u.host === location.host && (u.searchParams.get('mode') in MODE || OFFICIAL[u.pathname.split('/').filter(Boolean).pop()]))) return;
    const to = page(u); if (to) a.setAttribute('href', to.href);
  };
  document.head.insertAdjacentHTML('beforeend', '<style id="n2j-shell-style">.n2j-shell-cta-off .ns-floating{display:none}</style>');
  const run = () => {
    document.querySelectorAll('a[href]').forEach(fix);
    // 3) CTA hidden only on the listed pages
    const file = location.pathname.split('/').pop() || 'index.html';
    document.documentElement.classList.toggle('n2j-shell-cta-off', CTA_HIDE.includes(file) || (IM && /^\/(shop_cart|shop_mypage)\b/.test(location.pathname)));
  };
  document.addEventListener('click', e => { const a = e.target.closest?.('a[href]'); if (a) fix(a); }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true }); else run();
})();
