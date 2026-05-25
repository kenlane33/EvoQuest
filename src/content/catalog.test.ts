import { describe, expect, it } from 'vitest';
import {
  ALL_TILES,
  buildGameQueue,
  getUnitById,
  WING_GROUPS,
} from '@/content/catalog';
import { EMPTY_USER_STATE } from '@/test/fixtures';

describe('content catalog', () => {
  it('exposes wing groups with evolution tiles', () => {
    const evo = WING_GROUPS.find((g) => g.wingId === 'evo');
    expect(evo).toBeDefined();
    expect(evo!.tiles.length).toBeGreaterThan(0);
  });

  it('includes placeholder locked tiles for unbundled wings', () => {
    const wingIds = WING_GROUPS.map((g) => g.wingId);
    expect(wingIds).toContain('cell');
    expect(wingIds).toContain('gen');
    expect(ALL_TILES.length).toBeGreaterThan(8);
  });

  it('resolves bundled units by id', () => {
    const unit = getUnitById('evo.origin.abiogenesis.miller-urey');
    expect(unit?.teach.mnemonic).toBeTruthy();
  });

  it('includes biochemistry EOC module units', () => {
    const unit = getUnitById('biochem.enzymes.factors');
    expect(unit?.teach.body).toContain('p02_enzyme_activity_graph.svg');
    expect(unit?.teach.figures?.length).toBeGreaterThan(0);
  });

  it('builds game queue through catalog helper', () => {
    const queue = buildGameQueue({ kind: 'quick-mix', length: 4 }, EMPTY_USER_STATE);
    expect(queue).toHaveLength(4);
  });
});
