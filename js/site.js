(function () {
  var gallery = document.getElementById('gallery');
  if (!gallery) return;

  var tiles = Array.prototype.slice.call(gallery.querySelectorAll('.tile'));
  var filters = document.querySelectorAll('[data-filter]');
  var sizes = document.querySelectorAll('[data-size]:not(.gallery)');

  function storeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function storeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Filtro per genere (con hash #genere, es. gallerie.html#etna)
  function applyFilter(name) {
    tiles.forEach(function (t) {
      t.hidden = !(name === 'tutti' || t.getAttribute('data-genre') === name);
    });
    filters.forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-filter') === name);
    });
    visibleLinks = visibleTiles().map(function (t) { return t.querySelector('a'); });
  }
  function visibleTiles() { return tiles.filter(function (t) { return !t.hidden; }); }

  filters.forEach(function (b) {
    b.addEventListener('click', function () {
      var name = b.getAttribute('data-filter');
      applyFilter(name);
      history.replaceState(null, '', name === 'tutti' ? 'gallerie.html' : 'gallerie.html#' + name);
    });
  });

  // Dimensione miniature S / M / L
  function applySize(s) {
    gallery.setAttribute('data-size', s);
    sizes.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-size') === s); });
    storeSet('gallerySize', s);
  }
  sizes.forEach(function (b) {
    b.addEventListener('click', function () { applySize(b.getAttribute('data-size')); });
  });
  var saved = storeGet('gallerySize');
  if (saved === 's' || saved === 'm' || saved === 'l') applySize(saved);

  // Filtro iniziale dall'hash
  var initial = (location.hash || '').replace('#', '');
  var valid = ['recenti', 'paesaggio', 'paesaggio-urbano', 'etna', 'street', 'persone'];
  var visibleLinks = [];
  applyFilter(valid.indexOf(initial) !== -1 ? initial : 'tutti');
  window.addEventListener('hashchange', function () {
    var h = (location.hash || '').replace('#', '');
    applyFilter(valid.indexOf(h) !== -1 ? h : 'tutti');
  });

  // Lightbox
  var lb = document.getElementById('lb');
  var img = document.getElementById('lb-img');
  var cap = document.getElementById('lb-cap');
  var current = 0;

  function show(i) {
    var links = visibleLinks;
    if (!links.length) return;
    current = (i + links.length) % links.length;
    var a = links[current];
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
    var idx = visibleLinks.indexOf(a.querySelector ? a : a);
    if (idx < 0) idx = visibleLinks.indexOf(a.closest('figure').querySelector('a'));
    open(idx < 0 ? 0 : idx);
  });

  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Swipe su telefono
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
