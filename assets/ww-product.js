(function() {
  'use strict';
  
  var selectProductTab = null;

  // Tab control switching
  function initTabs() {
    var shop = document.querySelector('.ww-shop');
    if (!shop) return;
    
    // @ts-ignore
    var seg = shop.querySelector('.ww-seg');
    var ind = shop.querySelector('.ww-seg-ind');
    var buttons = Array.prototype.slice.call(shop.querySelectorAll('.ww-seg-btn'));
    var panels = Array.prototype.slice.call(shop.querySelectorAll('.ww-panel'));
    
    // @ts-ignore
    function moveInd(btn) {
      if (!ind || !btn) return;
      // @ts-ignore
      ind.style.left = btn.offsetLeft + 'px';
      // @ts-ignore
      ind.style.width = btn.offsetWidth + 'px';
    }
    
    // @ts-ignore
    function selectTab(key) {
      // @ts-ignore
      buttons.forEach(function(b) {
        var on = b.getAttribute('data-prod') === key;
        b.classList.toggle('on', on);
        if (on) moveInd(b);
      });
      // @ts-ignore
      panels.forEach(function(p) {
        var on = p.getAttribute('data-prod') === key;
        p.classList.toggle('on', on);
        if (on) {
          // If this panel has subscription options, ensure subscription option is active
          var subOpt = p.querySelector('.ww-sub-opt[data-option-type="subscription"]');
          if (subOpt && !subOpt.classList.contains('on')) {
            var subRadio = subOpt.querySelector('.ww-sub-opt__radio-input');
            if (subRadio) {
              subRadio.checked = true;
              subRadio.dispatchEvent(new Event('change', { bubbles: true }));
            }
            var container = subOpt.closest('.ww-purchase-options');
            if (container) {
              container.querySelectorAll('.ww-sub-opt').forEach(function(item) { item.classList.remove('on'); });
            }
            subOpt.classList.add('on');
          }
        }
      });
    }
    
    selectProductTab = selectTab;
    
    // @ts-ignore
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        selectTab(btn.getAttribute('data-prod'));
      });
    });
    
    // Init default tab: prioritize subscription product
    var subBtn = null;
    for (var i = 0; i < buttons.length; i++) {
      var bKey = buttons[i].getAttribute('data-prod');
      var p = panels.find(function(panel) { return panel.getAttribute('data-prod') === bKey; });
      if (p && p.querySelector('.ww-sub-opt[data-option-type="subscription"]')) {
        subBtn = buttons[i];
        break;
      }
    }
    var start = subBtn || buttons[0];
    if (start) {
      selectTab(start.getAttribute('data-prod'));
      setTimeout(function() {
        moveInd(start);
      }, 300);
    }
    
    window.addEventListener('resize', function() {
      // @ts-ignore
      var active = shop.querySelector('.ww-seg-btn.on');
      if (active) moveInd(active);
    });
  }
  
  // Media Gallery Slider
  function initGallery() {
    document.querySelectorAll('.ww-media').forEach(function(media) {
      var slides = media.querySelectorAll('.ww-media-stage > .ww-media-slide');
      var thumbsContainer = media.querySelector('.ww-media-thumbs');
      var thumbs = media.querySelectorAll('.ww-media-thumbs > .ww-media-thumb');
      if (thumbsContainer && !thumbsContainer.getAttribute('role')) {
        thumbsContainer.setAttribute('role', 'tablist');
        thumbsContainer.setAttribute('aria-label', 'Product image thumbnails');
      }
      if (slides.length < 2) return;
      
      var currentIdx = 0;
      
      // @ts-ignore
      function show(index) {
        currentIdx = (index + slides.length) % slides.length;
        slides.forEach(function(s, idx) {
          s.classList.toggle('is-on', idx === currentIdx);
        });
        thumbs.forEach(function(t, idx) {
          t.classList.toggle('is-active', idx === currentIdx);
          t.setAttribute('aria-selected', idx === currentIdx ? 'true' : 'false');
        });
      }
      
      thumbs.forEach(function(t, idx) {
        t.setAttribute('tabindex', '0');
        t.setAttribute('role', 'tab');
        t.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        if (!t.getAttribute('aria-label')) {
          t.setAttribute('aria-label', 'Thumbnail ' + (idx + 1) + ' of ' + thumbs.length);
        }
        t.addEventListener('click', function() { show(idx); });
        t.addEventListener('keydown', function(e) {
          // @ts-ignore
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            show(idx);
          }
        });
      });
      
      var prev = media.querySelector('.ww-media-nav--prev');
      var next = media.querySelector('.ww-media-nav--next');
      if (prev) {
        prev.addEventListener('click', function() { show(currentIdx - 1); });
      }
      if (next) {
        next.addEventListener('click', function() { show(currentIdx + 1); });
      }
      
      show(0);
    });
  }
  
  // Accordions mutually-exclusive expander
  function initAccordions() {
    var accordions = document.querySelectorAll('.ww-info');
    accordions.forEach(function(wrapper) {
      var details = wrapper.querySelectorAll('.ww-acc');
      details.forEach(function(detail) {
        detail.addEventListener('toggle', function() {
          // @ts-ignore
          if (detail.open) {
            details.forEach(function(d) {
              // @ts-ignore
              if (d !== detail) d.open = false;
            });
          }
        });
      });
    });
  }
  
  // Quantity steppers
  function initQuantity() {
    document.querySelectorAll('.ww-buy').forEach(function(buyBox) {
      var qtyWrapper = buyBox.querySelector('.ww-qty');
      var form = buyBox.querySelector('.ww-product-form');
      if (!qtyWrapper || !form) return;
      
      var valEl = qtyWrapper.querySelector('.v');
      var inputEl = form.querySelector('.ww-qty-input');
      var btnMinus = qtyWrapper.querySelector('.ww-qty-btn-minus');
      var btnPlus = qtyWrapper.querySelector('.ww-qty-btn-plus');
      
      var qty = 1;
      
      // @ts-ignore
      function updateQty(val) {
        qty = Math.max(1, val);
        // @ts-ignore
        if (valEl) valEl.textContent = qty;
        // @ts-ignore
        if (inputEl) inputEl.value = qty;
      }
      
      if (btnMinus) {
        btnMinus.addEventListener('click', function() {
          updateQty(qty - 1);
        });
      }
      if (btnPlus) {
        btnPlus.addEventListener('click', function() {
          updateQty(qty + 1);
        });
      }
      
      updateQty(1);
    });
  }
  
  // Sticky Add to Cart Bar controller
  function initStickyBar() {
    var stickyBar = document.getElementById('ww-sticky-bar');
    var shop = document.querySelector('.ww-shop');
    if (!stickyBar || !shop) return;

    var titleEl = stickyBar.querySelector('.ww-sticky-bar__title');
    var priceEl = stickyBar.querySelector('.ww-sticky-bar__price');
    var separatorEl = stickyBar.querySelector('.ww-sticky-bar__separator');
    var optionTextEl = stickyBar.querySelector('.ww-sticky-bar__option-text');
    var changeBtn = stickyBar.querySelector('.ww-sticky-bar__change-btn');
    var popover = stickyBar.querySelector('.ww-sticky-bar__popover');
    var addBtn = stickyBar.querySelector('.ww-sticky-bar__add-btn');
    var productToggleBtn = stickyBar.querySelector('.ww-sticky-bar__product-toggle');

    // Toggle popover
    // @ts-ignore
    function togglePopover(show) {
      // @ts-ignore
      var shouldShow = typeof show === 'boolean' ? show : !popover.classList.contains('open');
      // @ts-ignore
      popover.classList.toggle('open', shouldShow);
      if (changeBtn) {
        changeBtn.classList.toggle('open', shouldShow);
      }
    }

    if (changeBtn) {
      changeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        togglePopover();
      });
    }

    // Product toggle in sticky bar
    if (productToggleBtn) {
      productToggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        var buttons = Array.prototype.slice.call(shop.querySelectorAll('.ww-seg-btn'));
        if (buttons.length < 2) return;
        
        var activeBtn = shop.querySelector('.ww-seg-btn.on');
        var curIdx = buttons.indexOf(activeBtn);
        if (curIdx === -1) curIdx = 0;
        
        var nextIdx = (curIdx + 1) % buttons.length;
        var nextBtn = buttons[nextIdx];
        if (!nextBtn) return;
        
        // 1. Switch active product tab
        var nextKey = nextBtn.getAttribute('data-prod');
        if (typeof selectProductTab === 'function') {
          selectProductTab(nextKey);
        } else {
          nextBtn.click();
        }
        
        // 2. Smoothly jump/scroll to ww-product-hub section
        var hub = document.getElementById('ww-product-hub') || document.getElementById('ww-products') || shop.closest('.ww-products') || shop;
        if (hub) {
          hub.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // 3. Update sticky bar content
        observeCurrentBuyBox();
        updateStickyContent();
      });
    }

    // Close popover when clicking anywhere else
    document.addEventListener('click', function(e) {
      // @ts-ignore
      if (popover && !popover.contains(e.target) && e.target !== changeBtn) {
        togglePopover(false);
      }
    });

    var lastPopoverKey = '';

    // Extract options from active panel and populate popover
    function updateStickyContent() {
      // @ts-ignore
      var activePanel = shop.querySelector('.ww-panel.on');
      if (!activePanel) return;

      // Update Title
      var activeTitleEl = activePanel.querySelector('.ww-detail-title');
      if (activeTitleEl && titleEl) {
        var targetTitle = activeTitleEl.textContent.trim();
        if (titleEl.textContent !== targetTitle) {
          titleEl.textContent = targetTitle;
        }
      }

      // Update Product Toggle Button (Switch product)
      if (productToggleBtn) {
        var buttons = Array.prototype.slice.call(shop.querySelectorAll('.ww-seg-btn'));
        if (buttons.length <= 1) {
          if (productToggleBtn.style.display !== 'none') {
            productToggleBtn.style.display = 'none';
          }
        } else {
          if (productToggleBtn.style.display !== 'inline-flex') {
            productToggleBtn.style.display = 'inline-flex';
          }
          var activeBtn = shop.querySelector('.ww-seg-btn.on');
          var curIdx = buttons.indexOf(activeBtn);
          if (curIdx === -1) curIdx = 0;
          var nextIdx = (curIdx + 1) % buttons.length;
          var nextBtn = buttons[nextIdx];
          var nextTitle = "";
          if (nextBtn) {
            var clone = nextBtn.cloneNode(true);
            var sub = clone.querySelector('.ww-seg-sub');
            if (sub) sub.remove();
            nextTitle = clone.textContent.trim();
          }
          var ariaMsg = nextTitle ? ('Switch to ' + nextTitle) : 'Switch product';
          if (productToggleBtn.getAttribute('title') !== ariaMsg) {
            productToggleBtn.setAttribute('title', ariaMsg);
            productToggleBtn.setAttribute('aria-label', ariaMsg);
          }
        }
      }

      // Update Options
      var purchaseOptionsContainer = activePanel.querySelector('.ww-purchase-options');
      // @ts-ignore
      var optionsList = [];

      if (purchaseOptionsContainer) {
        var optionCards = purchaseOptionsContainer.querySelectorAll('.ww-sub-opt');
        optionCards.forEach(function(card, idx) {
          // Get radio input
          var radio = card.querySelector('.ww-sub-opt__radio-input');
          if (!radio) return;

          // Title / label
          var titleText = "";
          var mainTitle = card.querySelector('.ww-sub-opt__title');

          if (mainTitle) {
            // Clean up title text by stripping off badges/extra classes if any
            var titleClone = mainTitle.cloneNode(true);
            // @ts-ignore
            var packBadge = titleClone.querySelector('.ww-sub-opt__pack-badge');
            if (packBadge && /1\s*pack/i.test(packBadge.textContent)) {
              packBadge.remove();
            }
            // @ts-ignore
            titleText = titleClone.textContent
              .replace(/Most popular|save \d+%/gi, '')
              .replace(/\b1\s*pack\b/gi, '')
              .replace(/\s+/g, ' ')
              .trim();
          } else {
            var contentRows = card.querySelectorAll('.ww-sub-opt__row, .ww-sub-opt__details');
            if (contentRows.length > 0) {
              // @ts-ignore
              titleText = contentRows[0].textContent.trim().split('\n')[0].trim();
            } else {
              // @ts-ignore
              titleText = card.textContent.trim().split('\n')[0].trim();
            }
            titleText = titleText.replace(/\b1\s*pack\b/gi, '').replace(/\s+/g, ' ').trim();
          }

          // Price
          var priceEl = card.querySelector('.ww-sub-opt__price');
          var priceText = priceEl ? priceEl.textContent.replace(/\s+/g, ' ').trim() : "";

          // Clean price (remove compare price text)
          var comparePriceEl = card.querySelector('.ww-sub-opt__compare-price');
          if (comparePriceEl && priceText) {
            priceText = priceText.replace(comparePriceEl.textContent.trim(), '').trim();
          }

          var isSelected = card.classList.contains('on');

          optionsList.push({
            index: idx,
            label: titleText,
            price: priceText,
            selected: isSelected,
            element: card
          });
        });
      }

      // Hide or show CHANGE button depending on number of available options
      if (optionsList.length <= 1) {
        if (changeBtn && changeBtn.style.display !== 'none') {
          changeBtn.style.display = 'none';
        }
        togglePopover(false);
      } else {
        if (changeBtn && changeBtn.style.display !== 'inline-flex') {
          changeBtn.style.display = 'inline-flex';
        }
      }

      // Render options in popover only if changed
      var currentOptionsKey = activePanel.getAttribute('data-prod') + '::' + optionsList.map(function(o) {
        return o.label + '__' + o.price + '__' + (o.selected ? '1' : '0');
      }).join('||');

      if (popover && currentOptionsKey !== lastPopoverKey) {
        lastPopoverKey = currentOptionsKey;
        popover.innerHTML = '';
        if (optionsList.length > 0) {
          // @ts-ignore
          optionsList.forEach(function(opt) {
            var item = document.createElement('div');
            item.className = 'ww-sticky-bar__popover-item' + (opt.selected ? ' selected' : '');
            
            var labelSpan = document.createElement('span');
            labelSpan.className = 'ww-sticky-bar__popover-item-label';
            labelSpan.textContent = opt.label;

            var priceSpan = document.createElement('span');
            priceSpan.className = 'ww-sticky-bar__popover-item-price';
            priceSpan.textContent = opt.price;

            item.appendChild(labelSpan);
            item.appendChild(priceSpan);

            item.addEventListener('click', function(e) {
              e.stopPropagation();
              // Simulate click on the main card's purchase option
              opt.element.click();
              togglePopover(false);
              // Recalculate sticky bar contents
              setTimeout(updateStickyContent, 50);
            });

            // @ts-ignore
            popover.appendChild(item);
          });
        }
      }

      // Update current selected option summary text
      // @ts-ignore
      var selectedOpt = optionsList.find(function(o) { return o.selected; });
      if (selectedOpt) {
        var cleanLabel = (selectedOpt.label || '')
          .replace(/\s*·\s*1\s*pack\b/gi, '')
          .replace(/\b1\s*pack\b/gi, '')
          .replace(/^\s*[-·]\s*|\s*[-·]\s*$/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        var targetPrice = selectedOpt.price || '';
        if (priceEl && priceEl.textContent !== targetPrice) {
          priceEl.textContent = targetPrice;
        }

        var targetSep = (cleanLabel && selectedOpt.price) ? 'inline' : 'none';
        if (separatorEl && separatorEl.style.display !== targetSep) {
          separatorEl.style.display = targetSep;
        }

        if (optionTextEl && optionTextEl.textContent !== cleanLabel) {
          optionTextEl.textContent = cleanLabel;
        }
      } else {
        // Fallback if no option cards found (standard price rendering)
        var mainPriceEl = activePanel.querySelector('.price') || activePanel.querySelector('.ww-buy-row .ww-add');
        var fallbackPrice = mainPriceEl ? mainPriceEl.textContent.replace(/\b1\s*pack\b/gi, '').replace(/\s+/g, ' ').trim() : "";
        if (priceEl && priceEl.textContent !== fallbackPrice) {
          priceEl.textContent = fallbackPrice;
        }
        if (separatorEl && separatorEl.style.display !== 'none') {
          separatorEl.style.display = 'none';
        }
        if (optionTextEl && optionTextEl.textContent !== "") {
          optionTextEl.textContent = "";
        }
      }

      // Update button availability / text based on main button
      var activeAddBtn = activePanel.querySelector('.ww-add button, .ww-add');
      if (activeAddBtn && addBtn) {
        // @ts-ignore
        var isAvailable = !activeAddBtn.disabled;
        // @ts-ignore
        if (addBtn.disabled !== !isAvailable) {
          // @ts-ignore
          addBtn.disabled = !isAvailable;
        }
        
        var btnTextEl = addBtn.querySelector('.ww-sticky-bar__add-btn-text');
        var activeTextEl = activeAddBtn.querySelector('.add-to-cart-text__content') || activeAddBtn;
        if (btnTextEl && activeTextEl) {
          var targetBtnText = activeTextEl.textContent.replace(/\(\d+\)/g, '').trim();
          if (btnTextEl.textContent !== targetBtnText) {
            btnTextEl.textContent = targetBtnText;
          }
        }
      }
    }

    // Intersection Observer variables for visibility sync
    var buyBoxObserver = null;
    var observedBuyBox = null;
    var pastBuyBox = false, atFooter = false;
    var prevSticky = null;

    // Synchronize sticky bar status (toggle on/off states)
    function syncVisibility() {
      var isSticky = pastBuyBox && !atFooter;
      if (isSticky === prevSticky) return;
      prevSticky = isSticky;

      // @ts-ignore
      stickyBar.classList.toggle('on', isSticky);
      // @ts-ignore
      stickyBar.setAttribute('data-active', isSticky ? 'true' : 'false');
      if (isSticky) {
        updateStickyContent();
      } else {
        togglePopover(false);
      }
    }

    function observeCurrentBuyBox() {
      if (!('IntersectionObserver' in window)) return;
      var activePanel = shop.querySelector('.ww-panel.on');
      var currentBuyBox = (activePanel ? activePanel.querySelector('.ww-buy') : null) || shop.querySelector('.ww-buy');
      if (!currentBuyBox || currentBuyBox === observedBuyBox) return;

      if (buyBoxObserver && observedBuyBox) {
        buyBoxObserver.unobserve(observedBuyBox);
      }

      observedBuyBox = currentBuyBox;
      if (!buyBoxObserver) {
        buyBoxObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            /* only "past" — not before the shop has been reached */
            pastBuyBox = !e.isIntersecting && e.boundingClientRect.top < 0;
            syncVisibility();
          });
        }, { threshold: 0 });
      }

      buyBoxObserver.observe(currentBuyBox);
    }

    observeCurrentBuyBox();

    var footer = document.querySelector('footer') || document.querySelector('[class*="footer-group"]');
    if (footer && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          atFooter = e.isIntersecting;
          syncVisibility();
        });
      }, { threshold: 0 }).observe(footer);
    }

    if (!('IntersectionObserver' in window)) {
      window.addEventListener('scroll', function() {
        var activePanel = shop.querySelector('.ww-panel.on');
        var buyBox = (activePanel ? activePanel.querySelector('.ww-buy') : null) || shop.querySelector('.ww-buy');
        if (buyBox) {
          var rect = buyBox.getBoundingClientRect();
          pastBuyBox = rect.bottom < 80;
        }
        if (footer) {
          var footerRect = footer.getBoundingClientRect();
          atFooter = footerRect.top < window.innerHeight;
        }
        syncVisibility();
      });
    }

    // Add submit hook to addBtn
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        // @ts-ignore
        var activePanel = shop.querySelector('.ww-panel.on');
        if (!activePanel) return;
        var activeAddBtn = activePanel.querySelector('.ww-add button') || activePanel.querySelector('.ww-add');
        if (activeAddBtn) {
          // @ts-ignore
          addBtn.setAttribute('data-added', 'true');
          setTimeout(function() {
            // @ts-ignore
            addBtn.removeAttribute('data-added');
          }, 1000);
          // @ts-ignore
          activeAddBtn.click();
        }
      });
    }

    // Listen to tab switches by observing the buttons or active panels
    var tabButtons = shop.querySelectorAll('.ww-seg-btn');
    tabButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        // Wait for tab animation/class toggling
        setTimeout(function() {
          observeCurrentBuyBox();
          updateStickyContent();
        }, 120);
      });
    });

    // Also update when options are selected directly in the buy box
    document.addEventListener('click', function(e) {
      // @ts-ignore
      if (e.target.closest('.ww-sub-opt')) {
        setTimeout(updateStickyContent, 100);
      }
    });

    // Initial check
    setTimeout(function() {
      updateStickyContent();
    }, 500);
  }

  function boot() {
    initTabs();
    initGallery();
    initAccordions();
    initQuantity();
    initStickyBar();
  }
  
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }

  // Support Shopify customizer section live reload
  document.addEventListener('shopify:section:load', function(e) {
    // @ts-ignore
    if (e.target && (e.target.classList.contains('ww-section-products') || e.target.querySelector('.ww-shop'))) {
      boot();
    }
  });
})();
