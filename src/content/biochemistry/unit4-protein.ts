import type { Wing } from '@/types';
import { unit } from '@/content/helpers';
import { FIG, ach, fillQuiz, mcQuiz, mutationQuiz } from '@/content/biochemistry/quiz-helpers';

export const proteinWing: Wing = {
  id: 'biochem.protein',
  slug: 'protein-synthesis',
  title: 'Protein Synthesis',
  emoji: '🧬',
  description: 'DNA, RNA, transcription, translation, and mutations.',
  children: [
    {
      id: 'biochem.protein.review',
      slug: 'protein-review',
      title: 'Unit 5 Review',
      emoji: '📋',
      children: [
        {
          id: 'biochem.protein.review.core',
          slug: 'core',
          title: 'Protein Synthesis',
          children: [
            unit({
              id: 'biochem.protein.dna-structure',
              slug: 'dna-structure',
              title: 'DNA Structure',
              emoji: '🧬',
              shortLabel: 'DNA',
              longLabel: 'DNA Structure',
              teach: {
                headline: 'Three Parts of a Nucleotide',
                body: `DNA has three parts per nucleotide:
1. **Phosphate group**
2. **Deoxyribose sugar** (5-carbon)
3. **Nitrogenous base** (A, T, C, or G)

![Labeled DNA double helix](${FIG}/p07_dna_structure.svg)

The double helix has antiparallel strands connected by complementary base pairs: **A–T** and **G–C**.`,
                figures: [
                  {
                    id: 'p07_dna_structure',
                    alt: 'DNA double helix with sugar-phosphate backbone and base pairs labeled',
                  },
                ],
                poweredIdea: 'DNA = phosphate + deoxyribose + base; A-T and G-C pair.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.dna.bases',
                  'Adenine pairs with _____ in DNA.',
                  ['thymine', 't'],
                  true,
                ),
                mcQuiz(
                  'quiz.biochem.dna.parts',
                  'Which is NOT part of a DNA nucleotide?',
                  ['Ribose sugar', 'Phosphate', 'Nitrogenous base', 'Deoxyribose'],
                  0,
                ),
              ],
              achievement: ach(
                'biochem.protein.dna-structure',
                '🧬',
                'DNA',
                'DNA Structure',
                'You twist the ladder of life.',
              ),
              difficulty: 'core',
              tags: ['genetics', 'dna'],
            }),
            unit({
              id: 'biochem.protein.dna-vs-rna',
              slug: 'dna-vs-rna',
              title: 'DNA vs RNA',
              emoji: '📝',
              shortLabel: 'DNA/RNA',
              longLabel: 'DNA vs RNA',
              teach: {
                headline: 'Three Key Differences',
                body: `| Feature | DNA | RNA |
| :--- | :--- | :--- |
| Sugar | Deoxyribose | Ribose |
| Bases | A, T, C, G | A, **U**, C, G (uracil replaces thymine) |
| Structure | Double helix | Usually single-stranded |
| Location | Nucleus (eukaryotes) | Nucleus & cytoplasm |

**Base pairing rules:** DNA: A–T, G–C. RNA: A–U, G–C.`,
                poweredIdea: 'RNA has ribose and uracil; DNA has deoxyribose and thymine.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.rna.base',
                  'RNA uses _____ instead of thymine.',
                  ['uracil', 'u'],
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.rna.strands',
                  'DNA is typically _____-stranded.',
                  ['double', 'two'],
                ),
              ],
              achievement: ach(
                'biochem.protein.dna-vs-rna',
                '📝',
                'DNA/RNA',
                'DNA vs RNA',
                'You read both scripts of the genetic code.',
              ),
              difficulty: 'core',
              tags: ['genetics'],
            }),
            unit({
              id: 'biochem.protein.transcription',
              slug: 'transcription-translation',
              title: 'Transcription and the Genetic Code',
              emoji: '🔤',
              shortLabel: 'Genetic Code',
              longLabel: 'Transcription & Genetic Code',
              teach: {
                headline: 'Central Dogma: DNA → RNA → Protein',
                body: `**Central dogma:** DNA → (transcription) → mRNA → (translation) → protein

**Example:** DNA template TAC CGA TCG AAG ATT → mRNA AUG GCU AGC UUC UAA → amino acids Met-Ala-Ser-Phe-Stop

**Codon chart** (mRNA, read 5′→3′):

| | U | C | A | G |
| :---: | :---: | :---: | :---: | :---: |
| **U** | Phe | Ser | Tyr | Cys |
| **C** | Leu | Ser | His | Gln |
| **A** | Ile | Thr | Asn | Lys |
| **G** | Val | Ala | Asp | Glu |

Each codon (3 nucleotides) codes for one amino acid or a stop signal.`,
                poweredIdea: 'DNA is transcribed to mRNA; codons specify amino acids.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.transcription.central',
                  'The central dogma flows DNA → RNA → _____.',
                  ['protein', 'proteins'],
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.transcription.codon',
                  'A codon is _____ nucleotides long.',
                  ['3', 'three'],
                ),
                fillQuiz(
                  'quiz.biochem.transcription.mrna',
                  'DNA template TAC codes for mRNA _____.',
                  ['aug', 'AUG'],
                  'Start codon',
                ),
                fillQuiz(
                  'quiz.biochem.transcription.start-aa',
                  'The start codon AUG codes for the amino acid _____.',
                  ['methionine', 'met'],
                ),
                fillQuiz(
                  'quiz.biochem.transcription.base-pair',
                  'In DNA, guanine (G) pairs with _____.',
                  ['cytosine', 'c'],
                ),
              ],
              achievement: ach(
                'biochem.protein.transcription',
                '🔤',
                'Genetic Code',
                'Transcription & Genetic Code',
                'You translate triplets into amino acids.',
              ),
              difficulty: 'core',
              tags: ['genetics', 'protein'],
            }),
            unit({
              id: 'biochem.protein.mutations',
              slug: 'mutations',
              title: 'Types of Mutations',
              emoji: '⚠️',
              shortLabel: 'Mutations',
              longLabel: 'Types of Mutations',
              teach: {
                headline: 'When DNA Changes',
                body: `**Types of mutations:**
- **Point mutation** — one base changed (may be silent, missense, or nonsense)
- **Insertion** — extra base(s) added; shifts reading frame
- **Deletion** — base(s) removed; shifts reading frame
- **Frameshift** — insertion or deletion that alters every codon downstream

**How mutations occur:** copying errors during DNA replication, environmental mutagens (UV, chemicals).

**Inheritance:** germline mutations pass to offspring; somatic mutations do not.`,
                poweredIdea: 'Insertions and deletions can frameshift every codon downstream.',
              },
              quizzes: [
                mutationQuiz(
                  'quiz.biochem.mutation.sickle-lab',
                  {
                    scenario: 'Edit the sickle-cell site — one base in the GAG codon.',
                    templateDna: 'ATGGAGGGCTAA',
                    editableIndex: 4,
                    replacements: ['A', 'T', 'G', 'C'],
                    correctReplacement: 'T',
                    correctMutationType: 'missense',
                    clinicalHook:
                      'Changing GAG to GTG swaps glutamate for valine — the sickle-cell substitution.',
                    poweredIdea: 'One point mutation can change a single amino acid and disease phenotype.',
                    mnemonic: 'FRAME + SHIFT = reading frame slides. MISS = wrong amino acid. NON = STOP early.',
                  },
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.mutation.frameshift',
                  'Insertions and deletions can cause a _____ mutation.',
                  ['frameshift', 'frame shift'],
                ),
                mcQuiz(
                  'quiz.biochem.mutation.germline',
                  'Which mutations can be inherited by offspring?',
                  ['Germline mutations', 'Somatic mutations only', 'Neither', 'Both always'],
                  0,
                ),
                fillQuiz(
                  'quiz.biochem.mutation.point',
                  'A _____ mutation changes a single base in DNA.',
                  ['point'],
                ),
              ],
              achievement: ach(
                'biochem.protein.mutations',
                '⚠️',
                'Mutations',
                'Types of Mutations',
                'You spot the typo in the code of life.',
              ),
              difficulty: 'deep',
              tags: ['genetics', 'mutations'],
            }),
          ],
        },
      ],
    },
  ],
};
