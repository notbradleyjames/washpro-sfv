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
    const duration = 1800;
    const start    = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = value + suffix;
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
  }, { threshold: 0.5 });

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

/* ─── Rain on glass effect ─── */
(function initRain() {
  const canvas = document.createElement('canvas');
  canvas.id = 'rain-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '3',
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;
  const isMobile = window.innerWidth < 768;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ── Streaks: fast thin lines ── */
  const STREAK_COUNT = isMobile ? 55 : 110;
  function makeStreak() {
    return {
      x:       Math.random() * (W || window.innerWidth),
      y:       Math.random() * -(H || window.innerHeight),
      speed:   7 + Math.random() * 14,
      len:     12 + Math.random() * 45,
      width:   0.4 + Math.random() * 1.2,
      opacity: 0.08 + Math.random() * 0.22,
    };
  }
  const streaks = Array.from({ length: STREAK_COUNT }, makeStreak);

  /* ── Drops: slow, round, with trailing wet line ── */
  const DROP_COUNT = isMobile ? 14 : 28;
  function makeDrop() {
    return {
      x:          Math.random() * (W || window.innerWidth),
      y:          Math.random() * -(H || window.innerHeight),
      speed:      0.6 + Math.random() * 1.8,
      r:          3 + Math.random() * 5,
      opacity:    0.18 + Math.random() * 0.28,
      trail:      [],
      wobble:     Math.random() * Math.PI * 2,
      wobbleSpd:  0.018 + Math.random() * 0.025,
    };
  }
  const drops = Array.from({ length: DROP_COUNT }, makeDrop);

  function tick() {
    ctx.clearRect(0, 0, W, H);

    /* streaks */
    streaks.forEach(s => {
      const grd = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.len);
      grd.addColorStop(0,   `rgba(180,215,255,0)`);
      grd.addColorStop(0.25,`rgba(190,220,255,${s.opacity})`);
      grd.addColorStop(0.75,`rgba(200,230,255,${s.opacity})`);
      grd.addColorStop(1,   `rgba(180,215,255,0)`);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, s.y + s.len);
      ctx.strokeStyle = grd;
      ctx.lineWidth   = s.width;
      ctx.stroke();

      s.y += s.speed;
      if (s.y > H + s.len) { Object.assign(s, makeStreak()); s.y = -s.len; }
    });

    /* drops */
    drops.forEach(d => {
      d.wobble += d.wobbleSpd;
      d.x += Math.sin(d.wobble) * 0.35;
      d.trail.push({ x: d.x, y: d.y });
      if (d.trail.length > 22) d.trail.shift();

      /* wet trail */
      if (d.trail.length > 2) {
        ctx.beginPath();
        ctx.moveTo(d.trail[0].x, d.trail[0].y);
        for (let i = 1; i < d.trail.length; i++) {
          ctx.lineTo(d.trail[i].x, d.trail[i].y);
        }
        ctx.strokeStyle = `rgba(190,225,255,${d.opacity * 0.28})`;
        ctx.lineWidth   = d.r * 0.45;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        ctx.stroke();
      }

      /* drop body */
      const grd = ctx.createRadialGradient(
        d.x - d.r * 0.25, d.y - d.r * 0.3, 0,
        d.x,               d.y,              d.r
      );
      grd.addColorStop(0,   `rgba(230,245,255,${d.opacity * 1.6})`);
      grd.addColorStop(0.45,`rgba(185,220,255,${d.opacity})`);
      grd.addColorStop(1,   `rgba(120,175,225,${d.opacity * 0.25})`);

      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.r * 0.65, d.r, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      /* highlight glint */
      ctx.beginPath();
      ctx.ellipse(d.x - d.r * 0.22, d.y - d.r * 0.28, d.r * 0.22, d.r * 0.14, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${d.opacity * 0.7})`;
      ctx.fill();

      d.y += d.speed;
      if (d.y > H + d.r * 2) {
        Object.assign(d, makeDrop());
        d.y     = -d.r * 2;
        d.trail = [];
      }
    });

    requestAnimationFrame(tick);
  }

  tick();
})();

/* ─── Button press animation ─── */
(function initButtonPress() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', () => { btn.style.transform = 'scale(0.97)'; });
    btn.addEventListener('mouseup',   () => { btn.style.transform = ''; });
    btn.addEventListener('mouseleave',() => { btn.style.transform = ''; });
  });
})();
