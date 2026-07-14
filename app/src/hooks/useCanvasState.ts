// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import useStorage from '../storage/useStorage';
import { CanvasState, ModuleType, Wire, DEFAULT_MCU_BUS_SLOTS } from '../types';

const DEFAULT_STATE: CanvasState = { modules: [], wires: [] };

export function useCanvasState() {
  const [state, setState] = useStorage<CanvasState>('canvas', DEFAULT_STATE);

  const addModule = useCallback(
    (type: ModuleType, x: number, y: number) => {
      setState((prev) => ({
        ...prev,
        modules: [
          ...prev.modules,
          {
            id: nanoid(),
            type,
            x,
            y,
            ...(type === 'MCU' ? { mcuBusSlots: { ...DEFAULT_MCU_BUS_SLOTS } } : {}),
          },
        ],
      }));
    },
    [setState]
  );

  const moveModule = useCallback(
    (id: string, x: number, y: number) => {
      setState((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => (m.id === id ? { ...m, x, y } : m)),
      }));
    },
    [setState]
  );

  const removeModule = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        modules: prev.modules.filter((m) => m.id !== id),
        wires: prev.wires.filter((w) => w.fromModuleId !== id && w.toModuleId !== id),
      }));
    },
    [setState]
  );

  const addWire = useCallback(
    (wire: Omit<Wire, 'id'>) => {
      setState((prev) => ({
        ...prev,
        wires: [...prev.wires, { ...wire, id: nanoid() }],
      }));
    },
    [setState]
  );

  const removeWire = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        wires: prev.wires.filter((w) => w.id !== id),
      }));
    },
    [setState]
  );

  /** Remove the last slot of a dynamic MCU bus (only if it has no wire) */
  const removeMcuBusSlot = useCallback(
    (moduleId: string, busType: string) => {
      setState((prev) => {
        const mcuMod = prev.modules.find((m) => m.id === moduleId && m.type === 'MCU');
        if (!mcuMod) return prev;
        const slots = mcuMod.mcuBusSlots ?? { ...DEFAULT_MCU_BUS_SLOTS };
        const currentCount = slots[busType] ?? 1;
        if (currentCount <= 1) return prev;
        const newCount = currentCount - 1;
        const removedPortId = `${busType}-${currentCount}`;
        return {
          ...prev,
          modules: prev.modules.map((m) =>
            m.id !== moduleId ? m : { ...m, mcuBusSlots: { ...slots, [busType]: newCount } }
          ),
          wires: prev.wires.filter(
            (w) =>
              !(
                (w.fromModuleId === moduleId && w.fromPortId === removedPortId) ||
                (w.toModuleId === moduleId && w.toPortId === removedPortId)
              )
          ),
        };
      });
    },
    [setState]
  );

  /** Expand a dynamic MCU bus by one slot (I2C, SPI, UART, NEOPIXEL) */
  const addMcuBusSlot = useCallback(
    (moduleId: string, busType: string) => {
      setState((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => {
          if (m.id !== moduleId || m.type !== 'MCU') return m;
          const slots = m.mcuBusSlots ?? { ...DEFAULT_MCU_BUS_SLOTS };
          return { ...m, mcuBusSlots: { ...slots, [busType]: (slots[busType] ?? 1) + 1 } };
        }),
      }));
    },
    [setState]
  );

  const importState = useCallback(
    (newState: CanvasState) => {
      setState(newState);
    },
    [setState]
  );

  return {
    state,
    addModule,
    moveModule,
    removeModule,
    addWire,
    removeWire,
    addMcuBusSlot,
    removeMcuBusSlot,
    importState,
  };
}
