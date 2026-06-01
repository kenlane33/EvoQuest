import { describe, expect, it } from 'vitest';
import { mergeBioEocRoomModules } from '@/content/bio-eoc/merge-rooms';
import { ROOM_MODULES } from '@/content/bio-eoc/room-registry';
import { flattenUnits } from '@/engine/world';

describe('mergeBioEocRoomModules', () => {
  it('merges room fragments into one wing with unique unit ids', () => {
    const { wing, etymologyContributions } = mergeBioEocRoomModules(ROOM_MODULES);

    expect(wing.id).toBe('bio.eoc');
    expect(wing.children).toHaveLength(ROOM_MODULES.length);
    const units = flattenUnits([
      {
        id: 'test',
        title: '',
        description: '',
        schemaVersion: 1,
        appVersionAtAuthoring: '0',
        source: 'bundled',
        createdAt: 0,
        tree: [wing],
      },
    ]);
    expect(units).toHaveLength(50);
    expect(new Set(units.map((u) => u.id)).size).toBe(50);
    expect(etymologyContributions.length).toBeGreaterThan(0);
  });
});
