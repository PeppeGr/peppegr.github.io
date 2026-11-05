(function () {
  var GENRES = ['paesaggio', 'paesaggio-urbano', 'etna', 'street', 'persone'];
  var LABELS = { 'paesaggio': 'Paesaggio', 'paesaggio-urbano': 'Paesaggio urbano', 'etna': 'Etna', 'street': 'Street', 'persone': 'Persone' };
  var stackView = document.getElementById('stack-view');
  var gridView = document.getElementById('grid-view');
  if (!stackView || !gridView) return;

  var stacks = Array.prototype.slice.call(document.querySelectorAll('.stack'));
  var genreLinks = Array.prototype.slice.call(document.querySelectorAll('[data-genre-link]'));
  var gallery = document.getElementById('gallery');
  var gridTitle = document.getElementById('grid-title');
  var tiles = Array.prototype.slice.call(gallery.querySelectorAll('.tile'));
  var visibleLinks = [];
  var current = 'paesaggio';

  // --- Selezione per genere (impilata) ---
  function showStack(g) {
    if (GENRES.indexOf(g) === -1) g = 'paesaggio';
    current = g;
    stacks.forEach(function (s) { s.hidden = s.getAttribute('data-stack') !== g; });
    genreLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-genre-link') === g);
    });
    stackView.hidden = false;
    gridView.hidden = true;
  }

  // --- Tutte le foto di un genere (griglia) ---
  function showGrid(g) {
    if (GENRES.indexOf(g) === -1) g = current;
    current = g;
    tiles.forEach(function (t) { t.hidden = t.getAttribute('data-genre') !== g; });
    visibleLinks = tiles.filter(function (t) { return !t.hidden; }).map(function (t) { return t.querySelector('a'); });
    gridTitle.textContent = 'Tutte le foto: ' + LABELS[g];
    stackView.hidden = true;
    gridView.hidden = false;
    window.scrollTo(0, 0);
  }

  document.querySelectorAll('[data-show-grid]').forEach(function (b) {
    b.addEventListener('click', function () { showGrid(b.getAttribute('data-show-grid')); });
  });
  var back = document.querySelector('[data-back-stack]');
  if (back) back.addEventListener('click', function () { showStack(current); window.scrollTo(0, 0); });

  // --- Hash: #genere mostra la selezione di quel genere ---
  function fromHash() {
    var h = (location.hash || '').replace('#', '');
    showStack(GENRES.indexOf(h) !== -1 ? h : 'paesaggio');
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();

  // --- Lightbox (griglia) ---
  var lb = document.getElementById('lb');
  var img = document.getElementById('lb-img');
  var cap = document.getElementById('lb-cap');
  var idx = 0;

  function show(i) {
    if (!visibleLinks.length) return;
    idx = (i + visibleLinks.length) % visibleLinks.length;
    var a = visibleLinks[idx];
    img.src = a.getAttribute('href');
    img.alt = a.querySelector('img').getAttribute('alt') || '';
    cap.textContent = img.alt;
  }
  function open(i) {
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }
  function close() {
    lb.hidden = true;
    img.removeAttribute('src');
    document.body.style.overflow = '';
  }

  gallery.addEventListener('click', function (e) {
    var a = e.target.closest('a.tile-link');
    if (!a) return;
    e.preventDefault();
    var i = visibleLinks.indexOf(a);
    open(i < 0 ? 0 : i);
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
