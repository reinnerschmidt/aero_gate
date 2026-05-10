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

      // Simplificado para melhor compatibilidade em celulares (iOS/Android)
      // O facingMode: 'user' é o padrão mais confiável para câmera frontal
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      let newStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn('Câmera frontal específica falhou, tentando qualquer câmera:', e);
        newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        // Importante: muted e playsInline já devem estar no elemento, 
        // mas forçamos o play aqui com tratamento de erro
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => {
            console.error('Erro ao dar play no vídeo:', err);
          });
        };
      }
      setError(null);
    } catch (err) {
      console.error('Erro crítico de câmera:', err);
      setError('Câmera indisponível. Verifique as permissões do navegador.');
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
      // No mobile, muitas vezes não precisamos inverter, mas se precisar, adicionamos aqui
      ctx.drawImage(videoRef.current, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.8);
    }
    return null;
  }, []);

  return { videoRef, startCamera, stopCamera, capturePhoto, error };
};
