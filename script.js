// ==========================================
// EDRIAN BAYRON PORTFOLIO - YOUTUBE IFRAME API WITH AUTOPLAY ON SCROLL
// ==========================================

// Load YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Global players object
let ytPlayers = {};
let activePlayerId = null;

function onYouTubeIframeAPIReady() {
  initYouTubePlayers();
}

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initParticles();
  initCustomCursor();
  initNavbar();
  initScrollReveal();
  initCopyButtons();
  initSmoothNav();
});

// ==========================================
// YOUTUBE PLAYER INITIALIZATION
// ==========================================
function initYouTubePlayers() {
  const videoSections = document.querySelectorAll('[data-video-section]');

  videoSections.forEach((section) => {
    const card = section.querySelector('[data-video-card]');
    const overlay = section.querySelector('[data-video-overlay]');
    const iframe = section.querySelector('iframe');
    const videoId = section.dataset.videoId;
    const playerId = iframe.id;

    if (!card || !overlay || !iframe || !videoId || !playerId) return;

    // Create YouTube player instance
    ytPlayers[playerId] = new YT.Player(playerId, {
      videoId: videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        iv_load_policy: 3,
        fs: 1,
        enablejsapi: 1
      },
      events: {
        onReady: (event) => {
          // Player is ready but don't autoplay yet — wait for scroll
        },
        onStateChange: (event) => {
          updateCardUI(card, overlay, event.data);
        }
      }
    });

    // Overlay click handler — manual play/pause toggle
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const player = ytPlayers[playerId];
      if (!player || !player.getPlayerState) return;

      const state = player.getPlayerState();

      if (state === YT.PlayerState.PLAYING) {
        // Pause this video
        player.pauseVideo();
        activePlayerId = null;
      } else {
        // Play this video — pause others first
        pauseAllOtherPlayers(playerId);
        player.playVideo();
        player.setPlaybackQuality('hd1080');
        activePlayerId = playerId;
      }
    });

    // Card click to pause (when clicking outside overlay but card is playing)
    card.addEventListener('click', (e) => {
      if (overlay.contains(e.target)) return;

      const player = ytPlayers[playerId];
      if (!player || !player.getPlayerState) return;

      const state = player.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
        activePlayerId = null;
      }
    });
  });

  // Scroll-based autoplay observer
  // Triggers when video is centered in viewport (50% visibility threshold)
  const autoplayObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const section = entry.target;
      const iframe = section.querySelector('iframe');
      const playerId = iframe ? iframe.id : null;
      const card = section.querySelector('[data-video-card]');
      const overlay = section.querySelector('[data-video-overlay]');

      if (!playerId || !ytPlayers[playerId]) return;
      const player = ytPlayers[playerId];

      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        // Video is centered in viewport — autoplay it
        // Only if not already playing
        if (player.getPlayerState && player.getPlayerState() !== YT.PlayerState.PLAYING) {
          pauseAllOtherPlayers(playerId);
          player.playVideo();
          player.setPlaybackQuality('hd1080');
          activePlayerId = playerId;
        }
      } else {
        // Video scrolled away from center — pause it
        if (player.pauseVideo && activePlayerId === playerId) {
          player.pauseVideo();
          activePlayerId = null;
        }
        if (card) {
          card.classList.remove('playing');
          card.classList.add('is-paused');
        }
        if (overlay) overlay.style.opacity = '1';
      }
    });
  }, {
    threshold: [0, 0.25, 0.5, 0.75, 1.0],
    rootMargin: '-10% 0px -10% 0px'  // Consider "center" as middle 80% of viewport
  });

  videoSections.forEach(section => autoplayObserver.observe(section));
}

// ==========================================
// HELPER: Pause all other players
// ==========================================
function pauseAllOtherPlayers(exceptPlayerId) {
  Object.keys(ytPlayers).forEach(key => {
    if (key !== exceptPlayerId) {
      const otherPlayer = ytPlayers[key];
      if (otherPlayer && otherPlayer.pauseVideo) {
        otherPlayer.pauseVideo();
      }
      // Find and reset the card UI for this player
      const otherIframe = document.getElementById(key);
      if (otherIframe) {
        const otherSection = otherIframe.closest('[data-video-section]');
        if (otherSection) {
          const otherCard = otherSection.querySelector('[data-video-card]');
          const otherOverlay = otherSection.querySelector('[data-video-overlay]');
          if (otherCard) {
            otherCard.classList.remove('playing');
            otherCard.classList.add('is-paused');
          }
          if (otherOverlay) otherOverlay.style.opacity = '1';
        }
      }
    }
  });
}

// ==========================================
// HELPER: Update card UI based on player state
// ==========================================
function updateCardUI(card, overlay, playerState) {
  if (!card || !overlay) return;

  if (playerState === YT.PlayerState.PLAYING) {
    card.classList.add('playing');
    card.classList.remove('is-paused');
    overlay.style.opacity = '0';
  } else if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.ENDED) {
    card.classList.remove('playing');
    card.classList.add('is-paused');
    overlay.style.opacity = '1';
  }
}

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
