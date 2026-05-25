import { describe, expect, it } from 'vitest';
import { computeTier, isTrouble, updateUnitProgress } from '@/engine/scoring';
import { makeAttempt } from '@/test/fixtures';
import type { UnitProgress } from '@/types';

function baseProgress(overrides: Partial<UnitProgress> = {}): UnitProgress {
  return {
    unitId: 'evo.origin.abiogenesis.miller-urey',
    firstSeenAt: Date.now() - 86_400_000,
    attempts: 0,
    correct: 0,
    lastSeenAt: 0,
    lastFiveOutcomes: [],
    templatesEncountered: [],
    tier: 'locked',
    achievementEarned: false,
    ...overrides,
  };
}

describe('scoring', () => {
  describe('isTrouble', () => {
    it('returns false with no outcomes', () => {
      expect(isTrouble(baseProgress())).toBe(false);
    });

    it('returns true when accuracy is below 60%', () => {
      const prog = baseProgress({
        lastFiveOutcomes: [
          { correct: false, ms: 1000, templateKind: 'speed-reveal-mnemonic' },
          { correct: false, ms: 1000, templateKind: 'speed-reveal-mnemonic' },
          { correct: true, ms: 1000, templateKind: 'speed-reveal-mnemonic' },
        ],
      });
      expect(isTrouble(prog)).toBe(true);
    });

    it('returns false when accuracy is at or above 60%', () => {
      const prog = baseProgress({
        lastFiveOutcomes: [
          { correct: true, ms: 1000, templateKind: 'speed-reveal-mnemonic' },
          { correct: true, ms: 1000, templateKind: 'speed-reveal-mnemonic' },
          { correct: false, ms: 1000, templateKind: 'speed-reveal-mnemonic' },
        ],
      });
      expect(isTrouble(prog)).toBe(false);
    });
  });

  describe('computeTier', () => {
    it('stays locked with zero correct', () => {
      expect(computeTier(baseProgress())).toBe('locked');
    });

    it('unlocks after first correct with a template seen', () => {
      const prog = baseProgress({
        correct: 1,
        templatesEncountered: ['speed-reveal-mnemonic'],
      });
      expect(computeTier(prog)).toBe('unlocked');
    });

    it('reaches bronze with enough correct and templates', () => {
      const prog = baseProgress({
        correct: 3,
        templatesEncountered: ['speed-reveal-mnemonic', 'fill-blank'],
        lastFiveOutcomes: [
          { correct: true, ms: 800, templateKind: 'speed-reveal-mnemonic' },
        ],
      });
      expect(computeTier(prog)).toBe('bronze');
    });

    it('reaches gold at high mastery', () => {
      const prog = baseProgress({
        correct: 7,
        templatesEncountered: ['a', 'b', 'c', 'd'],
        lastFiveOutcomes: [
          { correct: true, ms: 800, templateKind: 'a' },
          { correct: true, ms: 800, templateKind: 'b' },
          { correct: true, ms: 800, templateKind: 'c' },
        ],
      });
      expect(computeTier(prog)).toBe('gold');
    });
  });

  describe('updateUnitProgress', () => {
    it('creates fresh progress on first attempt', () => {
      const next = updateUnitProgress(undefined, makeAttempt({ correct: true }));
      expect(next.attempts).toBe(1);
      expect(next.correct).toBe(1);
      expect(next.templatesEncountered).toContain('speed-reveal-mnemonic');
      expect(next.lastFiveOutcomes).toHaveLength(1);
    });

    it('accumulates outcomes and caps at five', () => {
      let prog = baseProgress();
      for (let i = 0; i < 6; i++) {
        prog = updateUnitProgress(prog, makeAttempt({ correct: i % 2 === 0 }));
      }
      expect(prog.attempts).toBe(6);
      expect(prog.lastFiveOutcomes).toHaveLength(5);
    });

    it('does not duplicate template kinds in templatesEncountered', () => {
      const prog = baseProgress({ templatesEncountered: ['speed-reveal-mnemonic'] });
      const next = updateUnitProgress(prog, makeAttempt({ correct: true }));
      expect(next.templatesEncountered).toEqual(['speed-reveal-mnemonic']);
    });
  });
});
