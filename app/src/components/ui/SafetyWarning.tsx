// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

/**
 * SafetyWarning Component
 *
 * CONSTRAINT: This component is reserved exclusively for CCR safety-critical
 * notices (PO₂ setpoints, alarm thresholds, calibration). Do not use for
 * generic validation errors or decorative states.
 */

import React from 'react';
import styles from './SafetyWarning.module.css';

interface SafetyWarningProps {
  title: string;
  children: React.ReactNode;
}

const SafetyWarning: React.FC<SafetyWarningProps> = ({ title, children }) => {
  return (
    <div className={styles.wrapper} role="alert">
      <svg
        className={styles.icon}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="12"
          y1="9"
          x2="12"
          y2="13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="12"
          y1="17"
          x2="12.01"
          y2="17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};

export default SafetyWarning;
