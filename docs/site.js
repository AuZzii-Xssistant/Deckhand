(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var mt = document.querySelector(".menu-toggle"), nv = document.getElementById("site-nav");
  if (mt && nv) {
    var setOpen = function (o, focus) { nv.classList.toggle("open", o); mt.setAttribute("aria-expanded", o ? "true" : "false"); mt.setAttribute("aria-label", o ? "Close menu" : "Menu"); if (!o && focus) mt.focus(); };
    mt.addEventListener("click", function () { setOpen(!nv.classList.contains("open")); });
    nv.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nv.classList.contains("open")) setOpen(false, true); });
    document.addEventListener("click", function (e) { if (nv.classList.contains("open") && !nv.contains(e.target) && !mt.contains(e.target)) { setOpen(false); e.preventDefault(); e.stopPropagation(); } }, true);
    window.matchMedia("(min-width: 981px)").addEventListener("change", function (m) { if (m.matches) setOpen(false); });
  }
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  function current() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function sync() {
    var dark = current() === 'dark';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.querySelector('span').textContent = dark ? 'Dark' : 'Light';
  }
  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('deckhand-docs-theme', next); } catch (e) {}
    sync();
  });
  sync();
})();
