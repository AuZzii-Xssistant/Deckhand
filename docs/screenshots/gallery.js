// Tabs; the enlarge viewer is ../viewer.js (it moves through the images of the visible tab).
const tabs = document.querySelectorAll('.gal-tabs button');
for (const b of tabs) b.addEventListener('click', () => {
  for (const o of tabs) { const on = o === b; o.setAttribute('aria-selected', String(on)); document.getElementById('tab-' + o.dataset.tab).hidden = !on; }
});
if (location.hash === '#themes') tabs[1].click();
