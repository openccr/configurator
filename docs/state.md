# State Management

## Canvas State Shape

```typescript
interface CanvasState {
  modules: PlacedModule[]   // placed module instances
  wires: Wire[]             // connections between ports
}

interface PlacedModule {
  id: string          // nanoid, unique
  type: ModuleType
  x: number           // world coords, snapped to 40px grid
  y: number
  mcuBusSlots?: Record<string, number>  // MCU only: {I2C: 2, SPI: 1, ...}
}
```

## useCanvasState Hook

Single source of truth. All canvas mutations go through this hook.

```typescript
const {
  state,            // CanvasState (migrated, memoized)
  addModule,        // (type, x, y) → void
  moveModule,       // (id, x, y) → void
  removeModule,     // (id) → void  [cascades: deletes attached wires]
  addWire,          // (Omit<Wire,'id'>) → void
  removeWire,       // (id) → void
  addMcuBusSlot,    // (moduleId, busType) → void
  removeMcuBusSlot, // (moduleId, busType) → void  [only if slot has no wire]
  importState,      // (CanvasState) → void  [replaces entire state]
} = useCanvasState()
```

## Persistence

Storage key: `openccr.canvas` (via `storage.ts` prefix `"openccr."`).

`useStorage(key, default)` wraps `useState` with synchronous localStorage read on init and write on every update. Returns `[value, setValue, clearValue]`.

All state ops use functional `setState(prev => ...)` to avoid stale state.

## Schema Migration

`migrateCanvasState(raw: CanvasState): CanvasState` runs inside a `useMemo([state])`:

| Version | Change |
|---------|--------|
| v1 → v2 | `type: 'SOLENOID'` → `'SOLENOID_DRIVER_1PORT'`; port id `'GPIO'` → `'GPIO_1'` in connected wires |

When migration is detected (`JSON.stringify` diff), a `useEffect` writes the migrated state back to localStorage so subsequent mutations operate on the current schema.

**Pattern for future migrations:** add a new block in `migrateCanvasState`, increment the version comment, add a row to this table.

## Import / Export

TopBar provides JSON import/export via `importState`. Exported JSON is `CanvasState` directly — no envelope. Import validates via TypeScript types at runtime (duck-typed; no schema validator).

## Other Hooks

**useWireDrag**
```typescript
interface WireDragState {
  active: boolean
  sourceModuleId: string | null
  sourcePortId: string | null
  sourcePos: {x, y} | null
  sourceRightSide: boolean
  cursorPos: {x, y} | null
}
// ops: startDrag, updateCursor, cancelDrag
```
Local React state, not persisted.

**useFeatures(state)**
`useMemo` over `state.modules` and `state.wires`. Re-evaluates all 21 feature rules. Returns `{rule: FeatureRule, unlocked: boolean, hint: string}[]`.

## localStorage Keys

| Key | Value |
|-----|-------|
| `openccr.canvas` | `CanvasState` JSON |
| `openccr.cookieConsent` | `"accepted"` |
