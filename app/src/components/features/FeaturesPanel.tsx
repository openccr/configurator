// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import { FeatureResult } from '../../hooks/useFeatures';
import styles from './FeaturesPanel.module.css';

interface FeaturesPanelProps {
  features: FeatureResult[];
}

export default function FeaturesPanel({ features }: FeaturesPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.grid}>
        {features.map(({ rule, unlocked }) => (
          <div
            key={rule.id}
            className={`${styles.feature} ${unlocked ? styles.featureUnlocked : ''}`}
            title={rule.description}
          >
            <span className={unlocked ? styles.iconUnlocked : styles.iconLocked}>
              {unlocked ? '✓' : '○'}
            </span>
            <span className={`${styles.label} ${unlocked ? '' : styles.labelLocked}`}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
