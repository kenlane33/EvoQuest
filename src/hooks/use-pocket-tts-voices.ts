'use client';

import { useEffect, useState } from 'react';
import { POCKET_TTS_DEFAULT_VOICE } from '@/audio/pocket-tts';
import { getPocketTtsEngine } from '@/audio/pocket-tts-engine';
import { useAppStore } from '@/store/app-store';

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
    if (!enabled || typeof window === 'undefined' || !window.crossOriginIsolated) {
      setStatus('idle');
      setError(null);
      return;
    }

    const engine = getPocketTtsEngine();
    const sync = () => {
      setVoices([...engine.getAvailableVoices()]);
    };

    const unsub = engine.subscribeVoices(sync);
    sync();

    if (engine.getAvailableVoices().length > 0) {
      setStatus('ready');
      setError(null);
      return unsub;
    }

    setStatus('loading');
    setError(null);

    void engine
      .ensureReady(voice)
      .then(() => {
        sync();
        setStatus('ready');
      })
      .catch((err) => {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to load voices');
      });

    return unsub;
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

/** Clamps stored voice to voices reported by the loaded bundle. */
export function useValidateStoredPocketTtsVoice(enabled: boolean): void {
  const setSettings = useAppStore((s) => s.setSettings);
  const storedVoice = useAppStore((s) => s.settings.reading.voice);

  useEffect(() => {
    if (!enabled) return;

    const engine = getPocketTtsEngine();
    const validate = () => {
      const available = engine.getAvailableVoices();
      if (available.length === 0) return;
      const resolved = resolvePocketTtsVoice(storedVoice, available);
      if (resolved === storedVoice) return;
      setSettings((prev) => ({
        ...prev,
        reading: { ...prev.reading, voice: resolved },
      }));
    };

    const unsub = engine.subscribeVoices(validate);
    validate();
    return unsub;
  }, [enabled, storedVoice, setSettings]);
}
