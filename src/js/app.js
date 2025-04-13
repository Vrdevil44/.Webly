import { debounce, throttle, isInViewport } from './utils.js';
import VanillaTilt from 'vanilla-tilt';

class App {
  constructor() {
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupAnimations();
    this.setupEventListeners();
  }

  setupNavigation() {
    const marker = document.querySelector('#marker');
    const list = document.querySelectorAll('ul li');

    const moveIndicator = (e) => {
      marker.style.left = `${e.offsetLeft}px`;
      marker.style.top = `${e.offsetTop}px`;
    };

    const activeLink = (e) => {
      list.forEach(item => item.classList.remove('active'));
      e.currentTarget.classList.add('active');
    };

    list.forEach(link => {
      link.addEventListener('click', (e) => {
        moveIndicator(e.currentTarget);
        activeLink(e);
      });
    });
  }

  setupAnimations() {
    // Initialize VanillaTilt for 3D effects
    VanillaTilt.init(document.querySelectorAll('.box'), {
      max: 25,
      speed: 400,
      glare: true,
      'max-glare': 0.5,
    });

    // Setup intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, {
      threshold: 0.1
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
  }

  setupEventListeners() {
    // Debounced scroll handler
    const handleScroll = debounce(() => {
      // Add scroll-based animations or effects here
    }, 100);

    window.addEventListener('scroll', handleScroll);

    // Throttled resize handler
    const handleResize = throttle(() => {
      // Add resize-based adjustments here
    }, 200);

    window.addEventListener('resize', handleResize);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
}); 