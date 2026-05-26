import { getUnitById } from '@/content/catalog';
import type { UnitProgress } from '@/types';

export type TileProgressSummary = {
  attempts: number;
  correct: number;
  quizCount: number;
  quizzesTried: number;
  tier: UnitProgress['tier'] | 'locked';
  started: boolean;
  mastered: boolean;
};

function quizzesSeen(progress: UnitProgress | undefined, quizCount: number): number {
  const encountered = progress?.templatesEncountered ?? [];
  const quizIds = encountered.filter((id) => id.startsWith('quiz.'));
  if (quizIds.length > 0) {
    return Math.min(quizIds.length, quizCount);
  }
  // Legacy progress tracked template kinds, not individual quiz ids.
  return Math.min(progress?.attempts ?? 0, quizCount);
}

export function summarizeTileProgress(
  unitId: string,
  progress?: UnitProgress,
): TileProgressSummary {
  const quizCount = getUnitById(unitId)?.quizzes.length ?? 0;
  const attempts = progress?.attempts ?? 0;
  const correct = progress?.correct ?? 0;
  const tier = progress?.tier ?? 'locked';

  return {
    attempts,
    correct,
    quizCount,
    quizzesTried: quizzesSeen(progress, quizCount),
    tier,
    started: attempts > 0,
    mastered: tier === 'bronze' || tier === 'silver' || tier === 'gold',
  };
}

export type SubgroupProgressSummary = {
  topics: number;
  topicsStarted: number;
  topicsMastered: number;
  totalCorrect: number;
  totalAttempts: number;
  totalQuizCount: number;
  totalQuizzesTried: number;
};

export function summarizeSubgroupProgress(
  unitIds: string[],
  unitProgress: Record<string, UnitProgress>,
): SubgroupProgressSummary {
  const summaries = unitIds.map((id) => summarizeTileProgress(id, unitProgress[id]));
  return {
    topics: unitIds.length,
    topicsStarted: summaries.filter((s) => s.started).length,
    topicsMastered: summaries.filter((s) => s.mastered).length,
    totalCorrect: summaries.reduce((sum, s) => sum + s.correct, 0),
    totalAttempts: summaries.reduce((sum, s) => sum + s.attempts, 0),
    totalQuizCount: summaries.reduce((sum, s) => sum + s.quizCount, 0),
    totalQuizzesTried: summaries.reduce((sum, s) => sum + s.quizzesTried, 0),
  };
}

export function tierRingClass(tier: TileProgressSummary['tier']): string {
  switch (tier) {
    case 'gold':
      return 'ring-[3px] ring-[#e8c547]';
    case 'silver':
      return 'ring-2 ring-[#b8c4ce]';
    case 'bronze':
      return 'ring-2 ring-[#c68642]';
    case 'unlocked':
      return 'ring-1 ring-[color-mix(in_oklab,var(--wing-primary)_55%,transparent)]';
    default:
      return '';
  }
}
