/**
 * PORTFOLIO VITRINE - HAWA DIARRA
 * Lead Front-End & UX Interactivity Script
 * Supports Dynamic 3-Column Carousels (Videos & Visuals), HTML5 Video Player, Lightbox, and Toast Copy
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initSmoothScroll();
  
  // Initialize Carousels for Videos & Visuals (3 visible items on desktop, dynamic autoplay, manual arrows)
  const videoCarousel = createCarousel({
    wrapperId: 'videoCarouselWrapper',
    trackId: 'videoTrack',
    prevBtnId: 'videoPrevBtn',
    nextBtnId: 'videoNextBtn',
    dotsId: 'videoDots',
    autoPlayInterval: 3800
  });

  const graphicsCarousel = createCarousel({
    wrapperId: 'graphicsCarouselWrapper',
    trackId: 'graphicsTrack',
    prevBtnId: 'graphicsPrevBtn',
    nextBtnId: 'graphicsNextBtn',
    dotsId: 'graphicsDots',
    autoPlayInterval: 4200
  });

  initGraphicLightbox(graphicsCarousel);
  initVideoModal(videoCarousel);
  initContactCopy();
});

/* -------------------------------------------------------------------------
   1. REUSABLE DYNAMIC CAROUSEL ENGINE (1 ROW • 3 COLUMNS • AUTOPLAY • ARROWS)
   ------------------------------------------------------------------------- */
function createCarousel({
  wrapperId,
  trackId,
  prevBtnId,
  nextBtnId,
  dotsId,
  autoPlayInterval = 3800
}) {
  const wrapper = document.getElementById(wrapperId);
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);
  const dotsContainer = document.getElementById(dotsId);

  if (!wrapper || !track || !prevBtn || !nextBtn) return null;

  const items = Array.from(track.children);
  const totalItems = items.length;
  let currentIndex = 0;
  let autoPlayTimer = null;
  let isHovered = false;

  function getVisibleCount() {
    const width = window.innerWidth;
    if (width > 1024) return 3;
    if (width > 640) return 2;
    return 1;
  }

  function getMaxIndex() {
    const visible = getVisibleCount();
    return Math.max(0, totalItems - visible);
  }

  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();

    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `carousel-dot ${i === currentIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Diapositive ${i + 1}`);
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goToIndex(i);
        restartAutoPlay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function updateTrackPosition() {
    if (totalItems === 0) return;
    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) currentIndex = maxIdx;

    const firstItem = items[0];
    const itemWidth = firstItem.getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 24;
    const offset = currentIndex * (itemWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  function goToIndex(index) {
    const maxIdx = getMaxIndex();
    if (index < 0) {
      currentIndex = maxIdx;
    } else if (index > maxIdx) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    updateTrackPosition();
  }

  function next() {
    const maxIdx = getMaxIndex();
    if (currentIndex >= maxIdx) {
      goToIndex(0);
    } else {
      goToIndex(currentIndex + 1);
    }
  }

  function prev() {
    const maxIdx = getMaxIndex();
    if (currentIndex <= 0) {
      goToIndex(maxIdx);
    } else {
      goToIndex(currentIndex - 1);
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (!isHovered) {
      autoPlayTimer = setInterval(next, autoPlayInterval);
    }
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Arrow Clicks
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    next();
    restartAutoPlay();
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    prev();
    restartAutoPlay();
  });

  // Pause on hover
  wrapper.addEventListener('mouseenter', () => {
    isHovered = true;
    stopAutoPlay();
  });

  wrapper.addEventListener('mouseleave', () => {
    isHovered = false;
    startAutoPlay();
  });

  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  wrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoPlay();
  }, { passive: true });

  wrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
    }
    startAutoPlay();
  }, { passive: true });

  // Handle Resize
  window.addEventListener('resize', () => {
    renderDots();
    updateTrackPosition();
  });

  // Initial initialization
  renderDots();
  setTimeout(updateTrackPosition, 60);
  startAutoPlay();

  return {
    pause: stopAutoPlay,
    resume: startAutoPlay,
    next,
    prev
  };
}

/* -------------------------------------------------------------------------
   2. STICKY HEADER GLASS EFFECT
   ------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* -------------------------------------------------------------------------
   3. SMOOTH SCROLL WITH OFFSET
   ------------------------------------------------------------------------- */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* -------------------------------------------------------------------------
   4. LIGHTBOX POUR CRÉATIONS GRAPHIQUES & AFFICHES
   ------------------------------------------------------------------------- */
