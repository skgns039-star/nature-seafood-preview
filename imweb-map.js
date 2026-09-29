/* 아임웹 매핑 (2026-09-29) — user: "지금 깃허브에 등록된 웹사이트 코드를 아임웹이랑 연동되게, 아임웹 매핑 코드는 코드에 미리 연결해 둬".
 * One place for everything iMweb needs. On the GitHub preview / local server it changes nothing (pages stay *.html).
 * On any other domain (the iMweb site, before or after the new domain is connected) it
 *   - fills NATURE_LINKS with the iMweb pages below (current domain, so a domain change needs no edit),
 *   - turns the site's own links (shop.html …) into those iMweb paths, product cards into NATURE_PRODUCT_URLS,
 *   - loads videos/images from the GitHub preview (assetBase) — iMweb code widgets cannot hold them.
 * Page paths (create the iMweb pages with exactly these URLs): see imweb/README.md. Official iMweb paths are fixed. */
(() => {
  'use strict';
  const M = window.NATURE_IMWEB = window.NATURE_IMWEB || {};
  M.assetBase = M.assetBase || 'https://skgns039-star.github.io/nature-seafood-preview/';
  M.routes = Object.assign({
    index: '/', shop: '/shop', bakdae: '/bakdae', dried: '/dried', popular: '/popular', new: '/new',
    support: '/support', qna: '/qna', contact: '/contact', notice: '/notice', directions: '/directions',
    terms: '/terms', privacy: '/privacy',
    cart: '/shop_cart', mypage: '/shop_mypage', login: '/?mode=login', join: '/?mode=join'   // iMweb official paths
  }, M.routes);
  M.preview = /(^|\.)github\.io$|^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.protocol === 'file:';
  const own = /^(?![a-z]+:|\/\/|#|data:)/i;
  M.asset = p => (M.preview || !own.test(p) || p.startsWith('/')) ? p : M.assetBase + p.replace(/^\.\//, '');
  // 'shop.html#x' → '/shop#x', 'product.html?id=2' → NATURE_PRODUCT_URLS[2] or the shop page; anything else unchanged
  M.route = href => {
    const m = /^(?:\.\/)?([a-z]+)\.html(\?[^#]*)?(#.*)?$/i.exec(href || '');
    if (!m) return href;
    if (m[1] === 'product') {
      const id = new URLSearchParams(m[2] || '').get('id'), url = (window.NATURE_PRODUCT_URLS || {})[id];
      return url || M.routes.shop;
    }
    return M.routes[m[1]] != null ? M.routes[m[1]] + (m[3] || '') : href;
  };
  // iMweb native widget for a code widget: NATURE_WIDGET_IDS[type] first, else the nearest one above the code widget
  const NATIVE = { shop: '[class*="shop"],[class*="prod"]', notice: '[class*="board"],[class*="bbs"]', inquiry: 'form', detail: '[class*="shop_view"],[class*="prod_detail"]' };
  M.widget = (type, from) => {
    const id = (window.NATURE_WIDGET_IDS || {})[type];
    if (id) return document.getElementById(id);
    for (let el = from?.closest('[id^="w"]') || from; el; el = el.previousElementSibling || el.parentElement?.previousElementSibling) {
      if (el.id && /^w\d/.test(el.id) && el.querySelector(NATIVE[type] || '*')) return el;
    }
    return null;
  };
  // values typed into the iMweb head code (01_공통_head코드.html → window.NATURE_IMWEB_SET) win over the GitHub copy
  const SET = window.NATURE_IMWEB_SET || {};
  Object.assign(M.routes, SET.routes || {});
  window.NATURE_WIDGET_IDS = Object.assign(window.NATURE_WIDGET_IDS || {}, Object.fromEntries(Object.entries(SET.widgetIds || {}).filter(([, v]) => v)));
  window.NATURE_PRODUCT_URLS = Object.assign(window.NATURE_PRODUCT_URLS || {}, SET.productUrls || {});
  if (M.preview) return;

  // ---- iMweb from here on ----
  const L = window.NATURE_LINKS = window.NATURE_LINKS || {};
  const keyOf = { home: 'index' };
  ['home', 'shop', 'bakdae', 'dried', 'popular', 'new', 'support', 'inquiry', 'contact', 'notice', 'cart', 'login', 'mypage', 'privacy', 'terms']
    .forEach(k => { const r = M.routes[keyOf[k] || (k === 'inquiry' ? 'qna' : k)]; if (!L[k] && r != null) L[k] = new URL(r, location.origin).href; });
  const fix = root => {
    root.querySelectorAll('a[href]').forEach(a => { const h = a.getAttribute('href'), r = M.route(h); if (r !== h) a.setAttribute('href', r); });
    root.querySelectorAll('[src],[poster],[data-src],[data-src-small]').forEach(e => ['src', 'poster', 'data-src', 'data-src-small'].forEach(n => {
      const v = e.getAttribute(n); if (v && own.test(v) && !v.startsWith('/')) e.setAttribute(n, M.asset(v));
    }));
  };
  document.addEventListener('click', e => { const a = e.target.closest?.('a[href]'); if (a) { const h = a.getAttribute('href'), r = M.route(h); if (r !== h) a.setAttribute('href', r); } }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => fix(document), { once: true }); else fix(document);
})();
