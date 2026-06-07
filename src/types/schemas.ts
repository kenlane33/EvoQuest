import { z } from 'zod';

// ── ID patterns ───────────────────────────────────────────────

const dottedId = /^[a-z0-9.-]+$/;
const contentId = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;
const slugId = /^[a-z0-9-]+$/;

// ── Etymology & morphemes ─────────────────────────────────────

export const MorphemeLanguageSchema = z.enum([
  'Greek',
  'Latin',
  'Old English',
  'Other',
]);

export const MorphemeRefSchema = z.object({
  morphemeId: z.string(),
  asUsed: z.string(),
});

export const EtymologySchema = z.object({
  termId: z.string(),
  term: z.string(),
  morphemes: z.array(MorphemeRefSchema),
  rootSummary: z.string(),
});

export const MorphemeSchema = z.object({
  id: z.string(),
  morpheme: z.string(),
  language: MorphemeLanguageSchema,
  meaning: z.string().max(30),
  cousins: z.array(z.string()).optional(),
  appearsIn: z.array(z.string()),
});

// ── Teach & achievements ──────────────────────────────────────

export const TeachFigureSchema = z.object({
  id: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

export const TeachBlockSchema = z.object({
  headline: z.string().max(60),
  body: z.string(),
  etymology: EtymologySchema.optional(),
  mnemonic: z.string().max(140).optional(),
  poweredIdea: z.string().max(120),
  /** Subtle "why this matters" — one curiosity sentence, not marketing copy. */
  hook: z.string().max(180).optional(),
  imageUrl: z.string().optional(),
  figures: z.array(TeachFigureSchema).optional(),
  cite: z.array(z.string()).optional(),
});

export const AggregateAchievementRefSchema = z.object({
  scope: z.enum(['drawer', 'room', 'wing']),
  nodeId: z.string(),
  emoji: z.string(),
  shortLabel: z.string(),
  flavor: z.string().max(140),
});

export const AchievementSchema = z.object({
  id: z.string(),
  emoji: z.string(),
  shortLabel: z.string(),
  longLabel: z.string(),
  flavor: z.string().max(140),
  wingId: z.string(),
  hidden: z.boolean().optional(),
  aggregate: AggregateAchievementRefSchema.optional(),
});

// ── Quiz templates ────────────────────────────────────────────

export const InnerQuestionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('multiple-choice'),
    prompt: z.string(),
    options: z.array(z.string()).min(2),
    correctIndex: z.number().int().min(0),
  }),
  z.object({
    kind: z.literal('fill'),
    prompt: z.string(),
    acceptable: z.array(z.string()).min(1),
    hint: z.string().optional(),
  }),
]);

export const SpeedRevealDataSchema = z.object({
  termId: z.string(),
  root: z.string(),
  mnemonic: z.string().max(140),
  question: InnerQuestionSchema,
  countdownMs: z.number().int().positive().optional(),
  revealMs: z.number().int().positive().optional(),
});

export const FillDataSchema = z.object({
  prompt: z.string(),
  acceptable: z.array(z.string()).min(1),
  hint: z.string().optional(),
});

export const MatchDataSchema = z.object({
  term: z.string(),
  correct: z.string(),
  distractors: z.array(z.string()).min(1),
});

export const ScenarioDataSchema = z.object({
  story: z.string(),
  question: z.string(),
  answer: z.string(),
  options: z.array(z.string()).min(2),
  explanation: z.string(),
});

export const RecipeStepSchema = z.object({
  id: z.string(),
  title: z.string().max(80),
  icon: z.string().optional(),
  consequenceHint: z.string(),
});

export const RecipeCausalLinkSchema = z.object({
  fromId: z.string(),
  toId: z.string(),
  why: z.string(),
});

