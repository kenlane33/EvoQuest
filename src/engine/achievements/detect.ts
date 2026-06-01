import type {
  AchievementState,
  ActiveSession,
  CalibrationRecord,
  Journey,
  MorphemeProgress,
  UnitProgress,
} from '@/types';
import { CONTENT_MODULES } from '@/content';
import {
  AGGREGATE_CATALOG,
  isNodeFullyUnlocked,
  unitIdsUnderNode,
} from '@/engine/achievements/aggregates';
import {
  HIDDEN_ACHIEVEMENTS,
  ROOMMATE_UNIT_PATTERN,
  type HiddenAchievementDef,
} from '@/engine/achievements/catalog';

export type EarnedAchievement = {
  id: string;
  kind: 'unit' | 'aggregate' | 'hidden' | 'tier';
  emoji: string;
  shortLabel: string;
  flavor: string;
  hook?: string;
  tier?: UnitProgress['tier'];
  powerUpReward?: string;
};

export type DetectContext = {
  unitId: string;
  unitProgress: Record<string, UnitProgress>;
  prevProgress?: UnitProgress;
  nextProgress: UnitProgress;
  unitAchievementId: string;
  unitEmoji: string;
  unitShortLabel: string;
  unitFlavor: string;
  hook?: string;
  achievementState: AchievementState;
  session?: ActiveSession;
  calibrationRecords: CalibrationRecord[];
  morphemeProgress: Record<string, MorphemeProgress>;
  artifactCount: number;
  journeyEnded?: {
    correct: number;
    total: number;
    bestStreak: number;
    powerupsUsed: number;
  };
};

function brierScore(records: CalibrationRecord[]): number | null {
  if (records.length < 30) return null;
  const slice = records.slice(0, 30);
  const sum = slice.reduce((acc, r) => {
    const p = r.confidence;
    const o = r.correct ? 1 : 0;
    return acc + (p - o) ** 2;
  }, 0);
  return sum / slice.length;
}

function distinctMorphemeCount(morphemeProgress: Record<string, MorphemeProgress>): number {
  return Object.keys(morphemeProgress).length;
}

function hiddenIfNew(
  id: string,
  achievementState: AchievementState,
): HiddenAchievementDef | null {
  if (achievementState.earned[id]) return null;
  return HIDDEN_ACHIEVEMENTS[id] ?? null;
}

export function detectAfterAnswer(ctx: DetectContext): EarnedAchievement[] {
  const earned: EarnedAchievement[] = [];
  const { prevProgress, nextProgress, achievementState } = ctx;

  const wasLocked = !prevProgress || prevProgress.tier === 'locked';
  const nowUnlocked = nextProgress.tier !== 'locked';
  if (wasLocked && nowUnlocked) {
    earned.push({
      id: ctx.unitAchievementId,
      kind: 'unit',
      emoji: ctx.unitEmoji,
      shortLabel: ctx.unitShortLabel,
      flavor: ctx.unitFlavor,
      hook: ctx.hook,
    });
  }

  const prevTier = prevProgress?.tier ?? 'locked';
  if (nextProgress.tier !== prevTier && nextProgress.tier !== 'locked' && nextProgress.tier !== 'unlocked') {
    earned.push({
      id: `${ctx.unitAchievementId}.tier.${nextProgress.tier}`,
      kind: 'tier',
      emoji: ctx.unitEmoji,
      shortLabel: ctx.unitShortLabel,
      flavor: ctx.unitFlavor,
      tier: nextProgress.tier,
    });
  }

  if (nextProgress.tier === 'gold' && ROOMMATE_UNIT_PATTERN.test(ctx.unitId)) {
    const h = hiddenIfNew('hidden.roommate', achievementState);
    if (h) {
      earned.push(toEarnedHidden(h));
    }
  }

  for (const agg of AGGREGATE_CATALOG) {
    if (achievementState.earned[agg.id]) continue;
    const merged = { ...ctx.unitProgress, [ctx.unitId]: nextProgress };
    if (isNodeFullyUnlocked(agg.nodeId, merged)) {
      earned.push({
        id: agg.id,
        kind: 'aggregate',
        emoji: agg.emoji,
        shortLabel: agg.shortLabel,
        flavor: agg.flavor,
      });
    }
  }

  const streak = ctx.session?.currentStreak ?? 0;
  if (streak >= 15) {
    const h15 = hiddenIfNew('hidden.streak-15', achievementState);
    if (h15 && streak === 15) earned.push(toEarnedHidden(h15));
  }
  if (streak >= 25) {
    const h25 = hiddenIfNew('hidden.streak-25', achievementState);
    if (h25 && streak === 25) earned.push(toEarnedHidden(h25));
  }

  const morphemeCount = distinctMorphemeCount(ctx.morphemeProgress);
  if (morphemeCount >= 20) {
    const h = hiddenIfNew('hidden.etymologist', achievementState);
    if (h) earned.push(toEarnedHidden(h));
  }
  if (morphemeCount >= 50) {
    const h = hiddenIfNew('hidden.morphologist', achievementState);
    if (h) earned.push(toEarnedHidden(h));
  }

  if (ctx.artifactCount >= 5) {
    const h = hiddenIfNew('hidden.bricoleur', achievementState);
    if (h) earned.push(toEarnedHidden(h));
  }
  if (ctx.artifactCount >= 20) {
    const h = hiddenIfNew('hidden.master-builder', achievementState);
    if (h) earned.push(toEarnedHidden(h));
  }

  const brier = brierScore(ctx.calibrationRecords);
  if (brier !== null && brier <= 0.15) {
    const h = hiddenIfNew('hidden.calibrator', achievementState);
    if (h) earned.push(toEarnedHidden(h));
  }

  return earned;
}

