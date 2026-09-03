# WanderWell Horizon Theme: Custom Components Reference Manual

This document serves as the complete developer and merchant reference for all custom storefront components, sections, snippets, templates, and asset structures created for the WanderWell Shopify theme (all custom code is prefixed with `ww-`).

---

## 1. Core Principles & Architecture

- **Upgrade Safety**: All custom components are isolated into separate files starting with the `ww-` prefix. Core Horizon engine files remain upgrade-safe (see [HORIZON_MODIFICATIONS_LOG.md](HORIZON_MODIFICATIONS_LOG.md)).
- **Design Token Integration**: Styling colors, typography, spacing, and border-radii utilize CSS custom variables declared in `snippets/ww-css-variables.liquid` and `assets/wanderwell.css`.
- **Dynamic Content**: Static text is avoided. All storefront copy, media, and links are editable via Shopify Theme Editor settings, blocks, product metafields, or custom metaobjects.
- **Modern OS 2.0 Patterns**: Utilizes section-scoped `{% stylesheet %}`, component `{% javascript %}`, `{% render %}` for snippets, and JSON templates throughout.

---

## 2. Custom Sections Directory

### 1. WW Hero Landing (`sections/ww-hero.liquid`)
A media-rich, accessible hero section supporting overlay branding, a supergraphic logo, call-to-action buttons, and an infinite looping marquee ticker.
- **Key Features**:
  - HTML5 video backdrop with an accessible Play/Pause toggle (respects `prefers-reduced-motion`).
  - Configurable height modes: `small` (65vh), `medium` (80vh), `full` (100vh).
  - Supergraphic wordmark image overlay with automatic aspect-ratio scaling.
  - Seamlessly looping marquee ticker bar populated from customizer blocks.
- **Configurable Settings**:
  - `badge`, `heading`, `heading2`, `subheading`, `button_label`, `button_link`.
  - `video_backdrop` (video picker) and `image_backdrop` (fallback image picker).
  - `show_ticker`, `ticker_label`, and block items for ticker text.

---

### 2. WW Interactive Route Map (`sections/ww-problem.liquid`)
An interactive, scroll-driven storytelling section representing the "reality of travel" as a flight journey map with altitude stress milestones.
- **Key Features**:
  - SVG route timeline (`#wwRouteSvg-{{ id }}`) dynamically animating its dash-array route stroke based on scroll depth.
  - Interactive milestone stop nodes that illuminate and reveal stress factors (e.g., dehydration, cabin pressure, disrupted sleep) as they enter the viewport.
  - Interactive world map silhouette background overlay.
- **Scripts & Styles**: Controlled by `assets/ww-problem.js`.

---

### 3. WW Approach & Transparency (`sections/ww-approach.liquid`)
Custom dynamic section showcasing clean formulation principles, ticker statements, and ingredient quality highlights.
- **Key Features**:
  - Full-width loop marquee ticker displaying brand claims with checkmark icons.
  - Responsive feature cards grid matching the minimalist WanderWell aesthetic.
- **Configurable Blocks**:
  - `ticker_item`: Short checklist phrases (e.g. "Third-party tested", "Zero fillers").
  - `card_item`: Feature card supporting custom SVG markup, title, and descriptive body copy.

---

### 4. WW Product Hub (`sections/ww-product.liquid`)
The primary product conversion engine combining image gallery media on the left with dynamic pricing, subscription options, and accordion tabs on the right.
- **Key Features**:
  - Direct integration with `snippets/ww-product-purchase-options.liquid` for Appstle Subscriptions.
  - Interactive product tabs for Ingredients, Supplement Facts, and Capsule Visualizer that display only when relevant product metafields are populated.
  - Custom gallery thumbnail navigation with swipe gesture support on mobile.
- **Associated Assets**: `assets/ww-product.css` and `assets/ww-product.js`.

---

### 5. WW Product Template (`sections/ww-product-template.liquid`)
An alternative/extended product page section providing modular blocks for titles, ratings, price, description, variant selectors, quantity pickers, and dynamic checkout buttons.

---

### 6. WW Early Feedback & Reviews (`sections/ww-feedback.liquid`)
Social proof section designed to integrate with Judge.me or display native review testimonial cards.
- **Key Features**:
  - Supports `@app` block embeds for direct Judge.me carousel and widget integration.
  - Section header with label, title, and descriptive subtitle blurb.
  - Fully responsive grid adapting gracefully across mobile and desktop.

---

