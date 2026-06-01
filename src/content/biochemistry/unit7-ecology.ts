import type { Wing } from '@/types';
import { unit } from '@/content/helpers';
import { FIG, ach, fillQuiz, foodWebQuiz, mcQuiz, microworldQuiz } from '@/content/biochemistry/quiz-helpers';

export const ecologyWing: Wing = {
  id: 'biochem.ecology',
  slug: 'ecology',
  title: 'Ecology',
  emoji: '🌍',
  description: 'Food webs, energy pyramids, cycles, populations, and conservation.',
  children: [
    {
      id: 'biochem.ecology.review',
      slug: 'ecology-review',
      title: 'Unit 8 Review',
      emoji: '📋',
      children: [
        {
          id: 'biochem.ecology.review.core',
          slug: 'core',
          title: 'Ecology Concepts',
          children: [
            unit({
              id: 'biochem.ecology.levels',
              slug: 'levels',
              title: 'Levels of Organization',
              emoji: '📊',
              shortLabel: 'Levels',
              longLabel: 'Levels of Organization',
              teach: {
                headline: 'From Organism to Biosphere',
                body: `**Abiotic factors** — nonliving (temperature, water, sunlight, soil).
**Biotic factors** — living (predators, prey, decomposers, plants).

![Ecological levels pyramid](${FIG}/p14_ecology_levels.svg)

Levels: organism → population → community → ecosystem → biosphere

**Habitat** = where an organism lives. **Niche** = its role (what it eats, how it reproduces).`,
                figures: [
                  {
                    id: 'p14_ecology_levels',
                    alt: 'Pyramid showing biosphere, ecosystem, community, population, and organism levels',
                  },
                ],
                poweredIdea: 'Each ecological level includes all levels below it.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.ecology.abiotic',
                  'Temperature is an _____ factor.',
                  ['abiotic'],
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.ecology.niche',
                  "An organism's role in its environment is its _____.",
                  ['niche'],
                ),
              ],
              achievement: ach(
                'biochem.ecology.levels',
                '📊',
                'Levels',
                'Levels of Organization',
                'You climb from cell to biosphere.',
              ),
              difficulty: 'intro',
              tags: ['ecology'],
            }),
            unit({
              id: 'biochem.ecology.food-web',
              slug: 'food-web',
              title: 'Food Webs and Chains',
              emoji: '🕸️',
              shortLabel: 'Food Web',
              longLabel: 'Food Webs & Chains',
              teach: {
                headline: 'Who Eats Whom',
                body: `**Producers (autotrophs):** make own food (plants, algae).
**Consumers (heterotrophs):** eat other organisms (herbivores, carnivores, omnivores).
**Decomposers:** break down dead matter (fungi, bacteria).

![Food web with producers, consumers, and decomposers](${FIG}/p15_food_web.svg)

**Symbiosis:** close relationship between species.
- **Mutualism** — both benefit (bee + flower)
- **Parasitism** — one benefits, one harmed (tick + dog)

If snails and dragonflies are removed, **hawks** lose prey and their population likely **declines**.`,
                figures: [
                  {
                    id: 'p15_food_web',
                    alt: 'Food web diagram with grass, algae, rabbits, snails, dragonflies, snakes, frogs, and hawks',
                  },
                ],
                poweredIdea: 'Removing prey species ripples up to top predators like hawks.',
              },
              quizzes: [
                foodWebQuiz(
                  'quiz.biochem.foodweb.builder',
                  {
                    ecosystem: 'Pond food web — build the energy arrows',
                    nodes: [
                      { id: 'grass', name: 'Grass', trophicLevel: 'producer', icon: '🌿' },
                      { id: 'rabbit', name: 'Rabbit', trophicLevel: 'primary', icon: '🐰' },
                      { id: 'snail', name: 'Snail', trophicLevel: 'primary', icon: '🐌' },
                      { id: 'hawk', name: 'Hawk', trophicLevel: 'tertiary', icon: '🦅' },
                    ],
                    requiredEdges: [
                      { preyId: 'grass', predatorId: 'rabbit' },
                      { preyId: 'grass', predatorId: 'snail' },
                      { preyId: 'rabbit', predatorId: 'hawk' },
                      { preyId: 'snail', predatorId: 'hawk' },
                    ],
                    perturbation: {
                      removeNodeId: 'snail',
                      description: 'Snails and dragonflies vanish from the pond.',
                    },
                    predictNodes: [
                      {
                        nodeId: 'hawk',
                        expected: 'crash',
                        reason: 'Hawks lose prey when snails disappear.',
                      },
                      {
                        nodeId: 'grass',
                        expected: 'boom',
                        reason: 'Less snail grazing lets producers increase.',
                      },
                    ],
                    poweredIdea: 'Removing prey ripples up to predators — webs are interconnected graphs.',
                    mnemonic: 'FOOD WEB = WHO EATS WHOM. Pull one thread, the whole mesh moves.',
                  },
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.foodweb.autotroph',
                  'Plants are _____ because they make their own food.',
                  ['autotrophs', 'producers', 'autotroph'],
                ),
                mcQuiz(
                  'quiz.biochem.foodweb.hawks',
                  'If snails and dragonflies are removed, hawks will likely _____.',
                  ['Decrease in number', 'Increase rapidly', 'Become producers', 'Not be affected'],
                  0,
                ),
                fillQuiz(
                  'quiz.biochem.foodweb.symbiosis',
                  'A close relationship between two species is called _____.',
                  ['symbiosis'],
                ),
                fillQuiz(
                  'quiz.biochem.foodweb.mutualism',
                  'Bees pollinating flowers is an example of _____.',
                  ['mutualism'],
                ),
                fillQuiz(
                  'quiz.biochem.foodweb.parasitism',
                  'A tick on a dog is an example of _____.',
                  ['parasitism'],
                ),
                fillQuiz(
                  'quiz.biochem.foodweb.heterotroph',
                  'Animals that eat other organisms are _____.',
                  ['heterotrophs', 'heterotroph', 'consumers'],
                ),
              ],
              achievement: ach(
                'biochem.ecology.food-web',
                '🕸️',
                'Food Web',
                'Food Webs & Chains',
                'You trace every arrow in the web.',
              ),
              difficulty: 'core',
              tags: ['ecology'],
            }),
            unit({
              id: 'biochem.ecology.energy-pyramid',
              slug: 'energy-pyramid',
              title: 'Energy Pyramids',
              emoji: '🔺',
              shortLabel: 'Energy Pyr',
              longLabel: 'Energy Pyramids',
              teach: {
                headline: 'Only 10% Moves Up',
                body: `![Energy pyramid showing 10% transfer between trophic levels](${FIG}/p15_energy_pyramid.svg)

Only about **10%** of energy transfers to the next trophic level. The rest is lost as heat, movement, and waste.

This is why there are fewer top predators than producers — less energy available at higher levels.`,
                figures: [
                  {
                    id: 'p15_energy_pyramid',
                    alt: 'Energy pyramid with producers at base and tertiary consumers at top',
                    caption: '~10% energy transfer between levels.',
                  },
                ],
                poweredIdea: 'Roughly 10% of energy passes to each higher trophic level.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.pyramid.percent',
                  'About _____% of energy transfers to the next trophic level.',
                  ['10', 'ten'],
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.pyramid.ten-percent',
                  'From the energy pyramid, about _____% of energy transfers to the next trophic level.',
                  ['10', 'ten', '10%'],
                ),
              ],
              achievement: ach(
                'biochem.ecology.energy-pyramid',
                '🔺',
                'Energy Pyr',
                'Energy Pyramids',
                'You count the ten percent that climbs.',
              ),
              difficulty: 'core',
              tags: ['ecology'],
            }),
            unit({
              id: 'biochem.ecology.cycles',
              slug: 'cycles',
              title: 'Carbon and Nitrogen Cycles',
              emoji: '♻️',
              shortLabel: 'Cycles',
              longLabel: 'Carbon & Nitrogen Cycles',
              teach: {
                headline: 'Elements Cycle Through Ecosystems',
                body: `**Carbon roles:**
- **Photosynthesis** — removes CO₂ from atmosphere
- **Cellular respiration** — releases CO₂
- **Decomposition** — returns carbon to soil/atmosphere
- **Climate change** — excess CO₂ traps heat (greenhouse effect)

![Nitrogen cycle](${FIG}/p16_nitrogen_cycle.svg)

**Nitrogen fixation** — converts N₂ to ammonia (bacteria). **Denitrification** — returns N₂ to atmosphere.

Nitrogen is essential for amino acids and nucleic acids in all living organisms.

**Ozone layer** blocks harmful UV radiation.`,
                figures: [
                  {
                    id: 'p16_nitrogen_cycle',
                    alt: 'Diagram of the nitrogen cycle including fixation, nitrification, and denitrification',
                  },
                ],
                poweredIdea: 'Carbon cycles through photosynthesis and respiration; bacteria fix nitrogen.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.cycles.co2-photosynthesis',
                  'Photosynthesis removes _____ from the atmosphere.',
                  ['co2', 'carbon dioxide'],
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.cycles.fixation',
                  '_____ fixation converts atmospheric N₂ to usable forms.',
                  ['nitrogen'],
                ),
                fillQuiz(
                  'quiz.biochem.cycles.respiration-co2',
                  'Cellular respiration releases _____ into the atmosphere.',
                  ['co2', 'carbon dioxide'],
                ),
                fillQuiz(
                  'quiz.biochem.cycles.greenhouse',
                  'Excess CO₂ traps heat through the _____ effect.',
                  ['greenhouse'],
                ),
                fillQuiz(
                  'quiz.biochem.cycles.ozone',
                  'The ozone layer blocks harmful _____ radiation.',
                  ['uv', 'ultraviolet'],
                ),
                fillQuiz(
                  'quiz.biochem.cycles.nitrogen-essential',
                  'Nitrogen is essential for building _____ and nucleic acids.',
                  ['amino acids', 'proteins', 'protein'],
                ),
              ],
              achievement: ach(
                'biochem.ecology.cycles',
                '♻️',
                'Cycles',
                'Carbon & Nitrogen Cycles',
                'You spin carbon and nitrogen through life.',
              ),
              difficulty: 'core',
              tags: ['ecology'],
            }),
            unit({
              id: 'biochem.ecology.population',
              slug: 'population-growth',
              title: 'Population Growth',
              emoji: '📈',
              shortLabel: 'Pop Growth',
              longLabel: 'Population Growth',
              teach: {
                headline: 'Exponential vs Logistic Growth',
                body: `**Exponential growth** — J-shaped curve; unlimited resources; population grows faster and faster.

**Logistic growth** — S-shaped curve; levels off at **carrying capacity (K)** — maximum population the environment can support.

![Exponential and logistic growth curves](${FIG}/p16_population_curves.svg)

![Deer population on an island reaching carrying capacity](${FIG}/p17_deer_population.svg)

**Carrying capacity** can be affected by food, water, space, disease, and predation.

**Density-dependent factors** — competition, disease (effect increases with population size).
**Density-independent factors** — natural disasters, temperature extremes.`,
                figures: [
                  {
                    id: 'p16_population_curves',
                    alt: 'Graph comparing exponential J-curve and logistic S-curve with carrying capacity labeled',
                  },
                  {
                    id: 'p17_deer_population',
                    alt: 'Deer population graph plateauing at carrying capacity near 80 deer',
                  },
                ],
                poweredIdea: 'Populations grow exponentially until they hit carrying capacity.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.pop.k',
                  'The maximum population an environment supports is _____ capacity.',
                  ['carrying'],
                  true,
                ),
                mcQuiz(
                  'quiz.biochem.pop.curve',
                  'Logistic growth produces an _____-shaped curve.',
                  ['S', 's', 'S-shaped'],
                  0,
                ),
                microworldQuiz(
                  'quiz.biochem.pop.deer-island',
                  {
                    modelId: 'logistic',
                    parameters: [
                      {
                        key: 'r',
                        label: 'Growth rate (r)',
                        min: 0.1,
                        max: 0.8,
                        default: 0.25,
                        step: 0.05,
                      },
                      {
                        key: 'K',
                        label: 'Carrying capacity (K)',
                        min: 40,
                        max: 120,
                        default: 55,
                        step: 5,
                      },
                      {
                        key: 'N0',
                        label: 'Starting population',
                        min: 10,
                        max: 50,
                        default: 15,
                        step: 5,
                      },
                    ],
                    goal: {
                      kind: 'reachValue',
                      signal: 'finalPopulation',
                      min: 72,
                      max: 88,
                    },
                    generations: 50,
                    reveal:
                      'Adjust growth rate and carrying capacity until the deer population plateaus near the island limit.',
                    poweredIdea:
                      'Logistic growth slows as a population approaches carrying capacity — the S-curve levels off at K.',
                    root: 'Biology EOC Review — population ecology',
                    mnemonic: 'Raise K toward the plateau — the curve bends into an S.',
                  },
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.pop.deer-k',
                  'From the deer population graph, the carrying capacity is about _____ deer.',
                  ['80', 'eighty'],
                  'Where the curve plateaus',
                ),
                fillQuiz(
                  'quiz.biochem.pop.density-dependent',
                  '_____ factors like disease increase in effect as population size grows.',
                  ['density-dependent', 'density dependent'],
                ),
                fillQuiz(
                  'quiz.biochem.pop.density-independent',
                  'A natural disaster is a _____ factor.',
                  ['density-independent', 'density independent'],
                ),
                fillQuiz(
                  'quiz.biochem.pop.exponential',
                  'Unlimited resources produce _____ growth (J-shaped curve).',
                  ['exponential'],
                ),
              ],
              achievement: ach(
                'biochem.ecology.population',
                '📈',
                'Pop Growth',
                'Population Growth',
                'You read the S-curve to carrying capacity.',
              ),
              difficulty: 'core',
              tags: ['ecology'],
            }),
            unit({
              id: 'biochem.ecology.behavior-conservation',
              slug: 'behavior-conservation',
              title: 'Behavior and Conservation',
              emoji: '🌿',
              shortLabel: 'Conservation',
              longLabel: 'Behavior & Conservation',
              teach: {
                headline: 'Behavior, DDT, and Human Impact',
                body: `| Behavior | Description | Example |
| :--- | :--- | :--- |
| Migration | Seasonal movement | Birds flying south |
| Hibernation | Dormancy in winter | Bears |
| Imprinting | Early learning attachment | Ducklings following mother |
| Territoriality | Defending space | Wolves marking territory |
| Courtship | Mating displays | Bird songs and dances |
| Conditioning | Learned association | Pavlov's dogs |
| Communication (pheromones) | Chemical signals | Ant trail markers |

![DDT biomagnification pyramid](${FIG}/p18_ddt_biomagnification.svg)

**Biological magnification:** DDT concentration increases at each trophic level — **top predators** (birds) are most affected.

**Urbanization** reduces biodiversity by destroying habitats.

**Conservation efforts:** national parks, pollution laws, captive breeding programs.`,
                figures: [
                  {
                    id: 'p18_ddt_biomagnification',
                    alt: 'Pyramid showing increasing DDT concentration from phytoplankton to birds',
                    caption: 'Top predators accumulate the highest pesticide levels.',
                  },
                ],
                poweredIdea: 'DDT magnifies up the food chain — birds at the top suffer most.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.conservation.ddt',
                  'Organisms at the top of a food chain have the highest _____ concentrations.',
                  ['ddt', 'pesticide', 'toxin'],
                  true,
                ),
                fillQuiz(
                  'quiz.biochem.conservation.urbanization',
                  '_____ reduces biodiversity by destroying habitats.',
                  ['urbanization'],
                ),
                fillQuiz(
                  'quiz.biochem.conservation.migration',
                  'Seasonal movement of animals (e.g., birds flying south) is _____.',
                  ['migration'],
                ),
                fillQuiz(
                  'quiz.biochem.conservation.hibernation',
                  'Winter dormancy in bears is _____.',
                  ['hibernation'],
                ),
                fillQuiz(
                  'quiz.biochem.conservation.imprinting',
                  'Ducklings following their mother is an example of _____.',
                  ['imprinting'],
                ),
                fillQuiz(
                  'quiz.biochem.conservation.courtship',
                  'Mating displays like bird songs are _____ behavior.',
                  ['courtship'],
                ),
                fillQuiz(
                  'quiz.biochem.conservation.pheromones',
                  'Ants marking trails with chemical signals use _____.',
                  ['pheromones', 'communication using pheromones'],
                ),
                fillQuiz(
                  'quiz.biochem.conservation.parks',
                  'Name one human conservation effort: _____.',
                  ['national parks', 'national park', 'pollution laws', 'captive breeding', 'captive breeding programs'],
                ),
                fillQuiz(
                  'quiz.biochem.conservation.population-impact',
                  'Name one negative effect of population growth on the environment: _____.',
                  ['pollution', 'habitat destruction', 'deforestation', 'climate change', 'resource depletion', 'loss of biodiversity'],
                ),
              ],
              achievement: ach(
                'biochem.ecology.behavior-conservation',
                '🌿',
                'Conservation',
                'Behavior & Conservation',
                'You protect the top of the poisoned pyramid.',
              ),
              difficulty: 'core',
              tags: ['ecology', 'conservation'],
            }),
            unit({
              id: 'biochem.ecology.plants-atmosphere',
              slug: 'plants-atmosphere',
              title: 'Plants and the Atmosphere',
              emoji: '🌱',
              shortLabel: 'Plants',
              longLabel: 'Plants & Atmosphere',
              teach: {
                headline: 'Stomata, Vascular Plants, and Reproduction',
                body: `**Stomata** — pores on plant leaves that exchange CO₂ and O₂ (like lungs in animals).

**Vascular plants** have xylem and phloem to transport water and nutrients (e.g., ferns, pines, flowering plants).

**Nonvascular plants** lack specialized transport tissues (e.g., mosses).

**Reproduction:** most plants reproduce via spores or seeds; fungi reproduce via spores.

**Climate:** the greenhouse effect traps heat; the ozone layer blocks UV radiation.`,
                poweredIdea: 'Stomata breathe for plants; vascular tissues move water and sugar.',
              },
              quizzes: [
                fillQuiz(
                  'quiz.biochem.plants.stomata',
                  '_____ are pores on leaves that exchange gases.',
                  ['stomata', 'stoma'],
                  true,
                ),
                mcQuiz(
                  'quiz.biochem.plants.vascular',
                  'Which is a vascular plant?',
                  ['Pine tree', 'Moss', 'Algae only', 'Bacteria'],
                  0,
                ),
                fillQuiz(
                  'quiz.biochem.plants.nonvascular',
                  '_____ is an example of a nonvascular plant.',
                  ['moss', 'mosses'],
                ),
                fillQuiz(
                  'quiz.biochem.plants.fungi-spores',
                  'Fungi reproduce using _____.',
                  ['spores', 'spore'],
                ),
              ],
              achievement: ach(
                'biochem.ecology.plants-atmosphere',
                '🌱',
                'Plants',
                'Plants & Atmosphere',
                'You trace water from root to stomata to sky.',
              ),
              difficulty: 'core',
              tags: ['ecology', 'plants'],
            }),
          ],
        },
      ],
    },
  ],
};
