'use client';

import { useEffect, useState } from 'react';
import { POCKET_TTS_DEFAULT_VOICE } from '../engine/pocket-tts';
import { getPocketTtsEngine } from '../engine/pocket-tts-engine';
import {
  getPocketTtsFallbackReason,
  subscribeReadAloudBootstrap,
} from '../engine/read-aloud-bootstrap';
import { isPocketTtsAvailable } from '../engine/read-aloud';
import { primeWebSpeechVoices } from '../engine/web-speech-engine';

export type PocketTtsVoicesStatus = 'idle' | 'loading' | 'ready' | 'error';

type UsePocketTtsVoicesOptions = {
  /** When false, skips model bootstrap (e.g. read-aloud disabled). */
  enabled?: boolean;
  /** Voice to prepare on bootstrap; defaults to POCKET_TTS_DEFAULT_VOICE. */
  voice?: string;
};

/**
 * Loads built-in Pocket TTS voices after the English bundle bootstraps.
 * Voice ids come from the worker's voices_loaded message (voices.bin).
 */
export function usePocketTtsVoices({
  enabled = true,
  voice = POCKET_TTS_DEFAULT_VOICE,
}: UsePocketTtsVoicesOptions = {}) {
  const [voices, setVoices] = useState<string[]>(() =>
    [...getPocketTtsEngine().getAvailableVoices()],
  );
  const [status, setStatus] = useState<PocketTtsVoicesStatus>(() =>
    getPocketTtsEngine().getAvailableVoices().length > 0 ? 'ready' : 'idle',
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setStatus('idle');
      setError(null);
      return;
    }

    if (!isPocketTtsAvailable()) {
      primeWebSpeechVoices();
      setVoices([]);
      setStatus('ready');
      setError(null);
      return;
    }

    const pocketFallback = getPocketTtsFallbackReason();
    if (pocketFallback) {
      primeWebSpeechVoices();
      setVoices([]);
      setStatus('ready');
      setError(null);
      return;
    }

    const engine = getPocketTtsEngine();
    const sync = () => {
      setVoices([...engine.getAvailableVoices()]);
    };

    const applyFallback = () => {
      if (!getPocketTtsFallbackReason()) return false;
      primeWebSpeechVoices();
      setVoices([]);
      setStatus('ready');
      setError(null);
      return true;
    };

    if (applyFallback()) return;

    const unsub = engine.subscribeVoices(sync);
    const unsubBootstrap = subscribeReadAloudBootstrap(() => {
      applyFallback();
    });
    sync();

    if (engine.getAvailableVoices().length > 0) {
      setStatus('ready');
      setError(null);
      return () => {
        unsub();
        unsubBootstrap();
      };
    }

    setStatus('loading');
    setError(null);

    void engine
      .ensureReady(voice)
      .then(() => {
        if (applyFallback()) return;
        sync();
        setStatus('ready');
      })
      .catch((err) => {
        if (getPocketTtsFallbackReason()) {
          applyFallback();
          return;
        }
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to load voices');
      });

    return () => {
      unsub();
      unsubBootstrap();
    };
  }, [enabled, voice]);

  return { voices, status, error };
}

/** Pick a stored voice id that exists in the bundle, or a sensible fallback. */
export function resolvePocketTtsVoice(
  storedVoice: string,
  availableVoices: readonly string[],
): string {
  if (availableVoices.includes(storedVoice)) {
    return storedVoice;
  }
  if (availableVoices.includes(POCKET_TTS_DEFAULT_VOICE)) {
    return POCKET_TTS_DEFAULT_VOICE;
  }
  return availableVoices[0] ?? POCKET_TTS_DEFAULT_VOICE;
}
