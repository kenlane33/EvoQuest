'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildSpeakLayout,
  clampWordIndex,
  estimateMsAtWordIndex,
  sliderValueFromWordIndex,
  speakTextFromWordIndex,
  wordIndexFromMs,
  wordIndexFromSlider,
  type SpeakLayout,
} from '../engine/speak-word-sync';
import { usePocketTts, type PocketTtsStatus } from './use-pocket-tts';
import { useReadAloudBootstrap } from './use-read-aloud-bootstrap';
import { useSpeakWordProgress } from './use-speak-word-progress';

/** Idle time after the last seek before (re)starting audio. */
const SEEK_COMMIT_DELAY_MS = 200;

export type UseReadAloudPlayerOptions = {
  /** Raw text to speak (will be normalized via buildSpeakLayout). */
  text: string;
  voice: string;
  volume?: number;
  /** When false, skips model bootstrap. */
  enabled?: boolean;
  /** Reset playback when this key changes (e.g. selected clip id). */
  resetKey?: string | number | null;
};

export type UseReadAloudPlayerResult = {
  speakLayout: SpeakLayout;
  status: PocketTtsStatus;
  error: string | null;
  bootstrap: ReturnType<typeof useReadAloudBootstrap>;
  canPlay: boolean;
  isActive: boolean;
  playbackLocked: boolean;
  voiceLoading: boolean;
  displayWordIndex: number;
  sliderPct: number;
  wordCount: number;
  elapsedMs: number;
  estimatedMs: number;
  playbackMs: number;
  canRestart: boolean;
  spokenTextDiffers: boolean;
  speak: ReturnType<typeof usePocketTts>['speak'];
  stop: ReturnType<typeof usePocketTts>['stop'];
  handlePlaybackToggle: () => void;
  handleRestart: () => void;
  handleWordClick: (wordIndex: number) => void;
  handleSliderPointerDown: () => void;
  handleSliderChange: (value: number) => void;
  finishScrub: () => void;
  seekBySeconds: (deltaSec: number) => void;
  cancelPendingSeek: () => void;
};

