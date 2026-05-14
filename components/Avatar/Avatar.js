'use client';

import { useState, useEffect } from 'react';
import styles from './Avatar.module.css';

export default function Avatar({ text, isTalking }) {
  // Use a fixed initial state to avoid hydration mismatch
  const [bars, setBars] = useState(Array.from({ length: 40 }).map(() => 0));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Initial random bars only on client
    setBars(Array.from({ length: 40 }).map(() => 10 + Math.random() * 20));
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (isTalking) {
      const interval = setInterval(() => {
        setBars(Array.from({ length: 40 }).map(() => 10 + Math.random() * 80));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setBars(Array.from({ length: 40 }).map(() => 5 + Math.random() * 10));
    }
  }, [isTalking, isMounted]);

  return (
    <div className={styles.container}>
      <div className={styles.energyWrapper}>
        {/* Plasma Wave SVG */}
        <div className={`${styles.plasmaContainer} ${isTalking ? styles.active : ''}`}>
          <svg viewBox="0 0 400 100" preserveAspectRatio="none" className={styles.plasmaSvg}>
            {/* Core Beam */}
            <path 
              d="M 0 50 Q 100 30 200 50 T 400 50" 
              className={styles.coreBeam} 
              fill="none" 
              stroke="#00e5ff" 
              strokeWidth="2"
            />
            {/* Electricity Arcs */}
            <path 
              d="M 0 50 Q 50 20 100 50 T 200 50 T 300 50 T 400 50" 
              className={styles.arc1} 
              fill="none" 
              stroke="#00c8ff" 
              strokeWidth="1"
              opacity="0.6"
            />
            <path 
              d="M 0 50 Q 80 80 160 50 T 320 50 T 400 50" 
              className={styles.arc2} 
              fill="none" 
              stroke="#0088cc" 
              strokeWidth="1"
              opacity="0.4"
            />
          </svg>
          
          {/* Central Energy Core Glow */}
          <div className={styles.coreGlow} />
        </div>

        {/* Spectrum Bars (Subtle background) */}
        <div className={styles.spectrum}>
          {bars.map((height, i) => (
            <div 
              key={i} 
              className={styles.bar} 
              style={{ 
                height: `${height}%`,
                transition: isTalking ? 'height 0.1s ease' : 'height 0.8s ease'
              }} 
            />
          ))}
        </div>
      </div>

      {/* Voice Bubble (Optional, only if text is provided) */}
      {text && (
        <div className={`${styles.bubble} animate-fade`}>
          <p>{text}</p>
        </div>
      )}

      {/* Mic/Status Indicator */}
      <div className={styles.statusIndicator}>
        <div className={`${styles.pulse} ${isTalking ? styles.pulsing : ''}`} />
        <span>{isTalking ? 'SISTEMA FALANDO' : 'SISTEMA PRONTO'}</span>
      </div>
    </div>
  );
}
