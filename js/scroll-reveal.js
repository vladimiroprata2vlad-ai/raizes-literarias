/* ============================================
   RAÍZES LITERÁRIAS - Scroll Reveal
   ============================================ */

class ScrollReveal {
  constructor() {
    this.elements = [];
    this.init();
  }

  init() {
    // Find all elements with reveal classes
    this.elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    // Create observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Optional: unobserve after revealing
          // this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements
    this.elements.forEach(el => {
      this.observer.observe(el);
    });

    // Add reveal classes to existing elements
    this.addRevealClasses();
  }

  addRevealClasses() {
    // Add reveal classes to common elements
    const selectors = [
      '.feature-card',
      '.livro-card',
      '.pais-card',
      '.comunidade-card',
      '.entrevista-card',
      '.download-card',
      '.audio-card',
      '.section-title'
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((el, index) => {
        if (!el.classList.contains('reveal') &&
            !el.classList.contains('reveal-left') &&
            !el.classList.contains('reveal-right') &&
            !el.classList.contains('reveal-scale')) {
          el.classList.add('reveal');
          el.classList.add(`stagger-${(index % 6) + 1}`);
          this.observer.observe(el);
        }
      });
    });
  }

  // Method to manually trigger reveal
  reveal(element) {
    element.classList.add('active');
  }

  // Method to reset reveal
  reset(element) {
    element.classList.remove('active');
  }
}

// Parallax Effect
class Parallax {
  constructor() {
    this.elements = [];
    this.init();
  }

  init() {
    // Find parallax elements
    this.elements = document.querySelectorAll('[data-parallax]');

    // Listen for scroll
    window.addEventListener('scroll', () => this.update());

    // Initial update
    this.update();
  }

  update() {
    const scrollY = window.scrollY;

    this.elements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const windowCenter = window.innerHeight / 2;
      const offset = (centerY - windowCenter) * speed;

      el.style.transform = `translateY(${offset}px)`;
    });
  }
}

// Smooth Scroll with Lenis (optional enhancement)
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    // Add smooth scroll to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
}

// Counter Animation
class CounterAnimation {
  constructor() {
    this.counters = [];
    this.init();
  }

  init() {
    this.counters = document.querySelectorAll('[data-counter]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    this.counters.forEach(counter => observer.observe(counter));
  }

  animateCounter(element) {
    const target = parseInt(element.dataset.counter);
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(updateCounter);
  }
}

// Tilt Effect
class TiltEffect {
  constructor() {
    this.elements = [];
    this.init();
  }

  init() {
    this.elements = document.querySelectorAll('[data-tilt]');

    this.elements.forEach(el => {
      el.addEventListener('mousemove', (e) => this.handleMove(e, el));
      el.addEventListener('mouseleave', (e) => this.handleLeave(e, el));
    });
  }

  handleMove(e, el) {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }

  handleLeave(e, el) {
    el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  }
}

// Initialize all effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Scroll Reveal
  window.scrollReveal = new ScrollReveal();

  // Parallax
  window.parallax = new Parallax();

  // Smooth Scroll
  window.smoothScroll = new SmoothScroll();

  // Counter Animation
  window.counterAnimation = new CounterAnimation();

  // Tilt Effect (only on desktop)
  if (window.innerWidth > 768) {
    window.tiltEffect = new TiltEffect();
  }
});
