// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { useRef } from 'react';
import { CanvasState } from '../../types';
import styles from './TopBar.module.css';

interface TopBarProps {
  state: CanvasState;
  onImport: (state: CanvasState) => void;
}

export default function TopBar({ state, onImport }: TopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openccr-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as CanvasState;
        if (parsed && Array.isArray(parsed.modules) && Array.isArray(parsed.wires)) {
          onImport(parsed);
        }
      } catch {
        // invalid file, ignore
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <header className={styles.topbar}>
      <span className={styles.wordmark}>
        open<strong>CCR</strong> Configurator
      </span>
      <div className={styles.actions}>
        <button className={styles.btn} onClick={handleExport}>
          Export
        </button>
        <button className={styles.btn} onClick={handleImportClick}>
          Import
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className={styles.fileInput}
        onChange={handleFileChange}
      />
    </header>
  );
}
