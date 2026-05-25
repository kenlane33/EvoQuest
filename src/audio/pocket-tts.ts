/** Kyutai Pocket TTS — in-browser via ONNX/WASM (KevinAHM/pocket-tts-web). */

export const POCKET_TTS_DEFAULT_VOICE = 'azelma';
/** ONNX language bundle (KevinAHM/pocket-tts-web). */
export const POCKET_TTS_DEFAULT_LANGUAGE = 'english_2026-04';

/** @deprecated Server mode removed; kept for stored settings compatibility. */
export const POCKET_TTS_DEFAULT_URL = '';

export class PocketTtsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PocketTtsError';
  }
}
