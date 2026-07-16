# Canvas System

## Layout Constants (`portUtils.ts`)

```typescript
MCU_WIDTH         = 200   // px, MCU card width
PERIPH_WIDTH      = 160   // px, peripheral card width
CARD_HEADER_HEIGHT = 40   // px, coloured header bar
PORT_ROW_HEIGHT   = 24    // px, height of each port row
GPIO_BLOCK_HEIGHT = 48    // px, MCU GPIO pool block
PORT_RADIUS       = 6     // px, port dot radius
BEZIER_OFFSET     = 80    // px, bezier control point offset
SNAP_GRID         = 40    // px, module placement snap
MIN_SCALE         = 0.25
MAX_SCALE         = 2.0
```

## Coordinate System

Two coordinate spaces:

**Screen space** — client pixels relative to viewport. Used for mouse events.

**Canvas/world space** — logical coordinates stored in `PlacedModule.{x,y}`. Transform applied via CSS:
```
translate(tx px, ty px) scale(scale)
```

Conversion (screen → world):
```typescript
x = (clientX - rect.left - tx) / scale
y = (clientY - rect.top  - ty) / scale
```

Transform state lives in `transformRef` (ref, not state) to avoid stale closures in event handlers. Mirror in `transform` state only for re-rendering.

## Pan / Zoom

- **Zoom**: mouse wheel, centered on cursor. Scale clamped to [0.25, 2.0].
- **Pan**: right-mouse drag. Wheel listener is non-passive (`preventDefault`).
- Transform ref updated synchronously; React state updated for re-render.

## Module Placement (HTML5 Drag-and-Drop)

1. `ModuleToolbar` drag start: sets `dataTransfer.setData('moduleType', type)`
2. Canvas `onDrop`: converts client coords → world, snaps to 40px grid, calls `onAddModule`
3. Existing modules: drag header sets `moduleId` + pickup client coords; drop reconstructs world offset to preserve grab point

Snap: `Math.round(v / 40) * 40`

## Wire Drag (Pointer Events)

1. `Port.onPointerDown` → `onStartDrag(moduleId, portId, canvasPos, rightSide)`
2. Canvas `onPointerMove` → `onUpdateCursor(canvasPos)`
3. Canvas `onPointerUp` → `document.elementsFromPoint(clientX, clientY)` finds element with `data-port-id` attribute → `tryCreateWire(targetModuleId, targetPortId)`

Ghost wire rendered as dashed bezier from source port to cursor while dragging.

## Port Canvas Position

**Peripheral ports** (`getPortCanvasPosById`):
```
x = module.x (leftSide) or module.x + PERIPH_WIDTH (rightSide)
y = module.y + CARD_HEADER_HEIGHT + portIndex * PORT_ROW_HEIGHT + PORT_ROW_HEIGHT / 2
```
`portIndex` = index in `def.ports.filter(p => !p.implicit)`.

**MCU ports** (`getMcuPortY`):
```
GPIO:    module.y + CARD_HEADER_HEIGHT + GPIO_BLOCK_HEIGHT / 2
MODBUS:  module.y + CARD_HEADER_HEIGHT + GPIO_BLOCK_HEIGHT + PORT_ROW_HEIGHT / 2
I2C-N:   module.y + CARD_HEADER_HEIGHT + GPIO_BLOCK_HEIGHT + PORT_ROW_HEIGHT + (cumulative slot rows) * PORT_ROW_HEIGHT + PORT_ROW_HEIGHT / 2
```
Expandable buses ordered: I2C, SPI, UART, NEOPIXEL.

MCU port x:
- `rightSide: true` → `module.x + MCU_WIDTH`
- `rightSide: false` (MODBUS) → `module.x`

## Port Data Attributes

Each port DOM element carries:
```html
data-module-id="<moduleId>"
data-port-id="<portId>"
```
Used by pointer-up detection via `document.elementsFromPoint`.

## Module Node Types

`ModuleNode` dispatches on `module.type`:
- `MCU` → `McuNode`: dynamic ports, expandable bus buttons, GPIO count label
- everything else → `PeripheralNode`: static ports from `ModuleDefinition`

## Compatibility Highlighting

During wire drag, each port computes `isCompatibleTarget` via `isCompatibleTarget()` in `ModuleNode.tsx`. Port dot gets CSS class: `dotCompatible`, `dotIncompatible`, or `dotOccupied`. Logic mirrors `tryCreateWire` rules exactly.
