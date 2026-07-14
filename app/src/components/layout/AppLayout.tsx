// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { ReactNode, useState } from 'react';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  topbar: ReactNode;
  canvas: ReactNode;
  features: ReactNode;
  bom: ReactNode;
}

export default function AppLayout({ topbar, canvas, features, bom }: AppLayoutProps) {
  const [featuresOpen, setFeaturesOpen] = useState(true);

  const rows = featuresOpen ? 'auto 4fr 1fr' : 'auto 1fr min-content';

  return (
    <div className={styles.layout} style={{ gridTemplateRows: rows }}>
      <div className={styles.topbar}>{topbar}</div>
      <div className={styles.canvas}>{canvas}</div>
      <div className={styles.features}>
        <button
          className={styles.featuresToggle}
          onClick={() => setFeaturesOpen((o) => !o)}
          title={featuresOpen ? 'Collapse features' : 'Expand features'}
        >
          <span className={styles.featuresToggleLabel}>Features</span>
          <span className={styles.featuresToggleChevron}>{featuresOpen ? '▾' : '▴'}</span>
        </button>
        {featuresOpen && <div className={styles.featuresContent}>{features}</div>}
      </div>
      <div className={styles.bom}>{bom}</div>
    </div>
  );
}
