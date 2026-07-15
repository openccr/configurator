// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { PlacedModule, ModuleDefinition, Wire, PortDef, DEFAULT_MCU_BUS_SLOTS } from '../../types';
import { MODULE_DEFINITIONS } from '../../data/moduleDefinitions';
import { WireDragState } from '../../hooks/useWireDrag';
import {
  getPortCanvasPosById,
  getMcuPorts,
  getMcuPortY,
  getMcuCardHeight,
  EXPANDABLE_BUSES,
  MCU_WIDTH,
  PERIPH_WIDTH,
} from '../../canvas/portUtils';
import { getMcuPortById } from '../../canvas/portUtils';
import Port from './Port';
import styles from './ModuleNode.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ModuleNodeProps {
  module: PlacedModule;
  def: ModuleDefinition;
  modules: PlacedModule[];
  wires: Wire[];
  dragState: WireDragState;
  onStartDrag: (
    moduleId: string,
    portId: string,
    pos: { x: number; y: number },
    rightSide: boolean
  ) => void;
  onRemove: (id: string) => void;
  onAddMcuBusSlot: (moduleId: string, busType: string) => void;
  onRemoveMcuBusSlot: (moduleId: string, busType: string) => void;
}

const COLOR_CLASS: Record<ModuleDefinition['colorGroup'], string> = {
  core: styles.colorCore,
  sensor: styles.colorSensor,
  actuator: styles.colorActuator,
  display: styles.colorDisplay,
  storage: styles.colorStorage,
  control: styles.colorControl,
};

// ── Compatibility helper (shared by MCU and peripheral) ───────────────────────

function portHasWire(wires: Wire[], moduleId: string, portId: string): boolean {
  return wires.some(
    (w) =>
      (w.fromModuleId === moduleId && w.fromPortId === portId) ||
      (w.toModuleId === moduleId && w.toPortId === portId)
  );
}

function isPortOccupied(
  portId: string,
  moduleId: string,
  multiDrop: boolean,
  wires: Wire[]
): boolean {
  if (multiDrop) return false;
  return portHasWire(wires, moduleId, portId);
}

function isCompatibleTarget(
  port: PortDef,
  module: PlacedModule,
  modules: PlacedModule[],
  wires: Wire[],
  dragState: WireDragState
): boolean {
  if (!dragState.active || !dragState.sourceModuleId || !dragState.sourcePortId) return false;
  if (dragState.sourceModuleId === module.id) return false;

  const srcModule = modules.find((m) => m.id === dragState.sourceModuleId);
  if (!srcModule) return false;

  const srcIsMcu = srcModule.type === 'MCU';
  const thisIsMcu = module.type === 'MCU';

  // Get source port def
  const srcPort = srcIsMcu
    ? getMcuPortById(dragState.sourcePortId)
    : MODULE_DEFINITIONS[srcModule.type].ports.find((p) => p.id === dragState.sourcePortId);
  if (!srcPort) return false;

  // Bus types must match
  if (srcPort.busType !== port.busType) return false;

  // ── Peripheral-to-peripheral directional buses (NeoPixel chain / cell → reader) ──
  const isP2PBus = port.busType === 'NEOPIXEL' || port.busType === 'ADC' || port.busType === 'SOLENOID';
  if (isP2PBus && !srcIsMcu && !thisIsMcu) {
    return (
      (srcPort.direction === 'out' && port.direction === 'in') ||
      (srcPort.direction === 'in' && port.direction === 'out')
    );
  }

  // ── Standard: must be MCU ↔ peripheral ──
  if (srcIsMcu === thisIsMcu) return false;

  // Check MCU port occupancy
  const mcuMod = thisIsMcu ? module : srcModule;
  const mcuPortId = thisIsMcu ? port.id : dragState.sourcePortId;
  const mcuPort = thisIsMcu ? port : srcPort;
  if (isPortOccupied(mcuPortId, mcuMod.id, mcuPort.multiDrop, wires)) return false;

  // Check peripheral port occupancy
  const periphMod = thisIsMcu ? srcModule : module;
  const periphPortId = thisIsMcu ? dragState.sourcePortId : port.id;
  const periphPort = thisIsMcu ? srcPort : port;
  if (isPortOccupied(periphPortId, periphMod.id, periphPort.multiDrop, wires)) return false;

  return true;
}

// ── MCU Node ──────────────────────────────────────────────────────────────────

