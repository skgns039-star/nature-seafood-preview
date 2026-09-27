/* 실제 아임웹 페이지 URL과 공개 채널 주소를 확인한 뒤 채웁니다. */
window.NATURE_LINKS = {
  home: '', shop: '', bakdae: '', dried: '', popular: '', new: '', support: '', cart: '', login: '', mypage: '', inquiry: '', contact: '',
  privacy: '', terms: '', smartstore: '', instagram: '', blog: '',
  kakao: 'https://pf.kakao.com/_xfxosrX/chat',
  channel: 'https://pf.kakao.com/_xfxosrX',
  map: 'https://map.naver.com/p/search/%EA%B5%B0%EC%82%B0%20%EB%84%A4%EC%9D%B4%EC%B2%98%EC%94%A8%ED%91%B8%EB%93%9C'
};
/* 로컬 시안 상품 → 실제 아임웹 상품 상세 URL. 실제 주소를 확인한 경우에만 입력합니다. */
window.NATURE_PRODUCT_URLS = {};

/* 위젯 DOM ID를 한 곳에서 지정합니다. 네이티브 상품 데이터·구매 처리는 아임웹이 담당합니다. */
/* inquiry = 아임웹 "입력폼" 위젯 DOM ID (1:1 문의). NATURE_LINKS.contact = 입력폼이 있는 '1:1 문의하기' 페이지 주소. */
window.NATURE_WIDGET_IDS = {shop: "", inquiry: "", detail: ""};
