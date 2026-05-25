/** Pocket TTS needs cross-origin isolation (COOP/COEP). */
export function isPocketTtsAvailable(): boolean {
  return typeof window !== 'undefined' && window.crossOriginIsolated;
}

type ReadingSettings = {
  enabled: boolean;
  autoRead: boolean;
};

/** True when automatic read-aloud should run (and can). */
export function canAutoReadAloud(reading: ReadingSettings): boolean {
  return reading.enabled && reading.autoRead && isPocketTtsAvailable();
}

/** Never block the answer flash waiting forever for TTS. */
export const REACTION_SPEAK_TIMEOUT_MS = 12_000;
