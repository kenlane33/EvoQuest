import type { ContentModule } from '@/types';
import { applyBioEocSupersedes, bioEocMorphemes, bioEocWing } from '@/content/bio-eoc';
import { BIO_EOC_SUPERSEDES_SET } from '@/content/bio-eoc/supersedes';
import { biochemistryWing } from '@/content/biochemistry/unit1-biochemistry';
import { cellsWing } from '@/content/biochemistry/unit2-cells';
import { divisionWing } from '@/content/biochemistry/unit3-division';
import { proteinWing } from '@/content/biochemistry/unit4-protein';
import { heredityWing } from '@/content/biochemistry/unit5-heredity';
import { evolutionWing } from '@/content/biochemistry/unit6-evolution';
import { ecologyWing } from '@/content/biochemistry/unit7-ecology';

const biochemistryModule: ContentModule = applyBioEocSupersedes(
  {
    id: 'mod.biochemistry.bundled',
    title: 'Biology EOC Review',
    description:
      'NC Biology EOC review — 2025-aligned interactive units plus worksheet-scan coverage for remaining strands.',
    schemaVersion: 1,
    appVersionAtAuthoring: '0.1.0',
    source: 'bundled',
    createdAt: Date.now(),
    tree: [
      bioEocWing,
      biochemistryWing,
      cellsWing,
      divisionWing,
      proteinWing,
      heredityWing,
      evolutionWing,
      ecologyWing,
    ],
    etymologyContributions: bioEocMorphemes,
  },
  BIO_EOC_SUPERSEDES_SET,
);

export default biochemistryModule;
