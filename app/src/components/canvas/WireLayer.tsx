// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { PlacedModule, Wire, BusType } from '../../types';
import { MODULE_DEFINITIONS } from '../../data/moduleDefinitions';
import { WireDragState } from '../../hooks/useWireDrag';
import {
  getMcuPortY,
  getMcuPortById,
  getPortCanvasPosById,
  bezierPath,
  MCU_WIDTH,
  CARD_HEADER_HEIGHT,
  PORT_ROW_HEIGHT,
  mcuPortBusType,
} from '../../canvas/portUtils';
import styles from './WireLayer.module.css';

const WIRE_BUS_CLASS: Record<BusType, string> = {
  I2C: styles.wireI2c,
  SPI: styles.wireSpi,
  UART: styles.wireUart,
  GPIO: styles.wireGpio,
  NEOPIXEL: styles.wireNeopixel,
  MODBUS: styles.wireModbus,
  ADC: styles.wireAdc,
};

/** px left of device's left edge where the I2C vertical tap drops */
const TAP_OFFSET = 16;

interface WireLayerProps {
  modules: PlacedModule[];
  wires: Wire[];
  dragState: WireDragState;
  onRemoveWire: (id: string) => void;
}

interface WirePath {
  d: string;
  busType: BusType;
}

// ── Bezier wire resolution ────────────────────────────────────────────────────

function resolveWirePath(wire: Wire, modules: PlacedModule[]): WirePath | null {
  const fromMod = modules.find((m) => m.id === wire.fromModuleId);
  const toMod = modules.find((m) => m.id === wire.toModuleId);
  if (!fromMod || !toMod) return null;

  const fromIsMcu = fromMod.type === 'MCU';
  const toIsMcu = toMod.type === 'MCU';

  let fromPos: { x: number; y: number; rightSide: boolean };
  let busType: BusType;

  if (fromIsMcu) {
    const portDef = getMcuPortById(wire.fromPortId);
    if (!portDef) return null;
    const rs = portDef.rightSide !== false;
    fromPos = {
      x: rs ? fromMod.x + MCU_WIDTH : fromMod.x,
      y: getMcuPortY(fromMod, wire.fromPortId),
      rightSide: rs,
    };
    busType = mcuPortBusType(wire.fromPortId);
  } else {
    const fromDef = MODULE_DEFINITIONS[fromMod.type];
    const visibleFromPorts = fromDef.ports.filter((p) => !p.implicit);
    const fromPortIdx = visibleFromPorts.findIndex((p) => p.id === wire.fromPortId);
    if (fromPortIdx === -1) return null;
    const fromPort = visibleFromPorts[fromPortIdx];
    fromPos = {
      ...getPortCanvasPosById(fromMod, wire.fromPortId, fromPortIdx, fromPort),
      rightSide: fromPort.rightSide ?? false,
    };
    busType = fromPort.busType;
  }

  let toPos: { x: number; y: number; rightSide: boolean };

  if (toIsMcu) {
    const portDef = getMcuPortById(wire.toPortId);
    if (!portDef) return null;
    const rs = portDef.rightSide !== false;
    toPos = {
      x: rs ? toMod.x + MCU_WIDTH : toMod.x,
      y: getMcuPortY(toMod, wire.toPortId),
      rightSide: rs,
    };
  } else {
    const toDef = MODULE_DEFINITIONS[toMod.type];
    const visibleToPorts = toDef.ports.filter((p) => !p.implicit);
    const toPortIdx = visibleToPorts.findIndex((p) => p.id === wire.toPortId);
    if (toPortIdx === -1) return null;
    const toPort = visibleToPorts[toPortIdx];
    toPos = {
      ...getPortCanvasPosById(toMod, wire.toPortId, toPortIdx, toPort),
      rightSide: toPort.rightSide ?? false,
    };
  }

  return { d: bezierPath(fromPos, toPos), busType };
}

// ── I2C bus topology ──────────────────────────────────────────────────────────

interface I2cGroup {
  mcuMod: PlacedModule;
  mcuPortId: string;
  items: Array<{ wire: Wire; periphMod: PlacedModule; periphPortId: string }>;
}

