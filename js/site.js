(function () {
  var GENRES = ['paesaggio', 'paesaggio-urbano', 'etna', 'street', 'persone'];
  var stackView = document.getElementById('stack-view');
  var gridView = document.getElementById('grid-view');
  if (!stackView || !gridView) return;

  var stacks = Array.prototype.slice.call(document.querySelectorAll('.stack'));
  var genreLinks = Array.prototype.slice.call(document.querySelectorAll('[data-genre-link]'));
  var gallery = document.getElementById('gallery');
  var tiles = Array.prototype.slice.call(gallery.querySelectorAll('.tile'));
  var gridFilters = document.querySelectorAll('[data-filter]');
  var sizeButtons = document.querySelectorAll('[data-size]:not(.gallery)');
  var visibleLinks = [];
  var current = 'paesaggio';

  function storeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function storeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // --- Selezioni per genere (stack) ---
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

  // --- Griglia completa ---
  function visibleTiles() { return tiles.filter(function (t) { return !t.hidden; }); }
  function applyGridFilter(name) {
    tiles.forEach(function (t) {
      t.hidden = !(name === 'tutti' || t.getAttribute('data-genre') === name);
    });
    gridFilters.forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-filter') === name);
    });
    visibleLinks = visibleTiles().map(function (t) { return t.querySelector('a'); });
  }
  function showGrid(g) {
    stackView.hidden = true;
    gridView.hidden = false;
    applyGridFilter(g || 'tutti');
    window.scrollTo(0, 0);
  }

  document.querySelectorAll('[data-show-grid]').forEach(function (b) {
    b.addEventListener('click', function () { showGrid(b.getAttribute('data-show-grid')); });
  });
  var back = document.querySelector('[data-back-stack]');
  if (back) back.addEventListener('click', function () { showStack(current); window.scrollTo(0, 0); });

  gridFilters.forEach(function (b) {
    b.addEventListener('click', function () { applyGridFilter(b.getAttribute('data-filter')); });
  });

  // --- Miniature S / M / L ---
  function applySize(s) {
    gallery.setAttribute('data-size', s);
    sizeButtons.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-size') === s); });
    storeSet('gallerySize', s);
  }
  sizeButtons.forEach(function (b) {
    b.addEventListener('click', function () { applySize(b.getAttribute('data-size')); });
  });
  var saved = storeGet('gallerySize');
  if (saved === 's' || saved === 'm' || saved === 'l') applySize(saved);

  // --- Hash: #genere mostra la selezione di quel genere ---
  function fromHash() {
    var h = (location.hash || '').replace('#', '');
    showStack(GENRES.indexOf(h) !== -1 ? h : 'paesaggio');
  }
  window.addEventListener('hashchange', fromHash);
  applyGridFilter('tutti');
  fromHash();

  // --- Lightbox (solo nella griglia completa) ---
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
