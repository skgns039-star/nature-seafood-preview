(() => {
  'use strict';
  function init(root=document){
    if(root.documentElement?.dataset.nsMotionReady || root.dataset?.nsMotionReady)return;
    (root.documentElement||root).dataset.nsMotionReady='1';
    const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
    const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
    // 2026-09-29 (user): the film hero plays exactly as on PC even with 동작 줄이기 on; reading content below still honours it.
    const heroReduce={matches:false,addEventListener(){}};
    const hero=q('.ns-cinema'),track=q('.ns-hero-track'),scene=q('.ns-packing-scene'),header=q('.ns-header');
    let paused=false,queued=false,progress=0,pointerFrame=0,pointerX=0,pointerY=0;
    const film=window.NatureFilm?.attach(root,heroReduce);
    const reveal=[]; // Film is the one orchestrated scene; reading content remains still.
    let observer;
    function showAll(){reveal.forEach(e=>{e.classList.add('is-visible');e.classList.remove('ns-reveal-pending');});observer?.disconnect();}
    if(!reduce.matches && 'IntersectionObserver' in window){
      observer=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('is-visible');x.target.classList.remove('ns-reveal-pending');observer.unobserve(x.target);}}),{threshold:.08});
      reveal.forEach((e,i)=>{e.classList.add('ns-reveal','ns-reveal-pending');e.style.setProperty('--ns-delay',`${e.classList.contains('ns-product')?(i%5)*65:0}ms`);observer.observe(e);});
    }
    // Pointer depth: the product rig tilts toward the cursor, water moves the opposite way, light follows.
    function setPointerVars(){if(!hero)return;const s=hero.style,nx=pointerX/12,ny=pointerY/7;s.setProperty('--ns-px',`${pointerX}px`);s.setProperty('--ns-py',`${pointerY}px`);s.setProperty('--ns-ry',`${(nx*6).toFixed(3)}deg`);s.setProperty('--ns-rx',`${(-ny*3.5).toFixed(3)}deg`);s.setProperty('--ns-lx',`${(70+nx*14).toFixed(2)}%`);s.setProperty('--ns-ly',`${(48+ny*12).toFixed(2)}%`);}
    function resetPointer(){cancelAnimationFrame(pointerFrame);pointerFrame=0;pointerX=pointerY=0;setPointerVars();}
    function paintPointer(){pointerFrame=0;setPointerVars();}
    function syncReduced(){const toggle=q('#motion-toggle');if(toggle){toggle.disabled=reduce.matches;toggle.textContent=reduce.matches?'모션 줄임 사용 중':paused?'모션 재개 ▷':'모션 정지 Ⅱ';}}
    function syncTrack(){track?.classList.toggle('ns-scroll-enabled',!heroReduce.matches&&!navigator.connection?.saveData);}
    syncReduced();syncTrack();
    const story=hero?.classList.contains('ns-ocean-story');
    const clamp=v=>Math.max(0,Math.min(1,v));
    function storyFrame(p){
      if(!story)return;
      hero.classList.toggle('ns-story-ready',!heroReduce.matches&&!navigator.connection?.saveData);
      const title=clamp((p-.15)/.08),intro=1-title;
      hero.style.setProperty('--ns-intro-o',intro.toFixed(4));
      hero.style.setProperty('--ns-intro-y',`${-16*(1-intro)}px`);
      hero.style.setProperty('--ns-title-o',title.toFixed(4));
      hero.style.setProperty('--ns-title-y',`${24*(1-title)}px`);
      hero.dataset.storyPhase=p<.14?'empty':p<.57?'packs':p<.8?'ice':'packed';
      const caption=q('#packing-caption');if(caption)caption.textContent=p>.8?'얼음 위에 담아 보내는 군산박대':p>.57?'얼음을 가득 채워서':p>.14?'한 마리씩 진공 포장한 군산박대':'스크롤을 내려 상자를 채워 보세요';
    }
    root.addEventListener('ns:film-frame',e=>storyFrame(e.detail.progress));
    root.addEventListener('ns:film-play',()=>{paused=false;const toggle=q('#motion-toggle');toggle?.setAttribute('aria-pressed','false');syncReduced();schedule();});
    storyFrame(0);
    function draw(){
      queued=false;header?.classList.toggle('is-scrolled',scrollY>24);
      if(!hero||!track)return;
      track.style.setProperty('--ns-header-h',`${header?.offsetHeight||0}px`);document.body.style.setProperty('--ns-hdr-h',`${header?.offsetHeight||0}px`);
      track.style.setProperty('--ns-notice-h',`${q('.ns-announcement')?.offsetHeight||0}px`);
      const r=track.getBoundingClientRect(),top=parseFloat(getComputedStyle(hero).top)||0;
      if(!paused&&!heroReduce.matches){const span=track.offsetHeight-hero.offsetHeight;progress=Math.max(0,Math.min(1,(top-r.top)/(span>1?span:hero.offsetHeight*.9)));}   // 2026-10-04 N3/N4: unpinned phone-portrait hero → film runs over 90% of its own height (N4: was 60%, too fast)
      hero.style.setProperty('--ns-progress',progress.toFixed(4));
      hero.dataset.motionProgress=progress.toFixed(4);
      // Scroll dolly: the packing scene eases slightly toward the viewer as the box fills.
      const a=clamp(progress/.23),dolly=.94+.08*(1-(1-a)**3);
      hero.style.setProperty('--ns-dolly',dolly.toFixed(4));
      film?.update(progress,paused);film?.paint?.();
      const caption=q('#packing-caption');if(caption&&!story)caption.textContent=progress>.55?'한 상자에 담은 군산박대':'군산박대 · 개별 포장';
    }
    function schedule(){if(!queued){queued=true;requestAnimationFrame(draw);}}
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
    reduce.addEventListener('change',()=>{syncTrack();if(reduce.matches)showAll();syncReduced();storyFrame(progress);resetPointer();schedule();});
    fine.addEventListener('change',resetPointer);
    window.addEventListener('blur',resetPointer);
    root.addEventListener('focusin',e=>{const item=e.target.closest('.ns-reveal-pending');if(item){item.classList.remove('ns-reveal-pending');item.classList.add('is-visible');observer?.unobserve(item);}});
    if(hero&&scene){
      // 2026-09-28: cursor-follow tilt removed (user: "마우스에 따라서 움직이는 모션은 어지럽게 보임"); scroll film unchanged
      hero.addEventListener('pointerleave',resetPointer);
      hero.addEventListener('pointercancel',resetPointer);
      q('#motion-toggle')?.addEventListener('click',e=>{paused=!paused;e.currentTarget.setAttribute('aria-pressed',String(paused));e.currentTarget.textContent=paused?'모션 재개 ▷':'모션 정지 Ⅱ';resetPointer();schedule();});
    }
    document.addEventListener('visibilitychange',()=>{if(document.hidden)resetPointer();else schedule();});
    // Native details retain keyboard and no-JS behavior; animate only their existing content.
    all('.ns-faq details').forEach(detail=>detail.addEventListener('toggle',()=>{if(!detail.open||reduce.matches||window.anime?.animate)return;(detail.querySelector('.ns-faq-a')||detail.querySelector('p'))?.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:260,easing:'ease-out'});}));
    schedule();
  }
  window.NatureMotion={init};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();
})();
/* 2026-10-08 sea flow (대표님: "이용약관·개인정보처리방침·찾아오시는길·고객센터·Q&A·공지사항·1:1문의하기 히어로 배경이 물 흐르듯 안 흐르는데 … 근본적인 원인을 찾고 완벽하게 해결").
 * Cause (measured on nsaefood.imweb.me): the G1 ripple (.ns-sea-wave + SVG #ns-sea-ripple) lived in each page widget's HTML,
 * so terms/privacy/directions never had it (0.00% change), and where it did exist it only breathed (feTurbulence
 * baseFrequency 0.012→0.017 over 22 s, scale 9 → 1.5 s diff 0.5–2.5% of pixels, mean 0.3–0.6), which reads as a still photo.
 * Now this shared module adds the layer to every .ns-page-banner: one WebGL pass scrolls perspective noise toward the shore
 * and displaces + lights only the sea. The sea is a per-photo polygon in image coordinates; outside it the canvas is fully
 * transparent, so the box, rocks, sky, horizon and caption stay pixel-identical. An existing .ns-sea-wave is reused (no
 * duplicate) and the old SVG filter is removed. Off with prefers-reduced-motion; paused off-screen and in background tabs;
 * no WebGL / unknown photo → the photo simply stays still. */
