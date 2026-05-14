'use client';

import Image from 'next/image';
import styles from './Avatar.module.css';

export default function Avatar({ text, isTalking }) {
  return (
    <div className={styles.container}>
      {text && (
        <div className={`${styles.bubble} animate-fade`}>
          {text}
          <div className={styles.tail} />
        </div>
      )}
      <div className={`${styles.avatarWrapper} ${isTalking ? styles.talking : ''}`}>
        <div className={styles.imageContainer}>
          <Image 
            src="/spectrum.png?v=2" 
            alt="Spectrum Audio" 
            fill
            className={`${styles.avatar} ${isTalking ? styles.avatarTalking : ''}`}
            priority
          />
          
          {/* Energy Glow Overlay */}
          {isTalking && (
            <div className={styles.energyGlow} />
          )}

          {/* Speaker Icon Indicator */}
          <div className={styles.speakerIndicator}>
             <span style={{ fontSize: '1.5rem' }}>{isTalking ? '🔊' : '🔈'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
