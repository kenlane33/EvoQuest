import {
  feedbackHeadlineForAttempt,
  feedbackPhraseSeed,
} from '@/audio/feedback-phrases';
import { pickFromPool } from '@/lib/pick-from-pool';
import { getQuizCorrectAnswerDisplay } from '@/lib/quiz-answer-leak';
import type { QuizTemplate } from '@/types';

/** Preambles before the correct answer when the player was wrong. */
export const WRONG_ANSWER_PREAMBLE_PHRASES = [
  'The correct answer is',
  'The answer was',
  "Here's the right answer:",
  'It was',
  'The right choice is',
  'You needed',
  'The match is',
  'Look for',
  'The term is',
  'That would be',
] as const;

/** Spoken closure when a template has no single extractable answer (correct). */
export const CORRECT_KIND_CLOSURE_PHRASES: Partial<
  Record<QuizTemplate['kind'], readonly string[]>
> = {
  'recipe-sequencer': [
    'That was the right order.',
    'Your sequence is correct.',
    'Perfect ordering.',
    'Those steps are in the right order.',
  ],
  'procedure-builder': [
    'That procedure is correct.',
    'Your block order works.',
    'The procedure checks out.',
  ],
  'food-web-builder': [
    'That web is correct.',
    'Your energy arrows match.',
    'The food web holds together.',
  ],
  'concept-map-builder': [
    'Your map matches the model.',
    'Those connections are right.',
    'The concept map checks out.',
  ],
  'cladogram-crafter': [
    'That tree fits the traits.',
    'Your cladogram is correct.',
    'Good parsimony on that tree.',
  ],
  'punnett-builder': [
    'That Punnett square is correct.',
    'Your grid matches the cross.',
    'The phenotypes line up.',
  ],
  'counterfactual-lab': [
    'That causal chain is right.',
    'Your sequence of consequences fits.',
    'The counterfactual holds.',
  ],
  'debug-the-claim': [
    'You found the right bug.',
    'That mistake type is correct.',
    'You spotted the conceptual error.',
  ],
  'mutation-lab': [
    'That mutation call is correct.',
    'Your prediction matches the outcome.',
  ],
  'pedigree-detective': [
    'That inheritance pattern fits.',
    'Your hypothesis matches the pedigree.',
  ],
  'microworld-sandbox': [
    'You hit the goal.',
    'Those parameters reach the target.',
    'The simulation goal is met.',
  ],
  'be-the-turtle': [
    'Strong choices through the scenario.',
    'You navigated that path well.',
  ],
  'predict-run-reflect': [
    'Your prediction matched the outcome.',
    'You called it correctly.',
  ],
  'palace-walk': [
    'You mapped the room correctly.',
    'That memory palace path works.',
  ],
};

/** Spoken hint when wrong and there is no short answer string to read. */
export const WRONG_KIND_CLOSURE_PHRASES: Partial<
  Record<QuizTemplate['kind'], readonly string[]>
> = {
  'recipe-sequencer': [
    'Check the canonical step order on the next screen.',
    'The right sequence is on the feedback screen.',
  ],
  'procedure-builder': [
    'Review the correct block order on the next screen.',
  ],
  'food-web-builder': [
    'Compare your web to the model on the next screen.',
  ],
  'concept-map-builder': [
    'See how your map differs on the next screen.',
  ],
  'cladogram-crafter': [
    'Review the trait tree on the next screen.',
  ],
  'punnett-builder': [
    'Check the grid solution on the next screen.',
  ],
  'counterfactual-lab': [
    'Review the causal chain on the next screen.',
  ],
  'debug-the-claim': [
    'See which claim failed on the next screen.',
  ],
  'mutation-lab': [
    'Review the mutation outcome on the next screen.',
  ],
  'pedigree-detective': [
    'Review the pattern that fits on the next screen.',
  ],
  'microworld-sandbox': [
    'Tune toward the goal shown on the next screen.',
  ],
  'be-the-turtle': [
    'Replay the better path on the next screen.',
  ],
  'predict-run-reflect': [
    'Compare your prediction to the run on the next screen.',
  ],
  'palace-walk': [
    'Revisit the room clues on the next screen.',
  ],
};

function joinSpeakParts(...parts: (string | undefined | null)[]): string {
  return parts
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .map((p) => p.trim())
    .join('. ');
}

export function pickWrongAnswerPreamble(seed: string): string {
  return pickFromPool(WRONG_ANSWER_PREAMBLE_PHRASES, `${seed}:wrong-answer`);
}

function pickKindClosure(
  pool: Partial<Record<QuizTemplate['kind'], readonly string[]>>,
  kind: QuizTemplate['kind'],
  seed: string,
): string | null {
  const phrases = pool[kind];
  if (!phrases?.length) return null;
  return pickFromPool(phrases, `${seed}:kind-closure`);
}

export type ImmediateFeedbackSpeakInput = {
  journeyId: string;
  questionIndex: number;
  currentStreak: number;
  correct: boolean;
  /** True once the attempt is committed and `currentStreak` already includes this answer. */
  streakIncludesAnswer?: boolean;
  quiz: QuizTemplate;
};

/**
 * Full text spoken right after the player answers: reaction headline, then either
 * the correct answer or a template-specific closure phrase.
 */
export function immediateFeedbackSpeakText(input: ImmediateFeedbackSpeakInput): string {
  const {
    journeyId,
    questionIndex,
    currentStreak,
    correct,
    streakIncludesAnswer = false,
    quiz,
  } = input;

  const seed = feedbackPhraseSeed(journeyId, questionIndex);
  const headline = feedbackHeadlineForAttempt(
    journeyId,
    questionIndex,
    currentStreak,
    correct,
    streakIncludesAnswer,
  );

  const answer = getQuizCorrectAnswerDisplay(quiz);
  if (answer) {
    if (correct) {
      return joinSpeakParts(headline, answer);
    }
    const preamble = pickWrongAnswerPreamble(seed);
    return joinSpeakParts(headline, `${preamble} ${answer}`);
  }

  const kindPool = correct ? CORRECT_KIND_CLOSURE_PHRASES : WRONG_KIND_CLOSURE_PHRASES;
  const closure = pickKindClosure(kindPool, quiz.kind, seed);
  if (closure) {
    return joinSpeakParts(headline, closure);
  }

  return headline;
}