function initGraphicLightbox(carouselInstance) {
  const modal = document.getElementById('graphicModal');
  const modalImg = document.getElementById('modalGraphicImg');
  const modalTitle = document.getElementById('modalGraphicTitle');
  const modalDesc = document.getElementById('modalGraphicDesc');
  const closeBtn = document.getElementById('closeGraphicModal');
  const bentoCards = document.querySelectorAll('.bento-card');

  if (!modal || !modalImg) return;

  bentoCards.forEach(card => {
    card.addEventListener('click', () => {
      if (carouselInstance) carouselInstance.pause();

      const img = card.querySelector('.bento-img');
      const title = card.querySelector('.bento-title')?.textContent || 'Création Visuelle';
      const desc = card.querySelector('.bento-desc')?.textContent || '';

      if (img) {
        modalImg.src = img.src;
        modalImg.alt = img.alt || title;
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (carouselInstance) carouselInstance.resume();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* -------------------------------------------------------------------------
   5. MODAL PLAYER VIDÉO FORMAT VERTICAL (LECTEUR HTML5 RÉEL)
   ------------------------------------------------------------------------- */
function initVideoModal(carouselInstance) {
  const videoModal = document.getElementById('videoModal');
  const modalRealVideo = document.getElementById('modalRealVideo');
  const modalVideoTitle = document.getElementById('modalVideoTitle');
  const modalVideoSubtitle = document.getElementById('modalVideoSubtitle');
  const modalVideoTool = document.getElementById('modalVideoTool');
  const modalVideoCta = document.getElementById('modalVideoCta');
  const closeBtn = document.getElementById('closeVideoModal');

  const videoCards = document.querySelectorAll('.phone-mockup-card');

  if (!videoModal || !modalRealVideo) return;

  videoCards.forEach(card => {
    const trigger = card.querySelector('.phone-screen') || card;
    const viewBtn = card.querySelector('.phone-card-btn');

    const openHandler = () => {
      if (carouselInstance) carouselInstance.pause();

      const videoSrc = card.getAttribute('data-video-src');
      const title = card.getAttribute('data-video-title') || 'Réalisation Vidéo';
      const desc = card.getAttribute('data-video-desc') || '';
      const tool = card.getAttribute('data-video-tool') || 'CapCut';

      if (modalVideoTitle) modalVideoTitle.textContent = title;
      if (modalVideoSubtitle) modalVideoSubtitle.textContent = desc;
      if (modalVideoTool) modalVideoTool.textContent = tool;

      if (modalVideoCta) {
        modalVideoCta.href = `https://wa.me/22391260507?text=${encodeURIComponent(`Bonjour Hawa, j'ai visionné votre vidéo "${title}" et je souhaite un format similaire pour mon projet.`)}`;
      }

      if (videoSrc) {
        modalRealVideo.src = videoSrc;
        modalRealVideo.load();
        modalRealVideo.play().catch(() => {
          // Play prevented by policy
        });
      }

      videoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    if (trigger) trigger.addEventListener('click', openHandler);
    if (viewBtn) viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openHandler();
    });
  });

  const closeVideo = () => {
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    if (modalRealVideo) {
      modalRealVideo.pause();
      modalRealVideo.currentTime = 0;
      modalRealVideo.src = '';
    }
    if (carouselInstance) carouselInstance.resume();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeVideo);

  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) closeVideo();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('active')) {
      closeVideo();
    }
  });
}

/* -------------------------------------------------------------------------
   6. COPIE RAPIDE DES COORDONNÉES & NOTIFICATION TOAST
   ------------------------------------------------------------------------- */
function initContactCopy() {
  const copyBtn = document.getElementById('copyContactBtn');
  const toast = document.getElementById('toastNotice');

  if (!copyBtn || !toast) return;

  copyBtn.addEventListener('click', () => {
    const contactInfo = `Hawa DIARRA - Community Manager & Créatrice Contenu Vidéo
Email : hsoufianadiarra@gmail.com
WhatsApp : +223 91 26 05 07
Localisation : Bamako, Mali`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(contactInfo).then(() => {
        showToast('✅ Coordonnées copiées dans le presse-papier !');
      }).catch(() => {
        fallbackCopyText(contactInfo);
      });
    } else {
      fallbackCopyText(contactInfo);
    }
  });

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('✅ Coordonnées copiées !');
    } catch (err) {
      showToast('Contact : +223 91 26 05 07');
    }
    document.body.removeChild(textArea);
  }

  function showToast(message) {
    const toastText = toast.querySelector('.toast-text');
    if (toastText) toastText.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}
