import { describe, expect, it } from 'vitest';
import { CONTENT_MODULES } from '@/content';
import {
  collectUnitsUnderNode,
  findDrawerContaining,
  findUnit,
  flattenUnits,
  getWings,
} from '@/engine/world';

describe('world navigation', () => {
  it('flattens all knowledge units from bundled modules', () => {
    const units = flattenUnits(CONTENT_MODULES);
    expect(units.length).toBeGreaterThanOrEqual(34);
    expect(units.every((u) => u.id && u.quizzes.length > 0)).toBe(true);
  });

  it('finds a unit by id', () => {
    const unit = findUnit(CONTENT_MODULES, 'evo.origin.abiogenesis.miller-urey');
    expect(unit?.title).toContain('Miller-Urey');
  });

  it('finds drawer siblings for a unit', () => {
    const drawer = findDrawerContaining(
      CONTENT_MODULES,
      'evo.origin.abiogenesis.miller-urey',
    );
    expect(drawer).toBeDefined();
    expect(drawer!.siblings.length).toBeGreaterThan(0);
  });

  it('collects units under evolution wing node', () => {
    const units = collectUnitsUnderNode(CONTENT_MODULES, 'evo');
    expect(units.length).toBeGreaterThan(0);
    expect(units.every((u) => u.id.startsWith('evo.'))).toBe(true);
  });

  it('collects units under a room node', () => {
    const units = collectUnitsUnderNode(CONTENT_MODULES, 'evo.origin');
    expect(units.length).toBeGreaterThan(0);
    expect(units.every((u) => u.id.startsWith('evo.origin'))).toBe(true);
  });

  it('returns empty array for unknown node', () => {
    expect(collectUnitsUnderNode(CONTENT_MODULES, 'does-not-exist')).toEqual([]);
  });

  it('lists wings from modules', () => {
    const wings = getWings(CONTENT_MODULES);
    expect(wings.some((w) => w.id === 'evo')).toBe(true);
  });
});
