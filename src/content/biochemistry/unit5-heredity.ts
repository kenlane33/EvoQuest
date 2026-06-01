import type { Wing } from '@/types';
import { unit } from '@/content/helpers';
import { FIG, ach, fillQuiz, mcQuiz, punnettQuiz, pedigreeQuiz, scenarioQuiz } from '@/content/biochemistry/quiz-helpers';

export const heredityWing: Wing = {
  id: 'biochem.heredity',
  slug: 'heredity',
  title: 'Heredity',
  emoji: '👪',
  description: 'Inheritance patterns, gel electrophoresis, biotech, and karyotypes.',
  children: [
    {
      id: 'biochem.heredity.review',
      slug: 'heredity-review',
      title: 'Unit 6 Review',
      emoji: '📋',
      children: [
        {
          id: 'biochem.heredity.review.core',
          slug: 'core',
          title: 'Heredity Concepts',
          children: [
            unit({
              id: 'biochem.heredity.patterns',
              slug: 'inheritance-patterns',
              title: 'Inheritance Patterns',
              emoji: '🎲',
              shortLabel: 'Inheritance',
              longLabel: 'Inheritance Patterns',
              teach: {
                headline: 'Beyond Simple Dominance',
                body: `| Pattern | Description | Example |
| :--- | :--- | :--- |
| Multiple alleles | More than two alleles in the population | ABO blood type |
| Polygenic traits | Many genes affect one trait | Skin color, height |
| Sex-linked | Gene on X chromosome | Color blindness, hemophilia |
| Codominance | Both alleles expressed fully | AB blood type |
| Incomplete dominance | Blended phenotype | Pink flowers from red × white |

**Genetics vs environment:** lung cancer (both), skin cancer (both — genetics + sun), diabetes (both), PKU (genetics), heart disease (both).`,
                poweredIdea: 'Not all traits follow simple dominant/recessive Mendelian rules.',
              },
              quizzes: [
                punnettQuiz(
                  'quiz.biochem.heredity.punnett-pp-x-pp',
                  {
                    scenario: 'Cross heterozygous purple (Pp) with homozygous white (pp). Build the grid and read the ratio.',
                    parents: [
                      { label: 'Parent 1 (Pp)', alleles: ['P', 'p'] },
                      { label: 'Parent 2 (pp)', alleles: ['p', 'p'] },
                    ],
                    phenotypeMap: {
                      PP: { label: 'Purple', color: '#a855f7', icon: '🟣' },
                      Pp: { label: 'Purple', color: '#a855f7', icon: '🟣' },
                      pp: { label: 'White', color: '#94a3b8', icon: '⚪' },
                    },
                    dominantPhenotype: 'Purple',
                    expectedRatio: '2:2',
                    notes: 'Two of four offspring inherit a dominant P allele — 1:1 purple to white.',
                    root: 'Biology EOC Review — Mendelian inheritance',
                    mnemonic: 'Build the square — ratios fall out of the combinatorics.',
                  },
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.heredity.polygenic',
                  'Skin color is a _____ trait.',
                  ['polygenic'],
                ),
                mcQuiz(
                  'quiz.biochem.heredity.codominance',
                  'AB blood type is an example of _____.',
                  ['Codominance', 'Incomplete dominance', 'Sex linkage', 'Polygenic inheritance'],
                  0,
                ),
                mcQuiz(
                  'quiz.biochem.heredity.incomplete',
                  'Pink flowers from red × white parents show _____.',
                  ['Incomplete dominance', 'Codominance', 'Sex linkage', 'Multiple alleles only'],
                  0,
                ),
                scenarioQuiz(
                  'quiz.biochem.heredity.pku-genetics',
                  {
                    story: 'PKU (phenylketonuria) is caused by a recessive allele — diet must limit phenylalanine.',
                    question: 'PKU is primarily caused by:',
                    answer: 'Genetics',
                    options: ['Genetics', 'Environment only', 'Neither', 'Both equally'],
                    explanation: 'PKU is inherited genetically, though diet manages symptoms.',
                  },
                ),
                pedigreeQuiz(
                  'quiz.biochem.heredity.cf-pedigree',
                  {
                    traitLabel: 'Cystic fibrosis',
                    people: [
                      { id: 'I-1', label: 'I-1', sex: 'M', affected: false, generation: 1 },
                      { id: 'I-2', label: 'I-2', sex: 'F', affected: false, generation: 1 },
                      {
                        id: 'II-1',
                        label: 'II-1',
                        sex: 'F',
                        affected: true,
                        generation: 2,
                        motherId: 'I-2',
                        fatherId: 'I-1',
                      },
                      {
                        id: 'II-2',
                        label: 'II-2',
                        sex: 'M',
                        affected: false,
                        generation: 2,
                        motherId: 'I-2',
                        fatherId: 'I-1',
                      },
                    ],
                    canonical: {
                      pattern: 'autosomal-recessive',
                      poweredIdea:
                        'Recessive traits can skip generations — both unaffected parents can carry the allele.',
                    },
                    hints: [
                      'Two unaffected parents can still have an affected child — which pattern allows that?',
                    ],
                    root: 'Biology EOC Review — inheritance patterns',
                    mnemonic: 'Recessive hides in carriers until two alleles meet.',
                  },
                ),
              ],
              achievement: ach(
                'biochem.heredity.patterns',
                '🎲',
                'Inheritance',
                'Inheritance Patterns',
                'You track alleles through every pattern.',
              ),
              difficulty: 'core',
              tags: ['genetics', 'heredity'],
            }),
            unit({
              id: 'biochem.heredity.gel-electrophoresis',
              slug: 'gel-electrophoresis',
              title: 'Gel Electrophoresis',
              emoji: '🧫',
              shortLabel: 'Gel Elect',
              longLabel: 'Gel Electrophoresis',
              teach: {
                headline: 'Compare DNA Fragment Patterns',
                body: `Gel electrophoresis separates DNA fragments by size. Smaller fragments travel farther down the gel.

![Gel electrophoresis of deer species](${FIG}/p09_gel_deer.svg)

Species sharing the **most band patterns** (especially shortest fragments near the bottom) are **most closely related** to the common ancestor.

Compare hemoglobin amino acid sequences similarly — fewer differences = closer relationship.`,
                figures: [
                  {
                    id: 'p09_gel_deer',
                    alt: 'Gel electrophoresis lanes comparing DNA fragments from four deer species',
                  },
                ],
                poweredIdea: 'More matching bands = closer evolutionary relationship.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.gel.related',
                  'On a gel, species with the most matching bands are most _____.',
                  ['closely related', 'related'],
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.gel.size',
                  'Smaller DNA fragments travel _____ on a gel.',
                  ['farther', 'further', 'farther down'],
                ),
                mcQuiz(
                  'quiz.biochem.gel.deer-related',
                  'On the deer gel, which species is most closely related to the common ancestor (species 1)?',
                  ['Species 3', 'Species 2', 'Species 4', 'The ladder'],
                  0,
                ),
              ],
              achievement: ach(
                'biochem.heredity.gel-electrophoresis',
                '🧫',
                'Gel Elect',
                'Gel Electrophoresis',
                'You read the bands like a genetic fingerprint.',
              ),
              difficulty: 'core',
              tags: ['genetics', 'biotech'],
            }),
            unit({
              id: 'biochem.heredity.dna-fingerprint',
              slug: 'dna-fingerprint',
              title: 'DNA Fingerprinting',
              emoji: '🔍',
              shortLabel: 'DNA Print',
              longLabel: 'DNA Fingerprinting',
              teach: {
                headline: 'Match the Band Pattern',
                body: `DNA fingerprinting compares variable regions of DNA between samples.

![DNA fingerprint crime scene comparison](${FIG}/p09_dna_fingerprint.svg)

When the blood stain lane matches a suspect's band pattern exactly, that suspect's DNA is the likely source.`,
                figures: [
                  {
                    id: 'p09_dna_fingerprint',
                    alt: 'DNA fingerprint lanes comparing victim, suspects, and crime scene blood stain',
                  },
                ],
                poweredIdea: 'Matching DNA band patterns identify the source of a sample.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.fingerprint.match',
                  'Matching band patterns on a gel indicate matching _____.',
                  ['dna', 'genetic material'],
                  true,
                ),
                mcQuiz(
                  'quiz.biochem.fingerprint.suspect',
                  'Whose DNA matches the crime scene blood stain?',
                  ['Suspect B', 'Suspect A', 'The victim', 'None of them'],
                  0,
                ),
              ],
              achievement: ach(
                'biochem.heredity.dna-fingerprint',
                '🔍',
                'DNA Print',
                'DNA Fingerprinting',
                'You match the stain to the source.',
              ),
              difficulty: 'core',
              tags: ['genetics', 'biotech'],
            }),
            unit({
              id: 'biochem.heredity.biotech',
              slug: 'biotech',
              title: 'Genetic Engineering',
              emoji: '🦠',
              shortLabel: 'Biotech',
              longLabel: 'Genetic Engineering',
              teach: {
                headline: 'Transgenic Organisms and Restriction Enzymes',
                body: `**Restriction enzymes** cut DNA at specific sequences — used to insert genes into plasmids.

**Transgenic organism:** contains genes from another species.

**Example:** bacteria engineered to produce human **insulin**.

**Goal of transgenic organisms:** produce useful proteins, improve crops, study gene function.

**Correct step:** A human gene is inserted into a bacterial plasmid → bacteria express the human protein.`,
                poweredIdea: 'Cut with restriction enzymes; paste a human gene into a bacterial plasmid.',
              },
              quizzes: [
                mcQuiz(
                  'quiz.biochem.biotech.step',
                  'Which is a step in producing transgenic bacteria?',
                  [
                    'A human gene is inserted into a bacterial plasmid',
                    'A plasmid replaces a faulty gene in a human cell',
                    'Bacterial amino acids are inserted into human DNA',
                    'A mutation is produced in a bacterial cell',
                  ],
                  0,
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.biotech.insulin',
                  'Bacteria have been engineered to produce human _____.',
                  ['insulin'],
                ),
                fillQuiz(
                  'quiz.biochem.biotech.restriction',
                  '_____ enzymes cut DNA at specific sequences.',
                  ['restriction'],
                ),
                fillQuiz(
                  'quiz.biochem.biotech.transgenic',
                  'A _____ organism contains genes from another species.',
                  ['transgenic'],
                ),
              ],
              achievement: ach(
                'biochem.heredity.biotech',
                '🦠',
                'Biotech',
                'Genetic Engineering',
                'You splice human genes into bacterial plasmids.',
              ),
              difficulty: 'core',
              tags: ['genetics', 'biotech'],
            }),
            unit({
              id: 'biochem.heredity.karyotype',
              slug: 'karyotype',
              title: 'Karyotypes and Chromosome Disorders',
              emoji: '🧬',
              shortLabel: 'Karyotype',
              longLabel: 'Karyotypes & Disorders',
              teach: {
                headline: 'Count the Chromosomes',
                body: `A **karyotype** arranges chromosomes by size and shape.

![Human karyotype showing trisomy 21](${FIG}/p10_karyotype.svg)

**Trisomy 21** (three copies of chromosome 21) causes **Down syndrome** — visible on the karyotype.

**Sex determination:** XX = female; XY = male (look at sex chromosomes on the karyotype).`,
                figures: [
                  {
                    id: 'p10_karyotype',
                    alt: 'Karyotype showing 47 chromosomes with trisomy 21 and XY sex chromosomes',
                    caption: '47, XY with trisomy 21 — Down syndrome, male.',
                  },
                ],
                poweredIdea: 'Extra chromosome 21 on a karyotype indicates Down syndrome.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.karyotype.down',
                  'Trisomy 21 causes _____ syndrome.',
                  ['down', 'downs'],
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.karyotype.male',
                  'XY sex chromosomes indicate a _____ patient.',
                  ['male', 'boy', 'man'],
                ),
                fillQuiz(
                  'quiz.biochem.karyotype.trisomy-count',
                  'The karyotype shows _____ total chromosomes (trisomy 21).',
                  ['47', 'forty-seven'],
                ),
              ],
              achievement: ach(
                'biochem.heredity.karyotype',
                '🧬',
                'Karyotype',
                'Karyotypes & Disorders',
                'You count chromosomes and read the diagnosis.',
              ),
              difficulty: 'core',
              tags: ['genetics', 'heredity'],
            }),
          ],
        },
      ],
    },
  ],
};
