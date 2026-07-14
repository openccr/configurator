// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import styles from './CookieBanner.module.css';

interface CookieBannerProps {
  onAccept: () => void;
}

export default function CookieBanner({ onAccept }: CookieBannerProps) {
  function handleDecline() {
    window.location.href = 'https://www.google.com';
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.banner} role="dialog" aria-modal="true" aria-label="Cookie notice">
        <div className={styles.header}>
          <span className={styles.icon}>🍪</span>
          <h2 className={styles.title}>We use cookies</h2>
        </div>
        <p className={styles.body}>
          <strong>Your configuration data never leaves your device</strong> — everything is saved
          locally in your browser. We only collect anonymous visit statistics (Google Analytics) to
          understand how the tool is being used and improve it.
        </p>
        <div className={styles.actions}>
          <button className={styles.accept} onClick={onAccept}>
            Let's go
          </button>
          <button className={styles.decline} onClick={handleDecline}>
            No, thanks
          </button>
        </div>
      </div>
    </div>
  );
}
