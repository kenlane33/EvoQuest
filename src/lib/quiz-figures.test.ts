import { describe, expect, it } from 'vitest';
import { getUnitById } from '@/content/catalog';
import { getQuizPlayFigures } from '@/lib/quiz-figures';
import type { QuizTemplate } from '@/types';

describe('getQuizPlayFigures', () => {
  const enzymeUnit = getUnitById('biochem.enzymes.factors');
  if (!enzymeUnit) throw new Error('missing enzyme unit');

  it('shows the enzyme activity graph for graph-reading fill quizzes', () => {
    const optimum = enzymeUnit.quizzes.find((q) => q.id === 'quiz.biochem.enzymes.optimum');
    const denatured = enzymeUnit.quizzes.find((q) => q.id === 'quiz.biochem.enzymes.denatured');
    const factors = enzymeUnit.quizzes.find((q) => q.id === 'quiz.biochem.enzymes.factors');

    expect(optimum).toBeDefined();
    expect(denatured).toBeDefined();
    expect(factors).toBeDefined();

    const optimumFigures = getQuizPlayFigures(enzymeUnit, optimum!);
    expect(optimumFigures).toHaveLength(1);
    expect(optimumFigures[0]?.id).toBe('p02_enzyme_activity_graph');
    expect(optimumFigures[0]?.src).toContain('p02_enzyme_activity_graph.svg');

    const denaturedFigures = getQuizPlayFigures(enzymeUnit, denatured!);
    expect(denaturedFigures).toHaveLength(1);
    expect(denaturedFigures[0]?.id).toBe('p02_enzyme_activity_graph');

    expect(getQuizPlayFigures(enzymeUnit, factors!)).toEqual([]);
  });

  it('shows the deer population graph for the carrying-capacity quiz', () => {
    const popUnit = getUnitById('biochem.ecology.population');
    if (!popUnit) throw new Error('missing population unit');

    const deerQuiz = popUnit.quizzes.find((q) => q.id === 'quiz.biochem.pop.deer-k');
    expect(deerQuiz).toBeDefined();

    const figures = getQuizPlayFigures(popUnit, deerQuiz!);
    expect(figures).toHaveLength(1);
    expect(figures[0]?.id).toBe('p17_deer_population');
  });

  it('returns nothing for unrelated fill quizzes', () => {
    const popUnit = getUnitById('biochem.ecology.population');
    if (!popUnit) throw new Error('missing population unit');

    const kQuiz = popUnit.quizzes.find((q) => q.id === 'quiz.biochem.pop.k');
    expect(kQuiz).toBeDefined();
    expect(getQuizPlayFigures(popUnit, kQuiz!)).toEqual([]);
  });

  it('shows the DNA hierarchy diagram for hierarchy fill quizzes', () => {
    const dnaUnit = getUnitById('biochem.protein.dna-structure');
    if (!dnaUnit) throw new Error('missing DNA unit');

    const nucleusQuiz = dnaUnit.quizzes.find((q) => q.id === 'quiz.biochem.dna.nucleus');
    expect(nucleusQuiz).toBeDefined();

    const figures = getQuizPlayFigures(dnaUnit, nucleusQuiz!);
    expect(figures).toHaveLength(1);
    expect(figures[0]?.id).toBe('p07_dna_hierarchy');
    expect(figures[0]?.src).toContain('p07_dna_hierarchy.png');
  });

  it('handles speed-reveal fill questions', () => {
    const quiz: QuizTemplate = {
      kind: 'speed-reveal-mnemonic',
      id: 'test.graph',
      data: {
        termId: 'term.test',
        root: 'Test',
        mnemonic: 'Test',
        question: {
          kind: 'fill',
          prompt: 'Based on the graph, the value is about _____ units.',
          acceptable: ['10'],
        },
      },
    };

    const figures = getQuizPlayFigures(enzymeUnit, quiz);
    expect(figures).toHaveLength(1);
  });
});
