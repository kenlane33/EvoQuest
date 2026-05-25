'use client';

import { useEffect } from 'react';
import { feedbackHeadlineForAttempt } from '@/audio/feedback-phrases';
import {
  buildFeedbackReadBundle,
  feedbackDescReadText,
} from '@/audio/feedback-read-text';
import { preloadPocketTtsText } from '@/audio/pocket-tts-engine';
import { useAppStore } from '@/store/app-store';
import type { KnowledgeUnit } from '@/types';

type PreloadTarget = {
  journeyId: string;
  questionIndex: number;
  currentStreak: number;
  unit: KnowledgeUnit;
  playCtx: { root: string; mnemonic?: string } | null;
} | null;

/** Pre-synthesize feedback slots while the player answers (headline + teach + etymology). */
export function useFeedbackReadPreload(target: PreloadTarget, delayMs = 600) {
  const reading = useAppStore((s) => s.settings.reading);
  const voice = reading.voice;

  useEffect(() => {
    if (!reading.enabled || !target) return;

    const explanation =
      target.unit.teach.poweredIdea ??
      'Keep going — every attempt builds the map.';
    const bodyBundle = buildFeedbackReadBundle('', explanation, target.unit.teach, target.playCtx);
    const desc = feedbackDescReadText(bodyBundle);

    const correct = feedbackHeadlineForAttempt(
      target.journeyId,
      target.questionIndex,
      target.currentStreak,
      true,
      false,
    );
    const wrong = feedbackHeadlineForAttempt(
      target.journeyId,
      target.questionIndex,
      target.currentStreak,
      false,
      false,
    );

    const run = () => {
      preloadPocketTtsText(correct, voice);
      preloadPocketTtsText(wrong, voice);
      preloadPocketTtsText(desc, voice);
      if (bodyBundle.sidebar.trim()) {
        preloadPocketTtsText(bodyBundle.sidebar, voice);
      }
    };

    const timer = window.setTimeout(run, delayMs);
    return () => clearTimeout(timer);
  }, [
    target?.journeyId,
    target?.questionIndex,
    target?.currentStreak,
    target?.unit.id,
    target?.playCtx?.root,
    target?.playCtx?.mnemonic,
    delayMs,
    reading.enabled,
    voice,
  ]);
}
