(function () {
  var hdr = document.querySelector('.hdr');
  var hero = document.querySelector('.hero');
  if (hdr && !hdr.classList.contains('always')) {
    var onScroll = function () { hdr.classList.toggle('solid', window.scrollY > 40); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  // mobile menu
  var mnav = document.querySelector('.mnav');
  function setMenu(open) {
    if (!mnav) return;
    mnav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    mnav.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  document.querySelectorAll('.burger').forEach(function (b) { b.addEventListener('click', function () { setMenu(true); }); });
  document.querySelectorAll('.mnav-x').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
  if (mnav) mnav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // sticky mobile bar: only after the hero is scrolled past
  var mbar = document.querySelector('.mbar');
  if (mbar) {
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        var e = ents[0];
        mbar.classList.toggle('on', !e.isIntersecting && e.boundingClientRect.top < 0);
      }).observe(hero);
    } else { mbar.classList.add('on'); }
  }

  // reveal on scroll
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  // lightbox for gallery
  var figs = Array.prototype.slice.call(document.querySelectorAll('.gal figure'));
  if (figs.length) {
    var lb = document.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = '<button class="lb-x" aria-label="Close">&times;</button><button class="lb-p" aria-label="Previous photo">&#8249;</button><img alt=""><button class="lb-n" aria-label="Next photo">&#8250;</button><p></p>';
    document.body.appendChild(lb);
    var img = lb.querySelector('img'), cap = lb.querySelector('p'), idx = 0;
    var show = function (i) {
      idx = (i + figs.length) % figs.length;
      var s = figs[idx].querySelector('img');
      img.src = s.getAttribute('data-full') || s.currentSrc || s.src; img.alt = s.alt;
      var c = figs[idx].querySelector('figcaption'); cap.textContent = c ? c.textContent : '';
      lb.classList.add('on');
    };
    figs.forEach(function (f, i) {
      f.tabIndex = 0;
      f.addEventListener('click', function () { show(i); });
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter') show(i); });
    });
    lb.querySelector('.lb-x').onclick = function () { lb.classList.remove('on'); };
    lb.querySelector('.lb-p').onclick = function () { show(idx - 1); };
    lb.querySelector('.lb-n').onclick = function () { show(idx + 1); };
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('on'); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') lb.classList.remove('on');
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  // prefill from ?service= / ?item=
  var qs = new URLSearchParams(location.search);
  ['service', 'item'].forEach(function (k) {
    var v = qs.get(k); if (!v) return;
    document.querySelectorAll('input[data-pre="' + k + '"]').forEach(function (cb) { if (cb.value === v) cb.checked = true; });
  });

  // Netlify forms: confirm ONLY on a 2xx from Netlify
  document.querySelectorAll('form[data-netlify]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var box = f.closest('.form'), err = box.querySelector('.err-msg'), btn = f.querySelector('button[type=submit]');
      if (err) err.style.display = 'none';
      btn.disabled = true;
      var body = new URLSearchParams(new FormData(f)).toString();
      fetch(f.getAttribute('action') || '/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          box.classList.add('sent');
          box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(function () { if (err) err.style.display = 'block'; btn.disabled = false; });
    });
  });
})();
