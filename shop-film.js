/* 전체상품: the previous home packing film (scroll → ice pours into the box) — film.js/motion.js drive it unchanged.
 * Light inertial scroll (Lenis); 2026-09-28 b: quicker than the old home setting (lerp .075 → .12) so the ice drops sooner.
 * 2026-09-29: also starts when loaded after the page (iMweb loader n2j-imweb.js injects scripts late). */
(() => {
  const start = () => {
    if (window.Lenis && !window.__nsLenis && !navigator.connection?.saveData)
      window.__nsLenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true, autoRaf: true });
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
