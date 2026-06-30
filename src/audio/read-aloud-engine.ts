/**
 * Unified read-aloud: Pocket TTS when cross-origin isolated, else Web Speech API.
 */

import {
  getPocketTtsEngine,
  getPocketTtsUtterancePlayedMs,
  getPocketTtsUtteranceProgress,
  getPocketTtsUtteranceTotalMs,
  getPocketTtsUtteranceWordAnchors,
  beginPocketTtsAudioFromUserGesture,
  ensurePocketTtsAudioOutputReady,
  preloadPocketTtsText,
  stopPocketTtsEngine,
  waitForPocketTtsIdle,
} from '@/audio/pocket-tts-engine';
import { POCKET_TTS_DEFAULT_VOICE } from '@/audio/pocket-tts';
import { isPocketTtsAvailable } from '@/audio/read-aloud';
import { clearPocketTtsModelCache } from '@/audio/pocket-tts-model-cache';
import {
  resetReadAloudBootstrap,
  shouldUsePocketTts,
  startReadAloudBootstrap,
  subscribePocketBackendReady,
} from '@/audio/read-aloud-bootstrap';
import {
  isWebSpeechAvailable,
  getWebSpeechBoundaryCharIndex,
  primeWebSpeechVoices,
  speakWebSpeech,
  stopWebSpeech,
  waitForWebSpeechIdle,
} from '@/audio/web-speech-engine';

export type ReadAloudSpeakOptions = {
  voice?: string;
  volume?: number;
  signal?: AbortSignal;
};

