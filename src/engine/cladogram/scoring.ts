import type { CladogramCrafterData } from '@/types/schemas';

/** Heuristic parsimony: count trait-state changes along left-to-right leaf order. */
export function scoreOrder(data: CladogramCrafterData, order: string[]): number {
  let score = 0;
  for (const trait of data.traits) {
    let prev = data.traitMatrix[order[0]]?.[trait.id] ?? 0;
    for (let i = 1; i < order.length; i++) {
      const cur = data.traitMatrix[order[i]]?.[trait.id] ?? 0;
      if (cur !== prev) score++;
      prev = cur;
    }
  }
  return score;
}

export function orderMatchesCanonical(
  data: CladogramCrafterData,
  order: string[],
): boolean {
  if (order.length !== data.canonicalOrder.length) return false;
  return order.every((id, i) => id === data.canonicalOrder[i]);
}
