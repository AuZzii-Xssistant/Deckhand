// Hero carousel: advances every 5 s (crossfade, or an instant swap when the system asks for reduced motion), pauses on hover/focus or with the Pause button (remembered), dots and arrows.
(() => {
  const root = document.querySelector('.carousel'); if (!root) return;
  const slides = [...root.querySelectorAll('.slide')]; if (slides.length < 2) return;
  const bar = root.querySelector('.carousel-bar'), cap = root.querySelector('.carousel-cap'), dotsBox = root.querySelector('.cdots');
  const prev = root.querySelector('[data-c="prev"]'), next = root.querySelector('[data-c="next"]'), toggle = root.querySelector('[data-c="toggle"]');
  const KEY = 'deckhand-carousel', EVERY = 5000;
  const stored = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  let i = 0, timer = null, userPaused = stored() === 'paused', hover = false, due = Date.now() + EVERY;
  root.classList.add('on'); bar.hidden = false;
  const dots = slides.map((s, k) => { const d = document.createElement('button'); d.type = 'button'; d.className = 'cdot'; d.setAttribute('aria-label', `Show ${s.dataset.name}`); d.onclick = () => { show(k); userPaused = true; sync(); }; dotsBox.append(d); return d; });
  function show(k) {
    i = (k + slides.length) % slides.length;
    slides.forEach((s, n) => { s.classList.toggle('is-active', n === i); s.setAttribute('aria-hidden', String(n !== i)); s.tabIndex = n === i ? 0 : -1; });
    dots.forEach((d, n) => d.setAttribute('aria-current', String(n === i)));
    cap.innerHTML = ''; const b = document.createElement('strong'); b.textContent = slides[i].dataset.name; cap.append(b, ' – ' + slides[i].dataset.desc);
  }
  function sync() {
    clearInterval(timer); timer = null; due = Date.now() + EVERY;
    root.querySelector('.slides').setAttribute('aria-live', userPaused || hover ? 'polite' : 'off');
    toggle.textContent = userPaused ? 'Play' : 'Pause'; toggle.setAttribute('aria-label', userPaused ? 'Start the slideshow' : 'Pause the slideshow'); toggle.setAttribute('aria-pressed', String(userPaused));
    // a short tick that compares timestamps, so a throttled or resumed tab never drifts or stalls
    if (!userPaused && !hover) timer = setInterval(() => { if (document.hidden) return; if (Date.now() >= due) { show(i + 1); due = Date.now() + EVERY; } }, 500);
  }
  prev.onclick = () => { show(i - 1); sync(); }; next.onclick = () => { show(i + 1); sync(); };
  toggle.onclick = () => { userPaused = !userPaused; try { localStorage.setItem(KEY, userPaused ? 'paused' : 'playing'); } catch (e) { /* storage blocked: the choice lasts until reload */ } sync(); };
  root.addEventListener('mouseenter', () => { hover = true; sync(); }); root.addEventListener('mouseleave', () => { hover = false; sync(); });
  root.addEventListener('focusin', () => { hover = true; sync(); }); root.addEventListener('focusout', () => { hover = root.matches(':hover'); sync(); });
  root.addEventListener('keydown', (e) => { if (e.target.closest('dialog')) return; if (e.key === 'ArrowLeft') { show(i - 1); sync(); } else if (e.key === 'ArrowRight') { show(i + 1); sync(); } });
  document.addEventListener('visibilitychange', () => { due = Date.now() + EVERY; });
  show(0); sync();
})();