export function isReadAloudAvailable(): boolean {
  return isPocketTtsAvailable() || isWebSpeechAvailable();
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

/** Active read-aloud session; aborted when a newer speak or stopReadAloud runs. */
let activeSession: AbortController | null = null;

function linkAbortSignal(session: AbortController, parent?: AbortSignal): void {
  if (!parent) return;
  if (parent.aborted) {
    session.abort();
    return;
  }
  parent.addEventListener('abort', () => session.abort(), { once: true });
}

/** Halt any in-flight read-aloud before starting another utterance. */
function preemptReadAloud(): void {
  activeSession?.abort();
  activeSession = null;
  stopPocketTtsEngine();
  stopWebSpeech();
}

async function speakPocket(text: string, options?: ReadAloudSpeakOptions): Promise<void> {
  await getPocketTtsEngine().speak(text, options);
}

async function speakWebSpeechWithPocketUpgrade(
  text: string,
  options?: ReadAloudSpeakOptions,
): Promise<void> {
  if (options?.signal?.aborted) return;

  let unsubUpgrade: (() => void) | undefined;

  const pocketUpgrade = new Promise<void>((resolve, reject) => {
    unsubUpgrade = subscribePocketBackendReady(() => {
      if (options?.signal?.aborted) {
        resolve();
        return;
      }
      if (!shouldUsePocketTts()) return;
      stopWebSpeech();
      speakPocket(text, options).then(resolve).catch(reject);
    });
  });

  try {
    await Promise.race([speakWebSpeech(text, options), pocketUpgrade]);
  } finally {
    unsubUpgrade?.();
  }
}

/**
 * Wait for Pocket TTS when possible; only use Web Speech when Pocket is unavailable
 * or failed to load. Upgrades in-flight Web Speech when Pocket finishes loading.
 */
export async function speakReadAloud(
  text: string,
  options?: ReadAloudSpeakOptions,
): Promise<void> {
  beginReadAloudAudioFromUserGesture();
  if (options?.signal?.aborted) return;

  preemptReadAloud();

  const session = new AbortController();
  activeSession = session;
  linkAbortSignal(session, options?.signal);
  if (session.signal.aborted) return;

  const speakOptions: ReadAloudSpeakOptions = {
    ...options,
    signal: session.signal,
  };

  const voice = speakOptions.voice ?? POCKET_TTS_DEFAULT_VOICE;

  try {
    if (isPocketTtsAvailable()) {
      await startReadAloudBootstrap(voice);
    } else {
      primeWebSpeechVoices();
    }

    if (session.signal.aborted) return;

    if (shouldUsePocketTts()) {
      await ensureReadAloudAudioOutputReady(speakOptions.signal);
      if (session.signal.aborted) return;
      await speakPocket(text, speakOptions);
      return;
    }

    if (!isWebSpeechAvailable()) {
      throw new Error('Read aloud is not available in this browser.');
    }

    await speakWebSpeechWithPocketUpgrade(text, speakOptions);
  } catch (err) {
    if (isAbortError(err) || session.signal.aborted) return;
    throw err;
  } finally {
    if (activeSession === session) {
      activeSession = null;
    }
  }
}

/** Load Pocket TTS models when available; no-op for system-voice fallback. */
export async function prepareReadAloud(voice = POCKET_TTS_DEFAULT_VOICE): Promise<void> {
  await startReadAloudBootstrap(voice);
}

/** Call synchronously from a user gesture before the first await in speak(). */
export function beginReadAloudAudioFromUserGesture(): void {
  beginPocketTtsAudioFromUserGesture();
}

/** Re-verify audio output after long model load; may wait for a fresh tap. */
export async function ensureReadAloudAudioOutputReady(signal?: AbortSignal): Promise<void> {
  await ensurePocketTtsAudioOutputReady(signal);
}

export function stopReadAloud(): void {
  preemptReadAloud();
}

/** 0–1 progress through active Pocket TTS audio; null when idle or on Web Speech fallback. */
export function getReadAloudAudioProgress(): number | null {
  if (!shouldUsePocketTts()) return null;
  return getPocketTtsUtteranceProgress();
}

/** Ms of Pocket audio heard so far; null when idle or on Web Speech fallback. */
export function getReadAloudPlayedMs(): number | null {
  if (!shouldUsePocketTts()) return null;
  return getPocketTtsUtterancePlayedMs();
}

/** Per-sentence audio→text anchors; null when idle or on Web Speech fallback. */
export function getReadAloudWordAnchors(): Array<{
  ms: number;
  charOffset: number;
  wordOffset: number;
}> | null {
  if (!shouldUsePocketTts()) return null;
  return getPocketTtsUtteranceWordAnchors();
}

/** Total ms of the active Pocket utterance once finalized; null while streaming. */
export function getReadAloudTotalMs(): number | null {
  if (!shouldUsePocketTts()) return null;
  return getPocketTtsUtteranceTotalMs();
}

/** Whether the active Pocket utterance has received all audio chunks. */
export function isReadAloudUtteranceFinalized(): boolean {
  if (!shouldUsePocketTts()) return false;
  return getPocketTtsEngine().isUtteranceFinalized();
}

/** Web Speech word-boundary char index for the active utterance; null when using Pocket TTS. */
export function getReadAloudBoundaryCharIndex(): number | null {
  if (shouldUsePocketTts()) return null;
  return getWebSpeechBoundaryCharIndex();
}

export async function waitForReadAloudIdle(maxMs = 15_000): Promise<void> {
  if (typeof window === 'undefined') return;
  await Promise.race([
    Promise.all([waitForPocketTtsIdle(), waitForWebSpeechIdle()]),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, maxMs);
    }),
  ]);
}

export function preloadReadAloud(voice?: string): void {
  if (typeof window === 'undefined') return;
  void startReadAloudBootstrap(voice ?? POCKET_TTS_DEFAULT_VOICE);
}

export function preloadReadAloudText(text: string, voice?: string): void {
  if (!shouldUsePocketTts() || !text.trim()) return;
  preloadPocketTtsText(text, voice);
}

/** Clear Pocket TTS model + speech caches; stops any in-flight read-aloud. */
export async function clearTtsCache(): Promise<void> {
  stopReadAloud();
  getPocketTtsEngine().clearSpeechCache();
  await clearPocketTtsModelCache();
  resetReadAloudBootstrap();
}
