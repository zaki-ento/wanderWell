/**
 * WanderWell Global JS Utilities
 * Shared utilities for motion and interaction.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize scroll-in visibility animations
  const initScrollReveal = () => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.will-animate').forEach(el => {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.will-animate').forEach(el => {
      observer.observe(el);
    });
  };


  initScrollReveal();

  // Close mobile side menu drawer when clicking navigation links (including anchor links)
  document.addEventListener('click', (e) => {
    // @ts-ignore
    const link = e.target.closest('.menu-drawer a');
    if (!link) return;

    // Ignore accordion toggle summaries or non-navigating elements
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const headerDrawer = document.querySelector('header-drawer');
    // @ts-ignore
    if (headerDrawer && typeof headerDrawer.close === 'function' && headerDrawer.isOpen) {
      // @ts-ignore
      headerDrawer.close();
    }
  });

});
