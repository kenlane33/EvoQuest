import { describe, expect, it } from 'vitest';
import { orderMatchesProcedure } from '@/engine/procedure/scoring';
import type { ProcedureBuilderData } from '@/types/schemas';

const dogma: ProcedureBuilderData = {
  goal: 'Make protein',
  initialState: 'DNA',
  targetState: 'Protein',
  blocks: [
    { id: 'a', label: 'A', narration: 'Step A' },
    { id: 'b', label: 'B', narration: 'Step B' },
  ],
  canonicalOrder: ['a', 'b'],
  alternateOrders: [['b', 'a']],
  poweredIdea: 'Pipeline',
};

describe('procedure scoring', () => {
  it('accepts canonical and alternate orders', () => {
    expect(orderMatchesProcedure(dogma, ['a', 'b'])).toBe(true);
    expect(orderMatchesProcedure(dogma, ['b', 'a'])).toBe(true);
    expect(orderMatchesProcedure(dogma, ['a', 'a'])).toBe(false);
  });
});