### 7. WW FAQ (`sections/ww-faq.liquid`)
An accordion FAQ layout with category grouping and flexible content sources.
- **Key Features**:
  - Independent instance scoping: multiple FAQ sections on the same page operate without cross-closing.
  - Multi-source loading: can load static drag-and-drop customizer blocks or load dynamically from a global Metaobject (`metaobject_type`).
- **Configurable Blocks**:
  - `category`: Divider header block for grouping questions (e.g. "Shipping", "Formulas").
  - `faq`: Question text and rich text expandable answer.

---

### 8. WW 404 Page (`sections/ww-404.liquid`)
Custom error page section matching the WanderWell v3 design kit (`ui_kits/website-v3/404.html`).
- **Key Features**:
  - Error code pill badge (`Error 404`).
  - Brand heading (`This one wandered off`) and friendly guiding copy.
  - Dual action buttons: Primary CTA ("Shop the formulas") and Secondary CTA ("Get help").
  - Clean cream background (`var(--cream, #FAF7F2)`) and centered layout.

---

### 9. WW Native AJAX Contact Form (`sections/ww-contact-form.liquid`)
Asynchronous contact inquiry section matching the WanderWell v3 design kit.
- **Key Features**:
  - Native Shopify `{% form 'contact' %}` integration submitted via AJAX (`fetch`) with zero page reloads.
  - Topic category dropdown ("An order I placed", "My subscription", "Ingredients", etc.).
  - Inline status banners for success and validation errors.
  - Floating focus rings and brand button hover states.

---

### 10. WW Legal & Policy Page Builder (`sections/ww-info-page.liquid`)
Universal content layout section powering all legal, policy, and compliance pages.
- **Key Features**:
  - Supports Table of Contents quick-navigation sidebars.
  - Formatted legal lead paragraphs, bullet points, warning callouts, contact grids, and last-updated metadata badges.
  - Utilized by: `templates/page.ww-privacy.json`, `templates/page.ww-terms.json`, `templates/page.ww-accessibility.json`, `templates/page.ww-prop65.json`, and `templates/page.ww-page.json`.

---

### 11. WW Promotional Popup (`sections/ww-popup.liquid`)
Global promotional modal injected via `layout/theme.liquid` before `</body>`.
- **Key Features**:
  - Timed or scroll-triggered display with localStorage suppression once dismissed.
  - Discount code display (`WANDER10`) with one-click clipboard copy and visual confirmation feedback.
  - Integrated email newsletter signup form.

---

### 12. WW Custom Brand Footer (`sections/ww-footer.liquid` & `sections/ww-footer-section.liquid`)
A 100% custom-built, full-bleed footer matching the client's design template.
- **Key Features**:
  - Custom orange brand gradient background (`linear-gradient(180deg, #FBCBA8 0%, #E8632B 100%)`).
  - Integrated AJAX newsletter signup with instant inline confirmation.
  - Dynamic link columns for "Shop", "Help", and "Learn".
  - Full-bleed wordmark logo banner across the lower container.
  - Required medical/FDA disclaimer notice and legal menu links.

---

### 13. WW Header Wrapper (`sections/ww-header-section.liquid`)
Specialized section preset allowing modular header arrangements when required.

---

## 3. Custom Snippets Directory

### 1. WW Brand CSS Variables (`snippets/ww-css-variables.liquid`)
Declares all theme brand tokens, web fonts, layout breakpoints, and colors under `:root`.
- **Key Variables**:
  - `--orange`: `#E8632B` (Primary brand accent)
  - `--orange-dark`: `#D15523`
  - `--orange-light`: `#F0845A`
  - `--orange-pale`: `#FCEEE7`
  - `--offwhite`: `#E8E0D0`
  - `--cream`: `#F2EDE4`
  - `--charcoal`: `#2C2C2C`
  - `--charcoal-light`: `#5A5A5A`
  - `--font-primary`: `'sofia-pro', 'Montserrat', sans-serif`
  - `--font-tertiary`: `'sofia-pro', 'Montserrat', sans-serif`

---

### 2. WW Purchase Options (`snippets/ww-product-purchase-options.liquid`)
Powers the Subscribe & Save vs. One-Time purchase selector cards.
- **Key Features**:
  - Dynamic integration with **Appstle Subscriptions** selling plan groups.
  - Automatic per-serving price calculation: `variant.price / product.metafields.custom.servings`.
  - Dynamic discount badges calculated directly from active selling plan adjustments.
  - Dynamic frequency dropdown populated from selling plan names (e.g. "Every 30 Days").

---

