# WanderWell Horizon Theme: Custom Components Reference Manual

This document serves as the developer reference for all custom storefront components, snippets, and asset structures added to the WanderWell Shopify theme (prefixed with `ww-`). 

---

## 1. Core Principles & Architecture
- **Upgrade Safety**: All custom components are isolated into separate files starting with the `ww-` prefix. The Horizon core files remain untouched, allowing clean theme updates.
- **Design Token Integration**: Styling colors and fonts utilize CSS custom variables declared globally inside `ww-css-variables.liquid`.
- **Dynamic Content**: Static copy is strictly avoided. Content is populated dynamically via theme customizer settings, blocks, product metafields, or custom metaobjects.

---

## 2. Custom Sections

### 1. WW Hero Landing (`sections/ww-hero.liquid`)
A media-rich, accessible hero section supporting overlay branding, a subgraphic logo, CTAs, and a looping text ticker.
- **Key Features**:
  - HTML5 video tag background backdrop with an interactive Pause/Play toggle (respects accessibility and prefers-reduced-motion settings).
  - Configurable height dimensions (`small`, `medium`, `full`).
  - Seamlessly looping marquee ticker bar populated from customizer blocks.
- **Configurable Settings**:
  - `badge`, `heading`, `heading2`, `subheading`, `button_label`, `button_link`.
  - `video_backdrop` (video picker) and `image_backdrop` (fallback image picker).
  - `show_ticker` (toggle) and `ticker_label`.

### 2. WW Interactive Route Map (`sections/ww-problem.liquid`)
An interactive, scroll-driven storytelling path representing the "reality of travel" as a journey map.
- **Key Features**:
  - An SVG route timeline (`#wwRouteSvg-{{ id }}`) that draws its dash-array route line dynamically based on the user's scroll depth.
  - Interactive stop nodes that glow and highlight as the viewport passes them.
  - Integrated world outline SVG map overlay.
- **Scripts**: Controlled by `assets/ww-problem.js`.

### 3. WW Clean / Our Approach (`sections/ww-clean.liquid`)
Custom dynamic section outlining brand transparency, ticker statements, and highlights.
- **Key Features**:
  - Full-width loop-style ticker marquee that handles layout wrapping offsets dynamically.
  - Fully customizable feature cards grid matching the website's clean-minimal style.
- **Configurable Blocks**:
  - `ticker_item`: Simple text block rendering standard brand checklist items.
  - `card_item`: Feature block supporting custom SVG markup input, title, and descriptive text.

### 4. WW FAQ (`sections/ww-faq.liquid`)
A dynamic accordion FAQ layout grouped under expandable categories.
- **Key Features**:
  - Event listeners are scoped locally per instance so multiple FAQ sections on the same page operate independently without cross-closing.
  - Multi-source options: can load static drag-and-drop customizer blocks or load dynamically from a global Metaobject structure (auto-grouping by category).
- **Configurable Settings/Blocks**:
  - `use_metaobjects` (Checkbox) and `metaobject_type` (Text definition handle).
  - `category` (Divider block): Declares a group title.
  - `faq` (FAQ item block): Question text and rich text answer body.

### 5. WW Product Hub (`sections/ww-product.liquid`)
The main product detail conversion container, split into product image slides on the left and pricing/subscription selectors on the right.
- **Key Features**:
  - Swaps out static price labels for the modular `ww-product-purchase-options` snippet.
  - Implements dynamic accordion tabs (Ingredients, Supplement Facts, Capsule Size) that render only when their corresponding metafield content is populated.
- **Configurable Settings**:
  - `product_tab` blocks allowing customizer configuration of Subscribe & Save badges, one-time price multipliers, and tab icons.

---

## 3. Custom Snippets

### 1. WW Brand CSS Variables (`snippets/ww-css-variables.liquid`)
Declares all theme colors, breakpoints, spacing, and typography properties under the `:root` pseudo-selector.
- **Key Variables**:
  - `--orange`: Primary Brand color (`#E8632B`).
  - `--orange-dark`: Dark Orange (`#D15523`).
  - `--orange-light`: Light Orange (`#F0845A`).
  - `--orange-pale`: Pale Orange (`#FCEEE7`).
  - `--offwhite`: Brand Background color (`#FAF7F2`).
  - `--cream`: Brand Cream color (`#F2EDE4`).
  - `--charcoal`: Brand Text color (`#1A1A1A`).
  - `--charcoal-light`: Brand Text light (`#5C5C5C`).
  - `--white`: Solid White (`#FFFFFF`).
  - `--black`: Solid Black (`#000000`).
  - `--font-primary`: Body Font (Montserrat / Sofia Pro).
  - `--font-tertiary`: Heading Font (Montserrat / Sofia Pro).

