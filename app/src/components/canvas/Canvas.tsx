// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { useRef, useState, useEffect } from 'react';
import { CanvasState, ModuleType, Wire } from '../../types';
import { MODULE_DEFINITIONS } from '../../data/moduleDefinitions';
import { WireDragState } from '../../hooks/useWireDrag';
import { getMcuPortById } from '../../canvas/portUtils';
import ModuleNode from './ModuleNode';
import WireLayer from './WireLayer';
import ModuleToolbar from '../toolbar/ModuleToolbar';
import styles from './Canvas.module.css';

const MIN_SCALE = 0.25;
const MAX_SCALE = 2.0;
const SNAP_GRID = 40;

function snap(v: number): number {
  return Math.round(v / SNAP_GRID) * SNAP_GRID;
}

interface CanvasProps {
  state: CanvasState;
  dragState: WireDragState;
  onAddModule: (type: ModuleType, x: number, y: number) => void;
  onMoveModule: (id: string, x: number, y: number) => void;
  onRemoveModule: (id: string) => void;
  onAddWire: (wire: Omit<Wire, 'id'>) => void;
  onRemoveWire: (id: string) => void;
  onStartDrag: (
    moduleId: string,
    portId: string,
    pos: { x: number; y: number },
    rightSide: boolean
  ) => void;
  onUpdateCursor: (pos: { x: number; y: number }) => void;
  onCancelDrag: () => void;
  onAddMcuBusSlot: (moduleId: string, busType: string) => void;
  onRemoveMcuBusSlot: (moduleId: string, busType: string) => void;
}

