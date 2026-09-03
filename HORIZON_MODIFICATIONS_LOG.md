# Horizon Theme Core Modifications Log

This document records all modifications made to core Shopify Horizon theme files in the WanderWell repository.

Per our development guidelines ([AGENTS.md](../AGENTS.md)), modifications to Horizon core files are kept to an absolute minimum to ensure the theme remains 100% upgrade-safe. Wherever possible, new features are isolated in standalone files with the `ww-` prefix.

---

## Modification Summary Table

| File | Category | Change Type | Reason for Modification |
| :--- | :--- | :--- | :--- |
| `layout/theme.liquid` | Core Layout | Enhancement | Font preloads (`sofia-pro`) and global popup (`ww-popup`) injection |
| `snippets/cart-drawer.liquid` | Core Snippet | Bugfix / UX | Added `no-persist` attribute to prevent drawer reopening on page load |
| `snippets/scripts.liquid` | Core Snippet | Bugfix / API | Appended `.js` to `cart_change_url` and `cart_update_url` for AJAX routing |
| `assets/cart-discount.js` | Core Asset | Bugfix / Resilience | Added optional chaining and fallback to `sectionRenderer` when section HTML is absent |
| `assets/component-cart-items.js` | Core Asset | Bugfix / Resilience | Added fallback handling and `item_count` default when section HTML is absent |
| `assets/product-form.js` | Core Asset | Formatting | Trailing newline normalization |
| `config/settings_schema.json` | Configuration | Brand Token | Added WanderWell brand group; set default background to `#F2EDE4` |
| `config/settings_data.json` | Configuration | Customizer Data | Configured brand typography, palette, logo sizes, and block states |
| `sections/header-group.json` | Section Group | Layout / Styling | Brand announcements, uppercase nav typography, and custom CSS borders |
| `sections/footer-group.json` | Section Group | Layout | Replaced default utilities with custom `ww-footer` section |
| `templates/index.json` | Template | Composition | Composed homepage using custom `ww-` sections |
| `templates/404.json` | Template | Composition | Replaced generic `main-404` with `ww-404` section |
| `templates/cart.json` | Template | Composition | Streamlined cart layout settings |
| `templates/page.contact.json` | Template | Composition | Connected `ww-contact-form` section |
| `templates/page.json` | Template | Composition | Default page template layout settings |
| `templates/product.json` | Template | Composition | Product template layout settings |
| `templates/search.json` | Template | Composition | Search template layout settings |

---

## Detailed File Modifications

### 1. `layout/theme.liquid`

* **Lines Modified**: `<head>` section and before `</body>`.
* **Changes**:
  1. Added font preloading for custom brand fonts to eliminate FOUT (Flash of Unstyled Text):
     ```liquid
     <link rel="preload" href="{{ 'sofia-pro-400.woff2' | asset_url }}" as="font" type="font/woff2" crossorigin>
     <link rel="preload" href="{{ 'sofia-pro-600.woff2' | asset_url }}" as="font" type="font/woff2" crossorigin>
     ```
  2. Injected the global promotional discount and newsletter popup section:
     ```liquid
     {% section 'ww-popup' %}
     ```
* **Upgrade Safety Note**: When upgrading Horizon, preserve these three tags in `layout/theme.liquid`.

---

### 2. `snippets/cart-drawer.liquid`

* **Lines Modified**: Line 46.
* **Changes**: Added the `no-persist` attribute to `<theme-drawer id="cart-drawer">`:
  ```liquid
  <theme-drawer
    id="cart-drawer"
    data-skip-node-update
    no-persist
  >
  ```
* **Reason**: Prevents the cart drawer from remaining open after page navigation or hard refreshes when a customer previously interacted with the cart.
* **Upgrade Safety Note**: Ensure `no-persist` is carried over if `cart-drawer.liquid` is updated in a future Horizon release.

---

### 3. `snippets/scripts.liquid`

* **Lines Modified**: Lines 300–301 (`window.theme.routes`).
* **Changes**:
  ```diff
  - cart_change_url: '{{ routes.cart_change_url }}',
  - cart_update_url: '{{ routes.cart_update_url }}',
  + cart_change_url: '{{ routes.cart_change_url | append: '.js' }}',
  + cart_update_url: '{{ routes.cart_update_url | append: '.js' }}',
  ```
