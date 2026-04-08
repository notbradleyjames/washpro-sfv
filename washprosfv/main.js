/* ═══════════════════════════════════════════════
   WashPro SFV — main.js
═══════════════════════════════════════════════ */

'use strict';

/* ─── Navbar: transparent → dark on scroll ─── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── Active nav link on scroll ─── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
})();

/* ─── Mobile hamburger ─── */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Close on tap outside links (tap the overlay background)
  navLinks.addEventListener('click', (e) => {
    if (e.target === navLinks) {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();

/* ─── Scroll reveal (IntersectionObserver) ─── */
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ─── Stat count-up ─── */
(function initCountUp() {
  const stats = document.querySelectorAll('.stat-number[data-target]');
  if (!stats.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function animateStat(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1600;
    const start    = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStat(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

  stats.forEach(el => observer.observe(el));
})();

/* ─── Portfolio lightbox ─── */
(function initLightbox() {
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const closeBtn     = document.getElementById('lightboxClose');
  const cards        = document.querySelectorAll('.portfolio-card');
  if (!lightbox || !lightboxImg || !closeBtn) return;

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Clear src after transition
    setTimeout(() => { lightboxImg.src = ''; }, 350);
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      // Flash effect
      card.classList.add('card-flash');
      card.addEventListener('animationend', () => card.classList.remove('card-flash'), { once: true });

      const img = card.querySelector('img');
      if (img) openLightbox(img.src, img.alt);
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();

/* ─── Service card flash on click ─── */
(function initServiceCards() {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.add('service-flash');
      card.addEventListener('animationend', () => card.classList.remove('service-flash'), { once: true });
    });
  });
})();

/* ─── Before / After comparison slider ─── */
(function initComparisonSlider() {
  const slider   = document.getElementById('comparisonSlider');
  const divider  = document.getElementById('comparisonDivider');
  const before   = document.getElementById('beforePanel');
  if (!slider || !divider || !before) return;

  let dragging = false;

  function setPosition(clientX) {
    const rect   = slider.getBoundingClientRect();
    let pct      = (clientX - rect.left) / rect.width;
    pct          = Math.max(0.02, Math.min(0.98, pct));
    const pctPx  = pct * 100;

    divider.style.left  = pctPx + '%';
    before.style.clipPath = `inset(0 ${100 - pctPx}% 0 0)`;
  }

  // Mouse events
  divider.addEventListener('mousedown', (e) => {
    e.preventDefault();
    dragging = true;
    document.body.style.cursor = 'ew-resize';
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    setPosition(e.clientX);
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.cursor = '';
  });

  // Touch events
  divider.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dragging = true;
  }, { passive: false });
  document.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    setPosition(e.touches[0].clientX);
  }, { passive: true });
  document.addEventListener('touchend', () => { dragging = false; });

  // Also allow clicking anywhere on the slider to jump
  slider.addEventListener('click', (e) => {
    if (e.target === divider || divider.contains(e.target)) return;
    setPosition(e.clientX);
  });
})();

/* ─── Floating phone button: fade in after 1.5s ─── */
(function initFloatingPhone() {
  const btn = document.getElementById('floatingPhone');
  if (!btn) return;
  setTimeout(() => btn.classList.add('visible'), 1500);
})();

/* ─── Button press animation ─── */
(function initButtonPress() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', () => { btn.style.transform = 'scale(0.97)'; });
    btn.addEventListener('mouseup',   () => { btn.style.transform = ''; });
    btn.addEventListener('mouseleave',() => { btn.style.transform = ''; });
  });
})();

/* ─── Site config ─── */
const SITE_CONFIG = {
  GOOGLE_REVIEW_URL: 'https://g.page/r/washprosfv/review',
  OWNER_EMAIL:       'info@washprosfv.com',
  PHONE:             '747-202-3622',
};

/* ─── Google Review QR code ─── */
(function initReviewQR() {
  const link = document.getElementById('review-link');
  const img  = document.getElementById('review-qr-img');
  if (!link || !img) return;

  link.href = SITE_CONFIG.GOOGLE_REVIEW_URL;

  const encoded = encodeURIComponent(SITE_CONFIG.GOOGLE_REVIEW_URL);
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&data=${encoded}`;
})();

/* ─── FAQ accordion ─── */
(function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn    = item.querySelector('.faq-btn');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-btn').setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if it was closed)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* ─── Quote form ─── */
(function initQuoteForm() {
  const form      = document.getElementById('quoteForm');
  const submitBtn = document.getElementById('formSubmitBtn');
  const statusEl  = document.getElementById('formStatus');
  if (!form || !submitBtn || !statusEl) return;

  function getField(name) {
    return form.querySelector(`[name="${name}"]`);
  }

  function showFieldError(el, msg) {
    const field = el.closest('.form-field');
    if (!field) return;
    field.classList.add('field-invalid');
    const errEl = field.querySelector('.field-error');
    if (errEl) errEl.textContent = msg;
  }

  function clearFieldError(el) {
    const field = el.closest('.form-field');
    if (!field) return;
    field.classList.remove('field-invalid');
    const errEl = field.querySelector('.field-error');
    if (errEl) errEl.textContent = '';
  }

  // Live clear on input
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => clearFieldError(el));
    el.addEventListener('change', () => clearFieldError(el));
  });

  function validate() {
    let valid = true;

    const name = getField('name');
    if (!name.value.trim()) {
      showFieldError(name, 'Please enter your name.');
      valid = false;
    }

    const phone = getField('phone');
    const phoneVal = phone.value.replace(/\D/g, '');
    if (!phoneVal || phoneVal.length < 10) {
      showFieldError(phone, 'Please enter a valid phone number.');
      valid = false;
    }

    const email = getField('email');
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showFieldError(email, 'Please enter a valid email address.');
      valid = false;
    }

    const service = getField('service');
    if (!service.value) {
      showFieldError(service, 'Please select a service.');
      valid = false;
    }

    return valid;
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.classList.toggle('loading', on);
  }

  function showStatus(type, msg) {
    statusEl.className = `form-status ${type}`;
    statusEl.textContent = msg;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.className = 'form-status';
    statusEl.textContent = '';

    if (!validate()) return;

    const data = {
      name:    getField('name').value.trim(),
      phone:   getField('phone').value.trim(),
      email:   getField('email').value.trim(),
      service: getField('service').value,
      address: getField('address').value.trim(),
      date:    getField('date').value,
      message: getField('message').value.trim(),
    };

    setLoading(true);

    try {
      const res = await fetch('/api/quote', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });

      if (res.ok) {
        showStatus('success', '✓ Quote request sent! We\'ll reach out within a few hours.');
        form.reset();
      } else {
        const body = await res.json().catch(() => ({}));
        showStatus('error', body.error || 'Something went wrong. Please call us at ' + SITE_CONFIG.PHONE);
      }
    } catch {
      showStatus('error', 'Network error. Please try again or call us at ' + SITE_CONFIG.PHONE);
    } finally {
      setLoading(false);
    }
  });
})();
