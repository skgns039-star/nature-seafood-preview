/* 전체상품: the previous home packing film (scroll → ice pours into the box) — film.js/motion.js drive it unchanged.
 * Only the slow inertial scroll it was tuned with is added here (Lenis, same settings as the old home hero-type.js). */
addEventListener('DOMContentLoaded', () => {
  if (window.Lenis && !window.__nsLenis && !matchMedia('(prefers-reduced-motion: reduce)').matches && !navigator.connection?.saveData)
    window.__nsLenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.85, smoothWheel: true, autoRaf: true });
});
