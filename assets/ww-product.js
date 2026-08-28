(function() {
  'use strict';
  
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
        p.classList.toggle('on', p.getAttribute('data-prod') === key);
      });
    }
    
    // @ts-ignore
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
      // @ts-ignore
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
    var optionTextEl = stickyBar.querySelector('.ww-sticky-bar__option-text');
    var changeBtn = stickyBar.querySelector('.ww-sticky-bar__change-btn');
    var popover = stickyBar.querySelector('.ww-sticky-bar__popover');
    var addBtn = stickyBar.querySelector('.ww-sticky-bar__add-btn');

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

    // Close popover when clicking anywhere else
    document.addEventListener('click', function(e) {
      // @ts-ignore
      if (popover && !popover.contains(e.target) && e.target !== changeBtn) {
        togglePopover(false);
      }
    });

    // Extract options from active panel and populate popover
    function updateStickyContent() {
      // @ts-ignore
      var activePanel = shop.querySelector('.ww-panel.on');
      if (!activePanel) return;

      // Update Title
      var activeTitleEl = activePanel.querySelector('.ww-detail-title');
      if (activeTitleEl && titleEl) {
        titleEl.textContent = activeTitleEl.textContent.trim();
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
            titleText = mainTitle.textContent.replace(/Most popular|save \d+%/i, '').trim();
          } else {
            var contentRows = card.querySelectorAll('.ww-sub-opt__row, .ww-sub-opt__details');
            if (contentRows.length > 0) {
              // @ts-ignore
              titleText = contentRows[0].textContent.trim().split('\n')[0].trim();
            } else {
              // @ts-ignore
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
        // @ts-ignore
        var isAvailable = !activeAddBtn.disabled;
        // @ts-ignore
        addBtn.disabled = !isAvailable;
        
        var btnTextEl = addBtn.querySelector('.ww-sticky-bar__add-btn-text');
        var activeTextEl = activeAddBtn.querySelector('.add-to-cart-text__content') || activeAddBtn;
        if (btnTextEl && activeTextEl) {
          btnTextEl.textContent = activeTextEl.textContent.replace(/\(\d+\)/g, '').trim();
        }
      }
    }

    // Intersection Observer variables for visibility sync
    var buyBox = shop.querySelector('.ww-panel.on .ww-buy') || shop.querySelector('.ww-buy');
    var footer = document.querySelector('footer') || document.querySelector('[class*="footer-group"]');
    var pastBuyBox = false, atFooter = false;

    // Synchronize sticky bar status (toggle on/off states)
    function syncVisibility() {
      var isSticky = pastBuyBox && !atFooter;
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

    if (buyBox) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            /* only "past" — not before the shop has been reached */
            pastBuyBox = !e.isIntersecting && e.boundingClientRect.top < 0;
            syncVisibility();
          });
        }, { threshold: 0 }).observe(buyBox);

        if (footer) {
          new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
              atFooter = e.isIntersecting;
              syncVisibility();
            });
          }, { threshold: 0 }).observe(footer);
        }
      } else {
        // Fallback for browsers without IntersectionObserver support
        window.addEventListener('scroll', function() {
          var rect = buyBox.getBoundingClientRect();
          pastBuyBox = rect.bottom < 80;
          if (footer) {
            var footerRect = footer.getBoundingClientRect();
            atFooter = footerRect.top < window.innerHeight;
          }
          syncVisibility();
        });
      }
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
    if (e.target && (e.target.classList.contains('ww-section-products') || e.target.querySelector('.ww-shop'))) {
      boot();
    }
  });
})();
