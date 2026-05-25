import { describe, expect, it } from 'vitest';
import { CONTENT_MODULES } from '@/content';
import { buildQueue } from '@/engine/selection';
import { EMPTY_USER_STATE } from '@/test/fixtures';
import type { UserState } from '@/types';

const world = { modules: CONTENT_MODULES };

describe('selection buildQueue', () => {
  it('builds quick-mix queue of requested length', () => {
    const queue = buildQueue({ kind: 'quick-mix', length: 5 }, world, EMPTY_USER_STATE);
    expect(queue).toHaveLength(5);
    expect(queue.every((q) => q.unitId && q.templateKind)).toBe(true);
  });

  it('builds branch sweep for a wing', () => {
    const queue = buildQueue({ kind: 'branch', nodeId: 'evo' }, world, EMPTY_USER_STATE);
    expect(queue.length).toBeGreaterThan(0);
  });

  it('builds deep-dive sample from a node', () => {
    const queue = buildQueue(
      { kind: 'deep-dive', nodeId: 'evo', length: 3 },
      world,
      EMPTY_USER_STATE,
    );
    expect(queue).toHaveLength(3);
  });

  it('returns empty trouble tour when no trouble units', () => {
    const queue = buildQueue({ kind: 'trouble', length: 5 }, world, EMPTY_USER_STATE);
    expect(queue).toEqual([]);
  });

  it('prioritizes trouble units in trouble tour', () => {
    const troubled: UserState = {
      units: {
        'evo.origin.abiogenesis.miller-urey': {
          unitId: 'evo.origin.abiogenesis.miller-urey',
          firstSeenAt: Date.now(),
          attempts: 5,
          correct: 1,
          lastSeenAt: Date.now(),
          lastFiveOutcomes: [
            { correct: false, ms: 1000, templateKind: 'speed-reveal-mnemonic' },
            { correct: false, ms: 1000, templateKind: 'speed-reveal-mnemonic' },
            { correct: false, ms: 1000, templateKind: 'speed-reveal-mnemonic' },
          ],
          templatesEncountered: ['speed-reveal-mnemonic'],
          tier: 'unlocked',
          achievementEarned: false,
        },
      },
      disabledUnitIds: [],
    };

    const queue = buildQueue({ kind: 'trouble', length: 3 }, world, troubled);
    expect(queue.length).toBeGreaterThan(0);
    expect(queue.some((q) => q.unitId === 'evo.origin.abiogenesis.miller-urey')).toBe(true);
  });

  it('builds mixed-trouble with trouble unit included', () => {
    const queue = buildQueue(
      {
        kind: 'mixed-trouble',
        troubleUnitId: 'evo.origin.abiogenesis.miller-urey',
        relatedCount: 2,
      },
      world,
      EMPTY_USER_STATE,
    );
    expect(queue.some((q) => q.unitId === 'evo.origin.abiogenesis.miller-urey')).toBe(true);
  });
});
