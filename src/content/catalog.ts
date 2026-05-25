import type { Achievement, KnowledgeUnit } from '@/types';
import { CONTENT_MODULES } from '@/content';
import { flattenUnits, getWings } from '@/engine/world';
import { buildQueue } from '@/engine/selection';
import type { SelectionDescriptor, UserState } from '@/types';

export type AchievementTile = Achievement & {
  unitId: string;
};

/** Placeholder tiles for wings not yet bundled — show as locked on the home grid. */
const PLACEHOLDER_TILES: AchievementTile[] = [
  { unitId: 'origin.soup.primordial', id: 'ach.origin.soup.primordial', emoji: '🍲', shortLabel: 'Soup', longLabel: 'Primordial Soup', flavor: 'The early ocean thickens.', wingId: 'origin' },
  { unitId: 'origin.rna.first', id: 'ach.origin.rna.first', emoji: '🪞', shortLabel: 'RNA First', longLabel: 'RNA World', flavor: 'A molecule that copies itself.', wingId: 'origin' },
  { unitId: 'cell.theory.basic', id: 'ach.cell.theory.basic', emoji: '🧫', shortLabel: 'Cell Th.', longLabel: 'Cell Theory', flavor: 'All life is cellular.', wingId: 'cell' },
  { unitId: 'cell.organelle.mito', id: 'ach.cell.organelle.mito', emoji: '🔋', shortLabel: 'Mitoch.', longLabel: 'Mitochondria', flavor: 'Power plants with their own DNA.', wingId: 'cell' },
  { unitId: 'gen.mendel.peas', id: 'ach.gen.mendel.peas', emoji: '🌱', shortLabel: 'Mendel', longLabel: "Mendel's Peas", flavor: 'Hidden ratios in the garden.', wingId: 'gen' },
  { unitId: 'gen.dominance.incomplete', id: 'ach.gen.dominance.incomplete', emoji: '🌸', shortLabel: 'Incomplete', longLabel: 'Incomplete Dominance', flavor: 'Pink. Not red, not white.', wingId: 'gen' },
];

function tilesFromModules(): AchievementTile[] {
  return flattenUnits(CONTENT_MODULES).map((u) => ({
    ...u.achievement,
    unitId: u.id,
  }));
}

export const WING_GROUPS = (() => {
  const live = tilesFromModules();
  const all = [...live, ...PLACEHOLDER_TILES.filter((p) => !live.some((l) => l.unitId === p.unitId))];
  const wingMeta: Record<string, string> = {
    evo: 'Evolution',
    biochem: 'Biology EOC',
    origin: 'Origin of Life',
    cell: 'Cell Biology',
    gen: 'Genetics',
  };
  const wingIds = [...new Set(all.map((t) => t.wingId))];
  return wingIds.map((wingId) => ({
    wingId,
    title: wingMeta[wingId] ?? wingId,
    tiles: all.filter((t) => t.wingId === wingId),
  }));
})();

export const ALL_TILES = WING_GROUPS.flatMap((g) => g.tiles);

export function getUnitById(unitId: string): KnowledgeUnit | undefined {
  return flattenUnits(CONTENT_MODULES).find((u) => u.id === unitId);
}

export function buildGameQueue(
  selection: SelectionDescriptor,
  state: UserState,
) {
  const world = { modules: CONTENT_MODULES };
  return buildQueue(selection, world, state);
}

export { CONTENT_MODULES, getWings };
