# Components Reference

## App Entry (`App.tsx`)

Top-level component. Wires hooks to panels.

```
App
├── CookieBanner (overlay, until consent accepted)
└── AppLayout
    ├── topbar: TopBar
    ├── canvas: Canvas + ModuleToolbar (floating)
    ├── features: FeaturesPanel
    └── bom: BOMPanel
```

Hooks initialized here: `useCanvasState`, `useFeatures(state)`, `useWireDrag`.

## AppLayout (`components/layout/AppLayout.tsx`)

3-panel CSS Grid layout with collapsible features column.

**Props**: `topbar`, `canvas`, `features`, `bom` (all `ReactNode`)

- TopBar spans full width (grid row 1)
- Canvas takes center (grows to fill)
- Features panel: right column, collapsible via chevron button. Collapse hides `features` + `bom`, CSS `gridTemplateColumns` adjusts.
- BOM panel below features in same column

## TopBar (`components/topbar/TopBar.tsx`)

**Props**: `state: CanvasState`, `onImport: (state) => void`

**Export**: Creates `Blob` from `JSON.stringify(state, null, 2)`, downloads as `openccr-config.json`. No envelope — raw `CanvasState`.

**Import**: File input accepts `.json`. `FileReader.readAsText` → `JSON.parse` → calls `onImport`. Duck-typed validation only (no schema validator). Invalid JSON shows `alert`.

Wordmark renders as "open**CCR** Configurator" (bold CCR).

## ModuleToolbar (`components/toolbar/ModuleToolbar.tsx`)

Floating draggable palette. Position stored as `{x, y}` state in `App.tsx`, passed as `pos` + `onPosChange`.

**Drag handle**: Pointer events on handle div (not HTML5 DnD). Click on `[draggable]` child suppressed.

**Groups** (in display order):

| Group | Module Types |
|-------|-------------|
| MCU | MCU |
| Sensor Components | CELL_READER_4_CG, CELL_READER_4_DIFF, CELL_READER_8_CG, CELL_READER_8_DIFF, PRESSURE_SENSOR, CO2_TEMP_STICK, WATER_CONTACT, BATT_VOLTAGE_SENSOR, BATT_MANAGEMENT |
| Cells | O2_CELL_ANALOG, O2_CELL_DIGITAL, CO_SENSOR, CO2_SENSOR, HE_SENSOR |
| Actuators | SOLENOID_DRIVER_1PORT, SOLENOID_DRIVER_2PORT, SOLENOID_DRIVER_4PORT, SOLENOID_VALVE, BUZZER |
| Displays | STATUS_LIGHT, HUD_3LED, HUD_6LED, DECO_HUD, PPO2_DISPLAY, GENERAL_SCREEN |
| Storage & Controls | FLASH_MEMORY, BUTTONS, ROTARY_ENCODER |

Single-item groups use `gridSingle` CSS class (wider button).

## BOMPanel (`components/bom/BOMPanel.tsx`)

**Props**: `modules: PlacedModule[]`

Counts by `module.type`, sorted alphabetically by label. Shows "No modules placed yet" when empty. Total count at bottom. No interaction.

## CookieBanner (`components/ui/CookieBanner.tsx`)

**Props**: `onAccept: () => void`

Overlay shown until `openccr.cookieConsent === 'accepted'` in localStorage.

- **Accept** → calls `onAccept` (App writes to localStorage, hides banner)
- **Decline** → `window.location.href = 'https://www.google.com'` (navigates away)

Message: configuration data never leaves device + mentions Google Analytics for anonymous usage stats.

## UI Components (`components/ui/`)

### Button

Variants: `primary`, `secondary`, `ghost`, `danger`. Size: `sm`, `md`, `lg`. Props: standard button props + `variant`, `size`.

### Card

Wrapper with `--color-surface` background, border, border-radius. Props: `children`, optional `className`.

### Badge

Inline tag. Variants: `default`, `success`, `warning`, `danger`, `info`. Props: `variant`, `children`.

### SafetyWarning

**Safety-critical only.** Use exclusively for PO₂ setpoints, alarm thresholds, calibration notices. Never use for generic validation errors.

Props: `title`, `children`

Style: 2px solid `--color-warning` (#C0392B) border, light red background. Intended to be visually alarming.

### SectionHeader

Centered header block: eyebrow text (small caps), title, subtitle. Props: `eyebrow`, `title`, `subtitle`.
