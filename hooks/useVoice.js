'use client';

import { useCallback, useState, useRef } from 'react';

export const useVoice = () => {
  const [isTalking, setIsTalking] = useState(false);
  const audioRef = useRef(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsTalking(false);
  }, []);

  const speakWithBrowser = useCallback((text) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      stop();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      
      utterance.onstart = () => setIsTalking(true);
      utterance.onend = () => setIsTalking(false);
      utterance.onerror = () => setIsTalking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  }, [stop]);

  const speak = useCallback(async (text) => {
    try {
      stop(); // Stop any current audio before starting new one
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('ElevenLabs API failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsTalking(true);
      audio.onended = () => {
        setIsTalking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => setIsTalking(false);
      
      await audio.play();
    } catch (err) {
      console.warn('ElevenLabs fallou, usando voz do sistema:', err.message);
      speakWithBrowser(text);
    }
  }, [stop, speakWithBrowser]);

  return { speak, isTalking, stop };
};
