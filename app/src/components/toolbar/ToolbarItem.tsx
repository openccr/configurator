// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { ModuleDefinition } from '../../types';
import styles from './ToolbarItem.module.css';

interface ToolbarItemProps {
  def: ModuleDefinition;
}

const DOT_CLASS: Record<ModuleDefinition['colorGroup'], string> = {
  core: styles.core,
  sensor: styles.sensor,
  actuator: styles.actuator,
  display: styles.display,
  storage: styles.storage,
  control: styles.control,
};

export default function ToolbarItem({ def }: ToolbarItemProps) {
  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('moduleType', def.type);
    e.dataTransfer.effectAllowed = 'copy';
  }

  const label = def.toolbarLabel ?? def.label;

  return (
    <div className={styles.item} draggable onDragStart={handleDragStart} title={def.description}>
      <div className={`${styles.dot} ${DOT_CLASS[def.colorGroup]}`} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
