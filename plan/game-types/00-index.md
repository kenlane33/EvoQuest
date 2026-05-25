# evo-quest — Game Types Index

> "My interest is in the process of invention of objects-to-think-with, objects
> in which there is an intersection of cultural presence, embedded knowledge,
> and the possibility for personal identification."
> — Seymour Papert, *Mindstorms* (1980)

This folder describes the **understanding-growth question-like experiences**
that compose evo-quest's quiz engine. Each file is a self-contained design
spec for one game type. The main app plan ([../../plan](../) and the plan file
in `.cursor/plans/`) references these as the source-of-truth for what
`QuizTemplate` discriminants exist and what authors can write.

## Design philosophy

Every game type here is designed against Papert's principles, refreshed and
re-read from primary sources before writing:

| Principle | What it means here |
|---|---|
| **Constructionism** | Students *build* the answer (graph, tree, sentence, procedure), not just pick one. The artifact persists and is theirs. |
| **Microworlds** | Small, rule-rich, safe-to-explore worlds. "Discovery-rich" — nuggets of knowledge scattered for finding, not lectured. |
| **Powerful Ideas in Mind-Size Bites** | Each unit foregrounds one organizing idea (selection, inheritance, feedback) at a scale a single sitting can hold. |
| **Objects-to-think-with** | The Punnett grid, the cladogram, the speed-revealing mnemonic — each is a thinkable artifact, not a screen of text. |
| **Body / Ego Syntonic** | "Be the Turtle" — students *identify with* the molecule, finch, cell. First-person role-play across decision nodes. |
| **Hard Fun** | Difficulty is the *feature*. Engagement comes from working at the edge of competence on something the student cares about making. |
| **Debugging** | Errors are data. Wrong answers reveal the *bug in the model*, not a verdict. The student debugs their theory the way they would debug a program. |
| **Bricolage** | Tinker, course-correct, dialogue with materials. Most game types let the student revise mid-attempt. |
| **The child programs the computer** | At least one mode (Procedure Builder) lets the student *write a program* that produces the biological outcome — not consume one. |

## Game types (current set)

Each row is a separate file. Game types are referenced from code by their
`templateId`, which is the filename stem (e.g. `speed-reveal-mnemonic`).

| # | File | One-liner | Papert lean |
|---|---|---|---|
| 01 | [speed-reveal-mnemonic.md](./01-speed-reveal-mnemonic.md) | Latin/Greek root stays; mnemonic chars un-mask in shuffled order over 5s | discovery-rich microworld |
| 02 | [be-the-turtle.md](./02-be-the-turtle.md) | First-person role-play through a biological decision tree | body/ego syntonic |
| 03 | [microworld-sandbox.md](./03-microworld-sandbox.md) | Tinker sliders on a tiny live simulation; find params that hit a goal | microworld + bricolage |
| 04 | [predict-run-reflect.md](./04-predict-run-reflect.md) | Commit a prediction → watch the truth → reflect on the delta | debugging your theory |
| 05 | [procedure-builder.md](./05-procedure-builder.md) | Drag command blocks (LOGO-descended) to build a biological procedure | child programs the computer |
| 06 | [recipe-sequencer.md](./06-recipe-sequencer.md) | Drag-arrange the canonical steps of a process | procedural decomposition |
| 07 | [palace-walk.md](./07-palace-walk.md) | Walk a grid Room of the memory palace; bump into ideas to answer them | microworld + spatial cognition |
| 08 | [punnett-builder.md](./08-punnett-builder.md) | Build the grid, read off the ratios — don't pick from options | constructionism |
| 09 | [pedigree-detective.md](./09-pedigree-detective.md) | Propose an inheritance pattern hypothesis; engine checks consistency | debugging hypotheses |
| 10 | [etymology-puppet.md](./10-etymology-puppet.md) | Compose a term from Greek/Latin morpheme tokens | powerful ideas in mind-size bites |
| 11 | [mutation-lab.md](./11-mutation-lab.md) | Apply a mutation; predict the protein change before the codon table reveals | debugging the genetic program |
| 12 | [concept-map-builder.md](./12-concept-map-builder.md) | Draw labeled edges between concept nodes; engine diffs vs canonical | constructionism (graphs) |
| 13 | [food-web-builder.md](./13-food-web-builder.md) | Build a web, then watch what breaks when a node is removed | microworld of interdependence |
| 14 | [debug-the-claim.md](./14-debug-the-claim.md) | Click the bug in a piece of biological reasoning (e.g., Lamarck in disguise) | debugging |
| 15 | [counterfactual-lab.md](./15-counterfactual-lab.md) | Reason about a "what-if" cascade with arrangeable consequence cards | powerful ideas: contingency |
| 16 | [cladogram-crafter.md](./16-cladogram-crafter.md) | Build a phylogenetic tree from a trait table; engine evaluates parsimony | constructionism (trees) |
| 17 | [self-debug-confidence.md](./17-self-debug-confidence.md) | Predict your own next-attempt accuracy; calibrate over time | debugging your own model |

