/* Enhance ONLY the configured native shop widgets. No product records or fetches.
 * Keep original nodes, links, listeners, IDs and iMweb's product/analytics ownership.
 * Home flow (all widths — PC, tablet, phone, incl. landscape — same speed/direction, see NATURE_IMWEB_SET.shopFlow):
 * each card travels right at one slot / flow.millisecondsPerCard (2026-10-02 H1: 3600ms); the wrap is offscreen.
 * When the row is wider than the 5 originals can cover (PC shows 5), decorative copies are appended
 * (aria-hidden, inert, no ids) so the line never shows a gap; they are removed when the flow stops.
 */
(() => {
  'use strict';
  if (window.NatureNativeShop) return;
  const states = new Map();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  function stop(state) {
    state.animations.forEach(a => a.cancel());
    state.animations = [];
    state.row?.querySelectorAll(':scope>.n2j-shop-clone').forEach(e => e.remove());
    state.row?.classList.remove('n2j-shop-flow');
  }
  function copy(card) {
    const c = card.cloneNode(true);
    c.classList.add('n2j-shop-clone');
    c.setAttribute('aria-hidden', 'true');
    c.inert = true;
    [c, ...c.querySelectorAll('[id]')].forEach(e => e.removeAttribute('id'));
    c.querySelectorAll('img').forEach(i => { i.loading = 'eager'; });
    c.querySelectorAll('a,button,[tabindex]').forEach(e => e.setAttribute('tabindex', '-1'));
    return c;
  }
  function update(widget, state) {
    const config = window.NATURE_IMWEB_SET || {};
    const flow = config.shopFlow || {};
    const row = widget.querySelector('._item_wrap');
    const cards = row ? [...row.children].filter(e => e.matches('._shop_item:not(.n2j-shop-clone)')) : [];
    // Native theme sections are often max-width constrained. Break out this widget only.
    const viewport = document.documentElement.clientWidth;
    widget.style.width = viewport + 'px';
    widget.style.marginLeft = '0px';
    widget.style.marginLeft = -widget.getBoundingClientRect().left + 'px';
    cards.forEach(card => {
      const title = card.querySelector('.shop-title')?.textContent.trim();
      const img = card.querySelector('.shop-item-thumb img');
      if (img && !img.alt && title) img.alt = title;
      const detail = card.querySelector('.item-pay-detail');
      if (!detail) return;
      const price = [...detail.querySelectorAll('.pay')].map(e => e.textContent.trim()).join('');
      const numeric = /\d/.test(price);
      if (/^(가격\s*)?문의$/.test(price)) detail.querySelectorAll('.pay').forEach(e => { if (e.textContent !== '가격 문의') e.textContent = '가격 문의'; });
      const label = detail.querySelector('.n2j-price-inquiry');
      if (numeric || price) { label?.remove(); return; }
      if (!label) { const p = document.createElement('p'); p.className = 'n2j-price-inquiry'; p.textContent = '가격 문의'; detail.append(p); }
    });
    const enabled = widget.id === flow.widgetId && (!flow.maxWidth || innerWidth <= flow.maxWidth) && !reduced.matches && cards.length >= 3 && typeof Element.prototype.animate === 'function';
    const key = [viewport, enabled, cards.length, flow.millisecondsPerCard].join(':');
    if (state.key === key && state.row === row && cards.every((c,i) => c === state.cards[i])) return;
    stop(state); state.key = key; state.row = row; state.cards = cards;
    const duration = Number(flow.millisecondsPerCard) || 800;
    widget.dataset.shopFlow = enabled ? 'right-' + duration + 'ms' : reduced.matches ? 'reduced-motion' : 'grid';
    if (!enabled) return;
    row.classList.add('n2j-shop-flow');
    const step = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(row).columnGap);
    // A card jumps from the right end back to -1 slot; the band must reach past the visible row.
    const items = [...cards];
    while (step > 0 && items.length < cards.length * 4 && (items.length - 1) * step < row.clientWidth) cards.forEach(card => items.push(row.appendChild(copy(card))));
    items.forEach((card, i) => {
      const animation = card.animate([
        {transform:`translateX(${-step * (i + 1)}px)`},
        {transform:`translateX(${step * (items.length - i - 1)}px)`}
      ], {duration: items.length * duration, iterations: Infinity, easing: 'linear'});
      animation.currentTime = (i + 1) * duration;
      state.animations.push(animation);
    });
  }
  function mount() {
    const ids = Object.values(window.NATURE_IMWEB_SET?.shopWidgets || {});
    for (const [widget, state] of states) if (!widget.isConnected || !ids.includes(widget.id)) { stop(state); states.delete(widget); }
    ids.forEach(id => {
      const widget = document.getElementById(id);
      if (!widget) return;
      if (!states.has(widget)) states.set(widget, {animations:[], cards:[]});
      update(widget, states.get(widget));
    });
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(() => { scheduled = false; mount(); }); } }
  new MutationObserver(schedule).observe(document.documentElement, {childList:true, subtree:true, characterData:true});
  addEventListener('resize', schedule, {passive:true});
  addEventListener('load', schedule, {once:true});
  document.addEventListener('DOMContentLoaded', schedule, {once:true});
  reduced.addEventListener('change', schedule);
  let tries=0;const retry=setInterval(()=>{schedule();if(++tries===20)clearInterval(retry);},250);
  window.NatureNativeShop = {mount: schedule};
  schedule();
})();
