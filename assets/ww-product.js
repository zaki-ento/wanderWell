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
  
  // AJAX Add To Cart Submission
  function initAddToCart() {
    document.addEventListener('submit', function(e) {
      if (e.target && e.target.classList.contains('ww-product-form')) {
        e.preventDefault();
        
        var form = e.target;
        var btn = form.querySelector('.ww-add');
        if (!btn || btn.disabled) return;
        
        var fd = new FormData(form);
        var variantId = fd.get('id');
        var quantity = fd.get('quantity');
        
        if (!variantId) {
          console.warn('[WanderWell Products] No variant selected.');
          return;
        }
        
        btn.disabled = true;
        
        // Add to Shopify cart
        fetch('/cart/add.js', {
          method: 'POST',
          body: fd
        })
        .then(function(res) {
          if (!res.ok) {
            throw new Error('Network response error');
          }
          return res.json();
        })
        .then(function(item) {
          btn.disabled = false;
          
          // Flash "Added!" text state
          var origHTML = btn.innerHTML;
          btn.classList.add('is-added');
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Added!';
          setTimeout(function() {
            btn.classList.remove('is-added');
            btn.innerHTML = origHTML;
          }, 1800);
          
          // Dispatch native cart refresh event
          document.dispatchEvent(new CustomEvent('shopify:cart:lines-update', {
            bubbles: true,
            detail: {
              action: 'add',
              lines: [{
                merchandiseId: variantId.toString(),
                quantity: parseInt(quantity, 10)
              }]
            }
          }));
          
          // Open the native side drawer cart
          var drawer = document.querySelector('theme-drawer#cart-drawer');
          if (drawer && typeof drawer.open === 'function') {
            drawer.open();
          }
        })
        .catch(function(err) {
          btn.disabled = false;
          console.error('[WanderWell Products] Add to cart failed:', err);
        });
      }
    });
  }
  
  function boot() {
    initTabs();
    initGallery();
    initAccordions();
    initQuantity();
    initAddToCart();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
