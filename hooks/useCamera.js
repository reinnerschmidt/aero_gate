'use client';

import { useState, useCallback, useRef } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Enumerate devices to find the best camera
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      // Try to find a device with "front" in the label, otherwise use facingMode
      const frontCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('front') || 
        device.label.toLowerCase().includes('frontal') ||
        device.label.toLowerCase().includes('integrada')
      );

      const constraints = frontCamera 
        ? { video: { deviceId: { exact: frontCamera.deviceId } } }
        : { video: { facingMode: 'user' } };

      let newStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn('Strict constraints failed, trying generic video:', e);
        newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(console.error);
        };
      }
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Não foi possível acessar a câmera. Verifique se o navegador tem permissão e se o dispositivo não está sendo usado por outro app.');
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      return canvas.toDataURL('image/jpeg');
    }
    return null;
  }, []);

  return { videoRef, startCamera, stopCamera, capturePhoto, error };
};
