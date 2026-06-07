import { describe, expect, it } from 'vitest';
import { punnettRatioMatches } from '@/engine/templates/punnett-builder';

const peaData = {
  dominantPhenotype: 'Purple',
  expectedRatio: '2:2',
  phenotypeMap: {
    PP: { label: 'Purple', color: '#a855f7' },
    Pp: { label: 'Purple', color: '#a855f7' },
    pp: { label: 'White', color: '#94a3b8' },
  },
};

const bloodTypeData = {
  dominantPhenotype: 'Type AB',
  expectedRatio: '1:1:1:1',
  phenotypeMap: {
    AB: { label: 'Type AB', color: '#a855f7' },
    Ai: { label: 'Type A', color: '#ef4444' },
    iB: { label: 'Type B', color: '#3b82f6' },
    ii: { label: 'Type O', color: '#94a3b8' },
  },
};

describe('punnettRatioMatches', () => {
  it('accepts a 2:2 monohybrid ratio', () => {
    expect(punnettRatioMatches(peaData, { Purple: 2, White: 2 })).toBe(true);
    expect(punnettRatioMatches(peaData, { Purple: 3, White: 1 })).toBe(false);
  });

  it('accepts a 1:1:1:1 blood-type ratio', () => {
    expect(
      punnettRatioMatches(bloodTypeData, {
        'Type AB': 1,
        'Type A': 1,
        'Type B': 1,
        'Type O': 1,
      }),
    ).toBe(true);
    expect(
      punnettRatioMatches(bloodTypeData, {
        'Type AB': 2,
        'Type A': 1,
        'Type B': 1,
        'Type O': 0,
      }),
    ).toBe(false);
  });
});
