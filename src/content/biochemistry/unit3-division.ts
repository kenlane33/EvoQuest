import type { Wing } from '@/types';
import { unit } from '@/content/helpers';
import { FIG, ach, fillQuiz, mcQuiz, recipeQuiz } from '@/content/biochemistry/quiz-helpers';

export const divisionWing: Wing = {
  id: 'biochem.division',
  slug: 'cell-division',
  title: 'Cell Division',
  emoji: '🔄',
  description: 'Cell cycle, mitosis, meiosis, and stem cells.',
  children: [
    {
      id: 'biochem.division.review',
      slug: 'division-review',
      title: 'Division Review',
      emoji: '📋',
      children: [
        {
          id: 'biochem.division.review.core',
          slug: 'core',
          title: 'Division Concepts',
          children: [
            unit({
              id: 'biochem.division.cell-cycle',
              slug: 'cell-cycle',
              title: 'Phases of the Cell Cycle',
              emoji: '⭕',
              shortLabel: 'Cell Cycle',
              longLabel: 'Phases of the Cell Cycle',
              teach: {
                headline: 'Interphase First, Then Mitosis',
                body: `**Replication happens before mitosis** — during interphase (S phase).

![Circular diagram of cell cycle phases labeled A through E](${FIG}/p06_cell_cycle.svg)

| Phase | Description | Letter |
| :--- | :--- | :---: |
| Interphase | Cell grows; DNA replicates | A |
| Prophase | Chromatin condenses into chromosomes | D |
| Metaphase | Chromosomes align at equator | C |
| Anaphase | Sister chromatids separate to opposite poles | E |
| Telophase | Nuclear envelopes reform at poles | B |
| Cytokinesis | Cytoplasm divides into two daughter cells | — |`,
                figures: [
                  {
                    id: 'p06_cell_cycle',
                    alt: 'Cell cycle circle with interphase, prophase, metaphase, anaphase, and telophase labeled',
                  },
                ],
                poweredIdea: 'DNA replicates in interphase — then mitosis divides the nucleus.',
              },
              quizzes: [
                recipeQuiz(
                  'quiz.biochem.cycle.mitosis-order',
                  {
                    processTitle: 'Mitosis — arrange the four phases in order',
                    root: 'Greek: meta (middle) + phase (stage); ana (apart) + phase',
                    mnemonic: 'PMAT: Prophase, Metaphase, Anaphase, Telophase — Please Make A Taco.',
                    steps: [
                      {
                        id: 'prophase',
                        title: 'Prophase — chromosomes condense',
                        icon: '🧬',
                        consequenceHint:
                          'Chromosomes must condense before the spindle can capture them.',
                      },
                      {
                        id: 'metaphase',
                        title: 'Metaphase — chromosomes align at equator',
                        icon: '⚖️',
                        consequenceHint:
                          'Alignment at the metaphase plate comes before separation.',
                      },
                      {
                        id: 'anaphase',
                        title: 'Anaphase — sister chromatids separate',
                        icon: '↔️',
                        consequenceHint:
                          'Sister chromatids pull apart only after they are lined up.',
                      },
                      {
                        id: 'telophase',
                        title: 'Telophase — nuclear envelopes reform',
                        icon: '🎁',
                        consequenceHint:
                          'New nuclei form after chromatids reach opposite poles.',
                      },
                    ],
                    causalLinks: [
                      {
                        fromId: 'prophase',
                        toId: 'metaphase',
                        why: 'Condensed chromosomes can attach to spindle fibers.',
                      },
                      {
                        fromId: 'metaphase',
                        toId: 'anaphase',
                        why: 'The spindle pulls chromatids apart only once they align.',
                      },
                      {
                        fromId: 'anaphase',
                        toId: 'telophase',
                        why: 'Nuclear envelopes rebuild around separated chromosome sets.',
                      },
                    ],
                  },
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.cycle.first',
                  'Which happens first: replication or mitosis?',
                  ['replication', 'dna replication', 'interphase'],
                ),
                fillQuiz(
                  'quiz.biochem.cycle.anaphase',
                  'Sister chromatids separate during _____.',
                  ['anaphase'],
                ),
              ],
              achievement: ach(
                'biochem.division.cell-cycle',
                '⭕',
                'Cell Cycle',
                'Phases of the Cell Cycle',
                'You spin through interphase to cytokinesis.',
              ),
              difficulty: 'core',
              tags: ['cells', 'division'],
            }),
            unit({
              id: 'biochem.division.mitosis-meiosis',
              slug: 'mitosis-meiosis',
              title: 'Mitosis vs Meiosis',
              emoji: '✂️',
              shortLabel: 'Mit/Meio',
              longLabel: 'Mitosis vs Meiosis',
              teach: {
                headline: 'Two Divisions, Two Purposes',
                body: `| | Mitosis | Meiosis |
| :--- | :--- | :--- |
| Purpose | Growth and tissue repair | Produce gametes (sex cells) |
| Daughter cells | 2 identical diploid (2n) | 4 genetically unique haploid (n) |
| Divisions | 1 nuclear division | 2 nuclear divisions |
| Genetic variation | None (clones) | Crossing over + independent assortment |

**Law of Independent Assortment:** alleles for different traits segregate into gametes independently during meiosis.`,
                poweredIdea: 'Mitosis = 2 identical cells; meiosis = 4 unique gametes.',
              },
              quizzes: [
                mcQuiz(
                  'quiz.biochem.division.purpose',
                  'Meiosis produces cells used for _____.',
                  ['Sexual reproduction', 'Tissue repair', 'Growth only', 'Photosynthesis'],
                  0,
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.division.mitosis-count',
                  'Mitosis produces _____ daughter cells.',
                  ['2', 'two'],
                ),
              ],
              achievement: ach(
                'biochem.division.mitosis-meiosis',
                '✂️',
                'Mit/Meio',
                'Mitosis vs Meiosis',
                'You split one path into growth and gametes.',
              ),
              difficulty: 'core',
              tags: ['cells', 'division'],
            }),
            unit({
              id: 'biochem.division.crossing-over',
              slug: 'crossing-over',
              title: 'Crossing Over and Variation',
              emoji: '🔀',
              shortLabel: 'Crossing',
              longLabel: 'Crossing Over & Variation',
              teach: {
                headline: 'Genetic Variation in Meiosis',
                body: `**Crossing over:** homologous chromosomes pair up and exchange segments during **Prophase I** of meiosis — creates new allele combinations.

**Two sources of genetic variation:**
1. **Mutations** — changes in DNA sequence
2. **Sexual reproduction** — crossing over + independent assortment + fertilization

Crossing over shuffles alleles between homologous chromosomes before they separate.`,
                poweredIdea: 'Crossing over in Prophase I shuffles alleles between homologs.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.crossing.stage',
                  'Crossing over occurs during _____ of meiosis.',
                  ['prophase i', 'prophase 1', 'prophase one'],
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.crossing.variation',
                  'Name two sources of genetic variation.',
                  ['mutations and sexual reproduction', 'mutation and sexual reproduction', 'mutations, sexual reproduction'],
                ),
              ],
              achievement: ach(
                'biochem.division.crossing-over',
                '🔀',
                'Crossing',
                'Crossing Over & Variation',
                'You swap segments and shuffle the deck.',
              ),
              difficulty: 'deep',
              tags: ['cells', 'genetics'],
            }),
            unit({
              id: 'biochem.division.stem-cells',
              slug: 'stem-cells',
              title: 'Stem Cells and Specialization',
              emoji: '🌱',
              shortLabel: 'Stem Cells',
              longLabel: 'Stem Cells & Specialization',
              teach: {
                headline: 'Unspecialized Cells Become Specialists',
                body: `**Gene expression** determines cell specialization — different genes are turned on or off in different cell types.

**Stem cells** are **unspecialized** and can differentiate into specialized cell types.

Specialized cells include nerve cells (signals), muscle cells (movement), blood cells (transport/defense), sperm cells (reproduction), xylem (water transport), and phloem (sugar transport in plants).`,
                poweredIdea: 'Stem cells are unspecialized; gene expression drives differentiation.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.stem.unspecialized',
                  'Stem cells are specialized or unspecialized?',
                  ['unspecialized', 'un specialized'],
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.stem.specialization',
                  '_____ expression determines cell specialization.',
                  ['gene'],
                ),
              ],
              achievement: ach(
                'biochem.division.stem-cells',
                '🌱',
                'Stem Cells',
                'Stem Cells & Specialization',
                'You watch one cell become many specialists.',
              ),
              difficulty: 'core',
              tags: ['cells'],
            }),
          ],
        },
      ],
    },
  ],
};
