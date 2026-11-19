// Image viewer for every figure that links to a .png: previous/next, counter, zoom, pan, swipe, keyboard, focus trap.
// The set it moves through is the closest [data-viewer-set] container (or the whole page), limited to links that are visible now.
(() => {
  const SEL = 'figure a[href$=".png"]';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let dlg, stage, img, titleEl, countEl, capEl, zoomEl, prevB, nextB, set = [], idx = 0, opener = null;
  let down = null, z = 1, tx = 0, ty = 0, nw = 0, nh = 0, fit = 1, pointers = new Map(), drag = null, pinch = null, swipe = null;
  const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) k === 'text' ? (e.textContent = v) : e.setAttribute(k, v); e.append(...kids); return e; };
  const btn = (label, text, extra = '') => el('button', { type: 'button', class: 'vw-btn ' + extra, 'aria-label': label, title: label, text });

  function build() {
    if (dlg) return;
    titleEl = el('h2', { class: 'vw-title', id: 'vw-title' });
    countEl = el('span', { class: 'vw-count', 'aria-live': 'polite' });
    zoomEl = el('span', { class: 'vw-zoom', 'aria-hidden': 'true' });
    const zin = btn('Zoom in', '+'), zout = btn('Zoom out', '−'), zreset = btn('Reset zoom (fit to window)', 'Fit'), close = btn('Close', 'Close', 'vw-close');
    zin.onclick = () => zoomBy(1.4); zout.onclick = () => zoomBy(1 / 1.4); zreset.onclick = () => { z = 1; tx = ty = 0; apply(); }; close.onclick = () => dlg.close();
    const bar = el('div', { class: 'vw-bar' }, titleEl, countEl, el('span', { class: 'vw-spacer' }), zoomEl, zout, zin, zreset, close);
    img = el('img', { alt: '', draggable: 'false' });
    stage = el('div', { class: 'vw-stage' }, img);
    prevB = btn('Previous image', '‹', 'vw-nav vw-prev'); nextB = btn('Next image', '›', 'vw-nav vw-next');
    prevB.onclick = () => go(-1); nextB.onclick = () => go(1);
    capEl = el('p', { class: 'vw-cap' });
    dlg = el('dialog', { class: 'vw', 'aria-labelledby': 'vw-title' }, bar, el('div', { class: 'vw-main' }, prevB, stage, nextB), capEl);
    document.body.append(dlg);
    dlg.addEventListener('close', () => { document.documentElement.classList.remove('vw-open'); if (opener && document.contains(opener)) opener.focus(); });
    dlg.addEventListener('keydown', onKey);
    stage.addEventListener('wheel', (e) => { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
    stage.addEventListener('pointerdown', onDown); stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp); stage.addEventListener('pointercancel', onUp);
    window.addEventListener('resize', () => { if (dlg.open) { measure(); apply(); } });
    img.addEventListener('load', () => { nw = img.naturalWidth; nh = img.naturalHeight; img.style.width = nw + 'px'; img.style.height = nh + 'px'; measure(); z = 1; tx = ty = 0; apply(); stage.classList.remove('vw-loading'); });
  }
  function measure() { const r = stage.getBoundingClientRect(); fit = Math.min(r.width / (nw || 1), r.height / (nh || 1)); }
  function clamp() {
    const r = stage.getBoundingClientRect(), s = fit * z;
    const mx = Math.max(0, (nw * s - r.width) / 2), my = Math.max(0, (nh * s - r.height) / 2);
    tx = Math.min(mx, Math.max(-mx, tx)); ty = Math.min(my, Math.max(-my, ty));
  }
  function apply() { clamp(); img.style.transform = `translate(-50%,-50%) translate(${tx}px,${ty}px) scale(${fit * z})`; zoomEl.textContent = Math.round(fit * z * (window.devicePixelRatio || 1) * 100) + '%'; stage.classList.toggle('vw-zoomed', z > 1.01); }
  function zoomTo(nz, cx, cy) {
    nz = Math.min(8, Math.max(1, nz));
    const r = stage.getBoundingClientRect();
    if (cx != null) { const px = cx - (r.left + r.width / 2), py = cy - (r.top + r.height / 2), k = nz / z; tx = px - (px - tx) * k; ty = py - (py - ty) * k; }
    z = nz; if (z === 1) tx = ty = 0; apply();
  }
  const zoomBy = (k, cx, cy) => zoomTo(z * k, cx, cy);
  const MOVE = 5; // pixels: less than this is a click, more is a drag
  let moved = false, multi = false;
  function toggleZoom(cx, cy) { if (z > 1.02) { z = 1; tx = ty = 0; apply(); } else { zoomTo(Math.max(1 / (window.devicePixelRatio || 1) / fit, 1.8), cx, cy); } }
  function onDown(e) {
    if (e.button) return;
    stage.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) { moved = false; multi = false; down = { x: e.clientX, y: e.clientY }; } else multi = true;
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z }; drag = null; swipe = null; }
    else if (z > 1.01) { drag = { x: e.clientX, y: e.clientY, tx, ty }; }
    else swipe = { x: e.clientX, y: e.clientY, t: Date.now() };
  }
  function onMove(e) {
    if (!pointers.has(e.pointerId)) return; pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()]; zoomTo(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, (a.x + b.x) / 2, (a.y + b.y) / 2); }
    else if (drag) { if (!moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > MOVE) { moved = true; stage.classList.add('vw-grab'); } if (moved) { tx = drag.tx + e.clientX - drag.x; ty = drag.ty + e.clientY - drag.y; apply(); } }
  }
  function onUp(e) {
    const had = pointers.has(e.pointerId); pointers.delete(e.pointerId); stage.classList.remove('vw-grab');
    if (swipe && pointers.size === 0) { const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - swipe.t < 700) { go(dx < 0 ? 1 : -1); swipe = null; moved = true; } }
    if (had && e.type === 'pointerup' && !multi && !moved && pointers.size === 0 && down && Math.hypot(e.clientX - down.x, e.clientY - down.y) <= MOVE) {
      const r = img.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close(); // the dark area around the image
      else if (e.pointerType !== 'touch') toggleZoom(e.clientX, e.clientY); // touch: pinch to zoom, drag to pan, swipe for next/previous; a tap does nothing
    }
    if (!pointers.size) { multi = false; down = null; }
    swipe = null; if (pointers.size < 2) pinch = null; if (!pointers.size) drag = null;
  }
  function onKey(e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(1.4); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(1 / 1.4); }
    else if (e.key === '0') { e.preventDefault(); z = 1; tx = ty = 0; apply(); }
    else if (e.key === 'Tab') { // keep focus inside the dialog
      const f = [...dlg.querySelectorAll('button:not([disabled])')]; if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  const infoOf = (a) => { const fig = a.closest('figure'), cap = fig && fig.querySelector('figcaption'), im = a.querySelector('img'); const strong = cap && cap.querySelector('strong'); if (a.dataset.name) return { href: a.href, alt: im ? im.alt : '', title: a.dataset.name, cap: a.dataset.desc || '' }; return { href: a.href, alt: im ? im.alt : '', title: (strong || cap || { textContent: im ? im.alt : '' }).textContent.trim(), cap: cap ? cap.textContent.trim() : '' }; };
  function show(i) {
    idx = (i + set.length) % set.length; const it = infoOf(set[idx]);
    stage.classList.add('vw-loading'); img.alt = it.alt; img.src = it.href;
    titleEl.textContent = it.title; capEl.textContent = it.alt && it.alt !== it.title ? it.alt : it.cap;
    countEl.textContent = `${idx + 1} / ${set.length}`;
    const many = set.length > 1; prevB.hidden = nextB.hidden = !many;
    for (const d of [1, -1]) { if (many) new Image().src = infoOf(set[(idx + d + set.length) % set.length]).href; } // preload the neighbours
  }
  const go = (d) => { if (set.length > 1) show(idx + d); };
  function open(a) {
    build(); opener = a;
    const root = a.closest('[data-viewer-set]') || document;
    set = [...root.querySelectorAll(SEL)].filter((x) => x.getClientRects().length);
    if (!set.includes(a)) set.push(a);
    document.documentElement.classList.add('vw-open'); dlg.showModal(); show(set.indexOf(a));
    dlg.querySelector('.vw-close').focus();
  }
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest(SEL); if (!a) return;
    e.preventDefault(); open(a);
  });
  document.addEventListener('click', (e) => { if (dlg && e.target === dlg) dlg.close(); });
  void reduce;
})();
