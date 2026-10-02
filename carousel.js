/* Home "인기상품" on phones/tablets: two cards per view, flowing continuously (touch to drag, lifts to resume).
 * Library: Swiper 14.2.0 (nolimits4web/swiper, ★41.9k, MIT) — see library/design-patterns/OSS_MOTION_CATALOG.md.
 * Above 768px (and not landscape-short) the Swiper is destroyed and the original 5/3-column grid returns untouched.
 * No script: the grid stays. 2026-09-29 (user: "0.8초로 우측으로 흘러가게" → 멈춤 없이 계속, 카드 1장당 0.8초, 카드가 오른쪽으로):
 * the row flows left→right, reduced-motion uses the static grid for accessible reading.
 * 2026-10-02 H1 (user: "메인페이지 인기상품 흘러가는 모션 더 느리게 바꾸고 모바일 반응형도 똑같이 흘러가는 모션으로 바꿔"):
 * 0.8s -> 2.4s (2026-10-02 feedback #6) -> 2.4s * 1.5 = 3.6s per card (this change), same speed/config as the imweb
 * shopFlow widget (build_imweb.py millisecondsPerCard) so PC and mobile/tablet always match. The breakpoint also now
 * covers landscape phones (e.g. 844x390): width<=768 covered portrait/most tablets, but a landscape phone is WIDER
 * than 768 while still short, so it fell through to the static grid before — added a short-height OR branch. */
(() => {
  'use strict';
  const mq = matchMedia('(max-width: 768px), (max-height: 500px) and (min-width: 600px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let swiper = null;

  function mount() {
    const box = document.querySelector('.ns-home-popular');
    const grid = box?.querySelector('.ns-product-grid');
    if (!grid || !window.Swiper || grid.querySelectorAll('.ns-product').length < 3) return;
    if (mq.matches && !reduced.matches && !swiper) {
      const host = document.createElement('div');
      host.className = 'swiper ns-popular-flow';
      grid.before(host); host.append(grid);
      grid.classList.add('swiper-wrapper');
      grid.querySelectorAll(':scope > .ns-product').forEach(c => c.classList.add('swiper-slide'));
      swiper = new window.Swiper(host, {
        slidesPerView: 2, spaceBetween: 12, loop: true, grabCursor: true,
        speed: 3600,   // 2026-10-02 H1: 2.4 s felt too fast still -> 3.6 s per card (x1.5), still left->right
        autoplay: { delay: 0, reverseDirection: true, disableOnInteraction: false, pauseOnMouseEnter: false },
        a11y: { enabled: true, prevSlideMessage: '이전 상품', nextSlideMessage: '다음 상품' }
      });
      host.classList.add('is-flowing');
    } else if ((!mq.matches || reduced.matches) && swiper) {
      const host = swiper.el;
      swiper.destroy(true, true); swiper = null;
      grid.classList.remove('swiper-wrapper');
      grid.querySelectorAll('.swiper-slide').forEach(c => c.classList.remove('swiper-slide'));
      grid.querySelectorAll('.swiper-slide-duplicate, [data-swiper-slide-index]').forEach(c => c.removeAttribute('data-swiper-slide-index'));
      host.replaceWith(grid);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
  window.addEventListener('load', mount, { once: true });
  mq.addEventListener('change', mount);
  reduced.addEventListener('change', mount);
  window.NaturePopularFlow = { mount };
})();
