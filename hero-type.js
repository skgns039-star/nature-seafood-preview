/* Hero type motion + smooth scroll.
 * Libraries chosen by GitHub stars (see hero-169/OSS_RESEARCH.md), installed from npm 2026-09-26 into vendor/:
 *   anime.js 4.5.0 (juliangarnier/anime, ★73k, MIT) — splitText, stagger, timeline, onScroll sync
 *   Lenis 1.3.26 (darkroomengineering/lenis, ★16k, MIT) — inertial smooth scroll
 * Film scrubbing stays in film.js/motion.js; this file owns only headline motion and scroll feel. */
(() => {
  'use strict';
  function init() {
    const hero = document.querySelector('.ns-hero-v4'), track = hero?.closest('.ns-hero-track');
    const A = window.anime, Lenis = window.Lenis;
    if (!hero || !track || !A?.splitText || !A?.onScroll) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData) return;
    const { splitText, animate, createTimeline, onScroll, stagger } = A;

    // Weighty inertial scroll so the packing film and type settle slowly.
    if (Lenis && !window.__nsLenis) window.__nsLenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.85, smoothWheel: true, autoRaf: true });

    const intro = hero.querySelector('.ns-story-intro'), title = hero.querySelector('.ns-hero-copy h1');
    const opts = { lines: { wrap: 'clip' }, chars: { class: 'ns-type-char' }, accessible: false };
    const si = splitText(intro, opts), st = splitText(title, opts);
    // splitText finishes asynchronously (after fonts load) and may re-split on resize: addEffect runs each time,
    // and returning the animations lets anime.js revert them before rebuilding.
    const ready = { intro: null, title: null };
    let scrollTl = null;
    function buildScroll() {
      scrollTl?.revert();
      const { intro: ic, title: tc } = ready;
      if (!ic || !tc) return;
      const titleWords = title.querySelectorAll('.ns-br-w');
      A.utils.set(tc, { y: '115%', rotateX: -70, opacity: 0, filter: 'blur(10px)', transformOrigin: '50% 100%' });
      A.utils.set(titleWords, { paddingLeft: '0em', paddingRight: '0em' });
      // Scroll: the whole track maps to one 10s timeline; type uses its first third, the rest holds.
      // onScroll sync < 1 smooths the playhead so the text trails the scroll softly.
      scrollTl = createTimeline({ autoplay: onScroll({ target: track, enter: 'top top', leave: 'bottom bottom', sync: 0.12 }) });
      scrollTl.add(ic, { y: ['0%', '-110%'], rotateX: [0, 0], opacity: [1, 0], filter: ['blur(0px)', 'blur(8px)'], duration: 1200, ease: 'inQuad', delay: stagger(40) }, 200)
        .add(tc, { y: ['115%', '0%'], rotateX: [-70, 0], opacity: [0, 1], filter: ['blur(10px)', 'blur(0px)'], duration: 1400, ease: 'outCubic', delay: stagger(60) }, 1300)
        .add(titleWords, { paddingLeft: '.28em', paddingRight: '.28em', duration: 900, ease: 'outCubic' }, 2600)
        .add(hero, { '--ns-type-hold': 1, duration: 6500 }, 3500);
      hero.classList.add('ns-type-ready');
    }
    si.addEffect(self => {
      ready.intro = self.chars;
      A.utils.set(self.chars, { transformOrigin: '50% 100%' });
      // Entrance: intro characters rise out of their line masks while the blur clears — slow, staggered.
      const enter = animate(self.chars, { y: ['115%', '0%'], rotateX: [-70, 0], opacity: [0, 1], filter: ['blur(10px)', 'blur(0px)'],
        duration: 1600, ease: 'outExpo', delay: stagger(45, { start: 200 }) });
      const open = animate(intro.querySelectorAll('.ns-br-w'), { paddingLeft: ['0em', '.28em'], paddingRight: ['0em', '.28em'], duration: 1800, ease: 'outExpo', delay: 900 });
      // Hand over to the scroll timeline only after the entrance finishes, so they never fight over the same chars.
      enter.then(() => { ready.introDone = true; buildScroll(); });
      return () => { enter.revert(); open.revert(); };
    });
    st.addEffect(self => { ready.title = self.chars; A.utils.set(self.chars, { y: '115%', opacity: 0, filter: 'blur(10px)' }); if (ready.intro && ready.introDone) buildScroll(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
