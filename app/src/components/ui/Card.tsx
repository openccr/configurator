// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ icon, title, children, footer }) => {
  return (
    <div className={styles.card}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};

export default Card;