### 2. WW Product Purchase Options (`snippets/ww-product-purchase-options.liquid`)
Renders the grid selector cards for Subscribe & Save vs. One-Time Purchase options.
- **Key Features**:
  - **Dynamic Math**: Calculates "per-serving" pricing based on the total variant price divided by the product's custom servings count (`product.metafields.custom.servings`).
  - **Discount Badges**: Shows savings percentages calculated dynamically from Compare-At prices or configured subscription discounts.
  - **Checkout Binding**: Binds variants and selling plans dynamically to the active form using `name="selling_plan"` radio controls.

### 3. WW Product Ingredients (`snippets/ww-product-ingredients.liquid`)
Displays ingredient list details dynamically using Metaobject references.
- **Shopify Admin Configuration Required**:
  1. **Metaobject**: Create definition named `"Ingredient"` (key: `ingredient`). Add fields:
     - `heading` (Single-line text)
     - `subheading` (Single-line text)
     - `description` (Multi-line text)
  2. **Product Metafield**: Create definition named `"Ingredients"` (key: `custom.ingredients`).
     - **Type**: `Metaobject` reference -> Select **List of entries** (repeater).
     - **Reference**: Select the `Ingredient` definition.

### 3. WW Product Bundle Items (`snippets/ww-product-bundle.liquid`)
Displays individual product items inside a bundle product, including their images, titles, and dynamic subtitle descriptors.
- **Key Features**:
  - Automatically compares the sum of the individual product prices against the bundle product price to dynamically calculate and display money savings:
    `You save {{ save_amount | money }} vs. buying separately`.
  - Integrates as its own distinct block content type option in the product customizer settings (`ww-product.liquid`). Renders the visualizer card list whenever selected.
  - Leverages the existing `.ww-bundle-item` and `.ww-bundle-thumb` layout styling rules defined inside the parent template stylesheet.
- **Shopify Admin Configuration Required**:
  - **Appstle Automatic Sync**: This snippet runs fully automatically from the Appstle Bundles app dashboard data structure (`shop.metafields.appstle_bundles.bundle_rules.value`). No manual product metafield configuration is required.

### 4. WW Product Supplement Facts (`snippets/ww-product-supplement-facts.liquid`)
Renders directions, caution guidelines, serving parameters, and raw supplement facts grids.
- **Key Features**:
  - Uses Shopify's `metafield_tag` filter on `directions` and `other_ingredients` to parse Rich Text JSON formats into formatted HTML automatically.
- **Shopify Admin Configuration Required**:
  1. **Metaobject**: Create definition named `"Supplement Fact Row"` (key: `supplement_fact_row`). Add fields:
     - `name` (Single-line text)
     - `amount` (Single-line text)
     - `daily_value` (Single-line text)
  2. **Product Metafields**:
     - `custom.directions` (Rich Text) - Holds Directions & Caution text.
     - `custom.other_ingredients` (Rich Text) - Holds other ingredients list.
     - `custom.serving_size` (Single-line text).
     - `custom.servings_per_container` (Single-line text).
     - `custom.supplement_facts_list` (Metaobject Reference -> List of entries linking `Supplement Fact Row`).

### 5. WW Product Capsule Scale (`snippets/ww-product-capsule.liquid`)
Displays an interactive visualizer comparing the product's capsule size against standard capsules.
- **Key Features**:
  - Automatically hides itself dynamically from the storefront accordions if `custom.capsule_size` is blank for the active product (e.g. powder or non-capsule products).
  - Scoped styling is declared inlined inside the snippet using a nested `{% style %}` block to maintain 100% component portability.
- **Shopify Admin Configuration Required**:
  - `custom.capsule_size` (Single-line text, e.g., "Size 4").
  - `custom.capsule_dimensions` (Single-line text, e.g., "14.3 × 5.31 mm").
  - `custom.capsule_details` (Rich Text) - Overrides the default capsule description text.

---

## 4. Assets Reference

- **`assets/wanderwell.css`**: Central global stylesheet overriding Horizon core layout containers and resetting base classes.
- **`assets/wanderwell.js`**: Shared JavaScript helper modules and responsive event utilities.
- **`assets/ww-problem.js`**: Handles viewport boundaries, route path masking, stop highlights, and SVG calculations for `sections/ww-problem.liquid`.
- **`assets/ww-product.js`**: Controls the media gallery navigation sliders, thumbnail swap events, tab accordion switches, and quantity inputs inside `sections/ww-product.liquid`.
