import { describe, expect, it } from 'vitest';
import {
  analyzeUnitFigures,
  extractMarkdownFigureRefs,
  figureIdFromPath,
} from '@/lib/content-figures';
import type { KnowledgeUnit } from '@/types';

describe('content-figures', () => {
  it('extracts figure ids from markdown image paths', () => {
    const refs = extractMarkdownFigureRefs(
      '![Cell cycle](${FIG}/p06_cell_cycle.svg)\n\n![Hierarchy](/content/biochemistry/figures/p07_dna_hierarchy.png)',
    );
    expect(refs.map((r) => r.figureId)).toEqual(['p06_cell_cycle', 'p07_dna_hierarchy']);
    expect(refs[1]?.ext).toBe('png');
  });

  it('figureIdFromPath handles svg and png', () => {
    expect(figureIdFromPath('/content/biochemistry/figures/p02_enzyme_substrate.svg')).toBe(
      'p02_enzyme_substrate',
    );
    expect(figureIdFromPath('p07_dna_hierarchy.png')).toBe('p07_dna_hierarchy');
  });

  it('flags metadata/body mismatches and missing files', () => {
    const unit: KnowledgeUnit = {
      id: 'test.unit',
      slug: 'test',
      title: 'Test Unit',
      emoji: '🧪',
      shortLabel: 'Test',
      longLabel: 'Test Unit',
      teach: {
        headline: 'Test',
        body: '![Diagram](/content/biochemistry/figures/p06_cell_cycle.svg)',
        figures: [{ id: 'p06_cell_cycle', alt: 'Cell cycle' }],
        poweredIdea: 'Test idea.',
      },
      quizzes: [],
      achievement: {
        id: 'ach.test',
        emoji: '🧪',
        shortLabel: 'Test',
        longLabel: 'Test Unit',
        flavor: 'You test.',
        wingId: 'test',
      },
      enabled: true,
    };

    const status = analyzeUnitFigures(unit, 'mod.test');
    expect(status.missingFromBody).toEqual([]);
    expect(status.missingFromMetadata).toEqual([]);
    expect(status.missingFiles).toEqual([]);
  });
});
