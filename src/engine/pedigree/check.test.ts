import { describe, expect, it } from 'vitest';
import { findInconsistencies, isPatternConsistent } from '@/engine/pedigree/check';
import type { PedigreeDetectiveData } from '@/types/schemas';

const cfPedigree: PedigreeDetectiveData = {
  traitLabel: 'Cystic fibrosis',
  people: [
    { id: 'I-1', label: 'I-1', sex: 'M', affected: false, generation: 1 },
    { id: 'I-2', label: 'I-2', sex: 'F', affected: false, generation: 1 },
    {
      id: 'II-1',
      label: 'II-1',
      sex: 'F',
      affected: true,
      generation: 2,
      motherId: 'I-2',
      fatherId: 'I-1',
    },
  ],
  canonical: {
    pattern: 'autosomal-recessive',
    poweredIdea: 'Recessive traits can skip generations.',
  },
};

describe('pedigree check', () => {
  it('flags autosomal dominant when unaffected parents have affected child', () => {
    const hits = findInconsistencies(cfPedigree, 'autosomal-dominant');
    expect(hits.some((h) => h.personId === 'II-1')).toBe(true);
  });

  it('accepts autosomal recessive for carrier-parent pedigree', () => {
    expect(isPatternConsistent(cfPedigree, 'autosomal-recessive')).toBe(true);
    expect(findInconsistencies(cfPedigree, 'autosomal-recessive')).toHaveLength(0);
  });

  it('flags Y-linked trait in females', () => {
    const hits = findInconsistencies(cfPedigree, 'y-linked');
    expect(hits.some((h) => h.personId === 'II-1')).toBe(true);
  });
});
