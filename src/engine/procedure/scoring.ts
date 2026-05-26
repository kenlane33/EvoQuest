import type { ProcedureBuilderData } from '@/types/schemas';

export function orderMatchesProcedure(
  data: ProcedureBuilderData,
  order: string[],
): boolean {
  const candidates = [data.canonicalOrder, ...(data.alternateOrders ?? [])];
  return candidates.some(
    (canonical) =>
      canonical.length === order.length &&
      canonical.every((id, i) => id === order[i]),
  );
}