export function useReadAloudPlayer({
  text,
  voice,
  volume = 0.6,
  enabled = true,
  resetKey,
}: UseReadAloudPlayerOptions): UseReadAloudPlayerResult {
  const bootstrap = useReadAloudBootstrap(enabled, voice);
  const { status, error, speak, stop } = usePocketTts({ voice, volume });

  const [cursorWordIndex, setCursorWordIndex] = useState(0);
  const [playbackAnchorWordIndex, setPlaybackAnchorWordIndex] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const scrubRef = useRef(false);
  const scrubWordRef = useRef(0);
  const wasPlayingBeforeScrubRef = useRef(false);
  const seekTimerRef = useRef<number | null>(null);
  const pendingTargetWordRef = useRef<number | null>(null);

  const speakLayout = useMemo(() => buildSpeakLayout(text), [text]);
  const { spokenText, words: speakWords, weights: speakWeights, estimatedMs: fullEstimatedMs } =
    speakLayout;
  const wordCount = speakWords.length;

  const { elapsedMs, estimatedMs, estWordIndex } = useSpeakWordProgress(
    spokenText,
    speakWords,
    status,
    playbackAnchorWordIndex,
  );

  const canPlay = Boolean(spokenText);
  const isActive = status === 'loading' || status === 'playing';
  const modelBootstrapping = bootstrap.status === 'loading';
  const modelReady = bootstrap.status === 'ready';
  const playbackLocked = modelBootstrapping || !modelReady;
  const displayWordIndex =
    status === 'playing' && !isScrubbing ? estWordIndex : cursorWordIndex;
  const sliderPct = sliderValueFromWordIndex(displayWordIndex, wordCount);
  const voiceLoading =
    (modelBootstrapping || (status === 'loading' && !isScrubbing)) && !isScrubbing;
  const spokenTextDiffers = speakLayout.spokenText !== speakLayout.rawText;

  const cancelPendingSeek = useCallback(() => {
    if (seekTimerRef.current != null) {
      window.clearTimeout(seekTimerRef.current);
      seekTimerRef.current = null;
    }
    pendingTargetWordRef.current = null;
  }, []);

  useEffect(() => {
    cancelPendingSeek();
    setCursorWordIndex(0);
    setPlaybackAnchorWordIndex(0);
    setIsScrubbing(false);
    scrubRef.current = false;
    scrubWordRef.current = 0;
  }, [cancelPendingSeek, resetKey]);

  useEffect(() => {
    return () => {
      if (seekTimerRef.current != null) {
        window.clearTimeout(seekTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setCursorWordIndex((index) => clampWordIndex(index, wordCount));
  }, [wordCount]);

  useEffect(() => {
    if (status === 'playing' && !isScrubbing) {
      setCursorWordIndex(estWordIndex);
    }
  }, [estWordIndex, isScrubbing, status]);

  const seekToWord = useCallback(
    (wordIndex: number) => {
      const clamped = clampWordIndex(wordIndex, wordCount);
      setPlaybackAnchorWordIndex(clamped);
      setCursorWordIndex(clamped);
    },
    [wordCount],
  );

  const speakFromWord = useCallback(
    (wordIndex: number) => {
      if (playbackLocked) return;
      const clamped = clampWordIndex(wordIndex, wordCount);
      const speakText = speakTextFromWordIndex(spokenText, speakWords, clamped);
      if (!speakText) return;
      if (isActive) stop();
      seekToWord(clamped);
      void speak(speakText);
    },
    [isActive, playbackLocked, seekToWord, speak, spokenText, speakWords, stop, wordCount],
  );

  const scheduleResume = useCallback(
    (wordIndex: number) => {
      pendingTargetWordRef.current = wordIndex;
      if (seekTimerRef.current != null) {
        window.clearTimeout(seekTimerRef.current);
      }
      seekTimerRef.current = window.setTimeout(() => {
        const target = pendingTargetWordRef.current;
        seekTimerRef.current = null;
        pendingTargetWordRef.current = null;
        if (target != null) {
          speakFromWord(target);
        }
      }, SEEK_COMMIT_DELAY_MS);
    },
    [speakFromWord],
  );

  const handleSliderPointerDown = useCallback(() => {
    if (!canPlay || wordCount === 0) return;
    cancelPendingSeek();
    wasPlayingBeforeScrubRef.current = isActive;
    scrubRef.current = true;
    scrubWordRef.current = cursorWordIndex;
    setIsScrubbing(true);
    if (isActive) stop();
  }, [cancelPendingSeek, canPlay, cursorWordIndex, isActive, stop, wordCount]);

  const handleSliderChange = useCallback(
    (value: number) => {
      if (!canPlay || wordCount === 0) return;
      const index = wordIndexFromSlider(value, wordCount);
      scrubWordRef.current = index;
      setCursorWordIndex(index);
      setPlaybackAnchorWordIndex(index);
    },
    [canPlay, wordCount],
  );

  const finishScrub = useCallback(() => {
    if (!scrubRef.current || !canPlay || wordCount === 0) return;
    scrubRef.current = false;
    setIsScrubbing(false);
    const index = scrubWordRef.current;
    seekToWord(index);
    if (wasPlayingBeforeScrubRef.current) {
      scheduleResume(index);
    }
  }, [canPlay, scheduleResume, seekToWord, wordCount]);

  const handlePlaybackToggle = useCallback(() => {
    if (playbackLocked && !isActive) return;
    if (isActive) {
      cancelPendingSeek();
      stop();
      return;
    }
    speakFromWord(cursorWordIndex);
  }, [cancelPendingSeek, cursorWordIndex, isActive, playbackLocked, speakFromWord, stop]);

  const playbackMs = useMemo(() => {
    if (status === 'playing') {
      return (
        estimateMsAtWordIndex(speakWeights, playbackAnchorWordIndex, fullEstimatedMs) + elapsedMs
      );
    }
    return estimateMsAtWordIndex(speakWeights, displayWordIndex, fullEstimatedMs);
  }, [
    displayWordIndex,
    elapsedMs,
    fullEstimatedMs,
    playbackAnchorWordIndex,
    speakWeights,
    status,
  ]);

  const canRestart =
    displayWordIndex > 0 || playbackAnchorWordIndex > 0 || elapsedMs > 0;

  const commitSeek = useCallback(
    (wordIndex: number) => {
      if (!canPlay || wordCount === 0 || playbackLocked) return;
      const clamped = clampWordIndex(wordIndex, wordCount);
      seekToWord(clamped);
      if (isActive || pendingTargetWordRef.current != null) {
        scheduleResume(clamped);
      }
    },
    [canPlay, isActive, playbackLocked, scheduleResume, seekToWord, wordCount],
  );

  const seekBySeconds = useCallback(
    (deltaSec: number) => {
      if (!canPlay || wordCount === 0) return;
      const baseMs =
        pendingTargetWordRef.current != null
          ? estimateMsAtWordIndex(speakWeights, pendingTargetWordRef.current, fullEstimatedMs)
          : playbackMs;
      const targetMs = Math.max(0, Math.min(fullEstimatedMs, baseMs + deltaSec * 1000));
      commitSeek(wordIndexFromMs(targetMs, speakWeights, fullEstimatedMs));
    },
    [canPlay, commitSeek, fullEstimatedMs, playbackMs, speakWeights, wordCount],
  );

  const handleWordClick = useCallback(
    (wordIndex: number) => {
      commitSeek(wordIndex);
    },
    [commitSeek],
  );

  const handleRestart = useCallback(() => {
    cancelPendingSeek();
    if (isActive) stop();
    seekToWord(0);
  }, [cancelPendingSeek, isActive, seekToWord, stop]);

  return {
    speakLayout,
    status,
    error,
    bootstrap,
    canPlay,
    isActive,
    playbackLocked,
    voiceLoading,
    displayWordIndex,
    sliderPct,
    wordCount,
    elapsedMs,
    estimatedMs,
    playbackMs,
    canRestart,
    spokenTextDiffers,
    speak,
    stop,
    handlePlaybackToggle,
    handleRestart,
    handleWordClick,
    handleSliderPointerDown,
    handleSliderChange,
    finishScrub,
    seekBySeconds,
    cancelPendingSeek,
  };
}
