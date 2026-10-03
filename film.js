/* Independently authored scroll-to-time controller. No reference source reused. */
(() => {
 'use strict';
 function attach(root,reduce){
  const video=root.querySelector('.ns-film'),poster=root.querySelector('.ns-film-poster'),water=root.querySelector('.ns-water-film');
  if(!video)return null;
  root.querySelector('.ns-cinema').dataset.filmControls='ready';
  const status=root.querySelector('.ns-film-status'),replay=root.querySelector('#film-replay');
  const hero=root.querySelector('.ns-cinema'),frameEl=root.querySelector('.ns-film-frame'),ambient=root.querySelector('.ns-ambient-canvas'),actx=ambient?.getContext('2d');
  // Extend the film's own background edges across the whole hero: edge rows/columns are stretched
  // outward and the frame is drawn in place, then CSS blur merges them. Only background edge pixels are stretched.
  function paintAmbient(){
   if(!actx||!hero||!frameEl)return;
   const src=video.dataset.ready==='true'&&video.readyState>=2?video:poster;
   const W=src.videoWidth||src.naturalWidth,H=src.videoHeight||src.naturalHeight;if(!W||!H)return;
   const hr=hero.getBoundingClientRect(),fr=frameEl.getBoundingClientRect();if(!hr.width||!hr.height||!fr.width)return;
   const cw=Math.max(32,Math.round(hr.width/8)),ch=Math.max(18,Math.round(hr.height/8));
   if(ambient.width!==cw||ambient.height!==ch){ambient.width=cw;ambient.height=ch;}
   const k=1.16,o=.08,mx=x=>((x-hr.left)/hr.width+o)/k*cw,my=y=>((y-hr.top)/hr.height+o)/k*ch;
   const x0=mx(fr.left),x1=mx(fr.right),y0=my(fr.top),y1=my(fr.bottom),e=6;
   try{
    if(y0>0)actx.drawImage(src,0,0,W,e,Math.min(0,x0),0,Math.max(cw,x1)-Math.min(0,x0),y0);
    if(y1<ch)actx.drawImage(src,0,H-e,W,e,Math.min(0,x0),y1,Math.max(cw,x1)-Math.min(0,x0),ch-y1);
    if(x0>0)actx.drawImage(src,0,0,e,H,0,y0,x0,y1-y0);
    if(x1<cw)actx.drawImage(src,W-e,0,e,H,x1,y0,cw-x1,y1-y0);
    actx.drawImage(src,0,0,W,H,x0,y0,x1-x0,y1-y0);
    hero.dataset.ambient='on';
   }catch{}
  }
  let ambientRaf=0;
  function queueAmbient(){if(!ambientRaf)ambientRaf=requestAnimationFrame(()=>{ambientRaf=0;paintAmbient();});}
  if(poster){if(poster.complete)queueAmbient();else poster.addEventListener('load',queueAmbient,{once:true});}
  window.addEventListener('resize',queueAmbient);
  let desired=0,stopped=false,raf=0,playing=false,failed=false,loaded=false,visible=true;
  const saveData=Boolean(navigator.connection?.saveData);
  let waterLoaded=false;
  function syncWater(){
   if(!water)return;
   if(reduce.matches||saveData||document.hidden||!visible||stopped){water.pause();return;}
   if(!waterLoaded){waterLoaded=true;water.src=water.dataset.src;water.load();}
   if(water.paused)water.play().catch(()=>{});
  }
  water?.addEventListener('error',()=>{water.pause();water.removeAttribute('src');});
  function notifyFrame(){if(Number.isFinite(video.duration)&&video.duration>0)video.dispatchEvent(new CustomEvent('ns:film-frame',{bubbles:true,detail:{progress:video.currentTime/video.duration}}));}
  video.addEventListener('timeupdate',()=>{notifyFrame();queueAmbient();});
  video.addEventListener('seeked',notifyFrame);
  // 2026-09-28: phones get the same 1080p film as PC (the 960 cut looked soft on 3x screens); saveData keeps the small one.
  function load(){if(loaded)return;loaded=true;video.src=(video.dataset.srcSmall&&saveData)?video.dataset.srcSmall:video.dataset.src;video.load();}
  // iOS Safari buffers a muted inline video only after it has played once → prime it on the first touch (then pause at once).
  addEventListener('touchstart',()=>{load();video.play()?.then(()=>{if(!playing)video.pause();}).catch(()=>{});},{once:true,passive:true});
  function markReady(){if(!reduce.matches||playing)video.dataset.ready='true';if(status)status.textContent='';}
  // Eased scrubbing: the film time glides toward the scroll target so packs and ice settle in slowly.
  let shown=-1;
  // 2026-10-04 N4 (user: "전체상품 인터렉티브 모션 그래픽이 너무 빨라"): on portrait phones the /shop hero is no longer pinned, so a
  // short flick reached the end at once — there the film may advance at most 1.4 s of film per second (whole film ≥ ~6.7 s).
  const slowShop=root.querySelector('.ns-shop-film')?matchMedia('(max-width:600px) and (orientation:portrait)'):null;
  let lastTs=0;
  function seek(ts){
   const dt=lastTs&&ts?Math.min(.05,(ts-lastTs)/1000):1/60;lastTs=ts||0;
   raf=0;if(failed||playing||video.readyState<2||!Number.isFinite(video.duration))return;
   const target=Math.min(Math.max(0,video.duration-.05),desired*video.duration);
   if(shown<0)shown=target;
   let step=(target-shown)*.2;   // 2026-09-28 b: follows the scroll faster (was .09 — ice fell too late)
   if(slowShop?.matches)step=Math.max(-1.4*dt,Math.min(1.4*dt,step));
   shown+=step;if(Math.abs(target-shown)<.02)shown=target;
   if(!video.seeking&&Math.abs(video.currentTime-shown)>.02)video.currentTime=shown;
   if(shown!==target||video.seeking)request();else lastTs=0;
  }
  function request(){if(!raf)raf=requestAnimationFrame(seek);}
  video.addEventListener('loadeddata',()=>{
   // Decode the first still frame too: metadata/poster alone can yield an empty canvas.
   if(video.currentTime===0&&video.duration>.01)video.currentTime=.001;
   markReady();queueAmbient();request();
  });
  video.addEventListener('seeked',()=>{markReady();queueAmbient();request();});
  video.addEventListener('error',()=>{failed=true;root.querySelector('.ns-cinema').classList.remove('ns-story-ready');delete video.dataset.ready;if(status)status.textContent='영상을 불러오지 못해 제품 사진을 표시합니다.';if(replay){replay.disabled=false;replay.textContent='영상 다시 불러오기';}});
  video.addEventListener('ended',()=>{playing=false;shown=-1;if(replay)replay.textContent='영상 재생';});
  video.addEventListener('pause',()=>{if(playing){playing=false;shown=-1;if(replay)replay.textContent='영상 재생';}});
  replay?.addEventListener('click',async()=>{
   if(failed){failed=false;loaded=false;load();replay.textContent='영상 재생';return;}
   if(playing){video.pause();return;}
   root.dispatchEvent(new CustomEvent('ns:film-play'));
   load();playing=true;video.currentTime=0;replay.textContent='영상 정지';
   try{await video.play();markReady();}catch{playing=false;replay.textContent='영상 재생';if(status)status.textContent='재생 버튼을 다시 눌러 주세요.';}
  });
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){video.pause();cancelAnimationFrame(raf);raf=0;}else request();syncWater();},{threshold:0});observer.observe(video);
  const heroObserver=new IntersectionObserver(entries=>document.body.classList.toggle('ns-hero-in-view',entries[0].isIntersecting),{threshold:0});heroObserver.observe(root.querySelector('.ns-cinema'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();syncWater();});
  reduce.addEventListener('change',()=>{video.pause();desired=0;if(reduce.matches){delete video.dataset.ready;video.currentTime=0;}else{load();request();}syncWater();});
  if(!reduce.matches&&!saveData)load();
  return {paint:queueAmbient,update(progress,paused){
   stopped=paused;syncWater();
   if(stopped){video.pause();return;}
   if(reduce.matches||saveData||document.hidden||playing||!visible)return;
   desired=progress;request();
  }};
 }
 window.NatureFilm={attach};
})();
