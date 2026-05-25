import type { ContentModule, KnowledgeUnit, Wing } from '@/types';

export function flattenUnits(modules: ContentModule[]): KnowledgeUnit[] {
  const units: KnowledgeUnit[] = [];
  for (const mod of modules) {
    for (const wing of mod.tree) {
      for (const room of wing.children) {
        for (const drawer of room.children) {
          units.push(...drawer.children);
        }
      }
    }
  }
  return units;
}

export function getWings(modules: ContentModule[]): Wing[] {
  return modules.flatMap((m) => m.tree);
}

export function findUnit(modules: ContentModule[], unitId: string): KnowledgeUnit | undefined {
  return flattenUnits(modules).find((u) => u.id === unitId || u.aliases?.includes(unitId));
}

export function findDrawerContaining(
  modules: ContentModule[],
  unitId: string,
): { drawerId: string; siblings: KnowledgeUnit[] } | undefined {
  for (const mod of modules) {
    for (const wing of mod.tree) {
      for (const room of wing.children) {
        for (const drawer of room.children) {
          if (drawer.children.some((u) => u.id === unitId)) {
            return { drawerId: drawer.id, siblings: drawer.children };
          }
        }
      }
    }
  }
  return undefined;
}

export function collectUnitsUnderNode(
  modules: ContentModule[],
  nodeId: string,
): KnowledgeUnit[] {
  for (const mod of modules) {
    for (const wing of mod.tree) {
      if (wing.id === nodeId) {
        return flattenUnits([{ ...mod, tree: [wing] }]);
      }
      for (const room of wing.children) {
        if (room.id === nodeId) {
          return room.children.flatMap((d) => d.children);
        }
        for (const drawer of room.children) {
          if (drawer.id === nodeId) {
            return drawer.children;
          }
        }
      }
    }
  }
  return [];
}