(() => {
  'use strict';
  if (window.NatureSeaFlow) return;
  // sea polygons per banner photo (file name), image coordinates 0–1, kept clear of the box, the rocks and the horizon
  const MASKS = {
    'support-pc': { horizon: .203, polys: [[[0, .2], [.722, .2], [.722, .45], [.69, .52], [.68, .555], [.68, .6], [.655, .62], [.6, .645], [.5, .665], [.35, .69], [.2, .72], [0, .745]], [[.89, .2], [1, .2], [1, .375], [.89, .395]]] },
    'support-m': { horizon: .384, polys: [[[0, .375], [.5, .375], [.5, .565], [.395, .575], [.395, .69], [.3, .715], [.14, .76], [0, .79]], [[.965, .375], [1, .375], [1, .55], [.965, .55]]] }
  };
  const SPEED = .42;              // noise units per second toward the viewer
  const PERIOD = 256 / (SPEED * 3); // noise lattice repeats every 256 → time wraps seamlessly
  const VS = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x+1.,1.-p.y)*.5;gl_Position=vec4(p,0.,1.);}';
  const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;uniform sampler2D T,M;uniform vec4 map;uniform vec2 amp;uniform float t,hz,asp;
float h(vec2 q){q=mod(q,256.);vec3 r=fract(vec3(q.xyx)*.1031);r+=dot(r,r.yzx+33.33);return fract((r.x+r.y)*r.z);}
float n(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}
float fb(vec2 q){return .55*n(q)+.3*n(q*2.+7.)+.15*n(q*4.+3.);}
void main(){vec2 u=map.zw+v*map.xy;
 if(u.x<0.||u.y<0.||u.x>1.||u.y>1.){gl_FragColor=vec4(0.);return;}
 float m=smoothstep(.45,1.,texture2D(M,u).a);if(m<.003){gl_FragColor=vec4(0.);return;}
 float d=clamp((u.y-hz)/(1.-hz),0.,1.),z=1./(d+.25);
 vec2 w=vec2((u.x-.5)*asp*z*.9,z*1.6)*vec2(1.,3.)+vec2(0.,t*${(SPEED * 3).toFixed(4)});
 float a=fb(w),b=fb(w+vec2(5.2,1.3));float k=m*smoothstep(0.,.3,d);
 vec2 o=vec2((b-.5)*.5,a-.5)*2.*k*amp;
 float r=1.-abs(2.*a-1.);r=r*r*r;                // crest lines that travel with the swell
 vec3 c=texture2D(T,u+o).rgb*(1.+k*(.2*(a-.5)+.14*r-.035));
 gl_FragColor=vec4(c*m,m);}`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const flows = [];

  function maskCanvas(def, iw, ih) {   // polygon → soft alpha (two 1-texel box blurs), image-space
    const W = iw >= ih ? 512 : Math.round(640 * iw / ih), H = iw >= ih ? Math.round(512 * ih / iw) : 640;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.fillStyle = '#fff';
    def.polys.forEach(poly => { x.beginPath(); poly.forEach(([px, py], i) => x[i ? 'lineTo' : 'moveTo'](px * W, py * H)); x.closePath(); x.fill(); });
    const img = x.getImageData(0, 0, W, H), a = img.data, tmp = new Float32Array(W * H);
    for (let pass = 0; pass < 4; pass++) {
      const horiz = pass % 2 === 0;
      for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) {
        let s = 0, n = 0;
        for (let k = -1; k <= 1; k++) { const xx = horiz ? i + k : i, yy = horiz ? y : y + k; if (xx >= 0 && yy >= 0 && xx < W && yy < H) { s += a[(yy * W + xx) * 4 + 3]; n++; } }
        tmp[y * W + i] = s / n;
      }
      for (let j = 0; j < W * H; j++) a[j * 4 + 3] = tmp[j];
    }
    x.putImageData(img, 0, 0);
    return c;
  }

  function attach(banner) {
    if (banner.__nsSeaFlow) return;
    const img = banner.querySelector('.ns-banner-media img');
    if (!img) return;
    banner.__nsSeaFlow = true;
    let layer = banner.querySelector(':scope > .ns-sea-wave');                         // G1 widgets: reuse, never duplicate
    if (!layer) { layer = document.createElement('div'); layer.className = 'ns-sea-wave'; layer.setAttribute('aria-hidden', 'true'); banner.querySelector('.ns-banner-media').after(layer); }
    document.getElementById('ns-sea-ripple')?.closest('svg')?.remove();             // old SMIL filter: no longer referenced
    layer.replaceChildren();
    layer.classList.add('ns-sea-flow');
    layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;filter:none;mask-image:none;-webkit-mask-image:none;overflow:hidden';
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    layer.appendChild(cv);
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: 'low-power' });
    if (!gl) { layer.remove(); return; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { layer.remove(); return; }
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = k => gl.getUniformLocation(pr, k);
    gl.uniform1i(U('T'), 0); gl.uniform1i(U('M'), 1);
    const tex = unit => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, val]) => gl.texParameteri(gl.TEXTURE_2D, k, val)); return t; };
    const photoTex = tex(0), maskTex = tex(1);
    const st = { banner, layer, cv, gl, key: null, def: null, iw: 0, ih: 0, geo: null, ready: false, visible: true, raf: 0 };

    function load() {                                   // photo for the current <picture> source → texture + mask
      const src = img.currentSrc || img.src, key = (src.split('?')[0].split('/').pop() || '').replace(/\.[a-z0-9]+$/i, '');
      if (key === st.key && st.ready) return;
      st.key = key; st.def = MASKS[key] || null; st.ready = false; stop(); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      if (!st.def) return;                              // a photo without a mapped sea stays still
      const im = new Image(); im.crossOrigin = 'anonymous'; im.decoding = 'async';
      im.onload = () => {
        if (st.key !== key) return;
        try {
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, photoTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
          gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, maskTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas(st.def, im.naturalWidth, im.naturalHeight));
        } catch (e) { return; }                          // cross-origin refused → stay still
        st.iw = im.naturalWidth; st.ih = im.naturalHeight; st.ready = true; size(); start();
      };
      im.src = src;
    }
    function size() {                                   // canvas = banner in device pixels; image placed like object-fit:cover
      const b = banner.getBoundingClientRect(), r = img.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(b.width * dpr)); cv.height = Math.max(1, Math.round(b.height * dpr));
      gl.viewport(0, 0, cv.width, cv.height);
      if (!st.iw || !b.width || !b.height) return;
      const cs = getComputedStyle(img), pos = (cs.objectPosition || '50% 50%').split(' ').map(s => s.endsWith('%') ? parseFloat(s) / 100 : .5);
      const s = Math.max(r.width / st.iw, r.height / st.ih), dw = st.iw * s, dh = st.ih * s;
      const ox = r.left - b.left + (r.width - dw) * pos[0], oy = r.top - b.top + (r.height - dh) * (pos[1] ?? .5);
      st.geo = { dw, dh, ox, oy };
      gl.uniform4f(U('map'), b.width / dw, b.height / dh, -ox / dw, -oy / dh);
      const a = Math.min(9, Math.max(5, b.width / 160));   // swell height in CSS px: 5 on phones … 9 on wide PCs
      gl.uniform2f(U('amp'), a / dw, a / dh);
      gl.uniform1f(U('hz'), st.def.horizon); gl.uniform1f(U('asp'), st.iw / st.ih);
    }
    const t0 = performance.now();
    function frame(now) {
      st.raf = 0;
      if (!st.ready || !st.visible || document.hidden || reduce.matches) return;
      gl.uniform1f(U('t'), ((now - t0) / 1000) % PERIOD);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      st.raf = requestAnimationFrame(frame);
    }
    function start() { if (!st.raf && st.ready && st.visible && !document.hidden && !reduce.matches) st.raf = requestAnimationFrame(frame); }
    function stop() { if (st.raf) cancelAnimationFrame(st.raf); st.raf = 0; }
    st.start = start; st.stop = stop; st.size = size;
    img.addEventListener('load', load);               // <picture> switches pc ↔ m on resize
    new ResizeObserver(() => { if (st.ready) size(); }).observe(banner);
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { st.visible = es[es.length - 1].isIntersecting; st.visible ? start() : stop(); }).observe(banner);
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); st.ready = false; layer.style.display = 'none'; });
    flows.push(st);
    if (img.complete && img.naturalWidth) load();
  }

  function scan() { if (!reduce.matches) document.querySelectorAll('.ns-page-banner').forEach(attach); }
  reduce.addEventListener('change', () => {
    flows.forEach(f => { f.layer.style.display = reduce.matches ? 'none' : ''; reduce.matches ? f.stop() : f.start(); });
    scan();
  });
  document.addEventListener('visibilitychange', () => flows.forEach(f => document.hidden ? f.stop() : f.start()));
  // measurement hook (live checks): where the sea is on screen for each banner
  window.NatureSeaFlow = { masks: MASKS, state: () => flows.map(f => ({ key: f.key, ready: f.ready, running: !!f.raf, geo: f.geo, rect: f.banner.getBoundingClientRect().toJSON(), polys: f.def?.polys || [] })) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true }); else scan();
})();
