# 04 — Predict, Run, Reflect

**One-liner**: A three-phase loop — commit to a prediction, watch reality unfold, and *reflect on the delta* between your model and the truth.

## Papert principles embodied

- **Debugging as the central act**: this is Papert's deepest pedagogical move applied directly. "Thinking about learning by analogy with developing a program is a powerful and accessible way to get started on becoming more articulate about one's debugging strategies" (*Mindstorms*). Your prediction *is* a program. The truth is the bug report.
- **Constructionism (cognitive)**: the prediction is an external artifact — the student wrote it down, took a stand. Now there's a *thing* to look back at and revise.
- **Powerful ideas in mind-size bites**: one mechanism per question, so the prediction error isolates to one belief.

## What the student does

1. **Predict phase**: a scenario is described. The student commits a prediction via a typed answer, a slider, a choice, or a drawn curve. There is **no "skip"** — committing is required. (Soft cap of 60s, then the engine soft-times-out with a "your best guess?" nudge.)
2. **Run phase**: the engine animates or simulates the actual outcome over 5–15 seconds, with the student's prediction overlaid as a translucent ghost. The student watches their model collide with reality.
3. **Reflect phase**: the engine shows a structured diff:
   - "You predicted: **50% pink, 50% white.** Reality: **50% pink, 50% white.** ✓"
   - or "You predicted: **all daughter cells identical.** Reality: **four genetically unique daughter cells.** Bug: you forgot crossing over and independent assortment."
4. The student is asked: **"What's the bug in your model?"** — choose from 2-4 candidate bug descriptions, or type free-text (matched loosely).
5. The bug acknowledgment is what counts for the unit's mastery — *not* the prediction accuracy. Wrong predictions with correct bug-identification fully earn the achievement.

## Biology examples

**Cross prediction**: "Father IᴬIᴬ × Mother ii. Predict child blood-type ratios." Slider for % Type A. Reveal: 100% Type A. Bug candidates: "I forgot O is recessive" / "I divided alleles wrong" / "I got the dominance hierarchy wrong."

**Population over time**: "Bacteria double every 20 min, starting with 1, with food for 10⁹." Student draws a curve on a log plot. Reveal: logistic curve. Bug candidates: "I drew exponential forever" / "I drew linear" / "I plotted on linear instead of log."

**Ecological cascade**: "Wolves removed from Yellowstone. Predict what changes for: elk, willows, beavers, rivers." Sliders for each. Reveal: elk up → willows down → beavers gone → rivers eroded. Bug candidates: "I thought wolves only affected elk" / "I missed the trophic cascade" / "I had the sign wrong on willows."

**Mitosis vs Meiosis**: "Starting with one diploid cell with 4 chromosomes. After meiosis, how many cells? How many chromosomes each?" Reveal animation of meiosis. Bug candidates: "I confused mitosis with meiosis" / "I forgot the second division" / "I forgot replication before division."

## Template data shape

```ts
type PredictRunReflectData = {
  scenario: string;                  // the situation, 1-3 sentences
  predict: PredictionInput;          // how the student commits
  run: RunSpec;                      // how reality plays out
  truth: TruthValue;                 // the ground truth for comparison
  bugCandidates: Array<{
    label: string;
    isTheBug: boolean;               // ≥1 must be true; multiple correct is okay
    explanation: string;             // shown after the student picks
  }>;
  freeText?: { acceptable: string[] };  // optional fallback
};

type PredictionInput =
  | { kind: 'numeric'; label: string; units?: string; range: [number, number] }
  | { kind: 'percentages'; categories: string[]; mustSumTo: 100 }
  | { kind: 'curve'; xLabel: string; yLabel: string; yLog?: boolean }
  | { kind: 'choice'; options: string[] };
```

## Reveal & feedback design

- **Prediction ghost overlay**: the student's prediction is always visible during the run phase as a ghost — they *see* the gap themselves.
- **No "right/wrong" judgment until reflect phase**: the run phase narrates the truth neutrally. The judgment comes after the student names the bug.
- **Etymology card**: surfaces any key term in the truth narrative (e.g., "*trophic cascade*" → Greek *trophē* = nourishment + *cascade* = waterfall chain).
- **Bug-named achievement**: each scenario's bug is a named misconception. Naming it correctly unlocks a "bug squashed" mini-achievement that aggregates on the journeys page ("Misconceptions debugged: 23").

## Variations

- **Pre-prediction confidence**: ask the student to also slide a confidence bar (0-100%). Over time the system shows their calibration curve.
- **Two predictions**: predict the immediate outcome AND the long-term outcome. Many biological processes have non-monotonic dynamics; predicting both teaches that.
- **Group prediction** (out of scope v1): aggregate predictions across users to show "your class predicted… reality was…"

## Anti-patterns

- **Skipping the commit**: if the student can skip the predict phase, the whole game collapses. Hard requirement.
- **Vague truth**: "kind of in that range" is unacceptable. Truth must be specific and visible.
- **Bug candidates that aren't real bugs**: filler options trivialize the reflect phase. Every candidate must be a misconception some real student has actually held.
- **Punishing wrong predictions**: this game type *rewards* wrong predictions when paired with correct bug-naming. That's the pedagogy.

## Authoring notes

- The bug candidates are the *hardest* part to write well. Mine real student answers / common textbook misconceptions for them.
- Predictions on curves: provide a snap-to-grid so students don't get bogged down in pixel-precise drawing.
- Truth narratives should be the same length as the scenario — keep it tight.
