import { describe, expect, it } from 'vitest';
import {
  summarizeSubgroupProgress,
  summarizeTileProgress,
  tierRingClass,
} from '@/components/achievements/tile-progress';
import type { UnitProgress } from '@/types';

describe('tile progress summaries', () => {
  it('reports locked tile with quiz count', () => {
    const stats = summarizeTileProgress('biochem.enzymes.factors');
    expect(stats.started).toBe(false);
    expect(stats.quizCount).toBeGreaterThan(0);
    expect(stats.tier).toBe('locked');
  });

  it('reports correct and attempts for played units', () => {
    const progress: UnitProgress = {
      unitId: 'biochem.enzymes.factors',
      firstSeenAt: 1,
      attempts: 4,
      correct: 3,
      lastSeenAt: 2,
      lastFiveOutcomes: [],
      templatesEncountered: ['quiz.a', 'quiz.b'],
      quizAttemptCounts: { 'quiz.a': 1, 'quiz.b': 1 },
      tier: 'bronze',
      achievementEarned: false,
    };
    const stats = summarizeTileProgress('biochem.enzymes.factors', progress);
    expect(stats.correct).toBe(3);
    expect(stats.attempts).toBe(4);
    expect(stats.mastered).toBe(true);
    expect(tierRingClass(stats.tier)).toContain('ring-2');
  });

  it('aggregates subgroup progress', () => {
    const summary = summarizeSubgroupProgress(
      ['biochem.macromolecules.four-groups', 'biochem.enzymes.basics'],
      {
        'biochem.macromolecules.four-groups': {
          unitId: 'biochem.macromolecules.four-groups',
          firstSeenAt: 1,
          attempts: 2,
          correct: 2,
          lastSeenAt: 2,
          lastFiveOutcomes: [],
          templatesEncountered: ['a'],
          quizAttemptCounts: { a: 1 },
          tier: 'unlocked',
          achievementEarned: false,
        },
      },
    );
    expect(summary.topics).toBe(2);
    expect(summary.topicsStarted).toBe(1);
    expect(summary.totalCorrect).toBe(2);
    expect(summary.totalAttempts).toBe(2);
    expect(summary.totalQuizCount).toBeGreaterThan(0);
  });
});
