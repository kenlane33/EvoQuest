import type { QuizTemplate } from '@/types';

/** Replace fill-in blanks with a spoken placeholder. */
export function normalizePromptForSpeech(text: string): string {
  return text
    .replace(/_{3,}/g, ' blank ')
    .replace(/\s+/g, ' ')
    .trim();
}

function joinRead(...parts: (string | undefined | null)[]): string {
  return parts
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .map((p) => p.trim())
    .join(' ');
}

function microworldGoalRead(data: Record<string, unknown>): string {
  const goal = data.goal as
    | { kind?: string; min?: number; max?: number; below?: number }
    | undefined;
  if (!goal || typeof goal !== 'object') return '';
  if (goal.kind === 'reachValue' && typeof goal.min === 'number' && typeof goal.max === 'number') {
    return `Goal: population between ${goal.min} and ${goal.max}.`;
  }
  if (typeof goal.below === 'number') {
    return `Goal: population below ${goal.below}.`;
  }
  return '';
}

/** Plain text for TTS from a quiz template's main prompt. */
export function getQuizReadText(quiz: QuizTemplate): string {
  const data = quiz.data as Record<string, unknown>;

  switch (quiz.kind) {
    case 'debug-the-claim':
      return joinRead(
        'Read the paragraph. Click the conceptual bug, then name what kind of mistake it is.',
        typeof data.paragraph === 'string' ? data.paragraph : '',
      );
    case 'mutation-lab':
      return joinRead(
        typeof data.scenario === 'string' ? data.scenario : '',
        'Click the highlighted base, choose a replacement, predict the mutation type, then watch translation.',
      );
    case 'punnett-builder':
      return joinRead(
        typeof data.scenario === 'string' ? data.scenario : '',
        "Drag alleles into headers, label each cell's phenotype, then commit.",
      );
    case 'food-web-builder':
      return joinRead(
        typeof data.ecosystem === 'string' ? data.ecosystem : '',
        'Tap prey, then predator to draw energy arrows, from eaten to eater.',
      );
    case 'recipe-sequencer':
      return joinRead(
        typeof data.processTitle === 'string' ? data.processTitle : '',
        'Drag each step into its slot, or tap a card, then tap a slot.',
      );
    case 'etymology-puppet':
      return joinRead(
        typeof data.definition === 'string' ? data.definition : '',
        'Drag morpheme tiles into the slots to build the term.',
      );
    case 'pedigree-detective':
      return joinRead(
        typeof data.traitLabel === 'string'
          ? `Study the pedigree for trait ${data.traitLabel}.`
          : 'Study the pedigree.',
        'Choose an inheritance pattern and test your hypothesis.',
      );
    case 'cladogram-crafter':
      return 'Arrange taxa with the outgroup on the left to minimize parsimony score. Lower is better.';
    case 'be-the-turtle':
      return joinRead(
        typeof data.roleTitle === 'string' ? data.roleTitle : '',
        typeof data.setup === 'string' ? data.setup : '',
      );
    case 'microworld-sandbox':
      return joinRead(
        typeof data.reveal === 'string' ? data.reveal : '',
        microworldGoalRead(data),
        'Adjust the parameters, then run the simulation.',
      );
    case 'procedure-builder':
      return joinRead(
        typeof data.goal === 'string' ? data.goal : '',
        'Place blocks in order, then run the procedure.',
      );
    case 'concept-map-builder':
      return joinRead(
        typeof data.focalConcept === 'string'
          ? `Concept map for ${data.focalConcept}.`
          : 'Concept map.',
        'Connect nodes with labeled edges. Tap a source node, then a target, then pick a relationship label.',
      );
    case 'counterfactual-lab':
      return joinRead(
        typeof data.prompt === 'string' ? normalizePromptForSpeech(data.prompt) : '',
        typeof data.context === 'string' ? data.context : '',
        'Tap cards below in causal order.',
      );
    default:
      break;
  }

  const inner = data.question;
  if (inner && typeof inner === 'object') {
    const q = inner as Record<string, unknown>;
    if (typeof q.prompt === 'string' && q.prompt.trim()) {
      return normalizePromptForSpeech(q.prompt.trim());
    }
  }

  if (typeof data.prompt === 'string' && data.prompt.trim()) {
    return normalizePromptForSpeech(data.prompt.trim());
  }
  if (typeof data.scenario === 'string' && data.scenario.trim()) {
    const scenario = data.scenario.trim();
    if (typeof data.predictPrompt === 'string' && data.predictPrompt.trim()) {
      const posit = scenario.replace(/\.\s*$/, '');
      const prompt = normalizePromptForSpeech(data.predictPrompt.trim());
      return `${posit}. ${prompt}`;
    }
    return scenario;
  }
  if (typeof data.headline === 'string' && data.headline.trim()) {
    return data.headline.trim();
  }
  if (typeof data.term === 'string' && data.term.trim()) {
    return `Match: ${data.term.trim()}`;
  }
  if (typeof data.story === 'string' && typeof data.question === 'string') {
    return `${data.story.trim()} ${normalizePromptForSpeech(data.question.trim())}`;
  }
  if (typeof data.goal === 'string' && data.goal.trim()) {
    return data.goal.trim();
  }
  if (typeof data.focalConcept === 'string' && data.focalConcept.trim()) {
    return `Concept map: ${data.focalConcept.trim()}`;
  }
  if (typeof data.roomTitle === 'string' && data.roomTitle.trim()) {
    return data.roomTitle.trim();
  }
  return '';
}
