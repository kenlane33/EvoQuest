'use client';

import { useEffect } from 'react';
import { getQuizReadText } from '@/audio/quiz-read-text';
import { preloadReadAloudText } from '@/tts';
import { isTextEntryFocused } from '@/lib/text-entry-focus';
import { useAppStore } from '@/store/app-store';
import type { KnowledgeUnit, QuizTemplate } from '@/types';

export type QuestionReadBundle = {
  question: string;
  label: string;
  root: string;
  mnemonic?: string;
  hint?: string;
};

type PreloadSource = {
  bundle: QuestionReadBundle | null;
  /** Wait until speech is likely finished before preloading. */
  delayMs?: number;
};

function mnemonicReadText(mnemonic: string): string {
  return `Remember: ${mnemonic}`;
}

/** Lazily preload TTS for the next question while the player works on the current one. */
export function useQuestionTtsPreload({ bundle, delayMs = 1200 }: PreloadSource) {
  const reading = useAppStore((s) => s.settings.reading);
  const voice = reading.voice;

  useEffect(() => {
    if (!reading.enabled || !bundle?.question.trim()) return;

    const run = () => {
      if (isTextEntryFocused()) return;

      preloadReadAloudText(bundle.question, voice);

      const secondary = [bundle.label, bundle.root];
      if (bundle.mnemonic) secondary.push(mnemonicReadText(bundle.mnemonic));
      if (bundle.hint) secondary.push(bundle.hint);

      const scheduleSecondary = () => {
        if (isTextEntryFocused()) return;
        for (const text of secondary) {
          preloadReadAloudText(text, voice);
        }
      };

      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(scheduleSecondary, { timeout: 4000 });
      } else {
        setTimeout(scheduleSecondary, 800);
      }
    };

    const timer = window.setTimeout(run, delayMs);
    return () => clearTimeout(timer);
  }, [bundle, delayMs, reading.enabled, voice]);
}

export function buildQuestionReadBundle(
  unit: KnowledgeUnit,
  quiz: QuizTemplate,
  playCtx: { root: string; mnemonic?: string },
): QuestionReadBundle {
  const data = quiz.data as { question?: { hint?: string } };
  const hint =
    data.question && typeof data.question.hint === 'string'
      ? data.question.hint.trim()
      : undefined;

  return {
    question: getQuizReadText(quiz),
    label: unit.shortLabel,
    root: playCtx.root,
    mnemonic: playCtx.mnemonic?.trim() || undefined,
    hint: hint || undefined,
  };
}
