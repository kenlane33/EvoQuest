import { CONTENT_MODULES } from '@/content';
import { FIG } from '@/content/biochemistry/quiz-helpers';
import { flattenUnits } from '@/engine/world';
import { getQuizPlayFigures } from '@/lib/quiz-figures';
import type { InnerQuestion, QuizTemplate } from '@/types';

export type PreviewItemStatus = 'shipped' | 'proposed';

export type PreviewItem = {
  id: string;
  status: PreviewItemStatus;
  unitId: string;
  unitTitle: string;
  sectionTitle: string;
  figureId: string;
  figureSrc: string;
  figureAlt: string;
  templateKind: string;
  prompt: string;
  answers: string[];
  ocrRef?: string;
  notes?: string;
  showsFigureInPlay: boolean;
};

export type PreviewCatalog = {
  items: PreviewItem[];
  shippedCount: number;
  proposedCount: number;
  figureCount: number;
};

type ProposedSeed = Omit<
  PreviewItem,
  'status' | 'showsFigureInPlay'
>;

const BIOLOGY_MODULE_ID = 'mod.biochemistry.bundled';

const FIGURE_EXT: Record<string, 'svg' | 'png'> = {
  p07_dna_hierarchy: 'png',
};

function figureSrc(figureId: string): string {
  const ext = FIGURE_EXT[figureId] ?? 'svg';
  return `${FIG}/${figureId}.${ext}`;
}

function summarizeQuiz(quiz: QuizTemplate): { prompt: string; answers: string[] } {
  const data = quiz.data as Record<string, unknown>;

  if (quiz.kind === 'fill') {
    return {
      prompt: String(data.prompt ?? ''),
      answers: Array.isArray(data.acceptable) ? data.acceptable.map(String) : [],
    };
  }

  if (quiz.kind === 'match') {
    return {
      prompt: `Match “${String(data.term ?? '')}” to the correct answer.`,
      answers: [String(data.correct ?? '')],
    };
  }

  if (quiz.kind === 'scenario') {
    const options = data.options as Array<{ label: string; correct?: boolean }> | undefined;
    const correct = options?.filter((o) => o.correct).map((o) => o.label) ?? [];
    return {
      prompt: String(data.prompt ?? data.scenario ?? 'Scenario question'),
      answers: correct.length ? correct : ['(see scenario options in play)'],
    };
  }

  if (quiz.kind === 'speed-reveal-mnemonic') {
    const question = data.question as InnerQuestion | undefined;
    if (question?.kind === 'multiple-choice') {
      return {
        prompt: question.prompt,
        answers: [question.options[question.correctIndex] ?? ''],
      };
    }
    if (question?.kind === 'fill') {
      return {
        prompt: question.prompt,
        answers: question.acceptable,
      };
    }
  }

  const title =
    (typeof data.processTitle === 'string' && data.processTitle) ||
    (typeof data.roomTitle === 'string' && data.roomTitle) ||
    (typeof data.scenarioTitle === 'string' && data.scenarioTitle) ||
    quiz.kind;

  return {
    prompt: title,
    answers: ['(interactive template — see play mode)'],
  };
}

function sectionTitleForUnit(unitId: string): string {
  const mod = CONTENT_MODULES.find((m) => m.id === BIOLOGY_MODULE_ID);
  if (!mod) return 'Biology EOC Review';

  for (const wing of mod.tree) {
    const ids = new Set(flattenUnits([{ ...mod, tree: [wing] }]).map((u) => u.id));
    if (ids.has(unitId)) return wing.title;
  }
  return 'Biology EOC Review';
}

function shippedItemsFromContent(): PreviewItem[] {
  const mod = CONTENT_MODULES.find((m) => m.id === BIOLOGY_MODULE_ID);
  if (!mod) return [];

  const items: PreviewItem[] = [];

  for (const unit of flattenUnits([mod])) {
    const figures = unit.teach.figures;
    if (!figures?.length) continue;

    for (const quiz of unit.quizzes) {
      const { prompt, answers } = summarizeQuiz(quiz);
      const playFigures = getQuizPlayFigures(unit, quiz);
      const primary = playFigures[0] ?? figures[0];

      items.push({
        id: quiz.id,
        status: 'shipped',
        unitId: unit.id,
        unitTitle: unit.title,
        sectionTitle: sectionTitleForUnit(unit.id),
        figureId: primary.id,
        figureSrc: playFigures[0]?.src ?? figureSrc(primary.id),
        figureAlt: primary.alt,
        templateKind: quiz.kind,
        prompt,
        answers,
        showsFigureInPlay: playFigures.length > 0,
        ocrRef: unit.tags?.includes('biochemistry') ? undefined : undefined,
      });
    }
  }

  return items;
}

