import type { ContentModule } from '@/types';
import { biochemistryWing } from '@/content/biochemistry/unit1-biochemistry';
import { cellsWing } from '@/content/biochemistry/unit2-cells';
import { divisionWing } from '@/content/biochemistry/unit3-division';
import { proteinWing } from '@/content/biochemistry/unit4-protein';
import { heredityWing } from '@/content/biochemistry/unit5-heredity';
import { evolutionWing } from '@/content/biochemistry/unit6-evolution';
import { ecologyWing } from '@/content/biochemistry/unit7-ecology';

const biochemistryModule: ContentModule = {
  id: 'mod.biochemistry.bundled',
  title: 'Biology EOC Review',
  description:
    'Biochemistry, cells, genetics, evolution, and ecology — EOC review from BioChemistry 2026 scans.',
  schemaVersion: 1,
  appVersionAtAuthoring: '0.1.0',
  source: 'bundled',
  createdAt: Date.now(),
  tree: [
    biochemistryWing,
    cellsWing,
    divisionWing,
    proteinWing,
    heredityWing,
    evolutionWing,
    ecologyWing,
  ],
};

export default biochemistryModule;
