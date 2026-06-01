import type { EarnedAchievement } from '@/engine/achievements/detect';

export const ACHIEVEMENT_MOMENT_TITLE = 'Achievement Unlocked';

export function achievementContext(achievement: EarnedAchievement): string {
  switch (achievement.kind) {
    case 'unit':
      return 'New idea unlocked';
    case 'tier': {
      const tier = achievement.tier;
      if (tier === 'gold') return 'Reached gold mastery';
      if (tier === 'silver') return 'Reached silver mastery';
      if (tier === 'bronze') return 'Reached bronze mastery';
      return 'Mastery tier up';
    }
    case 'aggregate':
      return 'Section complete';
    case 'hidden':
      return 'Achievement unlocked';
  }
}

export function achievementSpeakText(achievement: EarnedAchievement): string {
  const parts = [ACHIEVEMENT_MOMENT_TITLE, achievement.shortLabel, achievement.flavor];
  if (achievement.hook) parts.push(achievement.hook);
  return parts.filter(Boolean).join('. ');
}