function McuNode({
  module,
  modules,
  wires,
  dragState,
  onStartDrag,
  onRemove,
  onAddMcuBusSlot,
  onRemoveMcuBusSlot,
  def,
}: ModuleNodeProps) {
  const slots = module.mcuBusSlots ?? DEFAULT_MCU_BUS_SLOTS;
  const allPorts = getMcuPorts(slots);
  const cardHeight = getMcuCardHeight(slots);

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('moduleId', module.id);
    e.dataTransfer.setData('dragClientX', String(e.clientX));
    e.dataTransfer.setData('dragClientY', String(e.clientY));
  }

  function makePortProps(portDef: PortDef) {
    const canvasPos = {
      x: portDef.rightSide !== false ? module.x + MCU_WIDTH : module.x,
      y: getMcuPortY(module, portDef.id),
    };
    return {
      port: portDef,
      moduleId: module.id,
      canvasPos,
      isOccupied: isPortOccupied(portDef.id, module.id, portDef.multiDrop, wires),
      isCompatibleTarget: isCompatibleTarget(portDef, module, modules, wires, dragState),
      dragState,
      onStartDrag,
    };
  }

  // GPIO pool port
  const gpioPort = allPorts.find((p) => p.id === 'GPIO')!;
  const modbusPort = allPorts.find((p) => p.id === 'MODBUS')!;

  // Explicit GPIO wires to the MCU pool port
  const explicitGpio = wires.filter(
    (w) =>
      (w.fromModuleId === module.id && w.fromPortId === 'GPIO') ||
      (w.toModuleId === module.id && w.toPortId === 'GPIO')
  ).length;

  // Implicit GPIO pins from peripherals reachable from this MCU
  function isReachable(targetId: string): boolean {
    const visited = new Set<string>();
    const queue = [module.id];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      if (id === targetId) return true;
      for (const w of wires) {
        if (w.fromModuleId === id && !visited.has(w.toModuleId)) queue.push(w.toModuleId);
        if (w.toModuleId === id && !visited.has(w.fromModuleId)) queue.push(w.fromModuleId);
      }
    }
    return false;
  }

  const implicitGpio = modules
    .filter((m) => m.id !== module.id && isReachable(m.id))
    .reduce((sum, m) => {
      const def = MODULE_DEFINITIONS[m.type];
      if (!def) return sum;
      return sum + def.ports.filter((p) => p.implicit === true).length;
    }, 0);

  const gpioConnected = explicitGpio + implicitGpio;
  const gpioPortWithCount = { ...gpioPort, label: `GPIO (${gpioConnected})` };

  return (
    <div
      className={`${styles.card} ${styles.cardMcu} ${COLOR_CLASS[def.colorGroup]}`}
      style={{ left: module.x, top: module.y, width: MCU_WIDTH, height: cardHeight }}
    >
      {/* Header */}
      <div className={styles.header} draggable onDragStart={handleDragStart}>
        <span className={styles.label} title={def.description}>
          {def.label}
        </span>
        <button className={styles.removeBtn} onClick={() => onRemove(module.id)} title="Remove">
          ×
        </button>
      </div>

      {/* GPIO pool block */}
      <div className={styles.gpioBlock}>
        <span className={styles.gpioLabel}>GPIOs</span>
        <Port {...makePortProps(gpioPortWithCount)} />
      </div>

      {/* ModBus row */}
      <Port {...makePortProps(modbusPort)} />

      {/* Expandable buses */}
      {EXPANDABLE_BUSES.map((bus) => {
        const count = slots[bus] ?? 1;
        return Array.from({ length: count }, (_, i) => {
          const portId = `${bus}-${i + 1}`;
          const portDef = allPorts.find((p) => p.id === portId);
          if (!portDef) return null;
          const isLast = i === count - 1;
          const hasConn = portHasWire(wires, module.id, portId);
          const showPlus = isLast && hasConn;
          const showMinus = isLast && !hasConn && count > 1;

          return (
            <div key={portId} className={styles.busRow}>
              {showPlus && (
                <button
                  className={styles.addBtn}
                  title={`Add ${bus} bus`}
                  onClick={() => onAddMcuBusSlot(module.id, bus)}
                >
                  +
                </button>
              )}
              {showMinus && (
                <button
                  className={styles.removeSlotBtn}
                  title={`Remove ${bus} bus`}
                  onClick={() => onRemoveMcuBusSlot(module.id, bus)}
                >
                  −
                </button>
              )}
              <Port {...makePortProps(portDef)} />
            </div>
          );
        });
      })}
    </div>
  );
}

// ── Peripheral Node ───────────────────────────────────────────────────────────

function PeripheralNode({
  module,
  def,
  modules,
  wires,
  dragState,
  onStartDrag,
  onRemove,
}: Omit<ModuleNodeProps, 'onAddMcuBusSlot' | 'onRemoveMcuBusSlot'>) {
  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('moduleId', module.id);
    e.dataTransfer.setData('dragClientX', String(e.clientX));
    e.dataTransfer.setData('dragClientY', String(e.clientY));
  }

  return (
    <div
      className={`${styles.card} ${COLOR_CLASS[def.colorGroup]}`}
      style={{ left: module.x, top: module.y, width: PERIPH_WIDTH }}
    >
      <div className={styles.header} draggable onDragStart={handleDragStart}>
        <span className={styles.label} title={def.description}>
          {def.label}
        </span>
        <button className={styles.removeBtn} onClick={() => onRemove(module.id)} title="Remove">
          ×
        </button>
      </div>
      <div className={styles.ports}>
        {def.ports
          .filter((p) => !p.implicit)
          .map((port, index) => {
            const canvasPos = getPortCanvasPosById(module, port.id, index, port);
            return (
              <Port
                key={port.id}
                port={port}
                moduleId={module.id}
                canvasPos={canvasPos}
                isOccupied={isPortOccupied(port.id, module.id, port.multiDrop, wires)}
                isCompatibleTarget={isCompatibleTarget(port, module, modules, wires, dragState)}
                dragState={dragState}
                onStartDrag={onStartDrag}
              />
            );
          })}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ModuleNode(props: ModuleNodeProps) {
  if (props.module.type === 'MCU') {
    return <McuNode {...props} />;
  }
  return <PeripheralNode {...props} />;
}
