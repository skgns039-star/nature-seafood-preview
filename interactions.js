/* Site-wide typography reveal + hover interactions.
 * Library: anime.js 4.5.0 (juliangarnier/anime, ★73k, MIT) — see library/design-patterns/OSS_MOTION_CATALOG.md.
 * Hover.css (★29k) was not used: its free licence excludes commercial client sites.
 * Everything here is decorative: with no script, reduced motion or no hover pointer the page stays static. */
(() => {
  'use strict';
  function init() {
    const A = window.anime;
    if (!A?.splitText || !A?.animate) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { splitText, animate, stagger, onScroll, createAnimatable, utils } = A;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

    // 1) Headings rise out of a line mask character by character, blur clearing, when they scroll into view.
    const headings = document.querySelectorAll('.ns-section-heading h2, .ns-page-heading h1, .ns-support-heading h2, .ns-contact-intro h2, .ns-inquiry h2, .ns-footer-col h2');
    headings.forEach(el => {
      // Hero titles (sub-page caption, shop film) animate in CSS from the first paint — X3 2026-10-02, same on iMweb.
      if (el.closest('.ns-hero-v4, .ns-banner-caption, .ns-shop-film-copy') || el.dataset.nsType) return;
      el.dataset.nsType = '1';
      splitText(el, { lines: { wrap: 'clip' }, chars: { class: 'ns-type-char' }, accessible: true }).addEffect(self => {
        utils.set(self.chars, { y: '110%', opacity: 0, filter: 'blur(6px)' });
        return animate(self.chars, {
          y: ['110%', '0%'], opacity: [0, 1], filter: ['blur(6px)', 'blur(0px)'],
          duration: 1100, ease: 'outExpo', delay: stagger(28),
          autoplay: onScroll({ target: el, enter: 'bottom-=40 top', repeat: false })
        });
      });
    });

    // Sub-page banners: the photo settles in from a slow zoom, then drifts with scroll (parallax, smoothed by onScroll sync).
    document.querySelectorAll('.ns-page-banner .ns-banner-media img').forEach(img => {
      if (img.dataset.nsBanner) return;
      img.dataset.nsBanner = '1';
      const banner = img.closest('.ns-page-banner');
      animate(img, { scale: [1.1, 1], opacity: [0.2, 1], duration: 2200, ease: 'outExpo' });  // settles at 1: the banner edits must show the whole original (ENG-021)
      animate(img, { translateY: ['0%', '12%'], ease: 'linear', autoplay: onScroll({ target: banner, enter: 'top top', leave: 'bottom top', sync: 0.25 }) });
    });

    // Directions page map: the frame rises from its bottom edge, then the location ring pulses.
    document.querySelectorAll('.ns-directions .ns-footer-map-frame').forEach(frame => {
      if (frame.dataset.nsMap) return;
      frame.dataset.nsMap = '1';
      const ring = frame.querySelector('.ns-map-pin span');
      animate(frame.closest('.ns-footer-map').querySelectorAll('.ns-footer-map-info > *'), { y: [12, 0], opacity: [0, 1], duration: 700, ease: 'outCubic', delay: stagger(70, { start: 150 }) });
      animate(frame, {
        clipPath: ['inset(100% 0% 0% 0% round 20px)', 'inset(0% 0% 0% 0% round 20px)'], scale: [1.04, 1], duration: 1300, ease: 'outExpo', delay: 200,
        onComplete: () => ring && animate(ring, { scale: [0.3, 1.8], opacity: [0.9, 0], duration: 1800, ease: 'outCubic', loop: 3 })
      });
    });

    // Accordion: when a panel opens its answer lines slide in one after another.
    document.querySelectorAll('.ns-faq details').forEach(d => {
      if (d.dataset.nsAcc) return;
      d.dataset.nsAcc = '1';
      d.addEventListener('toggle', () => {
        if (!d.open) return;
        const parts = d.querySelectorAll('.ns-faq-a > *');
        if (parts.length) animate(parts, { y: [-8, 0], opacity: [0, 1], duration: 520, ease: 'outCubic', delay: stagger(60) });
      });
    });

    // Mobile hamburger: the rounded card drops in with a soft overshoot, then its pills follow one by one.
    document.querySelectorAll('.ns-burger').forEach(d => {
      if (d.dataset.nsBurger) return;
      d.dataset.nsBurger = '1';
      d.addEventListener('toggle', () => {
        if (!d.open) return;
        const panel = d.querySelector('.ns-burger-panel');
        animate(panel, { y: [-14, 0], scale: [0.96, 1], opacity: [0, 1], duration: 520, ease: 'outBack(1.4)' });
        animate(panel.querySelectorAll('.ns-burger-group > *, .ns-burger-member a'), { y: [10, 0], opacity: [0, 1], duration: 420, ease: 'outCubic', delay: stagger(22, { start: 80 }) });
      });
    });

    if (!fine) return;

    // 2a) Header menu: a light-blue pill glides behind whichever item the pointer is on. Labels themselves never move.
    document.querySelectorAll('.ns-main-nav').forEach(nav => {
      if (nav.dataset.nsPill) return;
      nav.dataset.nsPill = '1';
      nav.classList.add('ns-has-pill');
      const pill = document.createElement('span');
      pill.className = 'ns-nav-pill'; pill.setAttribute('aria-hidden', 'true');
      nav.prepend(pill);
      utils.set(pill, { x: 0, width: 0, opacity: 0 });
      const glide = createAnimatable(pill, { x: 420, width: 420, opacity: 260, ease: 'outExpo' });
      const items = nav.querySelectorAll(':scope > a, :scope > .ns-menu > summary');
      const place = el => { const n = nav.getBoundingClientRect(), r = el.getBoundingClientRect(); glide.x(r.left - n.left); glide.width(r.width); glide.opacity(1); };
      items.forEach(el => el.addEventListener('pointerenter', () => place(el)));
      nav.addEventListener('pointerleave', () => { const open = nav.querySelector('.ns-menu[open] > summary'); open ? place(open) : glide.opacity(0); });
    });

    // 2b) Dropdown items, footer links, sub-tabs, text links: an underline draws in from the left on hover.
    document.querySelectorAll('.ns-menu-panel a, .ns-footer-links a, .ns-subtabs a:not([aria-current]), .ns-text-link').forEach(link => {
      if (link.dataset.nsLine) return;
      link.dataset.nsLine = '1';
      link.classList.add('ns-has-line');
      const line = document.createElement('span');
      line.className = 'ns-hover-line'; line.setAttribute('aria-hidden', 'true');
      link.append(line);
      utils.set(line, { scaleX: 0 }); // createAnimatable would otherwise start from the default scale 1 (line fully drawn)
      const draw = createAnimatable(line, { scaleX: 380, ease: 'outExpo' });
      link.addEventListener('pointerenter', () => { line.style.transformOrigin = 'left center'; draw.scaleX(1); });
      link.addEventListener('pointerleave', () => { line.style.transformOrigin = 'right center'; draw.scaleX(0); });
    });

    // (Hallmark gate 13: one hover effect per element — the magnetic pull and the photo zoom were removed;
    //  buttons keep their colour change, product cards keep the sliding label bar.)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
  // Product grids are rendered by app.js; pick up late cards too.
  window.addEventListener('load', init, { once: true });
  window.NatureInteractions = { init };
})();
