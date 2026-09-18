/**
 * WanderWell Theme - Product Upgrade / Upsell Handler
 * Swaps cart line items with upgraded variant using Cart AJAX API and Section Rendering API.
 */

window.WanderWell = window.WanderWell || {};

/**
 * Handles upgrading a line item in the cart or AJAX cart drawer.
 * @param {HTMLElement|Event} target - The clicked button element or click event.
 */
window.WanderWell.upgradeCartItem = async function(target) {
  const btn = target instanceof HTMLElement 
    ? target 
    : (target && target.currentTarget instanceof HTMLElement ? target.currentTarget : document.querySelector('.cart-upsell-btn'));

  if (!btn || btn.disabled || btn.classList.contains('is-loading')) return;

  const upsellCard = btn.closest('.cart-upsell');
  if (!upsellCard) return;

  const lineKey = upsellCard.dataset.lineKey;
  const lineIndex = upsellCard.dataset.lineIndex;
  const upgradeId = upsellCard.dataset.upgradeId;
  const currentQuantity = parseInt(upsellCard.dataset.quantity || '1', 10);

  if (!upgradeId) {
    console.error('[WW Upgrade] Missing upgrade variant ID');
    return;
  }

  // 1. Set Loading UI State
  const btnText = btn.querySelector('.cart-upsell-btn-text');
  const spinner = btn.querySelector('.cart-upsell-btn-spinner');
  
  btn.disabled = true;
  btn.classList.add('is-loading');
  if (btnText) btnText.textContent = 'Upgrading...';
  if (spinner) spinner.style.display = 'inline-block';

  try {
    // Collect target sections to update via Section Rendering API
    const cartItemsComponent = upsellCard.closest('cart-items-component');
    const sectionsToUpdate = new Set(['cart-drawer-section', 'cart-icon-bubble']);
    if (cartItemsComponent && cartItemsComponent.dataset.sectionId) {
      sectionsToUpdate.add(cartItemsComponent.dataset.sectionId);
    }
    const sectionsParam = Array.from(sectionsToUpdate).join(',');

    const rootUrl = window.Shopify?.routes?.root || '/';

    // 2. Perform Line Item Swap via AJAX
    // Step A: Remove current line item
    if (lineKey || lineIndex) {
      await fetch(`${rootUrl}cart/change.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          id: lineKey || lineIndex,
          quantity: 0
        })
      });
    }

    // Step B: Add upgrade variant to cart with requested sections
    const addResponse = await fetch(`${rootUrl}cart/add.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        id: parseInt(upgradeId, 10),
        quantity: currentQuantity > 0 ? currentQuantity : 1,
        sections: sectionsParam,
        sections_url: window.location.pathname
      })
    });

    if (!addResponse.ok) {
      throw new Error(`Cart add failed with status ${addResponse.status}`);
    }

    const addData = await addResponse.json();

    // 3. Render Section HTML & Morph Cart DOM
    let morphSuccess = false;

    if (addData.sections) {
      const morphModule = await import('@theme/section-renderer').catch(() => null);

      if (morphModule && typeof morphModule.morphSection === 'function') {
        const activeSectionId = cartItemsComponent?.dataset?.sectionId || 'cart-drawer-section';
        const sectionHtml = addData.sections[activeSectionId] || addData.sections['cart-drawer-section'];

        if (sectionHtml) {
          const isDrawer = Boolean(document.querySelector('cart-drawer-component'));
          morphModule.morphSection(activeSectionId, sectionHtml, {
            mode: isDrawer ? 'hydration' : 'full'
          });
          morphSuccess = true;
        }
      }
    }

    // 4. Trigger Events for Cart Count & Drawer Updates
    const eventsModule = await import('@shopify/events').catch(() => null);
    if (eventsModule && eventsModule.CartLinesUpdateEvent) {
      document.dispatchEvent(
        new eventsModule.CartLinesUpdateEvent({
          action: 'add',
          context: 'cart',
          lines: [{ id: upgradeId, quantity: currentQuantity }]
        })
      );
    } else {
      document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true, detail: addData }));
    }

    // Ensure cart drawer remains open smoothly
    const drawer = document.querySelector('theme-drawer#cart-drawer');
    if (drawer && typeof drawer.open === 'function') {
      drawer.open();
    }

    if (!morphSuccess) {
      // Fallback if section target missing
      window.location.reload();
    }

  } catch (error) {
    console.error('[WW Upgrade] Error during cart item upgrade:', error);
    window.location.reload();
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btnText) btnText.textContent = 'Upgrade';
      if (spinner) spinner.style.display = 'none';
    }
  }
};

/**
 * Global shorthand for inline HTML onclick="upgradeToDuo()"
 * @param {HTMLElement} [btnElement]
 */
window.upgradeToDuo = function(btnElement) {
  window.WanderWell.upgradeCartItem(btnElement || window.event?.target);
};
