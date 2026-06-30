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

export type PocketWordAnchor = { ms: number; charOffset: number; wordOffset: number };

export type SpeakWordSyncInput = {
  pocketBackend: boolean;
  /** Ms of Pocket audio heard so far; null when not speaking yet. */
  pocketPlayedMs: number | null;
  /** Real audio→text anchors from Pocket TTS; null when unavailable. */
  pocketWordAnchors: PocketWordAnchor[] | null;
  /** Total ms of the utterance once finalized; null while streaming. */
  pocketTotalMs: number | null;
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

function estimateMsForWordRange(
  weights: number[],
  wordStart: number,
  wordEnd: number,
  totalEstimatedMs: number,
  anchorWordIndex: number,
): number {
  const slice = weights.slice(anchorWordIndex);
  const rangeSlice = weights.slice(wordStart, wordEnd);
  const totalWeight = slice.reduce((sum, weight) => sum + weight, 0);
  const rangeWeight = rangeSlice.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0 || rangeWeight <= 0) return 1000;
  return (rangeWeight / totalWeight) * totalEstimatedMs;
}

function progressFromWordIndex(
  wordIndex: number,
  weights: number[],
  startWordIndex: number,
): number {
  const slice = weights.slice(startWordIndex);
  if (slice.length === 0) return 0;
  const total = slice.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return 0;
  const clamped = clampWordIndex(wordIndex, weights.length);
  const weightBefore = weights
    .slice(startWordIndex, clamped)
    .reduce((sum, weight) => sum + weight, 0);
  return Math.min(1, weightBefore / total);
}

function wordIndexFromUtteranceCharOffset(
  charOffset: number,
  words: SpeakWord[],
  startWordIndex: number,
): number {
  const anchorStart = words[startWordIndex]?.start ?? 0;
  return wordIndexFromCharIndex(anchorStart + charOffset, words);
}

function absoluteWordIndexFromAnchor(
  anchor: PocketWordAnchor,
  words: SpeakWord[],
  startWordIndex: number,
): number {
  if (words.length === 0) return startWordIndex;
  return clampWordIndex(
    wordIndexFromUtteranceCharOffset(anchor.charOffset, words, startWordIndex),
    words.length,
  );
}

/** Map heard audio time to a word index using per-sentence/clause anchors. */
export function wordIndexFromPocketAnchors(
  playedMs: number,
  anchors: PocketWordAnchor[],
  weights: number[],
  words: SpeakWord[],
  startWordIndex: number,
  estimatedMs: number,
  totalMs: number | null,
): number {
  if (anchors.length === 0 || words.length === 0) return startWordIndex;

  let segmentIdx = 0;
  for (let i = anchors.length - 1; i >= 0; i--) {
    if (playedMs >= anchors[i]!.ms) {
      segmentIdx = i;
      break;
    }
  }

  const segmentStartMs = anchors[segmentIdx]!.ms;
  const nextAnchor = anchors[segmentIdx + 1];
  const absWordStart = absoluteWordIndexFromAnchor(anchors[segmentIdx]!, words, startWordIndex);
  const absWordEnd = nextAnchor
    ? absoluteWordIndexFromAnchor(nextAnchor, words, startWordIndex)
    : words.length;

  if (playedMs <= segmentStartMs || absWordStart >= absWordEnd) {
    return clampWordIndex(absWordStart, words.length);
  }

  const estimatedSegmentMs = estimateMsForWordRange(
    weights,
    absWordStart,
    absWordEnd,
    estimatedMs,
    startWordIndex,
  );
  const segmentEndMs = nextAnchor
    ? nextAnchor.ms
    : totalMs != null && totalMs > segmentStartMs
      ? totalMs
      : segmentStartMs +
        Math.max(estimatedSegmentMs, playedMs - segmentStartMs + 50);

  const segmentDuration = Math.max(1, segmentEndMs - segmentStartMs);
  const localProgress = Math.min(1, Math.max(0, (playedMs - segmentStartMs) / segmentDuration));

  const segmentWeights = weights.slice(absWordStart, absWordEnd);
  if (segmentWeights.length === 0) return clampWordIndex(absWordStart, words.length);

  const total = segmentWeights.reduce((sum, weight) => sum + weight, 0);
  let remaining = localProgress * total;
  for (let i = 0; i < segmentWeights.length; i++) {
    remaining -= segmentWeights[i]!;
    if (remaining <= 0) return absWordStart + i;
  }
  return clampWordIndex(absWordEnd - 1, words.length);
}

/** Map one animation-frame of playback telemetry to highlight position. */
export function resolveSpeakWordSyncFrame(input: SpeakWordSyncInput): SpeakWordSyncResult {
  const {
    pocketBackend,
    pocketPlayedMs,
    pocketWordAnchors,
    pocketTotalMs,
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
    // Prefer real per-sentence anchors; fall back to heard-ms / estimate ratio.
    if (pocketPlayedMs != null && pocketPlayedMs > 0) {
      if (pocketWordAnchors && pocketWordAnchors.length > 0) {
        const wordIndex = wordIndexFromPocketAnchors(
          pocketPlayedMs,
          pocketWordAnchors,
          weights,
          words,
          startWordIndex,
          estimatedMs,
          pocketTotalMs,
        );
        const progress = Math.max(
          lastProgress,
          progressFromWordIndex(wordIndex, weights, startWordIndex),
        );
        return {
          progress,
          elapsedMs: pocketPlayedMs,
          wordIndex,
        };
      }
      if (estimatedMs > 0) {
        const progress = Math.max(lastProgress, Math.min(1, pocketPlayedMs / estimatedMs));
        return {
          progress,
          elapsedMs: pocketPlayedMs,
          wordIndex: wordIndexFromProgress(progress, weights, startWordIndex),
        };
      }
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
