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
            src="/cartoon_avatar.png" 
            alt="Embraer KC-390 Avatar" 
            fill
            className={styles.avatar}
            priority
          />
          
          {/* Animated Mouth for the Cartoon Face */}
          {isTalking && (
            <div className={styles.mouthWrapper}>
              <div className={styles.mouth} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
