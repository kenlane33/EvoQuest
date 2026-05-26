import { describe, expect, it } from 'vitest';
import {
  getSafePlayHeading,
  shouldShowPlayEtymology,
  textLeaksAnswer,
} from '@/lib/quiz-answer-leak';
import type { KnowledgeUnit } from '@/types';

const galapagosUnit: KnowledgeUnit = {
  id: 'evo.evidence.galapagos.finches',
  slug: 'galapagos',
  title: "Darwin's Galápagos",
  emoji: '🐢',
  shortLabel: 'Galápagos',
  longLabel: 'Galápagos Finches',
  teach: {
    headline: 'Islands as Evolution Laboratories',
    body: 'Body',
    poweredIdea: 'Idea',
  },
  quizzes: [],
  achievement: {
    id: 'ach.evo.evidence.galapagos',
    emoji: '🐢',
    shortLabel: 'Galápagos',
    longLabel: 'Galápagos Fieldwork',
    flavor: 'Flavor',
    wingId: 'evo',
  },
  difficulty: 'intro',
  enabled: true,
};

describe('textLeaksAnswer', () => {
  it('detects Galápagos label and etymology leaks', () => {
    const answers = ['galapagos'];
    expect(textLeaksAnswer('Galápagos', answers)).toBe(true);
    expect(textLeaksAnswer('Spanish: galápago (saddle — tortoise shell shape)', answers)).toBe(
      true,
    );
    expect(textLeaksAnswer('Islands as Evolution Laboratories', answers)).toBe(false);
  });

  it('detects prefix leaks like Endosym', () => {
    expect(textLeaksAnswer('Endosym', ['endosymbiosis'])).toBe(true);
  });

  it('detects etymology stem leaks like Cambria → Cambrian', () => {
    expect(textLeaksAnswer('Latin: Cambria — Roman name for Wales', ['cambrian'])).toBe(true);
  });
});

describe('getSafePlayHeading', () => {
  it('falls back to teach headline when short label leaks', () => {
    expect(getSafePlayHeading(galapagosUnit, ['galapagos'])).toBe(
      'Islands as Evolution Laboratories',
    );
  });
});

describe('shouldShowPlayEtymology', () => {
  it('hides leaking roots until answered', () => {
    const root = 'Spanish: galápago (saddle — tortoise shell shape)';
    expect(shouldShowPlayEtymology(root, ['galapagos'], false)).toBe(false);
    expect(shouldShowPlayEtymology(root, ['galapagos'], true)).toBe(true);
  });

  it('hides Cambria roots until answered', () => {
    const root = 'Latin: Cambria — Roman name for Wales';
    expect(shouldShowPlayEtymology(root, ['cambrian'], false)).toBe(false);
    expect(shouldShowPlayEtymology(root, ['cambrian'], true)).toBe(true);
  });
});