## The shared `QuizTemplate` contract

Every game type implements a discriminated union member. The engine code
(in `src/engine/templates/`) registers one renderer per `kind`:

```ts
type QuizTemplate =
  | { kind: 'speed-reveal-mnemonic'; data: SpeedRevealData }
  | { kind: 'be-the-turtle'; data: BeTheTurtleData }
  | { kind: 'microworld-sandbox'; data: MicroworldSandboxData }
  // ... one entry per file in this folder

type QuizResult = {
  templateId: QuizTemplate['kind'];
  correct: boolean;
  attemptMs: number;
  // game-specific extras can ride in `details` for the journey log
  details?: Record<string, unknown>;
};
```

A `KnowledgeUnit` carries an *array* of `QuizTemplate` instances. The engine
picks one of three ways:

1. **Random** — author left it to the engine; one is chosen uniformly
2. **Specified** — author flagged `preferred: true` on one template; the engine
   uses it on first encounter, then rotates
3. **Adaptive** — review modes (trouble, wrong-only) bias toward templates the
   student hasn't seen for that unit, to surface the same powerful idea from a
   different angle

## What every game type file must contain

So new authors can copy a template:

1. **One-liner** — single sentence
2. **Papert principles embodied** — explicit citations
3. **What the student does** — interaction steps
4. **Biology examples** — at least two concrete, with real data
5. **Template data shape** — TypeScript sketch
6. **Reveal & feedback design** — how the mnemonic / etymology / "powerful idea"
   unfolds inside *this* mode (the speed-reveal pattern from game type 01 is
   the default, but each mode can layer its own reveal)
7. **Variations** — riff ideas
8. **Anti-patterns** — what Papert would specifically dislike about a bad
   implementation
9. **Authoring notes** — guidance for content authors

## What stays consistent across all game types

These are non-negotiable so the experience feels cohesive:

- **Etymology card** — every quiz shows the relevant Latin/Greek root, always
  visible. The card design from `Evoquest.tsx` (purple gradient, scroll emoji)
  is the shared component.
- **Mnemonic delivery** — by default the speed-reveal pattern (countdown →
  shuffled char un-mask) is overlaid. Modes that have their own reveal
  (like procedure-builder which reveals the canonical program after submit)
  may suppress it.
- **Resume invariant** — every game type's intermediate state is serializable
  to JSON and survives a refresh mid-question. See [AGENTS.md](../../AGENTS.md)
  when the app exists.
- **No score-shame** — wrong answers reveal the *reason* (etymology + canonical
  explanation) before the streak resets. The student should leave the
  question knowing more than when they entered, regardless of outcome.
- **Achievement reward** — each `KnowledgeUnit` earns exactly one
  topic-shaped achievement when first answered correctly. The achievement
  is the *thing itself* (mitochondrion icon, Cambrian fossil, Punnett grid)
  not a generic badge.

## Adding a new game type

1. Copy `01-speed-reveal-mnemonic.md` to a new numbered file.
2. Fill every section.
3. Add a row to the table above.
4. Add a `kind` to `QuizTemplate` in `src/types/quiz.ts`.
5. Add a Zod schema in `src/storage/schema.ts`.
6. Add a renderer in `src/engine/templates/<kind>.tsx`.
7. Add at least one seeded `KnowledgeUnit` that uses it in
   `src/content/*/index.ts` so the format docs page shows a live example.

## References

- Papert, S. (1980, 2nd ed. 1993). *Mindstorms: Children, Computers, and
  Powerful Ideas.* Basic Books. — turtle, microworlds, debugging, syntonicity
- Papert, S. (1993). *The Children's Machine.* Basic Books. — bricolage,
  yearners vs schoolers
- Papert, S. (2002). *Hard Fun.* papert.org/articles/HardFun.html
- Kay, A. (1972). *A Personal Computer for Children of All Ages.* —
  "doing → images → symbols" enactive/iconic/symbolic ladder
- Kay, A. (1993). *The Early History of Smalltalk.* — late binding,
  "simple things simple, complex things possible"
