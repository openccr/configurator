# Feature Rules System

## Interface (`featureRules.ts`)

```typescript
interface FeatureRule {
  id: string
  label: string
  description: string
  check(modules: PlacedModule[], wires: Wire[]): boolean
  missingHint(modules: PlacedModule[], wires: Wire[]): string
}
```

`FEATURE_RULES: FeatureRule[]` — ordered array; order = display order in FeaturesPanel.

`useFeatures(state)` evaluates all rules via `useMemo([state.modules, state.wires])` and returns `{ rule, unlocked, hint }[]`. **21 rules total.**

## Connectivity Helpers

All helpers exported from `featureRules.ts`:

```typescript
hasMcu(modules)                          // any MCU on canvas
getMcuId(modules)                        // MCU module id or null
isConnectedToMcu(modules, wires, id)     // BFS from id; true if MCU reachable
connectedCount(modules, wires, ...types) // count of modules of types[] connected to MCU
connectedAny(modules, wires, ...types)   // connectedCount > 0
```

**BFS traversal** (`isConnectedToMcu`): undirected graph walk — follows any wire in either direction. This means NeoPixel chains and ADC cell→reader→MCU chains are all counted as "connected to MCU" if any path exists.

`totalCellCount` (internal): `connectedCount(O2_CELL_ANALOG) + connectedCount(O2_CELL_DIGITAL)`

## All Feature Rules

| ID | Requires |
|----|---------|
| PPO2_MONITORING | MCU + ≥1 O₂ cell (analog or digital) |
| CELL_VOTING | MCU + ≥3 O₂ cells |
| CLOSED_LOOP | MCU + ≥1 O₂ cell + any solenoid driver |
| DECOMPRESSION | MCU + PRESSURE_SENSOR connected |
| BARO_COMPENSATION | MCU + PRESSURE_SENSOR connected |
| CO2_MONITORING | MCU + CO2_SENSOR connected |
| CO_MONITORING | MCU + CO_SENSOR connected |
| HE_MONITORING | MCU + HE_SENSOR connected |
| SCRUBBER_TEMP | MCU + CO2_TEMP_STICK connected |
| DIVE_START | MCU + WATER_CONTACT connected |
| STATUS_INDICATION | MCU + STATUS_LIGHT connected |
| HUD_DISPLAY | MCU + any HUD (HUD_3LED, HUD_6LED, or DECO_HUD) connected |
| DECO_DISPLAY | MCU + DECO_HUD connected |
| PPO2_DISPLAY_FEAT | MCU + PPO2_DISPLAY connected |
| GENERAL_SCREEN_FEAT | MCU + GENERAL_SCREEN connected |
| DATA_LOGGING | MCU + FLASH_MEMORY connected |
| BUTTON_CONTROL | MCU + BUTTONS connected |
| ENCODER_CONTROL | MCU + ROTARY_ENCODER connected |
| AUDIBLE_ALERTS | MCU + BUZZER connected |
| BATT_VOLTAGE | MCU + BATT_VOLTAGE_SENSOR connected |
| BATT_MGMT | MCU + BATT_MANAGEMENT connected |

## Adding a Feature Rule

```typescript
{
  id: 'MY_FEATURE',
  label: 'Human Label',
  description: 'One sentence description.',
  check: (m, w) => hasMcu(m) && connectedAny(m, w, 'MODULE_TYPE'),
  missingHint: (m, _w) => hasMcu(m) ? 'needs: MODULE_TYPE wired to MCU' : 'needs: MCU on canvas',
},
```

Push to `FEATURE_RULES` array. No other registration needed.

## FeaturesPanel Display

- Unlocked: green check icon + label
- Locked: grey lock icon + label + hint text
- Ordered by `FEATURE_RULES` array order