export const RecipeSequencerDataSchema = z.object({
  processTitle: z.string(),
  steps: z.array(RecipeStepSchema).min(3).max(10),
  causalLinks: z.array(RecipeCausalLinkSchema),
  cyclic: z.boolean().optional(),
  acceptAlternateOrders: z.array(z.array(z.string())).optional(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const MorphemeTokenSchema = z.object({
  id: z.string(),
  morpheme: z.string(),
  meaning: z.string(),
  language: z.enum(['Greek', 'Latin', 'Other']),
});

export const EtymologyPuppetDataSchema = z.object({
  definition: z.string(),
  slots: z.number().int().min(2).max(6),
  morphemes: z.array(MorphemeTokenSchema).min(4),
  acceptedAnswers: z.array(z.array(z.string())).min(1),
  targetTerm: z.string(),
  exampleSentence: z.string(),
  poweredIdea: z.string(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const BugClassSchema = z.enum([
  'lamarckian-sneak',
  'teleology',
  'progress-fallacy',
  'strong-vs-fit',
  'confused-vocabulary',
  'causal-direction-reversed',
  'scale-confusion',
  'other',
]);

export const DebugTheClaimDataSchema = z.object({
  paragraph: z.string(),
  bugPhrase: z.string(),
  bugClass: BugClassSchema,
  hint: z.string(),
  canonicalFix: z.string(),
  poweredIdea: z.string(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const PunnettParentSchema = z.object({
  label: z.string(),
  alleles: z.array(z.string()).length(2),
});

export const PunnettPhenotypeSchema = z.object({
  label: z.string(),
  color: z.string(),
  icon: z.string().optional(),
});

export const PunnettBuilderDataSchema = z.object({
  scenario: z.string(),
  parents: z.tuple([PunnettParentSchema, PunnettParentSchema]),
  phenotypeMap: z.record(z.string(), PunnettPhenotypeSchema),
  dominantPhenotype: z.string(),
  expectedRatio: z.string(),
  notes: z.string().optional(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const PredictRunReflectDataSchema = z.object({
  scenario: z.string(),
  predictPrompt: z.string(),
  predictOptions: z.array(z.string()).min(2),
  correctPredictionIndex: z.number().int().min(0),
  runNarrative: z.string(),
  truthSummary: z.string(),
  bugCandidates: z.array(
    z.object({
      label: z.string(),
      isTheBug: z.boolean(),
      explanation: z.string(),
    }),
  ).min(2),
  poweredIdea: z.string(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const BeTheTurtleChoiceSchema = z.object({
  label: z.string().max(60),
  nextNodeId: z.string().nullable(),
  biology: z.string(),
  isOptimal: z.boolean().optional(),
  fateTrail: z.string().optional(),
});

export const BeTheTurtleNodeSchema = z.object({
  id: z.string(),
  prompt: z.string().max(120),
  choices: z.array(BeTheTurtleChoiceSchema).min(1).max(4),
  terminalTitle: z.string().optional(),
  terminalScene: z.string().optional(),
  isOptimalTerminal: z.boolean().optional(),
});

export const BeTheTurtleDataSchema = z.object({
  roleTitle: z.string(),
  setup: z.string(),
  startNodeId: z.string(),
  nodes: z.array(BeTheTurtleNodeSchema).min(2),
  poweredIdea: z.string(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const MutationTypeSchema = z.enum([
  'silent',
  'missense',
  'nonsense',
  'frameshift',
]);

export const MutationLabDataSchema = z.object({
  scenario: z.string(),
  templateDna: z.string().regex(/^[ATGC]+$/),
  editableIndex: z.number().int().min(0),
  replacements: z.array(z.enum(['A', 'T', 'G', 'C'])).min(2),
  correctReplacement: z.enum(['A', 'T', 'G', 'C']),
  correctMutationType: MutationTypeSchema,
  clinicalHook: z.string(),
  poweredIdea: z.string(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const WebNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  trophicLevel: z.enum(['producer', 'primary', 'secondary', 'tertiary', 'decomposer']),
  icon: z.string(),
});

export const WebEdgeSchema = z.object({
  preyId: z.string(),
  predatorId: z.string(),
});

export const CascadeOutcomeSchema = z.enum(['crash', 'boom', 'stable']);

export const FoodWebBuilderDataSchema = z.object({
  ecosystem: z.string(),
  nodes: z.array(WebNodeSchema).min(3).max(10),
  requiredEdges: z.array(WebEdgeSchema).min(2),
  perturbation: z.object({
    removeNodeId: z.string(),
    description: z.string(),
  }),
  predictNodes: z.array(
    z.object({
      nodeId: z.string(),
      expected: CascadeOutcomeSchema,
      reason: z.string(),
    }),
  ),
  poweredIdea: z.string(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const MicroworldGoalSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('reachValue'),
    signal: z.string(),
    min: z.number(),
    max: z.number(),
  }),
  z.object({
    kind: z.literal('extinction'),
    below: z.number(),
  }),
]);

export const MicroworldParameterSchema = z.object({
  key: z.string(),
  label: z.string(),
  min: z.number(),
  max: z.number(),
  default: z.number(),
  step: z.number(),
  units: z.string().optional(),
});

export const MicroworldSandboxDataSchema = z.object({
  modelId: z.enum(['logistic']),
  parameters: z.array(MicroworldParameterSchema).min(2).max(4),
  goal: MicroworldGoalSchema,
  generations: z.number().int().min(10).max(100),
  reveal: z.string(),
  poweredIdea: z.string(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const InheritancePatternSchema = z.enum([
  'autosomal-dominant',
  'autosomal-recessive',
  'x-linked-dominant',
  'x-linked-recessive',
  'y-linked',
  'mitochondrial',
]);

export const PedigreePersonSchema = z.object({
  id: z.string(),
  label: z.string(),
  sex: z.enum(['M', 'F']),
  affected: z.boolean(),
  generation: z.number().int().min(1).max(4),
  motherId: z.string().optional(),
  fatherId: z.string().optional(),
});

export const PedigreeDetectiveDataSchema = z.object({
  traitLabel: z.string(),
  people: z.array(PedigreePersonSchema).min(3),
  canonical: z.object({
    pattern: InheritancePatternSchema,
    poweredIdea: z.string(),
  }),
  hints: z.array(z.string()).optional(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const CladogramTaxonSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  isOutgroup: z.boolean().optional(),
});

export const CladogramTraitSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const CladogramCrafterDataSchema = z.object({
  taxa: z.array(CladogramTaxonSchema).min(4).max(8),
  outgroupId: z.string(),
  traits: z.array(CladogramTraitSchema).min(3),
  traitMatrix: z.record(z.string(), z.record(z.string(), z.union([z.literal(0), z.literal(1)]))),
  canonicalOrder: z.array(z.string()).min(4),
  canonicalParsimonyScore: z.number().int().min(0),
  poweredIdea: z.string(),
  synapomorphies: z
    .array(
      z.object({
        traitId: z.string(),
        label: z.string(),
        taxonIds: z.array(z.string()),
      }),
    )
    .optional(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const ConsequenceCardSchema = z.object({
  id: z.string(),
  text: z.string(),
  depth: z.enum(['immediate', 'near', 'far']).optional(),
});

export const CounterfactualLabDataSchema = z.object({
  prompt: z.string(),
  context: z.string(),
  cards: z.array(ConsequenceCardSchema).min(3),
  canonicalChain: z.array(z.string()).min(3),
  alternateChains: z.array(z.array(z.string())).optional(),
  finalStateOptions: z
    .array(
      z.object({
        label: z.string(),
        canonical: z.boolean(),
        explanation: z.string(),
      }),
    )
    .min(2),
  consensusNotes: z.string(),
  poweredIdea: z.string(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const ProcedureBlockSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  narration: z.string(),
});

export const ProcedureBuilderDataSchema = z.object({
  goal: z.string(),
  initialState: z.string(),
  targetState: z.string(),
  blocks: z.array(ProcedureBlockSchema).min(3).max(8),
  canonicalOrder: z.array(z.string()).min(3),
  alternateOrders: z.array(z.array(z.string())).optional(),
  poweredIdea: z.string(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const ConceptNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
});

export const EdgeImportanceSchema = z.enum(['critical', 'standard', 'nice-to-have']);

export const CanonicalEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string(),
  importance: EdgeImportanceSchema,
  reasonIfMissing: z.string(),
});

export const ConceptMapBuilderDataSchema = z.object({
  focalConcept: z.string(),
  nodes: z.array(ConceptNodeSchema).min(3).max(12),
  decoyNodes: z.array(ConceptNodeSchema).optional(),
  canonicalEdges: z.array(CanonicalEdgeSchema).min(2),
  allowedLabels: z.array(z.string()).min(2),
  poweredIdea: z.string(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const PalaceTotemSchema = z.object({
  id: z.string(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  icon: z.string(),
  label: z.string(),
  question: InnerQuestionSchema,
});

export const PalaceWalkDataSchema = z.object({
  roomTitle: z.string(),
  layout: z.array(z.array(z.number().int().min(0).max(1))).min(3),
  spawn: z.object({ x: z.number().int().min(0), y: z.number().int().min(0) }),
  totems: z.array(PalaceTotemSchema).min(2).max(10),
  poweredIdea: z.string(),
  root: z.string().optional(),
  mnemonic: z.string().max(140).optional(),
});

export const QuizTemplateSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('speed-reveal-mnemonic'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: SpeedRevealDataSchema,
  }),
  z.object({
    kind: z.literal('fill'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: FillDataSchema,
  }),
  z.object({
    kind: z.literal('match'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: MatchDataSchema,
  }),
  z.object({
    kind: z.literal('scenario'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: ScenarioDataSchema,
  }),
  z.object({
    kind: z.literal('recipe-sequencer'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: RecipeSequencerDataSchema,
  }),
  z.object({
    kind: z.literal('etymology-puppet'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: EtymologyPuppetDataSchema,
  }),
  z.object({
    kind: z.literal('debug-the-claim'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: DebugTheClaimDataSchema,
  }),
  z.object({
    kind: z.literal('punnett-builder'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: PunnettBuilderDataSchema,
  }),
  z.object({
    kind: z.literal('predict-run-reflect'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: PredictRunReflectDataSchema,
  }),
  z.object({
    kind: z.literal('be-the-turtle'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: BeTheTurtleDataSchema,
  }),
  z.object({
    kind: z.literal('mutation-lab'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: MutationLabDataSchema,
  }),
  z.object({
    kind: z.literal('food-web-builder'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: FoodWebBuilderDataSchema,
  }),
  z.object({
    kind: z.literal('microworld-sandbox'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: MicroworldSandboxDataSchema,
  }),
  z.object({
    kind: z.literal('pedigree-detective'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: PedigreeDetectiveDataSchema,
  }),
  z.object({
    kind: z.literal('cladogram-crafter'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: CladogramCrafterDataSchema,
  }),
  z.object({
    kind: z.literal('counterfactual-lab'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: CounterfactualLabDataSchema,
  }),
  z.object({
    kind: z.literal('procedure-builder'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: ProcedureBuilderDataSchema,
  }),
  z.object({
    kind: z.literal('concept-map-builder'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: ConceptMapBuilderDataSchema,
  }),
  z.object({
    kind: z.literal('palace-walk'),
    id: z.string(),
    preferred: z.boolean().optional(),
    data: PalaceWalkDataSchema,
  }),
]);

// ── Content tree ──────────────────────────────────────────────

function treeNodeSchema<C extends z.ZodTypeAny>(child: C) {
  return z.object({
    id: z.string().regex(dottedId),
    aliases: z.array(z.string()).optional(),
    slug: z.string().regex(slugId),
    title: z.string().min(1).max(80),
    emoji: z.string().optional(),
    description: z.string().max(280).optional(),
    children: z.array(child),
  });
}

export const KnowledgeUnitSchema = z.lazy(() =>
  z.object({
    id: z.string().regex(contentId),
    aliases: z.array(z.string()).optional(),
    slug: z.string().regex(slugId),
    title: z.string().min(1).max(80),
    emoji: z.string().min(1).max(8),
    shortLabel: z.string().min(1).max(14),
    longLabel: z.string().min(1).max(40),
    description: z.string().max(280).optional(),
    teach: TeachBlockSchema,
    quizzes: z.array(QuizTemplateSchema).min(1),
    achievement: AchievementSchema,
    prerequisites: z.array(z.string()).optional(),
    difficulty: z.enum(['intro', 'core', 'deep']).optional(),
    tags: z.array(z.string()).optional(),
    enabled: z.boolean().default(true),
    authorNotes: z.string().optional(),
  }),
);

export const DrawerSchema = treeNodeSchema(KnowledgeUnitSchema);
export const RoomSchema = treeNodeSchema(DrawerSchema);
export const WingSchema = treeNodeSchema(RoomSchema);

// ── Content module ────────────────────────────────────────────

export const ContentModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  authorRef: z.string().optional(),
  schemaVersion: z.number().int().positive(),
  appVersionAtAuthoring: z.string(),
  tree: z.array(WingSchema),
  etymologyContributions: z.array(MorphemeSchema).optional(),
  source: z.enum(['bundled', 'user-import']),
  createdAt: z.number(),
});

// ── Journey, attempt, session ─────────────────────────────────

export const AttemptSchema = z.object({
  attemptId: z.string(),
  unitId: z.string(),
  templateKind: z.string(),
  templateId: z.string().optional(),
  correct: z.boolean(),
  ms: z.number(),
  confidence: z.number().min(0).max(1).optional(),
  details: z.record(z.unknown()).optional(),
});

export const SelectionDescriptorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('quick-mix'), length: z.number().int().positive() }),
  z.object({
    kind: z.literal('deep-dive'),
    nodeId: z.string(),
    length: z.number().int().positive(),
  }),
  z.object({ kind: z.literal('trouble'), length: z.number().int().positive() }),
  z.object({
    kind: z.literal('wrong-only'),
    sinceJourneyId: z.string().optional(),
  }),
  z.object({
    kind: z.literal('mixed-trouble'),
    troubleUnitId: z.string(),
    relatedCount: z.number().int().min(0),
  }),
  z.object({ kind: z.literal('branch'), nodeId: z.string() }),
  z.object({
    kind: z.literal('journey-replay'),
    sourceJourneyId: z.string(),
  }),
  z.object({ kind: z.literal('revisit'), length: z.number().int().positive() }),
]);

export const JourneySchema = z.object({
  id: z.string(),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  abandoned: z.boolean().optional(),
  selection: SelectionDescriptorSchema,
  attempts: z.array(AttemptSchema),
  achievementsEarned: z.array(z.string()),
  artifactsSaved: z.array(z.string()),
  morphemesTouchedFirst: z.array(z.string()),
  finalScore: z.object({
    correct: z.number().int().min(0),
    total: z.number().int().min(0),
    bestStreak: z.number().int().min(0),
  }),
  elapsedSec: z.number().min(0),
});

export const ScheduledItemSchema = z.object({
  unitId: z.string(),
  templateKind: z.string(),
  templateId: z.string(),
});

export const ActiveSessionSchema = z.object({
  journeyId: z.string(),
  queue: z.array(ScheduledItemSchema),
  currentIndex: z.number().int().min(0),
  attempts: z.array(AttemptSchema),
  startedAt: z.number(),
  bestStreak: z.number().int().min(0),
  currentStreak: z.number().int().min(0),
  selection: SelectionDescriptorSchema,
  powerupUsage: z.record(z.number()),
  artifactIds: z.array(z.string()),
  inFlightSnapshot: z.unknown().optional(),
});

// ── Progress ──────────────────────────────────────────────────

export const OutcomeRecordSchema = z.object({
  correct: z.boolean(),
  ms: z.number(),
  templateKind: z.string(),
});

export const UnitProgressSchema = z.object({
  unitId: z.string(),
  firstSeenAt: z.number(),
  attempts: z.number().int().min(0),
  correct: z.number().int().min(0),
  lastSeenAt: z.number(),
  lastFiveOutcomes: z.array(OutcomeRecordSchema),
  templatesEncountered: z.array(z.string()),
  quizAttemptCounts: z.record(z.number().int().min(0)),
  tier: z.enum(['locked', 'unlocked', 'bronze', 'silver', 'gold']),
  unlockedAt: z.number().optional(),
  achievementEarned: z.boolean(),
});

export const MorphemeProgressSchema = z.object({
  morphemeId: z.string(),
  firstSeenAt: z.number(),
  encounters: z.number().int().min(0),
  correctEncounters: z.number().int().min(0),
  lastSeenAt: z.number(),
  termsAssembled: z.array(z.string()),
});

// ── Settings & related state ──────────────────────────────────

export const HINT_REVEAL_SEC = {
  min: 4,
  max: 60,
  default: 20,
} as const;

export const HINT_REVEAL_MS = {
  min: HINT_REVEAL_SEC.min * 1000,
  max: HINT_REVEAL_SEC.max * 1000,
  default: HINT_REVEAL_SEC.default * 1000,
} as const;

export const HINT_COUNTDOWN_SEC = {
  min: 2,
  max: 60,
  default: 8,
} as const;

export const HINT_COUNTDOWN_MS = {
  min: HINT_COUNTDOWN_SEC.min * 1000,
  max: HINT_COUNTDOWN_SEC.max * 1000,
  default: HINT_COUNTDOWN_SEC.default * 1000,
} as const;

export const SettingsSchema = z.object({
  appearance: z.object({
    contrast: z.enum(['normal', 'high']),
    fontSize: z.enum(['sm', 'md', 'lg']),
    bodyFont: z.enum([
      'nunito',
      'inter',
      'lora',
      'source-serif-4',
      'fira-sans',
      'literata',
      'atkinson-hyperlegible',
      'space-grotesk',
      'dm-sans',
      'crimson-pro',
      'opendyslexic',
    ]),
    headlineFont: z.enum([
      'syne',
      'space-grotesk',
      'outfit',
      'bricolage-grotesque',
      'fraunces',
      'playfair-display',
      'libre-baskerville',
      'bungee',
      'bangers',
      'righteous',
      'fredoka',
      'permanent-marker',
    ]),
    /** @deprecated Use bodyFont: 'opendyslexic' instead. Kept for migration only. */
    dyslexiaFont: z.boolean().optional(),
    colorBlindSafe: z.boolean(),
  }),
  motion: z.enum(['full', 'reduced', 'off']),
  audio: z.object({
    enabled: z.boolean(),
    volume: z.number().min(0).max(1),
    stings: z.record(z.boolean()),
  }),
  reading: z.object({
    enabled: z.boolean(),
    autoRead: z.boolean(),
    voice: z.string(),
    serverUrl: z.string(),
    /** SillyReader: 0 (off) – 10 (constant) frequency of funny TTS interjections. */
    sillyReader: z.number().int().min(0).max(10).default(3),
  }),
  reveals: z.object({
    countdownMs: z
      .number()
      .int()
      .min(HINT_COUNTDOWN_MS.min)
      .max(HINT_COUNTDOWN_MS.max),
    revealMs: z
      .number()
      .int()
      .min(HINT_REVEAL_MS.min)
      .max(HINT_REVEAL_MS.max),
  }),
  practice: z.object({
    confidenceFrequency: z.enum(['every', 'every-3', 'never']),
    defaultMood: z.enum(['fast-lane', 'mixed', 'microworld']),
    defaultLength: z.union([
      z.literal(5),
      z.literal(10),
      z.literal(15),
      z.literal(20),
    ]),
    revisitLength: z.number().int().min(5).max(30),
  }),
  privacy: z.object({
    anonymousCrashReports: z.boolean(),
  }),
});

export const LabArtifactSchema = z.object({
  id: z.string(),
  kind: z.string(),
  unitId: z.string(),
  journeyId: z.string(),
  createdAt: z.number(),
  title: z.string(),
  snapshot: z.unknown(),
  thumbnail: z.string().optional(),
});

export const PowerUpInstanceSchema = z.object({
  id: z.string(),
  acquiredAt: z.number(),
  themedFor: z.string().optional(),
});

export const PowerUpInventorySchema = z.object({
  slots: z.tuple([
    PowerUpInstanceSchema.nullable(),
    PowerUpInstanceSchema.nullable(),
    PowerUpInstanceSchema.nullable(),
  ]),
  earned: z.number().int().min(0),
  spent: z.number().int().min(0),
  firstUseShown: z.array(z.string()).default([]),
});

export const DailyStreakSchema = z.object({
  count: z.number().int().min(0),
  lastDayKey: z.string(),
});

export const AchievementStateSchema = z.object({
  earned: z.record(z.number()),
  dailyStreak: DailyStreakSchema,
  firstClearedWingIds: z.array(z.string()),
});

export const CalibrationRecordSchema = z.object({
  id: z.string(),
  attemptId: z.string(),
  unitId: z.string(),
  templateKind: z.string(),
  confidence: z.number().min(0).max(1),
  correct: z.boolean(),
  recordedAt: z.number(),
});

export const ModulesStateSchema = z.object({
  enabledIds: z.array(z.string()),
  userModules: z.array(ContentModuleSchema),
});

export const FirstRunStateSchema = z.object({
  completedAt: z.number().optional(),
});

// ── Storage envelope & quarantine ─────────────────────────────

export const StoredBlobSchema = <T extends z.ZodTypeAny>(payloadSchema: T) =>
  z.object({
    schemaVersion: z.number().int().positive(),
    savedAt: z.number(),
    appVersion: z.string(),
    payload: payloadSchema,
  });

export const QuarantineReasonSchema = z.enum([
  'parse-fail',
  'missing-migration',
  'validation-fail',
  'future-version',
]);

export const QuarantineEntrySchema = z.object({
  key: z.string(),
  blob: z.string(),
  reason: QuarantineReasonSchema,
  detectedAt: z.number(),
  appVersion: z.string(),
  zodErrors: z.array(z.string()).optional(),
});

export const ExportEnvelopeSchema = z.object({
  formatVersion: z.literal(1),
  exportedAt: z.number(),
  appVersion: z.string(),
  storageKeys: z.record(z.unknown()),
  archivedJourneys: z.array(JourneySchema).optional(),
  archivedArtifacts: z.array(LabArtifactSchema).optional(),
});

// ── Inferred types ────────────────────────────────────────────

export type MorphemeLanguage = z.infer<typeof MorphemeLanguageSchema>;
export type MorphemeRef = z.infer<typeof MorphemeRefSchema>;
export type Etymology = z.infer<typeof EtymologySchema>;
export type Morpheme = z.infer<typeof MorphemeSchema>;
export type TeachBlock = z.infer<typeof TeachBlockSchema>;
export type AggregateAchievementRef = z.infer<typeof AggregateAchievementRefSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type InnerQuestion = z.infer<typeof InnerQuestionSchema>;
export type SpeedRevealData = z.infer<typeof SpeedRevealDataSchema>;
export type FillData = z.infer<typeof FillDataSchema>;
export type MatchData = z.infer<typeof MatchDataSchema>;
export type ScenarioData = z.infer<typeof ScenarioDataSchema>;
export type RecipeSequencerData = z.infer<typeof RecipeSequencerDataSchema>;
export type EtymologyPuppetData = z.infer<typeof EtymologyPuppetDataSchema>;
export type DebugTheClaimData = z.infer<typeof DebugTheClaimDataSchema>;
export type BugClass = z.infer<typeof BugClassSchema>;
export type PunnettBuilderData = z.infer<typeof PunnettBuilderDataSchema>;
export type PredictRunReflectData = z.infer<typeof PredictRunReflectDataSchema>;
export type BeTheTurtleData = z.infer<typeof BeTheTurtleDataSchema>;
export type MutationLabData = z.infer<typeof MutationLabDataSchema>;
export type FoodWebBuilderData = z.infer<typeof FoodWebBuilderDataSchema>;
export type MicroworldSandboxData = z.infer<typeof MicroworldSandboxDataSchema>;
export type InheritancePattern = z.infer<typeof InheritancePatternSchema>;
export type PedigreeDetectiveData = z.infer<typeof PedigreeDetectiveDataSchema>;
export type CladogramCrafterData = z.infer<typeof CladogramCrafterDataSchema>;
export type CounterfactualLabData = z.infer<typeof CounterfactualLabDataSchema>;
export type ProcedureBlock = z.infer<typeof ProcedureBlockSchema>;
export type ProcedureBuilderData = z.infer<typeof ProcedureBuilderDataSchema>;
export type ConceptNode = z.infer<typeof ConceptNodeSchema>;
export type EdgeImportance = z.infer<typeof EdgeImportanceSchema>;
export type CanonicalEdge = z.infer<typeof CanonicalEdgeSchema>;
export type ConceptMapBuilderData = z.infer<typeof ConceptMapBuilderDataSchema>;
export type PalaceTotem = z.infer<typeof PalaceTotemSchema>;
export type PalaceWalkData = z.infer<typeof PalaceWalkDataSchema>;
export type QuizTemplate = z.infer<typeof QuizTemplateSchema>;
export type KnowledgeUnit = z.infer<typeof KnowledgeUnitSchema>;
export type Drawer = z.infer<typeof DrawerSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Wing = z.infer<typeof WingSchema>;
export type ContentModule = z.infer<typeof ContentModuleSchema>;
export type Attempt = z.infer<typeof AttemptSchema>;
export type SelectionDescriptor = z.infer<typeof SelectionDescriptorSchema>;
export type Journey = z.infer<typeof JourneySchema>;
export type ScheduledItem = z.infer<typeof ScheduledItemSchema>;
export type ActiveSession = z.infer<typeof ActiveSessionSchema>;
export type OutcomeRecord = z.infer<typeof OutcomeRecordSchema>;
export type UnitProgress = z.infer<typeof UnitProgressSchema>;
export type MorphemeProgress = z.infer<typeof MorphemeProgressSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type LabArtifact = z.infer<typeof LabArtifactSchema>;
export type PowerUpInstance = z.infer<typeof PowerUpInstanceSchema>;
export type PowerUpInventory = z.infer<typeof PowerUpInventorySchema>;
export type DailyStreak = z.infer<typeof DailyStreakSchema>;
export type AchievementState = z.infer<typeof AchievementStateSchema>;
export type CalibrationRecord = z.infer<typeof CalibrationRecordSchema>;
export type ModulesState = z.infer<typeof ModulesStateSchema>;
export type FirstRunState = z.infer<typeof FirstRunStateSchema>;
export type QuarantineReason = z.infer<typeof QuarantineReasonSchema>;
export type QuarantineEntry = z.infer<typeof QuarantineEntrySchema>;
export type ExportEnvelope = z.infer<typeof ExportEnvelopeSchema>;

export type StoredBlob<T> = {
  schemaVersion: number;
  savedAt: number;
  appVersion: string;
  payload: T;
};
