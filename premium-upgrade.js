(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const header = document.querySelector('.site-header');
  const heroArt = document.querySelector('.kb-luxury-hero-art');
  const hero = document.querySelector('.hero');

  // Scroll progress + header state, coalesced into one animation frame.
  const progress = document.createElement('div');
  progress.className = 'kb-page-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  let ticking = false;
  const updateScrollUI = () => {
    ticking = false;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    document.documentElement.style.setProperty('--kb-scroll-progress', Math.min(1, scrollTop / max).toFixed(4));
    header?.classList.toggle('is-scrolled', scrollTop > 8);
  };
  const requestScrollUI = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollUI);
  };
  addEventListener('scroll', requestScrollUI, { passive: true });
  addEventListener('resize', requestScrollUI, { passive: true });
  updateScrollUI();

  // Gentle pointer parallax on the existing hero artwork. No content/layout changes.
  if (!reduceMotion && finePointer && hero && heroArt) {
    let heroFrame = 0;
    hero.addEventListener('pointermove', (event) => {
      if (heroFrame) cancelAnimationFrame(heroFrame);
      const box = hero.getBoundingClientRect();
      const px = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)) - .5;
      const py = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height)) - .5;
      heroFrame = requestAnimationFrame(() => {
        heroArt.style.setProperty('--hero-x', `${(px * 10).toFixed(2)}px`);
        heroArt.style.setProperty('--hero-y', `${(py * 8).toFixed(2)}px`);
      });
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      heroArt.style.setProperty('--hero-x', '0px');
      heroArt.style.setProperty('--hero-y', '0px');
    }, { passive: true });
  }

  // Pointer-local card sheen; intentionally does not read or alter form data.
  if (!reduceMotion && finePointer) {
    document.querySelectorAll('.loan-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', `${x.toFixed(1)}%`);
        card.style.setProperty('--my', `${y.toFixed(1)}%`);
      }, { passive: true });
    });
  }

  // Existing reveal groups get a restrained stagger to improve visual rhythm.
  document.querySelectorAll('.loan-products .reveal').forEach((el, i) => {
    el.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 55}ms`);
  });

  // Improve image loading hints without changing sources or visual dimensions.
  document.querySelectorAll('img:not([fetchpriority="high"])').forEach((img) => {
    if (!img.hasAttribute('loading')) img.loading = 'lazy';
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
  });
})();
