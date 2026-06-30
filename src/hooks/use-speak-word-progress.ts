'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getReadAloudBoundaryCharIndex,
  getReadAloudPlayedMs,
  getReadAloudTotalMs,
  getReadAloudWordAnchors,
} from '@/audio/read-aloud-engine';
import { shouldUsePocketTts } from '@/audio/read-aloud-bootstrap';
import type { SpeakWord } from '@/audio/speak-word-sync';
import {
  buildWordDurationWeights,
  estimateSpeakDurationMs,
  resolveSpeakWordSyncFrame,
  speakTextFromWordIndex,
} from '@/audio/speak-word-sync';
import type { PocketTtsStatus } from '@/audio/use-pocket-tts';

const WARMUP_MS = 350;

export function useSpeakWordProgress(
  spokenText: string,
  words: SpeakWord[],
  status: PocketTtsStatus,
  startWordIndex: number,
) {
  const weights = useMemo(() => buildWordDurationWeights(words), [words]);
  const remainingText = useMemo(
    () => speakTextFromWordIndex(spokenText, words, startWordIndex),
    [spokenText, words, startWordIndex],
  );
  const estimatedMs = useMemo(() => estimateSpeakDurationMs(remainingText), [remainingText]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [estWordIndex, setEstWordIndex] = useState(startWordIndex);
  const startedAtRef = useRef<number | null>(null);
  const lastProgressRef = useRef(0);
  const lastWordIndexRef = useRef(startWordIndex);
  const startWordIndexRef = useRef(startWordIndex);

  useEffect(() => {
    startWordIndexRef.current = startWordIndex;
    lastProgressRef.current = 0;
    lastWordIndexRef.current = startWordIndex;
    setEstWordIndex(startWordIndex);
  }, [startWordIndex]);

  useEffect(() => {
    if (status !== 'playing') {
      startedAtRef.current = null;
      lastProgressRef.current = 0;
      setElapsedMs(0);
      return;
    }

    // Resync on each playback session — scrub rewind can reuse the same anchor index.
    lastProgressRef.current = 0;
    lastWordIndexRef.current = startWordIndex;
    setEstWordIndex(startWordIndex);
    startedAtRef.current = performance.now();
    let raf = 0;

    const tick = () => {
      const startedAt = startedAtRef.current;
      if (startedAt == null) return;

      const elapsed = performance.now() - startedAt;
      const timeProgress =
        elapsed < WARMUP_MS
          ? 0
          : Math.min(1, (elapsed - WARMUP_MS) / Math.max(1, estimatedMs));

      const frame = resolveSpeakWordSyncFrame({
        pocketBackend: shouldUsePocketTts(),
        pocketPlayedMs: getReadAloudPlayedMs(),
        pocketWordAnchors: getReadAloudWordAnchors(),
        pocketTotalMs: getReadAloudTotalMs(),
        boundaryCharIndex: getReadAloudBoundaryCharIndex(),
        timeProgress,
        wallElapsedMs: elapsed,
        estimatedMs,
        words,
        weights,
        startWordIndex: startWordIndexRef.current,
        lastProgress: lastProgressRef.current,
      });

      lastProgressRef.current = frame.progress;
      setElapsedMs(frame.elapsedMs);

      const rawIndex = frame.wordIndex;
      const nextIndex =
        startWordIndexRef.current !== lastWordIndexRef.current
          ? rawIndex
          : Math.max(lastWordIndexRef.current, rawIndex);
      lastWordIndexRef.current = nextIndex;
      setEstWordIndex(nextIndex);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [estimatedMs, spokenText, startWordIndex, status, weights, words]);

  return { elapsedMs, estimatedMs, estWordIndex };
}
