/**
 * Shared Pocket TTS / read-aloud bootstrap state for UI progress.
 */

import { prefetchPocketTtsBundle } from '@/audio/pocket-tts-model-cache';
import { getPocketTtsEngine } from '@/audio/pocket-tts-engine';
import { isPocketTtsAvailable } from '@/audio/read-aloud';
import {
  isWebSpeechAvailable,
  primeWebSpeechVoices,
  stopWebSpeech,
} from '@/audio/web-speech-engine';

export type ReadAloudBootstrapStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Which engine auto-read and Read it should use after bootstrap. */
export type ReadAloudBackend = 'none' | 'pocket' | 'web-speech';

export type ReadAloudBootstrapState = {
  status: ReadAloudBootstrapStatus;
  /** 0–1 while loading; 1 when ready. */
  progress: number;
  error: string | null;
  backend: ReadAloudBackend;
  /** Set when Pocket failed but device speech synthesis is in use. */
  pocketFallbackReason: string | null;
};

const listeners = new Set<() => void>();
const pocketReadyListeners = new Set<() => void>();

let state: ReadAloudBootstrapState = {
  status: 'idle',
  progress: 0,
  error: null,
  backend: 'none',
  pocketFallbackReason: null,
};

let bootstrapPromise: Promise<void> | null = null;
let bootstrapVoice: string | null = null;

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function notifyPocketReady(): void {
  stopWebSpeech();
  for (const listener of pocketReadyListeners) {
    listener();
  }
}

function patchState(partial: Partial<ReadAloudBootstrapState>): void {
  const prevBackend = state.backend;
  state = { ...state, ...partial };
  notify();
  if (partial.backend === 'pocket' && prevBackend !== 'pocket') {
    notifyPocketReady();
  }
}

export function getReadAloudBootstrapState(): ReadAloudBootstrapState {
  return state;
}

export function getReadAloudBackend(): ReadAloudBackend {
  return state.backend;
}

export function getPocketTtsFallbackReason(): string | null {
  return state.pocketFallbackReason;
}

/** True when Pocket TTS finished loading and should be preferred over Web Speech. */
export function shouldUsePocketTts(): boolean {
  return state.backend === 'pocket' && isPocketTtsAvailable();
}

export function subscribeReadAloudBootstrap(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Fires when Pocket TTS becomes the active backend (e.g. to upgrade in-flight speech). */
export function subscribePocketBackendReady(listener: () => void): () => void {
  pocketReadyListeners.add(listener);
  return () => {
    pocketReadyListeners.delete(listener);
  };
}

/** Map worker status strings to coarse download / init progress. */
export function progressForWorkerStatus(status: string): number | null {
  if (status.includes('ONNX Runtime')) return 0.52;
  if (status.includes('bundle')) return 0.65;
  if (status.includes('Preparing voice') || status.includes('Preparing custom voice')) {
    return 0.82;
  }
  if (status === 'Ready') return 0.94;
  return null;
}

export function setReadAloudBootstrapProgress(progress: number): void {
  if (state.status !== 'loading') return;
  patchState({ progress: Math.min(0.98, Math.max(state.progress, progress)) });
}

async function runBootstrap(voice: string): Promise<void> {
  if (!isPocketTtsAvailable()) {
    primeWebSpeechVoices();
    patchState({
      status: 'ready',
      progress: 1,
      error: null,
      backend: 'web-speech',
      pocketFallbackReason: null,
    });
    return;
  }

  patchState({
    status: 'loading',
    progress: 0,
    error: null,
    backend: 'none',
    pocketFallbackReason: null,
  });

  try {
    await prefetchPocketTtsBundle(undefined, (assetRatio) => {
      setReadAloudBootstrapProgress(assetRatio * 0.34);
    });
    setReadAloudBootstrapProgress(0.36);
    await getPocketTtsEngine().ensureReady(voice);
    patchState({
      status: 'ready',
      progress: 1,
      error: null,
      backend: 'pocket',
      pocketFallbackReason: null,
    });
  } catch (err) {
    if (isWebSpeechAvailable()) {
      const reason = err instanceof Error ? err.message : 'Failed to load Pocket TTS';
      console.warn('[read-aloud] Pocket TTS unavailable, using device voice:', reason);
      primeWebSpeechVoices();
      patchState({
        status: 'ready',
        progress: 1,
        error: null,
        backend: 'web-speech',
        pocketFallbackReason: reason,
      });
      return;
    }
    const message = err instanceof Error ? err.message : 'Failed to load read-aloud';
    patchState({ status: 'error', progress: 0, error: message, backend: 'none' });
    throw err;
  }
}

/** Idempotent bootstrap; safe from AppHydrator and the read bar. */
export function startReadAloudBootstrap(voice: string): Promise<void> {
  if (state.status === 'ready' && bootstrapVoice === voice) {
    return Promise.resolve();
  }

  if (bootstrapPromise && bootstrapVoice === voice) {
    return bootstrapPromise;
  }

  bootstrapVoice = voice;
  bootstrapPromise = runBootstrap(voice).finally(() => {
    bootstrapPromise = null;
  });
  return bootstrapPromise;
}

export function isReadAloudBootstrapReady(): boolean {
  return state.status === 'ready';
}

/** After clearing TTS caches, the next read-aloud use re-prefetches models. */
export function resetReadAloudBootstrap(): void {
  bootstrapPromise = null;
  bootstrapVoice = null;
  state = {
    status: 'idle',
    progress: 0,
    error: null,
    backend: 'none',
    pocketFallbackReason: null,
  };
  notify();
}
