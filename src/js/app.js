import VanillaTilt from 'vanilla-tilt';

// Note: the `js` class is set by a synchronous inline script in head.html so it
// exists before first paint (kills the no-JS nav flash on reload).

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Tilt needs a hovering pointer; on touch it would only fire on tap and fight scrolling
const canHover = () => window.matchMedia('(hover: hover)').matches;
// The cursor glow is a mouse/pen effect; touch-first devices never get it
const hasFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

class App {
  constructor() {
    this.init();
  }

  init() {
    this.setupNavToggle();
    this.setupNavMarker();
    this.setupTilt();
    this.setupReveal();
    this.setupGlow();
    this.setupVisuals();
    this.setupDemoForm();
  }

  // The square spinner is a permanent decorative element: it loops the
  // rotateplane flip forever (the classic Webly motion). It is never hidden;
  // prefers-reduced-motion stills it via the global guard in base.css.

  // Below 900px the nav is a disclosure menu: button[aria-expanded] toggles it, focus moves in on open,
  // Escape / outside click / tabbing away close it (Escape returns focus to the button)
  setupNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
    const setOpen = (open, restoreFocus = false) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      if (open) (nav.querySelector('a[aria-current="page"]') || nav.querySelector('a')).focus();
      else if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => setOpen(!isOpen()));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        e.preventDefault();
        setOpen(false, true);
      }
    });
    document.addEventListener('click', (e) => {
      if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    nav.addEventListener('focusout', (e) => {
      const next = e.relatedTarget;
      if (isOpen() && next && !nav.contains(next) && next !== toggle) setOpen(false);
    });
    // Crossing into the desktop rail resets the disclosure state
    window.matchMedia('(min-width: 900px)').addEventListener('change', () => setOpen(false));
  }

  // Active state comes from aria-current in the markup; JS only positions and glides the marker
  setupNavMarker() {
    const nav = document.querySelector('.site-nav');
    const marker = nav && nav.querySelector('#marker');
    if (!marker) return;

    const items = nav.querySelectorAll('li');
    const current = nav.querySelector('a[aria-current="page"]');
    const place = (li) => {
      marker.style.left = `${li.offsetLeft}px`;
      marker.style.top = `${li.offsetTop}px`;
      marker.style.width = `${li.offsetWidth}px`;
      marker.style.height = `${li.offsetHeight}px`;
    };

    items.forEach(li => li.addEventListener('click', () => place(li)));

    // Place without gliding on first paint; re-place when icons upgrade and change item heights
    if (current) {
      const currentLi = current.closest('li');
      marker.style.transition = 'none';
      place(currentLi);
      new ResizeObserver(() => {
        marker.style.transition = 'none';
        place(currentLi);
      }).observe(nav);
      requestAnimationFrame(() => requestAnimationFrame(() => { marker.style.transition = ''; }));
    }
  }

  setupTilt() {
    if (prefersReducedMotion() || !canHover()) return;

    // Project cards: per-card glare strength comes from their data-tilt-* attributes.
    // Marked data-tilt-card, not data-tilt: vanilla-tilt auto-inits any [data-tilt] on load,
    // which would bypass the reduced-motion / no-hover guard above.
    VanillaTilt.init(document.querySelectorAll('[data-tilt-card]'), {
      max: 25,
      speed: 400,
      glare: true,
    });

    // Home cards only; the login page's .box is a form wrapper and must not tilt
    VanillaTilt.init(document.querySelectorAll('.container2 .box'), {
      max: 25,
      speed: 400,
      glare: true,
      'max-glare': 0.5,
    });
  }

  // Image slots: if a local image is missing or broken, drop it so the generative art underneath shows
  setupVisuals() {
    document.querySelectorAll('.visual > img').forEach((img) => {
      const drop = () => img.remove();
      if (img.complete && img.naturalWidth === 0) drop();
      else img.addEventListener('error', drop, { once: true });
    });
  }

  // Login is a demo: never submit, read or store anything; just show a notice
  setupDemoForm() {
    const form = document.querySelector('form[data-demo]');
    if (!form) return;

    const notice = form.querySelector('.demo-notice');
    const show = (msg) => {
      notice.textContent = msg;
      notice.hidden = false;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.reset();
      show('Demo only: no account exists, so nothing was submitted.');
    });
    form.querySelectorAll('[data-demo-notice]').forEach((btn) => {
      btn.addEventListener('click', () => show(btn.dataset.demoNotice));
    });
  }

  // Soft highlight under the pointer on glass cards. Only the hovered card does any work: its rect is
  // cached on pointerenter (refreshed after a scroll) and the custom props are written once per frame.
  // Tilt cards are skipped; they carry their own glare.
  setupGlow() {
    if (prefersReducedMotion() || !hasFinePointer()) return;

    document.querySelectorAll('.glass-card:not([data-tilt-card])').forEach((card) => {
      let rect = null;
      let x = 0;
      let y = 0;
      let frame = 0;

      const paint = () => {
        frame = 0;
        if (!rect) rect = card.getBoundingClientRect();
        card.style.setProperty('--glow-x', `${x - rect.left}px`);
        card.style.setProperty('--glow-y', `${y - rect.top}px`);
      };
      const stale = () => { rect = null; };

      card.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch') return;
        rect = card.getBoundingClientRect();
        x = e.clientX;
        y = e.clientY;
        card.classList.add('is-glowing');
        window.addEventListener('scroll', stale, { passive: true });
        if (!frame) frame = requestAnimationFrame(paint);
      });

      card.addEventListener('pointermove', (e) => {
        x = e.clientX;
        y = e.clientY;
        if (!frame) frame = requestAnimationFrame(paint);
      });

      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(frame);
        frame = 0;
        card.classList.remove('is-glowing');
        window.removeEventListener('scroll', stale);
        rect = null;
      });
    });
  }

  // Reveal each .reveal element once as it scrolls into view
  setupReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    targets.forEach(el => observer.observe(el));
  }
}

new App();
