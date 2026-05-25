import type { ContentModule } from '@/types';
import { unit } from '@/content/helpers';

const evolutionModule: ContentModule = {
  id: 'mod.evolution.bundled',
  title: 'Evolution',
  description: 'Origin of life, deep time, natural selection, and population genetics.',
  schemaVersion: 1,
  appVersionAtAuthoring: '0.1.0',
  source: 'bundled',
  createdAt: Date.now(),
  tree: [
    {
      id: 'evo',
      slug: 'evolution',
      title: 'Evolution',
      emoji: '🧬',
      description: 'How life changes across deep time.',
      children: [
        {
          id: 'evo.origin',
          slug: 'origin-of-life',
          title: 'Origin of Life',
          emoji: '🌋',
          children: [
            {
              id: 'evo.origin.abiogenesis',
              slug: 'abiogenesis',
              title: 'Abiogenesis',
              children: [
                unit({
                  id: 'evo.origin.abiogenesis.miller-urey',
                  slug: 'miller-urey',
                  title: 'The Miller-Urey Experiment',
                  emoji: '⚗️',
                  shortLabel: 'Miller-Urey',
                  longLabel: 'Miller-Urey Apparatus',
                  teach: {
                    headline: 'Lightning + Soup = Amino Acids',
                    body: `In 1953, Stanley Miller and Harold Urey ran electrical sparks through a sealed flask of methane, ammonia, hydrogen, and water vapor — a guess at early Earth's atmosphere. Within a week, the flask contained amino acids and simple sugars.`,
                    etymology: {
                      termId: 'term.abiogenesis',
                      term: 'abiogenesis',
                      morphemes: [
                        { morphemeId: 'morph.a-', asUsed: 'a' },
                        { morphemeId: 'morph.bio', asUsed: 'bio' },
                        { morphemeId: 'morph.genesis', asUsed: 'genesis' },
                      ],
                      rootSummary: 'Greek: a- (without) + bios (life) + genesis (origin)',
                    },
                    mnemonic:
                      'A=WITHOUT, BIO=LIFE, GENESIS=BIRTH. The very first beginning — life from non-life.',
                    poweredIdea:
                      'Life can begin from non-life when energy meets the right chemicals.',
                  },
                  quizzes: [
                    {
                      kind: 'speed-reveal-mnemonic',
                      id: 'quiz.evo.origin.miller-urey.sr-1',
                      preferred: true,
                      data: {
                        termId: 'term.abiogenesis',
                        root: 'Greek: a- (without) + bios (life) + genesis (origin)',
                        mnemonic:
                          'A=WITHOUT, BIO=LIFE, GENESIS=BIRTH. The very first beginning — life from non-life.',
                        question: {
                          kind: 'fill',
                          prompt:
                            'Miller & Urey produced amino acids and _____ from early-atmosphere gases.',
                          acceptable: ['sugars', 'sugar'],
                          hint: 'Simple carbohydrate',
                        },
                      },
                    },
                  ],
                  achievement: {
                    id: 'ach.evo.origin.miller-urey',
                    emoji: '⚗️',
                    shortLabel: 'Miller-Urey',
                    longLabel: 'The Miller-Urey Apparatus',
                    flavor: 'Lightning strikes the flask. Amino acids precipitate.',
                    wingId: 'evo',
                  },
                  difficulty: 'core',
                  tags: ['origin', 'abiogenesis'],
                }),
              ],
            },
          ],
        },
        {
          id: 'evo.deep-time',
          slug: 'deep-time',
          title: 'Deep Time',
          emoji: '⏳',
          children: [
            {
              id: 'evo.deep-time.cambrian',
              slug: 'cambrian',
              title: 'Cambrian Explosion',
              children: [
                unit({
                  id: 'evo.deep-time.cambrian.explosion',
                  slug: 'cambrian-explosion',
                  title: 'The Cambrian Explosion',
                  emoji: '🦑',
                  shortLabel: 'Cambrian',
                  longLabel: 'Cambrian Explosion',
                  teach: {
                    headline: 'Animal Body Plans Appear in a Geologic Blink',
                    body: `Around 543 million years ago, the fossil record suddenly blooms with diverse animal phyla — hard shells, eyes, appendages, and radically different body plans. This burst is called the Cambrian Explosion.`,
                    etymology: {
                      termId: 'term.cambrian',
                      term: 'Cambrian',
                      morphemes: [{ morphemeId: 'morph.cambria', asUsed: 'Cambrian' }],
                      rootSummary: 'Latin: Cambria — Roman name for Wales',
                    },
                    mnemonic:
                      'CAMbrian → CAMera capturing the first EXPLOSION of animal life on film',
                    poweredIdea:
                      'Major animal body plans diversified rapidly in the early Cambrian.',
                  },
                  quizzes: [
                    {
                      kind: 'speed-reveal-mnemonic',
                      id: 'quiz.evo.deep-time.cambrian.sr-1',
                      preferred: true,
                      data: {
                        termId: 'term.cambrian',
                        root: 'Latin: Cambria — Roman name for Wales',
                        mnemonic:
                          'CAMbrian → CAMera capturing the first EXPLOSION of animal life on film',
                        question: {
                          kind: 'fill',
                          prompt:
                            'The _____ Explosion (~543 mya) was a rapid diversification of animal body plans.',
                          acceptable: ['cambrian'],
                          hint: 'A geologic period',
                        },
                      },
                    },
                  ],
                  achievement: {
                    id: 'ach.evo.deep-time.cambrian',
                    emoji: '🦑',
                    shortLabel: 'Cambrian',
                    longLabel: 'Cambrian Explosion',
                    flavor: 'Hard shells click shut. Eyes open across the seafloor.',
                    wingId: 'evo',
                  },
                  difficulty: 'core',
                }),
              ],
            },
          ],
        },
        {
          id: 'evo.selection',
          slug: 'natural-selection',
          title: 'Natural Selection',
          emoji: '🐢',
          children: [
            {
              id: 'evo.selection.lamarck',
              slug: 'lamarck-vs-darwin',
              title: 'Lamarck vs Darwin',
              children: [
                unit({
                  id: 'evo.selection.lamarck.inheritance',
                  slug: 'lamarck',
                  title: 'Lamarckian Inheritance',
                  emoji: '🦒',
                  shortLabel: 'Lamarck',
                  longLabel: 'Lamarck vs Darwin',
                  teach: {
                    headline: 'Acquired Traits Do Not Rewrite DNA',
                    body: `Lamarck proposed that organisms change during their lifetime through use or disuse, and offspring inherit those changes. Darwin showed that variation exists first — the environment selects what survives and reproduces.`,
                    poweredIdea:
                      'Traits selected in a lifetime are not automatically passed to offspring.',
                  },
                  quizzes: [
                    {
                      kind: 'debug-the-claim',
                      id: 'quiz.evo.selection.lamarck.debug',
                      preferred: true,
                      data: {
                        paragraph:
                          'Giraffes evolved long necks because their ancestors stretched to reach high leaves, and this lengthening was passed to their offspring.',
                        bugPhrase:
                          'stretched to reach high leaves, and this lengthening was passed to their offspring',
                        bugClass: 'lamarckian-sneak',
                        hint: 'Can stretching in one lifetime rewrite DNA in the next generation?',
                        canonicalFix:
                          'Variation in neck length already existed. Giraffes with longer necks survived and reproduced — the environment selected them.',
                        poweredIdea:
                          'Traits acquired in a lifetime are not automatically inherited by offspring.',
                        root: 'Named: Jean-Baptiste Lamarck (French naturalist)',
                        mnemonic:
                          'LAMARCK = LIFETIME changes passed down. DARWIN = BORN with variation, environment picks winners.',
                      },
                    },
                    {
                      kind: 'speed-reveal-mnemonic',
                      id: 'quiz.evo.selection.lamarck.sr-1',
                      data: {
                        termId: 'term.lamarck',
                        root: 'Named: Jean-Baptiste Lamarck (French naturalist)',
                        mnemonic:
                          'LAMARCK = LIFETIME changes passed down. DARWIN = BORN with variation, environment picks winners.',
                        question: {
                          kind: 'multiple-choice',
                          prompt:
                            '"A giraffe stretches its neck to reach food, so its offspring inherit longer necks." Who proposed this?',
                          options: ['LAMARCK', 'DARWIN', 'MENDEL', 'WALLACE'],
                          correctIndex: 0,
                        },
                      },
                    },
                  ],
                  achievement: {
                    id: 'ach.evo.selection.lamarck',
                    emoji: '🦒',
                    shortLabel: 'Lamarck',
                    longLabel: 'Lamarckian Inheritance',
                    flavor: 'The giraffe stretches. The DNA stays the same.',
                    wingId: 'evo',
                  },
                  difficulty: 'intro',
                }),
              ],
            },
            {
              id: 'evo.selection.natural',
              slug: 'natural-selection-core',
              title: 'Selection Mechanisms',
              children: [
                unit({
                  id: 'evo.selection.natural.core',
                  slug: 'natural-selection',
                  title: 'Natural Selection',
                  emoji: '🧬',
                  shortLabel: 'Selection',
                  longLabel: 'Natural Selection',
                  teach: {
                    headline: 'Variation First, Environment Selects',
                    body: `Natural selection acts on phenotype — observable traits. Random variation already exists in a population; selective pressure favors traits that improve survival and reproduction. Over generations, allele frequencies shift.`,
                    etymology: {
                      termId: 'term.phenotype',
                      term: 'phenotype',
                      morphemes: [
                        { morphemeId: 'morph.pheno', asUsed: 'pheno' },
                        { morphemeId: 'morph.type', asUsed: 'type' },
                      ],
                      rootSummary: 'Greek: phainein (to show) + typos (impression)',
                    },
                    mnemonic:
                      'PHENO → PHONE → what you could PHONE home about because you can SEE it. Observable traits.',
                    poweredIdea:
                      'Populations change when heritable variation meets selective pressure.',
                  },
                  quizzes: [
                    {
                      kind: 'predict-run-reflect',
                      id: 'quiz.evo.selection.natural.prr-1',
                      preferred: true,
                      data: {
                        scenario:
                          'A hospital uses the same antibiotic for ten years. Bacteria in patients increasingly resist it.',
                        predictPrompt: 'Why do resistant bacteria become more common over time?',
                        predictOptions: [
                          'Bacteria evolved resistance to survive the drug',
                          'Random mutations were selected — resistant variants reproduced more',
                          'The antibiotic made bacteria stronger',
                          'Patients passed resistance to each other like a cold',
                        ],
                        correctPredictionIndex: 1,
                        runNarrative:
                          'Resistant mutants already existed. Each treatment killed susceptible cells, leaving resistant survivors to multiply. Over years the population shifted.',
                        truthSummary:
                          'Selection acts on existing variation — bacteria did not "try" to resist.',
                        bugCandidates: [
                          {
                            label: 'I treated evolution as intentional — bacteria wanted to survive',
                            isTheBug: true,
                            explanation:
                              'Teleology sneaks in when we say organisms evolve "to" do something.',
                          },
                          {
                            label: 'I forgot that variation must exist before selection',
                            isTheBug: false,
                            explanation: 'Variation matters, but the main bug here is teleological thinking.',
                          },
                          {
                            label: 'I confused individual change with population change',
                            isTheBug: false,
                            explanation: 'Individuals do not evolve; populations shift allele frequencies.',
                          },
                        ],
                        poweredIdea:
                          'Natural selection filters variation that already exists — it does not design solutions.',
                        root: 'Greek: phainein (to show) + typos (impression)',
                        mnemonic:
                          'PHENO → PHONE → what you could PHONE home about because you can SEE it. Observable traits.',
                      },
                    },
                    {
                      kind: 'speed-reveal-mnemonic',
                      id: 'quiz.evo.selection.natural.sr-1',
                      data: {
                        termId: 'term.phenotype',
                        root: 'Greek: phainein (to show) + typos (impression)',
                        mnemonic:
                          'PHENO → PHONE → what you could PHONE home about because you can SEE it. Observable traits.',
                        question: {
                          kind: 'multiple-choice',
                          prompt:
                            'Hospital bacteria no longer respond to antibiotics used for years. What explains this?',
                          options: [
                            'Genetic Drift',
                            'Natural Selection',
                            'Coevolution',
                            'Founder Effect',
                          ],
                          correctIndex: 1,
                        },
                      },
                    },
                  ],
                  achievement: {
                    id: 'ach.evo.selection.natural',
                    emoji: '🧬',
                    shortLabel: 'Selection',
                    longLabel: 'Natural Selection',
                    flavor: 'Resistant bacteria survive. The population shifts.',
                    wingId: 'evo',
                  },
                  difficulty: 'core',
                }),
              ],
            },
          ],
        },
        {
          id: 'evo.evidence',
          slug: 'evidence',
          title: 'Evidence for Evolution',
          emoji: '🏝️',
          children: [
            {
              id: 'evo.evidence.galapagos',
              slug: 'galapagos',
              title: 'Galápagos Fieldwork',
              children: [
                unit({
                  id: 'evo.evidence.galapagos.finches',
                  slug: 'galapagos',
                  title: 'Darwin\'s Galápagos',
                  emoji: '🐢',
                  shortLabel: 'Galápagos',
                  longLabel: 'Galápagos Finches',
                  teach: {
                    headline: 'Islands as Evolution Laboratories',
                    body: `On the Galápagos archipelago, Darwin observed finches and tortoises with traits tuned to each island's conditions. Geographic isolation plus varied resources drove adaptive divergence from shared ancestors.`,
                    poweredIdea:
                      'Isolated populations diverge when environments differ.',
                  },
                  quizzes: [
                    {
                      kind: 'speed-reveal-mnemonic',
                      id: 'quiz.evo.evidence.galapagos.sr-1',
                      preferred: true,
                      data: {
                        termId: 'term.galapagos',
                        root: 'Spanish: galápago (saddle — tortoise shell shape)',
                        mnemonic:
                          'GALA-PAGOS = GALA of PAGES — each island writes a different chapter of beak shapes.',
                        question: {
                          kind: 'fill',
                          prompt: 'Darwin studied finches and tortoises on the _____ Islands.',
                          acceptable: ['galapagos'],
                          hint: 'Off South America',
                        },
                      },
                    },
                  ],
                  achievement: {
                    id: 'ach.evo.evidence.galapagos',
                    emoji: '🐢',
                    shortLabel: 'Galápagos',
                    longLabel: 'Galápagos Fieldwork',
                    flavor: 'Beak shapes diverge island by island.',
                    wingId: 'evo',
                  },
                  difficulty: 'intro',
                }),
              ],
            },
          ],
        },
        {
          id: 'evo.cells',
          slug: 'cell-evolution',
          title: 'Cell Evolution',
          emoji: '🔬',
          children: [
            {
              id: 'evo.cells.endosymbiosis',
              slug: 'endosymbiosis',
              title: 'Endosymbiosis',
              children: [
                unit({
                  id: 'evo.cells.endosymbiosis.theory',
                  slug: 'endosymbiosis',
                  title: 'Endosymbiotic Theory',
                  emoji: '🦠',
                  shortLabel: 'Endosym',
                  longLabel: 'Endosymbiotic Theory',
                  teach: {
                    headline: 'Cells Can Be Made of Older Cells',
                    body: `Lynn Margulis proposed that mitochondria and chloroplasts were once free-living prokaryotes engulfed by larger cells. The partnership persisted — organelles with their own circular DNA and double membranes.`,
                    etymology: {
                      termId: 'term.endosymbiosis',
                      term: 'endosymbiosis',
                      morphemes: [
                        { morphemeId: 'morph.endo', asUsed: 'endo' },
                        { morphemeId: 'morph.sym', asUsed: 'sym' },
                        { morphemeId: 'morph.bios', asUsed: 'bios' },
                      ],
                      rootSummary: 'Greek: endo (within) + sym (together) + bios (life)',
                    },
                    mnemonic:
                      'ENDO=INSIDE. SYM=TOGETHER. Prokaryotes moved IN and stayed — roommates for 2 billion years.',
                    poweredIdea: 'Eukaryotic organelles descend from engulfed prokaryotes.',
                  },
                  quizzes: [
                    {
                      kind: 'etymology-puppet',
                      id: 'quiz.evo.cells.endosymbiosis.puppet',
                      preferred: true,
                      data: {
                        definition: 'One species living inside another in a lasting partnership.',
                        slots: 4,
                        morphemes: [
                          { id: 'endo', morpheme: 'endo-', meaning: 'within', language: 'Greek' },
                          { id: 'sym', morpheme: 'sym-', meaning: 'together', language: 'Greek' },
                          { id: 'bio', morpheme: 'bio-', meaning: 'life', language: 'Greek' },
                          { id: 'sis', morpheme: '-sis', meaning: 'process', language: 'Greek' },
                          { id: 'exo', morpheme: 'exo-', meaning: 'outside', language: 'Greek' },
                          { id: 'photo', morpheme: 'photo-', meaning: 'light', language: 'Greek' },
                        ],
                        acceptedAnswers: [['endo', 'sym', 'bio', 'sis']],
                        targetTerm: 'endosymbiosis',
                        exampleSentence:
                          'Mitochondria may be descendants of an ancient endosymbiosis event.',
                        poweredIdea: 'The term literally means life living together within.',
                        root: 'Greek: endo (within) + sym (together) + bios (life)',
                        mnemonic:
                          'ENDO=INSIDE. SYM=TOGETHER. Prokaryotes moved IN and stayed — roommates for 2 billion years.',
                      },
                    },
                    {
                      kind: 'speed-reveal-mnemonic',
                      id: 'quiz.evo.cells.endosymbiosis.sr-1',
                      data: {
                        termId: 'term.endosymbiosis',
                        root: 'Greek: endo (within) + sym (together) + bios (life)',
                        mnemonic:
                          'ENDO=INSIDE. SYM=TOGETHER. Prokaryotes moved IN and stayed — roommates for 2 billion years.',
                        question: {
                          kind: 'fill',
                          prompt:
                            'Lynn Margulis proposed the _____ Theory for eukaryotic cell evolution.',
                          acceptable: ['endosymbiotic', 'endosymbiosis'],
                          hint: 'Endo=within, symbiotic=together',
                        },
                      },
                    },
                  ],
                  achievement: {
                    id: 'ach.evo.cells.endosymbiosis',
                    emoji: '🦠',
                    shortLabel: 'Endosym',
                    longLabel: 'Endosymbiotic Theory',
                    flavor: 'A prokaryote moves in. The host cell never evicts it.',
                    wingId: 'evo',
                  },
                  difficulty: 'core',
                }),
              ],
            },
          ],
        },
        {
          id: 'evo.adaptation',
          slug: 'adaptation',
          title: 'Adaptation',
          emoji: '🦋',
          children: [
            {
              id: 'evo.adaptation.mimicry',
              slug: 'mimicry',
              title: 'Mimicry',
              children: [
                unit({
                  id: 'evo.adaptation.mimicry.viceroy',
                  slug: 'mimicry',
                  title: 'Batesian Mimicry',
                  emoji: '🦋',
                  shortLabel: 'Mimicry',
                  longLabel: 'Viceroy Mimicry',
                  teach: {
                    headline: 'Copy the Dangerous Look',
                    body: `The harmless Viceroy butterfly evolved wing patterns resembling the toxic Monarch. Predators that learned to avoid Monarchs extend that avoidance to look-alikes — mimicry as a survival strategy.`,
                    etymology: {
                      termId: 'term.mimicry',
                      term: 'mimicry',
                      morphemes: [{ morphemeId: 'morph.mimos', asUsed: 'mim' }],
                      rootSummary: 'Greek: mimos (imitator, mime artist)',
                    },
                    mnemonic:
                      'MIMOS → MIME → a street mime copies others silently. The Viceroy MIMES the Monarch\'s poisonous look.',
                    poweredIdea:
                      'Harmless species gain protection by resembling dangerous ones.',
                  },
                  quizzes: [
                    {
                      kind: 'speed-reveal-mnemonic',
                      id: 'quiz.evo.adaptation.mimicry.sr-1',
                      preferred: true,
                      data: {
                        termId: 'term.mimicry',
                        root: 'Greek: mimos (imitator, mime artist)',
                        mnemonic:
                          'MIMOS → MIME → a street mime copies others silently. The Viceroy MIMES the Monarch\'s poisonous look.',
                        question: {
                          kind: 'fill',
                          prompt:
                            'The Viceroy butterfly uses _____ to look like the poisonous Monarch.',
                          acceptable: ['mimicry'],
                          hint: 'Copying a dangerous look',
                        },
                      },
                    },
                  ],
                  achievement: {
                    id: 'ach.evo.adaptation.mimicry',
                    emoji: '🦋',
                    shortLabel: 'Mimicry',
                    longLabel: 'Batesian Mimicry',
                    flavor: 'Orange wings flash. Predators flinch at a harmless copy.',
                    wingId: 'evo',
                  },
                  difficulty: 'intro',
                }),
              ],
            },
          ],
        },
        {
          id: 'evo.population',
          slug: 'population-genetics',
          title: 'Population Genetics',
          emoji: '📊',
          children: [
            {
              id: 'evo.population.equilibrium',
              slug: 'equilibrium',
              title: 'Genetic Equilibrium',
              children: [
                unit({
                  id: 'evo.population.hardy-weinberg',
                  slug: 'hardy-weinberg',
                  title: 'Hardy-Weinberg Principle',
                  emoji: '⚖️',
                  shortLabel: 'H-W',
                  longLabel: 'Hardy-Weinberg',
                  teach: {
                    headline: 'Evolution\'s Null Hypothesis',
                    body: `Hardy and Weinberg showed that allele frequencies stay constant across generations when no evolutionary forces act — no mutation, migration, selection, or non-random mating. Real populations deviate; the principle is a baseline.`,
                    etymology: {
                      termId: 'term.hardy-weinberg',
                      term: 'Hardy-Weinberg',
                      morphemes: [],
                      rootSummary: 'Named: G.H. Hardy (English) + W. Weinberg (German)',
                    },
                    mnemonic:
                      'Hardy-Weinberg = evolution\'s day off. The math of what happens when ABSOLUTELY NOTHING changes. Baseline.',
                    poweredIdea:
                      'Allele frequencies remain stable only when evolution is not acting.',
                  },
                  quizzes: [
                    {
                      kind: 'speed-reveal-mnemonic',
                      id: 'quiz.evo.population.hardy-weinberg.sr-1',
                      preferred: true,
                      data: {
                        termId: 'term.hardy-weinberg',
                        root: 'Named: G.H. Hardy (English) + W. Weinberg (German)',
                        mnemonic:
                          'Hardy-Weinberg = evolution\'s day off. The math of what happens when ABSOLUTELY NOTHING changes. Baseline.',
                        question: {
                          kind: 'multiple-choice',
                          prompt: 'Hardy-Weinberg Principle means allele frequencies stay constant only if…',
                          options: [
                            'NO evolutionary forces act',
                            'Dominant alleles always increase',
                            'Evolution is fastest in large populations',
                            'Alleles always change over time',
                          ],
                          correctIndex: 0,
                        },
                      },
                    },
                  ],
                  achievement: {
                    id: 'ach.evo.population.hardy-weinberg',
                    emoji: '⚖️',
                    shortLabel: 'H-W',
                    longLabel: 'Hardy-Weinberg Principle',
                    flavor: 'Allele frequencies hold steady. Evolution takes the day off.',
                    wingId: 'evo',
                  },
                  difficulty: 'deep',
                }),
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default evolutionModule;
