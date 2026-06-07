// AUTO-GENERATED from plan/inbox/2025-biology-eoc-released-form.json (NCDPI 2025 NC Biology EOC Released Form).
import type { ReaderGroup, ReaderQuestion } from '@/components/reader/reader-types';

export const T2_QUIZ_TITLE = "2025 NC Biology End-of-Course Released Form";

export const T2_GROUPS: ReaderGroup[] = [
  {
    id: 'brackish-life',
    title: 'The Brackish Life',
    passage: 'Finger mullets are small fish that play a critical role in North Carolina\'s estuary ecosystems. Estuaries are ecosystems of change, and life is not always easy for finger mullets there. An estuary is a brackish water environment. Salinity changes in response to tidal changes. At high tide, the estuary is filled with more ocean water, and the salinity increases. The salinity decreases at low tide, when the ocean waters recede and fresh water from the mouth of the river is allowed in. Organisms that live in this environment are specially adapted for constantly changing salinity levels. When the salinity of the water changes, the cells of the organisms that live there must adjust by either taking in water or releasing it.',
    figures: [
      { label: 'Figure 1', title: 'Diagram of a Gill Tissue Cell', description: 'A finger mullet gill tissue cell in high-salinity brackish water. The cell has a labeled cellular membrane and nucleus. Salt particles (small dots) are densely packed outside the cell in the brackish water and sparsely distributed inside the cell, showing higher external salt concentration.' },
      { label: 'Figure 2', title: 'Estuary Food Web', description: 'Food web with finger mullet at the center. Arrows point from prey to predator. Algae and phytoplankton are eaten by zooplankton. Phytoplankton is also eaten by snail. Seagrass is eaten by snail. Zooplankton is eaten by finger mullet. Snail is eaten by crab. Crab is eaten by heron. Finger mullet is eaten by red drum, bluefish, heron, and bull shark. Red drum and bluefish are eaten by bull shark.' },
    ],
  },
  {
    id: 'basketball-height',
    title: 'Do You Play Basketball?',
    passage: 'Judd gets asked at least once a day whether he plays basketball. At 6\'7" he is very tall. Judd\'s dad is tall (6\'3"), and Judd\'s mom is above average height for women (5\'9"). How can it be that Judd is taller than both of his parents? Human height is controlled by at least three genes, each with two alleles: dominant (T) and recessive (t), where T is expressed as tall height.',
    figures: [
      { label: 'Figure 1', title: 'Combination of Genes through Fertilization', description: 'Sperm nucleus contains two T and one t allele. Egg nucleus contains two T and one t allele. Fertilization produces a fertilized egg with four T and two t alleles. After division, the embryo consists of five cells, each with four T and two t alleles.' },
      { label: 'Figure 2', title: 'Range of Phenotypes for Human Height in Males', description: 'Bell-shaped histogram. Y-axis: Percentage of Males (0-12%). X-axis: Phenotype height in inches (50-85). Peak at approximately 67-68 inches (12%). Distribution is symmetrical; most males fall between 60 and 75 inches. Heights of 50-55 inches and 75-80 inches are in the low-frequency tails.' },
    ],
  },
];

