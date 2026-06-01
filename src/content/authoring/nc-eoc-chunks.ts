/** NC Biology EOC (2023 NCSCOS) — one authoring chunk = one Room JSON file. */

export type NcEocChunkId =
  | 'macromolecules'
  | 'cell-structure'
  | 'gene-expression'
  | 'division-homeostasis'
  | 'energy'
  | 'ecosystems'
  | 'heredity'
  | 'biotech'
  | 'evolution';

export type NcEocChunk = {
  id: NcEocChunkId;
  /** Save as plan/inbox/bio-eoc-{outFileSlug}.json */
  outFileSlug: string;
  roomId: string;
  roomSlug: string;
  roomTitle: string;
  roomEmoji: string;
  roomDescription: string;
  /** NC 2023 objectives this room must cover (authorNotes on each unit). */
  objectives: string[];
  /** Target KnowledgeUnit count for this room. */
  unitCount: string;
  /** Bundled units this room should surpass, not duplicate verbatim. */
  existingBundledUnits: string[];
  /** EOC test weight guidance from NCDPI blueprint. */
  testWeight: string;
  /** Drawer titles inside the room (model generates 2–4 drawers). */
  drawerHints: string[];
  sourceMaterialHint: string;
  status: 'done' | 'pending';
};

export const NC_EOC_MODULE = {
  id: 'mod.bio-eoc.user',
  title: 'Biology EOC Review',
  description:
    'Complete NC Biology End-of-Course review aligned to 2023 NCSCOS and the 2025 released form. All four strands: molecules to organisms, ecosystems, heredity, evolution.',
  wingId: 'bio.eoc',
  wingSlug: 'bio-eoc',
  authorRef: 'ken',
} as const;

