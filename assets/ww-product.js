(function() {
  'use strict';
  
  // Tab control switching
  function initTabs() {
    var shop = document.querySelector('.ww-shop');
    if (!shop) return;
    
    var seg = shop.querySelector('.ww-seg');
    var ind = shop.querySelector('.ww-seg-ind');
    var buttons = Array.prototype.slice.call(shop.querySelectorAll('.ww-seg-btn'));
    var panels = Array.prototype.slice.call(shop.querySelectorAll('.ww-panel'));
    
    function moveInd(btn) {
      if (!ind || !btn) return;
      ind.style.left = btn.offsetLeft + 'px';
      ind.style.width = btn.offsetWidth + 'px';
    }
    
    function selectTab(key) {
      buttons.forEach(function(b) {
        var on = b.getAttribute('data-prod') === key;
        b.classList.toggle('on', on);
        if (on) moveInd(b);
      });
      panels.forEach(function(p) {
        p.classList.toggle('on', p.getAttribute('data-prod') === key);
      });
    }
    
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        selectTab(btn.getAttribute('data-prod'));
      });
    });
    
    // Init first tab
    var start = buttons[0];
    if (start) {
      selectTab(start.getAttribute('data-prod'));
      setTimeout(function() {
        moveInd(start);
      }, 300);
    }
    
    window.addEventListener('resize', function() {
      var active = shop.querySelector('.ww-seg-btn.on');
      if (active) moveInd(active);
    });
  }
  
  // Media Gallery Slider
  function initGallery() {
    document.querySelectorAll('.ww-media').forEach(function(media) {
      var slides = media.querySelectorAll('.ww-media-stage > .ww-media-slide');
      var thumbs = media.querySelectorAll('.ww-media-thumbs > .ww-media-thumb');
      if (slides.length < 2) return;
      
      var currentIdx = 0;
      
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
        t.addEventListener('click', function() { show(idx); });
        t.addEventListener('keydown', function(e) {
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
          if (detail.open) {
            details.forEach(function(d) {
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
      
      function updateQty(val) {
        qty = Math.max(1, val);
        if (valEl) valEl.textContent = qty;
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
  function initStickyBar(target) {
    if (!target) return;
    var stickyBar = typeof target === 'string' ? document.getElementById(target) : target;
    if (!stickyBar) return;

    var sectionContainer = stickyBar.closest('.shopify-section') || stickyBar.parentElement;
    if (!sectionContainer) return;

    var shop = sectionContainer.querySelector('.ww-shop');
    if (!shop) return;

    var titleEl = stickyBar.querySelector('.ww-sticky-bar__title');
    var optionTextEl = stickyBar.querySelector('.ww-sticky-bar__option-text');
    var changeBtn = stickyBar.querySelector('.ww-sticky-bar__change-btn');
    var popover = stickyBar.querySelector('.ww-sticky-bar__popover');
    var addBtn = stickyBar.querySelector('.ww-sticky-bar__add-btn');

    // Toggle popover
    function togglePopover(show) {
      var shouldShow = typeof show === 'boolean' ? show : !popover.classList.contains('open');
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

    // Close popover when clicking anywhere else
    document.addEventListener('click', function(e) {
      if (popover && !popover.contains(e.target) && e.target !== changeBtn) {
        togglePopover(false);
      }
    });

    // Extract options from active panel and populate popover
    function updateStickyContent() {
      var activePanel = shop.querySelector('.ww-panel.on');
      if (!activePanel) return;

      // Update Title
      var activeTitleEl = activePanel.querySelector('.ww-detail-title');
      if (activeTitleEl && titleEl) {
        titleEl.textContent = activeTitleEl.textContent.trim();
      }

      // Update Options
      var purchaseOptionsContainer = activePanel.querySelector('.ww-purchase-options');
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
            titleText = mainTitle.textContent.replace(/Most popular|save \d+%/i, '').trim();
          } else {
            var contentRows = card.querySelectorAll('.ww-sub-opt__row, .ww-sub-opt__details');
            if (contentRows.length > 0) {
              titleText = contentRows[0].textContent.trim().split('\n')[0].trim();
            } else {
              titleText = card.textContent.trim().split('\n')[0].trim();
            }
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

      // Render options in popover
      if (popover) {
        popover.innerHTML = '';
        if (optionsList.length > 0) {
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

            popover.appendChild(item);
          });
        }
      }

      // Update current selected option summary text
      var selectedOpt = optionsList.find(function(o) { return o.selected; });
      if (selectedOpt && optionTextEl) {
        optionTextEl.textContent = selectedOpt.price + ' · ' + selectedOpt.label;
      } else if (optionTextEl) {
        // Fallback if no option cards found (standard price rendering)
        var mainPriceEl = activePanel.querySelector('.price') || activePanel.querySelector('.ww-buy-row .ww-add');
        if (mainPriceEl) {
          optionTextEl.textContent = mainPriceEl.textContent.trim();
        } else {
          optionTextEl.textContent = "";
        }
      }

      // Update button availability / text based on main button
      var activeAddBtn = activePanel.querySelector('.ww-add button, .ww-add');
      if (activeAddBtn && addBtn) {
        var isAvailable = !activeAddBtn.disabled;
        addBtn.disabled = !isAvailable;
        
        var btnTextEl = addBtn.querySelector('.ww-sticky-bar__add-btn-text');
        var activeTextEl = activeAddBtn.querySelector('.add-to-cart-text__content') || activeAddBtn;
        if (btnTextEl && activeTextEl) {
          btnTextEl.textContent = activeTextEl.textContent.replace(/\(\d+\)/g, '').trim();
        }
      }
    }

    // Scroll visibility detector
    function checkVisibility() {
      var activePanel = shop.querySelector('.ww-panel.on');
      if (!activePanel) {
        stickyBar.classList.remove('on');
        stickyBar.setAttribute('data-active', 'false');
        return;
      }

      var buyBox = activePanel.querySelector('.ww-buy');
      if (!buyBox) {
        stickyBar.classList.remove('on');
        stickyBar.setAttribute('data-active', 'false');
        return;
      }

      var rect = buyBox.getBoundingClientRect();
      var shopRect = shop.getBoundingClientRect();

      // Show sticky bar when the buy box scrolls out of view (scrolled above viewport)
      // Check relative to 80px (sticky header offset) for a smoother transition
      var scrolledPast = rect.bottom < 80;
      // Hide sticky bar when scrolled past the entire ww-shop section (120px threshold before bottom)
      var isOutBottom = shopRect.bottom < 120;

      if (scrolledPast && !isOutBottom) {
        if (!stickyBar.classList.contains('on')) {
          stickyBar.classList.add('on');
          stickyBar.setAttribute('data-active', 'true');
          updateStickyContent();
        }
      } else {
        if (stickyBar.classList.contains('on')) {
          stickyBar.classList.remove('on');
          stickyBar.setAttribute('data-active', 'false');
          togglePopover(false);
        }
      }
    }

    // Add submit hook to addBtn
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        var activePanel = shop.querySelector('.ww-panel.on');
        if (!activePanel) return;
        var activeAddBtn = activePanel.querySelector('.ww-add button') || activePanel.querySelector('.ww-add');
        if (activeAddBtn) {
          activeAddBtn.click();
        }
      });
    }

    // Event listeners
    window.addEventListener('scroll', checkVisibility);
    
    // Listen to tab switches by observing the buttons or active panels
    var tabButtons = shop.querySelectorAll('.ww-seg-btn');
    tabButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        // Wait for tab animation/class toggling
        setTimeout(function() {
          updateStickyContent();
          checkVisibility();
        }, 120);
      });
    });

    // Also update when options are selected directly in the buy box
    document.addEventListener('click', function(e) {
      if (e.target.closest('.ww-sub-opt')) {
        setTimeout(updateStickyContent, 100);
      }
    });

    // Initial check
    setTimeout(function() {
      updateStickyContent();
      checkVisibility();
    }, 500);
  }

  // Expose function globally
  window.initStickyBar = initStickyBar;

  function boot() {
    initTabs();
    initGallery();
    initAccordions();
    initQuantity();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