### 3. WW Product Bundle Items (`snippets/ww-product-bundle.liquid`)
Renders individual products included within a bundle product.
- **Key Features**:
  - Dynamically calculates money saved vs. purchasing items separately:
    `"You save {{ save_amount | money }} vs. buying separately"`.
  - Compatible with Appstle Bundles and custom product metafield lists (`custom.bundle_products`).

---

### 4. WW Product Ingredients (`snippets/ww-product-ingredients.liquid`)
Displays structured ingredient cards dynamically from Metaobject references.
- **Shopify Admin Configuration**:
  - **Metaobject**: `Ingredient` (`ingredient`) with fields: `heading`, `subheading`, `description`.
  - **Product Metafield**: `custom.ingredients` (List of `Ingredient` Metaobject entries).

---

### 5. WW Supplement Facts Grid (`snippets/ww-product-supplement-facts.liquid`)
Renders dosage directions, cautions, serving sizes, and nutrition fact tables.
- **Shopify Admin Configuration**:
  - **Metaobject**: `Supplement Fact Row` (`supplement_fact_row`) with fields: `name`, `amount`, `daily_value`.
  - **Product Metafields**: `custom.directions` (Rich Text), `custom.other_ingredients` (Rich Text), `custom.serving_size` (Text), `custom.servings_per_container` (Text), `custom.supplement_facts_list` (List of `Supplement Fact Row` entries).

---

### 6. WW Capsule Scale Visualizer (`snippets/ww-product-capsule.liquid`)
An interactive visual scale comparing the product's capsule size against standard capsules.
- **Key Features**:
  - Auto-hides if `custom.capsule_size` is empty (e.g. for powders or liquid products).
- **Shopify Admin Configuration**:
  - `custom.capsule_size` (Text, e.g. "Size 4"), `custom.capsule_dimensions` (Text), `custom.capsule_details` (Rich Text).

---

## 4. Custom Templates Directory

| Template File | Purpose | Key Sections Used |
| :--- | :--- | :--- |
| `templates/index.json` | Storefront Homepage | `ww-hero`, `ww-problem`, `ww-approach`, `ww-product`, `ww-feedback`, `ww-faq`, `ww-footer` |
| `templates/404.json` | Not Found Error Page | `ww-404` |
| `templates/page.contact.json` | Contact & Inquiries Page | `ww-contact-form` |
| `templates/page.ww-accessibility.json` | WCAG 2.1 AA Accessibility Statement | `ww-info-page` |
| `templates/page.ww-privacy.json` | Comprehensive Privacy Policy | `ww-info-page` |
| `templates/page.ww-terms.json` | Store Terms of Service | `ww-info-page` |
| `templates/page.ww-prop65.json` | California Proposition 65 Notice | `ww-info-page` |
| `templates/page.ww-page.json` | General Brand Content Page | `ww-info-page` |
| `templates/page.ww-info.json` | Minimal Information Template | `ww-info-page` |
| `templates/page.bundle.json` | Bundles Landing Page | `ww-product` |
| `templates/collection.ww-collections.json` | Brand Collections Template | Custom collection cards |
| `templates/product.ww-products.json` | Custom Product Detail Template | `ww-product` |

---

## 5. Assets & Scripts Directory

- **`assets/wanderwell.css`**: Central global stylesheet overriding Horizon core layout containers, setting up typography, CTA buttons, drawer styling, page interaction locks (`.page-wrapper--drawer-open`), mobile menu drawer widths, and Judge.me review carousel customizations.
- **`assets/wanderwell.js`**: Shared JavaScript utilities, scroll observers, drawer management, and notification helpers.
- **`assets/ww-product.css`**: Scoped styles for the Product Hub, option selectors, frequency pills, tabs, and gallery layout.
- **`assets/ww-product.js`**: Interactive thumbnail gallery, image zoom, selling plan radio bindings, and accordion toggles.
- **`assets/ww-problem.js`**: SVG flight path calculations and milestone reveal triggers.
- **Brand SVG Icons (`assets/icon-*.svg`)**:
  - `assets/icon-cart.svg`: WanderWell v3 custom shopping cart SVG icon.
  - `assets/icon-account.svg`: WanderWell v3 custom user avatar icon (`<circle>` and `<path>` structure).
  - `assets/icon-add-to-cart.svg`: Custom cart action icon matching the cart iconography.
- **Webfont Assets (`assets/*.woff2`)**:
  - Sofia Pro: `400`, `400-italic`, `500-italic`, `600`, `600-italic`, `700`, `700-italic`, `900`, `900-italic`.
  - Montserrat: `400`, `500`, `600`, `700`.
