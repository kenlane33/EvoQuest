import { CONTENT_MODULES } from '@/content';
import { BIO_EOC_FIG } from '@/content/bio-eoc/figures';
import { FIG } from '@/content/biochemistry/quiz-helpers';
import { flattenUnits } from '@/engine/world';
import { getQuizPlayFigures, teachFigureSrcFromBody } from '@/lib/quiz-figures';
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

function defaultFigureSrc(figureId: string): string {
  const ext = FIGURE_EXT[figureId] ?? 'svg';
  const base = figureId.startsWith('bio_eoc_') ? BIO_EOC_FIG : FIG;
  return `${base}/${figureId}.${ext}`;
}

function resolvePreviewFigureSrc(
  unit: { teach: { body: string } },
  figureId: string,
  playSrc?: string,
): string {
  if (playSrc) return playSrc;
  return teachFigureSrcFromBody(unit.teach.body, figureId) ?? defaultFigureSrc(figureId);
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
        figureSrc: resolvePreviewFigureSrc(unit, primary.id, playFigures[0]?.src),
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
    id: 'proposed.quiz.biochem.dna.base-pairs',
    unitId: 'biochem.protein.dna-structure',
    unitTitle: 'DNA Structure',
    sectionTitle: 'Protein Synthesis',
    figureId: 'p07_dna_hierarchy',
    figureSrc: defaultFigureSrc('p07_dna_hierarchy'),
    figureAlt: 'DNA hierarchy from cell to base pairs',
    templateKind: 'fill',
    prompt: 'The rungs of the DNA ladder in the hierarchy diagram are _____ pairs.',
    answers: ['base', 'nitrogenous base', 'nitrogenous bases'],
    ocrRef: 'Unit 5 Q1 — base pairing in diagram',
  },
  {
    id: 'proposed.quiz.biochem.birds.w',
    unitId: 'biochem.evolution.dichotomous-key',
    unitTitle: 'Dichotomous Keys',
    sectionTitle: 'Evolution',
    figureId: 'p13_birds_dichotomous',
    figureSrc: defaultFigureSrc('p13_birds_dichotomous'),
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
    figureSrc: defaultFigureSrc('p13_birds_dichotomous'),
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
    figureSrc: defaultFigureSrc('p15_food_web'),
    figureAlt: 'Food web with producers, consumers, and decomposers',
    templateKind: 'fill',
    prompt: 'In the food web diagram, hawks eat snails and _____.',
    answers: ['dragonflies', 'dragonfly'],
    ocrRef: 'Unit 7 Q9 — hawk prey in pyramid/web',
  },
  {
    id: 'proposed.quiz.biochem.fingerprint.match-visual',
    unitId: 'biochem.heredity.dna-fingerprint',
    unitTitle: 'DNA Fingerprinting',
    sectionTitle: 'Heredity',
    figureId: 'p09_dna_fingerprint',
    figureSrc: defaultFigureSrc('p09_dna_fingerprint'),
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
