This app is served under openccr.github.io/configurator and under openccr.org/configurator.

All styling and scripting must use relative paths.

## Developer Docs

Read before writing code. Optimized for AI agent use.

| Doc | Read when |
|-----|-----------|
| [docs/architecture.md](docs/architecture.md) | Starting work; understanding overall structure; adding module types or bus types |
| [docs/modules.md](docs/modules.md) | Adding/modifying module types, ports, or bus helpers |
| [docs/wiring.md](docs/wiring.md) | Changing wire connection rules, bus colours, P2P vs MCU logic |
| [docs/canvas.md](docs/canvas.md) | Touching pan/zoom, drag-drop, port positioning, coordinate transforms |
| [docs/features.md](docs/features.md) | Adding/modifying feature unlock rules |
| [docs/state.md](docs/state.md) | Touching state persistence, migration, or hook interfaces |
| [docs/visual-identity.md](docs/visual-identity.md) | Writing any UI code (colours, typography, spacing) |

## Visual Identity

The openCCR design system (colors, typography, spacing, components) is documented in:

**[docs/visual-identity.md](docs/visual-identity.md)**

Read it before writing any UI code. Key rules enforced there:

- Use only the defined CSS custom property tokens — no arbitrary colors or pixel values.
- `--color-warning` (#C0392B) is reserved exclusively for CCR safety-critical notices (PO₂, alarm thresholds, calibration). Never use it for generic validation errors or decorative states.
- Fonts: Space Grotesk (headings), Inter (body), JetBrains Mono (code/values).
- Every screen that writes PO₂ setpoints, alarm thresholds, or calibration parameters must include a `.safety-warning` component.
- Focus rings (`--color-cyan`, 3px, 2px offset) must never be removed.

The canonical source of truth is `openccr.github.io/CLAUDE.md` and `openccr.github.io/css/`. If they conflict with `docs/visual-identity.md`, the website wins — update this doc to match.
