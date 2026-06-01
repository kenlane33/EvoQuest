import type { Wing } from '@/types';
import { unit } from '@/content/helpers';
import { FIG, ach, fillQuiz, mcQuiz, srFill } from '@/content/biochemistry/quiz-helpers';

export const biochemistryWing: Wing = {
  id: 'biochem.macromolecules',
  slug: 'biochemistry',
  title: 'Biochemistry',
  emoji: '🧪',
  description: 'Macromolecules, organic compounds, and enzymes.',
  children: [
    {
      id: 'biochem.macromolecules.review',
      slug: 'macromolecules-review',
      title: 'Unit 1 Review',
      emoji: '📋',
      children: [
        {
          id: 'biochem.macromolecules.review.core',
          slug: 'core',
          title: 'Core Concepts',
          children: [
            unit({
              id: 'biochem.macromolecules.four-groups',
              slug: 'four-groups',
              title: 'Four Macromolecule Groups',
              emoji: '🍬',
              shortLabel: 'Macromols',
              longLabel: 'Four Macromolecule Groups',
              teach: {
                headline: 'Four Building Blocks of Life',
                body: `Living things are built from four major classes of organic macromolecules.

| | Carbohydrates | Proteins | Lipids | Nucleic Acids |
| :--- | :---: | :---: | :---: | :---: |
| Monomer | Monosaccharide | Amino acids | Fatty acids & glycerol | Nucleotide |
| Elements | C, H, O | C, H, O, N | C, H, O | C, H, O, N, P |
| Functions | Short-term energy; structure (cellulose) | Structure, enzymes, transport | Long-term energy storage; membranes | Store and transmit genetic information |

Carbohydrates have a 1:2:1 ratio of C:H:O (CH₂O). Proteins are polymers of amino acids linked by peptide bonds. Lipids are hydrophobic and do not dissolve in water. Nucleic acids (DNA and RNA) encode the instructions to build proteins.`,
                poweredIdea: 'Four macromolecule classes — carbs, proteins, lipids, nucleic acids — build all living systems.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.macromols.monomer-carb',
                  'The monomer of carbohydrates is a _____.',
                  ['monosaccharide', 'monosaccharides'],
                ),
                fillQuiz(
                  'quiz.biochem.macromols.monomer-protein',
                  'Proteins are polymers of _____.',
                  ['amino acids', 'amino acid'],
                  'Monomer of proteins',
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.macromols.monomer-lipid',
                  'Lipids are built from fatty acids and _____.',
                  ['glycerol'],
                ),
                fillQuiz(
                  'quiz.biochem.macromols.monomer-nucleic',
                  'The monomer of nucleic acids is a _____.',
                  ['nucleotide', 'nucleotides'],
                ),
                fillQuiz(
                  'quiz.biochem.macromols.elements-protein',
                  'Proteins contain carbon, hydrogen, oxygen, and _____.',
                  ['nitrogen', 'n'],
                ),
                mcQuiz(
                  'quiz.biochem.macromols.energy-carb',
                  'Which macromolecule is the primary short-term energy source?',
                  ['Carbohydrates', 'Proteins', 'Lipids', 'Nucleic acids'],
                  0,
                ),
                fillQuiz(
                  'quiz.biochem.macromols.function-lipid',
                  'Lipids are used for long-term _____ storage.',
                  ['energy'],
                ),
                fillQuiz(
                  'quiz.biochem.macromols.function-nucleic',
                  'Nucleic acids store and transmit _____.',
                  ['genetic information', 'genetic info', 'genetic'],
                ),
              ],
              achievement: ach(
                'biochem.macromolecules.four-groups',
                '🍬',
                'Macromols',
                'Four Macromolecule Groups',
                'You chart the four pillars of biochemistry.',
              ),
              difficulty: 'intro',
              tags: ['biochemistry', 'macromolecules'],
            }),
            unit({
              id: 'biochem.macromolecules.examples',
              slug: 'organic-examples',
              title: 'Identifying Organic Compounds',
              emoji: '🔬',
              shortLabel: 'Organic ID',
              longLabel: 'Identifying Organic Compounds',
              teach: {
                headline: 'Name the Macromolecule from the Example',
                body: `Match each biological molecule to its macromolecule class:

| Example | Organic Compound |
| :--- | :--- |
| Glucose | Carbohydrate |
| Insulin | Protein |
| Phospholipids | Lipid |
| DNA | Nucleic acid |
| Cellulose | Carbohydrate |
| Enzymes | Protein |
| Steroids | Lipid |
| RNA | Nucleic acid |
| Hemoglobin | Protein |
| Glycogen | Carbohydrate |
| Starch | Carbohydrate |

**Note:** DNA and RNA are nucleic acids — not "nucleotides" alone (nucleotides are the monomers). Starch and glycogen are polysaccharides (carbohydrates), not lipids.

Which codes for amino acids? The **sequence of nucleotides in mRNA** (codons) — not DNA directly, and not the amino acid sequence itself.`,
                poweredIdea: 'Glucose, starch, glycogen, cellulose = carbs; enzymes & hemoglobin = proteins.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.examples.glucose',
                  'Glucose is a _____.',
                  ['carbohydrate', 'carb', 'carbohydrates'],
                ),
                fillQuiz(
                  'quiz.biochem.examples.insulin',
                  'Insulin is an example of a _____.',
                  ['protein', 'proteins'],
                ),
                fillQuiz(
                  'quiz.biochem.examples.phospholipids',
                  'Phospholipids are _____.',
                  ['lipids', 'lipid'],
                ),
                fillQuiz(
                  'quiz.biochem.examples.dna-class',
                  'DNA is a _____.',
                  ['nucleic acid', 'nucleic acids'],
                ),
                fillQuiz(
                  'quiz.biochem.examples.cellulose',
                  'Cellulose is a _____.',
                  ['carbohydrate', 'carb', 'carbohydrates'],
                ),
                fillQuiz(
                  'quiz.biochem.examples.enzymes-class',
                  'Enzymes are _____.',
                  ['proteins', 'protein'],
                ),
                fillQuiz(
                  'quiz.biochem.examples.steroids',
                  'Steroids are _____.',
                  ['lipids', 'lipid'],
                ),
                fillQuiz(
                  'quiz.biochem.examples.rna',
                  'RNA is a _____.',
                  ['nucleic acid', 'nucleic acids'],
                ),
                fillQuiz(
                  'quiz.biochem.examples.hemoglobin',
                  'Hemoglobin is a _____.',
                  ['protein', 'proteins'],
                ),
                fillQuiz(
                  'quiz.biochem.examples.glycogen',
                  'Glycogen is a _____.',
                  ['carbohydrate', 'carb', 'carbohydrates'],
                ),
                fillQuiz(
                  'quiz.biochem.examples.starch',
                  'Starch is a _____.',
                  ['carbohydrate', 'carb', 'carbohydrates'],
                  'Polysaccharide',
                  true,
                ),
                mcQuiz(
                  'quiz.biochem.examples.codon',
                  'Which of the following codes for specific amino acids?',
                  [
                    'Sequence of nucleotides in mRNA',
                    'Nitrogenous bases alone',
                    'Sequence of nucleotides in DNA only',
                    'Sequence of amino acids',
                  ],
                  0,
                ),
              ],
              achievement: ach(
                'biochem.macromolecules.examples',
                '🔬',
                'Organic ID',
                'Identifying Organic Compounds',
                'You sort glucose from glycogen at a glance.',
              ),
              difficulty: 'intro',
              tags: ['biochemistry', 'macromolecules'],
            }),
            unit({
              id: 'biochem.enzymes.basics',
              slug: 'enzyme-basics',
              title: 'Enzymes and Catalysts',
              emoji: '⚡',
              shortLabel: 'Enzymes',
              longLabel: 'Enzymes and Catalysts',
              teach: {
                headline: 'Proteins That Speed Up Reactions',
                body: `**What is an enzyme?** Proteins that act as biological catalysts — they speed up chemical reactions without being consumed.

**Lock and key model:** Each enzyme has an active site shaped to fit a specific substrate. Only the correct substrate binds — this explains enzyme specificity.

**Catalyst:** A substance that lowers activation energy and speeds up a reaction. Enzymes are biological catalysts.

![Enzyme-substrate complex showing enzyme, active site, substrate, and products](${FIG}/p02_enzyme_substrate.svg)

| Enzyme | Function | Substrate |
| :--- | :--- | :--- |
| Lactase | Breaks down lactose for absorption | Lactose |
| Pepsin (protease) | Breaks proteins into peptides | Proteins |
| Salivary amylase | Breaks starch into smaller carbs | Starch (complex carbs) |`,
                figures: [
                  {
                    id: 'p02_enzyme_substrate',
                    alt: 'Enzyme-substrate complex with active site, substrate, and products labeled',
                    caption: 'Enzyme-substrate complex — reactants bind at the active site; products are released.',
                  },
                ],
                poweredIdea: 'Enzymes are protein catalysts with shape-specific active sites.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.enzymes.what-is',
                  'An enzyme is a _____ that acts as a biological catalyst.',
                  ['protein', 'proteins'],
                  'Speeds up chemical reactions',
                  true,
                ),
                srFill(
                  'quiz.biochem.enzymes.definition',
                  {
                    kind: 'fill',
                    prompt: 'Enzymes _____ activation energy.',
                    acceptable: ['lower', 'decrease', 'reduce'],
                    hint: 'Opposite of raise',
                  },
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.enzymes.lock-key',
                  'The lock and key model explains enzyme _____.',
                  ['specificity', 'specific'],
                ),
                fillQuiz(
                  'quiz.biochem.enzymes.catalyst',
                  'Enzymes are biological _____ — they speed up reactions without being consumed.',
                  ['catalysts', 'catalyst'],
                ),
                fillQuiz(
                  'quiz.biochem.enzymes.lactase',
                  'Lactase breaks down _____.',
                  ['lactose'],
                ),
                fillQuiz(
                  'quiz.biochem.enzymes.lactase-function',
                  'Lactase allows _____ to be absorbed into the blood.',
                  ['lactose'],
                ),
                fillQuiz(
                  'quiz.biochem.enzymes.pepsin',
                  'Pepsin breaks down _____.',
                  ['proteins', 'protein'],
                ),
                fillQuiz(
                  'quiz.biochem.enzymes.pepsin-function',
                  'Pepsin breaks large proteins into smaller _____.',
                  ['peptides', 'peptide chains', 'peptide'],
                ),
                fillQuiz(
                  'quiz.biochem.enzymes.amylase',
                  'Salivary amylase breaks down _____.',
                  ['starch', 'complex carbs', 'complex carbohydrates', 'carbohydrates'],
                ),
                fillQuiz(
                  'quiz.biochem.enzymes.amylase-function',
                  'Salivary amylase converts starch into smaller _____.',
                  ['carbohydrates', 'carbs', 'carbohydrate'],
                ),
                fillQuiz(
                  'quiz.biochem.enzymes.active-site',
                  'In the diagram, the substrate binds at the enzyme’s _____.',
                  ['active site', 'active-site'],
                  'The shaped pocket on the enzyme surface',
                ),
                fillQuiz(
                  'quiz.biochem.enzymes.release-products',
                  'After the reaction, the enzyme releases _____ and is unchanged.',
                  ['products', 'product'],
                  'They leave the active site',
                ),
              ],
              achievement: ach(
                'biochem.enzymes.basics',
                '⚡',
                'Enzymes',
                'Enzymes and Catalysts',
                'You hold the key that fits the lock.',
              ),
              difficulty: 'core',
              tags: ['biochemistry', 'enzymes'],
            }),
            unit({
              id: 'biochem.enzymes.factors',
              slug: 'enzyme-factors',
              title: 'Enzyme Activity and Temperature',
              emoji: '🌡️',
              shortLabel: 'Enzyme Temp',
              longLabel: 'Enzyme Activity & Temperature',
              teach: {
                headline: 'Temperature and pH Shape Enzyme Function',
                body: `Two factors that affect enzyme function: **temperature** and **pH**.

Each enzyme has an optimal temperature and pH. Activity increases toward the optimum, then drops sharply when the enzyme **denatures** (loses its shape).

![Effect of temperature on enzyme activity](${FIG}/p02_enzyme_activity_graph.svg)

On the graph above, the optimum temperature is approximately **45°C**. At very high temperatures the enzyme is denatured and activity falls to near zero.`,
                figures: [
                  {
                    id: 'p02_enzyme_activity_graph',
                    alt: 'Bell curve of enzyme activity versus temperature, peaking near 45 degrees Celsius',
                    caption: 'Optimum ~45°C; denaturation at high temperature.',
                  },
                ],
                poweredIdea: 'Enzymes work best at an optimum temperature — too hot denatures them.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.enzymes.factors',
                  'Name two factors that affect enzyme function.',
                  ['temperature and ph', 'ph and temperature', 'temperature, ph'],
                  'One is heat; one is acidity',
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.enzymes.optimum',
                  'Based on the graph, the optimum temperature is about _____°C.',
                  ['45', 'forty-five'],
                  'Peak of the curve',
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.enzymes.denatured',
                  'At what temperature is this enzyme denatured? About _____°C.',
                  ['50', 'fifty', '55', 'sixty', '60'],
                  'Where activity drops sharply on the right',
                ),
              ],
              achievement: ach(
                'biochem.enzymes.factors',
                '🌡️',
                'Enzyme Temp',
                'Enzyme Activity & Temperature',
                'You read the curve where the enzyme peaks.',
              ),
              difficulty: 'core',
              tags: ['biochemistry', 'enzymes'],
            }),
          ],
        },
      ],
    },
  ],
};
