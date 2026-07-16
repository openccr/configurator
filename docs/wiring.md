# Wiring System

## Wire Data Model

```typescript
interface Wire {
  id: string
  fromModuleId: string
  fromPortId: string
  toModuleId: string
  toPortId: string
}
```

Bus type not stored in Wire — derived from module definition at render time.

## Connection Rules (`Canvas.tsx: tryCreateWire`)

Rules checked in order; first failure rejects the wire:

1. **Bus type match** — `srcPort.busType === tgtPort.busType`
2. **Implicit ports** — reject if either port has `implicit: true`
3. **P2P directional buses** — NEOPIXEL, ADC, SOLENOID:
   - Neither endpoint may be MCU
   - One must be `direction: 'out'`, other `direction: 'in'`
   - Port occupancy checked (single-drop)
4. **Standard MCU ↔ peripheral** — all other buses:
   - Exactly one endpoint must be MCU
   - Port occupancy checked on both ends

## Port Occupancy

```typescript
function portOccupied(moduleId, portId, multiDrop): boolean {
  if (multiDrop) return false  // I2C, GPIO pool: unlimited
  return wires.some(w => w.fromModuleId === moduleId && w.fromPortId === portId
                      || w.toModuleId   === moduleId && w.toPortId   === portId)
}
```

## Bus Type Reference

| Bus | Connection | multiDrop | Direction | Wire Colour |
|-----|-----------|-----------|-----------|-------------|
| I2C | MCU ↔ peripheral | true (MCU + peripheral sides) | bidir | `#0e6bad` blue |
| SPI | MCU ↔ peripheral | false | bidir | `#7b5ea7` purple |
| UART | MCU ↔ peripheral | false | bidir | `#27ae60` green |
| NEOPIXEL | P2P chain | false | out→in | `#ff6b35` orange |
| MODBUS | MCU ↔ peripheral | true | bidir | `#78909c` blue-grey |
| GPIO | MCU ↔ peripheral | true (MCU pool only) | in/out | `#64748b` slate |
| ADC | P2P: cell→reader | false | out→in | `#e67e22` amber |
| SOLENOID | P2P: driver→valve | false | out→in | `#a569bd` orchid |

## I2C Wire Rendering (WireLayer.tsx)

I2C wires use backbone+tap topology instead of individual beziers:
- Horizontal backbone at MCU port Y between MCU and leftmost device
- Per-device L-shaped tap: drop from backbone → device port (tap offset = 16px left of device)
- Grouped by `{mcuModuleId}:{mcuPortId}`

All other bus types use cubic bezier paths.

## Bezier Path Formula (`portUtils.ts: bezierPath`)

```
M from.x,from.y C (from.x ± 80),from.y (to.x ± 80),to.y to.x,to.y
```
Control points: `+80` if `rightSide: true`, `−80` if `rightSide: false`.

## Wire Colour Registration

When adding a new BusType, update these four locations:
1. `WireLayer.module.css` — add `.wireXxx { stroke: #colour; }`
2. `WireLayer.tsx` — add to `WIRE_BUS_CLASS: Record<BusType, string>`
3. `Port.module.css` — add `.busXxx { background: #colour; }`
4. `Port.tsx` — add to `BUS_CLASS: Record<BusType, string>`

Use distinct colours. `--color-warning` (#C0392B) is reserved for safety-critical UI only.

## P2P Bus Registration

When adding a P2P directional bus (no MCU endpoint), add its BusType to `isP2PBus` in **both**:
- `Canvas.tsx` line ~243 (wire creation)
- `ModuleNode.tsx` line ~94 (compatibility highlighting)

Both checks must be identical.

## Deleting Wires

Click anywhere on a rendered wire to delete it. I2C tap segments each have their own click handler. Removing a module cascades: all wires with `fromModuleId` or `toModuleId` matching are deleted.
