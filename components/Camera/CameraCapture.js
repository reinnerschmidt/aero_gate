'use client';

import { useEffect, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import TimerOverlay from './TimerOverlay';
import styles from './CameraCapture.module.css';

export default function CameraCapture({ onCapture, useTimer = false }) {
  const { videoRef, startCamera, stopCamera, capturePhoto, error } = useCamera();
  const [showTimer, setShowTimer] = useState(useTimer);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      onCapture(photo);
    }
  };

  return (
    <div className={styles.container}>
      {error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.videoWrapper}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className={styles.video}
          />
          <div className={styles.overlay} />
          {showTimer && <TimerOverlay onFinish={handleCapture} />}
        </div>
      )}
      
      {!useTimer && (
        <button className="btn-primary" onClick={handleCapture} style={{ marginTop: '1rem' }}>
          Tirar Foto
        </button>
      )}
    </div>
  );
}
