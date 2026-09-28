/* 전체상품: the previous home packing film (scroll → ice pours into the box) — film.js/motion.js drive it unchanged.
 * Light inertial scroll (Lenis); 2026-09-28 b: quicker than the old home setting (lerp .075 → .12) so the ice drops sooner. */
addEventListener('DOMContentLoaded', () => {
  if (window.Lenis && !window.__nsLenis && !navigator.connection?.saveData)
    window.__nsLenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true, autoRaf: true });
});
