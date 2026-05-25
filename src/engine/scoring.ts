import type { Attempt, UnitProgress } from '@/types';

export function isTrouble(prog: UnitProgress): boolean {
  if (!prog.lastFiveOutcomes.length) return false;
  const accuracy =
    prog.lastFiveOutcomes.filter((o) => o.correct).length / prog.lastFiveOutcomes.length;
  return accuracy < 0.6;
}

export function computeTier(p: UnitProgress): UnitProgress['tier'] {
  if (p.correct === 0) return 'locked';
  if (p.correct === 1 && p.templatesEncountered.length >= 1) {
    return 'unlocked';
  }
  const correctInLastThree = p.lastFiveOutcomes.slice(-3).filter((o) => o.correct).length;
  if (p.correct >= 7 && p.templatesEncountered.length >= 4 && correctInLastThree === 3) {
    return 'gold';
  }
  if (p.correct >= 5 && p.templatesEncountered.length >= 3 && correctInLastThree === 3) {
    return 'silver';
  }
  if (p.correct >= 3 && p.templatesEncountered.length >= 2) {
    return 'bronze';
  }
  return 'unlocked';
}

export function updateUnitProgress(
  prev: UnitProgress | undefined,
  attempt: Attempt,
): UnitProgress {
  const base: UnitProgress = prev ?? {
    unitId: attempt.unitId,
    firstSeenAt: Date.now(),
    attempts: 0,
    correct: 0,
    lastSeenAt: 0,
    lastFiveOutcomes: [],
    templatesEncountered: [],
    tier: 'locked',
    achievementEarned: false,
  };

  const next: UnitProgress = {
    ...base,
    attempts: base.attempts + 1,
    correct: base.correct + (attempt.correct ? 1 : 0),
    lastSeenAt: Date.now(),
    lastFiveOutcomes: [
      ...base.lastFiveOutcomes,
      { correct: attempt.correct, ms: attempt.ms, templateKind: attempt.templateKind },
    ].slice(-5),
    templatesEncountered: base.templatesEncountered.includes(attempt.templateKind)
      ? base.templatesEncountered
      : [...base.templatesEncountered, attempt.templateKind],
  };

  return { ...next, tier: computeTier(next) };
}
