/* N2J iMweb loader (2026-09-29) — user: "아임웹 최적화 코드로, 타이포·CTA·그리드 사이즈·애니메이션 모션 다 틀어지지 않게,
 *작아지지 않게 본질 모습 그대로". Loaded once from the iMweb site head code. It
 *  1) makes every code widget wrapper (.n2j-ns) span the full screen width, whatever section padding/max-width iMweb adds,
 *  2) frees the wrappers' iMweb ancestors from overflow:hidden / transform, which would stop the sticky scroll film
 *     and the fixed header/CTA,
 *  3) loads the site scripts only after the widget markup exists (iMweb can inject code widgets late — skill C3:
 *     DOMContentLoaded / load / retry / MutationObserver, run-once guard), common scripts first, then each page's own
 *     (data-n2j-js on the page wrapper), in order.
 * Styles come from n2j-imweb.css (all rules scoped to .n2j-ns, so iMweb's theme CSS cannot shrink or restyle them).
 * No JS → the markup stays visible as-is (skill C4). */
(() => {
  'use strict';
  if (window.__n2jImweb) return;
  window.__n2jImweb = true;
  const BASE = new URL('.', document.currentScript.src).href;
  const COMMON = ['config.js', 'imweb-map.js', 'products.js', 'app.js', 'vendor/anime.umd.min.js', 'interactions.js', 'n2j-shell.js'];
  const wraps = () => [...document.querySelectorAll('.n2j-ns')];

  const freed = new WeakSet();
  function free(w) {                      // ancestors between the widget and <body>
    for (let e = w.parentElement; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
      if (freed.has(e)) continue;
      freed.add(e);
      const s = getComputedStyle(e);
      if (/hidden|auto|scroll|clip/.test(s.overflowX + s.overflowY)) e.style.setProperty('overflow', 'visible', 'important');
      if (s.transform !== 'none') e.style.setProperty('transform', 'none', 'important');
      if (s.filter !== 'none') e.style.setProperty('filter', 'none', 'important');
      if (s.contain !== 'none' && s.contain !== 'normal') e.style.setProperty('contain', 'none', 'important');
    }
  }
  function bleed() {                      // full-width wrappers, measured (100vw would add the scrollbar width)
    const vw = document.documentElement.clientWidth;
    wraps().forEach(w => {
      free(w);
      w.style.setProperty('width', vw + 'px', 'important');
      w.style.setProperty('max-width', 'none', 'important');
      w.style.setProperty('margin-left', '0px', 'important');
      const left = w.getBoundingClientRect().left + scrollX;
      w.style.setProperty('margin-left', -left + 'px', 'important');
    });
  }

  const loaded = new Set();
  function load(list) {                   // parallel download, in-order execution
    const todo = list.filter(s => s && !loaded.has(s));
    todo.forEach(s => loaded.add(s));
    return Promise.all(todo.map(src => new Promise(done => {
      const el = document.createElement('script');
      el.src = BASE + src; el.async = false; el.dataset.n2jSrc = src;
      el.onload = el.onerror = done;
      document.head.appendChild(el);
    })));
  }

  let started = false, t0 = Date.now();
  function ready() {                      // footer (dialog, CTA) present and the page widget present — or give up waiting after 4 s
    const footer = document.querySelector('.n2j-ns[data-n2j="footer"]');
    const page = document.querySelector('.n2j-ns[data-n2j="page"]');
    return footer && (page || Date.now() - t0 > 4000);
  }
  function start() {
    if (!document.body) return;
    bleed();
    if (started || !ready()) return;
    started = true;
    const pageJs = wraps().flatMap(w => (w.dataset.n2jJs || '').split(',').map(s => s.trim()).filter(Boolean));
    load([...COMMON, ...pageJs]).then(bleed);
  }
  document.addEventListener('DOMContentLoaded', start);
  addEventListener('load', () => { t0 = Math.min(t0, Date.now()); start(); });
  let q = 0; const soon = () => { if (!q) q = requestAnimationFrame(() => { q = 0; bleed(); }); };   // one measure per frame
  addEventListener('resize', soon);
  const timer = setInterval(() => { start(); if (started) clearInterval(timer); }, 250);
  new MutationObserver(() => { if (!started) start(); else soon(); }).observe(document.documentElement, { childList: true, subtree: true });
  start();
})();
