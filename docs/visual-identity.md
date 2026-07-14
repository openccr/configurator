<!--
SPDX-License-Identifier: CC-BY-4.0
Copyright (c) 2026 openCCR contributors
-->

# openCCR Visual Identity — Configurator Reference

This guide defines the visual identity system for the openCCR configurator. It mirrors the canonical system established in `openccr.github.io` and must stay in sync with it. When in doubt, defer to the website's `CLAUDE.md` and `css/main.css`.

---

## Color Palette

All colors are CSS custom properties. Define them once in a global stylesheet (e.g., `src/styles/tokens.css`) and import into the app root.

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Base background |
| `--color-bg-subtle` | `#F0F5FA` | Section alternation, input backgrounds |
| `--color-border` | `#C8DCF0` | Borders, dividers, input outlines |
| `--color-text` | `#111827` | Body text (near-black) |
| `--color-text-muted` | `#4B6478` | Secondary text, labels, hints |
| `--color-navy` | `#0A3060` | Headings, primary buttons, wordmark |
| `--color-ocean` | `#0E6BAD` | Links, active states, card labels |
| `--color-cyan` | `#24B4D8` | Hover states, focus rings, highlights |
| `--color-warning` | `#C0392B` | **Safety-critical notices only** |

**Rules:**
- Never add colors outside this palette without updating this doc and the website's CLAUDE.md.
- `--color-warning` is reserved exclusively for safety-critical content (wrong PO₂, alarm misconfiguration). Never use it for validation errors, loading states, or decorative purposes.
- On navy backgrounds, use white text + `--color-cyan` for accents.

---

## Typography

Load via Google Fonts. Add to `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Role | Font | Weights |
|---|---|---|
| Headings, labels, section eyebrows, nav | **Space Grotesk** | 400, 500, 600, 700 |
| Body, paragraphs, form inputs, captions | **Inter** | 400, 500, 600 |
| Code, config values, UUIDs, hex data | **JetBrains Mono** | 400, 500 |

```css
--font-heading: 'Space Grotesk', system-ui, sans-serif;
--font-body:    'Inter', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', 'Fira Code', monospace;
```

### Font Size Scale

```css
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
```

### Heading Defaults

All headings: `font-family: var(--font-heading)`, `color: var(--color-navy)`, `font-weight: 700`, `line-height: 1.2`.

| Element | Size token |
|---|---|
| h1 | `--text-5xl` |
| h2 | `--text-4xl` |
| h3 | `--text-3xl` |
| h4 | `--text-2xl` |
| h5 | `--text-xl` |
| h6 | `--text-lg` |

---

## Spacing Scale

4px base unit. Always use tokens — no arbitrary pixel values.

```css
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-6:   24px;
--space-8:   32px;
--space-12:  48px;
--space-16:  64px;
```

---

## Layout

```css
--max-width:  1200px;
--nav-height: 64px;
```

- Single responsive breakpoint: **768px**. Below it, grids collapse to 1 column, nav collapses to hamburger, section padding reduces.
- Container: max-width `--max-width`, horizontal padding `--space-6` (reduces to `--space-4` below 768px).
- Grid helpers: 2-, 3-, 4-column CSS Grid with `--space-6` gap, all collapsing at 768px.

---

## Border Radius

```css
--radius-sm: 4px;   /* Small inputs, inline badges */
--radius-md: 8px;   /* Buttons, modals, form controls */
--radius-lg: 12px;  /* Cards, panels, section containers */
```

---

## Shadows

```css
--shadow-sm: 0 1px 3px rgba(10, 48, 96, 0.08);
--shadow-md: 0 4px 12px rgba(10, 48, 96, 0.12);
--shadow-lg: 0 8px 24px rgba(10, 48, 96, 0.16);
```

Use `--shadow-sm` as the default card resting state, `--shadow-md` on hover/focus.

---

## Transitions

```css
--transition: 200ms ease;
```

All interactive state changes (hover, focus, active) use this timing. Do not add custom transitions.

---

## Components

Implement as React components. The patterns below define appearance; use CSS modules or a global token sheet for styles.

### Buttons

Three variants, two sizes.

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| Primary | `--color-navy` | white | none | `--color-ocean` fill |
| Outline | transparent | `--color-navy` | 2px `--color-navy` | navy fill, white text |
| Outline Light | transparent | white | 2px `rgba(255,255,255,0.5)` | `rgba(255,255,255,0.12)` fill |

Base: `font-family: --font-body`, weight 600, `--text-sm`, padding `--space-3` / `--space-6`, `--radius-md`.
Large: `--text-base`, padding `--space-4` / `--space-8`.
Small: `--text-xs`, padding `--space-2` / `--space-4`.
Focus: 3px solid `--color-cyan` outline, 2px offset.

### Cards

- Background: `--color-bg`, border: 1px `--color-border`, `--radius-lg`, padding `--space-6`, `--shadow-sm`.
- Hover: `--shadow-md`, `translateY(-2px)`.
- Internal parts: icon (48px, `--color-bg-subtle` bg, `--color-ocean` icon), title (`--font-heading`, weight 600, `--text-xl`, navy), body (`--text-sm`, `--color-text-muted`, line-height 1.7).

### Form Controls

- Input/select/textarea: `--font-body`, `--text-base`, `--color-text`, bg `--color-bg`, border 1px `--color-border`, `--radius-md`, padding `--space-3` / `--space-4`.
- Focus: border `--color-ocean`, `--shadow-sm`.
- Error state: border `--color-warning` — only for validation errors, not safety notices.
- Labels: `--font-body`, weight 500, `--text-sm`, `--color-text`.
- Helper text: `--text-xs`, `--color-text-muted`.
- Required indicator: `--color-warning` asterisk — keep accessible (`aria-required`).

### Badges

Inline status tags. Keep text 1–3 words.

| Variant | Background | Text | Border |
|---|---|---|---|
| Navy | `--color-navy` | white | none |
| Ocean | `rgba(14,107,173,0.1)` | `--color-ocean` | 1px `rgba(14,107,173,0.2)` |
| Cyan | `rgba(36,180,216,0.1)` | `#1a8fa8` | 1px `rgba(36,180,216,0.25)` |
| Warning | `rgba(192,57,43,0.1)` | `--color-warning` | 1px `rgba(192,57,43,0.2)` |

