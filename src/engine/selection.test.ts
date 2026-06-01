import { describe, expect, it } from 'vitest';
import { CONTENT_MODULES } from '@/content';
import { getUnitById } from '@/content/catalog';
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

  it('builds branch sweep for bundled module id', () => {
    const queue = buildQueue(
      { kind: 'branch', nodeId: 'mod.biochemistry.bundled' },
      world,
      EMPTY_USER_STATE,
    );
    expect(queue.length).toBeGreaterThan(100);
    expect(queue.every((q) => q.unitId.startsWith('bio.eoc.'))).toBe(true);
  });

  it('builds branch sweep for biochemistry section', () => {
    const queue = buildQueue(
      { kind: 'branch', nodeId: 'bio.eoc.macromolecules' },
      world,
      EMPTY_USER_STATE,
    );
    expect(queue.length).toBeGreaterThan(10);
    expect(queue.every((q) => q.unitId.startsWith('bio.eoc.macromolecules'))).toBe(true);
  });

  it('builds single-unit branch from unit id', () => {
    const queue = buildQueue(
      { kind: 'branch', nodeId: 'bio.eoc.macromolecules.enzymes.enzyme-action' },
      world,
      EMPTY_USER_STATE,
    );
    expect(queue.length).toBeGreaterThan(0);
    expect(queue.every((q) => q.unitId === 'bio.eoc.macromolecules.enzymes.enzyme-action')).toBe(true);
  });

  it('builds revisit queue prioritizing lowest quiz attempt counts', () => {
    const unit = getUnitById('bio.eoc.macromolecules.enzymes.enzyme-action');
    expect(unit).toBeDefined();
    const quizA = unit!.quizzes[0];
    const state: UserState = {
      units: {
        [unit!.id]: {
          unitId: unit!.id,
          firstSeenAt: 1,
          attempts: 2,
          correct: 2,
          lastSeenAt: 2,
          lastFiveOutcomes: [],
          templatesEncountered: [quizA.id],
          quizAttemptCounts: { [quizA.id]: 3 },
          tier: 'bronze',
          achievementEarned: false,
        },
      },
      disabledUnitIds: [],
    };
    const queue = buildQueue({ kind: 'revisit', length: 5 }, world, state);
    expect(queue.length).toBe(5);
    const first = queue[0];
    const firstCount = state.units[first.unitId]?.quizAttemptCounts?.[first.templateId] ?? 0;
    for (const item of queue.slice(1)) {
      const count = state.units[item.unitId]?.quizAttemptCounts?.[item.templateId] ?? 0;
      expect(count).toBeGreaterThanOrEqual(firstCount);
    }
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
          quizAttemptCounts: {},
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

  it('defers encountered branch quizzes to the end of the queue', () => {
    const unitId = 'bio.eoc.macromolecules.enzymes.enzyme-action';
    const unit = getUnitById(unitId);
    expect(unit).toBeDefined();
    const encounteredId = unit!.quizzes[0].id;

    const state: UserState = {
      units: {
        [unitId]: {
          unitId,
          firstSeenAt: Date.now(),
          attempts: 1,
          correct: 1,
          lastSeenAt: Date.now(),
          lastFiveOutcomes: [
            { correct: true, ms: 1000, templateKind: unit!.quizzes[0].kind },
          ],
          templatesEncountered: [encounteredId],
          quizAttemptCounts: { [encounteredId]: 1 },
          tier: 'unlocked',
          achievementEarned: false,
        },
      },
      disabledUnitIds: [],
    };

    const queue = buildQueue({ kind: 'branch', nodeId: unitId }, world, state);
    expect(queue).toHaveLength(unit!.quizzes.length);
    expect(queue.at(-1)?.templateId).toBe(encounteredId);
    expect(queue.slice(0, -1).every((q) => q.templateId !== encounteredId)).toBe(true);
  });

  it('includes every branch quiz once with fresh items before review', () => {
    const unitId = 'bio.eoc.macromolecules.enzymes.enzyme-action';
    const unit = getUnitById(unitId);
    expect(unit).toBeDefined();

    const queue = buildQueue({ kind: 'branch', nodeId: unitId }, world, EMPTY_USER_STATE);
    const expectedIds = unit!.quizzes.map((q) => q.id).sort();
    expect(queue.map((q) => q.templateId).sort()).toEqual(expectedIds);
  });
});
