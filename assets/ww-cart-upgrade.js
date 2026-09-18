/**
 * WanderWell Theme - Production-Grade Cart Upgrade / Upsell Engine
 * Handles swapping line items with upgrade variants via Cart AJAX API.
 */

window.WanderWell = window.WanderWell || {};

/**
 * Main Upgrade Action
 * @param {HTMLElement|Event} target
 */
window.WanderWell.upgradeCartItem = async function(target) {
  const btn = target instanceof HTMLElement 
    ? target 
    : (target && target.currentTarget instanceof HTMLElement ? target.currentTarget : document.querySelector('.cart-upsell-btn'));

  if (!btn || btn.disabled || btn.classList.contains('is-loading')) return;

  const card = btn.closest('.cart-upsell');
  if (!card) return;

  const lineKey = card.dataset.lineKey;
  const lineIndex = card.dataset.lineIndex;
  const upgradeId = card.dataset.upgradeId;
  const qty = parseInt(card.dataset.quantity || '1', 10);

  if (!upgradeId) return;

  // 1. Loading UI State
  btn.disabled = true;
  btn.classList.add('is-loading');
  const btnText = btn.querySelector('.cart-upsell-btn-text');
  const spinner = btn.querySelector('.cart-upsell-btn-spinner');
  if (btnText) btnText.textContent = 'Upgrading...';
  if (spinner) spinner.style.display = 'inline-block';

  try {
    const rootUrl = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

    // Step A: Remove current line item
    await fetch(`${rootUrl}cart/change.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        id: lineKey || lineIndex,
        quantity: 0
      })
    });

    // Step B: Add upgrade variant to cart
    const addRes = await fetch(`${rootUrl}cart/add.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        id: parseInt(upgradeId, 10),
        quantity: qty > 0 ? qty : 1
      })
    });

    if (!addRes.ok) {
      throw new Error(`Failed to add upgrade variant (${addRes.status})`);
    }

    // Step C: Re-render Cart DOM smoothly using Section Rendering API
    const cartItemsComp = document.querySelector('cart-items-component');
    const activeSectionId = cartItemsComp?.dataset?.sectionId || 'cart-drawer-section';

    try {
      const sectionRes = await fetch(`${window.location.pathname}?sections=${activeSectionId},cart-drawer-section,cart-icon-bubble`);
      if (sectionRes.ok) {
        const sectionsData = await sectionRes.json();
        const morphModule = await import('@theme/section-renderer').catch(() => null);

        if (morphModule && morphModule.morphSection && sectionsData[activeSectionId]) {
          const isDrawer = Boolean(document.querySelector('cart-drawer-component'));
          morphModule.morphSection(activeSectionId, sectionsData[activeSectionId], {
            mode: isDrawer ? 'hydration' : 'full'
          });
        } else {
          window.location.reload();
          return;
        }
      } else {
        window.location.reload();
        return;
      }
    } catch (e) {
      window.location.reload();
      return;
    }

    // Step D: Open/Maintain Drawer Open State
    const drawer = document.querySelector('theme-drawer#cart-drawer');
    if (drawer && typeof drawer.open === 'function' && !drawer.isOpen) {
      drawer.open();
    }

  } catch (err) {
    console.error('[WanderWell Upsell Error]', err);
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

// Global alias for inline onclick
window.upgradeToDuo = function(btn) {
  window.WanderWell.upgradeCartItem(btn || window.event?.target);
};
