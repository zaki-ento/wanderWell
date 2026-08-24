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
  document.addEventListener('shopify:cart:lines-update', async (event) => {
    if (!event.promise) return;
    try {
      const { detail } = await event.promise;
      if (!detail?.didError) {
        // @ts-ignore
        const { CartUpdateEvent } = await import('@theme/events');
        const cartDrawer = document.querySelector('cart-drawer-component');    
        const res = await fetch('/cart.js');
        const cart = await res.json();
        
        const manualEvent = new CartUpdateEvent(cart, 'manual-trigger', {
          itemCount: cart.item_count,
          source: 'fad-refresh',
          sections: {}
        });
        document.dispatchEvent(manualEvent);
        
        // 1 second delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Open the drawer panel
        const themeDrawer = document.querySelector('theme-drawer#cart-drawer');
        if (themeDrawer?.open) {
          themeDrawer.open();
        } else if (cartDrawer?.open) {
          cartDrawer.open();
        }
      }
    } catch (e) {
      // Ignored
    }
  });
  initScrollReveal();
});
