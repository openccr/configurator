// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { PlacedModule, Wire, ModuleType } from '../types';

export interface FeatureRule {
  id: string;
  label: string;
  description: string;
  check(modules: PlacedModule[], wires: Wire[]): boolean;
  missingHint(modules: PlacedModule[], wires: Wire[]): string;
}

// ── Connectivity helpers ──────────────────────────────────────────────────────

export function getMcuId(modules: PlacedModule[]): string | null {
  return modules.find((m) => m.type === 'MCU')?.id ?? null;
}

export function hasMcu(modules: PlacedModule[]): boolean {
  return modules.some((m) => m.type === 'MCU');
}

/**
 * BFS from moduleId through all wires to see if MCU is reachable.
 * Handles direct connections, NeoPixel chains, and cell → reader → MCU chains.
 */
export function isConnectedToMcu(
  modules: PlacedModule[],
  wires: Wire[],
  moduleId: string
): boolean {
  const mcuId = getMcuId(modules);
  if (!mcuId) return false;

  const visited = new Set<string>();
  const queue = [moduleId];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    if (id === mcuId) return true;

    for (const w of wires) {
      if (w.fromModuleId === id && !visited.has(w.toModuleId)) queue.push(w.toModuleId);
      if (w.toModuleId === id && !visited.has(w.fromModuleId)) queue.push(w.fromModuleId);
    }
  }

  return false;
}

function connectedModulesOfType(
  modules: PlacedModule[],
  wires: Wire[],
  ...types: ModuleType[]
): PlacedModule[] {
  return modules.filter((m) => types.includes(m.type) && isConnectedToMcu(modules, wires, m.id));
}

export function connectedCount(
  modules: PlacedModule[],
  wires: Wire[],
  ...types: ModuleType[]
): number {
  return connectedModulesOfType(modules, wires, ...types).length;
}

export function connectedAny(
  modules: PlacedModule[],
  wires: Wire[],
  ...types: ModuleType[]
): boolean {
  return connectedCount(modules, wires, ...types) > 0;
}

/** Total O₂ cell count: analog cells connected to readers + digital cells connected to MCU */
function totalCellCount(modules: PlacedModule[], wires: Wire[]): number {
  return (
    connectedCount(modules, wires, 'O2_CELL_ANALOG') +
    connectedCount(modules, wires, 'O2_CELL_DIGITAL')
  );
}

// ── Feature rules ─────────────────────────────────────────────────────────────

