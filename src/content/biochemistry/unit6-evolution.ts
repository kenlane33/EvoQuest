import type { Wing } from '@/types';
import { unit } from '@/content/helpers';
import { FIG, ach, fillQuiz, mcQuiz, cladogramQuiz } from '@/content/biochemistry/quiz-helpers';

export const evolutionWing: Wing = {
  id: 'biochem.evolution',
  slug: 'evolution',
  title: 'Evolution',
  emoji: '🦕',
  description: 'Evidence, natural selection, speciation, and classification.',
  children: [
    {
      id: 'biochem.evolution.review',
      slug: 'evolution-review',
      title: 'Unit 7 Review',
      emoji: '📋',
      children: [
        {
          id: 'biochem.evolution.review.core',
          slug: 'core',
          title: 'Evolution Concepts',
          children: [
            unit({
              id: 'biochem.evolution.evidence',
              slug: 'evidence',
              title: 'Evidence of Evolution',
              emoji: '🦴',
              shortLabel: 'Evidence',
              longLabel: 'Evidence of Evolution',
              teach: {
                headline: 'Four Lines of Evidence',
                body: `Key evidence for evolution:

1. **Fossil record** — preserved remains show change over time
2. **Vestigial structures** — reduced remnants (e.g., whale hip bones, human tailbone)
3. **Homologous structures** — same origin, different function (vertebrate forelimbs)
4. **Embryology** — similar early stages across species

![Four panels: fossil, vestigial, homologous, embryology](${FIG}/p12_evolution_evidence.svg)

| Species | Hemoglobin fragment |
| :--- | :--- |
| Human | Lys-Glu-His-Ile |
| Gorilla | Lys-Glu-His-Lys |
| Chimpanzee | Lys-Glu-His-Ile |

Human and chimpanzee share the most similar sequences — most closely related.`,
                figures: [
                  {
                    id: 'p12_evolution_evidence',
                    alt: 'Four types of evolutionary evidence: fossils, vestigial structures, homologous structures, embryology',
                  },
                ],
                poweredIdea: 'Fossils, vestigial/homologous structures, and embryos all support common descent.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.evidence.vestigial',
                  'A whale hip bone is a _____ structure.',
                  ['vestigial'],
                  true,
                ),
                mcQuiz(
                  'quiz.biochem.evidence.homologous',
                  'Forelimbs of mammals with different functions are _____.',
                  ['Homologous structures', 'Vestigial structures', 'Analogous only', 'Embryos'],
                  0,
                ),
              ],
              achievement: ach(
                'biochem.evolution.evidence',
                '🦴',
                'Evidence',
                'Evidence of Evolution',
                'You read the fossil, the limb, and the embryo.',
              ),
              difficulty: 'core',
              tags: ['evolution'],
            }),
            unit({
              id: 'biochem.evolution.natural-selection',
              slug: 'natural-selection',
              title: 'Natural Selection',
              emoji: '🎯',
              shortLabel: 'Selection',
              longLabel: 'Natural Selection',
              teach: {
                headline: 'Variation + Environment = Change Over Time',
                body: `**Natural selection:**
1. Variation exists in a population
2. More offspring are produced than can survive
3. Individuals with advantageous traits survive and reproduce
4. Allele frequencies shift over generations

**Antibiotic resistance:** bacteria with random resistance mutations survive antibiotic treatment and reproduce — population becomes resistant.

**Evolutionary order (oldest → newest):** anaerobic prokaryote → photosynthetic prokaryote → unicellular eukaryote → multicellular eukaryote`,
                poweredIdea: 'Advantageous traits increase in frequency — that is natural selection.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.selection.antibiotic',
                  'Antibiotic resistance in bacteria is an example of _____.',
                  ['natural selection', 'evolution'],
                  true,
                ),
                mcQuiz(
                  'quiz.biochem.selection.order',
                  'Which came first in evolutionary history?',
                  ['Anaerobic prokaryote', 'Multicellular eukaryote', 'Unicellular eukaryote', 'Photosynthetic prokaryote'],
                  0,
                ),
              ],
              achievement: ach(
                'biochem.evolution.natural-selection',
                '🎯',
                'Selection',
                'Natural Selection',
                'You watch the fittest alleles win.',
              ),
              difficulty: 'core',
              tags: ['evolution'],
            }),
            unit({
              id: 'biochem.evolution.speciation',
              slug: 'speciation',
              title: 'Speciation and Isolation',
              emoji: '🏝️',
              shortLabel: 'Speciation',
              longLabel: 'Speciation & Isolation',
              teach: {
                headline: 'How New Species Form',
                body: `Match terms to definitions:

| Term | Definition |
| :--- | :--- |
| **Speciation** | Formation of a new species |
| **Geographic isolation** | Physical barrier divides a population |
| **Reproductive isolation** | Populations can no longer interbreed |
| **Adaptive radiation** | One species diversifies into many niches |
| **Convergent evolution** | Unrelated species evolve similar traits |
| **Divergent evolution** | Related species evolve differently |

**Geographic isolation → speciation:** separated populations accumulate differences until they cannot interbreed.`,
                poweredIdea: 'Isolation prevents gene flow — populations diverge into new species.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.speciation.geographic',
                  'A physical barrier dividing a population is _____ isolation.',
                  ['geographic'],
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.speciation.definition',
                  'The formation of a new species is called _____.',
                  ['speciation'],
                ),
              ],
              achievement: ach(
                'biochem.evolution.speciation',
                '🏝️',
                'Speciation',
                'Speciation & Isolation',
                'You split one population into two species.',
              ),
              difficulty: 'deep',
              tags: ['evolution'],
            }),
            unit({
              id: 'biochem.evolution.classification',
              slug: 'classification',
              title: 'Classification and Cladograms',
              emoji: '🌳',
              shortLabel: 'Classify',
              longLabel: 'Classification & Cladograms',
              teach: {
                headline: 'From Old Methods to Cladistics',
                body: `**Old classification:** based mainly on appearance and behavior.

**Modern classification (cladistics):** groups by **shared derived characteristics** and common ancestry.

![Cladogram of mammals](${FIG}/p13_cladogram.svg)

On a cladogram, organisms sharing the **most recent branch point** are most closely related.

Rodents and rabbits share a recent common ancestor on the cladogram — more closely related to each other than to primates.`,
                figures: [
                  {
                    id: 'p13_cladogram',
                    alt: 'Cladogram showing evolutionary relationships among mammals',
                  },
                ],
                poweredIdea: 'Cladograms group by shared ancestry, not just looks.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.classify.cladistics',
                  'Modern classification uses shared _____ characteristics.',
                  ['derived', 'shared derived'],
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.classify.related',
                  'On a cladogram, the most recent shared branch point indicates closest _____.',
                  ['relationship', 'relation'],
                ),
                cladogramQuiz(
                  'quiz.biochem.classify.tetrapod-tree',
                  {
                    taxa: [
                      { id: 'lancelet', name: 'Lancelet', icon: '🪱', isOutgroup: true },
                      { id: 'shark', name: 'Shark', icon: '🦈' },
                      { id: 'frog', name: 'Frog', icon: '🐸' },
                      { id: 'lizard', name: 'Lizard', icon: '🦎' },
                      { id: 'mouse', name: 'Mouse', icon: '🐭' },
                      { id: 'sparrow', name: 'Sparrow', icon: '🐦' },
                    ],
                    outgroupId: 'lancelet',
                    traits: [
                      { id: 'vert', label: 'Vertebrae' },
                      { id: 'lungs', label: 'Lungs' },
                      { id: 'amniotic', label: 'Amniotic egg' },
                      { id: 'hair', label: 'Hair' },
                      { id: 'feathers', label: 'Feathers' },
                    ],
                    traitMatrix: {
                      lancelet: { vert: 0, lungs: 0, amniotic: 0, hair: 0, feathers: 0 },
                      shark: { vert: 1, lungs: 0, amniotic: 0, hair: 0, feathers: 0 },
                      frog: { vert: 1, lungs: 1, amniotic: 0, hair: 0, feathers: 0 },
                      lizard: { vert: 1, lungs: 1, amniotic: 1, hair: 0, feathers: 0 },
                      sparrow: { vert: 1, lungs: 1, amniotic: 1, hair: 0, feathers: 1 },
                      mouse: { vert: 1, lungs: 1, amniotic: 1, hair: 1, feathers: 0 },
                    },
                    canonicalOrder: ['lancelet', 'shark', 'frog', 'lizard', 'mouse', 'sparrow'],
                    canonicalParsimonyScore: 6,
                    poweredIdea:
                      'Shared derived traits (synapomorphies) cluster taxa on the most parsimonious tree.',
                    synapomorphies: [
                      {
                        traitId: 'amniotic',
                        label: 'Amniotic egg unites reptiles, birds, and mammals.',
                        taxonIds: ['lizard', 'sparrow', 'mouse'],
                      },
                    ],
                    root: 'Biology EOC Review — cladistics',
                    mnemonic: 'Parsimony: the tree with the fewest trait changes wins.',
                  },
                  true,
                ),
              ],
              achievement: ach(
                'biochem.evolution.classification',
                '🌳',
                'Classify',
                'Classification & Cladograms',
                'You branch the tree of life by ancestry.',
              ),
              difficulty: 'core',
              tags: ['evolution', 'classification'],
            }),
            unit({
              id: 'biochem.evolution.dichotomous-key',
              slug: 'dichotomous-key',
              title: 'Dichotomous Keys',
              emoji: '🐦',
              shortLabel: 'Dich Key',
              longLabel: 'Dichotomous Keys',
              teach: {
                headline: 'Two Choices at Each Step',
                body: `A **dichotomous key** uses paired choices to identify organisms.

**Galápagos finch key:**
1a. Beak long and slender → **Certhidea** (Bird W)
1b. Beak stout → go to 2
2a. Lower beak flat → **Geospiza** (Bird X)
2b. Lower beak curved → go to 3
3a. Upper beak edge bent → **Camarhynchus** (Bird Y)
3b. Upper beak edge flat → **Platyspiza** (Bird Z)

![Finch beak shapes W, X, Y, Z](${FIG}/p13_birds_dichotomous.svg)`,
                figures: [
                  {
                    id: 'p13_birds_dichotomous',
                    alt: 'Four finch beak shapes labeled W, X, Y, and Z for dichotomous key identification',
                  },
                ],
                poweredIdea: 'Each step offers two choices — follow beak traits to the species name.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.key.meaning',
                  'Dichotomous means _____ choices at each step.',
                  ['two', '2'],
                  true,
                ),
                mcQuiz(
                  'quiz.biochem.key.certhidea',
                  'A finch with a long slender beak is _____.',
                  ['Certhidea', 'Geospiza', 'Camarhynchus', 'Platyspiza'],
                  0,
                ),
              ],
              achievement: ach(
                'biochem.evolution.dichotomous-key',
                '🐦',
                'Dich Key',
                'Dichotomous Keys',
                'You follow two paths to name every bird.',
              ),
              difficulty: 'core',
              tags: ['evolution', 'classification'],
            }),
          ],
        },
      ],
    },
  ],
};
