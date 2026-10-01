/* Native iMweb bridge. Inlined by build_imweb.py; no deployment dependency.
 * Reuses widgets/widget_{notice,inquiry}.html's ID lookup + delayed-init pattern.
 * Native widgets remain usable until a complete mapping exists. No network API is called here. */
(() => {
  'use strict';
  if (window.__natureNativeBridge) return;
  window.__natureNativeBridge = true;
  const ids = () => window.NATURE_IMWEB_SET?.widgetIds || {};
  const clean = s => (s || '').replace(/[\s*：:]/g, '');
  const hide = el => { el.classList.add('n2j-native-source'); el.setAttribute('aria-hidden', 'true'); el.inert = true; };
  const show = el => { el.classList.remove('n2j-native-source'); el.removeAttribute('aria-hidden'); el.inert = false; };
  function inquiry() {
    const proxy = document.querySelector('[data-n2j-inquiry]');
    if (!proxy || proxy.dataset.bridge === 'connected') return;
    const native = document.getElementById(ids().inquiry);
    const status = proxy.querySelector('[role=status]');
    if (!native) { proxy.dataset.bridge = 'waiting'; return; }
    const fields = [...native.querySelectorAll('input:not([type=hidden]),select,textarea')];
    const labels = e => {
      const direct = [...(e.labels || [])].map(l => l.textContent);
      const group = e.closest('.form-group, .form-item, .input_form_item');
      const heading = group?.querySelector('.control-label, .form-title, label');
      return direct.concat(heading?.textContent || [], e.getAttribute('aria-label') || []).map(clean);
    };
    const names = {name:'이름',phone:'연락처',email:'이메일',topic:'문의종류',message:'문의내용',consent:'개인정보'};
    const mapping = {};
    for (const [key,label] of Object.entries(names)) {
      const found = fields.filter(e => labels(e).some(t => key==='consent' ? t.includes(label) : t===label));
      if (found.length!==1) { proxy.dataset.bridge='unmapped'; if(status.textContent!=='아래 문의 양식을 이용해 주세요.') status.textContent='아래 문의 양식을 이용해 주세요.'; return; }
      mapping[key]=found[0];
    }
    const button = native.querySelector('[onclick*="send"], [onclick*="submit"], [type=submit], ._input_form_submit, .btn-submit, .btn_submit');
    if (!button || mapping.topic.tagName!=='SELECT' || mapping.consent.type!=='checkbox') { proxy.dataset.bridge='unmapped'; return; }
    const localTopic=proxy.elements.namedItem('topic');
    if ([...localTopic.options].filter(o=>o.value).some(o=>![...mapping.topic.options].some(n=>clean(n.text)===clean(o.text)))) { proxy.dataset.bridge='unmapped'; return; }
    proxy.dataset.bridge='connected'; proxy.dataset.targetWidget=native.id;
    for (const [key,e] of Object.entries(mapping)) proxy.elements.namedItem(key).dataset.nativeField=e.id || e.name;
    proxy.querySelector('.ns-form-hint').textContent='남겨 주신 연락처로 답변드립니다.';
    status.textContent=''; hide(native);
    proxy.addEventListener('submit', event => {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!proxy.reportValidity()) return;
      if (!native.isConnected || !button.isConnected || button.disabled) { status.textContent='접수 양식을 불러오지 못했습니다. 페이지를 새로고침해 주세요.'; return; }
      for (const [key,target] of Object.entries(mapping)) {
        const source=proxy.elements.namedItem(key);
        if (key==='consent') target.checked=source.checked;
        else if (key==='topic') target.value=[...target.options].find(o=>clean(o.text)===clean(source.selectedOptions[0].text)).value;
        else target.value=source.value;
        target.dispatchEvent(new Event('input',{bubbles:true})); target.dispatchEvent(new Event('change',{bubbles:true}));
      }
      // Let iMweb own validation, captcha, response and success. Never invent a success state.
      // Reveal its UI for any native validation/captcha; the proxy is hidden to prevent double submission.
      show(native); proxy.hidden=true;
      button.click();
      native.scrollIntoView({block:'center',behavior:'auto'});
    }, true);
  }
  function notice() {
    const proxy=document.querySelector('[data-n2j-notice]');
    if (!proxy || proxy.dataset.bridge==='connected') return;
    const native=document.getElementById(ids().notice);
    if (!native) { proxy.dataset.bridge='waiting'; return; }
    // Detailed articles, write screens and unknown native markup retain the native view.
    if (new URLSearchParams(location.search).get('bmode')==='view') { proxy.hidden=true; return; }
    const findLinks=()=>[...native.querySelectorAll('a[href]')].filter(a=>{
      try { const u=new URL(a.getAttribute('href'),location.href); return u.origin===location.origin && u.pathname.replace(/\/$/,'')===location.pathname.replace(/\/$/,'') && (u.searchParams.get('bmode')==='view' || u.searchParams.has('idx')) && a.textContent.trim(); } catch {return false;}
    });
    const render=()=>{
      const links=findLinks(), unique=[...new Map(links.map(a=>[a.href,a])).values()];
      const empty=/게시물이 없습니다|등록된 게시글이 없습니다|등록된 게시물이 없습니다/.test(native.textContent);
      if (!unique.length && !empty) return false;
      const list=proxy.querySelector('.ns-board-list');list.replaceChildren();
      unique.forEach(original=>{
        const li=document.createElement('li'),a=document.createElement('a'),title=document.createElement('span');
        a.href=original.href;title.className='ns-board-title';title.textContent=original.textContent.trim();a.append(title);li.append(a);list.append(li);
        // Keep the original handler (including native detail/modal handling) instead of copying JavaScript.
        a.addEventListener('click',e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey){e.preventDefault();original.click();}});
      });
      if(empty&&!unique.length){const li=document.createElement('li');li.textContent='등록된 공지사항이 없습니다.';list.append(li);}
      proxy.querySelector('.ns-board-count').textContent=unique.length ? `현재 페이지 ${unique.length}건` : '전체 0건';
      const paging=proxy.querySelector('.ns-board-paging');paging.replaceChildren();
      native.querySelectorAll('.pagination a,.paging a').forEach(original=>{
        const a=document.createElement('a');a.href=original.href;a.textContent=original.textContent.trim();
        a.addEventListener('click',e=>{e.preventDefault();original.click();});paging.append(a);
      });
      return true;
    };
    if(!render()){proxy.dataset.bridge='unmapped';proxy.hidden=true;return;}
    proxy.dataset.bridge='connected';proxy.dataset.targetWidget=native.id;hide(native);
    // Native search stays native; avoid pretending that filtering one page searches all posts.
    const search=proxy.querySelector('.ns-board-search');
    const nativeSearch=native.querySelector('input[name=keyword],input[name=search],input[type=search]');
    if(nativeSearch?.form){search.removeAttribute('onsubmit');search.addEventListener('submit',e=>{e.preventDefault();nativeSearch.value=search.querySelector('input').value;show(native);proxy.hidden=true;nativeSearch.form.requestSubmit();});}
    else search.hidden=true;
    proxy.querySelector('.ns-board-note').textContent='';
    new MutationObserver(()=>{if(!render()){show(native);proxy.hidden=true;}}).observe(native,{childList:true,subtree:true,characterData:true});
  }
  document.addEventListener('submit', event=>{
    if(event.target.matches('[data-n2j-inquiry]:not([data-bridge=connected])')) {
      event.preventDefault();event.stopImmediatePropagation();
    }
  },true);
  const connect=()=>{inquiry();notice();};
  document.addEventListener('DOMContentLoaded',connect,{once:true});addEventListener('load',connect,{once:true});
  let pending=false;
  new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;connect();});}}).observe(document.documentElement,{childList:true,subtree:true});
  let count=0;const timer=setInterval(()=>{connect();if(++count>=40)clearInterval(timer);},250);
  connect();
})();
