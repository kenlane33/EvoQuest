import type { Wing } from '@/types';
import { unit } from '@/content/helpers';
import { FIG, ach, fillQuiz, mcQuiz, srFill, turtleQuiz, counterfactualQuiz, procedureQuiz, conceptMapQuiz, palaceWalkQuiz } from '@/content/biochemistry/quiz-helpers';

export const cellsWing: Wing = {
  id: 'biochem.cells',
  slug: 'cells-transport',
  title: 'Cells & Transport',
  emoji: '🦠',
  description: 'Cell structure, organelles, membrane transport, and energy.',
  children: [
    {
      id: 'biochem.cells.review',
      slug: 'cells-review',
      title: 'Units 2–4 Review',
      emoji: '📋',
      children: [
        {
          id: 'biochem.cells.review.core',
          slug: 'core',
          title: 'Cell Concepts',
          children: [
            unit({
              id: 'biochem.cells.organelles',
              slug: 'organelles',
              title: 'Organelles and Their Functions',
              emoji: '🔭',
              shortLabel: 'Organelles',
              longLabel: 'Organelles & Functions',
              teach: {
                headline: 'Every Organelle Has a Job',
                body: `| Organelle | Function | Found In |
| :--- | :--- | :--- |
| Nucleus | Stores and protects DNA | Eukaryotes |
| Plasma membrane | Regulates transport of molecules | All cells |
| Cell wall | Structural support | Plants, bacteria, fungi |
| Mitochondria | Converts nutrients to ATP (cellular respiration) | Eukaryotes |
| Chloroplast | Photosynthesis | Plant cells |
| Vacuole | Storage, water balance, support | Plants (large); eukaryotes |
| Ribosomes | Protein synthesis | All living cells |
| Flagellum | Movement | Prokaryotes & some eukaryotes |
| Cilia | Movement or sensing environment | Eukaryotes |
| Contractile vacuole | Maintains water balance | Freshwater protists |`,
                poweredIdea: 'Eukaryotes have membrane-bound organelles; prokaryotes do not.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.cells.atp',
                  'Which organelle produces ATP?',
                  ['mitochondria', 'mitochondrion'],
                  'Powerhouse of the cell',
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.cells.photosynthesis',
                  'Photosynthesis occurs in the _____.',
                  ['chloroplast', 'chloroplasts'],
                ),
                palaceWalkQuiz(
                  'quiz.biochem.cells.organelle-palace',
                  {
                    roomTitle: 'Cell organelle memory palace',
                    layout: [
                      [1, 1, 1, 1, 1, 1, 1, 1, 1],
                      [1, 0, 0, 0, 0, 0, 0, 0, 1],
                      [1, 0, 0, 0, 0, 0, 0, 0, 1],
                      [1, 0, 0, 0, 0, 0, 0, 0, 1],
                      [1, 0, 0, 0, 0, 0, 0, 0, 1],
                      [1, 1, 1, 1, 1, 1, 1, 1, 1],
                    ],
                    spawn: { x: 1, y: 1 },
                    totems: [
                      {
                        id: 'nucleus',
                        x: 4,
                        y: 1,
                        icon: '🧬',
                        label: 'Nucleus',
                        question: {
                          kind: 'fill',
                          prompt: 'The nucleus stores _____.',
                          acceptable: ['dna'],
                        },
                      },
                      {
                        id: 'mito',
                        x: 7,
                        y: 2,
                        icon: '🔋',
                        label: 'Mitochondrion',
                        question: {
                          kind: 'fill',
                          prompt: 'Mitochondria produce _____.',
                          acceptable: ['atp'],
                        },
                      },
                      {
                        id: 'chloro',
                        x: 2,
                        y: 4,
                        icon: '🌿',
                        label: 'Chloroplast',
                        question: {
                          kind: 'fill',
                          prompt: 'Photosynthesis occurs in the _____.',
                          acceptable: ['chloroplast', 'chloroplasts'],
                        },
                      },
                      {
                        id: 'ribo',
                        x: 6,
                        y: 4,
                        icon: '🔵',
                        label: 'Ribosome',
                        question: {
                          kind: 'fill',
                          prompt: 'Ribosomes build _____.',
                          acceptable: ['protein', 'proteins'],
                        },
                      },
                    ],
                    poweredIdea:
                      'Organelles occupy neighborhoods in the cell — spatial memory helps recall their jobs.',
                    root: 'Biology EOC Review — organelles',
                    mnemonic: 'Walk the palace — bump each compartment to recall its job.',
                  },
                  true,
                ),
              ],
              achievement: ach(
                'biochem.cells.organelles',
                '🔭',
                'Organelles',
                'Organelles & Functions',
                'You map every compartment in the cell.',
              ),
              difficulty: 'intro',
              tags: ['cells', 'organelles'],
            }),
            unit({
              id: 'biochem.cells.compare',
              slug: 'prokaryote-eukaryote',
              title: 'Prokaryotes vs Eukaryotes',
              emoji: '🧫',
              shortLabel: 'Pro vs Euk',
              longLabel: 'Prokaryotes vs Eukaryotes',
              teach: {
                headline: 'Membrane-Bound Organelles Define Eukaryotes',
                body: `**Eukaryotic cells** contain membrane-bound organelles (nucleus, mitochondria, ER, Golgi apparatus, etc.).

**Prokaryotic cells** lack a nucleus and membrane-bound organelles.

**Both have:** ribosomes, cytoplasm, plasma membrane, and DNA.

**Only eukaryotes:** nucleus, mitochondria, ER, Golgi, chloroplasts (plants).

The mitochondria's inner membrane is **folded (cristae)** to increase surface area for ATP production.

**Homeostasis:** maintaining stable internal conditions while adjusting to the environment.

**Buffers:** help maintain stable, optimal pH inside cells.`,
                poweredIdea: 'Eukaryotes = nucleus + membrane-bound organelles; prokaryotes = no nucleus.',
              },
              quizzes: [
                mcQuiz(
                  'quiz.biochem.cells.prokaryote',
                  'Which is found in prokaryotes but NOT membrane-bound organelles?',
                  ['Ribosomes', 'Nucleus', 'Mitochondria', 'Golgi apparatus'],
                  0,
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.cells.cristae',
                  'Mitochondria inner membranes are folded to increase _____.',
                  ['surface area', 'surface'],
                ),
                fillQuiz(
                  'quiz.biochem.cells.homeostasis',
                  '_____ is maintaining stable internal conditions while adjusting to the environment.',
                  ['homeostasis'],
                ),
                fillQuiz(
                  'quiz.biochem.cells.buffer',
                  'A buffer helps maintain a stable, optimal _____ inside cells.',
                  ['ph', 'pH'],
                ),
              ],
              achievement: ach(
                'biochem.cells.compare',
                '🧫',
                'Pro vs Euk',
                'Prokaryotes vs Eukaryotes',
                'You draw the line between simple and complex cells.',
              ),
              difficulty: 'core',
              tags: ['cells'],
            }),
            unit({
              id: 'biochem.cells.diagrams',
              slug: 'cell-diagrams',
              title: 'Plant and Animal Cell Diagrams',
              emoji: '🌿',
              shortLabel: 'Cell Diagram',
              longLabel: 'Plant & Animal Cells',
              teach: {
                headline: 'Label the Plant and Animal Cell',
                body: `Plant cells have a **cell wall**, **chloroplasts**, and a large **central vacuole**. Animal cells have **lysosomes** and lack a cell wall.

![Cross-sections of plant and animal cells with labeled organelles](${FIG}/p04_plant_animal_cells.svg)

Key labels: cell wall, cell membrane, nucleus, nucleolus, nuclear membrane, mitochondria, chloroplast (plant), vacuole, lysosome (animal).`,
                figures: [
                  {
                    id: 'p04_plant_animal_cells',
                    alt: 'Labeled cross-sections of plant and animal cells',
                    caption: 'Plant cell (top) vs animal cell (bottom).',
                  },
                ],
                poweredIdea: 'Plant cells have walls and chloroplasts; animal cells have lysosomes.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.cells.plant-only',
                  'Name one structure found in plant cells but not animal cells.',
                  ['cell wall', 'chloroplast', 'chloroplasts', 'large vacuole'],
                  'Green organelle or rigid outer layer',
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.cells.animal-only',
                  'Lysosomes are more prominent in _____ cells.',
                  ['animal'],
                ),
              ],
              achievement: ach(
                'biochem.cells.diagrams',
                '🌿',
                'Cell Diagram',
                'Plant & Animal Cells',
                'You label every organelle in both kingdoms.',
              ),
              difficulty: 'core',
              tags: ['cells'],
            }),
            unit({
              id: 'biochem.transport.types',
              slug: 'transport',
              title: 'Active and Passive Transport',
              emoji: '🚪',
              shortLabel: 'Transport',
              longLabel: 'Active & Passive Transport',
              teach: {
                headline: 'Moving Molecules Across Membranes',
                body: `**Passive transport** moves molecules down their concentration gradient **without ATP** (diffusion, osmosis, facilitated diffusion).

**Active transport** moves molecules **against** their gradient and **requires ATP** (e.g., sodium-potassium pump).

**Diffusion:** movement from high to low concentration.

**Osmosis:** diffusion of water across a selectively permeable membrane.`,
                poweredIdea: 'Passive = no ATP; active = ATP required to go uphill.',
              },
              quizzes: [
                srFill(
                  'quiz.biochem.transport.active',
                  {
                    kind: 'fill',
                    prompt: 'Active transport requires _____.',
                    acceptable: ['atp', 'energy'],
                    hint: 'Cell energy currency',
                  },
                  true,
                ),
                mcQuiz(
                  'quiz.biochem.transport.osmosis',
                  'Osmosis is the diffusion of _____.',
                  ['Water', 'Oxygen', 'Proteins', 'ATP'],
                  0,
                ),
              ],
              achievement: ach(
                'biochem.transport.types',
                '🚪',
                'Transport',
                'Active & Passive Transport',
                'You move molecules with and without ATP.',
              ),
              difficulty: 'core',
              tags: ['cells', 'transport'],
            }),
            unit({
              id: 'biochem.transport.osmosis',
              slug: 'osmosis',
              title: 'Types of Osmosis in Plant Cells',
              emoji: '💧',
              shortLabel: 'Osmosis',
              longLabel: 'Osmosis in Plant Cells',
              teach: {
                headline: 'Hypertonic, Isotonic, Hypotonic',
                body: `![Three plant cells showing plasmolyzed, flaccid/turgid, and turgid states](${FIG}/p05_osmosis_types.svg)

| Condition | Water movement | Plant cell state |
| :--- | :--- | :--- |
| Hypertonic | Water leaves cell | **Plasmolyzed** (shrunken) |
| Isotonic | No net movement | **Flaccid** |
| Hypotonic | Water enters cell | **Turgid** (firm) |

Plant cell walls prevent lysis in hypotonic solutions — animal cells can burst.`,
                figures: [
                  {
                    id: 'p05_osmosis_types',
                    alt: 'Three osmosis outcomes in plant cells: plasmolyzed, flaccid, and turgid',
                    caption: 'A = hypertonic/plasmolyzed; B = isotonic/flaccid; C = hypotonic/turgid.',
                  },
                ],
                poweredIdea: 'Hypotonic → turgid; hypertonic → plasmolyzed.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.osmosis.turgid',
                  'A plant cell in a hypotonic solution becomes _____.',
                  ['turgid'],
                  'Firm and full of water',
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.osmosis.plasmolyzed',
                  'A plasmolyzed cell is in a _____ solution.',
                  ['hypertonic'],
                ),
                mcQuiz(
                  'quiz.biochem.osmosis.isotonic',
                  'A flaccid plant cell is in an _____ solution.',
                  ['Isotonic', 'Hypertonic', 'Hypotonic', 'Plasmolyzed'],
                  0,
                ),
              ],
              achievement: ach(
                'biochem.transport.osmosis',
                '💧',
                'Osmosis',
                'Osmosis in Plant Cells',
                'You watch water swell and shrink the cell.',
              ),
              difficulty: 'core',
              tags: ['cells', 'transport'],
            }),
            unit({
              id: 'biochem.energy.photosynthesis-respiration',
              slug: 'photosynthesis-respiration',
              title: 'Photosynthesis and Respiration',
              emoji: '☀️',
              shortLabel: 'Photo/Resp',
              longLabel: 'Photosynthesis & Respiration',
              teach: {
                headline: 'Energy In and Energy Out',
                body: `**Photosynthesis:** 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂
- Reactants: CO₂, H₂O, sunlight
- Products: glucose, O₂

**Cellular respiration:** C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP
- Reactants: glucose, O₂
- Products: CO₂, H₂O, ATP

**Aerobic respiration** requires oxygen; **anaerobic** does not (fermentation).

**ATP** is the main energy currency of the cell.

![Specialized cell types](${FIG}/p05_specialized_cells.svg)`,
                figures: [
                  {
                    id: 'p05_specialized_cells',
                    alt: 'Icons of nerve, muscle, blood, sperm, xylem, and phloem cells',
                  },
                ],
                poweredIdea: 'Photosynthesis stores energy; respiration releases it as ATP.',
              },
              quizzes: [
                turtleQuiz(
                  'quiz.biochem.energy.glucose-turtle',
                  {
                    roleTitle: 'You are a glucose molecule',
                    setup:
                      'You enter a muscle cell after a meal. Oxygen is available in the mitochondria.',
                    startNodeId: 'start',
                    nodes: [
                      {
                        id: 'start',
                        prompt: 'Glycolysis splits you into pyruvate. What next?',
                        choices: [
                          {
                            label: 'Enter the mitochondrion — full aerobic respiration',
                            nextNodeId: 'aerobic',
                            biology: 'Pyruvate crosses into the mitochondrial matrix.',
                            isOptimal: true,
                            fateTrail: '→ pyruvate',
                          },
                          {
                            label: 'Stay in the cytoplasm — ferment to lactate',
                            nextNodeId: 'anaerobic',
                            biology: 'Without the mitochondrion, fermentation begins.',
                            fateTrail: '→ lactate',
                          },
                        ],
                      },
                      {
                        id: 'aerobic',
                        prompt: 'Krebs cycle and electron transport are online.',
                        choices: [
                          {
                            label: 'Finish aerobic respiration',
                            nextNodeId: null,
                            biology: 'Complete oxidation yields far more ATP.',
                            isOptimal: true,
                            fateTrail: '→ CO₂ + ATP',
                          },
                        ],
                        terminalTitle: 'Exhaled as CO₂ — up to 36 ATP',
                        terminalScene:
                          'Aerobic respiration harvested most of your chemical energy.',
                        isOptimalTerminal: true,
                      },
                      {
                        id: 'anaerobic',
                        prompt: 'No mitochondrion — fermentation only.',
                        choices: [
                          {
                            label: 'Become lactic acid',
                            nextNodeId: null,
                            biology: 'Only 2 ATP net. The muscle may burn.',
                          },
                        ],
                        terminalTitle: 'Lactic acid — 2 ATP only',
                        terminalScene:
                          'Anaerobic respiration releases much less energy than aerobic.',
                        isOptimalTerminal: false,
                      },
                    ],
                    poweredIdea: 'Aerobic respiration extracts far more ATP from glucose than fermentation.',
                    mnemonic: 'PHOTO stores sun in sugar. RESPIRATION cashes sugar for ATP.',
                  },
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.energy.atp',
                  'The main energy source of the cell is _____.',
                  ['atp'],
                ),
                mcQuiz(
                  'quiz.biochem.energy.aerobic',
                  'Which requires oxygen?',
                  ['Aerobic respiration', 'Anaerobic respiration', 'Both equally', 'Neither'],
                  0,
                ),
                fillQuiz(
                  'quiz.biochem.energy.photo-products',
                  'The main product of photosynthesis (besides oxygen) is _____.',
                  ['glucose', 'sugar', 'c6h12o6'],
                ),
                fillQuiz(
                  'quiz.biochem.energy.xylem',
                  '_____ transports water and dissolved minerals from roots to leaves.',
                  ['xylem'],
                ),
                fillQuiz(
                  'quiz.biochem.energy.phloem',
                  '_____ transports organic compounds from leaves to the rest of the plant.',
                  ['phloem'],
                ),
                counterfactualQuiz(
                  'quiz.biochem.energy.photosynthesis-counterfactual',
                  {
                    prompt: 'What if photosynthesis had never evolved?',
                    context:
                      'Oxygenic photosynthesis raised atmospheric O₂, enabled aerobic respiration, the ozone layer, and most multicellular life on Earth.',
                    cards: [
                      {
                        id: 'no-o2',
                        text: 'No oxygen buildup in the atmosphere',
                        depth: 'immediate',
                      },
                      {
                        id: 'no-ozone',
                        text: 'No ozone layer to block UV radiation',
                        depth: 'near',
                      },
                      {
                        id: 'uv',
                        text: 'High UV limits life on land and near the surface',
                        depth: 'near',
                      },
                      {
                        id: 'no-aerobic',
                        text: 'No aerobic respiration — much lower energy yield',
                        depth: 'near',
                      },
                      {
                        id: 'no-plants',
                        text: 'No plants or oxygen-driven food webs',
                        depth: 'far',
                      },
                      {
                        id: 'microbes',
                        text: 'Anaerobic microbial mats dominate the biosphere',
                        depth: 'far',
                      },
                    ],
                    canonicalChain: ['no-o2', 'no-ozone', 'uv', 'no-aerobic', 'no-plants', 'microbes'],
                    finalStateOptions: [
                      {
                        label: 'Anaerobic microbes only — no forests or animals',
                        canonical: true,
                        explanation:
                          'Without oxygenic photosynthesis, complex eukaryotes and land ecosystems are unlikely.',
                      },
                      {
                        label: 'Same biosphere as today — life unchanged',
                        canonical: false,
                        explanation:
                          'Oxygenic photosynthesis fundamentally reshaped surface chemistry and energy budgets.',
                      },
                    ],
                    consensusNotes:
                      'Paleobiologists debate timing details, but agree oxygenic photosynthesis was a major transition enabling complex life.',
                    poweredIdea:
                      'Earth\'s living history is contingent — photosynthesis opened one path among many.',
                    root: 'Biology EOC Review — energy flow',
                    mnemonic: 'No photo → no O₂ → no ozone → no us.',
                  },
                ),
                procedureQuiz(
                  'quiz.biochem.energy.central-dogma-procedure',
                  {
                    goal: 'Write a procedure that produces a functional protein from a gene.',
                    initialState: 'DNA in nucleus',
                    targetState: 'Folded protein in cytoplasm',
                    blocks: [
                      {
                        id: 'transcribe',
                        label: 'Transcribe gene → pre-mRNA',
                        icon: '📝',
                        narration: 'RNA polymerase copies the gene into messenger RNA.',
                      },
                      {
                        id: 'splice',
                        label: 'Splice introns from pre-mRNA',
                        icon: '✂️',
                        narration: 'Spliceosomes remove introns and join exons.',
                      },
                      {
                        id: 'export',
                        label: 'Export mRNA through nuclear pore',
                        icon: '🚪',
                        narration: 'Processed mRNA leaves the nucleus.',
                      },
                      {
                        id: 'translate',
                        label: 'Translate mRNA at ribosome',
                        icon: '🔤',
                        narration: 'Ribosomes read codons and assemble amino acids.',
                      },
                      {
                        id: 'fold',
                        label: 'Fold polypeptide into protein',
                        icon: '🧶',
                        narration: 'The polypeptide chain folds into its functional shape.',
                      },
                    ],
                    canonicalOrder: ['transcribe', 'splice', 'export', 'translate', 'fold'],
                    poweredIdea:
                      'Gene expression is a pipeline of named sub-procedures, each modifying the molecule.',
                    root: 'Biology EOC Review — central dogma',
                    mnemonic: 'Transcribe, process, export, translate, fold — the protein pipeline.',
                  },
                ),
                conceptMapQuiz(
                  'quiz.biochem.energy.respiration-map',
                  {
                    focalConcept: 'Cellular Respiration',
                    nodes: [
                      { id: 'glucose', label: 'Glucose', icon: '🍬' },
                      { id: 'o2', label: 'Oxygen', icon: '💨' },
                      { id: 'co2', label: 'CO₂', icon: '☁️' },
                      { id: 'atp', label: 'ATP', icon: '⚡' },
                      { id: 'mito', label: 'Mitochondrion', icon: '🔋' },
                      { id: 'glycolysis', label: 'Glycolysis', icon: '🔄' },
                    ],
                    decoyNodes: [{ id: 'chloro', label: 'Chloroplast', icon: '🌿' }],
                    canonicalEdges: [
                      {
                        from: 'glucose',
                        to: 'glycolysis',
                        label: 'enters',
                        importance: 'critical',
                        reasonIfMissing: 'Glycolysis begins with glucose splitting in the cytoplasm.',
                      },
                      {
                        from: 'glycolysis',
                        to: 'mito',
                        label: 'feeds',
                        importance: 'standard',
                        reasonIfMissing: 'Pyruvate enters the mitochondrion for aerobic steps.',
                      },
                      {
                        from: 'mito',
                        to: 'atp',
                        label: 'produces',
                        importance: 'critical',
                        reasonIfMissing: 'Most ATP is harvested in the mitochondrion.',
                      },
                      {
                        from: 'o2',
                        to: 'mito',
                        label: 'enters',
                        importance: 'critical',
                        reasonIfMissing: 'Oxygen is the final electron acceptor in aerobic respiration.',
                      },
                      {
                        from: 'mito',
                        to: 'co2',
                        label: 'produces',
                        importance: 'standard',
                        reasonIfMissing: 'Carbon dioxide is released during the Krebs cycle.',
                      },
                    ],
                    allowedLabels: ['enters', 'feeds', 'produces', 'consumes', 'requires', 'occurs in'],
                    poweredIdea:
                      'Respiration is a network of inputs, stages, and outputs — not a single step.',
                    root: 'Biology EOC Review — respiration pathways',
                    mnemonic: 'Glucose in, ATP out — trace every labeled edge.',
                  },
                ),
              ],
              achievement: ach(
                'biochem.energy.photosynthesis-respiration',
                '☀️',
                'Photo/Resp',
                'Photosynthesis & Respiration',
                'You balance the equations of life.',
              ),
              difficulty: 'core',
              tags: ['cells', 'energy'],
            }),
          ],
        },
      ],
    },
  ],
};
