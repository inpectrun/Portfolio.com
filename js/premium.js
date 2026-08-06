/* ===================================================================
 * Premium interaction layer — scroll reveal, typewriter, parallax,
 * magnetic/ripple buttons, contact form status, cert lightbox.
 * ------------------------------------------------------------------- */

(function () {
  'use strict';

  /* Scroll reveal — drives every [data-aos] element (fade-up/left/right,
   * staggered cards, timeline) off a single IntersectionObserver. */
  (function scrollReveal() {
    const targets = document.querySelectorAll('[data-aos]');
    if (!targets.length) return;

    targets.forEach(function (el) {
      const delay = el.getAttribute('data-aos-delay');
      if (delay) el.style.setProperty('--aos-delay', delay + 'ms');
    });

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  })();


  /* Typewriter hero title — cycles through data-roles on the element. */
  (function typewriter() {
    const el = document.getElementById('typingTitle');
    if (!el) return;

    const roles = (el.getAttribute('data-roles') || el.textContent)
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    if (roles.length < 2) return;

    let roleIndex = 0;
    let charIndex = roles[0].length;
    let deleting = false;

    el.textContent = roles[0];

    function tick() {
      const current = roles[roleIndex];

      if (!deleting) {
        charIndex++;
        if (charIndex > current.length) {
          deleting = true;
          charIndex = current.length;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex--;
        if (charIndex < 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          charIndex = 0;
          setTimeout(tick, 400);
          return;
        }
      }

      el.textContent = current.slice(0, charIndex);
      setTimeout(tick, deleting ? 40 : 80);
    }

    setTimeout(tick, 1600);
  })();


  /* Subtle mouse parallax on the hero content. */
  (function heroParallax() {
    const hero = document.getElementById('intro');
    const content = document.getElementById('heroParallax');
    if (!hero || !content) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    hero.addEventListener('mousemove', function (e) {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      content.style.transform = 'translate(' + (x * -12) + 'px, ' + (y * -12) + 'px)';
    });

    hero.addEventListener('mouseleave', function () {
      content.style.transform = 'translate(0, 0)';
    });
  })();


  /* Ripple effect on buttons. */
  (function buttonRipple() {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);

        ripple.className = 'btn__ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

        btn.appendChild(ripple);
        ripple.addEventListener('animationend', function () { ripple.remove(); });
      });
    });
  })();


  /* Magnetic hover pull for CTA buttons. */
  (function magneticButtons() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.btn--magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.25) + 'px, ' + (y * 0.35) + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  })();


  /* Certification image lightbox. */
  (function certLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (!lightbox || !lightboxImg) return;

    document.querySelectorAll('.cert-card img').forEach(function (img) {
      img.addEventListener('click', function () {
        lightboxImg.src = this.src;
        lightbox.style.display = 'flex';
      });
    });
  })();


  /* Contact form: keep the existing Formspree fetch flow, but show an
   * inline animated status instead of alert(). */
  (function contactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form || !status) return;

    function showStatus(message, type) {
      status.textContent = message;
      status.className = 'form-status is-visible is-' + type;
    }

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const data = new FormData(form);

      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: data,
          headers: { Accept: 'application/json' }
        });

        if (response.ok) {
          showStatus('Thank you! Your message has been sent.', 'success');
          form.reset();
        } else {
          showStatus('Oops! Something went wrong. Please try again.', 'error');
        }
      } catch (err) {
        showStatus('Network error — please check your connection and try again.', 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  })();

  /* Dark mode toggle */
  (function themeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    function isDark() {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function apply(dark) {
      if (dark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      btn.setAttribute('aria-pressed', String(dark));
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    }

    btn.setAttribute('aria-pressed', String(isDark()));

    btn.addEventListener('click', function () {
      apply(!isDark());
    });
  })();

})();
