// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  variant?: 'navy' | 'ocean' | 'cyan' | 'warning';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'ocean', children }) => {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
};

export default Badge;