Base: `--font-body`, weight 600, `--text-xs`, padding 2px `--space-2`, border-radius 100px.

### Safety Warning

**Reserved exclusively for CCR safety-critical notices** (wrong PO₂ setpoints accepted, alarm threshold misconfiguration, calibration data rejected).

- Background: `rgba(192,57,43,0.05)`, border: 2px solid `--color-warning`, `--radius-md`, padding `--space-4` / `--space-6`.
- Layout: flex row, gap `--space-4`, align-items flex-start.
- Icon: 24×24px warning triangle, `--color-warning`, flex-shrink 0.
- Title: `--font-heading`, weight 700, `--text-base`, `--color-warning`.
- Body: `--text-sm`, `--color-text`, line-height 1.6.

Every screen that writes configuration to the device must include a safety warning if the parameter is safety-critical (PO₂, alarms, calibration).

### Section Header

Centered header block above content grids.

- Eyebrow: `--font-heading`, weight 600, `--text-xs`, uppercase, letter-spacing 0.12em, `--color-ocean`.
- Title: `--font-heading`, weight 700, `--text-4xl`, `--color-navy`, line-height 1.15.
- Subtitle: `--text-lg`, `--color-text-muted`, max-width 560px, centered, line-height 1.6.
- Margin-bottom: `--space-12`.

### Wordmark

```jsx
<a href="/" aria-label="openCCR home">
  <span style={{ fontWeight: 400 }}>open</span>
  <span style={{ fontWeight: 700, letterSpacing: '0.04em' }}>CCR</span>
</a>
```

Light bg: `--color-navy`. Dark/navy bg: `#ffffff`.

---

## Accessibility

- All interactive elements must be keyboard-reachable.
- Focus ring: 3px solid `--color-cyan`, 2px offset — never remove `:focus-visible` styles.
- Decorative SVGs: `aria-hidden="true"`.
- Form inputs: always paired with a `<label>` (visible or `.sr-only`).
- Color contrast: navy on white exceeds WCAG AA. Never use muted colors as the sole conveyor of meaning.
- Safety warnings: include text, not just color/icon.

---

## Do Not

- Do not add colors outside the defined palette.
- Do not use `--color-warning` for anything other than CCR safety-critical content.
- Do not remove or override focus ring styles.
- Do not hard-code pixel values for spacing — use tokens.
- Do not use inline styles for reusable component styles — use CSS modules or class-based styles.
- Do not skip the safety warning on any screen that writes PO₂, alarm, or calibration parameters.

---

## Sync Policy

This file mirrors `openccr.github.io/CLAUDE.md` and `openccr.github.io/css/`. If the website design system changes, update this file in the same PR. If this file changes, open a corresponding PR on the website repo.
