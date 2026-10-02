(() => {
  'use strict';
  const links=window.NATURE_LINKS||{}, $=s=>document.querySelector(s);
  const dialog=$('#ns-dialog'), content=$('#dialog-content');
  const products=window.NATURE_PRODUCTS||[];
  let cart=[];
  try {const saved=JSON.parse(localStorage.getItem('nature-preview-cart')||'[]');if(Array.isArray(saved))cart=saved.filter(x=>Number.isInteger(x.id)&&products[x.id]&&Number.isInteger(x.qty)&&x.qty>0&&x.qty<=99);}catch{}
  function syncCart(){document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=cart.reduce((s,x)=>s+x.qty,0));try{localStorage.setItem('nature-preview-cart',JSON.stringify(cart));}catch{}}
  function show(html){content.innerHTML=html;if(!dialog.open)dialog.showModal();}
  function missing(key){const names={smartstore:'네이버 스마트스토어',login:'로그인',mypage:'마이페이지',privacy:'개인정보처리방침',terms:'이용약관'};show(`<h2>${names[key]||'페이지'} 연결 준비 중</h2><p>시안 검토 단계입니다. 실제 페이지 주소를 연결한 뒤 이용하실 수 있습니다.</p><a class="ns-button" href="${links.kakao}" target="_blank" rel="noopener">카카오톡 문의 ↗</a>`);}
  function external(key){if(links[key]&&/^https?:\/\//.test(links[key]))location.assign(links[key]);else missing(key);}
  function renderCart(){if(links.cart){external('cart');return;}const cartHost=$('#cart-page')||content; const markup=`<h2>장바구니 미리보기</h2><p>담긴 구성은 이 브라우저에만 보관됩니다. 실제 주문·결제는 진행되지 않습니다.</p>${cart.length?cart.map(x=>`<div class="ns-cart-row"><img src="${products[x.id].image}" alt="${products[x.id].alt}"><div><h3>${products[x.id].name}</h3><p>${x.qty}개 · 가격 확인 필요</p></div><button data-remove="${x.id}">삭제</button></div>`).join(''):'<p>아직 담은 상품이 없어요.</p>'}<a class="ns-button" href="${links.kakao}" target="_blank" rel="noopener" style="margin-top:var(--space-lg)">구성·가격 문의 ↗</a>`;if($('#cart-page'))cartHost.innerHTML=markup;else show(markup);cartHost.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{cart=cart.filter(x=>x.id!==Number(b.dataset.remove));syncCart();renderCart();});}
  document.querySelector('.ns-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  document.querySelectorAll('[data-link]').forEach(b=>b.addEventListener('click',()=>external(b.dataset.link)));
  document.querySelectorAll('[data-route]').forEach(a=>{if(links[a.dataset.route])a.href=links[a.dataset.route];});
  document.querySelectorAll('[data-action="cart"]').forEach(b=>b.addEventListener('click',renderCart));
  document.querySelector('[data-action="directions"]')?.addEventListener('click',()=>show(`<h2>찾아오시는 길</h2><p>군산 네이처씨푸드를 지도에서 검색하세요. 방문 전 카카오톡으로 정확한 위치와 방문 가능 여부를 확인해 주세요.</p><a class="ns-button" href="${links.map}" target="_blank" rel="noopener">네이버 지도 검색 ↗</a>`));

  function renderProduct(){
    const host=$('#product-detail');if(!host)return;
    const raw=new URLSearchParams(location.search).get('id');
    const p=raw!==null&&/^\d+$/.test(raw)?products.find(x=>x.id===Number(raw)):null;
    if(!p){host.innerHTML='<h1>상품을 찾을 수 없습니다.</h1><a class="ns-button" href="shop.html">전체상품 보기 ↗</a>';return;}
    document.title=p.name+' — 네이처씨푸드';
    const native=window.NATURE_PRODUCT_URLS?.[p.id];
    host.innerHTML=`<div class="ns-product-breadcrumb"><a href="index.html">HOME</a><span>/</span><a href="shop.html">SHOP</a><span>/</span><span>${p.name}</span></div>
    <div class="ns-product-layout"><div class="ns-product-gallery"><button class="ns-gallery-open" aria-label="상품 이미지 크게 보기"><img src="${p.image}" alt="${p.alt}"></button><p>이미지를 눌러 자세히 살펴보세요.</p></div>
    <div class="ns-product-summary"><span class="ns-eyebrow">NATURESEA FOOD</span><h1>${p.name}</h1><p class="ns-product-lead">${p.description}</p><p class="ns-detail-price">구성·가격 문의</p>
    <dl class="ns-product-facts"><div><dt>판매처</dt><dd>네이처씨푸드</dd></div><div><dt>상품 구성</dt><dd>주문 전 구성과 수량 확인</dd></div><div><dt>배송 안내</dt><dd>판매처에서 배송 일정 확인</dd></div></dl>
    <div class="ns-quantity"><button id="qty-minus" aria-label="수량 줄이기">−</button><output id="qty-value" aria-label="수량">1</output><button id="qty-plus" aria-label="수량 늘리기">+</button></div>
    <div class="ns-purchase-actions"><button id="add-to-cart" class="ns-button ns-button-outline">장바구니 담기 +</button><a class="ns-button" href="${native&&/^https?:\/\//.test(native)?native:links.kakao}" target="_blank" rel="noopener">${native?'상품 구매하기':'판매처에 구매 문의'} ↗</a></div>
    <p id="cart-status" role="status"></p><div class="ns-purchase-channels"><h2>판매·구매처</h2><a href="${links.kakao}" target="_blank" rel="noopener">네이처씨푸드 카카오톡 ↗</a><button type="button" id="product-store">네이버 스마트스토어 ↗</button></div></div></div>
    <nav class="ns-detail-tabs" aria-label="상품 상세 메뉴"><a href="#product-description">상품 설명</a><a href="#product-info">상품 정보</a><a href="qna.html">상품 문의 ↗</a></nav>
    <section class="ns-product-description" id="product-description"><h2>상품 설명</h2><p>${p.description}</p><img src="${p.image}" alt="${p.alt}" loading="lazy"></section>
    <section class="ns-product-description" id="product-info"><h2>상품 정보</h2><p>사진 속 포장 구성을 확인해 주세요. 실제 판매 규격·원산지·가격·보관·배송 조건은 판매처에서 확인하실 수 있습니다.</p><a href="qna.html" class="ns-text-link">상품 문의하기 ↗</a></section>`;
    let qty=1;const update=()=>{$('#qty-value').value=qty;$('#qty-minus').disabled=qty===1;$('#qty-plus').disabled=qty===99;};
    $('#qty-minus').onclick=()=>{qty=Math.max(1,qty-1);update();};$('#qty-plus').onclick=()=>{qty=Math.min(99,qty+1);update();};update();
    $('#add-to-cart').onclick=()=>{const found=cart.find(x=>x.id===p.id);if(found)found.qty=Math.min(99,found.qty+qty);else cart.push({id:p.id,qty});syncCart();$('#cart-status').innerHTML='장바구니에 담았습니다. <a href="cart.html">장바구니 보기 ↗</a>';};
    $('#product-store').onclick=()=>external('smartstore');
    $('.ns-gallery-open').onclick=()=>show(`<img class="ns-lightbox-photo" src="${p.image}" alt="${p.alt}">`);
  }
  let filter=['bakdae','dried'].includes($('#top')?.dataset.page)?$('#top').dataset.page:(new URLSearchParams(location.search).get('category')||'all');
  function applyFilter(){if(!$('#product-search'))return;const term=$('#product-search').value.trim().toLocaleLowerCase();let count=0;document.querySelectorAll('.ns-product').forEach(e=>{const match=(filter==='all'||e.dataset.kind.split(' ').includes(filter))&&e.dataset.name.toLocaleLowerCase().includes(term);e.hidden=!match;if(match)count++;});$('#empty-products').hidden=count>0;$('#product-status').textContent=`상품 ${count}개`;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));}
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;applyFilter();}));
  $('#product-search')?.addEventListener('input',applyFilter);
  document.addEventListener('click',e=>{document.querySelectorAll('.ns-menu[open],.ns-burger[open]').forEach(m=>{if(!m.contains(e.target)||e.target.closest('.ns-menu-panel a,.ns-burger-panel a'))m.open=false;});});
  document.querySelectorAll('.ns-burger-panel a').forEach(a=>{if(a.getAttribute('href')===(location.pathname.split('/').pop()||'index.html'))a.setAttribute('aria-current','page');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.ns-menu[open],.ns-burger[open]').forEach(m=>{m.open=false;m.querySelector('summary').focus();});});
  $('#inquiry-form')?.addEventListener('submit',async e=>{e.preventDefault();const text=`[${$('#inquiry-topic').value}]\n${$('#inquiry-message').value.trim()}`;try{await navigator.clipboard.writeText(text);$('#inquiry-status').textContent='복사했습니다. 카카오톡 채널에 붙여넣어 보내주세요.';}catch{$('#inquiry-message').select();$('#inquiry-status').textContent='자동 복사를 사용할 수 없습니다. 선택된 내용을 직접 복사해 주세요.';}});
  syncCart();applyFilter();if($('#cart-page'))renderCart();
  renderProduct();
})();

/* 1:1 문의 폼 (로컬 미리보기). 실제 접수는 아임웹 입력폼 위젯이 담당하므로 여기서는 어디에도 전송하지 않는다. */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = form.querySelector('#contact-status');
  const label = el => form.querySelector(`label[for="${el.id}"]`)?.firstChild?.textContent.trim() || '필수 항목';
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    const bad = [...form.querySelectorAll('input,select,textarea')].find(el => !el.checkValidity());
    if (bad) {
      bad.setAttribute('aria-invalid', 'true'); bad.focus();
      status.dataset.state = 'error';
      status.textContent = bad.type === 'checkbox' ? '개인정보 수집·이용에 동의해 주세요.' : `${label(bad)}을(를) 확인해 주세요.`;
      return;
    }
    status.dataset.state = 'ok';
    status.textContent = '입력이 확인되었습니다. 미리보기 화면이라 실제로 전송되지는 않았습니다. 아임웹 적용 후에는 아임웹 입력폼으로 접수됩니다.';
  });
})();