/** Diagram-forward items awaiting your approval before they ship in content. */
export const PROPOSED_DIAGRAM_ITEMS: ProposedSeed[] = [
  {
    id: 'proposed.quiz.biochem.enzymes.active-site',
    unitId: 'biochem.enzymes.basics',
    unitTitle: 'Enzymes and Catalysts',
    sectionTitle: 'Biochemistry',
    figureId: 'p02_enzyme_substrate',
    figureSrc: figureSrc('p02_enzyme_substrate'),
    figureAlt: 'Enzyme-substrate complex with active site, substrate, and products labeled',
    templateKind: 'fill',
    prompt: 'In the diagram, the substrate binds at the enzyme’s _____.',
    answers: ['active site', 'active-site'],
    ocrRef: 'Unit 1 Q5 — enzyme-substrate complex',
    notes: 'Pairs with p02_enzyme_substrate.svg; teach block already shows labels.',
  },
  {
    id: 'proposed.quiz.biochem.enzymes.release-products',
    unitId: 'biochem.enzymes.basics',
    unitTitle: 'Enzymes and Catalysts',
    sectionTitle: 'Biochemistry',
    figureId: 'p02_enzyme_substrate',
    figureSrc: figureSrc('p02_enzyme_substrate'),
    figureAlt: 'Enzyme-substrate complex with active site, substrate, and products labeled',
    templateKind: 'fill',
    prompt: 'After the reaction, the enzyme releases _____ and is unchanged.',
    answers: ['products', 'product'],
    ocrRef: 'Unit 1 Q5 — products leave active site',
  },
  {
    id: 'proposed.quiz.biochem.cells.diagram.cell-wall',
    unitId: 'biochem.cells.diagrams',
    unitTitle: 'Plant and Animal Cell Diagrams',
    sectionTitle: 'Cells & Transport',
    figureId: 'p04_plant_animal_cells',
    figureSrc: figureSrc('p04_plant_animal_cells'),
    figureAlt: 'Labeled cross-sections of plant and animal cells',
    templateKind: 'fill',
    prompt: 'Using the plant cell diagram, the rigid outer layer is the _____.',
    answers: ['cell wall', 'cellwall'],
    ocrRef: 'Unit 2–4 Q3 — label plant cell',
  },
  {
    id: 'proposed.quiz.biochem.cells.diagram.chloroplast',
    unitId: 'biochem.cells.diagrams',
    unitTitle: 'Plant and Animal Cell Diagrams',
    sectionTitle: 'Cells & Transport',
    figureId: 'p04_plant_animal_cells',
    figureSrc: figureSrc('p04_plant_animal_cells'),
    figureAlt: 'Labeled cross-sections of plant and animal cells',
    templateKind: 'fill',
    prompt: 'In the diagram, photosynthesis occurs in the _____.',
    answers: ['chloroplast', 'chloroplasts'],
    ocrRef: 'Unit 2–4 Q3 — chloroplast label',
  },
  {
    id: 'proposed.quiz.biochem.cells.diagram.mitochondria-shared',
    unitId: 'biochem.cells.diagrams',
    unitTitle: 'Plant and Animal Cell Diagrams',
    sectionTitle: 'Cells & Transport',
    figureId: 'p04_plant_animal_cells',
    figureSrc: figureSrc('p04_plant_animal_cells'),
    figureAlt: 'Labeled cross-sections of plant and animal cells',
    templateKind: 'fill',
    prompt: 'Both cells in the diagram contain _____ for ATP production.',
    answers: ['mitochondria', 'mitochondrion'],
    ocrRef: 'Unit 2–4 Q3 — mitochondria label',
  },
  {
    id: 'proposed.quiz.biochem.osmosis.diagram-cell-a',
    unitId: 'biochem.transport.osmosis',
    unitTitle: 'Types of Osmosis in Plant Cells',
    sectionTitle: 'Cells & Transport',
    figureId: 'p05_osmosis_types',
    figureSrc: figureSrc('p05_osmosis_types'),
    figureAlt: 'Three osmosis outcomes in plant cells',
    templateKind: 'fill',
    prompt: 'In the diagram, cell A is _____ (hypertonic solution).',
    answers: ['plasmolyzed', 'plasmolysed'],
    ocrRef: 'Page 5 — plasmolyzed / hypertonic',
  },
  {
    id: 'proposed.quiz.biochem.osmosis.diagram-cell-c',
    unitId: 'biochem.transport.osmosis',
    unitTitle: 'Types of Osmosis in Plant Cells',
    sectionTitle: 'Cells & Transport',
    figureId: 'p05_osmosis_types',
    figureSrc: figureSrc('p05_osmosis_types'),
    figureAlt: 'Three osmosis outcomes in plant cells',
    templateKind: 'fill',
    prompt: 'In the diagram, cell C is _____ (hypotonic solution).',
    answers: ['turgid'],
    ocrRef: 'Page 5 — turgid / hypotonic',
  },
  {
    id: 'proposed.quiz.biochem.cycle.letter-a',
    unitId: 'biochem.division.cell-cycle',
    unitTitle: 'Phases of the Cell Cycle',
    sectionTitle: 'Cell Division',
    figureId: 'p06_cell_cycle',
    figureSrc: figureSrc('p06_cell_cycle'),
    figureAlt: 'Cell cycle circle with phases labeled A through E',
    templateKind: 'fill',
    prompt: 'On the cell cycle diagram, letter A is _____.',
    answers: ['interphase', 's phase', 'synthesis'],
    ocrRef: 'Unit 2–4 Q16 — letter A = interphase',
  },
  {
    id: 'proposed.quiz.biochem.cycle.letter-d',
    unitId: 'biochem.division.cell-cycle',
    unitTitle: 'Phases of the Cell Cycle',
    sectionTitle: 'Cell Division',
    figureId: 'p06_cell_cycle',
    figureSrc: figureSrc('p06_cell_cycle'),
    figureAlt: 'Cell cycle circle with phases labeled A through E',
    templateKind: 'fill',
    prompt: 'On the cell cycle diagram, letter D is _____.',
    answers: ['prophase'],
    ocrRef: 'Unit 2–4 Q16 — letter D = prophase',
  },
  {
    id: 'proposed.quiz.biochem.cycle.letter-e',
    unitId: 'biochem.division.cell-cycle',
    unitTitle: 'Phases of the Cell Cycle',
    sectionTitle: 'Cell Division',
    figureId: 'p06_cell_cycle',
    figureSrc: figureSrc('p06_cell_cycle'),
    figureAlt: 'Cell cycle circle with phases labeled A through E',
    templateKind: 'fill',
    prompt: 'On the cell cycle diagram, letter E is _____.',
    answers: ['anaphase'],
    ocrRef: 'Unit 2–4 Q16 — letter E = anaphase',
  },
  {
    id: 'proposed.quiz.biochem.dna.backbone',
    unitId: 'biochem.protein.dna-structure',
    unitTitle: 'DNA Structure',
    sectionTitle: 'Protein Synthesis',
    figureId: 'p07_dna_structure',
    figureSrc: figureSrc('p07_dna_structure'),
    figureAlt: 'DNA double helix with sugar-phosphate backbone labeled',
    templateKind: 'fill',
    prompt: 'In the diagram, the alternating sugar-_____ chain forms the backbone.',
    answers: ['phosphate', 'phosphates'],
    ocrRef: 'Unit 5 Q1 — draw and label DNA',
    notes: 'Shipped as quiz.biochem.dna.backbone on hierarchy diagram — review wording.',
  },
  {
    id: 'proposed.quiz.biochem.dna.base-pairs',
    unitId: 'biochem.protein.dna-structure',
    unitTitle: 'DNA Structure',
    sectionTitle: 'Protein Synthesis',
    figureId: 'p07_dna_hierarchy',
    figureSrc: figureSrc('p07_dna_hierarchy'),
    figureAlt: 'DNA hierarchy from cell to base pairs',
    templateKind: 'fill',
    prompt: 'The rungs of the DNA ladder in the hierarchy diagram are _____ pairs.',
    answers: ['base', 'nitrogenous base', 'nitrogenous bases'],
    ocrRef: 'Unit 5 Q1 — base pairing in diagram',
  },
  {
    id: 'proposed.quiz.biochem.evidence.panel-fossil',
    unitId: 'biochem.evolution.evidence',
    unitTitle: 'Evidence of Evolution',
    sectionTitle: 'Evolution',
    figureId: 'p12_evolution_evidence',
    figureSrc: figureSrc('p12_evolution_evidence'),
    figureAlt: 'Four panels of evolutionary evidence',
    templateKind: 'fill',
    prompt: 'The fossil panel in the diagram shows _____ evidence.',
    answers: ['fossil', 'fossils', 'the fossil record'],
    ocrRef: 'Unit 6 Q6 — label fossil panel',
  },
  {
    id: 'proposed.quiz.biochem.evidence.panel-embryology',
    unitId: 'biochem.evolution.evidence',
    unitTitle: 'Evidence of Evolution',
    sectionTitle: 'Evolution',
    figureId: 'p12_evolution_evidence',
    figureSrc: figureSrc('p12_evolution_evidence'),
    figureAlt: 'Four panels of evolutionary evidence',
    templateKind: 'fill',
    prompt: 'Similar early developmental stages in the diagram are _____ evidence.',
    answers: ['embryology', 'embryological', 'embryo'],
    ocrRef: 'Unit 6 Q6 — embryology panel',
  },
  {
    id: 'proposed.quiz.biochem.cladogram.sister-group',
    unitId: 'biochem.evolution.classification',
    unitTitle: 'Classification & Cladograms',
    sectionTitle: 'Evolution',
    figureId: 'p13_cladogram',
    figureSrc: figureSrc('p13_cladogram'),
    figureAlt: 'Cladogram of mammals',
    templateKind: 'fill',
    prompt: 'On the cladogram, organisms sharing the most recent branch point are most _____.',
    answers: ['closely related', 'related'],
    ocrRef: 'Unit 6 Q4 — cladogram relatedness',
  },
  {
    id: 'proposed.quiz.biochem.birds.w',
    unitId: 'biochem.evolution.dichotomous-key',
    unitTitle: 'Dichotomous Keys',
    sectionTitle: 'Evolution',
    figureId: 'p13_birds_dichotomous',
    figureSrc: figureSrc('p13_birds_dichotomous'),
    figureAlt: 'Four finch beak shapes labeled W, X, Y, and Z',
    templateKind: 'fill',
    prompt: 'Using the key and beak diagram, bird W is _____.',
    answers: ['certhidea', 'warbler finch'],
    ocrRef: 'Unit 6 Q11 — bird W = Certhidea',
    notes: 'Accept Certhidea (genus from OCR key).',
  },
  {
    id: 'proposed.quiz.biochem.birds.x',
    unitId: 'biochem.evolution.dichotomous-key',
    unitTitle: 'Dichotomous Keys',
    sectionTitle: 'Evolution',
    figureId: 'p13_birds_dichotomous',
    figureSrc: figureSrc('p13_birds_dichotomous'),
    figureAlt: 'Four finch beak shapes labeled W, X, Y, and Z',
    templateKind: 'fill',
    prompt: 'Using the key and beak diagram, bird X is _____.',
    answers: ['geospiza', 'ground finch'],
    ocrRef: 'Unit 6 Q11 — bird X = Geospiza',
  },
  {
    id: 'proposed.quiz.biochem.foodweb.hawk-prey',
    unitId: 'biochem.ecology.food-web',
    unitTitle: 'Food Webs & Chains',
    sectionTitle: 'Ecology',
    figureId: 'p15_food_web',
    figureSrc: figureSrc('p15_food_web'),
    figureAlt: 'Food web with producers, consumers, and decomposers',
    templateKind: 'fill',
    prompt: 'In the food web diagram, hawks eat snails and _____.',
    answers: ['dragonflies', 'dragonfly'],
    ocrRef: 'Unit 7 Q9 — hawk prey in pyramid/web',
  },
  {
    id: 'proposed.quiz.biochem.pyramid.ten-percent',
    unitId: 'biochem.ecology.energy-pyramid',
    unitTitle: 'Energy Pyramids',
    sectionTitle: 'Ecology',
    figureId: 'p15_energy_pyramid',
    figureSrc: figureSrc('p15_energy_pyramid'),
    figureAlt: 'Energy pyramid showing trophic levels',
    templateKind: 'fill',
    prompt: 'From the energy pyramid, about _____% of energy transfers to the next trophic level.',
    answers: ['10', 'ten', '10%'],
    ocrRef: 'Unit 7 Q10 — 10% rule',
  },
  {
    id: 'proposed.quiz.biochem.deer.carrying-capacity',
    unitId: 'biochem.ecology.population',
    unitTitle: 'Population Growth',
    sectionTitle: 'Ecology',
    figureId: 'p17_deer_population',
    figureSrc: figureSrc('p17_deer_population'),
    figureAlt: 'Deer population graph plateauing at carrying capacity',
    templateKind: 'fill',
    prompt: 'From the deer population graph, the carrying capacity is about _____ deer.',
    answers: ['80', 'eighty'],
    ocrRef: 'Unit 7 Q17 — carrying capacity on graph',
    notes: 'Shipped quiz may already exist — verify wording matches graph.',
  },
  {
    id: 'proposed.quiz.biochem.karyotype.trisomy-count',
    unitId: 'biochem.heredity.karyotype',
    unitTitle: 'Karyotypes and Chromosome Disorders',
    sectionTitle: 'Heredity',
    figureId: 'p10_karyotype',
    figureSrc: figureSrc('p10_karyotype'),
    figureAlt: 'Karyotype showing trisomy 21',
    templateKind: 'fill',
    prompt: 'The karyotype shows _____ total chromosomes (trisomy 21).',
    answers: ['47', 'forty-seven'],
    ocrRef: 'Unit 5 Q10 — karyotype chromosome count',
  },
  {
    id: 'proposed.quiz.biochem.fingerprint.match-visual',
    unitId: 'biochem.heredity.dna-fingerprint',
    unitTitle: 'DNA Fingerprinting',
    sectionTitle: 'Heredity',
    figureId: 'p09_dna_fingerprint',
    figureSrc: figureSrc('p09_dna_fingerprint'),
    figureAlt: 'DNA fingerprint lanes comparing suspects and crime scene',
    templateKind: 'speed-reveal-mnemonic',
    prompt: 'Whose DNA fingerprint matches the crime scene blood stain in the diagram?',
    answers: ['Suspect B'],
    ocrRef: 'Unit 5 Q4 — gel/fingerprint match',
    notes: 'Duplicate of shipped MC — proposed to ensure figure shows in play.',
  },
];

