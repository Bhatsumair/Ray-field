/* Ray Field Energy — site behaviour */
(function () {
  // ===== EDIT THESE =====
  // WhatsApp number in international format, digits only (e.g. 919876543210).
  var WHATSAPP_NUMBER = 'WHATSAPP_NUMBER';
  // ======================

  document.documentElement.classList.remove('no-js');

  // Sticky header shadow
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = ((el.dataset.delay || 0) * 1) + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Quote form: validate, then open WhatsApp with the details filled in
  document.querySelectorAll('form.quote').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var err = form.querySelector('[data-err-for="' + f.name + '"]');
        var bad = !f.value.trim() || (f.type === 'tel' && f.value.replace(/\D/g, '').length < 10);
        if (err) err.textContent = bad ? (f.type === 'tel' ? 'Please enter a valid 10-digit phone number.' : 'This field is required.') : '';
        f.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;
      var data = new FormData(form), lines = ['Hello Ray Field, I would like a solar quote.'];
      data.forEach(function (v, k) { if (String(v).trim()) lines.push(k + ': ' + v); });
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      var status = form.querySelector('.form-status');
      if (status) status.textContent = 'Opening WhatsApp so you can send your details to our team…';
      window.open(url, '_blank', 'noopener');
      form.reset();
    });
  });
})();
