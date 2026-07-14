// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { useState } from 'react';
import { useCanvasState } from './hooks/useCanvasState';
import { useFeatures } from './hooks/useFeatures';
import { useWireDrag } from './hooks/useWireDrag';
import AppLayout from './components/layout/AppLayout';
import TopBar from './components/topbar/TopBar';
import Canvas from './components/canvas/Canvas';
import BOMPanel from './components/bom/BOMPanel';
import FeaturesPanel from './components/features/FeaturesPanel';
import CookieBanner from './components/ui/CookieBanner';

const COOKIE_KEY = 'openccr.cookieConsent';

export default function App() {
  const [cookieConsent, setCookieConsent] = useState<boolean>(
    () => localStorage.getItem(COOKIE_KEY) === 'accepted'
  );

  function handleAccept() {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setCookieConsent(true);
  }

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
    <>
      {!cookieConsent && <CookieBanner onAccept={handleAccept} />}
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
    </>
  );
}