function collectI2cGroups(wires: Wire[], modules: PlacedModule[]): I2cGroup[] {
  const map = new Map<string, I2cGroup>();

  for (const wire of wires) {
    const fromMod = modules.find((m) => m.id === wire.fromModuleId);
    const toMod = modules.find((m) => m.id === wire.toModuleId);
    if (!fromMod || !toMod) continue;

    const fromIsMcu = fromMod.type === 'MCU';
    const toIsMcu = toMod.type === 'MCU';
    if (!fromIsMcu && !toIsMcu) continue; // skip peripheral-to-peripheral

    const mcuMod = fromIsMcu ? fromMod : toMod;
    const mcuPortId = fromIsMcu ? wire.fromPortId : wire.toPortId;
    const periphMod = fromIsMcu ? toMod : fromMod;
    const periphPortId = fromIsMcu ? wire.toPortId : wire.fromPortId;

    const portDef = getMcuPortById(mcuPortId);
    if (!portDef || portDef.busType !== 'I2C') continue;

    const key = `${mcuMod.id}:${mcuPortId}`;
    if (!map.has(key)) {
      map.set(key, { mcuMod, mcuPortId, items: [] });
    }
    map.get(key)!.items.push({ wire, periphMod, periphPortId });
  }

  return Array.from(map.values());
}

function I2cBus({ group, onRemoveWire }: { group: I2cGroup; onRemoveWire: (id: string) => void }) {
  const mcuPortX = group.mcuMod.x + MCU_WIDTH; // I2C always on right side of MCU
  const mcuPortY = getMcuPortY(group.mcuMod, group.mcuPortId);

  const deviceData = group.items.map(({ wire, periphMod, periphPortId }) => {
    const def = MODULE_DEFINITIONS[periphMod.type];
    const visiblePorts = def.ports.filter((p) => !p.implicit);
    const portIdx = visiblePorts.findIndex((p) => p.id === periphPortId);
    const port = visiblePorts[portIdx];
    const portPos = getPortCanvasPosById(periphMod, periphPortId, portIdx, port);
    const tapX = periphMod.x - TAP_OFFSET;
    return { wire, portPos, tapX };
  });

  if (deviceData.length === 0) return null;

  const tapXs = deviceData.map((d) => d.tapX);
  const backboneX1 = Math.min(mcuPortX, ...tapXs);
  const backboneX2 = Math.max(mcuPortX, ...tapXs);

  return (
    <>
      {/* Horizontal backbone at MCU port Y */}
      <path
        className={`${styles.wire} ${styles.wireI2c}`}
        d={`M ${backboneX1},${mcuPortY} L ${backboneX2},${mcuPortY}`}
        style={{ pointerEvents: 'none' }}
      />
      {/* Per-device L-shaped tap: drop from backbone → device port */}
      {deviceData.map(({ wire, portPos, tapX }) => (
        <path
          key={wire.id}
          className={`${styles.wire} ${styles.wireI2c}`}
          d={`M ${tapX},${mcuPortY} L ${tapX},${portPos.y} L ${portPos.x},${portPos.y}`}
          style={{ pointerEvents: 'stroke' }}
          onClick={() => onRemoveWire(wire.id)}
        />
      ))}
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WireLayer({ modules, wires, dragState, onRemoveWire }: WireLayerProps) {
  const i2cGroups = collectI2cGroups(wires, modules);
  const i2cWireIds = new Set(i2cGroups.flatMap((g) => g.items.map((it) => it.wire.id)));

  const ghostPath =
    dragState.active && dragState.sourcePos && dragState.cursorPos
      ? bezierPath(
          { ...dragState.sourcePos, rightSide: dragState.sourceRightSide },
          { ...dragState.cursorPos, rightSide: false }
        )
      : null;

  return (
    <svg className={styles.svg}>
      {/* Non-I2C wires (bezier) */}
      {wires
        .filter((w) => !i2cWireIds.has(w.id))
        .map((wire) => {
          const result = resolveWirePath(wire, modules);
          if (!result) return null;
          return (
            <path
              key={wire.id}
              className={`${styles.wire} ${WIRE_BUS_CLASS[result.busType]}`}
              d={result.d}
              style={{ pointerEvents: 'stroke' }}
              onClick={() => onRemoveWire(wire.id)}
            />
          );
        })}
      {/* I2C bus topology (backbone + taps) */}
      {i2cGroups.map((g) => (
        <I2cBus key={`${g.mcuMod.id}:${g.mcuPortId}`} group={g} onRemoveWire={onRemoveWire} />
      ))}
      {ghostPath && <path className={styles.ghost} d={ghostPath} />}
    </svg>
  );
}

// Export for use in ModuleNode height calculation
export { CARD_HEADER_HEIGHT, PORT_ROW_HEIGHT };
