import type { Achievement, KnowledgeUnit } from '@/types';
import { CONTENT_MODULES } from '@/content';
import { flattenUnits, getWings } from '@/engine/world';
import { buildQueue } from '@/engine/selection';
import type { SelectionDescriptor, UserState } from '@/types';

export type AchievementTile = Achievement & {
  unitId: string;
};

export type WingSubgroup = {
  id: string;
  title: string;
  emoji: string;
  tiles: AchievementTile[];
};

export type WingGroup = {
  wingId: string;
  title: string;
  emoji: string;
  tiles: AchievementTile[];
  subgroups?: WingSubgroup[];
};

/** Bundled Biology EOC module — used for home-page embark and deep-dive. */
export const BIOLOGY_EOC_MODULE_ID = 'mod.biochemistry.bundled';

export const BIOLOGY_EOC_SELECTION: SelectionDescriptor = {
  kind: 'branch',
  nodeId: BIOLOGY_EOC_MODULE_ID,
};

/** Study every topic in one EOC section (e.g. macromolecules wing before a test). */
export function sectionStudySelection(sectionId: string): SelectionDescriptor {
  return { kind: 'branch', nodeId: sectionId };
}

/** Queue the least-covered questions to advance the next full lap. */
export function revisitSelection(length: number): SelectionDescriptor {
  return { kind: 'revisit', length };
}

const WING_ORDER = ['bio.eoc', 'biochem', 'evo', 'origin', 'cell', 'gen'] as const;

/** Placeholder tiles for wings not yet bundled — show as locked on the home grid. */
const PLACEHOLDER_TILES: AchievementTile[] = [
  { unitId: 'origin.soup.primordial', id: 'ach.origin.soup.primordial', emoji: '🍲', shortLabel: 'Soup', longLabel: 'Primordial Soup', flavor: 'The early ocean thickens.', wingId: 'origin' },
  { unitId: 'origin.rna.first', id: 'ach.origin.rna.first', emoji: '🪞', shortLabel: 'RNA First', longLabel: 'RNA World', flavor: 'A molecule that copies itself.', wingId: 'origin' },
  { unitId: 'cell.theory.basic', id: 'ach.cell.theory.basic', emoji: '🧫', shortLabel: 'Cell Th.', longLabel: 'Cell Theory', flavor: 'All life is cellular.', wingId: 'cell' },
  { unitId: 'cell.organelle.mito', id: 'ach.cell.organelle.mito', emoji: '🔋', shortLabel: 'Mitoch.', longLabel: 'Mitochondria', flavor: 'Power plants with their own DNA.', wingId: 'cell' },
  { unitId: 'gen.mendel.peas', id: 'ach.gen.mendel.peas', emoji: '🌱', shortLabel: 'Mendel', longLabel: "Mendel's Peas", flavor: 'Hidden ratios in the garden.', wingId: 'gen' },
  { unitId: 'gen.dominance.incomplete', id: 'ach.gen.dominance.incomplete', emoji: '🌸', shortLabel: 'Incomplete', longLabel: 'Incomplete Dominance', flavor: 'Pink. Not red, not white.', wingId: 'gen' },
];

const WING_META: Record<string, { title: string; emoji: string }> = {
  'bio.eoc': { title: 'Biology EOC (2025)', emoji: '🧬' },
  biochem: { title: 'Biology EOC Review', emoji: '🧪' },
  evo: { title: 'Evolution', emoji: '🦕' },
  origin: { title: 'Origin of Life', emoji: '🍲' },
  cell: { title: 'Cell Biology', emoji: '🦠' },
  gen: { title: 'Genetics', emoji: '🌱' },
};

function tilesFromModules(): AchievementTile[] {
  return flattenUnits(CONTENT_MODULES)
    .filter((u) => u.enabled)
    .map((u) => ({
    ...u.achievement,
    unitId: u.id,
  }));
}

function biochemSubgroups(live: AchievementTile[]): WingSubgroup[] {
  const mod = CONTENT_MODULES.find((m) => m.id === BIOLOGY_EOC_MODULE_ID);
  if (!mod) return [];

  return mod.tree
    .filter((wing) => wing.id.startsWith('biochem.'))
    .map((wing) => {
    const unitIds = new Set(
      flattenUnits([{ ...mod, tree: [wing] }]).map((u) => u.id),
    );
    return {
      id: wing.id,
      title: wing.title,
      emoji: wing.emoji ?? '📋',
      tiles: live.filter((t) => unitIds.has(t.unitId)),
    };
  });
}

function bioEocSubgroups(live: AchievementTile[]): WingSubgroup[] {
  const mod = CONTENT_MODULES.find((m) => m.id === BIOLOGY_EOC_MODULE_ID);
  if (!mod) return [];

  const wing = mod.tree.find((w) => w.id === 'bio.eoc');
  if (!wing) return [];

  return wing.children.map((room) => {
    const unitIds = new Set(
      room.children.flatMap((drawer) => drawer.children.map((u) => u.id)),
    );
    return {
      id: room.id,
      title: room.title,
      emoji: room.emoji ?? '📋',
      tiles: live.filter((t) => unitIds.has(t.unitId)),
    };
  });
}

export const WING_GROUPS: WingGroup[] = (() => {
  const live = tilesFromModules();
  const all = [...live, ...PLACEHOLDER_TILES.filter((p) => !live.some((l) => l.unitId === p.unitId))];
  const presentWingIds = [...new Set(all.map((t) => t.wingId))];

  return WING_ORDER.filter((wingId) => presentWingIds.includes(wingId)).map((wingId) => {
    const tiles = all.filter((t) => t.wingId === wingId);
    const meta = WING_META[wingId] ?? { title: wingId, emoji: '📋' };
    return {
      wingId,
      title: meta.title,
      emoji: meta.emoji,
      tiles,
      subgroups:
        wingId === 'bio.eoc'
          ? bioEocSubgroups(live)
          : wingId === 'biochem'
            ? biochemSubgroups(live)
            : undefined,
    };
  });
})();

export const ALL_TILES = WING_GROUPS.flatMap((g) => g.tiles);

/** Intro EOC units visible on the home grid before first play. */
export function introBiochemUnitIds(): string[] {
  return flattenUnits(CONTENT_MODULES)
    .filter((u) => u.id.startsWith('biochem.') && u.difficulty === 'intro')
    .map((u) => u.id);
}

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
