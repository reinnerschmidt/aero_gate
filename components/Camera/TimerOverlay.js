'use client';

import { useState, useEffect } from 'react';
import styles from './TimerOverlay.module.css';

export default function TimerOverlay({ onFinish }) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onFinish();
    }
  }, [count, onFinish]);

  return (
    <div className={styles.overlay}>
      <div className={styles.circle}>
        <span className={styles.number}>{count}</span>
      </div>
      <p className={styles.text}>Capturando em...</p>
    </div>
  );
}