export const T2_QUESTIONS: ReaderQuestion[] = [
  {
    id: 't2-q1', label: '1',
    stem: 'How is a DNA molecule arranged?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'double-stranded with alternating deoxyribose and phosphate groups on the sides with adenine, guanine, cytosine, and thymine in the middle', correct: true },
      { label: 'B', text: 'double-stranded with alternating deoxyribose and phosphate groups on the sides with adenine, guanine, cytosine, and uracil in the middle', correct: false },
      { label: 'C', text: 'double-stranded with alternating ribose and phosphate groups on the sides with adenine, guanine, cytosine, and thymine in the middle', correct: false },
      { label: 'D', text: 'double-stranded with alternating ribose and phosphate groups on the sides with adenine, guanine, cytosine, and uracil in the middle', correct: false },
    ],
  },
  {
    id: 't2-q2', label: '2',
    stem: 'Enzyme X is needed for a reaction to occur. What is the most likely result when additional Enzyme X is added to the reaction?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'an increase in the reaction rate', correct: true },
      { label: 'B', text: 'a decrease in the reaction rate', correct: false },
      { label: 'C', text: 'a decrease in the product concentration', correct: false },
      { label: 'D', text: 'an increase in the substrate concentration', correct: false },
    ],
  },
  {
    id: 't2-q3', label: '3',
    stem: 'Hummingbirds thrive in warm, moist climates, and their primary source of food is nectar from flowering plants. A three-year drought is expected in an ecosystem. How will this most likely affect the hummingbird population in that ecosystem?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'The hummingbirds will increase their reproductive rate in order to ensure enough individuals survive.', correct: false },
      { label: 'B', text: 'The hummingbirds will decrease their reproductive rate in order to decrease genetic diversity within the population.', correct: false },
      { label: 'C', text: 'The hummingbirds will immediately adapt to eat new food sources, increasing the overall survival rate of the population.', correct: false },
      { label: 'D', text: 'The hummingbirds will struggle to find food, and only those that can adapt to new food sources will survive.', correct: true },
    ],
  },
  {
    id: 't2-q4', label: '4',
    stem: 'This chart shows characteristics of four different cells observed under a microscope. Which is most likely a prokaryotic cell?',
    figureNotes: [
      'Table with columns Cell, Cell Wall, Chloroplast, Mitochondria, Ribosome. Check marks indicate presence. Cell 1: no cell wall, no chloroplast, has mitochondria and ribosomes. Cell 2: has all four. Cell 3: has cell wall and ribosomes only. Cell 4: has cell wall, mitochondria, and ribosomes.',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Cell 1', correct: false },
      { label: 'B', text: 'Cell 2', correct: false },
      { label: 'C', text: 'Cell 3', correct: true },
      { label: 'D', text: 'Cell 4', correct: false },
    ],
  },
  {
    id: 't2-q5', label: '5',
    stem: 'What is the significance of three consecutive nucleotides in DNA?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'They code for one amino acid.', correct: true },
      { label: 'B', text: 'They code for three amino acids.', correct: false },
      { label: 'C', text: 'They code for one complete protein.', correct: false },
      { label: 'D', text: 'They code for three complete proteins.', correct: false },
    ],
  },
  {
    id: 't2-q6', label: '6',
    stem: 'A cell experiences an error during the cell cycle, causing it to go through cytokinesis before mitosis. Which statement best describes the new cells?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'The new cells will be double the size of the original cell.', correct: false },
      { label: 'B', text: 'The new cells will have twice as much DNA as the original cell.', correct: false },
      { label: 'C', text: 'The new cells will have no DNA or organelles but will continue progressing through the cell cycle.', correct: false },
      { label: 'D', text: 'The new cells will have an incorrect amount of DNA and organelles, and will likely experience cell death.', correct: true },
    ],
  },
  {
    id: 't2-q7', label: '7',
    stem: 'Among birds, some skin cells grow feathers when they mature, while other skin cells grow scales at maturity. Which statement best explains this difference?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Skin cells exposed to colder environments grow feathers, while skin cells exposed to wet environments grow scales.', correct: false },
      { label: 'B', text: 'While all cells have the same DNA, specialized cells express certain traits that produce feathers or scales.', correct: true },
      { label: 'C', text: 'Skin cells that have feathers are diploid, while skin cells that make scales are haploid.', correct: false },
      { label: 'D', text: 'Some skin cells have different DNA to build structures like feathers and scales.', correct: false },
    ],
  },
  {
    id: 't2-q8', label: '8',
    stem: 'The table below describes several different types of energy transfer processes. Which transfer represents photosynthesis?',
    figureNotes: [
      'Energy Transfer in Organisms: Transfer 1: solar to chemical. Transfer 2: chemical to heat. Transfer 3: chemical to ATP. Transfer 4: solar to ATP.',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: '1', correct: true },
      { label: 'B', text: '2', correct: false },
      { label: 'C', text: '3', correct: false },
      { label: 'D', text: '4', correct: false },
    ],
  },
  {
    id: 't2-q9', label: '9',
    stem: 'A group of students completed two experiments. Their notes are below: Experiment 1: Hydrogen peroxide was poured on a slice of raw potato. The peroxide bubbled vigorously. The peroxide was broken down into water and oxygen. Experiment 2: A slice of raw potato was heated and then hydrogen peroxide was poured on it. There was no visible reaction. Which statement explains the results of these experiments?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Heating the potato had no effect on the potato enzymes.', correct: false },
      { label: 'B', text: 'Heating the potato caused the hydrogen peroxide to evaporate, so the reaction did not occur.', correct: false },
      { label: 'C', text: 'Heating the potato caused the potato enzymes to release the water and oxygen from the hydrogen peroxide.', correct: false },
      { label: 'D', text: 'Heating the potato caused a shape change in the potato enzymes, so they could no longer function properly.', correct: true },
    ],
  },
  {
    id: 't2-q10', label: '10',
    stem: 'The diagram below shows a plant cell. The vacuole allows the plant cell to store water for later use in photosynthesis. A mutation occurs and the size of the vacuole decreases. What effect will this have on the rate of photosynthesis in the cell?',
    figureNotes: [
      'Cross-section of a plant cell with labeled cell wall, large central vacuole occupying most of the cell volume, nucleus pushed to the edge, and several oval organelles (chloroplasts/mitochondria) in the cytoplasm.',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'The vacuole will be less able to hold water, decreasing the rate of photosynthesis.', correct: true },
      { label: 'B', text: 'The vacuole will be more able to hold water, increasing the rate of photosynthesis.', correct: false },
      { label: 'C', text: 'The cell will be able to take in more water, decreasing the rate of photosynthesis.', correct: false },
      { label: 'D', text: 'The cell will be able to release more water, increasing the rate of photosynthesis.', correct: false },
    ],
  },
  {
    id: 't2-q11', label: '11',
    groupId: 'brackish-life',
    stem: 'How does the cellular membrane of the finger mullet\'s cell contribute to homeostasis within the cell?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'It serves as a solid membrane, allowing no materials to pass into and out of the cell.', correct: false },
      { label: 'B', text: 'It serves as an impermeable membrane, allowing only water to move into and out of the cell.', correct: false },
      { label: 'C', text: 'It serves as a selectively permeable membrane, allowing water and other materials to move into and out of the cell as needed.', correct: true },
      { label: 'D', text: 'It serves as a permeable membrane, allowing any material to easily pass into and out of the cell, whether needed or not.', correct: false },
    ],
  },
  {
    id: 't2-q12', label: '12',
    groupId: 'brackish-life',
    stem: 'Use the drop-down menus below to complete the statement, explaining how the cellular membrane shown in Figure 1 helps support the finger mullet in a high-salinity environment.',
    kind: 'inline',
    template: 'The cell membrane {dropdown1} by allowing water {dropdown2}',
    dropdowns: [
      { id: 'dropdown1', options: ['maintains homeostasis', 'disrupts homeostasis'], answer: 'maintains homeostasis' },
      { id: 'dropdown2', options: ['to enter the cell.', 'to exit the cell.'], answer: 'to exit the cell.' },
    ],
  },
  {
    id: 't2-q13', label: '13',
    groupId: 'brackish-life',
    stem: 'A researcher hypothesizes that water will move out of the cell more quickly when the concentration of salt in the water outside the cell is greater. Which experiment would best test this hypothesis?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'A researcher places three cells of the same type in varying concentrations of salt water. Then the researcher measures the size of each cell every minute during a 5-minute period of time.', correct: true },
      { label: 'B', text: 'A researcher places three cells of the same type in the same concentration of salt water. Then the researcher measures the size of each cell every minute during a 5-minute period of time.', correct: false },
      { label: 'C', text: 'A researcher places cells from three different fish in varying concentrations of salt water. Then the researcher measures the size of each cell at the end of a 5-minute period of time.', correct: false },
      { label: 'D', text: 'A researcher places cells from three different fish in the same concentration of salt water. Then the researcher measures the size of each cell at the end of a 5-minute period of time.', correct: false },
    ],
  },
  {
    id: 't2-q14', label: '14',
    groupId: 'brackish-life',
    stem: 'Based on the food web (Figure 2), what effect will a decrease in the algae population have on the finger mullet population in the estuary?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'The finger mullet population will increase because the zooplankton population will decrease.', correct: false },
      { label: 'B', text: 'The finger mullet population will decrease because the zooplankton population will increase.', correct: false },
      { label: 'C', text: 'The finger mullet population will decrease because the zooplankton population will decrease.', correct: true },
      { label: 'D', text: 'The finger mullet population will stay the same because algae is not a direct food source for the mullets.', correct: false },
    ],
  },
  {
    id: 't2-q15', label: '15',
    groupId: 'brackish-life',
    stem: 'Based on the food web (Figure 2), which statements are true? Select three true statements.',
    kind: 'choice', multi: true,
    selectCount: 3,
    choices: [
      { label: 'A', text: 'The red drum only receives energy by consuming finger mullets.', correct: true },
      { label: 'B', text: 'The seagrass obtains its energy from the phytoplankton and algae.', correct: false },
      { label: 'C', text: 'The phytoplankton produce oxygen and glucose the heron needs to survive.', correct: true },
      { label: 'D', text: 'The phytoplankton produce carbon dioxide and glucose the algae need to survive.', correct: false },
      { label: 'E', text: 'The bull shark and heron populations have the most energy available because they are at the top of the food chain.', correct: false },
      { label: 'F', text: 'The phytoplankton population has the most energy available because it is at the bottom of the food chain.', correct: true },
    ],
  },
  {
    id: 't2-q16', label: '16',
    stem: 'Which model represents energy transfer within a food web in a stable ecosystem?',
    figureNotes: [
      'Four trophic-level models labeled A through D as described in the answer choices.',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Four equal-width stacked rectangles labeled producers, primary consumers, secondary consumers, tertiary consumers (bottom to top).', correct: false },
      { label: 'B', text: 'Upright triangle divided into three tiers narrowing toward the top: producers (widest base), primary consumers, secondary consumers (narrow peak).', correct: true },
      { label: 'C', text: 'Inverted triangle divided into three tiers narrowing toward the bottom: producers (narrow bottom point), primary consumers, secondary consumers (widest top).', correct: false },
      { label: 'D', text: 'Diamond shape divided into four horizontal sections: producers (narrow bottom), primary consumers (wide), secondary consumers (wide), tertiary consumers (narrow top).', correct: false },
    ],
  },
  {
    id: 't2-q17', label: '17',
    stem: 'What would most likely occur if a new insect species were introduced into North Carolina\'s ecosystems?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'The new insect species would maintain the stability of the area.', correct: false },
      { label: 'B', text: 'The new insect species would have less reproductive success.', correct: false },
      { label: 'C', text: 'The new insect species would be eaten by natural predators.', correct: false },
      { label: 'D', text: 'The new insect species would increase competition for food resources.', correct: true },
    ],
  },
  {
    id: 't2-q18', label: '18',
    stem: 'Which human action could best reduce global climate change?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'increasing the ozone layer', correct: false },
      { label: 'B', text: 'converting to carbon-free energy', correct: true },
      { label: 'C', text: 'monitoring smog levels in urban areas', correct: false },
      { label: 'D', text: 'protecting fresh water against pollution', correct: false },
    ],
  },
  {
    id: 't2-q19', label: '19',
    stem: 'These diagrams illustrate two reproductive processes. Which statement best explains the processes?',
    figureNotes: [
      'Process X: two 1n (haploid) cells combine into one 2n (diploid) cell (fertilization). Process Z: one 2n cell divides into two 2n cells (mitosis).',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Process X results in cells that have more genetic variation than those produced through Process Z.', correct: true },
      { label: 'B', text: 'Process X results in cells that have less genetic variation than those produced through Process Z.', correct: false },
      { label: 'C', text: 'Process X results in 1 cell that has the exact same DNA as the parent cells, and Process Z results in 2 cells that have the exact same DNA as the parent cell.', correct: false },
      { label: 'D', text: 'Process X results in 1 cell that has the exact same DNA as the parent cells, while Process Z results in 2 cells that have different DNA from the parent cell.', correct: false },
    ],
  },
  {
    id: 't2-q20', label: '20',
    stem: 'This diagram shows homologous chromosomes. Which choice best describes the source of genetic variation?',
    figureNotes: [
      'Two homologous X-shaped chromosomes side by side (one outlined, one solid black). After a process shown by an arrow, the chromosomes have exchanged segments at the tips of their lower chromatids.',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'crossing-over', correct: true },
      { label: 'B', text: 'gene mutation', correct: false },
      { label: 'C', text: 'nondisjunction', correct: false },
      { label: 'D', text: 'independent assortment', correct: false },
    ],
  },
  {
    id: 't2-q21', label: '21',
    stem: 'The Punnett square below represents the gametes of a mother and a father for a certain blood type. Fill in all highlighted cells with the appropriate genotype combinations.',
    figureNotes: [
      '2x2 Punnett square. Mother alleles A and O across top; father alleles B and O down left side. Bottom-left cell prefilled AO; other three cells empty (highlighted).',
    ],
    kind: 'open',
    answerText: 'AB; BO; OO',
  },
  {
    id: 't2-q22', label: '22',
    stem: 'How will melting of the polar ice caps affect the animal populations in the Arctic region?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Arctic organisms will have more available oxygen.', correct: false },
      { label: 'B', text: 'Arctic organisms will have more available drinking water.', correct: false },
      { label: 'C', text: 'Polar bears will find it easier to find food and habitat resources.', correct: false },
      { label: 'D', text: 'Polar bears will find it more difficult to find food and habitat resources.', correct: true },
    ],
  },
  {
    id: 't2-q23', label: '23',
    stem: 'This diagram represents the DNA fingerprint for a man, a woman, and four different babies, one of which is the man and woman\'s baby. Based on the DNA fingerprints, which is most likely the man and woman\'s baby?',
    figureNotes: [
      'Gel electrophoresis columns for Man (6 bands), Woman (6 bands), Baby W, Baby X, Baby Y, Baby Z. Baby Y: every band matches either the man or woman (3 from each). Baby Z: all bands match parents (4 from man, 2 from woman). Baby W and Baby X each have bands that do not match either parent.',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Baby W', correct: false },
      { label: 'B', text: 'Baby X', correct: false },
      { label: 'C', text: 'Baby Y', correct: true },
      { label: 'D', text: 'Baby Z', correct: false },
    ],
  },
  {
    id: 't2-q24', label: '24',
    stem: 'A farmer reads this information: A bacterium has a gene that allows it to create pesticide. The gene has been transferred into a corn plant, allowing the corn plant to produce pesticide. Why might a farmer choose to plant genetically engineered corn?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'to spread mutations from the corn to other crops', correct: false },
      { label: 'B', text: 'to reduce chemical use during the growing season', correct: true },
      { label: 'C', text: 'to allow the fields to be used for more than one season', correct: false },
      { label: 'D', text: 'to decrease the amount of land needed to grow the corn crop', correct: false },
    ],
  },
  {
    id: 't2-q25', label: '25',
    stem: 'A patient takes medication to treat strep throat caused by the bacteria Streptococcus pyogenes. Which statement best describes the reproductive success of the bacteria after the patient has taken the medication for a period of time?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'The bacteria may develop resistance to the medication and continue to reproduce.', correct: true },
      { label: 'B', text: 'The patient will require a vaccination to prevent the bacteria from reproducing.', correct: false },
      { label: 'C', text: 'The patient\'s immune system will produce antibodies that prevent the bacteria\'s reproduction.', correct: false },
      { label: 'D', text: 'The medication may serve as an energy source and cause rapid reproduction of the bacteria.', correct: false },
    ],
  },
  {
    id: 't2-q26', label: '26',
    stem: 'Which information provides the most reliable evidence of common ancestry for four species of mammals?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'embryological forms', correct: false },
      { label: 'B', text: 'nucleotide sequences', correct: true },
      { label: 'C', text: 'anatomical structures', correct: false },
      { label: 'D', text: 'homologous structures', correct: false },
    ],
  },
  {
    id: 't2-q27', label: '27',
    stem: 'A marine biology program has monitored a population of sharks in the southern Atlantic Ocean for over 100 years. The population has been very successful over this period of time. The biologists hypothesize that natural selection has been acting on the population, increasing its ability to thrive. Select the three observations that best support the hypothesis.',
    kind: 'choice', multi: true,
    selectCount: 3,
    choices: [
      { label: 'A', text: 'The sharks have been able to adapt to changes in their environment.', correct: true },
      { label: 'B', text: 'The sharks have been unable to adapt to changes in their environment.', correct: false },
      { label: 'C', text: 'Individuals are very similar to one another as a result of genetic continuity.', correct: false },
      { label: 'D', text: 'Individuals differ from one another as a result of genetic diversity.', correct: true },
      { label: 'E', text: 'The average number of births has been less than the average number of deaths in the population.', correct: false },
      { label: 'F', text: 'The average number of births has been greater than the average number of deaths in the population.', correct: true },
    ],
  },
  {
    id: 't2-q28', label: '28',
    stem: 'A population of rabbits lives in a forest. Some of the rabbits have a mutation that results in extra-powerful hind legs. What will most likely happen to the population of rabbits if a population of wolves is introduced to the forest?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'The number of rabbits with normal legs will increase over time because their DNA is not mutated.', correct: false },
      { label: 'B', text: 'The number of rabbits with powerful legs will increase over time because they can better escape the wolves.', correct: true },
      { label: 'C', text: 'The total number of rabbits will decrease over time because all rabbits have an equal chance of getting eaten.', correct: false },
      { label: 'D', text: 'The total number of rabbits will decrease over time because most rabbits will have induced mutations that reduce their survival rate.', correct: false },
    ],
  },
  {
    id: 't2-q29', label: '29',
    stem: 'An enzyme has an optimal temperature of 25°C. During an experiment, which action would most likely increase the rate of the reaction?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'decreasing the light intensity', correct: false },
      { label: 'B', text: 'increasing the temperature above 25°C', correct: false },
      { label: 'C', text: 'decreasing the amount of substrate available', correct: false },
      { label: 'D', text: 'increasing the temperature from 15°C to 25°C', correct: true },
    ],
  },
  {
    id: 't2-q30', label: '30',
    stem: 'Using the dichotomous key and the tree images, place the characteristics of each species in the correct box. Then place the scientific names that identify each species. Fill in all cells.',
    figureNotes: [
      'Dichotomous key table and four species branch illustrations (Species 1-4) as described above.',
    ],
    kind: 'open',
    answerText: '1: more than 5 needles in each cluster; 2: Pinus strobus; 3: long needles clustered in pairs; Pinus resinosa; 4: short needles clustered in pairs',
  },
  {
    id: 't2-q31', label: '31',
    stem: 'The diagram below shows a normal plant cell. Which plant cell can no longer translate mRNA into amino acids?',
    figureNotes: [
      'Reference diagram of normal plant cell with labeled cell wall, cell membrane, vacuole, nucleus, ribosomes on ER, chloroplasts, mitochondria, and cytoplasm.',
      'Four answer-choice plant cells (A-D) differing in vacuole size, organelle counts, and presence of ribosome dots as described in choices.',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Cell A: large vacuole, 7 chloroplasts, 0 mitochondria, cytoplasm with many ribosome dots.', correct: false },
      { label: 'B', text: 'Cell B: large vacuole, 0 chloroplasts, 3 mitochondria, cytoplasm with many ribosome dots.', correct: false },
      { label: 'C', text: 'Cell C: large vacuole, 6 chloroplasts, 3 mitochondria, solid grey cytoplasm with no ribosome dots.', correct: true },
      { label: 'D', text: 'Cell D: smaller vacuole, 6 chloroplasts, 6 mitochondria, cytoplasm with many ribosome dots.', correct: false },
    ],
  },
  {
    id: 't2-q32', label: '32',
    stem: 'This is a phylogenetic tree. Based on the phylogenetic tree, which two organisms share the most recent common ancestor?',
    figureNotes: [
      'Rooted cladogram. Tips top to bottom: drosophila, lancelet, zebrafish, frog, chicken, chimpanzee, mouse. Chimpanzee and mouse are sister taxa sharing the rightmost (most recent) internal node.',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'drosophila and lancelet', correct: false },
      { label: 'B', text: 'frog and chicken', correct: false },
      { label: 'C', text: 'chicken and mouse', correct: true },
      { label: 'D', text: 'chimpanzee and frog', correct: false },
    ],
  },
  {
    id: 't2-q33', label: '33',
    stem: 'The plants in an ecosystem complete both photosynthesis and cellular respiration. How do the two processes differ from one another in terms of energy?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Photosynthesis stores solar energy in the chemical bonds of carbohydrates, while cellular respiration releases energy from the chemical bonds in carbohydrates to produce ATP molecules.', correct: true },
      { label: 'B', text: 'Photosynthesis releases energy from the chemical bonds in carbohydrates to produce ATP molecules, while cellular respiration stores solar energy in the chemical bonds of carbohydrates.', correct: false },
      { label: 'C', text: 'Photosynthesis stores solar energy in ATP molecules for cellular use, while cellular respiration produces ATP by breaking inorganic chemical bonds.', correct: false },
      { label: 'D', text: 'Photosynthesis stores solar energy in high-energy chemical bonds of inorganic compounds, while cellular respiration releases solar energy to heat cellular structures.', correct: false },
    ],
  },
  {
    id: 't2-q34', label: '34',
    stem: 'A biologist analyzed a sample of pond water and recorded the different organisms in the sample. This table shows the number of each organism in the pond sample. Why does the sample contain more phytoplankton than trout?',
    figureNotes: [
      'Organisms and Number: phytoplankton 50,000-70,000; frogs 50; insect larvae 800-900; trout 3.',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'A trout requires less energy than a phytoplankton organism.', correct: false },
      { label: 'B', text: 'Phytoplankton receive energy from the other organisms.', correct: false },
      { label: 'C', text: 'Insect larvae obtain energy directly from the sun and transfer energy to the other organisms.', correct: false },
      { label: 'D', text: 'Phytoplankton obtain energy directly from the sun and transfer energy to the other organisms.', correct: true },
    ],
  },
  {
    id: 't2-q35', label: '35',
    stem: 'How would a longer snow season most likely affect the populations of red and white foxes living in the same forest ecosystem?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Red foxes would have a greater advantage, so their population size would increase, while the white fox population size would decrease.', correct: false },
      { label: 'B', text: 'White foxes would have a greater advantage, so their population size would increase, while the red fox population size would decrease.', correct: true },
      { label: 'C', text: 'White foxes would have a lesser advantage, so their population size would increase, while the red fox population size would remain the same.', correct: false },
      { label: 'D', text: 'Red foxes would have a lesser advantage, so their population size would increase, while the white fox population size would remain the same.', correct: false },
    ],
  },
  {
    id: 't2-q36', label: '36',
    groupId: 'basketball-height',
    stem: 'Use the drop-down menus below to complete the statement about the cells of the embryo.',
    kind: 'inline',
    template: 'The cells of the embryo are {dropdown1} because of {dropdown2}',
    dropdowns: [
      { id: 'dropdown1', options: ['diploid', 'haploid'], answer: 'diploid' },
      { id: 'dropdown2', options: ['fertilization.', 'genetic recombination.', 'meiotic division.'], answer: 'fertilization.' },
    ],
  },
  {
    id: 't2-q37', label: '37',
    groupId: 'basketball-height',
    stem: 'Judd has a 20-year-old sister. Her height is 5\'4". Which statement best explains why his sister is shorter than him and their parents?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'She received no genes for height from her mother.', correct: false },
      { label: 'B', text: 'She received no genes for height from either parent.', correct: false },
      { label: 'C', text: 'The embryo that became Judd\'s sister had a higher percentage of recessive alleles than the embryo that became Judd.', correct: true },
      { label: 'D', text: 'The embryo that became Judd\'s sister had a higher percentage of dominant alleles than the embryo that became Judd.', correct: false },
    ],
  },
  {
    id: 't2-q38', label: '38',
    groupId: 'basketball-height',
    stem: 'Use the drop-down menus below to complete the description of the trait for height, based on the graph (Figure 2).',
    kind: 'inline',
    template: 'Height is controlled by {dropdown1} and results in a {dropdown2} range of phenotypes.',
    dropdowns: [
      { id: 'dropdown1', options: ['a single gene', 'multiple genes'], answer: 'multiple genes' },
      { id: 'dropdown2', options: ['narrow', 'wide'], answer: 'wide' },
    ],
  },
  {
    id: 't2-q39', label: '39',
    groupId: 'basketball-height',
    stem: 'Some of the phenotypes for male height are identified by two distinct ranges. Range 1: 50-55 inches. Range 2: 75-80 inches. Which choice best describes how these height ranges are represented in Figure 2?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Both Range 1 and Range 2 represent rare phenotypes for male height.', correct: true },
      { label: 'B', text: 'Both Range 1 and Range 2 represent common phenotypes for male height.', correct: false },
      { label: 'C', text: 'Range 1 represents a rare phenotype, while Range 2 represents a common phenotype for male height.', correct: false },
      { label: 'D', text: 'Range 1 represents a common phenotype, while Range 2 represents a rare phenotype for male height.', correct: false },
    ],
  },
  {
    id: 't2-q40', label: '40',
    groupId: 'basketball-height',
    stem: 'Judd visits an exhibit at a local museum. A display there describes a recent research study where people from several distinct neighborhoods in a large U.S. city were surveyed for height. What can most likely be inferred from the research data?',
    figureNotes: [
      'Neighborhood survey data. Neighborhood 1: 136 people, avg height 5\'10", high socioeconomic status, positive health. Neighborhood 2: 188 people, avg height 5\'6", low socioeconomic status, negative health. Neighborhood 3: 176 people, avg height 5\'7", low socioeconomic status, moderate health. Footnote defines socioeconomic status and health evaluation criteria.',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'The trait for height results from mutational changes in a person\'s DNA sequence.', correct: false },
      { label: 'B', text: 'The trait for height can be influenced by the environment in which a person lives.', correct: true },
      { label: 'C', text: 'The trait for height results from genetic diversity in the neighborhood\'s gene pool.', correct: false },
      { label: 'D', text: 'The trait for height is influenced by the heights of other people living in the environment.', correct: false },
    ],
  },
  {
    id: 't2-q41', label: '41',
    stem: 'How might mutations contribute to natural selection?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'They occur after a natural disaster has changed a population\'s environment.', correct: false },
      { label: 'B', text: 'They result when organisms observe traits of other successful populations.', correct: false },
      { label: 'C', text: 'They occur in somatic cells and can be passed to offspring.', correct: false },
      { label: 'D', text: 'They add variations to the gene pool of a population.', correct: true },
    ],
  },
  {
    id: 't2-q42', label: '42',
    stem: 'Modern dairy cows are different from their ancestors. They produce larger volumes of milk with higher protein and fat content. Which statement best explains this?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Dairy cows within the species have interbred, resulting in low genetic diversity among offspring.', correct: false },
      { label: 'B', text: 'Dairy cows within the species have interbred, resulting in high genetic diversity among offspring.', correct: false },
      { label: 'C', text: 'Humans have used artificial selection to encourage transmission of traits associated with high-quality milk production from parent cows to offspring.', correct: true },
      { label: 'D', text: 'Humans have used natural selection to encourage transmission of traits associated with high-quality milk production from parent cows to offspring.', correct: false },
    ],
  },
  {
    id: 't2-q43', label: '43',
    stem: 'The graph below represents the size of a bacteria population. A scientist introduces an antibiotic to the population at Generation 40. Which statement best explains the population increase after Generation 70?',
    figureNotes: [
      'Line graph. Y-axis Population Size (0-12,500). X-axis Generation (0-100). Population rises from ~500 at Gen 0 to peak ~5,750 at Gen 40, drops to low ~2,100 at Gen 70, then rises to 7,500 at Gen 100.',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Some bacteria adapted by developing resistance to the antibiotic, allowing them to survive and reproduce.', correct: true },
      { label: 'B', text: 'All bacteria adapted by developing resistance to the antibiotic, preventing them from surviving and reproducing.', correct: false },
      { label: 'C', text: 'The antibiotic prevented mutations in the DNA of some bacteria, allowing them to survive and reproduce.', correct: false },
      { label: 'D', text: 'The antibiotic caused a mutation in the DNA of all bacteria, preventing them from surviving and reproducing.', correct: false },
    ],
  },
  {
    id: 't2-q44', label: '44',
    stem: 'How could a scientist best determine whether a fungus is a new species?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'by comparing the physical appearance of the fungus to a known fungal species', correct: false },
      { label: 'B', text: 'by comparing the epidermal cells of the fungus to a known fungal species', correct: false },
      { label: 'C', text: 'by comparing the feeding habits of the fungus to a known fungal species', correct: false },
      { label: 'D', text: 'by comparing the DNA sequence of the fungus to a known fungal species', correct: true },
    ],
  },
  {
    id: 't2-q45', label: '45',
    stem: 'The bacterium Yersinia pestis is responsible for causing bubonic plague in the 1300s. Survivors of plague showed an increased frequency of a mutation for a cell receptor protein which prevented infection from the bacterium. Which statement best explains the genetic change in Europe\'s population after the bubonic plague outbreak?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'The number of people with the mutation increased because of the use of a vaccine.', correct: false },
      { label: 'B', text: 'The number of people with the mutation increased because there was an immediate increase in variation among the population.', correct: false },
      { label: 'C', text: 'The number of people with the mutation increased because the mutated receptor protein was selected for during the outbreak.', correct: true },
      { label: 'D', text: 'The number of people with the mutation increased because the mutated receptor protein was selected against during the outbreak.', correct: false },
    ],
  },
  {
    id: 't2-q46', label: '46',
    stem: 'An animal was cloned in a lab, producing five genetically identical offspring. The offspring were then sent to five different zoos. After five years, scientists collected data on these animals and found a variation in their heights. What is the most likely explanation for the data?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Each clone experienced mutations with no effect on its genes.', correct: false },
      { label: 'B', text: 'Each clone experienced a different environment with no effect on its genes.', correct: false },
      { label: 'C', text: 'Each clone experienced the same mutations, which influenced the expression of its genes.', correct: false },
      { label: 'D', text: 'Each clone experienced a different environment, which influenced the expression of its genes.', correct: true },
    ],
  },
  {
    id: 't2-q47', label: '47',
    stem: 'Which action takes place on a ribosome, resulting in synthesis of a protein?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'creation of mRNA from one strand of the DNA double helix', correct: false },
      { label: 'B', text: 'transformation of single-stranded mRNA into double-stranded tRNA', correct: false },
      { label: 'C', text: 'breakdown of polypeptide chain into amino acids and nitrogenous bases', correct: false },
      { label: 'D', text: 'attachment of the mRNA to tRNA molecules which are coupled to specific amino acids', correct: true },
    ],
  },
  {
    id: 't2-q48', label: '48',
    stem: 'Which statement best explains the relationship between glucose, cellular respiration, and photosynthesis?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Photosynthesis uses the glucose produced by cellular respiration to make energy.', correct: false },
      { label: 'B', text: 'Photosynthesis and cellular respiration are both used to produce glucose and energy.', correct: false },
      { label: 'C', text: 'Photosynthesis produces the glucose used in cellular respiration to make energy.', correct: true },
      { label: 'D', text: 'Photosynthesis and cellular respiration both consume glucose to produce energy.', correct: false },
    ],
  },
  {
    id: 't2-q49', label: '49',
    stem: 'A group of students puts a small aquatic plant in a test tube. The students place a strong light source nearby. One hour later, they observe bubbles in the test tube. Which statement explains what is occurring in the cells of the aquatic plant?',
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'Gas molecules are diffusing through the cellular membranes in order to maintain homeostasis in the cells.', correct: true },
      { label: 'B', text: 'Gas exchange is increased by the activity of the chloroplasts in order to disrupt homeostasis in the cells.', correct: false },
      { label: 'C', text: 'Gas exchange is prevented by the cell walls of the plant cells in order to maintain homeostasis in the cells.', correct: false },
      { label: 'D', text: 'Gas molecules are produced by the cell walls of the plant cells in order to disrupt homeostasis in the cells.', correct: false },
    ],
  },
  {
    id: 't2-q50', label: '50',
    stem: 'Fossils were discovered by scientists for each of the organisms in this phylogenetic tree. Which organism is most likely the oldest?',
    figureNotes: [
      'Phylogenetic tree rooted at bottom labeled Common Ancestor. Trunk splits into left and right branches. Left branch: organism T branches off lowest, then organism S higher, then W and Z at top tips. Right branch: Y and X at top tips. Vertical axis represents time (bottom = oldest).',
    ],
    kind: 'choice', multi: false,
    choices: [
      { label: 'A', text: 'organism S', correct: false },
      { label: 'B', text: 'organism T', correct: true },
      { label: 'C', text: 'organism W', correct: false },
      { label: 'D', text: 'organism Y', correct: false },
    ],
  },
];
