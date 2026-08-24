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

  // Programmatically open the cart drawer sidebar when cart is successfully updated
  document.addEventListener('shopify:cart:lines-update', (event) => {
    event.promise?.then(({ detail }) => {
      if (!detail?.didError) {
        const cartDrawer = document.querySelector('theme-drawer#cart-drawer');
        if (cartDrawer?.open) {
          cartDrawer.open();
        }
      }
    }).catch(() => { });
  });
  initScrollReveal();
});
