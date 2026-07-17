'use client';

import { useCallback, useRef, useState } from 'react';
import {
  prepareReadAloud,
  speakReadAloud,
  stopReadAloud,
  beginReadAloudAudioFromUserGesture,
  ensureReadAloudAudioOutputReady,
} from '../engine/read-aloud-engine';
import { POCKET_TTS_DEFAULT_VOICE } from '../engine/pocket-tts';

export type PocketTtsStatus = 'idle' | 'loading' | 'playing' | 'error';

export function stopPocketTts() {
  stopReadAloud();
}

export type UsePocketTtsOptions = {
  voice?: string;
  volume?: number;
};

export function usePocketTts({
  voice = POCKET_TTS_DEFAULT_VOICE,
  volume = 0.6,
}: UsePocketTtsOptions = {}) {
  const [status, setStatus] = useState<PocketTtsStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const speak = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      beginReadAloudAudioFromUserGesture();

      abortRef.current?.abort();
      const id = ++requestId.current;
      const abort = new AbortController();
      abortRef.current = abort;
      setStatus('loading');
      setError(null);

      try {
        await prepareReadAloud(voice);
        if (requestId.current !== id) return;
        await ensureReadAloudAudioOutputReady(abort.signal);
        if (requestId.current !== id) return;
        setStatus('playing');
        await speakReadAloud(trimmed, {
          voice,
          volume,
          signal: abort.signal,
        });
        if (requestId.current === id) {
          setStatus('idle');
        }
      } catch (e) {
        if (requestId.current !== id) return;
        if (e instanceof DOMException && e.name === 'AbortError') {
          setStatus('idle');
          return;
        }
        const msg = e instanceof Error ? e.message : 'TTS failed';
        setError(msg);
        setStatus('error');
      } finally {
        if (abortRef.current === abort) {
          abortRef.current = null;
        }
      }
    },
    [voice, volume],
  );

  const stop = useCallback(() => {
    requestId.current += 1;
    abortRef.current?.abort();
    stopPocketTts();
    setStatus('idle');
    setError(null);
  }, []);

  const toggle = useCallback(
    (text: string) => {
      if (status === 'playing' || status === 'loading') {
        stop();
      } else {
        void speak(text);
      }
    },
    [speak, status, stop],
  );

  return {
    status,
    error,
    speak,
    stop,
    toggle,
    isActive: status === 'loading' || status === 'playing',
  };
}
