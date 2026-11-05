(function () {
  var GENRES = ['paesaggio', 'paesaggio-urbano', 'etna', 'street', 'persone'];
  var stackView = document.getElementById('stack-view');
  if (!stackView) return;

  var stacks = Array.prototype.slice.call(document.querySelectorAll('.stack'));

  // --- Selezione per genere: si sceglie il genere con l'hash (#genere) o con le frecce in fondo ---
  function showStack(g) {
    if (GENRES.indexOf(g) === -1) g = 'paesaggio';
    stacks.forEach(function (s) { s.hidden = s.getAttribute('data-stack') !== g; });
  }
  function fromHash() {
    var h = (location.hash || '').replace('#', '');
    showStack(GENRES.indexOf(h) !== -1 ? h : 'paesaggio');
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();

  // --- Lightbox: la foto intera, con le altre del genere ---
  var lb = document.getElementById('lb');
  var img = document.getElementById('lb-img');
  var cap = document.getElementById('lb-cap');
  var links = [];
  var idx = 0;

  function show(i) {
    if (!links.length) return;
    idx = (i + links.length) % links.length;
    var a = links[idx];
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

  stackView.addEventListener('click', function (e) {
    var a = e.target.closest('a.tile-link');
    if (!a) return;
    e.preventDefault();
    links = Array.prototype.slice.call(a.closest('.stack').querySelectorAll('a.tile-link'));
    open(Math.max(0, links.indexOf(a)));
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
