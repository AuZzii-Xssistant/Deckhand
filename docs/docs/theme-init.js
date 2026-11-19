// Runs before first paint so the saved theme never flashes. No network, no tracking.
(function () {
  try {
    var t = localStorage.getItem('deckhand-docs-theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch (e) { /* storage unavailable: follow the system theme */ }
})();
