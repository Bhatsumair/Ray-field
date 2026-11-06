/* Ray Field Energy — site behaviour */
(function () {
  // ===== EDIT THESE =====
  // WhatsApp number in international format, digits only (e.g. 919876543210).
  var WHATSAPP_NUMBER = 'WHATSAPP_NUMBER';
  // Inbox that receives website enquiries (via formsubmit.co).
  var FORM_EMAIL = 'rayfieldsolarenergy@gmail.com';
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

  // Count-up for stat numbers
  var nums = document.querySelectorAll('.num[data-count]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (nums.length && 'IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = +el.dataset.count, t0 = null;
        co.unobserve(el);
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1400, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = '0';
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { co.observe(el); });
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Quote form: validate, then email the enquiry via FormSubmit
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
      var data = new FormData(form), payload = {
        _subject: 'New solar enquiry from the website',
        _template: 'table',
        _captcha: 'false'
      };
      data.forEach(function (v, k) { if (String(v).trim()) payload[k] = v; });
      var status = form.querySelector('.form-status');
      var btn = form.querySelector('button[type="submit"], button:not([type])');
      if (btn) btn.disabled = true;
      if (status) status.textContent = 'Sending your enquiry…';
      fetch('https://formsubmit.co/ajax/' + FORM_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || String(res.j.success) === 'false') throw new Error(res.j.message || 'failed');
          if (status) status.textContent = 'Thank you! Your enquiry has been sent. Our team will contact you shortly.';
          form.reset();
        })
        .catch(function () {
          if (status) status.textContent = 'Sorry, something went wrong. Please email us at ' + FORM_EMAIL + ' or call us directly.';
        })
        .then(function () { if (btn) btn.disabled = false; });
    });
  });
})();
