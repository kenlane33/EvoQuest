import { CONTENT_MODULES } from '@/content';
import { ALL_TILES } from '@/content/catalog';
import { collectEnabledUnits } from '@/engine/selection';
import { summarizeTileProgress } from '@/components/achievements/tile-progress';
import type { ContentModule, UnitProgress } from '@/types';

export type QuizCoverageEntry = {
  unitId: string;
  quizId: string;
  count: number;
};

export type MasteryOverview = {
  totalQuizzes: number;
  laps: number;
  /** Completed laps plus fraction of the current lap (e.g. 1.34). */
  totalLaps: number;
  /** totalLaps formatted to two decimals, e.g. "1.34". */
  totalLapsLabel: string;
  nextLapPct: number;
  totalTopics: number;
  masteredTopics: number;
  startedTopics: number;
  weakest: QuizCoverageEntry[];
};

function quizCountForUnit(unitId: string, modules: ContentModule[]): number {
  const units = collectEnabledUnits({ modules }, { units: {}, disabledUnitIds: [] });
  const unit = units.find((u) => u.id === unitId);
  return unit?.quizzes.length ?? 0;
}

function getQuizAttemptCount(
  unitId: string,
  quizId: string,
  unitProgress: Record<string, UnitProgress>,
): number {
  return unitProgress[unitId]?.quizAttemptCounts?.[quizId] ?? 0;
}

export function collectAllQuizCoverage(
  unitProgress: Record<string, UnitProgress>,
  modules: ContentModule[] = CONTENT_MODULES,
): QuizCoverageEntry[] {
  const units = collectEnabledUnits({ modules }, { units: unitProgress, disabledUnitIds: [] });
  const entries: QuizCoverageEntry[] = [];
  for (const unit of units) {
    for (const quiz of unit.quizzes) {
      entries.push({
        unitId: unit.id,
        quizId: quiz.id,
        count: getQuizAttemptCount(unit.id, quiz.id, unitProgress),
      });
    }
  }
  return entries;
}

export function computeMasteryOverview(
  unitProgress: Record<string, UnitProgress>,
  modules: ContentModule[] = CONTENT_MODULES,
): MasteryOverview {
  const coverage = collectAllQuizCoverage(unitProgress, modules);
  const totalQuizzes = coverage.length;

  let laps = 0;
  if (totalQuizzes > 0) {
    const counts = coverage.map((c) => c.count);
    const minCount = Math.min(...counts);
    const allSeen = counts.every((c) => c > 0);
    laps = allSeen ? minCount : 0;
  }

  const targetForNextLap = laps + 1;
  const nextLapFraction =
    totalQuizzes > 0
      ? coverage.filter((c) => c.count >= targetForNextLap).length / totalQuizzes
      : 0;
  const nextLapPct = Math.round(nextLapFraction * 100);

  const tileUnitIds = ALL_TILES.map((t) => t.unitId).filter(
    (id) => quizCountForUnit(id, modules) > 0 || unitProgress[id],
  );
  const summaries = tileUnitIds.map((id) =>
    summarizeTileProgress(id, unitProgress[id]),
  );
  const totalTopics = tileUnitIds.length;
  const masteredTopics = summaries.filter((s) => s.mastered).length;
  const startedTopics = summaries.filter((s) => s.started).length;

  const sorted = [...coverage].sort((a, b) => a.count - b.count || a.quizId.localeCompare(b.quizId));
  const minCount = sorted.length ? sorted[0].count : 0;
  const weakest = sorted.filter((c) => c.count === minCount).slice(0, 24);

  const totalLaps = laps + nextLapFraction;
  const totalLapsLabel = totalLaps.toFixed(2);

  return {
    totalQuizzes,
    laps,
    totalLaps,
    totalLapsLabel,
    nextLapPct,
    totalTopics,
    masteredTopics,
    startedTopics,
    weakest,
  };
}
