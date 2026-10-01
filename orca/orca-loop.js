/* NatureSea food — Orca hero v5 (2026-09-28): seamless looping film (boat sailing slowly back and forth, boxes
 * standing on the quay). PC 16:9 and phone 9:16 each have their own film. Muted autoplay; paused off-screen and in
 * hidden tabs; reduced motion / video failure / no JS → still poster (same frame as the film's first frame). */
(() => {
  const root = document.getElementById('orca-hero');
  if (!root || root.dataset.olInit) return;
  root.dataset.olInit = '1';
  const video = root.querySelector('.ol-video');
  const MV = '?v=7';   // v6 (2026-09-28): 2x slower (RIFE), Topaz 4K, original box print restored, steady water
  const phone = matchMedia('(max-width: 1100px) and (orientation: portrait)');
  // 2026-09-29 (user: "PC랑 똑같이 영상 … 휴대폰화면에서도"): the loop plays even with 동작 줄이기 on (it used to fall back to the still poster).
  const reduce = { matches: false, addEventListener() {} };
  let key = null, visible = true;

  function pick() {
    const k = phone.matches ? 'm' : 'pc';
    // Cover scaling must account for height too (the smaller PC file is 2560×1440).
    const big = k === 'pc' && Math.max(root.clientWidth / 2560, root.clientHeight / 1440) * (devicePixelRatio || 1) > 1 && !(navigator.connection && navigator.connection.saveData);
    const selection = k + (big ? '-4k' : '');
    if (selection === key) return;
    key = selection;
    root.dataset.media = k;
    root.classList.remove('is-playing');
    if (reduce.matches) { video.removeAttribute('src'); video.load(); return; }
    // iMweb: the film lives on the GitHub preview (imweb-map.js assetBase); preview: relative as before
    video.src = (window.NATURE_IMWEB?.asset || (p => p))(`orca/media/loop-${k}${big ? '-4k' : ''}.mp4${MV}`);
    play();
  }
  function play() {
    if (reduce.matches || !visible || document.hidden || !video.getAttribute('src')) return;
    const pr = video.play();
    if (pr && pr.catch) pr.catch(() => {});
  }
  video.addEventListener('playing', () => root.classList.add('is-playing'));
  video.addEventListener('error', () => { root.classList.remove('is-playing'); root.dataset.degraded = 'video-error'; });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; document.body.classList.toggle('ns-hero-in-view', visible); visible ? play() : video.pause(); }).observe(root);   // same class the old hero set: floating buttons hide over the hero (hero-video.css)
  document.addEventListener('visibilitychange', () => document.hidden ? video.pause() : play());
  // 2026-09-29: the header overlaps the film by its real height (the fixed 72px guess left a 2px strip below the film on 74px headers)
  // iOS Low Power Mode / in-app browsers (KakaoTalk) can refuse muted autoplay → start on the first touch instead.
  ['touchstart', 'touchend', 'click'].forEach(t => addEventListener(t, () => { if (video.paused) play(); }, { passive: true }));
  phone.addEventListener('change', pick);
  addEventListener('resize', pick);
  reduce.addEventListener('change', () => { key = null; pick(); });
  // the film is fetched after window load so the brand lockup and poster paint first (poster = film's first frame)
  if (document.readyState === 'complete') pick(); else addEventListener('load', pick, { once: true });
})();
