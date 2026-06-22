/**
 * script.js — Zia Iqbal Khan Executive Portfolio
 * Production-ready | Vanilla JS | GitHub Pages compatible
 *
 * Features:
 *   1. Mobile navigation toggle
 *   2. Smooth scrolling (with offset for fixed navbar)
 *   3. Active navigation link highlighting (IntersectionObserver)
 *   4. Scroll-reveal animations (IntersectionObserver)
 *   5. Dashboard counter animations
 *   6. Back-to-top button
 *   7. Navbar scroll-state styling
 *   8. Accessibility: focus management, ARIA, reduced-motion respect
 *   9. Performance: passive listeners, requestAnimationFrame, debouncing
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     0. UTILITIES
  ───────────────────────────────────────────── */

  /** Prefer reduced motion */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /** Debounce helper */
  function debounce(fn, wait) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /** Get navbar height for scroll offsets */
  function navHeight() {
    const nav = document.getElementById('navbar');
    return nav ? nav.getBoundingClientRect().height : 64;
  }


  /* ─────────────────────────────────────────────
     1. MOBILE NAVIGATION TOGGLE
  ───────────────────────────────────────────── */

  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  function openMenu() {
    navLinks.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.classList.add('is-active');
    // Trap focus inside nav when open
    navLinks.querySelector('a') && navLinks.querySelector('a').focus();
  }

  function closeMenu() {
    navLinks.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('is-active');
  }

  function toggleMenu() {
    const isOpen = navLinks.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', toggleMenu);

    // Close menu when a nav link is tapped on mobile
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        closeMenu();
        hamburger.focus();
      }
    });

    // Close when clicking outside nav
    document.addEventListener('click', function (e) {
      if (
        navLinks.classList.contains('is-open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }


  /* ─────────────────────────────────────────────
     2. NAVBAR SCROLL STATE
  ───────────────────────────────────────────── */

  const navbar = document.getElementById('navbar');

  function updateNavbarState() {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbarState, { passive: true });
  updateNavbarState(); // Run on load


  /* ─────────────────────────────────────────────
     3. SMOOTH SCROLLING
  ───────────────────────────────────────────── */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const offset = navHeight() + 16;
      const targetY =
        target.getBoundingClientRect().top + window.pageYOffset - offset;

      if (prefersReducedMotion) {
        window.scrollTo(0, targetY);
      } else {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }

      // Move focus to the target section for accessibility
      // Set tabindex temporarily if the element isn't naturally focusable
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener(
          'blur',
          function () {
            target.removeAttribute('tabindex');
          },
          { once: true }
        );
      }
      target.focus({ preventScroll: true });
    });
  });


  /* ─────────────────────────────────────────────
     4. ACTIVE NAVIGATION HIGHLIGHTING
  ───────────────────────────────────────────── */

  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionIds = Array.from(navAnchors).map(function (a) {
    return a.getAttribute('href').slice(1);
  });

  const sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActiveLink(id) {
    navAnchors.forEach(function (a) {
      const matches = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', matches);
      a.setAttribute('aria-current', matches ? 'page' : 'false');
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      }
    );

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }


  /* ─────────────────────────────────────────────
     5. SCROLL-REVEAL ANIMATIONS
  ───────────────────────────────────────────── */

  /**
   * Elements to animate on scroll.
   * Add class "reveal" to elements already in HTML, OR we auto-target
   * common layout elements below.
   */
  const REVEAL_SELECTORS = [
    '.section-kicker',
    '.section-title',
    '.section-intro',
    '.profile-bio p',
    '.profile-bio blockquote',
    '.profile-side .side-block',
    '.philosophy-card',
    '.comp-tag',
    '.ledger-row',
    '.credential-block',
    '.credentials-table',
    '.dissertation',
    '.cert-plate',
    '.achievement-card',
    '.download-card',
    '.contact-info',
    '.contact-note',
    '.footer-name',
    '.footer-sub',
    '.hero-text > *',
    '.hero-photo-wrap',
    '.dash-card',
  ].join(', ');

  function initReveal() {
    if (prefersReducedMotion) return;

    const revealEls = document.querySelectorAll(REVEAL_SELECTORS);

    revealEls.forEach(function (el, i) {
      el.classList.add('sr-hidden');
      // Stagger sibling groups for a cascade effect
      const parent = el.parentElement;
      if (parent) {
        const siblings = parent.querySelectorAll(':scope > ' + el.tagName + ', :scope > [class="' + el.className.split(' ')[0] + '"]');
        const idx = Array.from(siblings).indexOf(el);
        if (idx > 0 && idx < 8) {
          el.style.transitionDelay = (idx * 60) + 'ms';
        }
      }
    });

    if (!('IntersectionObserver' in window)) {
      // Fallback: reveal everything immediately
      revealEls.forEach(function (el) { el.classList.remove('sr-hidden'); });
      return;
    }

    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove('sr-hidden');
            entry.target.classList.add('sr-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.08
      }
    );

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  // Inject reveal CSS dynamically (keeps HTML/CSS untouched)
  (function injectRevealStyles() {
    if (prefersReducedMotion) return;
    const style = document.createElement('style');
    style.textContent = [
      '.sr-hidden {',
      '  opacity: 0;',
      '  transform: translateY(18px);',
      '  transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1),',
      '              transform 0.55s cubic-bezier(0.22,1,0.36,1);',
      '}',
      '.sr-visible {',
      '  opacity: 1;',
      '  transform: translateY(0);',
      '}',
      /* Faster/lighter for small decorative items */
      '.comp-tag.sr-hidden {',
      '  transition-duration: 0.35s;',
      '}',
      /* Hero items slide in from left */
      '.hero-text > *.sr-hidden {',
      '  transform: translateX(-14px);',
      '}',
      '.hero-photo-wrap.sr-hidden {',
      '  transform: translateX(14px);',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  })();

  initReveal();


  /* ─────────────────────────────────────────────
     6. DASHBOARD COUNTER ANIMATIONS
  ───────────────────────────────────────────── */

  /**
   * Parse a dash-num value like "90+", "8+", "5", "3", "BPS‑16"
   * Returns { prefix, number, suffix } or null if not animatable.
   */
  function parseCounterValue(text) {
    // Normalise non-breaking hyphens and spaces
    const clean = text.replace(/\u2011/g, '-').trim();
    // Match optional prefix + number + optional suffix
    const match = clean.match(/^([A-Za-z\-]*)(\d+)([+\u002B\u2019\w\-]*)$/);
    if (!match) return null;
    return {
      prefix: match[1],
      number: parseInt(match[2], 10),
      suffix: match[3]
    };
  }

  function animateCounter(el, parsed, duration) {
    const start = performance.now();
    const end = parsed.number;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * end);
      el.textContent = parsed.prefix + current + parsed.suffix;
      el.setAttribute('aria-label', parsed.prefix + current + parsed.suffix);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = parsed.prefix + end + parsed.suffix;
      }
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    const dashNums = document.querySelectorAll('.dash-num');
    if (!dashNums.length) return;

    const counterDuration = prefersReducedMotion ? 0 : 1400;

    if (!('IntersectionObserver' in window)) {
      // No observer support — just display values as-is
      return;
    }

    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const original = el.getAttribute('data-original') || el.textContent;
          el.setAttribute('data-original', original);

          const parsed = parseCounterValue(original);
          if (parsed && parsed.number > 0 && counterDuration > 0) {
            animateCounter(el, parsed, counterDuration);
          }
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    dashNums.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  initCounters();


  /* ─────────────────────────────────────────────
     7. BACK TO TOP BUTTON
  ───────────────────────────────────────────── */

  const toTopBtn = document.getElementById('toTop');

  function updateToTop() {
    if (!toTopBtn) return;
    const visible = window.scrollY > 400;
    toTopBtn.classList.toggle('is-visible', visible);
    toTopBtn.setAttribute('aria-hidden', String(!visible));
    toTopBtn.tabIndex = visible ? 0 : -1;
  }

  if (toTopBtn) {
    window.addEventListener('scroll', debounce(updateToTop, 80), { passive: true });
    updateToTop();

    toTopBtn.addEventListener('click', function () {
      if (prefersReducedMotion) {
        window.scrollTo(0, 0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // Return focus to the top landmark
      const topEl = document.getElementById('top') || document.getElementById('navbar');
      if (topEl) {
        if (!topEl.hasAttribute('tabindex')) topEl.setAttribute('tabindex', '-1');
        topEl.focus({ preventScroll: true });
      }
    });

    // Keyboard: Enter / Space trigger click
    toTopBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toTopBtn.click();
      }
    });

    // Inject to-top visibility CSS (non-destructive)
    (function injectToTopStyles() {
      const style = document.createElement('style');
      style.textContent = [
        '.to-top {',
        '  opacity: 0;',
        '  pointer-events: none;',
        '  transform: translateY(8px);',
        '  transition: opacity 0.3s ease, transform 0.3s ease;',
        '}',
        '.to-top.is-visible {',
        '  opacity: 1;',
        '  pointer-events: auto;',
        '  transform: translateY(0);',
        '}',
        '@media (prefers-reduced-motion: reduce) {',
        '  .to-top { transition: none; }',
        '}',
      ].join('\n');
      document.head.appendChild(style);
    })();
  }


  /* ─────────────────────────────────────────────
     8. LEDGER ROW FILTER (optional progressive enhancement)
     Adds keyboard-accessible type filtering on the career ledger.
  ───────────────────────────────────────────── */

  (function initLedgerFilter() {
    const ledger = document.querySelector('.ledger');
    if (!ledger) return;

    // Gather distinct types from data-type attributes
    const rows = ledger.querySelectorAll('.ledger-row[data-type]');
    if (!rows.length) return;

    const types = ['all'];
    rows.forEach(function (row) {
      const t = row.getAttribute('data-type');
      if (t && !types.includes(t)) types.push(t);
    });

    // Only render filter if we have multiple types
    if (types.length <= 2) return;

    // Build filter bar
    const filterBar = document.createElement('div');
    filterBar.className = 'ledger-filter';
    filterBar.setAttribute('role', 'group');
    filterBar.setAttribute('aria-label', 'Filter career entries by type');

    // Inject filter bar styles
    const style = document.createElement('style');
    style.textContent = [
      '.ledger-filter {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 0.5rem;',
      '  margin-bottom: 1.5rem;',
      '}',
      '.ledger-filter-btn {',
      '  padding: 0.3rem 0.9rem;',
      '  border: 1px solid var(--border, #d4c9b5);',
      '  background: transparent;',
      '  border-radius: 2px;',
      '  font-size: 0.78rem;',
      '  font-family: inherit;',
      '  letter-spacing: 0.03em;',
      '  text-transform: capitalize;',
      '  cursor: pointer;',
      '  color: var(--ink-3, #6b6455);',
      '  transition: background 0.2s, color 0.2s, border-color 0.2s;',
      '}',
      '.ledger-filter-btn:hover,',
      '.ledger-filter-btn:focus-visible {',
      '  background: var(--ink-1, #2b2318);',
      '  color: var(--page, #faf8f3);',
      '  border-color: var(--ink-1, #2b2318);',
      '  outline: none;',
      '}',
      '.ledger-filter-btn[aria-pressed="true"] {',
      '  background: var(--ink-1, #2b2318);',
      '  color: var(--page, #faf8f3);',
      '  border-color: var(--ink-1, #2b2318);',
      '}',
      '.ledger-row[hidden] { display: none; }',
    ].join('\n');
    document.head.appendChild(style);

    types.forEach(function (type) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ledger-filter-btn';
      btn.textContent = type === 'all' ? 'All Entries' : type;
      btn.setAttribute('aria-pressed', type === 'all' ? 'true' : 'false');
      btn.dataset.filter = type;

      btn.addEventListener('click', function () {
        filterBar.querySelectorAll('.ledger-filter-btn').forEach(function (b) {
          b.setAttribute('aria-pressed', 'false');
        });
        btn.setAttribute('aria-pressed', 'true');

        rows.forEach(function (row) {
          if (type === 'all' || row.getAttribute('data-type') === type) {
            row.removeAttribute('hidden');
          } else {
            row.setAttribute('hidden', '');
          }
        });
      });

      filterBar.appendChild(btn);
    });

    // Insert filter bar before the ledger head
    const ledgerHead = ledger.querySelector('.ledger-head');
    if (ledgerHead) {
      ledger.parentElement.insertBefore(filterBar, ledger);
    }
  })();


  /* ─────────────────────────────────────────────
     9. NAVBAR ACTIVE STATE STYLES (injected, non-destructive)
  ───────────────────────────────────────────── */

  (function injectNavStyles() {
    const style = document.createElement('style');
    style.textContent = [
      /* Active nav link */
      '.nav-links a.is-active {',
      '  opacity: 1;',
      '  font-weight: 600;',
      '}',
      /* Hamburger × animation */
      '.hamburger.is-active span:nth-child(1) {',
      '  transform: translateY(7px) rotate(45deg);',
      '}',
      '.hamburger.is-active span:nth-child(2) {',
      '  opacity: 0;',
      '  transform: scaleX(0);',
      '}',
      '.hamburger.is-active span:nth-child(3) {',
      '  transform: translateY(-7px) rotate(-45deg);',
      '}',
      /* Scrolled navbar shadow */
      '#navbar.is-scrolled {',
      '  box-shadow: 0 1px 12px rgba(43,35,24,0.10);',
      '}',
      /* Mobile nav open state */
      '@media (max-width: 767px) {',
      '  .nav-links.is-open {',
      '    display: flex;',
      '    flex-direction: column;',
      '    position: absolute;',
      '    top: 100%;',
      '    left: 0;',
      '    right: 0;',
      '    background: var(--page, #faf8f3);',
      '    border-top: 1px solid var(--border, #d4c9b5);',
      '    border-bottom: 1px solid var(--border, #d4c9b5);',
      '    padding: 1rem 1.25rem 1.25rem;',
      '    gap: 0.15rem;',
      '    z-index: 999;',
      '    box-shadow: 0 6px 24px rgba(43,35,24,0.12);',
      '    animation: menuSlideDown 0.22s cubic-bezier(0.22,1,0.36,1);',
      '  }',
      '  @keyframes menuSlideDown {',
      '    from { opacity: 0; transform: translateY(-8px); }',
      '    to   { opacity: 1; transform: translateY(0); }',
      '  }',
      '  @media (prefers-reduced-motion: reduce) {',
      '    .nav-links.is-open { animation: none; }',
      '  }',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  })();


  /* ─────────────────────────────────────────────
     10. PRINT HANDLING
     Expand all hidden/animated elements before print
  ───────────────────────────────────────────── */

  window.addEventListener('beforeprint', function () {
    document.querySelectorAll('.sr-hidden').forEach(function (el) {
      el.classList.remove('sr-hidden');
      el.classList.add('sr-visible');
    });
    document.querySelectorAll('[hidden]').forEach(function (el) {
      el.removeAttribute('hidden');
    });
  });


  /* ─────────────────────────────────────────────
     11. FOCUS-VISIBLE POLYFILL GUARD
     Ensures :focus-visible behaviour for older browsers
  ───────────────────────────────────────────── */

  (function focusVisibleGuard() {
    try {
      document.querySelector(':focus-visible');
    } catch (e) {
      // Browser doesn't support :focus-visible; add JS-based class
      document.addEventListener('keydown', function () {
        document.body.classList.add('kb-nav');
      });
      document.addEventListener('mousedown', function () {
        document.body.classList.remove('kb-nav');
      });
      const style = document.createElement('style');
      style.textContent = 'body:not(.kb-nav) *:focus { outline: none; }';
      document.head.appendChild(style);
    }
  })();


  /* ─────────────────────────────────────────────
     12. INIT LOG (dev-only, stripped in production)
  ───────────────────────────────────────────── */

  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost'
  ) {
    console.log('[ZIK Portfolio] script.js initialised ✓');
  }

})(); // end IIFE
