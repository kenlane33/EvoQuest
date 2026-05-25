import { describe, expect, it } from 'vitest';
import { orderMatchesCanonical, scoreOrder } from '@/engine/cladogram/scoring';
import type { CladogramCrafterData } from '@/types/schemas';

const tetrapod: CladogramCrafterData = {
  taxa: [
    { id: 'lancelet', name: 'Lancelet', isOutgroup: true },
    { id: 'shark', name: 'Shark' },
    { id: 'frog', name: 'Frog' },
    { id: 'lizard', name: 'Lizard' },
    { id: 'mouse', name: 'Mouse' },
    { id: 'sparrow', name: 'Sparrow' },
  ],
  outgroupId: 'lancelet',
  traits: [
    { id: 'vert', label: 'Vertebrae' },
    { id: 'lungs', label: 'Lungs' },
    { id: 'amniotic', label: 'Amniotic egg' },
    { id: 'hair', label: 'Hair' },
    { id: 'feathers', label: 'Feathers' },
  ],
  traitMatrix: {
    lancelet: { vert: 0, lungs: 0, amniotic: 0, hair: 0, feathers: 0 },
    shark: { vert: 1, lungs: 0, amniotic: 0, hair: 0, feathers: 0 },
    frog: { vert: 1, lungs: 1, amniotic: 0, hair: 0, feathers: 0 },
    lizard: { vert: 1, lungs: 1, amniotic: 1, hair: 0, feathers: 0 },
    sparrow: { vert: 1, lungs: 1, amniotic: 1, hair: 0, feathers: 1 },
    mouse: { vert: 1, lungs: 1, amniotic: 1, hair: 1, feathers: 0 },
  },
  canonicalOrder: ['lancelet', 'shark', 'frog', 'lizard', 'mouse', 'sparrow'],
  canonicalParsimonyScore: 6,
  poweredIdea: 'Parsimony clusters shared derived traits.',
};

describe('cladogram scoring', () => {
  it('scores canonical order at the documented minimum', () => {
    expect(scoreOrder(tetrapod, tetrapod.canonicalOrder)).toBe(6);
  });

  it('scores scrambled order higher than canonical', () => {
    const scrambled = ['sparrow', 'lancelet', 'frog', 'shark', 'mouse', 'lizard'];
    expect(scoreOrder(tetrapod, scrambled)).toBeGreaterThan(6);
  });

  it('matches only the canonical leaf order', () => {
    expect(orderMatchesCanonical(tetrapod, tetrapod.canonicalOrder)).toBe(true);
    expect(
      orderMatchesCanonical(tetrapod, [...tetrapod.canonicalOrder].reverse()),
    ).toBe(false);
  });
});
