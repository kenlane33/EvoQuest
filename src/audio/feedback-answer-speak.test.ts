import { describe, expect, it } from 'vitest';
import { immediateFeedbackSpeakText } from '@/audio/feedback-answer-speak';
import { feedbackHeadlineForAttempt } from '@/audio/feedback-phrases';
import type { QuizTemplate } from '@/types';

describe('immediateFeedbackSpeakText', () => {
  const base = {
    journeyId: 'journey-a',
    questionIndex: 3,
    currentStreak: 1,
    streakIncludesAnswer: false,
  };

  it('appends the correct answer after a correct headline', () => {
    const quiz = {
      id: 'q1',
      kind: 'fill',
      data: { prompt: 'Powerhouse?', acceptable: ['mitochondria'] },
    } as QuizTemplate;

    const text = immediateFeedbackSpeakText({ ...base, correct: true, quiz });
    const headline = feedbackHeadlineForAttempt(
      base.journeyId,
      base.questionIndex,
      base.currentStreak,
      true,
      false,
    );
    expect(text).toBe(`${headline}. mitochondria`);
  });

  it('uses a wrong-answer preamble before the answer when incorrect', () => {
    const quiz = {
      id: 'q1',
      kind: 'match',
      data: { term: 'ATP', correct: 'Cell energy currency', distractors: ['DNA'] },
    } as QuizTemplate;

    const text = immediateFeedbackSpeakText({ ...base, correct: false, quiz });
    const headline = feedbackHeadlineForAttempt(
      base.journeyId,
      base.questionIndex,
      base.currentStreak,
      false,
      false,
    );
    expect(text.startsWith(`${headline}. `)).toBe(true);
    expect(text).toContain('Cell energy currency');
    expect(text).not.toBe(headline);
  });

  it('uses a kind closure when there is no extractable answer', () => {
    const quiz = {
      id: 'q1',
      kind: 'recipe-sequencer',
      data: { processTitle: 'PCR', steps: ['A', 'B'] },
    } as QuizTemplate;

    const correctText = immediateFeedbackSpeakText({ ...base, correct: true, quiz });
    const wrongText = immediateFeedbackSpeakText({ ...base, correct: false, quiz });

    expect(correctText).toContain('order');
    expect(wrongText).toContain('screen');
  });

  it('matches pending and committed headlines for the same correct fill', () => {
    const quiz = {
      id: 'q1',
      kind: 'fill',
      data: { acceptable: ['allele'] },
    } as QuizTemplate;

    const pending = immediateFeedbackSpeakText({
      journeyId: 'j1',
      questionIndex: 2,
      currentStreak: 1,
      correct: true,
      streakIncludesAnswer: false,
      quiz,
    });
    const committed = immediateFeedbackSpeakText({
      journeyId: 'j1',
      questionIndex: 2,
      currentStreak: 2,
      correct: true,
      streakIncludesAnswer: true,
      quiz,
    });
    expect(pending).toBe(committed);
  });
});
