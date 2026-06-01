import { describe, expect, it } from 'vitest';
import { ROOM_MODULES } from '@/content/bio-eoc/room-registry';
import {
  BIO_EOC_SUPERSEDES_MAP,
  BIO_EOC_SUPERSEDES_PENDING,
  BIO_EOC_SUPERSEDES_SET,
  supersedesByRoom,
} from '@/content/bio-eoc/supersedes';
import biochemistry from '@/content/biochemistry/index.ts';
import { flattenUnits } from '@/engine/world';

describe('bio-eoc room registry', () => {
  it('registers all 9 merged rooms in NC EOC chunk order', () => {
    const roomIds = ROOM_MODULES.map((m) => m.tree[0]?.children?.[0]?.id);
    expect(roomIds).toEqual([
      'bio.eoc.macromolecules',
      'bio.eoc.cell-structure',
      'bio.eoc.gene-expression',
      'bio.eoc.division',
      'bio.eoc.energy',
      'bio.eoc.ecosystems',
      'bio.eoc.heredity',
      'bio.eoc.biotech',
      'bio.eoc.evolution',
    ]);
  });
});

describe('bio-eoc supersedes map', () => {
  it('maps all 35 legacy biochem units', () => {
    const biochemIds = flattenUnits([biochemistry])
      .filter((u) => u.id.startsWith('biochem.'))
      .map((u) => u.id)
      .sort();
    const mappedIds = BIO_EOC_SUPERSEDES_MAP.map((e) => e.legacyUnitId).sort();
    expect(mappedIds).toEqual(biochemIds);
    expect(BIO_EOC_SUPERSEDES_MAP).toHaveLength(35);
  });

  it('disables all 35 legacy biochem units at bundle time', () => {
    expect(BIO_EOC_SUPERSEDES_SET.size).toBe(35);
    const disabled = flattenUnits([biochemistry]).filter(
      (u) => u.id.startsWith('biochem.') && !u.enabled,
    );
    expect(disabled).toHaveLength(35);
    expect(
      flattenUnits([biochemistry]).filter((u) => u.id.startsWith('biochem.') && u.enabled),
    ).toHaveLength(0);
  });

  it('has no pending supersede entries', () => {
    expect(BIO_EOC_SUPERSEDES_PENDING).toEqual([]);
  });

  it('groups supersede entries by replacement room', () => {
    const byRoom = supersedesByRoom();
    expect(byRoom['bio.eoc.macromolecules']).toHaveLength(4);
    expect(byRoom['bio.eoc.ecosystems']).toHaveLength(7);
    expect(byRoom['bio.eoc.heredity']).toHaveLength(2);
  });
});
