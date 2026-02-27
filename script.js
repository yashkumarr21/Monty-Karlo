/* ================================================
   MONTY KARLO — JavaScript
   Features: Anti-Gravity Physics, Cart, Countdown,
             Scroll Animations, Ripple Effects
   ================================================ */

(function () {
  'use strict';

  /* ---------- Page Loader ---------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    setTimeout(() => loader.classList.add('hidden'), 800);
  });

  /* ---------- Mobile Menu ---------- */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ---------- Smooth Scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Scroll Fade-In ---------- */
  const fadeEls = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  fadeEls.forEach(el => fadeObserver.observe(el));

  /* ---------- Button Ripple Effect ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.hero-cta, .add-to-cart-btn, .antigravity-btn');
    if (!btn) return;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });

  /* ---------- Add to Cart ---------- */
  let cartCount = 0;
  const cartCountEl = document.getElementById('cartCount');

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cartCount++;
      cartCountEl.textContent = cartCount;

      // Animate cart icon
      const cartBtn = document.getElementById('cartBtn');
      cartBtn.style.transform = 'scale(1.3)';
      setTimeout(() => cartBtn.style.transform = 'scale(1)', 200);

      // Change button text briefly
      const originalText = btn.textContent;
      btn.textContent = '✓ Added!';
      btn.style.background = 'linear-gradient(135deg, #00c853, #00b0ff)';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 1200);
    });
  });

  /* ---------- Countdown Timer ---------- */
  // Set target to 7 days from now
  const countdownTarget = new Date();
  countdownTarget.setDate(countdownTarget.getDate() + 7);

  function updateCountdown() {
    const now = new Date();
    const diff = countdownTarget - now;

    if (diff <= 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- Email Signup ---------- */
  const signupForm = document.getElementById('signupForm');
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('emailInput');
    const btn = signupForm.querySelector('button');
    const originalText = btn.textContent;

    btn.textContent = '✓ Joined!';
    email.value = '';
    setTimeout(() => btn.textContent = originalText, 2000);
  });

  /* ================================================
     ANTI-GRAVITY PHYSICS ENGINE
     ================================================ */
  const antigravityBtn = document.getElementById('antigravityBtn');
  let isAntigravity = false;
  let agElements = [];
  let animationFrame = null;

  // Store original positions and physics state for each element
  function getAGData() {
    return {
      originalRect: null,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      width: 0,
      height: 0,
      isDragging: false,
      settled: false
    };
  }

  antigravityBtn.addEventListener('click', () => {
    if (!isAntigravity) {
      activateAntigravity();
    } else {
      deactivateAntigravity();
    }
  });

  function activateAntigravity() {
    isAntigravity = true;
    antigravityBtn.classList.add('active');
    antigravityBtn.querySelector('span').textContent = 'Return to Earth';
    document.body.classList.add('antigravity-active');

    // Gather all AG-tagged elements (skip the button itself)
    const elements = document.querySelectorAll('.ag-element');
    agElements = [];

    elements.forEach(el => {
      if (el === antigravityBtn) return;

      const rect = el.getBoundingClientRect();
      const data = getAGData();
      data.originalRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
      data.x = rect.left;
      data.y = rect.top;
      data.width = rect.width;
      data.height = rect.height;

      // Random scatter velocity
      data.vx = (Math.random() - 0.5) * 8;
      data.vy = Math.random() * -3 - 1;

      el._agData = data;

      // Set initial position
      el.style.left = data.x + 'px';
      el.style.top = data.y + 'px';
      el.style.width = data.width + 'px';
      el.style.margin = '0';

      agElements.push(el);
    });

    // Start physics loop
    physicsLoop();
  }

  function deactivateAntigravity() {
    isAntigravity = false;
    antigravityBtn.classList.remove('active');
    antigravityBtn.querySelector('span').textContent = 'Go Anti-Gravity';
    document.body.classList.remove('antigravity-active');

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    // Smoothly animate elements back to original position
    agElements.forEach(el => {
      const data = el._agData;
      if (!data) return;

      el.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      el.style.left = data.originalRect.left + 'px';
      el.style.top = data.originalRect.top + 'px';

      setTimeout(() => {
        el.style.cssText = '';
        delete el._agData;
      }, 650);
    });

    agElements = [];
  }

  /* ---------- Physics Loop ---------- */
  const GRAVITY = 0.35;
  const BOUNCE = 0.5;
  const FRICTION = 0.98;
  const FLOOR_Y = () => window.innerHeight;
  const WALL_R = () => window.innerWidth;

  function physicsLoop() {
    if (!isAntigravity) return;

    agElements.forEach(el => {
      const d = el._agData;
      if (d.isDragging || !d) return;

      // Apply gravity
      d.vy += GRAVITY;

      // Apply friction
      d.vx *= FRICTION;
      d.vy *= FRICTION;

      // Update position
      d.x += d.vx;
      d.y += d.vy;

      // Floor collision
      const floorLimit = FLOOR_Y() - d.height;
      if (d.y >= floorLimit) {
        d.y = floorLimit;
        d.vy *= -BOUNCE;

        // Stop bouncing if velocity is tiny
        if (Math.abs(d.vy) < 1) {
          d.vy = 0;
          d.settled = true;
        }
      }

      // Ceiling collision
      if (d.y < 0) {
        d.y = 0;
        d.vy *= -BOUNCE;
      }

      // Left wall collision
      if (d.x < 0) {
        d.x = 0;
        d.vx *= -BOUNCE;
      }

      // Right wall collision
      const wallLimit = WALL_R() - d.width;
      if (d.x >= wallLimit) {
        d.x = wallLimit;
        d.vx *= -BOUNCE;
      }

      el.style.left = d.x + 'px';
      el.style.top = d.y + 'px';
    });

    animationFrame = requestAnimationFrame(physicsLoop);
  }

  /* ---------- Drag Support ---------- */
  let dragTarget = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  document.addEventListener('mousedown', (e) => {
    if (!isAntigravity) return;
    const el = e.target.closest('.ag-element');
    if (!el || !el._agData) return;

    dragTarget = el;
    const d = el._agData;
    d.isDragging = true;
    dragOffsetX = e.clientX - d.x;
    dragOffsetY = e.clientY - d.y;
    d.vx = 0;
    d.vy = 0;
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragTarget) return;
    const d = dragTarget._agData;
    d.x = e.clientX - dragOffsetX;
    d.y = e.clientY - dragOffsetY;
    dragTarget.style.left = d.x + 'px';
    dragTarget.style.top = d.y + 'px';
  });

  document.addEventListener('mouseup', (e) => {
    if (!dragTarget) return;
    const d = dragTarget._agData;
    d.isDragging = false;
    // Give a small throw velocity based on mouse release
    d.vx = (Math.random() - 0.5) * 4;
    d.vy = -2;
    dragTarget = null;
  });

  // Touch support for mobile
  document.addEventListener('touchstart', (e) => {
    if (!isAntigravity) return;
    const el = e.target.closest('.ag-element');
    if (!el || !el._agData) return;

    dragTarget = el;
    const d = el._agData;
    d.isDragging = true;
    const touch = e.touches[0];
    dragOffsetX = touch.clientX - d.x;
    dragOffsetY = touch.clientY - d.y;
    d.vx = 0;
    d.vy = 0;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!dragTarget) return;
    const touch = e.touches[0];
    const d = dragTarget._agData;
    d.x = touch.clientX - dragOffsetX;
    d.y = touch.clientY - dragOffsetY;
    dragTarget.style.left = d.x + 'px';
    dragTarget.style.top = d.y + 'px';
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!dragTarget) return;
    const d = dragTarget._agData;
    d.isDragging = false;
    d.vx = (Math.random() - 0.5) * 4;
    d.vy = -2;
    dragTarget = null;
  });

})();