* **Reason**: Directs AJAX fetch requests explicitly to Shopify's `.js` endpoint, preventing HTML responses during cart change/update operations.

---

### 4. `assets/cart-discount.js`

* **Changes**:
  1. Imported `sectionRenderer` alongside `morphSection`:
     ```javascript
     import { morphSection, sectionRenderer } from '@theme/section-renderer';
     ```
  2. Added defensive optional chaining (`data.sections?.[this.dataset.sectionId]`) to prevent runtime crashes if `sections` is omitted in the response:
     ```javascript
     const newHtml = data.sections?.[this.dataset.sectionId];
     if (newHtml) {
       // Parse and validate discount codes
     }
     ```
  3. Added fallback section rendering when `newHtml` is not returned:
     ```javascript
     if (newHtml) {
       morphSection(this.dataset.sectionId, newHtml, { mode: this.closest('theme-drawer') ? 'hydration' : 'full' });
     } else {
       sectionRenderer.renderSection(this.dataset.sectionId, {
         cache: false,
         mode: this.closest('theme-drawer') ? 'hydration' : 'full',
       });
     }
     ```
* **Reason**: Protects against unhandled exceptions during coupon application in custom cart drawer contexts.

---

### 5. `assets/component-cart-items.js`

* **Changes**:
  1. Added optional chaining for section HTML extraction:
     ```javascript
     const sectionHtml = parsedResponseText.sections?.[this.sectionId];
     let newCartItemCount = parsedResponseText.item_count ?? 0;
     ```
  2. Added fallback rendering:
     ```javascript
     if (sectionHtml) {
       morphSection(this.sectionId, sectionHtml, {
         mode: this.isDrawer ? 'hydration' : 'full',
       });
     } else {
       sectionRenderer.renderSection(this.sectionId, {
         cache: false,
         mode: this.isDrawer ? 'hydration' : 'full',
       });
     }
     ```
* **Reason**: Ensures cart quantity increments, decrements, and item removals remain resilient even if the section rendering payload structure varies.

---

### 6. `config/settings_schema.json` & `config/settings_data.json`

* **Changes**:
  - `settings_schema.json`: Added WanderWell brand configuration schema tokens (palette, typography, logo dimensions). Updated default `color_background` to `#F2EDE4`.
  - `settings_data.json`: Stored active theme customizer values for brand colors (`#E8632B`, `#2C2C2C`, `#F2EDE4`), Sofia Pro and Montserrat typography selections, container widths, and social profiles.

---

### 7. Header & Footer Group JSON Templates

* **`sections/header-group.json`**:
  - Configured announcement ticker messages (`FREE SHIPPING ON ORDERS OVER $50`, `SUBSCRIBE & SAVE 10%`).
  - Set navigation bar styling: uppercase font, `#e8e0d0` background, `#2c2c2c` text, and custom CSS for border and responsive column spacing.
* **`sections/footer-group.json`**:
  - Replaced Horizon's default footer utilities with `ww-footer` containing brand wordmark, interactive newsletter subscription, category navigation columns, and mandatory medical/FDA disclaimers.

---

### 8. Page & Special JSON Templates

* **`templates/404.json`**: Configured to render `ww-404` section.
* **`templates/index.json`**: Configured to render WanderWell custom section sequence (`ww-hero`, `ww-problem`, `ww-approach`, `ww-product`, `ww-feedback`, `ww-faq`, `ww-footer`).
* **`templates/page.contact.json`**: Configured to render `ww-contact-form` section.
* **`templates/cart.json`, `templates/product.json`, `templates/search.json`**: Configured settings to match WanderWell brand aesthetic.

---

## Guidelines for Upstream Horizon Upgrades

When a new version of Shopify Horizon is released:

1. **Review Diff Against Upstream**: Run `git diff [upstream-tag] -- [file]` on the 5 core code files:
   - `layout/theme.liquid`
   - `snippets/cart-drawer.liquid`
   - `snippets/scripts.liquid`
   - `assets/cart-discount.js`
   - `assets/component-cart-items.js`
2. **Re-apply Custom Edits**: The modifications listed above are minimal and self-contained; they can be quickly reapplied to newer Horizon base files.
3. **Leave `ww-*` Files Untouched**: All `sections/ww-*.liquid`, `snippets/ww-*.liquid`, and `assets/ww-*` files are completely independent of Horizon core and require zero upstream merging.