export function detectAggregates(
  unitProgress: Record<string, UnitProgress>,
  achievementState: AchievementState,
): EarnedAchievement[] {
  const earned: EarnedAchievement[] = [];
  for (const agg of AGGREGATE_CATALOG) {
    if (achievementState.earned[agg.id]) continue;
    if (isNodeFullyUnlocked(agg.nodeId, unitProgress)) {
      earned.push({
        id: agg.id,
        kind: 'aggregate',
        emoji: agg.emoji,
        shortLabel: agg.shortLabel,
        flavor: agg.flavor,
      });
    }
  }
  return earned;
}

export function detectDailyStreakAchievements(
  dailyCount: number,
  achievementState: AchievementState,
): EarnedAchievement[] {
  const earned: EarnedAchievement[] = [];
  if (dailyCount >= 7) {
    const h = hiddenIfNew('hidden.daily-7', achievementState);
    if (h) earned.push(toEarnedHidden(h));
  }
  if (dailyCount >= 30) {
    const h = hiddenIfNew('hidden.daily-30', achievementState);
    if (h) earned.push(toEarnedHidden(h));
  }
  return earned;
}

export function detectJourneyEndHidden(
  journey: Pick<Journey, 'attempts' | 'finalScore'>,
  powerupsUsed: number,
  achievementState: AchievementState,
): EarnedAchievement[] {
  const earned: EarnedAchievement[] = [];
  const total = journey.finalScore.total;
  const accuracy = total > 0 ? journey.finalScore.correct / total : 0;
  if (total >= 15 && accuracy >= 0.8 && powerupsUsed === 0) {
    const h = hiddenIfNew('hidden.zero-power-up', achievementState);
    if (h) earned.push(toEarnedHidden(h));
  }
  return earned;
}

export function detectFirstClearWings(
  unitProgress: Record<string, UnitProgress>,
  achievementState: AchievementState,
): string[] {
  const newlyCleared: string[] = [];
  for (const mod of CONTENT_MODULES) {
    for (const wing of mod.tree) {
      if (achievementState.firstClearedWingIds.includes(wing.id)) continue;
      const unitIds = unitIdsUnderNode([mod], wing.id);
      if (!unitIds.length) continue;
      const allUnlocked = unitIds.every((id) => {
        const p = unitProgress[id];
        return p && p.tier !== 'locked';
      });
      if (allUnlocked) newlyCleared.push(wing.id);
    }
  }
  return newlyCleared;
}

function toEarnedHidden(h: HiddenAchievementDef): EarnedAchievement {
  return {
    id: h.id,
    kind: 'hidden',
    emoji: h.emoji,
    shortLabel: h.shortLabel,
    flavor: h.flavor,
    powerUpReward: h.powerUpReward,
  };
}

export function dayKeyFromTimestamp(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Update daily streak on new session; returns new count and any achievements. */
export function advanceDailyStreak(
  achievementState: AchievementState,
  now = Date.now(),
): { next: AchievementState['dailyStreak']; achievements: EarnedAchievement[] } {
  const today = dayKeyFromTimestamp(now);
  const { dailyStreak } = achievementState;
  let count = dailyStreak.count;
  if (dailyStreak.lastDayKey === today) {
    return { next: dailyStreak, achievements: [] };
  }
  const last = new Date(dailyStreak.lastDayKey);
  const todayDate = new Date(today);
  const diffDays = Math.round((todayDate.getTime() - last.getTime()) / 86_400_000);
  if (diffDays === 1) {
    count += 1;
  } else if (diffDays > 1) {
    count = 1;
  } else {
    count = Math.max(1, count);
  }
  const next = { count, lastDayKey: today };
  const achievements = detectDailyStreakAchievements(count, achievementState);
  return { next, achievements };
}