export default function Canvas({
  state,
  dragState,
  onAddModule,
  onMoveModule,
  onRemoveModule,
  onAddWire,
  onRemoveWire,
  onStartDrag,
  onUpdateCursor,
  onCancelDrag,
  onAddMcuBusSlot,
  onRemoveMcuBusSlot,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [toolbarPos, setToolbarPos] = useState({ x: 20, y: 20 });

  // ── Pan / Zoom transform ──────────────────────────────────────────────────
  // transformRef holds current values for use in event handlers (avoids stale closures).
  const transformRef = useRef({ scale: 1, tx: 0, ty: 0 });
  const [transform, setTransformState] = useState(transformRef.current);

  function applyTransform(
    updater: (t: { scale: number; tx: number; ty: number }) => {
      scale: number;
      tx: number;
      ty: number;
    }
  ) {
    const next = updater(transformRef.current);
    transformRef.current = next;
    setTransformState(next);
  }

  const { scale, tx, ty } = transform;

  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ clientX: 0, clientY: 0, tx: 0, ty: 0 });

  // Non-passive wheel listener so we can call e.preventDefault()
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = el!.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      applyTransform((prev) => {
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * factor));
        const f = newScale / prev.scale;
        const ox = e.clientX - rect.left;
        const oy = e.clientY - rect.top;
        return {
          scale: newScale,
          tx: ox - f * (ox - prev.tx),
          ty: oy - f * (oy - prev.ty),
        };
      });
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 2) return;
    e.preventDefault();
    panStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      tx: transformRef.current.tx,
      ty: transformRef.current.ty,
    };
    setIsPanning(true);

    function onMove(ev: MouseEvent) {
      applyTransform((prev) => ({
        ...prev,
        tx: panStartRef.current.tx + ev.clientX - panStartRef.current.clientX,
        ty: panStartRef.current.ty + ev.clientY - panStartRef.current.clientY,
      }));
    }

    function onUp() {
      setIsPanning(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
  }

  // ── Coordinate helpers ────────────────────────────────────────────────────

  /** Convert screen client coords → world (canvas) coords */
  function getCanvasPos(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const { tx: ctx, ty: cty, scale: cs } = transformRef.current;
    return {
      x: (clientX - rect.left - ctx) / cs,
      y: (clientY - rect.top - cty) / cs,
    };
  }

  // ── Module drag (HTML5 DnD) ───────────────────────────────────────────────

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const moduleId = e.dataTransfer.getData('moduleId');
    const moduleType = e.dataTransfer.getData('moduleType') as ModuleType;

    if (moduleId) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const { tx: ctx, ty: cty, scale: cs } = transformRef.current;

      // Drag start: raw screen coords stored by ModuleNode
      const dragCX = parseInt(e.dataTransfer.getData('dragClientX') || '0', 10);
      const dragCY = parseInt(e.dataTransfer.getData('dragClientY') || '0', 10);

      // Pickup point in world space
      const pickupX = (dragCX - rect.left - ctx) / cs;
      const pickupY = (dragCY - rect.top - cty) / cs;

      // Offset from module's top-left corner to pickup point (world space)
      const srcModule = state.modules.find((m) => m.id === moduleId);
      if (!srcModule) return;
      const offsetX = pickupX - srcModule.x;
      const offsetY = pickupY - srcModule.y;

      // Drop point in world space
      const dropX = (e.clientX - rect.left - ctx) / cs;
      const dropY = (e.clientY - rect.top - cty) / cs;

      onMoveModule(moduleId, snap(dropX - offsetX), snap(dropY - offsetY));
    } else if (moduleType && MODULE_DEFINITIONS[moduleType]) {
      const pos = getCanvasPos(e.clientX, e.clientY);
      onAddModule(moduleType, snap(pos.x - 80), snap(pos.y - 20));
    }
  }

  // ── Wire drag (pointer events) ────────────────────────────────────────────

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.active) return;
    onUpdateCursor(getCanvasPos(e.clientX, e.clientY));
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button === 2) return; // right-button handled by pan
    if (!dragState.active || !dragState.sourceModuleId || !dragState.sourcePortId) {
      onCancelDrag();
      return;
    }

    const els = document.elementsFromPoint(e.clientX, e.clientY);
    const portEl = els.find((el) => (el as HTMLElement).dataset?.portId) as HTMLElement | undefined;

    if (portEl) {
      const targetModuleId = portEl.dataset.moduleId;
      const targetPortId = portEl.dataset.portId;

      if (targetModuleId && targetPortId && targetModuleId !== dragState.sourceModuleId) {
        tryCreateWire(targetModuleId, targetPortId);
      }
    }

    onCancelDrag();
  }

  function tryCreateWire(targetModuleId: string, targetPortId: string) {
    const srcModule = state.modules.find((m) => m.id === dragState.sourceModuleId);
    const tgtModule = state.modules.find((m) => m.id === targetModuleId);
    if (!srcModule || !tgtModule) return;

    const srcIsMcu = srcModule.type === 'MCU';
    const tgtIsMcu = tgtModule.type === 'MCU';

    const srcPort = srcIsMcu
      ? getMcuPortById(dragState.sourcePortId!)
      : MODULE_DEFINITIONS[srcModule.type].ports.find((p) => p.id === dragState.sourcePortId);
    const tgtPort = tgtIsMcu
      ? getMcuPortById(targetPortId)
      : MODULE_DEFINITIONS[tgtModule.type].ports.find((p) => p.id === targetPortId);

    if (!srcPort || !tgtPort) return;
    if (srcPort.implicit || tgtPort.implicit) return;
    if (srcPort.busType !== tgtPort.busType) return;

    // ── Peripheral-to-peripheral directional buses (NeoPixel chain / cell → reader) ──
    const isP2PBus = srcPort.busType === 'NEOPIXEL' || srcPort.busType === 'ADC';
    if (isP2PBus && !srcIsMcu && !tgtIsMcu) {
      const dirOk =
        (srcPort.direction === 'out' && tgtPort.direction === 'in') ||
        (srcPort.direction === 'in' && tgtPort.direction === 'out');
      if (!dirOk) return;
      if (portOccupied(srcModule.id, dragState.sourcePortId!, srcPort.multiDrop)) return;
      if (portOccupied(tgtModule.id, targetPortId, tgtPort.multiDrop)) return;
      onAddWire({
        fromModuleId: dragState.sourceModuleId!,
        fromPortId: dragState.sourcePortId!,
        toModuleId: targetModuleId,
        toPortId: targetPortId,
      });
      return;
    }

    // ── Standard MCU ↔ peripheral ──
    if (srcIsMcu === tgtIsMcu) return;

    const mcuMod = srcIsMcu ? srcModule : tgtModule;
    const mcuPortId = srcIsMcu ? dragState.sourcePortId! : targetPortId;
    const mcuPort = srcIsMcu ? srcPort : tgtPort;
    const periphMod = srcIsMcu ? tgtModule : srcModule;
    const periphPortId = srcIsMcu ? targetPortId : dragState.sourcePortId!;
    const periphPort = srcIsMcu ? tgtPort : srcPort;

    if (portOccupied(mcuMod.id, mcuPortId, mcuPort.multiDrop)) return;
    if (portOccupied(periphMod.id, periphPortId, periphPort.multiDrop)) return;

    onAddWire({
      fromModuleId: dragState.sourceModuleId!,
      fromPortId: dragState.sourcePortId!,
      toModuleId: targetModuleId,
      toPortId: targetPortId,
    });
  }

  function portOccupied(moduleId: string, portId: string, multiDrop: boolean): boolean {
    if (multiDrop) return false;
    return state.wires.some(
      (w) =>
        (w.fromModuleId === moduleId && w.fromPortId === portId) ||
        (w.toModuleId === moduleId && w.toPortId === portId)
    );
  }

  // ── Cursor class ──────────────────────────────────────────────────────────

  function getCursorClass() {
    if (isPanning) return styles.canvasPanning;
    if (dragState.active) return styles.canvasDragging;
    return '';
  }

  return (
    <div
      ref={canvasRef}
      className={`${styles.canvas} ${getCursorClass()}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseDown={handleCanvasMouseDown}
      onContextMenu={handleContextMenu}
    >
      {/* Transformed world — modules and wires live here */}
      <div
        className={styles.world}
        style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}
      >
        <WireLayer
          modules={state.modules}
          wires={state.wires}
          dragState={dragState}
          onRemoveWire={onRemoveWire}
        />
        {state.modules.map((module) => (
          <ModuleNode
            key={module.id}
            module={module}
            def={MODULE_DEFINITIONS[module.type]}
            modules={state.modules}
            wires={state.wires}
            dragState={dragState}
            onStartDrag={onStartDrag}
            onRemove={onRemoveModule}
            onAddMcuBusSlot={onAddMcuBusSlot}
            onRemoveMcuBusSlot={onRemoveMcuBusSlot}
          />
        ))}
      </div>

      {/* Toolbar stays in viewport space (not affected by pan/zoom) */}
      <ModuleToolbar pos={toolbarPos} onPosChange={setToolbarPos} />
    </div>
  );
}
