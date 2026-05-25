import { pickFromPool } from '@/lib/pick-from-pool';

export const WRONG_FEEDBACK_PHRASES = [
  'Not quite.',
  'Oops.',
  'Almost.',
  'Close, but not there.',
  'That missed the mark.',
  'Not this time.',
  'Keep digging.',
  'Worth another look.',
  'The map shifts — try again.',
  'Not the match.',
  'Hmm, not that one.',
  'Off target.',
  'Good effort — wrong turn.',
  'The clue is still hiding.',
  'Not yet.',
  'Swing and a miss.',
  'That path dead-ends.',
  'Recalibrate.',
  'The pieces do not fit.',
  'Wrong branch.',
  'So close you can taste it.',
  'Nope — rethink it.',
  'That answer slips away.',
  'Still searching.',
  'The evidence points elsewhere.',
  'Try the next idea.',
  'Not the right call.',
  'Missed it.',
  'Back to the drawing board.',
  'Almost had it.',
] as const;

export const CORRECT_FEEDBACK_PHRASES = [
  'Locked in!',
  'Yes!',
  'Nailed it.',
  'Exactly.',
  'That is the one.',
  'Spot on.',
  'You got it.',
  'Correct.',
  'Right on.',
  'Perfect.',
  'That clicks.',
  'Solid.',
  'Well done.',
  'There it is.',
  'You mapped it.',
  'Clear hit.',
  'That holds up.',
  'Strong recall.',
  'The idea sticks.',
  'You traced it right.',
  'Bullseye.',
  'That fits.',
  'Memory wins.',
  'Clean answer.',
  'You see the pattern.',
  'That is how it works.',
  'Sharp.',
  'On the money.',
  'You connected it.',
  'Right idea.',
] as const;

export const STREAK_FEEDBACK_PHRASES = [
  '{n} in a row!',
  'On a roll — {n} straight!',
  '{n} streak — keep going!',
  'Fire — {n} correct!',
  '{n} hits without a miss!',
  'You are heating up: {n}.',
  '{n} correct back to back!',
  'Streak at {n}!',
  '{n} and counting!',
  'Unbroken: {n} correct.',
] as const;

export function feedbackPhraseSeed(journeyId: string, questionIndex: number): string {
  return `${journeyId}:${questionIndex}`;
}

/** Headline shown (and spoken) after an answer — stable for a given journey question. */
export function feedbackHeadlineForAttempt(
  journeyId: string,
  questionIndex: number,
  currentStreak: number,
  correct: boolean,
  /** True once the attempt is committed and `currentStreak` already includes this answer. */
  streakIncludesAnswer = false,
): string {
  const seed = feedbackPhraseSeed(journeyId, questionIndex);
  if (correct) {
    const streak = streakIncludesAnswer ? currentStreak : currentStreak + 1;
    return pickCorrectFeedbackPhrase(streak, seed);
  }
  return pickWrongFeedbackPhrase(seed);
}

export function pickWrongFeedbackPhrase(seed: string): string {
  return pickFromPool(WRONG_FEEDBACK_PHRASES, seed);
}

export function pickCorrectFeedbackPhrase(streak: number, seed: string): string {
  if (streak > 2) {
    const template = pickFromPool(STREAK_FEEDBACK_PHRASES, `${seed}:streak`);
    return template.replace('{n}', String(streak));
  }
  return pickFromPool(CORRECT_FEEDBACK_PHRASES, seed);
}

export function feedbackReadAloudText(headline: string, explanation: string): string {
  const parts = [headline.trim(), explanation.trim()].filter((p) => p.length > 0);
  return parts.join('. ');
}
