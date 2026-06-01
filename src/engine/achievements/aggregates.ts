import { CONTENT_MODULES } from '@/content';
import type { AggregateAchievementDef } from '@/engine/achievements/catalog';
import type { ContentModule, Drawer, Room, Wing } from '@/types';

function drawerAggregate(wing: Wing, _room: Room, drawer: Drawer): AggregateAchievementDef {
  return {
    id: `agg.drawer.${drawer.id}`,
    scope: 'drawer',
    nodeId: drawer.id,
    emoji: drawer.emoji ?? '📦',
    shortLabel: drawer.title.slice(0, 14),
    longLabel: drawer.title,
    flavor: `Every idea in ${drawer.title} — unlocked.`,
    wingId: wing.id.split('.')[0] ?? wing.id,
  };
}

function roomAggregate(wing: Wing, room: Room): AggregateAchievementDef {
  return {
    id: `agg.room.${room.id}`,
    scope: 'room',
    nodeId: room.id,
    emoji: room.emoji ?? '📚',
    shortLabel: room.title.slice(0, 14),
    longLabel: room.title,
    flavor: `You have cleared ${room.title}. The section holds together.`,
    wingId: wing.id.split('.')[0] ?? wing.id,
  };
}

function wingAggregate(wing: Wing): AggregateAchievementDef {
  return {
    id: `agg.wing.${wing.id}`,
    scope: 'wing',
    nodeId: wing.id,
    emoji: wing.emoji ?? '🧬',
    shortLabel: wing.title.slice(0, 14),
    longLabel: wing.title,
    flavor: `The ${wing.title} wing — every room unlocked.`,
    wingId: wing.id.split('.')[0] ?? wing.id,
  };
}

export function buildAggregateCatalog(modules: ContentModule[] = CONTENT_MODULES): AggregateAchievementDef[] {
  const aggregates: AggregateAchievementDef[] = [];
  for (const mod of modules) {
    for (const wing of mod.tree) {
      aggregates.push(wingAggregate(wing));
      for (const room of wing.children) {
        aggregates.push(roomAggregate(wing, room));
        for (const drawer of room.children) {
          aggregates.push(drawerAggregate(wing, room, drawer));
        }
      }
    }
  }
  return aggregates;
}

export const AGGREGATE_CATALOG = buildAggregateCatalog();

export function getAggregateByNodeId(nodeId: string): AggregateAchievementDef | undefined {
  return AGGREGATE_CATALOG.find((a) => a.nodeId === nodeId);
}

export function unitIdsUnderNode(modules: ContentModule[], nodeId: string): string[] {
  for (const mod of modules) {
    for (const wing of mod.tree) {
      if (wing.id === nodeId) {
        return wing.children.flatMap((r) =>
          r.children.flatMap((d) => d.children.map((u) => u.id)),
        );
      }
      for (const room of wing.children) {
        if (room.id === nodeId) {
          return room.children.flatMap((d) => d.children.map((u) => u.id));
        }
        for (const drawer of room.children) {
          if (drawer.id === nodeId) {
            return drawer.children.map((u) => u.id);
          }
        }
      }
    }
  }
  return [];
}

export function isNodeFullyUnlocked(
  nodeId: string,
  unitProgress: Record<string, { tier: string }>,
  modules: ContentModule[] = CONTENT_MODULES,
): boolean {
  const unitIds = unitIdsUnderNode(modules, nodeId);
  if (!unitIds.length) return false;
  return unitIds.every((id) => {
    const p = unitProgress[id];
    return p && p.tier !== 'locked';
  });
}
