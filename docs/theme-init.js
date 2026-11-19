(function () {
  try {
    var t = localStorage.getItem('deckhand-docs-theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch (e) { /* follow system theme */ }
})();
