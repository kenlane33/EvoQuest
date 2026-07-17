/**
 * Browser built-in speech synthesis fallback for mobile / non-isolated pages.
 */

import { prepareTextForSpeech } from '../text/speech-substitutions';

let speakChain: Promise<void> = Promise.resolve();
let primed = false;

type WebSpeechBoundaryState = {
  charIndex: number;
  text: string;
};

let activeBoundary: WebSpeechBoundaryState | null = null;

function clearWebSpeechBoundary(): void {
  activeBoundary = null;
}

export function getWebSpeechBoundaryCharIndex(): number | null {
  return activeBoundary?.charIndex ?? null;
}

function bindAbortSignal(signal: AbortSignal | undefined, onAbort: () => void): () => void {
  if (!signal) return () => {};
  if (signal.aborted) {
    onAbort();
    return () => {};
  }
  signal.addEventListener('abort', onAbort);
  return () => signal.removeEventListener('abort', onAbort);
}

export function isWebSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** iOS loads voices asynchronously; call early and after voiceschanged. */
export function primeWebSpeechVoices(): void {
  if (!isWebSpeechAvailable() || primed) return;
  primed = true;
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener(
    'voiceschanged',
    () => {
      speechSynthesis.getVoices();
    },
    { once: true },
  );
}

function pickEnglishVoice(): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    voices[0]
  );
}

export type WebSpeechSpeakOptions = {
  volume?: number;
  signal?: AbortSignal;
};

function speakWebSpeechNow(
  text: string,
  options?: WebSpeechSpeakOptions,
): Promise<void> {
  primeWebSpeechVoices();

  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = Math.min(1, Math.max(0, options?.volume ?? 0.6));
    const voice = pickEnglishVoice();
    if (voice) utterance.voice = voice;

    activeBoundary = { charIndex: 0, text };

    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };

    const onAbort = () => {
      speechSynthesis.cancel();
      clearWebSpeechBoundary();
      finish(() => reject(new DOMException('Aborted', 'AbortError')));
    };
    const unbind = bindAbortSignal(options?.signal, onAbort);

    utterance.onboundary = (event) => {
      if (event.name !== 'word') return;
      activeBoundary = {
        charIndex: event.charIndex + (event.charLength ?? 0),
        text,
      };
    };

    utterance.onend = () => {
      unbind();
      clearWebSpeechBoundary();
      finish(resolve);
    };
    utterance.onerror = () => {
      unbind();
      clearWebSpeechBoundary();
      finish(() => reject(new Error('Speech synthesis failed')));
    };

    // Must run synchronously in the user-gesture call stack (iOS Safari).
    speechSynthesis.speak(utterance);
  });
}

export async function speakWebSpeech(
  text: string,
  options?: WebSpeechSpeakOptions,
): Promise<void> {
  const trimmed = prepareTextForSpeech(text);
  if (!trimmed) return;
  if (!isWebSpeechAvailable()) {
    throw new Error('Speech synthesis is not available in this browser.');
  }
  if (options?.signal?.aborted) return;

  stopWebSpeech();

  clearWebSpeechBoundary();

  const waitFor = speakChain;
  let advance!: () => void;
  speakChain = new Promise<void>((resolve) => {
    advance = resolve;
  });

  await waitFor;
  try {
    if (options?.signal?.aborted) return;
    await speakWebSpeechNow(trimmed, options);
  } finally {
    advance();
  }
}

export function stopWebSpeech(): void {
  if (!isWebSpeechAvailable()) return;
  speechSynthesis.cancel();
  clearWebSpeechBoundary();
}

export async function waitForWebSpeechIdle(): Promise<void> {
  await speakChain;
}
