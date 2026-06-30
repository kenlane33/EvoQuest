/**
 * Word tokenization and progress mapping for spoken-text highlighting.
 */

import { prepareTextForSpeech } from '@/audio/speech-substitutions';

export type SpeakWord = { text: string; start: number };

export type SpeakLayout = {
  rawText: string;
  spokenText: string;
  words: SpeakWord[];
  weights: number[];
  estimatedMs: number;
};

/** Rough duration for progress UI — not exact for every voice or engine. */
export function estimateSpeakDurationMs(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const words = trimmed.split(/\s+/).length;
  const chars = trimmed.length;
  const byWords = (words / 2.4) * 1000;
  const byChars = (chars / 12) * 1000;
  const pauseMs = (trimmed.match(/[.,!?;:]/g)?.length ?? 0) * 200;
  return Math.max(1000, (byWords + byChars) / 2 + pauseMs);
}

export function tokenizeSpeakWords(text: string): SpeakWord[] {
  const words: SpeakWord[] = [];
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    words.push({ text: match[0], start: match.index });
  }
  return words;
}

export function clampWordIndex(index: number, wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.min(wordCount - 1, Math.max(0, index));
}

export function speakTextFromWordIndex(text: string, words: SpeakWord[], wordIndex: number): string {
  if (!text.trim() || words.length === 0) return text.trim();
  const idx = clampWordIndex(wordIndex, words.length);
  if (idx === 0) return text.trim();
  return text.slice(words[idx]!.start).trim();
}

export function wordIndexFromSlider(value: number, wordCount: number): number {
  if (wordCount <= 1) return 0;
  return Math.round((value / 100) * (wordCount - 1));
}

export function sliderValueFromWordIndex(wordIndex: number, wordCount: number): number {
  if (wordCount <= 1) return 0;
  return Math.round((wordIndex / (wordCount - 1)) * 100);
}

/** Per-word weights tuned for English TTS pacing (chars + punctuation pauses). */
export function buildWordDurationWeights(words: SpeakWord[]): number[] {
  return words.map((word) => {
    let weight = Math.max(0.35, word.text.length / 5.5);
    if (/[.!?;:…]$/.test(word.text)) weight += 0.5;
    else if (/[,]$/.test(word.text)) weight += 0.25;
    else if (/[—–-]$/.test(word.text)) weight += 0.15;
    return weight;
  });
}

export function wordIndexFromProgress(
  progress: number,
  weights: number[],
  startWordIndex: number,
): number {
  const slice = weights.slice(startWordIndex);
  if (slice.length === 0) return startWordIndex;
  const clamped = Math.min(1, Math.max(0, progress));
  const total = slice.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return startWordIndex;

  let remaining = clamped * total;
  for (let i = 0; i < slice.length; i++) {
    remaining -= slice[i]!;
    if (remaining <= 0) return startWordIndex + i;
  }
  return startWordIndex + slice.length - 1;
}

export function estimateMsAtWordIndex(
  weights: number[],
  wordIndex: number,
  totalEstimatedMs: number,
): number {
  if (weights.length === 0 || totalEstimatedMs <= 0) return 0;
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) return 0;
  const clamped = clampWordIndex(wordIndex, weights.length);
  const weightBefore = weights.slice(0, clamped).reduce((sum, weight) => sum + weight, 0);
  return (weightBefore / totalWeight) * totalEstimatedMs;
}

export function wordIndexFromMs(ms: number, weights: number[], totalEstimatedMs: number): number {
  if (weights.length === 0 || totalEstimatedMs <= 0) return 0;
  const progress = Math.min(1, Math.max(0, ms / totalEstimatedMs));
  return wordIndexFromProgress(progress, weights, 0);
}

/** Map a Web Speech boundary char index to a word index. */
export function wordIndexFromCharIndex(charIndex: number, words: SpeakWord[]): number {
  if (words.length === 0) return 0;
  for (let i = words.length - 1; i >= 0; i--) {
    if (charIndex >= words[i]!.start) return i;
  }
  return 0;
}

export function buildSpeakLayout(rawText: string): SpeakLayout {
  const trimmed = rawText.trim();
  const spokenText = prepareTextForSpeech(trimmed);
  const words = tokenizeSpeakWords(spokenText);
  const weights = buildWordDurationWeights(words);
  const estimatedMs = estimateSpeakDurationMs(spokenText);
  return { rawText: trimmed, spokenText, words, weights, estimatedMs };
}

/** Title + body for clips that use a separate title field. */
export function clipSpeakRawText(clip: {
  title: string;
  text: string;
  noTitle: boolean;
}): string {
  const body = clip.text.trim();
  if (clip.noTitle || !clip.title.trim()) return body;
  if (!body) return clip.title.trim();
  return `${clip.title.trim()}\n${body}`;
}

export type SpeakWordSyncInput = {
  pocketBackend: boolean;
  /** Ms of Pocket audio heard so far; null when not speaking yet. */
  pocketPlayedMs: number | null;
  boundaryCharIndex: number | null;
  /** Wall-clock fallback progress for Web Speech (0–1). */
  timeProgress: number;
  wallElapsedMs: number;
  estimatedMs: number;
  words: SpeakWord[];
  weights: number[];
  startWordIndex: number;
  lastProgress: number;
};

export type SpeakWordSyncResult = {
  wordIndex: number;
  elapsedMs: number;
  progress: number;
};

/** Map one animation-frame of playback telemetry to highlight position. */
export function resolveSpeakWordSyncFrame(input: SpeakWordSyncInput): SpeakWordSyncResult {
  const {
    pocketBackend,
    pocketPlayedMs,
    boundaryCharIndex,
    timeProgress,
    wallElapsedMs,
    estimatedMs,
    words,
    weights,
    startWordIndex,
    lastProgress,
  } = input;

  if (pocketBackend) {
    // Map heard audio time to the text estimate — not played/submitted ratio,
    // which hits 100% after the first streamed chunk and races the highlight ahead.
    if (pocketPlayedMs != null && pocketPlayedMs > 0 && estimatedMs > 0) {
      const progress = Math.max(lastProgress, Math.min(1, pocketPlayedMs / estimatedMs));
      return {
        progress,
        elapsedMs: pocketPlayedMs,
        wordIndex: wordIndexFromProgress(progress, weights, startWordIndex),
      };
    }
    return {
      progress: lastProgress,
      elapsedMs: 0,
      wordIndex: startWordIndex,
    };
  }

  if (boundaryCharIndex != null && words.length > 0) {
    const anchorStart = words[startWordIndex]?.start ?? 0;
    return {
      progress: lastProgress,
      elapsedMs: wallElapsedMs,
      wordIndex: wordIndexFromCharIndex(anchorStart + boundaryCharIndex, words),
    };
  }

  const progress = Math.max(lastProgress, timeProgress);
  return {
    progress,
    elapsedMs: wallElapsedMs,
    wordIndex: wordIndexFromProgress(progress, weights, startWordIndex),
  };
}
