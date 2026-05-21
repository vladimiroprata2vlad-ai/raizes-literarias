/* ============================================
   RAÍZES LITERÁRIAS - Particle System
   ============================================ */

class ParticleSystem {
  constructor() {
    this.container = null;
    this.particles = [];
    this.maxParticles = 30;
    this.init();
  }

  init() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'particles-container';
    document.body.appendChild(this.container);

    // Create particles
    this.createParticles();

    // Animate
    this.animate();
  }

  createParticles() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.createParticle();
    }
  }

  createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random properties
    const size = Math.random() * 6 + 2;
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 10;
    const opacity = Math.random() * 0.3 + 0.1;

    // Apply styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.opacity = opacity;

    // Random color
    const colors = ['#D4A843', '#C75B39', '#E8C96A'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    this.container.appendChild(particle);
    this.particles.push(particle);
  }

  animate() {
    // Particles are animated via CSS
    // This method can be extended for more complex animations
  }

  // Method to add more particles on interaction
  addBurst(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.position = 'fixed';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = '4px';
      particle.style.height = '4px';
      particle.style.background = '#D4A843';
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '9999';

      document.body.appendChild(particle);

      // Animate
      const angle = (Math.PI * 2 * i) / count;
      const velocity = 50 + Math.random() * 50;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      let posX = x;
      let posY = y;
      let opacity = 1;

      const animate = () => {
        posX += vx * 0.02;
        posY += vy * 0.02;
        opacity -= 0.02;

        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.opacity = opacity;

        if (opacity > 0) {
          requestAnimationFrame(animate);
        } else {
          particle.remove();
        }
      };

      requestAnimationFrame(animate);
    }
  }
}

// Initialize particle system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on pages with hero section
  if (document.querySelector('.hero') || document.querySelector('.page-hero')) {
    window.particleSystem = new ParticleSystem();
  }
});

// Add burst effect on button clicks
document.addEventListener('click', (e) => {
  if (e.target.closest('.btn') && window.particleSystem) {
    const rect = e.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    window.particleSystem.addBurst(x, y, 8);
  }
});
