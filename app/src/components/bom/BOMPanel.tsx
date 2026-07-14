// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { PlacedModule } from '../../types';
import { MODULE_DEFINITIONS } from '../../data/moduleDefinitions';
import styles from './BOMPanel.module.css';

interface BOMPanelProps {
  modules: PlacedModule[];
}

export default function BOMPanel({ modules }: BOMPanelProps) {
  const counts = modules.reduce<Record<string, { label: string; count: number }>>((acc, m) => {
    const def = MODULE_DEFINITIONS[m.type];
    if (!acc[m.type]) {
      acc[m.type] = { label: def.label, count: 0 };
    }
    acc[m.type].count++;
    return acc;
  }, {});

  const entries = Object.values(counts).sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className={styles.panel}>
      <div className={styles.title}>Bill of Materials</div>
      {entries.length === 0 ? (
        <p className={styles.empty}>No modules placed yet</p>
      ) : (
        <>
          {entries.map((entry) => (
            <div key={entry.label} className={styles.row}>
              <span className={styles.rowLabel}>{entry.label}</span>
              <span className={styles.rowCount}>{entry.count}</span>
            </div>
          ))}
          <hr className={styles.divider} />
          <div className={styles.totalRow}>
            <span>Total modules</span>
            <span className={styles.totalCount}>{modules.length}</span>
          </div>
        </>
      )}
    </div>
  );
}
