import { describe, expect, it } from 'vitest';
import { CONTENT_MODULES } from '@/content';
import { collectEnabledUnits } from '@/engine/selection';
import { computeMasteryOverview } from '@/engine/progress/coverage';
import type { UnitProgress } from '@/types';

function seedAllQuizzesOnce(): Record<string, UnitProgress> {
  const units = collectEnabledUnits(
    { modules: CONTENT_MODULES },
    { units: {}, disabledUnitIds: [] },
  );
  const progress: Record<string, UnitProgress> = {};
  const now = Date.now();
  for (const unit of units.slice(0, 3)) {
    const quizAttemptCounts: Record<string, number> = {};
    for (const q of unit.quizzes) {
      quizAttemptCounts[q.id] = 1;
    }
    progress[unit.id] = {
      unitId: unit.id,
      firstSeenAt: now,
      attempts: unit.quizzes.length,
      correct: unit.quizzes.length,
      lastSeenAt: now,
      lastFiveOutcomes: [],
      templatesEncountered: unit.quizzes.map((q) => q.id),
      quizAttemptCounts,
      tier: 'bronze',
      achievementEarned: false,
    };
  }
  return progress;
}

describe('computeMasteryOverview', () => {
  it('returns zero laps with no progress', () => {
    const overview = computeMasteryOverview({});
    expect(overview.laps).toBe(0);
    expect(overview.totalQuizzes).toBeGreaterThan(0);
    expect(overview.nextLapPct).toBe(0);
  });

  it('returns zero laps when only some quizzes are seen', () => {
    const units = collectEnabledUnits(
      { modules: CONTENT_MODULES },
      { units: {}, disabledUnitIds: [] },
    );
    const unit = units[0];
    const quiz = unit.quizzes[0];
    const progress: Record<string, UnitProgress> = {
      [unit.id]: {
        unitId: unit.id,
        firstSeenAt: 1,
        attempts: 1,
        correct: 1,
        lastSeenAt: 2,
        lastFiveOutcomes: [],
        templatesEncountered: [quiz.id],
        quizAttemptCounts: { [quiz.id]: 1 },
        tier: 'unlocked',
        achievementEarned: false,
      },
    };
    expect(computeMasteryOverview(progress).laps).toBe(0);
  });

  it('counts one lap when every quiz has been answered at least once', () => {
    const units = collectEnabledUnits(
      { modules: CONTENT_MODULES },
      { units: {}, disabledUnitIds: [] },
    );
    const progress: Record<string, UnitProgress> = {};
    const now = Date.now();
    for (const unit of units) {
      const quizAttemptCounts: Record<string, number> = {};
      for (const q of unit.quizzes) {
        quizAttemptCounts[q.id] = 1;
      }
      progress[unit.id] = {
        unitId: unit.id,
        firstSeenAt: now,
        attempts: unit.quizzes.length,
        correct: unit.quizzes.length,
        lastSeenAt: now,
        lastFiveOutcomes: [],
        templatesEncountered: unit.quizzes.map((q) => q.id),
        quizAttemptCounts,
        tier: 'gold',
        achievementEarned: true,
      };
    }
    const overview = computeMasteryOverview(progress);
    expect(overview.laps).toBe(1);
    expect(overview.nextLapPct).toBe(0);
  });

  it('uses minimum count for uneven lap progress', () => {
    const partial = seedAllQuizzesOnce();
    const units = collectEnabledUnits(
      { modules: CONTENT_MODULES },
      { units: partial, disabledUnitIds: [] },
    );
    const first = units[0];
    const extraId = first.quizzes[0]?.id;
    if (extraId && partial[first.id]) {
      partial[first.id] = {
        ...partial[first.id],
        quizAttemptCounts: {
          ...partial[first.id].quizAttemptCounts,
          [extraId]: 2,
        },
      };
    }
    expect(computeMasteryOverview(partial).laps).toBe(0);
  });
});
