// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { useCanvasState } from './hooks/useCanvasState';
import { useFeatures } from './hooks/useFeatures';
import { useWireDrag } from './hooks/useWireDrag';
import AppLayout from './components/layout/AppLayout';
import TopBar from './components/topbar/TopBar';
import Canvas from './components/canvas/Canvas';
import BOMPanel from './components/bom/BOMPanel';
import FeaturesPanel from './components/features/FeaturesPanel';

export default function App() {
  const {
    state,
    addModule,
    moveModule,
    removeModule,
    addWire,
    removeWire,
    addMcuBusSlot,
    removeMcuBusSlot,
    importState,
  } = useCanvasState();
  const features = useFeatures(state);
  const { dragState, startDrag, updateCursor, cancelDrag } = useWireDrag();

  return (
    <AppLayout
      topbar={<TopBar state={state} onImport={importState} />}
      canvas={
        <Canvas
          state={state}
          dragState={dragState}
          onAddModule={addModule}
          onMoveModule={moveModule}
          onRemoveModule={removeModule}
          onAddWire={addWire}
          onRemoveWire={removeWire}
          onStartDrag={startDrag}
          onUpdateCursor={updateCursor}
          onCancelDrag={cancelDrag}
          onAddMcuBusSlot={addMcuBusSlot}
          onRemoveMcuBusSlot={removeMcuBusSlot}
        />
      }
      features={<FeaturesPanel features={features} />}
      bom={<BOMPanel modules={state.modules} />}
    />
  );
}
