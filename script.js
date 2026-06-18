// ==========================================
// EDRIAN BAYRON PORTFOLIO - MAIN SCRIPT (YOUTUBE EMBED VERSION)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // ========== AMBIENT PARTICLES ==========
  initParticles();

  // ========== CUSTOM CURSOR ==========
  initCustomCursor();

  // ========== NAVBAR SCROLL EFFECT ==========
  initNavbar();

  // ========== SCROLL REVEAL ANIMATIONS ==========
  initScrollReveal();

  // ========== YOUTUBE VIDEO OBSERVER & OVERLAY ==========
  initYouTubeObserver();

  // ========== COPY TO CLIPBOARD ==========
  initCopyButtons();

  // ========== SMOOTH NAV SCROLLING ==========
  initSmoothNav();
});

// ==========================================
// AMBIENT PARTICLES
// ==========================================
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 107, 0, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 107, 0, ${0.04 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// ==========================================
// CUSTOM CURSOR
// ==========================================
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;
  if (window.innerWidth <= 768) return;

  let cursorX = 0, cursorY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    cursor.classList.add('visible');
  });
  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('visible');
  });

  const videoCards = document.querySelectorAll('[data-video-card]');
  videoCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      cursor.classList.add('expanded');
    });
    card.addEventListener('mouseleave', () => {
      cursor.classList.remove('expanded');
    });
  });

  const contactCards = document.querySelectorAll('.contact-card');
  contactCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      cursor.classList.add('expanded');
    });
    card.addEventListener('mouseleave', () => {
      cursor.classList.remove('expanded');
    });
  });

  function updateCursor() {
    currentX += (cursorX - currentX) * 0.15;
    currentY += (cursorY - currentY) * 0.15;
    cursor.style.left = currentX + 'px';
    cursor.style.top = currentY + 'px';
    requestAnimationFrame(updateCursor);
  }
  updateCursor();
}

// ==========================================
// NAVBAR SCROLL
// ==========================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ==========================================
// SCROLL REVEAL
// ==========================================
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });
  reveals.forEach(el => observer.observe(el));
}

// ==========================================
// YOUTUBE VIDEO OBSERVER & OVERLAY
// ==========================================
function initYouTubeObserver() {
  const videoSections = document.querySelectorAll('[data-video-section]');

  // Track active video state
  let activeVideoId = null;

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const section = entry.target;
      const card = section.querySelector('[data-video-card]');
      const overlay = section.querySelector('[data-video-overlay]');
      const videoId = section.dataset.videoId;
      const iframe = section.querySelector('iframe');

      if (!card || !iframe) return;

      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        // This section is now active — pause all other videos first
        videoSections.forEach(otherSection => {
          if (otherSection !== section) {
            const otherCard = otherSection.querySelector('[data-video-card]');
            const otherOverlay = otherSection.querySelector('[data-video-overlay]');
            const otherIframe = otherSection.querySelector('iframe');
            const otherId = otherSection.dataset.videoId;

            if (otherIframe && otherId) {
              // Post "pause" message to YouTube iframe
              otherIframe.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
                '*'
              );
            }
            if (otherCard) {
              otherCard.classList.remove('playing');
              otherCard.classList.add('is-paused');
            }
            if (otherOverlay) otherOverlay.style.opacity = '1';
          }
        });

        // Mark this card as playing
        card.classList.add('playing');
        card.classList.remove('is-paused');
        if (overlay) overlay.style.opacity = '0';
        activeVideoId = videoId;

      } else {
        // Section left viewport — pause this video
        if (iframe && videoId) {
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
            '*'
          );
        }
        card.classList.remove('playing');
        card.classList.add('is-paused');
        if (overlay) overlay.style.opacity = '1';
      }
    });
  }, {
    threshold: 0.6
  });

  videoSections.forEach(section => {
    videoObserver.observe(section);

    const card = section.querySelector('[data-video-card]');
    const overlay = section.querySelector('[data-video-overlay]');
    const iframe = section.querySelector('iframe');

    if (!card || !overlay || !iframe) return;

    // Overlay click handler — play the video
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();

      // Pause all other videos first
      videoSections.forEach(otherSection => {
        if (otherSection !== section) {
          const otherCard = otherSection.querySelector('[data-video-card]');
          const otherOverlay = otherSection.querySelector('[data-video-overlay]');
          const otherIframe = otherSection.querySelector('iframe');

          if (otherIframe) {
            otherIframe.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
              '*'
            );
          }
          if (otherCard) {
            otherCard.classList.remove('playing');
            otherCard.classList.add('is-paused');
          }
          if (otherOverlay) otherOverlay.style.opacity = '1';
        }
      });

      // Play this video
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );

      card.classList.add('playing');
      card.classList.remove('is-paused');
      overlay.style.opacity = '0';
      activeVideoId = section.dataset.videoId;
    });

    // Card click handler (when not clicking overlay) — toggle play/pause
    card.addEventListener('click', (e) => {
      // Don't toggle if clicking on overlay or iframe
      if (overlay.contains(e.target)) return;

      if (card.classList.contains('playing')) {
        // Currently playing — pause it
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
        card.classList.remove('playing');
        card.classList.add('is-paused');
        overlay.style.opacity = '1';
      } else {
        // Currently paused — play it (pause others first)
        videoSections.forEach(otherSection => {
          if (otherSection !== section) {
            const otherCard = otherSection.querySelector('[data-video-card]');
            const otherOverlay = otherSection.querySelector('[data-video-overlay]');
            const otherIframe = otherSection.querySelector('iframe');

            if (otherIframe) {
              otherIframe.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
                '*'
              );
            }
            if (otherCard) {
              otherCard.classList.remove('playing');
              otherCard.classList.add('is-paused');
            }
            if (otherOverlay) otherOverlay.style.opacity = '1';
          }
        });

        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
        card.classList.add('playing');
        card.classList.remove('is-paused');
        overlay.style.opacity = '0';
        activeVideoId = section.dataset.videoId;
      }
    });
  });
}

// ==========================================
// COPY TO CLIPBOARD
// ==========================================
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.contact-card');
      if (!card) return;
      const copyValue = card.dataset.copy;
      const copyType = card.dataset.copyType;
      navigator.clipboard.writeText(copyValue).then(() => {
        showToast(`${copyType} copied to clipboard!`);
      }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = copyValue;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`${copyType} copied to clipboard!`);
      });
    });
  });

  const contactCards = document.querySelectorAll('.contact-card');
  contactCards.forEach(card => {
    card.addEventListener('click', () => {
      const copyValue = card.dataset.copy;
      const copyType = card.dataset.copyType;
      navigator.clipboard.writeText(copyValue).then(() => {
        showToast(`${copyType} copied to clipboard!`);
      }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = copyValue;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`${copyType} copied to clipboard!`);
      });
    });
  });

  function showToast(message) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// ==========================================
// SMOOTH NAV SCROLLING
// ==========================================
function initSmoothNav() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}