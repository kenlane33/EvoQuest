import { describe, expect, it } from 'vitest';
import { diffConceptMap, passesConceptMap } from '@/engine/concept-map/diff';
import type { ConceptMapBuilderData } from '@/types/schemas';

const sample: ConceptMapBuilderData = {
  focalConcept: 'Respiration',
  nodes: [
    { id: 'glucose', label: 'Glucose' },
    { id: 'mito', label: 'Mitochondrion' },
    { id: 'atp', label: 'ATP' },
  ],
  canonicalEdges: [
    {
      from: 'glucose',
      to: 'mito',
      label: 'enters',
      importance: 'critical',
      reasonIfMissing: 'Glucose feeds respiration.',
    },
    {
      from: 'mito',
      to: 'atp',
      label: 'produces',
      importance: 'critical',
      reasonIfMissing: 'Mitochondria make ATP.',
    },
  ],
  allowedLabels: ['enters', 'produces'],
  poweredIdea: 'Network thinking.',
};

describe('concept map diff', () => {
  it('passes when all critical edges match', () => {
    const edges = [
      { from: 'glucose', to: 'mito', label: 'enters' },
      { from: 'mito', to: 'atp', label: 'produces' },
    ];
    expect(passesConceptMap(sample, edges)).toBe(true);
  });

  it('lists missing critical edges', () => {
    const diff = diffConceptMap(sample, [
      { from: 'glucose', to: 'mito', label: 'enters' },
    ]);
    expect(diff.missing).toHaveLength(1);
    expect(diff.missing[0].to).toBe('atp');
  });
});
