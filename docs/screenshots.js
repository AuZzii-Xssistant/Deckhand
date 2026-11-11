const viewer = document.querySelector('#screenshot-viewer');
const title = document.querySelector('#screenshot-title');
const enlarged = viewer.querySelector('img');

for (const link of document.querySelectorAll('figure a[href^="screenshots/"]')) {
  link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const thumbnail = link.querySelector('img');
    title.textContent = link.closest('figure').querySelector('figcaption').textContent;
    enlarged.alt = thumbnail.alt;
    enlarged.src = link.href;
    viewer.showModal();
  });
}

viewer.addEventListener('click', (event) => {
  if (event.target === viewer) {
    const bounds = viewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
  }
});
