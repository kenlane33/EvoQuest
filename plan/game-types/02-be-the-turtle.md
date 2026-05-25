# 02 — Be The Turtle

**One-liner**: First-person role-play through a biological decision tree — *you* are the glucose molecule, the finch, the neutrophil, and your choices compound into your fate.

## Papert principles embodied

- **Body syntonic**: Papert's defining move. "Children can identify with the Turtle and are thus able to bring their knowledge about their bodies and how they move into the work of learning formal geometry" (*Mindstorms*, 1980). Substitute "the Turtle" with "the molecule" and you get this game type.
- **Ego syntonic**: at higher cognitive levels, the student takes on the *intentional* stance — "what do I, as a virus, *want* to do here?" — which loads concepts onto a familiar mental frame (purposeful agent).
- **Microworld**: the decision tree is a tiny world with its own rules. Each leaf is a fate the student can re-run from.

## What the student does

1. Title screen frames the role: "**You are a glucose molecule entering a muscle cell. It's been 90 minutes since your host's last meal.**"
2. A series of 2–5 decision nodes appear, each as a fork-in-the-road choice with terse, in-character language:
   - "Enter the mitochondrion?" → [Yes, I see oxygen] / [No, oxygen is low]
3. Each choice carries the student forward to the next node, accumulating a small visible "fate trail" at the top (icons for what you've become: → pyruvate → acetyl-CoA → CO₂ + ATP).
4. The path terminates at a fate: "**You are exhaled as CO₂. 36 ATP banked.**" or "**You become lactic acid. The muscle burns.**"
5. The engine reveals whether your path was the *biologically optimal* one given the framing — and the student can re-run the same scenario making different choices to see other endings.

## Biology examples

**You are glucose** — glycolysis → fork on O₂ availability → aerobic vs anaerobic respiration. Fates: 36 ATP / 2 ATP + lactate / fermentation in yeast.

**You are a finch on the Galápagos** in a drought year. Beak choice (short+stout / long+thin). Food choice (seeds / nectar). Survive-and-reproduce / die-young / migrate. Show how natural selection acts on *your* phenotype.

**You are mRNA** just transcribed in the nucleus. Choose: cap? splice? export? Get translated. Fate: a functional protein / degraded by nonsense-mediated decay / stuck in the nucleus.

**You are a B-cell** encountering an antigen. Activate / stay naive / become memory cell / become plasma cell. Reveals the adaptive immune cascade.

## Template data shape

```ts
type BeTheTurtleData = {
  roleTitle: string;             // "You are a glucose molecule"
  setup: string;                 // 1-2 sentences of context
  nodes: DecisionNode[];
  startNodeId: string;
};

type DecisionNode = {
  id: string;
  prompt: string;                // in-character question
  state?: string;                // shown on the "fate trail" if entered
  choices: Array<{
    label: string;               // first-person choice text
    nextNodeId: string | null;   // null = terminal
    biology: string;             // explanation of what just happened
    isOptimal?: boolean;         // for scoring + reveal
  }>;
};
```

Correctness: a path is "correct" if every choice was the biologically optimal one given the framing. The engine also marks each *individual* choice so the student can see partial paths.

## Reveal & feedback design

- **During play**: each choice immediately reveals one sentence of biology ("Acetyl-CoA enters the Krebs cycle inside the mitochondrial matrix.") with the etymology card folded in if a key term was used.
- **At the terminal**: the full path is drawn as a node-edge diagram with the canonical optimal path highlighted; the student can tap any node to re-enter from there.
- **Speed-reveal**: terminal fate name plays the speed-reveal mnemonic if there's one registered (e.g., "ANAEROBIC" → root + mnemonic).

## Variations

- **Replay-driven**: track all the fates a student has reached for a given role. Show a "fates discovered: 3/7" tracker. Each new ending unlocks an achievement.
- **Time pressure**: some choices have a soft 10-second timer ("oxygen is depleting"). Adds a body-syntonic urgency.
- **Multi-agent**: two students each play a role in an interaction (predator/prey, host/parasite) — out of scope for v1 but designed for.

## Anti-patterns

- **The narrator over-explains during the choice**: violates the in-character framing. Save explanation for the *next* node arrival.
- **One-path-is-right, rest-are-stupid**: every choice should be biologically meaningful, even the "wrong" ones — that's how the student learns *why* the right path is right.
- **Generic "you got it right!" at the terminal**: instead, the terminal narrates a vivid fate scene. The biology is in the scene.
- **Choices that aren't actually choices**: if both options lead to the same next node with the same biology, delete one. Every fork must matter.

## Authoring notes

- Write the *fates first*, then back-fill the decision tree. Vivid endings (death, transformation, survival-and-reproduction) anchor the writing.
- Use **second person, present tense**: "You bind to the receptor. The signal cascade fires."
- Keep each node's prompt under 80 chars and each choice label under 40 chars.
- Mark exactly one path as fully `isOptimal: true`; mark *some* sub-optimal paths as locally-correct so the student isn't punished for a single mistake.
