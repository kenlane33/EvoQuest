import type { FigureMeta } from '@/components/content/Figure';
import type { KnowledgeUnit, QuizTemplate } from '@/types';

export type QuizPlayFigure = FigureMeta & { src: string };

function getQuizPromptAndHint(quiz: QuizTemplate): { prompt: string; hint: string } {
  const data = quiz.data as Record<string, unknown>;
  const inner = data.question;
  if (inner && typeof inner === 'object') {
    const q = inner as { prompt?: string; hint?: string };
    return {
      prompt: typeof q.prompt === 'string' ? q.prompt : '',
      hint: typeof q.hint === 'string' ? q.hint : '',
    };
  }
  return {
    prompt: typeof data.prompt === 'string' ? data.prompt : '',
    hint: typeof data.hint === 'string' ? data.hint : '',
  };
}

function quizReferencesFigure(prompt: string, hint: string): boolean {
  const text = `${prompt} ${hint}`;
  if (/\bdiagram\b/i.test(text)) return true;
  if (/\bgraph\b/i.test(text)) return true;
  if (/\b(the|this|that)\s+(graph|chart|diagram|figure)\b/i.test(text)) {
    return true;
  }
  if (/\bfrom the .+ graph\b/i.test(prompt)) {
    return true;
  }
  if (/\b(on the (right|left)|sharply on the|peak of the curve|where the curve|where activity)\b/i.test(text)) {
    return true;
  }
  return false;
}

function figureSrcFromTeachBody(body: string, figureId: string): string | undefined {
  const escaped = figureId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = body.match(new RegExp(`!\\[[^\\]]*\\]\\(([^)]*${escaped}[^)]*)\\)`, 'i'));
  return match?.[1];
}

function scoreFigureMatch(figure: FigureMeta, tokens: string[]): number {
  const haystack = `${figure.id} ${figure.alt}`.toLowerCase();
  return tokens.reduce((score, token) => (haystack.includes(token) ? score + 1 : score), 0);
}

function pickFigures(figures: FigureMeta[], prompt: string): FigureMeta[] {
  if (figures.length <= 1) return figures;

  const fromGraph = prompt.match(/\bfrom the (.+?) graph\b/i);
  if (fromGraph) {
    const phraseTokens = fromGraph[1]
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 3);
    if (phraseTokens.length > 0) {
      const scored = figures
        .map((figure) => ({ figure, score: scoreFigureMatch(figure, phraseTokens) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score);
      if (scored.length > 0) {
        const topScore = scored[0].score;
        const top = scored.filter((entry) => entry.score === topScore).map((entry) => entry.figure);
        if (top.length === 1) return top;
      }
    }
  }

  const tokens = prompt
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4);
  const scored = figures
    .map((figure) => ({ figure, score: scoreFigureMatch(figure, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return figures;

  const topScore = scored[0].score;
  const top = scored.filter((entry) => entry.score === topScore).map((entry) => entry.figure);
  return top.length === 1 ? top : [scored[0].figure];
}

/** Teach figures that should appear beside a quiz prompt during play. */
export function getQuizPlayFigures(
  unit: KnowledgeUnit,
  quiz: QuizTemplate,
): QuizPlayFigure[] {
  const figures = unit.teach.figures;
  if (!figures?.length) return [];

  const { prompt, hint } = getQuizPromptAndHint(quiz);
  if (!quizReferencesFigure(prompt, hint)) return [];

  return pickFigures(figures, prompt)
    .map((figure) => {
      const src = figureSrcFromTeachBody(unit.teach.body, figure.id);
      if (!src) return null;
      return { ...figure, src };
    })
    .filter((figure): figure is QuizPlayFigure => figure !== null);
}
