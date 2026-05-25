import { describe, expect, it } from 'vitest';
import { getQuizReadText, normalizePromptForSpeech } from '@/audio/quiz-read-text';
import type { QuizTemplate } from '@/types';

describe('normalizePromptForSpeech', () => {
  it('replaces fill blanks with spoken placeholder', () => {
    expect(
      normalizePromptForSpeech(
        'Miller & Urey produced amino acids and _____ from early-atmosphere gases.',
      ),
    ).toBe('Miller & Urey produced amino acids and blank from early-atmosphere gases.');
  });
});

describe('getQuizReadText', () => {
  it('reads inner fill question for speed-reveal', () => {
    const quiz: QuizTemplate = {
      id: 'q1',
      kind: 'speed-reveal-mnemonic',
      data: {
        termId: 'term.abiogenesis',
        root: 'Greek: a- + bios + genesis',
        mnemonic: 'A=WITHOUT, BIO=LIFE',
        question: {
          kind: 'fill',
          prompt:
            'Miller & Urey produced amino acids and _____ from early-atmosphere gases.',
          acceptable: ['nucleotides'],
        },
      },
    };
    expect(getQuizReadText(quiz)).toBe(
      'Miller & Urey produced amino acids and blank from early-atmosphere gases.',
    );
  });

  it('reads scenario and predict prompt for predict-run-reflect', () => {
    const quiz: QuizTemplate = {
      id: 'q2',
      kind: 'predict-run-reflect',
      data: {
        scenario:
          'A hospital uses the same antibiotic for ten years. Bacteria in patients increasingly resist it.',
        predictPrompt: 'Why do resistant bacteria become more common over time?',
        predictOptions: ['A', 'B'],
        correctPredictionIndex: 0,
        runNarrative: 'Run.',
        truthSummary: 'Truth.',
        bugCandidates: [
          { label: 'Bug', isTheBug: true, explanation: 'Because.' },
          { label: 'Not', isTheBug: false, explanation: 'No.' },
        ],
        poweredIdea: 'Selection filters variation.',
      },
    };
    expect(getQuizReadText(quiz)).toBe(
      'A hospital uses the same antibiotic for ten years. Bacteria in patients increasingly resist it. Why do resistant bacteria become more common over time?',
    );
  });
});