export function buildDiagramPreviewCatalog(): PreviewCatalog {
  const shipped = shippedItemsFromContent();
  const proposed: PreviewItem[] = PROPOSED_DIAGRAM_ITEMS.map((item) => ({
    ...item,
    status: 'proposed',
    showsFigureInPlay: false,
  }));

  const shippedIds = new Set(shipped.map((item) => item.id));
  const dedupedProposed = proposed.filter((item) => !shippedIds.has(item.id.replace(/^proposed\./, '')));

  const items = [...shipped, ...dedupedProposed].sort((a, b) => {
    const fig = a.figureId.localeCompare(b.figureId);
    if (fig !== 0) return fig;
    if (a.status !== b.status) return a.status === 'proposed' ? 1 : -1;
    return a.id.localeCompare(b.id);
  });

  const figureCount = new Set(items.map((item) => item.figureId)).size;

  return {
    items,
    shippedCount: shipped.length,
    proposedCount: dedupedProposed.length,
    figureCount,
  };
}

export function groupPreviewByFigure(items: PreviewItem[]): Map<string, PreviewItem[]> {
  const groups = new Map<string, PreviewItem[]>();
  for (const item of items) {
    const list = groups.get(item.figureId) ?? [];
    list.push(item);
    groups.set(item.figureId, list);
  }
  return groups;
}
