import VanillaTilt from 'vanilla-tilt';

document.documentElement.classList.add('js');

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class App {
  constructor() {
    this.init();
  }

  init() {
    this.setupLoader();
    this.setupNavMarker();
    this.setupTilt();
    this.setupReveal();
  }

  // Fade the spinner out once the page has loaded, then remove it from layout
  setupLoader() {
    const spinner = document.querySelector('.spinner');
    if (!spinner) return;

    const hide = () => {
      spinner.classList.add('is-done');
      setTimeout(() => { spinner.style.display = 'none'; }, 400);
    };

    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide, { once: true });
    }
  }

  // Active state comes from aria-current in the markup; JS only positions and glides the marker
  setupNavMarker() {
    const nav = document.querySelector('ul.header');
    const marker = nav && nav.querySelector('#marker');
    if (!marker) return;

    const items = nav.querySelectorAll('li');
    const current = nav.querySelector('a[aria-current="page"]');
    const place = (li) => {
      marker.style.left = `${li.offsetLeft}px`;
      marker.style.top = `${li.offsetTop}px`;
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
    if (prefersReducedMotion()) return;

    // Project cards: per-card glare strength comes from their data-tilt-* attributes
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
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
