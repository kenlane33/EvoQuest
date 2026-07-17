/** Kyutai Pocket TTS — in-browser via ONNX/WASM (KevinAHM/pocket-tts-web). */

import { getReadAloudConfig } from '../config';

export const POCKET_TTS_DEFAULT_VOICE = getReadAloudConfig().defaultVoice;
/** ONNX language bundle (KevinAHM/pocket-tts-web). */
export const POCKET_TTS_DEFAULT_LANGUAGE = getReadAloudConfig().defaultLanguage;

/**
 * Extra voices cloned from Voice-Zero reference audio (CC0).
 * Values are 24 kHz mono float32le prompt paths under /public.
 * Encoded lazily on first use (~1–2s once per voice, then cached in the worker).
 */
export const POCKET_TTS_EXTRA_VOICES: Readonly<Record<string, string>> =
  getReadAloudConfig().extraVoices;

export const POCKET_TTS_EXTRA_VOICE_IDS = Object.keys(
  POCKET_TTS_EXTRA_VOICES,
) as (keyof typeof POCKET_TTS_EXTRA_VOICES & string)[];

/** @deprecated Server mode removed; kept for stored settings compatibility. */
export const POCKET_TTS_DEFAULT_URL = '';

/** Human-readable label for a built-in voice id (e.g. bill_boerst → Bill Boerst). */
export function formatPocketTtsVoiceLabel(voiceId: string): string {
  return voiceId
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export class PocketTtsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PocketTtsError';
  }
}
