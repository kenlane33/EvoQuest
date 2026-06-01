import { describe, expect, it } from 'vitest';
import {
  achievementContext,
  achievementSpeakText,
} from '@/audio/achievement-read-text';
import type { EarnedAchievement } from '@/engine/achievements/detect';

describe('achievement-read-text', () => {
  it('builds spoken copy with context first', () => {
    const achievement: EarnedAchievement = {
      id: 'hidden.streak-15',
      kind: 'hidden',
      emoji: '🔥',
      shortLabel: 'On Fire',
      flavor: 'Fifteen in a row. The neurons are warmed up.',
    };
    expect(achievementContext(achievement)).toBe('Achievement unlocked');
    expect(achievementSpeakText(achievement)).toBe(
      'Achievement Unlocked. On Fire. Fifteen in a row. The neurons are warmed up.',
    );
  });

  it('includes hook when present', () => {
    const achievement: EarnedAchievement = {
      id: 'ach.unit.test',
      kind: 'unit',
      emoji: '🧬',
      shortLabel: 'DNA',
      flavor: 'The helix turns.',
      hook: 'Think base pairs.',
    };
    expect(achievementSpeakText(achievement)).toContain('Achievement Unlocked');
    expect(achievementSpeakText(achievement)).toContain('DNA');
    expect(achievementSpeakText(achievement)).toContain('Think base pairs.');
  });
});
