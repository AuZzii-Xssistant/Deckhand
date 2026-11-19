/* Phone version of the Deckhand animation: the same scenes, redrawn for a tall frame so text and files stay readable.
   Shown instead of the wide version on narrow screens. Plays only while on screen; the 22 s timeline loops. */
(function () {
  var canvas = document.getElementById('demo-m');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d', { alpha: false }); ctx.textRendering = 'geometricPrecision'; ctx.imageSmoothingQuality = 'high';
  var c = ctx, SS = 1, logo = new Image(), ready = false, cache = {}, cK = 0, DUR = 22;
  function sprite(key, x, y, w, h, fn, dens) {
    if (cK !== SS) { cache = {}; cK = SS; }
    var k = key, s = cache[k];
    if (!s) { var d = Math.min(4, SS * 2 * (dens || 1)); s = document.createElement('canvas'); s.width = Math.ceil(w * d); s.height = Math.ceil(h * d);
      var o = s.getContext('2d'); o.textRendering = 'geometricPrecision'; o.scale(d, d); o.translate(-x, -y);
      var m = c; c = o; try { fn(); } finally { c = m; } cache[k] = s; }
    return s;
  }
  function blit(key, x, y, w, h, fn, dens) { c.drawImage(sprite(key, x, y, w, h, fn, dens), x, y, w, h); }
  function cargoSprite(x, y, label, col, sc) { var sp = sprite('c' + label, -80, -35, 160, 70, function () { cargo(0, 0, label, col, 1); }, 3); c.save(); c.translate(x, y); c.scale(sc, sc); c.drawImage(sp, -80, -35, 160, 70); c.restore(); }
  const C = { bg: '#071923', panel: '#0e2b3a', ink: '#e5f4f5', muted: '#8eb0c0', teal: '#36c6bc', gold: '#eab96a', blue: '#73aef2' };
  const clamp = x => Math.max(0, Math.min(1, x)); const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const FONT = '"Segoe UI", system-ui, sans-serif';
  function box(x, y, w, h, r, fill, stroke, lw = 1) { c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } }
  function text(s, x, y, size, color, weight = 400, align = 'left') { c.font = `${weight} ${size}px ${FONT}`; c.textAlign = align; c.fillStyle = color; c.fillText(s, x, y); }
  function line(pts, color, w = 2) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.strokeStyle = color; c.lineWidth = w; c.stroke(); }
  function wrap(s, size, weight, maxW) { c.font = `${weight} ${size}px ${FONT}`; const words = s.split(' '), lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); return lines; }
  function cargo(x, y, label, color, scale = 1) { c.save(); c.translate(x, y); c.scale(scale, scale); c.shadowColor = '#00000066'; c.shadowBlur = 12; c.shadowOffsetY = 5; box(-65, -20, 130, 40, 6, C.panel, color, 1.4); c.shadowBlur = 0; c.shadowOffsetY = 0; box(-53, -10, 16, 20, 2, color); line([[-49, -5], [-41, -5]], C.bg, 1); line([[-49, 0], [-41, 0]], C.bg, 1); text(label, -28, 5, 13, C.ink, 600); c.restore(); }
  const files = [{ name: 'invoice.pdf', col: C.gold, to: 0 }, { name: 'holiday.jpg', col: C.teal, to: 1 }, { name: 'clip.mp4', col: C.blue, to: 2 }, { name: 'receipt.pdf', col: C.gold, to: 0 }, { name: 'portrait.png', col: C.teal, to: 1 }, { name: 'launch.mp4', col: C.blue, to: 2 }];
  const bins = [{ label: 'Invoices', path: 'Documents / Invoices', color: C.gold }, { label: 'Photos', path: 'Pictures / Sorted', color: C.teal }, { label: 'Videos', path: 'Videos / Sorted', color: C.blue }];
  const STEP = .55, TRAVEL = 1.15, T0 = 8;
  const titles = ['Less sorting. More getting things done.', 'You set the rules.', 'Deckhand handles the cargo.', 'A place for every file.'];
  const subs = ['Turn a crowded Downloads folder into a workflow.', 'Match the file. Choose its destination. Check before you run.', 'Deckhand follows your rules and sends each file to its destination.', 'Preview first. Automate when you\u2019re ready.'];
  const FORMATS_ALL = [
    { n: '9x16-1080x1920-Reels-Stories-TikTok', W: 1080, H: 1920, hy: 86, ls: 84, hf: 46, sf: 26, tf: 70, sbf: 36, ty: 270, ss: 1.75, wl: 1030, busY: 1265, binTop: 1335, binH: 270, binF: 38, statusY: 1770, statusH: 84, stF: 32, prevY: 1056, prevH: 246, prevF: 38, mode: 'list' },
    { n: '4x5-1080x1350-Instagram-Facebook-feed', W: 1080, H: 1350, hy: 66, ls: 66, hf: 38, sf: 22, tf: 56, sbf: 30, ty: 205, ss: 1.55, wl: 730, busY: 905, binTop: 950, binH: 215, binF: 34, statusY: 1245, statusH: 72, stF: 28, prevY: 760, prevH: 112, prevF: 28, mode: 'line' },
    { n: '1x1-1080x1080-square-Reddit-Facebook', W: 1080, H: 1080, hy: 54, ls: 58, hf: 34, sf: 20, tf: 48, sbf: 26, ty: 160, ss: 1.45, wl: 600, busY: 745, binTop: 785, binH: 175, binF: 30, statusY: 990, statusH: 60, stF: 24, prevY: 632, prevH: 100, prevF: 24, mode: 'line' },
  ];
  const F45 = FORMATS_ALL[1];
  function frame(F, t) {
    const W = F.W, H = F.H, ss = F.ss;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W * SS, H * SS); c.scale(SS, SS);
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0c2838'); g.addColorStop(1, C.bg); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const gl = c.createRadialGradient(W * .35, H * .3, 20, W * .35, H * .3, W * 1.1); gl.addColorStop(0, '#1a4b5b66'); gl.addColorStop(1, '#07192300'); c.fillStyle = gl; c.fillRect(0, 0, W, H);
    // header
    c.save(); c.translate(50 + F.ls / 2, F.hy); c.rotate(Math.sin(t * .8) * .045); c.drawImage(logo, -F.ls / 2, -F.ls / 2, F.ls, F.ls); c.restore();
    text('Deckhand', 50 + F.ls + 16, F.hy + F.hf * .33, F.hf, C.ink, 650); text('Put your files to work.', W - 44, F.hy + F.sf * .35, F.sf, C.muted, 400, 'right');
    // title block
    const phase = t < 4 ? 0 : t < 8 ? 1 : t < 12.6 ? 2 : 3;
    const ps = [0, 4, 8, 12.6][phase], pe = [4, 8, 12.6, 16.2][phase];
    const inP = ease((t - ps) / 1.4), a = inP * (1 - ease((t - (pe - .9)) / .8));
    c.save(); c.globalAlpha = a; c.translate(0, 18 * (1 - inP));
    const tl = wrap(titles[phase], F.tf, 650, W - 100);
    const sb = wrap(subs[phase], F.sbf, 400, W - 100); const sy = F.ty + (tl.length - 1) * F.tf * 1.14 + F.sbf * 1.5; blit('h' + phase, 0, F.ty - F.tf, W, (tl.length - 1) * F.tf * 1.14 + F.tf + F.sbf * 1.5 + sb.length * F.sbf * 1.3 + 24, () => { tl.forEach((l, i) => text(l, 50, F.ty + i * F.tf * 1.14, F.tf, C.ink, 650)); sb.forEach((l, i) => text(l, 52, sy + i * F.sbf * 1.3, F.sbf, C.muted)); });
    c.restore();
    // sea
    const seaY = F.wl + 5 * ss; c.fillStyle = '#12323f'; c.fillRect(0, seaY, W, H - seaY);
    for (let r = 0; ; r++) { const base = seaY + 24 * ss + r * 34 * ss * .75; if (base > H) break; c.beginPath(); for (let x = 0; x <= W; x += 6) { const y = base + Math.sin(x / (72 * ss) + t * .8 + r) * 5; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.strokeStyle = r % 2 ? '#22505b' : '#1c414f'; c.lineWidth = 2; c.stroke(); }
    // dock + bins
    const pad = 36, gap = 22, bw = (W - 2 * pad - 2 * gap) / 3;
    const dockIn = ease((t - 1.2) / 1); c.save(); c.globalAlpha = dockIn;
    box(24, F.binTop - 26, W - 48, F.binH + 52, 14, '#0b202a', '#254553', 2);
    for (let x = 70; x < W - 40; x += 110) line([[x, F.binTop + F.binH + 26], [x, F.binTop + F.binH + 70]], '#254553', 12);
    const sorted = i => files.filter((f, k) => f.to === i && t >= T0 + k * STEP + TRAVEL).length;
    bins.forEach((b, i) => {
      const x = pad + i * (bw + gap), y = F.binTop, h = F.binH;
      box(x, y, bw, h, 10, '#123343', b.color, 2.5);
      c.save(); c.globalAlpha *= .18; for (let sx = 18; sx < bw - 8; sx += 20) line([[x + sx, y + 10], [x + sx, y + h - 10]], b.color, 2); c.restore();
      box(x + 14, y + 14, bw - 28, F.binF * 1.7, 6, C.bg);
      text(b.label, x + 28, y + 14 + F.binF * 1.2, F.binF, C.ink, 650);
      text(String(sorted(i)).padStart(2, '0'), x + bw - 28, y + 14 + F.binF * 1.2, F.binF, b.color, 650, 'right');
      text(b.path, x + 18, y + h - 20, F.binF * .56, C.muted);
      files.forEach((f, k) => { if (f.to !== i) return; const age = t - (T0 + k * STEP + TRAVEL); if (age >= 0 && age < .7) { c.save(); c.globalAlpha = (1 - age / .7) * .7; c.shadowColor = b.color; c.shadowBlur = 24; box(x - age * 6, y - age * 6, bw + age * 12, h + age * 12, 10, null, b.color, 3); c.restore(); } });
    }); c.restore();
    // ship (local coordinates of the video ship, scaled)
    const bob = Math.sin(t * .85) * 1.5;
    c.save(); c.translate(W / 2, F.wl + bob * ss); c.scale(ss, ss); c.translate(-363, -547);
    blit('ship', 60, 300, 620, 260, () => { const hull = c.createLinearGradient(0, 461, 0, 550); hull.addColorStop(0, '#3b6475'); hull.addColorStop(.16, '#264d61'); hull.addColorStop(1, '#102937'); c.fillStyle = hull; c.beginPath(); c.moveTo(76, 461); c.quadraticCurveTo(300, 470, 650, 457); c.lineTo(619, 509); c.quadraticCurveTo(602, 540, 574, 547); c.lineTo(178, 547); c.quadraticCurveTo(135, 535, 76, 461); c.closePath(); c.fill();
    line([[89, 468], [640, 465]], '#86b3bd', 2); line([[151, 526], [607, 526]], '#315e70', 1);
    for (let x = 228; x < 586; x += 52) { c.beginPath(); c.arc(x, 488, 4, 0, Math.PI * 2); c.fillStyle = '#071e2a'; c.fill(); c.strokeStyle = '#577e8e'; c.lineWidth = 1; c.stroke(); }
    line([[92, 453], [635, 453]], '#557e8e', 2); for (let x = 226; x < 635; x += 41) line([[x, 453], [x, 465]], '#557e8e', 1);
    box(101, 453, 22, 10, 2, '#466b7d'); box(600, 453, 20, 10, 2, '#466b7d');
    line([[94, 481], [629, 481]], C.teal, 3); line([[158, 532], [607, 532]], '#25556a', 2);
    const bridge = c.createLinearGradient(110, 0, 204, 0); bridge.addColorStop(0, '#d2e0db'); bridge.addColorStop(1, '#8fa9ad'); box(118, 400, 80, 65, 3, bridge); box(108, 393, 101, 12, 2, '#6a929e'); box(134, 363, 46, 30, 3, '#31576b'); box(142, 369, 30, 10, 2, '#8fb4bd'); line([[116, 403], [202, 403]], '#eef3e7', 1); box(176, 438, 12, 27, 1, '#4b7480');
    for (let x = 130; x < 190; x += 22) { box(x, 414, 14, 15, 2, '#183b50'); line([[x + 2, 416], [x + 11, 416]], '#8eb7c5', 1); } line([[145, 363], [145, 319]], C.muted, 2); c.fillStyle = C.teal; c.beginPath(); c.moveTo(146, 320); c.lineTo(179, 327); c.lineTo(146, 336); c.fill();
    text('DECKHAND', 230, 513, 18, '#d6eced', 650); text('Downloads', 489, 512, 16, C.muted, 400, 'center'); }, F.ss);
    // anchor + bubbles
    const drop = ease((t - .6) / 1.6) * 40, ay = 506 + drop; line([[617, 480], [617, ay - 4]], C.muted, 1.6);
    c.save(); c.translate(617, ay); c.rotate(Math.sin(t * 1.1) * .06); c.scale(.62, .62); c.strokeStyle = C.muted; c.lineWidth = 4.5; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.arc(0, 0, 6, 0, Math.PI * 2); c.moveTo(0, 6); c.lineTo(0, 48); c.moveTo(-14, 16); c.lineTo(14, 16); c.moveTo(-22, 36); c.quadraticCurveTo(-20, 52, 0, 54); c.quadraticCurveTo(20, 52, 22, 36); c.moveTo(-28, 42); c.lineTo(-22, 34); c.lineTo(-14, 40); c.moveTo(28, 42); c.lineTo(22, 34); c.lineTo(14, 40); c.stroke(); c.restore();
    if (t > 1.8) for (let b = 0; b < 4; b++) { const ph = (t * .28 + b * .25) % 1; const bx = 617 + (b % 2 ? 12 : -12) + Math.sin(t * 2 + b * 2) * 3, by = ay + 30 - ph * 58; c.save(); c.globalAlpha = Math.sin(Math.PI * ph) * .85 * ease((t - 1.8) / .6); c.strokeStyle = C.teal; c.lineWidth = 1.3; c.beginPath(); c.arc(bx, by, 2 + (b % 3) * .8, 0, Math.PI * 2); c.stroke(); c.restore(); }
    // cargo on deck (those not yet picked up)
    files.forEach((f, k) => { const x = 290 + (k % 3) * 138, y = 441 - Math.floor(k / 3) * 47; const op = (t < T0 + k * STEP ? 1 : 0) * ease((t - .5 - k * .14) / .7); if (op <= 0) return; c.save(); c.globalAlpha = op; cargoSprite(x, y, f.name, f.col, .94); c.restore(); });
    c.restore();
    // route tree (after the preview card) and moving cards
    const binX = i => pad + i * (bw + gap) + bw / 2, S = [W / 2, F.wl + 8 * ss];
    const route = (k) => { const f = files[k], x = 290 + (k % 3) * 138, y = 441 - Math.floor(k / 3) * 47; const P0 = [W / 2 + (x - 363) * ss, F.wl + (y - 547) * ss]; return [P0, S, [W / 2, F.busY], [binX(f.to), F.busY], [binX(f.to), F.binTop - 2]]; };
    if (t >= 7.7) {
      const op = ease((t - 7.7) / .7); c.save(); c.globalAlpha = op * .75;
      line([S, [W / 2, F.busY], [binX(2), F.busY]], '#3c6475', 3); line([[W / 2, F.busY], [binX(0), F.busY]], '#3c6475', 3); for (let i = 0; i < 3; i++) line([[binX(i), F.busY], [binX(i), F.binTop - 2]], '#3c6475', 3); c.restore();
      for (let k = 0; k < files.length; k++) {
        const f = files[k], p = clamp((t - (T0 + k * STEP)) / TRAVEL); if (p <= 0 || p >= 1) continue;
        const pts = route(k), len = pts.slice(1).map((v, i) => Math.hypot(v[0] - pts[i][0], v[1] - pts[i][1])); let d = ease(p) * len.reduce((x, y) => x + y, 0), pos = pts[0];
        for (let i = 0; i < len.length; i++) { if (d <= len[i]) { const q = d / len[i]; pos = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * q, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * q]; break; } d -= len[i]; }
        c.save(); c.shadowColor = f.col; c.shadowBlur = 26; cargoSprite(pos[0], pos[1], f.name, f.col, ss * .94 + .35); c.restore();
      }
    }
    // preview card
    if (t >= 3.8 && t < 8) {
      const op = ease((t - 3.8) / .5) * (1 - ease((t - 7.6) / .4)); c.save(); c.globalAlpha = op;
      box(40, F.prevY, W - 80, F.prevH, 16, C.panel, '#31515f', 2);
      text('PREVIEW', 70, F.prevY + 40, 24, C.teal, 650);
      if (F.mode === 'list') { ['PDFs \u2192 Invoices', 'Images \u2192 Photos', 'Video \u2192 Videos'].forEach((s, i) => text(s, 70, F.prevY + 86 + i * 44, F.prevF, C.ink, 600)); text('6 files checked', W - 70, F.prevY + F.prevH - 22, 26, C.muted, 400, 'right'); text('Nothing changed yet', 70, F.prevY + F.prevH - 22, 26, C.gold); }
      else { const l = wrap('PDFs \u2192 Invoices  \u00b7  Images \u2192 Photos  \u00b7  Video \u2192 Videos', F.prevF, 600, W - 140); l.forEach((s, i) => text(s, 70, F.prevY + 44 + F.prevF * 1.2 + i * F.prevF * 1.25, F.prevF, C.ink, 600)); }
      c.restore();
    }
    // status ribbon
    const done = files.filter((f, k) => t >= T0 + k * STEP + TRAVEL).length;
    box(36, F.statusY, W - 72, F.statusH, 12, '#0c2633', '#2b4956', 2);
    c.beginPath(); c.arc(70, F.statusY + F.statusH / 2, 7, 0, Math.PI * 2); c.fillStyle = phase < 2 ? C.gold : C.teal; c.fill();
    text(phase === 0 ? 'Watch folder selected' : phase === 1 ? 'Preview ready \u00b7 6 files would move' : done < 6 ? `Organising cargo \u00b7 ${done} of 6 files moved` : 'All cargo sorted \u00b7 6 files moved', 96, F.statusY + F.statusH / 2 + F.stF * .35, F.stF, C.ink, 500);
    // closing screen
    if (t >= 16) {
      const fade = ease((t - 16) / 1); c.save(); c.globalAlpha = fade;
      const cg = c.createLinearGradient(0, 0, W, H); cg.addColorStop(0, '#102f40'); cg.addColorStop(1, C.bg); c.fillStyle = cg; c.fillRect(0, 0, W, H);
      const lift = ease((t - 16.4) / .9); c.translate(0, 16 * (1 - lift));
      blit('close', 0, 0, W, H * .8, () => { const ls = Math.round(W * .26), cy = H * .36; c.drawImage(logo, W / 2 - ls / 2, cy - ls / 2, ls, ls);
      text('Deckhand', W / 2, cy + ls / 2 + W * .12, W * .12, C.ink, 650, 'center'); text('Put your files to work.', W / 2, cy + ls / 2 + W * .12 + W * .09, W * .068, C.teal, 500, 'center');
      wrap('Preview your rules. Let Deckhand take it from there.', W * .04, 400, W - 160).forEach((l, i) => text(l, W / 2, cy + ls / 2 + W * .12 + W * .09 + W * .075 + i * W * .052, W * .04, C.muted, 400, 'center'));
      }); for (let r = 0; r < 3; r++) { c.beginPath(); for (let x = 0; x <= W; x += 6) { const y = H * .86 + r * 34 + Math.sin(x / 120 + t * .6 + r) * 7; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.strokeStyle = '#245363'; c.lineWidth = 2; c.stroke(); }
      c.restore();
    }
    const v = t > 21.2 ? (t - 21.2) / .8 : t < .7 ? 1 - t / .7 : 0; if (v > 0) { c.save(); c.globalAlpha = Math.min(1, v); c.fillStyle = C.bg; c.fillRect(0, 0, W, H); c.restore(); }
  }
  
  function fit() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(540, Math.min(1620, Math.round(canvas.clientWidth * dpr)));
    if (canvas.width !== w) { canvas.width = w; canvas.height = Math.round(w * 1.25); ctx.textRendering = 'geometricPrecision'; ctx.imageSmoothingQuality = 'high'; }
    SS = canvas.width / 1080; c = ctx;
  }
  var raf = 0, t0 = 0, inView = false;
  function loop(now) { raf = requestAnimationFrame(loop); c = ctx; frame(F45, ((now - t0) / 1000) % DUR); }
  function start() { if (raf || !ready) return; fit(); t0 = performance.now(); raf = requestAnimationFrame(loop); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  logo.onload = function () {
    ready = true; fit(); frame(F45, 10);
    if (reduce || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) { es.forEach(function (e) { inView = e.isIntersecting; if (inView && !document.hidden) start(); else stop(); }); }, { threshold: 0.3 }).observe(canvas);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (inView) start(); });
    window.addEventListener('resize', function () { fit(); if (!raf) frame(F45, 10); });
  };
  logo.src = 'deckhand-mark.svg';
})();
