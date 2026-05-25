# 13 — Food Web Builder

**One-liner**: Build a web of organisms and energy arrows, then watch what cascades when you pull a node — interdependence becomes visible by being *broken*.

## Papert principles embodied

- **Microworld**: an ecosystem in a box. Tiny rules (energy flows one way; producers anchor; predator removal cascades), powerful emergent behaviors.
- **Powerful idea**: ecosystems are *graphs*, not lists. The shape of the graph determines its fragility. This is one of ecology's central conceptual moves.
- **Debugging**: when the web breaks (a node is removed and the cascade plays out), the student sees their model of "stable" was incomplete. Their model gets debugged by the simulation.
- **Constructionism**: the web the student builds is the artifact. Saved, shareable, re-runnable.

## What the student does

1. The canvas opens with a few "anchor" organisms placed for context (e.g., one producer, one apex predator) and a drawer of additional organism cards.
2. The student drags organisms onto the canvas, arranging them roughly by trophic level (producers low, apex predators high — but the layout is the student's choice).
3. The student draws **energy arrows** between organisms (always *from* the eaten *to* the eater). Each arrow has a thickness slider for energy fraction (default 10%, the standard ecological rule-of-thumb).
4. When the web is satisfactory, the student picks a **perturbation**:
   - "Remove the apex predator" (top-down cascade)
   - "Remove a producer" (bottom-up cascade)
   - "Halve a mid-level population" (mesopredator release)
   - "Introduce an invasive species" (with chosen connections)
5. The simulation runs: populations of each node animate as bars over 20 simulated years. The cascade visibly propagates.
6. The student predicts (before running) which species will *crash*, which will *boom*, which will *stay stable*. Reflect phase compares prediction to outcome.

## Biology examples

**Yellowstone wolves** — remove wolves → elk population explodes → willows + aspens browsed flat → beavers lose dam-building material → river banks erode. A real-world cascade with documented data.

**Sea otter / kelp** — remove otters → urchins explode → urchins eat kelp → kelp forest collapses → cascade to all kelp-dependent species. Otters are a *keystone* species — discovered by perturbation.

**Coral reef bleaching** — temperature spike (perturbation) → zooxanthellae expelled → coral white → habitat loss → species count crashes. Bottom-of-the-web climate cascade.

**Invasive cane toad** in Australia → introduce toad → native predators die from toxin → mesopredator release → secondary cascade. Multi-step.

**Decomposer removal** — remove fungi/bacteria → dead matter accumulates → nutrients lock up → producer growth halts. The "invisible" trophic level revealed.

## Template data shape

```ts
type FoodWebBuilderData = {
  ecosystem: string;                // "Yellowstone in the 1990s"
  anchors: WebNode[];               // pre-placed organisms (context)
  available: WebNode[];             // drawer organisms
  canonicalEdges: WebEdge[];        // who eats whom (with energy fractions)
  perturbations: Perturbation[];
  poweredIdea: string;
};

type WebNode = {
  id: string;
  name: string;
  trophicLevel: 'producer' | 'primary' | 'secondary' | 'tertiary' | 'decomposer';
  initialBiomass: number;
  icon: string;
};

type WebEdge = {
  fromId: string;                   // the eaten
  toId: string;                     // the eater
  efficiency: number;               // 0..1; energy fraction transferred
};

type Perturbation = {
  id: string;
  description: string;
  apply: { kind: 'remove' | 'halve' | 'introduce'; nodeId?: string; newNode?: WebNode };
  predictedCascade: CascadeOutcome[];   // for prediction-grading
};

type CascadeOutcome = {
  nodeId: string;
  trajectory: 'crash' | 'boom' | 'stable' | 'fluctuate';
  reason: string;
};
```

The simulation is a simple lotka-volterra-ish update step over the constructed graph (`src/engine/ecosystem/simulator.ts`).

## Reveal & feedback design

- **Edge feedback during build**: drawing a "wrong direction" arrow (eater → eaten) gets gently rejected with "energy flows from eaten to eater." Direction is itself a lesson.
- **Pre-simulation prediction**: student commits to crash/boom/stable for each named node before hitting RUN.
- **Live cascade animation**: bars rise and fall in sync. Crashes drop to 0 with a soft fade.
- **Reflect**: a table compares predicted vs simulated for every node. Mismatches are flagged with the canonical reason.
- **Powered-idea reveal**: "The most-connected species are not always the most important. Keystone species are those whose *removal* causes disproportionate cascades."

## Variations

- **Keystone hunt**: the student must *identify* the keystone species by trying perturbations. The one whose removal causes the biggest cascade is named.
- **Restoration mode**: start from a degraded ecosystem; the student adds species to rebuild stability.
- **Multi-perturbation**: apply two perturbations in sequence. Interaction effects are surprising.
- **Energy budget validation**: the engine warns if a predator's incoming energy is less than its required energy — "this species can't survive on this diet." Teaches energetics.

## Anti-patterns

- **Too many species**: more than 10-12 nodes overwhelms the visual cascade. Keep ecosystems small enough to track every node by eye.
- **Single canonical web**: real food webs have variable connectivity. Accept any web that includes the *critical* edges; reward but don't require the rest.
- **No prediction step**: this is the predict-run-reflect pattern; skipping prediction collapses the lesson.
- **Cascade always crashes everything**: tuning matters. Some perturbations should produce *stable* outcomes — that's a real ecological finding (resilience).

## Authoring notes

- Use *real* ecosystems with published trophic data (Yellowstone, kelp forests, Serengeti). Cultural presence matters; students should leave with knowledge of real cases.
- Hand-tune efficiencies so the cascade story plays out cleanly — real ecological math has noise; you can simplify but stay faithful to the directionality.
- Each Perturbation's `predictedCascade` is the lesson — write the `reason` strings carefully; they're what the student learns when they're wrong.
