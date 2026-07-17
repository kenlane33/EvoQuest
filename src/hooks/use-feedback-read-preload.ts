'use client';

import { useEffect } from 'react';
import { immediateFeedbackSpeakText } from '@/audio/feedback-answer-speak';
import {
  buildFeedbackReadBundle,
  feedbackDescReadText,
} from '@/audio/feedback-read-text';
import { preloadReadAloudText } from '@/tts';
import { useAppStore } from '@/store/app-store';
import type { KnowledgeUnit, QuizTemplate } from '@/types';

type PreloadTarget = {
  journeyId: string;
  questionIndex: number;
  currentStreak: number;
  unit: KnowledgeUnit;
  quiz: QuizTemplate;
  playCtx: { root: string; mnemonic?: string } | null;
} | null;

/** Pre-synthesize feedback slots while the player answers (headline + teach). */
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

    const correct = immediateFeedbackSpeakText({
      journeyId: target.journeyId,
      questionIndex: target.questionIndex,
      currentStreak: target.currentStreak,
      correct: true,
      streakIncludesAnswer: false,
      quiz: target.quiz,
    });
    const wrong = immediateFeedbackSpeakText({
      journeyId: target.journeyId,
      questionIndex: target.questionIndex,
      currentStreak: target.currentStreak,
      correct: false,
      streakIncludesAnswer: false,
      quiz: target.quiz,
    });

    const run = () => {
      preloadReadAloudText(correct, voice);
      preloadReadAloudText(wrong, voice);
      preloadReadAloudText(desc, voice);
    };

    const timer = window.setTimeout(run, delayMs);
    return () => clearTimeout(timer);
  }, [
    target?.journeyId,
    target?.questionIndex,
    target?.currentStreak,
    target?.unit.id,
    target?.quiz.id,
    target?.quiz.kind,
    target?.playCtx?.root,
    target?.playCtx?.mnemonic,
    delayMs,
    reading.enabled,
    voice,
  ]);
}
