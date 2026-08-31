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
  // // Disable add-to-cart button and show tick during cart request on custom forms
  // document.addEventListener('submit', (e) => {
  //   const form = e.target.closest('.ww-product-form');
  //   if (!form) return;

  //   const btn = form.querySelector('button[name="add"]');
  //   if (btn) {
  //     setTimeout(() => {
  //       btn.disabled = true;
  //       btn.setAttribute('data-added', 'true');
  //     }, 0);
  //   }
  // });

  // // Re-enable button and clear tick when request completes or fails
  // const resetCustomFormButtons = () => {
  //   document.querySelectorAll('.ww-product-form button[name="add"]').forEach((btn) => {
  //     btn.disabled = false;
  //     btn.removeAttribute('data-added');
  //   });
  // };

  // document.addEventListener('shopify:cart:lines-update', (event) => {
  //   if (event.promise) {
  //     event.promise.then(resetCustomFormButtons).catch(resetCustomFormButtons);
  //   } else {
  //     resetCustomFormButtons();
  //   }
  // });

  // document.addEventListener('shopify:cart:error', resetCustomFormButtons);

  initScrollReveal();

  // Global AJAX handler for WW Contact Form
  document.addEventListener('submit', function (e) {
    const form = e.target && e.target.closest ? e.target.closest('.ww-contact-form form, form#ContactForm') : null;
    if (!form || form.dataset.submitting === 'true') return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit, button[type="submit"]');
    const feedbackContainer = form.querySelector('.form-feedback-container') || form.querySelector('.form-feedback');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    const formData = new FormData(form);
    const urlEncodedBody = new URLSearchParams(formData).toString();

    fetch(form.getAttribute('action') || '/contact', {
      method: 'POST',
      body: urlEncodedBody,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/html'
      }
    })
      .then((response) => {
        if (!response.ok && response.status === 400) {
          form.dataset.submitting = 'true';
          form.submit();
          return null;
        }
        return response.text();
      })
      .then((responseText) => {
        if (!responseText) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(responseText, 'text/html');
        const errorElement = doc.querySelector('.form-feedback--error, .errors, .form__message--error');

        if (errorElement) {
          if (feedbackContainer) {
            feedbackContainer.className = 'form-feedback form-feedback--error form-feedback-container';
            feedbackContainer.innerHTML = errorElement.innerHTML;
            feedbackContainer.style.display = 'block';
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        } else {
          const successMsg = form.dataset.successMessage || "Thanks — that's with us. We'll reply within one business day.";
          if (feedbackContainer) {
            feedbackContainer.className = 'form-feedback form-feedback--success form-feedback-container';
            feedbackContainer.textContent = successMsg;
            feedbackContainer.style.display = 'block';
          }
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        }
      })
      .catch((error) => {
        console.error('Contact form submission error:', error);
        form.dataset.submitting = 'true';
        form.submit();
      });
  });

  // Global AJAX handler for WW Email Consent Popup
  document.addEventListener('submit', function (e) {
    const form = e.target && e.target.closest ? e.target.closest('.v2-pop-form, #v2-pop form, #PopupNewsletterForm') : null;
    if (!form || form.dataset.submitting === 'true') return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    e.preventDefault();

    const overlay = document.getElementById('v2-pop') || form.closest('.v2-pop-overlay');
    const pop = overlay ? overlay.querySelector('.v2-pop') : form.closest('.v2-pop');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '...';
    }

    const formData = new FormData(form);
    const urlEncodedBody = new URLSearchParams(formData).toString();

    fetch(form.getAttribute('action') || '/contact#contact_form', {
      method: 'POST',
      body: urlEncodedBody,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/html'
      }
    })
      .then((res) => {
        if (!res.ok && res.status === 400) {
          form.dataset.submitting = 'true';
          form.submit();
          return null;
        }
        return res.text();
      })
      .then((responseText) => {
        if (!responseText) return;
        try {
          localStorage.setItem('ww_signup_done', '1');
        } catch (err) {}
        if (pop) pop.classList.add('done');
      })
      .catch((err) => {
        console.error('Popup signup error:', err);
        form.dataset.submitting = 'true';
        form.submit();
      });
  });
});
