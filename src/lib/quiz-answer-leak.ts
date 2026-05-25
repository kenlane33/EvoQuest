import type { KnowledgeUnit, QuizTemplate } from '@/types';

/** Strip accents and punctuation for answer-in-text checks. */
export function normalizeAnswerToken(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]/g, '');
}

export function getQuizAcceptableAnswers(quiz: QuizTemplate): string[] {
  const data = quiz.data as Record<string, unknown>;
  const inner = data.question;
  if (inner && typeof inner === 'object') {
    const q = inner as {
      kind?: string;
      acceptable?: string[];
      options?: string[];
      correctIndex?: number;
    };
    if (q.kind === 'fill' && Array.isArray(q.acceptable)) {
      return q.acceptable.filter((a) => typeof a === 'string' && a.trim());
    }
    if (
      q.kind === 'multiple-choice' &&
      Array.isArray(q.options) &&
      typeof q.correctIndex === 'number'
    ) {
      const pick = q.options[q.correctIndex];
      return typeof pick === 'string' && pick.trim() ? [pick.trim()] : [];
    }
  }
  if (Array.isArray(data.acceptable)) {
    return (data.acceptable as string[]).filter((a) => typeof a === 'string' && a.trim());
  }
  if (typeof data.targetTerm === 'string' && data.targetTerm.trim()) {
    return [data.targetTerm.trim()];
  }
  return [];
}

/** True when visible text substantially reveals a quiz answer. */
export function textLeaksAnswer(text: string, acceptableAnswers: string[]): boolean {
  const normText = normalizeAnswerToken(text);
  if (!normText || acceptableAnswers.length === 0) return false;

  for (const answer of acceptableAnswers) {
    const normAnswer = normalizeAnswerToken(answer);
    if (normAnswer.length < 3) continue;

    if (normText.includes(normAnswer) || normAnswer.includes(normText)) {
      return true;
    }

    const shorter = normText.length <= normAnswer.length ? normText : normAnswer;
    const longer = normText.length > normAnswer.length ? normText : normAnswer;
    if (shorter.length >= 4 && longer.startsWith(shorter)) {
      return true;
    }
  }

  return false;
}

/** Play-screen heading that does not give away the answer. */
export function getSafePlayHeading(unit: KnowledgeUnit, acceptableAnswers: string[]): string {
  if (!textLeaksAnswer(unit.shortLabel, acceptableAnswers)) {
    return unit.shortLabel;
  }
  if (unit.teach.headline && !textLeaksAnswer(unit.teach.headline, acceptableAnswers)) {
    return unit.teach.headline;
  }
  if (!textLeaksAnswer(unit.longLabel, acceptableAnswers)) {
    return unit.longLabel;
  }
  return unit.teach.headline || unit.longLabel || unit.shortLabel;
}

export function shouldShowPlayEtymology(
  root: string,
  acceptableAnswers: string[],
  answered: boolean,
): boolean {
  if (answered) return true;
  return !textLeaksAnswer(root, acceptableAnswers);
}
