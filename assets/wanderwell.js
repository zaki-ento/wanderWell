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
  // Disable add-to-cart button and show tick during cart request on custom forms
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('.ww-product-form');
    if (!form) return;

    const btn = form.querySelector('button[name="add"]');
    if (btn) {
      setTimeout(() => {
        btn.disabled = true;
        btn.setAttribute('data-added', 'true');
      }, 0);
    }
  });

  // Re-enable button and clear tick when request completes or fails
  const resetCustomFormButtons = () => {
    document.querySelectorAll('.ww-product-form button[name="add"]').forEach((btn) => {
      btn.disabled = false;
      btn.removeAttribute('data-added');
    });
  };

  document.addEventListener('shopify:cart:lines-update', (event) => {
    if (event.promise) {
      event.promise.then(resetCustomFormButtons).catch(resetCustomFormButtons);
    } else {
      resetCustomFormButtons();
    }
  });

  document.addEventListener('shopify:cart:error', resetCustomFormButtons);

  initScrollReveal();
});
