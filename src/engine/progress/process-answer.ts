import type { KnowledgeUnit, MorphemeProgress, UnitProgress } from '@/types';
import type { ActiveSession } from '@/types';
import {
  detectAfterAnswer,
  detectFirstClearWings,
  detectJourneyEndHidden,
  type EarnedAchievement,
} from '@/engine/achievements/detect';
import { rollWingClearBonus } from '@/engine/powerups/rolls';
import type { AchievementState, CalibrationRecord, PowerUpInstance } from '@/types';

export type ProcessAnswerInput = {
  unit: KnowledgeUnit;
  prevProgress?: UnitProgress;
  nextProgress: UnitProgress;
  correct: boolean;
  session: ActiveSession;
  nextStreak: number;
  unitProgress: Record<string, UnitProgress>;
  achievementState: AchievementState;
  calibrationRecords: CalibrationRecord[];
  morphemeProgress: Record<string, MorphemeProgress>;
  artifactCount: number;
};

export type ProcessAnswerResult = {
  achievements: EarnedAchievement[];
  tierUps: Array<{ unitId: string; tier: UnitProgress['tier'] }>;
  morphemesTouchedFirst: string[];
  wingClearBonuses: Array<{ wingId: string; common: PowerUpInstance; rare: PowerUpInstance }>;
  streakRewardStreak: number | null;
};

export function trackMorphemesFromUnit(
  unit: KnowledgeUnit,
  morphemeProgress: Record<string, MorphemeProgress>,
): { next: Record<string, MorphemeProgress>; touchedFirst: string[] } {
  const next = { ...morphemeProgress };
  const touchedFirst: string[] = [];
  const refs = unit.teach.etymology?.morphemes ?? [];
  const now = Date.now();
  for (const ref of refs) {
    const id = ref.morphemeId;
    if (!id) continue;
    if (!next[id]) {
      touchedFirst.push(id);
      next[id] = {
        morphemeId: id,
        firstSeenAt: now,
        encounters: 1,
        correctEncounters: 0,
        lastSeenAt: now,
        termsAssembled: [unit.shortLabel],
      };
    } else {
      next[id] = {
        ...next[id],
        encounters: next[id].encounters + 1,
        lastSeenAt: now,
        termsAssembled: next[id].termsAssembled.includes(unit.shortLabel)
          ? next[id].termsAssembled
          : [...next[id].termsAssembled, unit.shortLabel],
      };
    }
  }
  return { next, touchedFirst };
}

export function processAnswerRewards(input: ProcessAnswerInput): ProcessAnswerResult {
  const prevTier = input.prevProgress?.tier ?? 'locked';
  const tierUps: ProcessAnswerResult['tierUps'] = [];
  if (input.nextProgress.tier !== prevTier && input.nextProgress.tier !== 'locked') {
    tierUps.push({ unitId: input.unit.id, tier: input.nextProgress.tier });
  }

  const achievements = detectAfterAnswer({
    unitId: input.unit.id,
    unitProgress: { ...input.unitProgress, [input.unit.id]: input.nextProgress },
    prevProgress: input.prevProgress,
    nextProgress: input.nextProgress,
    unitAchievementId: input.unit.achievement.id,
    unitEmoji: input.unit.achievement.emoji,
    unitShortLabel: input.unit.achievement.shortLabel,
    unitFlavor: input.unit.achievement.flavor,
    hook: input.unit.teach.hook,
    achievementState: input.achievementState,
    session: { ...input.session, currentStreak: input.nextStreak },
    calibrationRecords: input.calibrationRecords,
    morphemeProgress: input.morphemeProgress,
    artifactCount: input.artifactCount,
  });

  const streakRewardStreak =
    input.correct && input.nextStreak > 0 && input.nextStreak % 5 === 0
      ? input.nextStreak
      : null;

  const wingClearBonuses: ProcessAnswerResult['wingClearBonuses'] = [];
  const newlyCleared = detectFirstClearWings(
    { ...input.unitProgress, [input.unit.id]: input.nextProgress },
    input.achievementState,
  );
  for (const wingId of newlyCleared) {
    const bonus = rollWingClearBonus(wingId);
    wingClearBonuses.push({ wingId, ...bonus });
  }

  return {
    achievements,
    tierUps,
    morphemesTouchedFirst: [],
    wingClearBonuses,
    streakRewardStreak,
  };
}

export function processJourneyEndRewards(
  journey: {
    attempts: ActiveSession['attempts'];
    finalScore: { correct: number; total: number; bestStreak: number };
  },
  powerupsUsed: number,
  achievementState: AchievementState,
): EarnedAchievement[] {
  return detectJourneyEndHidden(journey, powerupsUsed, achievementState);
}