export const NC_EOC_CHUNKS: NcEocChunk[] = [
  {
    id: 'macromolecules',
    outFileSlug: 'macromolecules',
    roomId: 'bio.eoc.macromolecules',
    roomSlug: 'macromolecules',
    roomTitle: 'Macromolecules & Enzymes',
    roomEmoji: '🧪',
    roomDescription:
      'Structure–function of the four macromolecule classes and enzyme catalysis (Strand: From Molecules to Organisms).',
    objectives: [
      'LS.Bio.1.1 — macromolecule structure–function (carbs, lipids, proteins, nucleic acids)',
      'LS.Bio.1.2 — enzymes as catalysts; temperature, pH, substrate concentration effects',
    ],
    unitCount: '4–5',
    existingBundledUnits: [
      'biochem.macromolecules.four-groups',
      'biochem.macromolecules.examples',
      'biochem.enzymes.basics',
      'biochem.enzymes.factors',
    ],
    testWeight: 'Part of 26–34% From Molecules to Organisms strand (~13–17 items total)',
    drawerHints: ['Macromolecule Structure', 'Enzyme Action'],
    sourceMaterialHint:
      '2025 NC Biology EOC released form items on monomers/polymers, functional groups, Benedict/Lugol tests, enzyme graphs. Cover common wrong answers: lipids are not polymers of amino acids; enzymes are not consumed.',
    status: 'done',
  },
  {
    id: 'cell-structure',
    outFileSlug: 'cell-structure',
    roomId: 'bio.eoc.cell-structure',
    roomSlug: 'cell-structure',
    roomTitle: 'Cell Structure & Transport',
    roomEmoji: '🦠',
    roomDescription:
      'Organelle function, prokaryote vs eukaryote complexity, and membrane transport (Strand: From Molecules to Organisms).',
    objectives: [
      'LS.Bio.1.3 — organelle structure determines function; organelle interactions',
      'LS.Bio.1.4 — compare prokaryotic and eukaryotic cells (complexity, structures)',
    ],
    unitCount: '4–5',
    existingBundledUnits: [
      'biochem.cells.organelles',
      'biochem.cells.compare',
      'biochem.cells.diagrams',
      'biochem.transport.types',
      'biochem.transport.osmosis',
    ],
    testWeight: 'Part of 26–34% From Molecules to Organisms strand',
    drawerHints: ['Organelles & Cell Types', 'Membrane Transport'],
    sourceMaterialHint:
      'EOC items on plant vs animal cells, chloroplast/mitochondria roles, passive vs active transport, hypertonic/hypotonic/isotonic, turgor pressure. Use scenario quizzes for osmosis in plant cells.',
    status: 'done',
  },
  {
    id: 'gene-expression',
    outFileSlug: 'gene-expression',
    roomId: 'bio.eoc.gene-expression',
    roomSlug: 'gene-expression',
    roomTitle: 'DNA, RNA & Protein Synthesis',
    roomEmoji: '🧬',
    roomDescription:
      'Central dogma, gene expression, and how differentiation links to specialized function (Strand: From Molecules to Organisms).',
    objectives: [
      'LS.Bio.1.5 — DNA and RNA direct protein synthesis',
      'LS.Bio.2.2 — proteins regulate gene expression → differentiation, specialization, uncontrolled growth',
    ],
    unitCount: '4–5',
    existingBundledUnits: [
      'biochem.protein.dna-structure',
      'biochem.protein.dna-vs-rna',
      'biochem.protein.transcription',
      'biochem.protein.mutations',
      'biochem.division.stem-cells',
    ],
    testWeight: 'Part of 26–34% From Molecules to Organisms strand',
    drawerHints: ['Central Dogma', 'Gene Expression & Differentiation'],
    sourceMaterialHint:
      'EOC items on complementary base pairing, transcription vs translation location, codon/amino acid tables, point vs frameshift mutations, cancer as loss of cell-cycle control. Prefer procedure-builder or recipe-sequencer for central dogma steps.',
    status: 'done',
  },
  {
    id: 'division-homeostasis',
    outFileSlug: 'division-homeostasis',
    roomId: 'bio.eoc.division',
    roomSlug: 'division',
    roomTitle: 'Cell Division & Homeostasis',
    roomEmoji: '🔬',
    roomDescription:
      'Mitosis/meiosis outcomes and feedback mechanisms that maintain homeostasis (Strand: From Molecules to Organisms).',
    objectives: [
      'LS.Bio.2.1 — cellular division for reproduction, growth, and repair',
      'LS.Bio.3.1 — homeostasis maintained through feedback mechanisms',
    ],
    unitCount: '3–4',
    existingBundledUnits: [
      'biochem.division.cell-cycle',
      'biochem.division.mitosis-meiosis',
      'biochem.division.crossing-over',
    ],
    testWeight: 'Part of 26–34% From Molecules to Organisms strand',
    drawerHints: ['Cell Cycle & Division', 'Homeostasis & Feedback'],
    sourceMaterialHint:
      'EOC items comparing mitosis vs meiosis outcomes, interphase vs division phases, diploid/haploid, negative feedback loops (blood glucose, temperature). Use debug-the-claim for “mitosis produces gametes”.',
    status: 'done',
  },
  {
    id: 'energy',
    outFileSlug: 'energy',
    roomId: 'bio.eoc.energy',
    roomSlug: 'energy',
    roomTitle: 'Photosynthesis & Cellular Respiration',
    roomEmoji: '☀️',
    roomDescription:
      'Energy transformations in autotrophs and heterotrophs; ATP as usable chemical energy (Strand: From Molecules to Organisms).',
    objectives: [
      'LS.Bio.3.2 — photosynthesis transforms light energy into chemical energy',
      'LS.Bio.3.3 — cellular respiration (aerobic and anaerobic) transforms chemical energy into ATP',
    ],
    unitCount: '4–5',
    existingBundledUnits: [
      'biochem.energy.photosynthesis-respiration',
    ],
    testWeight: 'Part of 26–34% From Molecules to Organisms strand',
    drawerHints: ['Photosynthesis', 'Cellular Respiration'],
    sourceMaterialHint:
      'EOC items on inputs/outputs of photosynthesis and aerobic respiration, role of chloroplasts and mitochondria, fermentation vs aerobic ATP yield, energy flow diagrams. The existing bundled unit is thin — expand with equation balancing, stage locations, and compare/contrast scenarios.',
    status: 'done',
  },
  {
    id: 'ecosystems',
    outFileSlug: 'ecosystems',
    roomId: 'bio.eoc.ecosystems',
    roomSlug: 'ecosystems',
    roomTitle: 'Ecosystems & Population Dynamics',
    roomEmoji: '🌿',
    roomDescription:
      'Matter and energy flow, biogeochemical cycles, and population/community interactions (Strand: Ecosystems).',
    objectives: [
      'LS.Bio.4.1 — matter and energy flow through ecosystems',
      'LS.Bio.4.2 — biogeochemical cycles (carbon, nitrogen, water)',
      'LS.Bio.5.1 — population growth patterns and limiting factors',
      'LS.Bio.5.2 — community interactions and ecosystem stability',
    ],
    unitCount: '5–6',
    existingBundledUnits: [
      'biochem.ecology.levels',
      'biochem.ecology.food-web',
      'biochem.ecology.energy-pyramid',
      'biochem.ecology.cycles',
      'biochem.ecology.population',
      'biochem.ecology.behavior-conservation',
      'biochem.ecology.plants-atmosphere',
    ],
    testWeight: '14–22% of test (~7–11 items)',
    drawerHints: ['Energy & Matter Flow', 'Cycles & Populations', 'Interactions & Stability'],
    sourceMaterialHint:
      'EOC items on food webs, 10% energy rule, carbon/nitrogen cycle steps, carrying capacity, predator–prey, invasive species, conservation. Prefer food-web-builder and concept-map-builder where appropriate.',
    status: 'done',
  },
  {
    id: 'heredity',
    outFileSlug: 'heredity',
    roomId: 'bio.eoc.heredity',
    roomSlug: 'heredity',
    roomTitle: 'Heredity & Genetics',
    roomEmoji: '🌱',
    roomDescription:
      'Inheritance patterns, Mendelian and non-Mendelian genetics, pedigrees, and chromosome basis of traits (Strand: Heredity).',
    objectives: [
      'LS.Bio.6.1 — DNA as hereditary material; chromosome structure',
      'LS.Bio.6.2 — Mendelian inheritance and probability',
      'LS.Bio.7.1 — meiosis and genetic variation (crossing over, independent assortment)',
      'LS.Bio.7.2 — non-Mendelian patterns (incomplete dominance, codominance, multiple alleles, sex-linked)',
      'LS.Bio.7.3 — pedigrees and genetic disorders',
    ],
    unitCount: '10',
    existingBundledUnits: [
      'biochem.heredity.patterns',
      'biochem.heredity.karyotype',
      'biochem.division.crossing-over',
    ],
    testWeight: '24–32% of test (~12–16 items) — highest-weight strand after molecules',
    drawerHints: ['Mendelian Genetics', 'Beyond Mendel', 'Pedigrees & Chromosomes'],
    sourceMaterialHint:
      'EOC items on Punnett squares, monohybrid/dihybrid ratios, blood type genetics, sex-linked traits, pedigree interpretation, karyotype disorders. Use punnett-builder and pedigree-detective templates.',
    status: 'done',
  },
  {
    id: 'biotech',
    outFileSlug: 'biotech',
    roomId: 'bio.eoc.biotech',
    roomSlug: 'biotech',
    roomTitle: 'Biotechnology',
    roomEmoji: '🔬',
    roomDescription:
      'Lab techniques and genetic engineering applications (Strand: Heredity).',
    objectives: [
      'LS.Bio.8.1 — biotechnology techniques (gel electrophoresis, DNA fingerprinting, PCR concepts)',
      'LS.Bio.8.2 — genetic engineering applications and ethical considerations',
    ],
    unitCount: '3–4',
    existingBundledUnits: [
      'biochem.heredity.gel-electrophoresis',
      'biochem.heredity.dna-fingerprint',
      'biochem.heredity.biotech',
    ],
    testWeight: 'Part of 24–32% Heredity strand',
    drawerHints: ['Lab Techniques', 'Genetic Engineering'],
    sourceMaterialHint:
      'EOC items on reading gel bands (size vs distance), restriction enzymes, recombinant DNA, transgenic organisms, CRISPR basics, ethics of GMOs/cloning. Scenario-based “what does this gel show?” questions.',
    status: 'done',
  },
  {
    id: 'evolution',
    outFileSlug: 'evolution',
    roomId: 'bio.eoc.evolution',
    roomSlug: 'evolution',
    roomTitle: 'Evolution & Natural Selection',
    roomEmoji: '🦎',
    roomDescription:
      'Variation, selection, resistance, common ancestry, and classification (Strand: Biological Evolution).',
    objectives: [
      'LS.Bio.9.1 — antibiotic/pesticide resistance via selection',
      'LS.Bio.9.2 — evidence of common ancestry (molecular evidence strongest)',
      'LS.Bio.9.3 — mutations as source of variation',
      'LS.Bio.9.4 — selective pressure and trait frequency',
      'LS.Bio.10.1 — classification systems and binomial nomenclature',
      'LS.Bio.10.2 — phylogenetic trees and cladograms',
    ],
    unitCount: '6',
    existingBundledUnits: [
      'biochem.evolution.evidence',
      'biochem.evolution.natural-selection',
      'biochem.evolution.speciation',
      'biochem.evolution.classification',
      'biochem.evolution.dichotomous-key',
    ],
    testWeight: '20–28% of test (~10–14 items)',
    drawerHints: ['Natural Selection & Evidence', 'Classification & Phylogeny'],
    sourceMaterialHint:
      'EOC items on natural selection, resistance, common ancestry (LS.Bio.9), dichotomous keys (#30, #32), and cladogram reading (#50) (LS.Bio.10.2). Use cladogram-crafter and dichotomous-key scenarios.',
    status: 'done',
  },
];

export function getNcEocChunk(id: NcEocChunkId): NcEocChunk {
  const chunk = NC_EOC_CHUNKS.find((c) => c.id === id);
  if (!chunk) throw new Error(`Unknown NC EOC chunk: ${id}`);
  return chunk;
}

export function pendingNcEocChunks(): NcEocChunk[] {
  return NC_EOC_CHUNKS.filter((c) => c.status === 'pending');
}
