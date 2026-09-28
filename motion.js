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
      if(!paused&&!heroReduce.matches)progress=Math.max(0,Math.min(1,(top-r.top)/Math.max(1,track.offsetHeight-hero.offsetHeight)));
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
