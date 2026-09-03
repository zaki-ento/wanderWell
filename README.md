# WanderWell — Shopify Online Store 2.0 Theme

A custom, high-performance, and conversion-focused Shopify Online Store 2.0 storefront engineered for **WanderWell**. Built on top of Shopify's modern **Horizon** core theme framework using an isolated, upgrade-safe `ww-` extension architecture.

---

## 🌟 Highlights

- **Upgrade-Safe Architecture**: Core Horizon files remain preserved with minimal, documented touchpoints. All custom sections, snippets, and assets use the `ww-` prefix.
- **Dynamic Content & Zero Hard-coding**: 100% of storefront headlines, product specs, legal texts, media loops, and buttons are editable via the Theme Customizer, Metafields, or Metaobjects.
- **Subscriptions & Bundle Ready**: Seamlessly integrated with **Appstle Subscriptions** for Subscribe & Save selling plans with automated per-serving price calculations and frequency controls.
- **Accessible & Responsive**: Meets WCAG 2.1 AA accessibility standards with full keyboard navigation, ARIA landmarks, visible focus rings, and `prefers-reduced-motion` compliance.
- **Custom Brand Design System**: Authentic Sofia Pro and Montserrat webfonts, curated color tokens (`--orange`, `--cream`, `--charcoal`), and responsive utilities.

---

## 📁 Repository Structure

```
wanderWell/
├── assets/
│   ├── wanderwell.css              # Global brand design system & layout resets
│   ├── wanderwell.js               # Global shared JavaScript utilities
│   ├── ww-problem.js               # Interactive route map SVG & scroll triggers
│   ├── ww-product.css              # Scoped Product Hub stylesheet
│   ├── ww-product.js               # Product gallery, purchase options & accordion logic
│   ├── montserrat-*.woff2          # Montserrat font family assets
│   └── sofia-pro-*.woff2           # Sofia Pro font family assets
├── blocks/                         # Horizon theme blocks
├── config/
│   ├── settings_schema.json        # Global settings schema (WanderWell brand tokens)
│   └── settings_data.json          # Active customizer settings & color values
├── layout/
│   └── theme.liquid                # Master layout (font preloads, CSS variables, popup)
├── sections/
│   ├── ww-404.liquid               # Custom 404 Error page
│   ├── ww-approach.liquid          # Brand transparency & feature cards grid
│   ├── ww-contact-form.liquid      # Asynchronous AJAX contact inquiry form
│   ├── ww-faq.liquid               # Accordion FAQ with Metaobject support
│   ├── ww-feedback.liquid          # Judge.me reviews & customer testimonials
│   ├── ww-footer.liquid            # Full-bleed brand footer with newsletter
│   ├── ww-footer-section.liquid    # Footer preset wrapper
│   ├── ww-header-section.liquid    # Header preset wrapper
│   ├── ww-hero.liquid              # Video/media hero with loop marquee
│   ├── ww-info-page.liquid         # Universal legal & policy page builder
│   ├── ww-popup.liquid             # Global discount & newsletter promo modal
│   ├── ww-problem.liquid           # Interactive altitude & travel stress map
│   ├── ww-product.liquid           # Main Product Hub conversion container
│   ├── ww-product-template.liquid  # Modular product page section
│   └── ... (Horizon core sections)
├── snippets/
│   ├── ww-css-variables.liquid     # Brand CSS tokens declared under :root
│   ├── ww-product-bundle.liquid    # Bundle items & savings calculator
│   ├── ww-product-capsule.liquid   # Interactive capsule visualizer
│   ├── ww-product-ingredients.liquid # Dynamic Metaobject ingredients cards
│   ├── ww-product-purchase-options.liquid # Appstle Subscriptions selector
│   ├── ww-product-supplement-facts.liquid # Supplement facts nutrition grid
│   └── ... (Horizon core snippets)
├── templates/
│   ├── 404.json                    # Uses ww-404
│   ├── index.json                  # Composed of custom ww- sections
│   ├── page.contact.json           # Uses ww-contact-form
│   ├── page.ww-accessibility.json  # Uses ww-info-page
│   ├── page.ww-privacy.json        # Uses ww-info-page
│   ├── page.ww-prop65.json         # Uses ww-info-page
│   ├── page.ww-terms.json          # Uses ww-info-page
│   ├── product.ww-products.json    # Uses ww-product
│   └── ... (Horizon core templates)
├── HORIZON_MODIFICATIONS_LOG.md    # Detailed audit of Horizon core file changes
├── pages-html-templates.md         # Reference HTML for legal and policy pages
└── wanderwell-custom-components.md # Complete reference for all ww- components
```

---

## 🛠️ Horizon Core Modifications

To maintain theme upgradeability, modifications to Horizon core files are restricted to essential bugfixes and integrations:

1. **`layout/theme.liquid`**: Added Sofia Pro webfont preloading and injected the global promotional popup (`{% section 'ww-popup' %}`).
2. **`snippets/cart-drawer.liquid`**: Added the `no-persist` attribute to prevent the cart drawer from staying open on page navigation.
3. **`snippets/scripts.liquid`**: Appended `.js` to `cart_change_url` and `cart_update_url` for strict AJAX routing.
4. **`assets/cart-discount.js` & `assets/component-cart-items.js`**: Added optional chaining and fallback rendering via `sectionRenderer` when section HTML is absent from responses.
5. **`config/settings_schema.json` & `config/settings_data.json`**: Added WanderWell brand tokens and palette presets.
6. **`sections/header-group.json` & `sections/footer-group.json`**: Styled header navigation and replaced utilities with `ww-footer`.

For the comprehensive line-by-line changelog, see [HORIZON_MODIFICATIONS_LOG.md](HORIZON_MODIFICATIONS_LOG.md).

---

## 🎨 Design Tokens & CSS Architecture

All global styles and brand tokens are managed in:
- **`snippets/ww-css-variables.liquid`**: Included in `<head>` to define custom properties:
  - `--orange`: Primary Brand Accent (`#E8632B`)
  - `--orange-dark`: Dark Hover Accent (`#D15523`)
  - `--cream`: Brand Background (`#F2EDE4`)
  - `--charcoal`: Brand Text (`#2C2C2C`)
  - `--font-primary` & `--font-tertiary`: `'sofia-pro', 'Montserrat', sans-serif`
- **`assets/wanderwell.css`**: Global design system, container utilities (`.container`, `.max-w-breakpoint-*`), CTA buttons, and cart drawer styling overrides.

---

## 🧩 Custom Components & Snippets

For full configuration guides, Shopify Admin Metafield/Metaobject definitions, and usage examples, refer to [wanderwell-custom-components.md](wanderwell-custom-components.md).

---

## 🔌 App Integrations

- **Appstle Subscriptions**: Powers the Subscribe & Save selector, discount percentage calculations, and billing frequencies (30/45/60 days).
- **Judge.me Product Reviews**: Powers customer rating badges and review widgets via `@app` blocks in `sections/ww-feedback.liquid`.
- **Klaviyo & Gorgias**: Implemented via official Shopify App Embeds without theme code modification.

---

## 💻 Local Development Workflow

To work on this theme locally using the **Shopify CLI**:

```bash
# 1. Navigate to the theme directory
cd wanderWell

# 2. Check theme code for syntax or best-practice issues
shopify theme check

# 3. Start local development server with live preview
shopify theme dev --store=your-store.myshopify.com

# 4. Push changes to a development/staging theme
shopify theme push --theme="Theme Name"
```

---

## 📜 Development Guidelines

All developers and contributors must follow the coding standards and architectural principles outlined in [AGENTS.md](../AGENTS.md).