import { describe, expect, it } from 'vitest';
import { applyMigrations } from '@/storage/migrations';
import { STORAGE_KEYS } from '@/storage/keys';
import { rollStreakPowerUp, rareChanceForStreak } from '@/engine/powerups/rolls';
import { detectAfterAnswer, advanceDailyStreak } from '@/engine/achievements/detect';
import { DEFAULT_ACHIEVEMENT_STATE } from '@/store/app-store';

describe('powerups migration', () => {
  it('migrates powerups v1 to v2 with firstUseShown', () => {
    const payload = {
      slots: [null, null, null],
      earned: 2,
      spent: 1,
    };
    const result = applyMigrations(STORAGE_KEYS.POWERUPS, payload, 1);
    expect(result.toVersion).toBe(2);
    expect(result.payload).toMatchObject({ firstUseShown: [] });
  });
});

describe('streak power-up rolls', () => {
  it('returns null below streak 5', () => {
    expect(rollStreakPowerUp(4)).toBeNull();
    expect(rollStreakPowerUp(6)).toBeNull();
  });

  it('rolls on multiples of 5', () => {
    const result = rollStreakPowerUp(5, 'evo');
    expect(result).not.toBeNull();
    expect(result!.instance.id.startsWith('pu.')).toBe(true);
    expect(result!.instance.themedFor).toBe('evo');
  });

  it('increases rare chance at higher streaks', () => {
    expect(rareChanceForStreak(5)).toBe(0);
    expect(rareChanceForStreak(10)).toBe(0.1);
    expect(rareChanceForStreak(25)).toBe(0.4);
  });
});

describe('achievement detection', () => {
  it('detects first unit unlock', () => {
    const earned = detectAfterAnswer({
      unitId: 'test.unit',
      unitProgress: {},
      prevProgress: undefined,
      nextProgress: {
        unitId: 'test.unit',
        firstSeenAt: Date.now(),
        attempts: 1,
        correct: 1,
        lastSeenAt: Date.now(),
        lastFiveOutcomes: [],
        templatesEncountered: ['q1'],
        quizAttemptCounts: { q1: 1 },
        tier: 'unlocked',
        achievementEarned: false,
      },
      unitAchievementId: 'ach.test',
      unitEmoji: '⚗️',
      unitShortLabel: 'Test',
      unitFlavor: 'A test idea unfolds.',
      achievementState: DEFAULT_ACHIEVEMENT_STATE,
      calibrationRecords: [],
      morphemeProgress: {},
      artifactCount: 0,
    });
    expect(earned.some((e) => e.id === 'ach.test' && e.kind === 'unit')).toBe(true);
  });

  it('advances daily streak on new day', () => {
    const state = {
      ...DEFAULT_ACHIEVEMENT_STATE,
      dailyStreak: { count: 3, lastDayKey: '2020-01-01' },
    };
    const { next } = advanceDailyStreak(state, new Date('2020-01-02T12:00:00').getTime());
    expect(next.count).toBe(4);
    expect(next.lastDayKey).toBe('2020-01-02');
  });
});