export const FEATURE_RULES: FeatureRule[] = [
  {
    id: 'PPO2_MONITORING',
    label: 'ppO₂ Monitoring',
    description: 'Monitor partial pressure of oxygen',
    check: (m, w) => hasMcu(m) && totalCellCount(m, w) >= 1,
    missingHint: (m, _w) => (hasMcu(m) ? 'needs: O₂ cell → reader → MCU' : 'needs: MCU on canvas'),
  },
  {
    id: 'CELL_VOTING',
    label: '3-Cell Voting',
    description: 'Majority voting across ≥ 3 O₂ cells for redundancy',
    check: (m, w) => hasMcu(m) && totalCellCount(m, w) >= 3,
    missingHint: (m, w) => {
      const count = totalCellCount(m, w);
      return `needs: ${3 - count} more O₂ cell(s) connected`;
    },
  },
  {
    id: 'CLOSED_LOOP',
    label: 'Closed-Loop Setpoint',
    description: 'Automatic O₂ injection to maintain ppO₂ setpoint',
    check: (m, w) => hasMcu(m) && totalCellCount(m, w) >= 1 && connectedAny(m, w, 'SOLENOID'),
    missingHint: (m, w) => {
      if (!hasMcu(m)) return 'needs: MCU on canvas';
      if (totalCellCount(m, w) < 1) return 'needs: O₂ cell wired to MCU chain';
      return 'needs: Solenoid Driver wired to MCU';
    },
  },
  {
    id: 'DECOMPRESSION',
    label: 'Decompression Calculation',
    description: 'Real-time deco obligation from depth data',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'PRESSURE_SENSOR'),
    missingHint: (m, _w) =>
      hasMcu(m) ? 'needs: Pressure Sensor wired to MCU' : 'needs: MCU on canvas',
  },
  {
    id: 'BARO_COMPENSATION',
    label: 'Barometric Compensation',
    description: 'Adjust depth readings for surface pressure',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'PRESSURE_SENSOR'),
    missingHint: (m, _w) =>
      hasMcu(m) ? 'needs: Pressure Sensor wired to MCU' : 'needs: MCU on canvas',
  },
  {
    id: 'CO2_MONITORING',
    label: 'CO₂ Monitoring',
    description: 'Monitor CO₂ levels via cell reader',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'CO2_SENSOR'),
    missingHint: (m, _w) => (hasMcu(m) ? 'needs: CO₂ cell → reader → MCU' : 'needs: MCU on canvas'),
  },
  {
    id: 'CO_MONITORING',
    label: 'CO Monitoring',
    description: 'Monitor carbon monoxide contamination via cell reader',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'CO_SENSOR'),
    missingHint: (m, _w) => (hasMcu(m) ? 'needs: CO cell → reader → MCU' : 'needs: MCU on canvas'),
  },
  {
    id: 'HE_MONITORING',
    label: 'Helium Fraction Monitoring',
    description: 'Track helium fraction for trimix diving',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'HE_SENSOR'),
    missingHint: (m, _w) => (hasMcu(m) ? 'needs: He cell → reader → MCU' : 'needs: MCU on canvas'),
  },
  {
    id: 'SCRUBBER_TEMP',
    label: 'Scrubber Temperature Monitoring',
    description: 'Monitor CO₂ scrubber temperature to detect exhaustion',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'CO2_TEMP_STICK'),
    missingHint: (m, _w) =>
      hasMcu(m) ? 'needs: Scrubber Temp Stick wired to MCU' : 'needs: MCU on canvas',
  },
  {
    id: 'DIVE_START',
    label: 'Dive Start Detection',
    description: 'Detect dive start via water contact sensor',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'WATER_CONTACT'),
    missingHint: (m, _w) =>
      hasMcu(m) ? 'needs: Water Contact Sensor wired to MCU' : 'needs: MCU on canvas',
  },
  {
    id: 'STATUS_INDICATION',
    label: 'Status Indication',
    description: 'NeoPixel status LED reachable from MCU',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'STATUS_LIGHT'),
    missingHint: (m, _w) =>
      hasMcu(m) ? 'needs: Status Light in NeoPixel chain' : 'needs: MCU on canvas',
  },
  {
    id: 'HUD_DISPLAY',
    label: 'HUD Display',
    description: 'NeoPixel HUD display reachable from MCU',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'HUD_3LED', 'HUD_6LED', 'DECO_HUD'),
    missingHint: (m, _w) => (hasMcu(m) ? 'needs: HUD in NeoPixel chain' : 'needs: MCU on canvas'),
  },
  {
    id: 'DECO_DISPLAY',
    label: 'Deco Display',
    description: 'Dedicated deco HUD reachable from MCU',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'DECO_HUD'),
    missingHint: (m, _w) =>
      hasMcu(m) ? 'needs: Deco HUD in NeoPixel chain' : 'needs: MCU on canvas',
  },
  {
    id: 'PPO2_DISPLAY_FEAT',
    label: 'ppO₂ Display',
    description: 'Dedicated ppO₂ readout display',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'PPO2_DISPLAY'),
    missingHint: (m, _w) =>
      hasMcu(m) ? 'needs: ppO₂ Display wired to MCU' : 'needs: MCU on canvas',
  },
  {
    id: 'GENERAL_SCREEN_FEAT',
    label: 'General Display',
    description: 'Multi-purpose information display',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'GENERAL_SCREEN'),
    missingHint: (m, _w) =>
      hasMcu(m) ? 'needs: General Screen wired to MCU' : 'needs: MCU on canvas',
  },
  {
    id: 'DATA_LOGGING',
    label: 'Data Logging',
    description: 'Record dive data to non-volatile flash memory',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'FLASH_MEMORY'),
    missingHint: (m, _w) =>
      hasMcu(m) ? 'needs: Flash Memory wired to MCU' : 'needs: MCU on canvas',
  },
  {
    id: 'BUTTON_CONTROL',
    label: 'Button Input',
    description: 'User interface through physical buttons',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'BUTTONS'),
    missingHint: (m, _w) => (hasMcu(m) ? 'needs: Buttons wired to MCU' : 'needs: MCU on canvas'),
  },
  {
    id: 'ENCODER_CONTROL',
    label: 'Rotary Encoder Input',
    description: 'User interface through rotary encoder',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'ROTARY_ENCODER'),
    missingHint: (m, _w) =>
      hasMcu(m) ? 'needs: Rotary Encoder wired to MCU' : 'needs: MCU on canvas',
  },
  {
    id: 'AUDIBLE_ALERTS',
    label: 'Audible Alerts',
    description: 'Audio alarms for critical events',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'BUZZER'),
    missingHint: (m, _w) => (hasMcu(m) ? 'needs: Buzzer wired to MCU' : 'needs: MCU on canvas'),
  },
  {
    id: 'BATT_VOLTAGE',
    label: 'Battery Voltage Monitoring',
    description: 'Monitor battery voltage via GPIO analog input',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'BATT_VOLTAGE_SENSOR'),
    missingHint: (m, _w) =>
      hasMcu(m) ? 'needs: Battery Voltage Sensor wired to MCU' : 'needs: MCU on canvas',
  },
  {
    id: 'BATT_MGMT',
    label: 'Battery Management',
    description: 'Full battery management (charge control, state of charge)',
    check: (m, w) => hasMcu(m) && connectedAny(m, w, 'BATT_MANAGEMENT'),
    missingHint: (m, _w) =>
      hasMcu(m) ? 'needs: Battery Management wired to MCU' : 'needs: MCU on canvas',
  },
];
