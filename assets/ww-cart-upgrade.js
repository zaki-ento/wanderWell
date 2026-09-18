import { morphSection, sectionRenderer } from '@theme/section-renderer';
import { StandardEvents, CartLinesUpdateEvent, CartErrorEvent } from '@shopify/events';

/**
 * Custom element managing the WanderWell Cart Upgrade interaction.
 * Replaces or adds upgrade products via Shopify AJAX Cart API and
 * updates the Horizon cart drawer smoothly via Section Rendering.
 */
export class WWCartUpgrade extends HTMLElement {
  #isLoading = false;

  get button() {
    return this.querySelector('[data-upgrade-button]');
  }

  get errorContainer() {
    return this.querySelector('.ww-cart-upgrade__error');
  }

  connectedCallback() {
    this.button?.addEventListener('click', this.#handleUpgradeClick);
  }

  disconnectedCallback() {
    this.button?.removeEventListener('click', this.#handleUpgradeClick);
  }

  /**
   * Sets loading state on the upgrade button.
   * @param {boolean} loading
   */
  #setLoading(loading) {
    this.#isLoading = loading;
    if (!this.button) return;

    if (loading) {
      this.button.setAttribute('disabled', 'true');
      this.button.classList.add('is-loading');
      this.button.setAttribute('aria-busy', 'true');
    } else {
      this.button.removeAttribute('disabled');
      this.button.classList.remove('is-loading');
      this.button.removeAttribute('aria-busy');
    }
  }

  /**
   * Displays an error message to the customer.
   * @param {string} message
   */
  #showError(message) {
    if (!this.errorContainer) return;
    this.errorContainer.textContent = message;
    this.errorContainer.hidden = false;
  }

  /**
   * Clears any active error message.
   */
  #clearError() {
    if (!this.errorContainer) return;
    this.errorContainer.textContent = '';
    this.errorContainer.hidden = true;
  }

  /**
   * Handles clicking the UPGRADE button.
   * @param {Event} event
   */
  #handleUpgradeClick = async (event) => {
    event.preventDefault();
    if (this.#isLoading) return;

    const upgradeVariantId = this.dataset.upgradeVariantId;
    if (!upgradeVariantId) return;

    const parentLineKey = this.dataset.parentLineKey;
    const sellingPlanId = this.dataset.sellingPlanId;
    const upgradeAction = this.dataset.upgradeAction || 'replace';

    this.#clearError();
    this.#setLoading(true);

    try {
      let finalCartData = null;

      const addUrl = window.Theme?.routes?.cart_add_url || '/cart/add.js';
      const changeUrl = window.Theme?.routes?.cart_change_url || '/cart/change.js';

      if (upgradeAction === 'replace' && parentLineKey) {
        // Step 1: Add the upgrade product
        const addPayload = {
          items: [
            {
              id: parseInt(upgradeVariantId, 10),
              quantity: 1,
              ...(sellingPlanId ? { selling_plan: parseInt(sellingPlanId, 10) } : {}),
            },
          ],
        };

        const addResponse = await fetch(addUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(addPayload),
        });

        const addedResult = await addResponse.json();
        if (addedResult.status && addedResult.status >= 400) {
          throw new Error(addedResult.description || addedResult.message || 'Failed to add upgrade product');
        }

        // Step 2: Remove the parent product and request cart-drawer-section
        const changePayload = {
          id: parentLineKey,
          quantity: 0,
          sections: 'cart-drawer-section',
          sections_url: window.location.pathname,
        };

        const changeResponse = await fetch(changeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(changePayload),
        });

        finalCartData = await changeResponse.json();
      } else {
        // Add only mode (keep parent item in cart)
        const addPayload = {
          items: [
            {
              id: parseInt(upgradeVariantId, 10),
              quantity: 1,
              ...(sellingPlanId ? { selling_plan: parseInt(sellingPlanId, 10) } : {}),
            },
          ],
          sections: 'cart-drawer-section',
          sections_url: window.location.pathname,
        };

        const addResponse = await fetch(addUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(addPayload),
        });

        finalCartData = await addResponse.json();
        if (finalCartData.status && finalCartData.status >= 400) {
          throw new Error(finalCartData.description || finalCartData.message || 'Failed to add upgrade product');
        }
      }

      if (finalCartData) {
        // Morph the cart drawer to show the new line items & updated totals
        const sectionHtml = finalCartData.sections?.['cart-drawer-section'];
        if (sectionHtml) {
          await morphSection('cart-drawer-section', sectionHtml, { mode: 'hydration' });
        } else {
          await sectionRenderer.renderSection('cart-drawer-section', {
            cache: false,
            mode: 'hydration',
          });
        }

        // Notify other components (header cart count, live status) of cart update
        const deferredUpdatePromise = CartLinesUpdateEvent.createPromise();
        document.dispatchEvent(
          new CartLinesUpdateEvent({
            action: 'update',
            context: 'cart',
            lines: [{ id: upgradeVariantId, quantity: 1 }],
            promise: deferredUpdatePromise.promise,
          })
        );

        deferredUpdatePromise.resolve({
          cart: CartLinesUpdateEvent.createCartFromAjaxResponse(finalCartData),
          detail: {
            sections: finalCartData.sections,
            items: finalCartData.items,
            itemCount: finalCartData.item_count,
            source: 'ww-cart-upgrade',
            didError: false,
          },
        });

        // Accessibility status announcement
        const statusLiveRegion = document.getElementById('cart-status');
        if (statusLiveRegion) {
          statusLiveRegion.textContent = 'Upgraded product in your cart.';
        }
      }
    } catch (err) {
      console.error('[WWCartUpgrade] Upgrade failed:', err);
      this.#showError(err.message || 'Unable to upgrade. Please try again.');
      this.#setLoading(false);

      this.dispatchEvent(
        new CartErrorEvent({
          error: err.message || 'Cart upgrade error',
          code: 'INVALID',
        })
      );
    }
  };
}

if (!customElements.get('ww-cart-upgrade')) {
  customElements.define('ww-cart-upgrade', WWCartUpgrade);
}
