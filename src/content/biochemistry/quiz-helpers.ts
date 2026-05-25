import type {
  BeTheTurtleData,
  CladogramCrafterData,
  CounterfactualLabData,
  DebugTheClaimData,
  EtymologyPuppetData,
  FoodWebBuilderData,
  InnerQuestion,
  MicroworldSandboxData,
  MutationLabData,
  PedigreeDetectiveData,
  PredictRunReflectData,
  PunnettBuilderData,
  QuizTemplate,
  RecipeSequencerData,
} from '@/types';

export const FIG = '/content/biochemistry/figures';

export function fillQuiz(
  id: string,
  prompt: string,
  acceptable: string[],
  hintOrPreferred?: string | boolean,
  preferred?: boolean,
): QuizTemplate {
  const hint = typeof hintOrPreferred === 'string' ? hintOrPreferred : undefined;
  const isPreferred =
    typeof hintOrPreferred === 'boolean' ? hintOrPreferred : preferred;
  return {
    kind: 'fill',
    id,
    preferred: isPreferred,
    data: { prompt, acceptable, hint },
  };
}

export function mcQuiz(
  id: string,
  prompt: string,
  options: string[],
  correctIndex: number,
  preferred?: boolean,
): QuizTemplate {
  return {
    kind: 'speed-reveal-mnemonic',
    id,
    preferred,
    data: {
      termId: `term.${id}`,
      root: 'Biology EOC Review',
      mnemonic: 'Read the teach block — the answer is in the material.',
      question: {
        kind: 'multiple-choice',
        prompt,
        options,
        correctIndex,
      },
    },
  };
}

export function srFill(
  id: string,
  question: Extract<InnerQuestion, { kind: 'fill' }>,
  preferred?: boolean,
): QuizTemplate {
  return {
    kind: 'speed-reveal-mnemonic',
    id,
    preferred,
    data: {
      termId: `term.${id}`,
      root: 'Biology EOC Review',
      mnemonic: 'EOC REVIEW — key fact from the teach block.',
      question,
    },
  };
}

export function recipeQuiz(
  id: string,
  data: RecipeSequencerData,
  preferred?: boolean,
): QuizTemplate {
  return {
    kind: 'recipe-sequencer',
    id,
    preferred,
    data,
  };
}

export function etymologyQuiz(
  id: string,
  data: EtymologyPuppetData,
  preferred?: boolean,
): QuizTemplate {
  return { kind: 'etymology-puppet', id, preferred, data };
}

export function debugQuiz(
  id: string,
  data: DebugTheClaimData,
  preferred?: boolean,
): QuizTemplate {
  return { kind: 'debug-the-claim', id, preferred, data };
}

export function punnettQuiz(
  id: string,
  data: PunnettBuilderData,
  preferred?: boolean,
): QuizTemplate {
  return { kind: 'punnett-builder', id, preferred, data };
}

export function predictQuiz(
  id: string,
  data: PredictRunReflectData,
  preferred?: boolean,
): QuizTemplate {
  return { kind: 'predict-run-reflect', id, preferred, data };
}

export function turtleQuiz(
  id: string,
  data: BeTheTurtleData,
  preferred?: boolean,
): QuizTemplate {
  return { kind: 'be-the-turtle', id, preferred, data };
}

export function mutationQuiz(
  id: string,
  data: MutationLabData,
  preferred?: boolean,
): QuizTemplate {
  return { kind: 'mutation-lab', id, preferred, data };
}

export function foodWebQuiz(
  id: string,
  data: FoodWebBuilderData,
  preferred?: boolean,
): QuizTemplate {
  return { kind: 'food-web-builder', id, preferred, data };
}

export function microworldQuiz(
  id: string,
  data: MicroworldSandboxData,
  preferred?: boolean,
): QuizTemplate {
  return { kind: 'microworld-sandbox', id, preferred, data };
}

export function pedigreeQuiz(
  id: string,
  data: PedigreeDetectiveData,
  preferred?: boolean,
): QuizTemplate {
  return { kind: 'pedigree-detective', id, preferred, data };
}

export function cladogramQuiz(
  id: string,
  data: CladogramCrafterData,
  preferred?: boolean,
): QuizTemplate {
  return { kind: 'cladogram-crafter', id, preferred, data };
}

export function counterfactualQuiz(
  id: string,
  data: CounterfactualLabData,
  preferred?: boolean,
): QuizTemplate {
  return { kind: 'counterfactual-lab', id, preferred, data };
}

export function ach(id: string, emoji: string, shortLabel: string, longLabel: string, flavor: string) {
  return {
    id: `ach.${id}`,
    emoji,
    shortLabel,
    longLabel,
    flavor,
    wingId: 'biochem',
  };
}
