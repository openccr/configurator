// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { useState, useCallback } from 'react';

export interface WireDragState {
  active: boolean;
  sourceModuleId: string | null;
  sourcePortId: string | null;
  sourcePos: { x: number; y: number } | null;
  /** true = source port is on the right side of its card */
  sourceRightSide: boolean;
  cursorPos: { x: number; y: number } | null;
}

const IDLE: WireDragState = {
  active: false,
  sourceModuleId: null,
  sourcePortId: null,
  sourcePos: null,
  sourceRightSide: false,
  cursorPos: null,
};

export function useWireDrag() {
  const [dragState, setDragState] = useState<WireDragState>(IDLE);

  const startDrag = useCallback(
    (moduleId: string, portId: string, pos: { x: number; y: number }, rightSide: boolean) => {
      setDragState({
        active: true,
        sourceModuleId: moduleId,
        sourcePortId: portId,
        sourcePos: pos,
        sourceRightSide: rightSide,
        cursorPos: pos,
      });
    },
    []
  );

  const updateCursor = useCallback((pos: { x: number; y: number }) => {
    setDragState((prev) => (prev.active ? { ...prev, cursorPos: pos } : prev));
  }, []);

  const cancelDrag = useCallback(() => {
    setDragState(IDLE);
  }, []);

  return { dragState, startDrag, updateCursor, cancelDrag };
}
