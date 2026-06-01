import type { ContentModule, Drawer, KnowledgeUnit, Room, Wing } from '@/types';
import { mergeBioEocRoomModules } from '@/content/bio-eoc/merge-rooms';
import { ROOM_MODULES } from '@/content/bio-eoc/room-registry';

export { NC_EOC_ROOM_ORDER, ROOM_MODULES } from '@/content/bio-eoc/room-registry';
export {
  BIO_EOC_SUPERSEDES_BIOCHEM,
  BIO_EOC_SUPERSEDES_MAP,
  BIO_EOC_SUPERSEDES_PENDING,
  BIO_EOC_SUPERSEDES_SET,
  supersedesByRoom,
  type BioEocSupersedesEntry,
} from '@/content/bio-eoc/supersedes';

export const { wing: bioEocWing, etymologyContributions: bioEocMorphemes } =
  mergeBioEocRoomModules(ROOM_MODULES);

export { BIO_EOC_FIG } from '@/content/bio-eoc/figures';

function mapUnit(unit: KnowledgeUnit, disabledIds: ReadonlySet<string>): KnowledgeUnit {
  return disabledIds.has(unit.id) ? { ...unit, enabled: false } : unit;
}

function mapDrawer(drawer: Drawer, disabledIds: ReadonlySet<string>): Drawer {
  return {
    ...drawer,
    children: drawer.children.map((unit) => mapUnit(unit, disabledIds)),
  };
}

function mapRoom(room: Room, disabledIds: ReadonlySet<string>): Room {
  return {
    ...room,
    children: room.children.map((drawer) => mapDrawer(drawer, disabledIds)),
  };
}

function mapWing(wing: Wing, disabledIds: ReadonlySet<string>): Wing {
  return {
    ...wing,
    children: wing.children.map((room) => mapRoom(room, disabledIds)),
  };
}

/** Disable legacy biochem units that bio.eoc.* content replaces. */
export function applyBioEocSupersedes(
  mod: ContentModule,
  disabledIds: ReadonlySet<string>,
): ContentModule {
  return {
    ...mod,
    tree: mod.tree.map((wing) => mapWing(wing, disabledIds)),
  };
}
