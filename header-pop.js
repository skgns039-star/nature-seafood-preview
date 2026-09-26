/* Phone home hero: the header stays tucked away while the box is being packed, then pops down once the
 * story reaches "packed" (fish and ice are in). Scrolling back up tucks it again.
 * Library: anime.js 4.5.0 (juliangarnier/anime, ★73k, MIT). Portrait phones only; no JS / reduced motion /
 * keyboard focus in the header / open menu → the header simply stays visible. */
(() => {
  'use strict';
  function init() {
    const A = window.anime, header = document.querySelector('.ns-header');
    const hero = document.querySelector('.ns-hero-v4'), track = document.querySelector('.ns-hero-track');
    if (!A?.animate || !header || !hero || !track) return;
    const phone = matchMedia('(max-width: 768px) and (orientation: portrait)');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let tucked = false, focusIn = false, anim = null, queued = false;

    function want() {
      if (!phone.matches || reduce.matches || focusIn || header.querySelector('.ns-burger[open]')) return false;
      if (!track.classList.contains('ns-scroll-enabled')) return false;
      const inHero = track.getBoundingClientRect().bottom > innerHeight + 1;
      return inHero && hero.dataset.storyPhase !== 'packed';
    }
    function apply(first) {
      queued = false;
      const next = want();
      if (next === tucked) return;
      tucked = next;
      document.body.classList.toggle('ns-hdr-tucked', tucked);
      anim?.pause();
      if (first) { A.utils.set(header, { y: tucked ? '-130%' : '0%' }); return; }
      anim = tucked
        ? A.animate(header, { y: '-130%', duration: 380, ease: 'inCubic' })
        : A.animate(header, { y: ['-130%', '0%'], duration: 950, ease: 'outElastic(1, .55)' });  // the "pop"
    }
    const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(() => apply(false)); } };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    phone.addEventListener('change', schedule);
    new MutationObserver(schedule).observe(hero, { attributes: true, attributeFilter: ['data-story-phase'] });
    header.addEventListener('focusin', () => { focusIn = true; schedule(); });
    header.addEventListener('focusout', () => { focusIn = false; schedule(); });
    apply(true);
  }
  if (document.readyState === 'complete') init(); else addEventListener('load', init, { once: true });
})();
