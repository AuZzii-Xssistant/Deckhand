// Deckhand docs behaviour: theme toggle, mobile menu, search, copy buttons, heading links, "On this page" highlight.
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  // ----- theme -----
  var themeBtn = $('.theme-btn');
  function effectiveTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function syncThemeBtn() {
    var dark = effectiveTheme() === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
    themeBtn.setAttribute('aria-pressed', String(dark));
    var s = themeBtn.querySelector('span'); if (s) s.textContent = dark ? 'Dark' : 'Light';
  }
  themeBtn.addEventListener('click', function () {
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('deckhand-docs-theme', next); } catch (e) { /* ignore */ }
    syncThemeBtn();
  });
  syncThemeBtn();

  // ----- mobile menu -----
  var menuBtn = $('.menu-btn');
  var sidebar = $('#sidebar');
  var scrim = $('.scrim');
  function setMenu(open) {
    doc.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    scrim.hidden = !open;
    if (open) { var a = $('a[aria-current="page"]', sidebar) || $('a', sidebar); if (a) a.focus(); }
  }
  menuBtn.addEventListener('click', function () { setMenu(!doc.body.classList.contains('menu-open')); });
  scrim.addEventListener('click', function () { setMenu(false); menuBtn.focus(); });
  sidebar.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && doc.body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
  });
  var current = $('a[aria-current="page"]', sidebar);
  if (current) { var cr = current.getBoundingClientRect(); if (cr.bottom > window.innerHeight - 40 && window.innerWidth > 900) sidebar.scrollTop = current.offsetTop - 120; }

  // ----- copy helpers -----
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var ta = doc.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      doc.body.appendChild(ta); ta.select();
      try { if (doc.execCommand('copy')) resolve(); else reject(new Error('copy failed')); } catch (e) { reject(e); } finally { doc.body.removeChild(ta); }
    });
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  var live = doc.createElement('div');
  live.className = 'visually-hidden'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite');
  doc.body.appendChild(live);
  function announce(msg) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 20); }

  $$('.code').forEach(function (box) {
    var b = doc.createElement('button');
    b.type = 'button'; b.className = 'copy-btn'; b.textContent = 'Copy';
    b.setAttribute('aria-label', 'Copy code to clipboard');
    b.addEventListener('click', function () {
      var code = $('code', box).textContent;
      copyText(code).then(function () { b.textContent = 'Copied'; announce('Code copied'); }, function () { b.textContent = 'Press Ctrl+C'; })
        .then(function () { setTimeout(function () { b.textContent = 'Copy'; }, 1800); });
    });
    box.appendChild(b);
  });

  $$('a.hlink').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var hash = a.getAttribute('href');
      var url = location.href.split('#')[0] + hash;
      history.replaceState(null, '', hash);
      var target = doc.getElementById(hash.slice(1));
      if (target) target.scrollIntoView();
      copyText(url).then(function () { announce('Link copied'); a.classList.add('done'); setTimeout(function () { a.classList.remove('done'); }, 1500); }, function () { /* the address bar now holds the link */ });
    });
  });

  // ----- On this page: highlight the section being read -----
  var tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var active = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (active) active.removeAttribute('aria-current');
          active = map[en.target.id];
          if (active) active.setAttribute('aria-current', 'location');
        }
      });
    }, { rootMargin: '-72px 0px -70% 0px' });
    $$('.doc h2[id], .doc h3[id]').forEach(function (h) { io.observe(h); });
  }

  // ----- search -----
  var input = $('#search-input');
  var list = $('#search-results');
  var items = [];
  var sel = -1;
  function words(s) { return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean); }
  function search(q) {
    var toks = words(q);
    if (!toks.length || !window.DECKHAND_DOCS_INDEX) return [];
    var out = [];
    window.DECKHAND_DOCS_INDEX.forEach(function (e) {
      var h = e.heading.toLowerCase(), p = e.page.toLowerCase(), t = e.text.toLowerCase();
      var score = 0;
      for (var i = 0; i < toks.length; i++) {
        var w = toks[i], s = 0;
        if (h.indexOf(w) >= 0) s += 8 + (h.indexOf(w) === 0 ? 2 : 0);
        if (p.indexOf(w) >= 0) s += 4;
        if (t.indexOf(w) >= 0) s += 1;
        if (!s) return;
        score += s;
      }
      if (h.indexOf(q.toLowerCase().trim()) >= 0) score += 6;
      out.push({ e: e, score: score });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 8).map(function (x) { return x.e; });
  }
  function snippet(e, toks) {
    var t = e.text;
    if (!t) return '';
    var low = t.toLowerCase(), at = -1;
    for (var i = 0; i < toks.length && at < 0; i++) at = low.indexOf(toks[i]);
    var start = Math.max(0, at - 30);
    return (start ? '… ' : '') + t.slice(start, start + 110) + (t.length > start + 110 ? ' …' : '');
  }
  function hide() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
  function show(results, q) {
    list.textContent = ''; items = []; sel = -1;
    if (!q.trim()) { hide(); return; }
    var toks = words(q);
    if (!results.length) {
      var none = doc.createElement('li');
      none.className = 'empty';
      none.textContent = 'No results for “' + q + '”';
      list.appendChild(none);
    }
    results.forEach(function (e, i) {
      var li = doc.createElement('li');
      li.setAttribute('role', 'option');
      li.id = 'sr-' + i;
      var a = doc.createElement('a');
      a.href = e.url; a.tabIndex = -1;
      var t = doc.createElement('span'); t.className = 'sr-title'; t.textContent = e.heading === e.page ? e.page : e.heading;
      var c = doc.createElement('span'); c.className = 'sr-crumb'; c.textContent = e.section + ' › ' + e.page;
      var s = doc.createElement('span'); s.className = 'sr-snip'; s.textContent = snippet(e, toks);
      a.appendChild(t); a.appendChild(c);
      if (s.textContent) a.appendChild(s);
      li.appendChild(a); list.appendChild(li); items.push(li);
    });
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    announce(results.length + (results.length === 1 ? ' result' : ' results'));
  }
  function select(i) {
    if (!items.length) return;
    if (sel >= 0) items[sel].removeAttribute('aria-selected');
    sel = (i + items.length) % items.length;
    items[sel].setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', items[sel].id);
    items[sel].scrollIntoView({ block: 'nearest' });
  }
  input.addEventListener('input', function () { show(search(input.value), input.value); });
  input.addEventListener('focus', function () { if (input.value.trim()) show(search(input.value), input.value); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); select(sel + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); select(sel < 0 ? items.length - 1 : sel - 1); }
    else if (e.key === 'Enter') { var li = items[sel >= 0 ? sel : 0]; if (li) { e.preventDefault(); location.href = $('a', li).href; } }
    else if (e.key === 'Escape') {
      if (!list.hidden) { hide(); e.stopPropagation(); } else { input.value = ''; input.blur(); }
    }
  });
  doc.addEventListener('click', function (e) { if (!e.target.closest('.search')) hide(); });
  doc.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
    if ((e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault(); setMenu(false); input.focus(); input.select();
    }
  });
})();
