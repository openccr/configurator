// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { PlacedModule, PortDef, BusType, DEFAULT_MCU_BUS_SLOTS } from '../types';

// ── Layout constants ──────────────────────────────────────────────────────────

export const MCU_WIDTH = 200;
export const PERIPH_WIDTH = 160;
export const CARD_HEADER_HEIGHT = 40;
export const PORT_ROW_HEIGHT = 24;
export const GPIO_BLOCK_HEIGHT = 48;
export const PORT_RADIUS = 6;
export const BEZIER_OFFSET = 80;

/** Buses that can be expanded by the user with the + button */
export const EXPANDABLE_BUSES = ['I2C', 'SPI', 'UART', 'NEOPIXEL'] as const;
export type ExpandableBus = (typeof EXPANDABLE_BUSES)[number];

// ── MCU port generation ───────────────────────────────────────────────────────

/** Generate PortDef list for the MCU based on current bus slot counts */
export function getMcuPorts(busSlots: Record<string, number>): PortDef[] {
  const ports: PortDef[] = [];

  // GPIO pool — always first, special rendering
  ports.push({
    id: 'GPIO',
    label: 'GPIO (pool)',
    busType: 'GPIO',
    direction: 'bidir',
    multiDrop: true,
    rightSide: true,
  });

  // ModBus — fixed single slot, on LEFT side of MCU card
  ports.push({
    id: 'MODBUS',
    label: 'ModBus',
    busType: 'MODBUS',
    direction: 'bidir',
    multiDrop: true,
    rightSide: false,
  });

  // Expandable buses
  for (const bus of EXPANDABLE_BUSES) {
    const count = busSlots[bus] ?? 1;
    for (let i = 1; i <= count; i++) {
      const showNumber = count > 1;
      ports.push({
        id: `${bus}-${i}`,
        label: showNumber ? `${bus}-${i}` : bus,
        busType: bus as BusType,
        direction: 'bidir',
        multiDrop: bus === 'I2C',
        rightSide: true,
      });
    }
  }

  return ports;
}

/** Resolve a dynamic MCU port ID (e.g. "I2C-1", "GPIO") to a PortDef */
export function getMcuPortById(portId: string): PortDef | null {
  if (portId === 'GPIO') {
    return {
      id: 'GPIO',
      label: 'GPIO (pool)',
      busType: 'GPIO',
      direction: 'bidir',
      multiDrop: true,
      rightSide: true,
    };
  }
  if (portId === 'MODBUS') {
    return {
      id: 'MODBUS',
      label: 'ModBus',
      busType: 'MODBUS',
      direction: 'bidir',
      multiDrop: true,
      rightSide: false,
    };
  }
  const match = portId.match(/^(I2C|SPI|UART|NEOPIXEL)-(\d+)$/);
  if (!match) return null;
  const busType = match[1] as BusType;
  return {
    id: portId,
    label: portId,
    busType,
    direction: 'bidir',
    multiDrop: busType === 'I2C',
    rightSide: true,
  };
}

// ── MCU layout helpers ────────────────────────────────────────────────────────

/** Total card height for MCU based on current slots */
export function getMcuCardHeight(busSlots: Record<string, number>): number {
  const busRows = EXPANDABLE_BUSES.reduce((s, b) => s + (busSlots[b] ?? 1), 0);
  return CARD_HEADER_HEIGHT + GPIO_BLOCK_HEIGHT + PORT_ROW_HEIGHT + busRows * PORT_ROW_HEIGHT;
}

/**
 * Y-coordinate (canvas-absolute) of the center of a named MCU port.
 * Returns the center y of the port dot.
 */
export function getMcuPortY(module: PlacedModule, portId: string): number {
  const slots = module.mcuBusSlots ?? DEFAULT_MCU_BUS_SLOTS;
  let y = module.y + CARD_HEADER_HEIGHT;

  // GPIO block
  if (portId === 'GPIO') return y + GPIO_BLOCK_HEIGHT / 2;
  y += GPIO_BLOCK_HEIGHT;

  // MODBUS row
  if (portId === 'MODBUS') return y + PORT_ROW_HEIGHT / 2;
  y += PORT_ROW_HEIGHT;

  // Expandable buses in order
  for (const bus of EXPANDABLE_BUSES) {
    const count = slots[bus] ?? 1;
    for (let i = 1; i <= count; i++) {
      if (portId === `${bus}-${i}`) return y + PORT_ROW_HEIGHT / 2;
      y += PORT_ROW_HEIGHT;
    }
  }

  return y;
}

// ── Port canvas position ──────────────────────────────────────────────────────

/**
 * Canvas-coordinate center of a port dot.
 * Works for both MCU (dynamic) and peripheral (static) modules.
 */
export function getPortCanvasPosById(
  module: PlacedModule,
  portId: string,
  portIndex: number,
  port: PortDef
): { x: number; y: number } {
  const isMcu = module.type === 'MCU';

  if (isMcu) {
    const portDef = getMcuPortById(portId);
    const x = portDef && portDef.rightSide === false ? module.x : module.x + MCU_WIDTH;
    return { x, y: getMcuPortY(module, portId) };
  }

  // Peripheral: left or right edge depending on port.rightSide
  const x = port.rightSide ? module.x + PERIPH_WIDTH : module.x;
  const y = module.y + CARD_HEADER_HEIGHT + portIndex * PORT_ROW_HEIGHT + PORT_ROW_HEIGHT / 2;
  return { x, y };
}

// ── Bezier wire path ──────────────────────────────────────────────────────────

/**
 * SVG cubic bezier string for a wire.
 * rightSide=true means the port faces right (MCU ports, NP_OUT).
 * rightSide=false means the port faces left (most peripheral ports).
 */
export function bezierPath(
  from: { x: number; y: number; rightSide: boolean },
  to: { x: number; y: number; rightSide: boolean }
): string {
  const cp1x = from.x + (from.rightSide ? BEZIER_OFFSET : -BEZIER_OFFSET);
  const cp2x = to.x + (to.rightSide ? BEZIER_OFFSET : -BEZIER_OFFSET);
  return `M ${from.x},${from.y} C ${cp1x},${from.y} ${cp2x},${to.y} ${to.x},${to.y}`;
}

/** Extract the bus type from an MCU dynamic port ID */
export function mcuPortBusType(portId: string): BusType {
  if (portId === 'GPIO') return 'GPIO';
  if (portId === 'MODBUS') return 'MODBUS';
  const bus = portId.split('-')[0];
  return bus as BusType;
}
