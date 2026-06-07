import { describe, expect, it } from 'vitest';
import { buildDiagramPreviewCatalog } from '@/lib/dx/preview-items';

describe('buildDiagramPreviewCatalog', () => {
  it('uses bio-eoc figure paths for shipped EOC diagram quizzes', () => {
    const catalog = buildDiagramPreviewCatalog();
    const gel = catalog.items.find(
      (item) => item.id === 'quiz.bio.eoc.biotech.techniques.gel-electrophoresis.diagram-farthest',
    );
    expect(gel).toBeDefined();
    expect(gel!.figureSrc).toBe('/content/bio-eoc/figures/bio_eoc_gel_electrophoresis.svg');
    expect(gel!.figureSrc).not.toContain('/content/biochemistry/');
  });
});
