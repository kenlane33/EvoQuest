# 03 — Microworld Sandbox

**One-liner**: A tiny live simulation with two or three sliders — tinker the parameters until you hit the goal, and the rules of the system reveal themselves through play.

## Papert principles embodied

- **Microworld**: this is Papert's term, used here in its strongest sense — "a little world, a little slice of reality… discovery-rich in the sense that little nuggets of knowledge have been scattered around in it for you to find" (*Mindstorms* microworlds chapter).
- **Bricolage**: the student works *in dialogue with the materials*, course-correcting toward a target. No advance plan needed.
- **Hard fun**: the difficulty is intrinsic — the simulation pushes back. The student's reward is *seeing the curve change shape*.
- **Debugging your theory**: every parameter twist is a hypothesis test against the live behavior.

## What the student does

1. A small live visualization fills the center of the screen — a phase-space plot, a population graph, a curve, or a 2D field.
2. Two to three sliders sit beneath, labeled with the actual biological parameter names (carrying capacity *K*, growth rate *r*, predation rate *a*, mutation rate µ).
3. A **goal** is posted: "Find a setting where the prey population goes extinct within 50 generations" or "Get a stable oscillation with period ≈ 10 generations."
4. The student drags sliders. The visualization updates *live* (debounced 30ms). The current run scrolls a time-series across the plot.
5. When the goal condition is met, the simulation pauses with a soft chime and the canonical biological principle is revealed as a one-line "powerful idea": "Predator-prey systems oscillate when predator response lags prey availability."
6. The student can **bookmark** parameter sets they found interesting — these get saved to local storage as "field notes" and shown on the Journeys page.

## Biology examples

**Lotka-Volterra predator-prey** — sliders for *r* (prey growth), *a* (predation), *m* (predator death). Goals: oscillation, predator extinction, prey extinction, stable coexistence.

**Hardy-Weinberg drift** — sliders for population size *N*, initial allele freq *p*, selection coefficient *s*. Goal: lose an allele in <100 generations starting at p=0.5. Teaches why drift dominates in small N.

**Enzyme kinetics (Michaelis-Menten)** — sliders for substrate concentration *[S]* and inhibitor concentration *[I]*. Click toggles between competitive and non-competitive inhibition. Goal: make the v-max change vs the K_m change. Teaches the difference between the two inhibition types geometrically.

**Logistic growth + harvesting** — sliders for *r*, *K*, harvest rate *H*. Goal: maximum sustainable yield. Real-world hook: fisheries collapse.

## Template data shape

```ts
type MicroworldSandboxData = {
  modelId: string;               // "lotka-volterra" — picks the ODE renderer
  parameters: Array<{
    key: string;                 // 'r', 'a', 'K'
    label: string;               // human-readable
    min: number; max: number; default: number; step: number;
    units?: string;
  }>;
  goal: GoalSpec;
  bookmarks?: number;            // how many param sets the student can save
  duration: number;              // simulation seconds
  reveal: string;                // the "powerful idea" sentence
};

type GoalSpec =
  | { kind: 'extinction'; species: string; byGen?: number }
  | { kind: 'oscillation'; periodGen: [number, number] }
  | { kind: 'reachValue'; signal: string; range: [number, number] }
  | { kind: 'maximize'; signal: string };
```

Correctness: the goal-evaluator runs every sim tick; first satisfaction marks success.

## Reveal & feedback design

- **Live**: the curve *is* the feedback. No quiz overlay during tinkering.
- **On goal hit**: pause the sim, dim the surroundings, write the powerful-idea sentence in big type. Etymology card highlights any key term in the sentence (e.g., "*homeostasis*" → root + mnemonic).
- **On give-up / time-out**: show the canonical optimal parameter region as a translucent overlay on the slider tracks — "the answer lives here." The student can drop into the highlighted region and confirm with their own eyes.

## Variations

- **Constraint mode**: lock one slider at a problematic value, force the student to compensate with the others. Teaches that some problems can only be solved by adjusting the *system*, not one knob.
- **A-vs-B comparison**: two sim canvases side by side with linked sliders. The student must find a setting that makes A behave differently from B.
- **Story-driven**: the goal arrives as a scenario ("A farmer is losing 30% of her crop to deer each year. Find a humane harvest rate…"). Same mechanic, richer framing.

## Anti-patterns

- **Too many sliders**: more than three is overwhelming. If the model needs more, hide them in an "advanced" drawer and pick sensible defaults.
- **Continuous goal with no signal**: the student needs to *see* whether they're getting closer. A goal-distance bar in the corner is mandatory.
- **Hidden parameter coupling**: if sliding *r* secretly also changes *K*, you've broken the microworld's rules. Sliders must be independent or their coupling must be explicit and on screen.
- **Single solution**: the best sandboxes have a *region* of solutions, not a point. Multiple correct paths make tinkering rewarding.

## Authoring notes

- Pick a model with ≤4 parameters and ≤2 state variables. ODE math is fine; the Runge-Kutta integrator is in `src/engine/microworld/integrator.ts`.
- Default values should sit *outside* the solution region so the student has to actually search.
- The reveal sentence should be a *generalization*, not a tautology. Bad: "The prey population went extinct." Good: "When predation outpaces prey reproduction, the predator follows the prey to zero."
