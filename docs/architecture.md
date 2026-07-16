# Architecture

## What Is This

Browser-only drag-and-drop configurator for openCCR rebreather electronics. Users place hardware modules on a canvas, wire ports together, and see which CCR features are unlocked by the configuration. Output: visual diagram + bill of materials. No backend; state in localStorage.

Deployed at `openccr.github.io/configurator` and `openccr.org/configurator`. All paths must be relative.

## Tech Stack

React 18 · TypeScript · Vite · CSS Modules · nanoid · localStorage

## File Map

```
app/src/
├── types/index.ts          Core types: BusType, ModuleType, PortDef, PlacedModule, Wire, CanvasState
├── data/
│   ├── moduleDefinitions.ts  Catalog of all module types → ports, labels, colorGroup
│   └── featureRules.ts       24 feature unlock rules + connectivity BFS helpers
├── canvas/portUtils.ts     MCU port generation, port Y-positions, bezier wire paths, layout constants
├── hooks/
│   ├── useCanvasState.ts   State management (modules+wires), localStorage, migration
│   ├── useFeatures.ts      Evaluates feature rules against canvas state (memoized)
│   ├── useWireDrag.ts      Wire drag session state
│   └── useStorage.ts       Generic localStorage React hook
├── storage/storage.ts      Raw localStorage adapter (prefixed with "openccr.")
├── components/
│   ├── canvas/             Canvas, ModuleNode, Port, WireLayer
│   ├── toolbar/            Floating draggable ModuleToolbar
│   ├── topbar/             TopBar (import/export)
│   ├── features/           FeaturesPanel (unlock status)
│   ├── bom/                BOMPanel (bill of materials)
│   ├── layout/             AppLayout (3-panel grid)
│   └── ui/                 Button, Card, Badge, SafetyWarning, CookieBanner
└── styles/
    ├── tokens.css          CSS custom properties
    └── global.css          Reset + base styles
```

## Data Flow

```
moduleDefinitions.ts ──► ModuleToolbar (drag source)
                              │ drop
                              ▼
                        useCanvasState ◄── localStorage (persisted)
                        (modules, wires)
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
               Canvas                useFeatures
          (renders nodes          (evaluates rules,
           + wire SVG)             returns unlocked[])
                    │                    │
               ModuleNode          FeaturesPanel
               WireLayer           BOMPanel
```

## Key Invariants

- Every `ModuleType` member must have an entry in `MODULE_DEFINITIONS`.
- Every `BusType` member must have an entry in every `Record<BusType, …>` (WireLayer, Port).
- `implicit: true` ports are never rendered or wired; they only count toward MCU GPIO usage.
- MCU is the only module with dynamic ports; all others are static from their `ModuleDefinition`.
- Wires store `{fromModuleId, fromPortId, toModuleId, toPortId}`; no bus type stored (derived at render time from module definition).

## Adding a New Module Type

1. Add the type string to `ModuleType` union in `types/index.ts`
2. Add an entry to `MODULE_DEFINITIONS` in `moduleDefinitions.ts`
3. Add the type to the appropriate group in `ModuleToolbar.tsx`
4. If it affects any feature, update `featureRules.ts`
5. If it has a new BusType, see `docs/wiring.md`

## Adding a New Bus Type

1. Add to `BusType` union in `types/index.ts`
2. Add CSS class in `WireLayer.module.css` (stroke colour) and `Port.module.css` (background)
3. Add entries in `WIRE_BUS_CLASS` (WireLayer.tsx) and `BUS_CLASS` (Port.tsx)
4. If P2P directional (non-MCU both ends): add to `isP2PBus` check in Canvas.tsx and ModuleNode.tsx
5. See `docs/wiring.md` for P2P vs MCU-peripheral rules
