# 05 — Procedure Builder

**One-liner**: Drag LOGO-descended command blocks into a procedure that *runs* a biological process — the student programs the cell to do mitosis, not picks "mitosis" from a menu.

## Papert principles embodied

- **The child programs the computer** — the central Papert inversion. "In most contemporary educational situations where children come into contact with computers the computer is used to put children through their paces… The Logo philosophy is the reverse: it is the child who programs the computer" (*Mindstorms*, ch. 1).
- **Procedural thinking**: students learn to *decompose* a process into named, reusable sub-procedures with explicit parameters and repetition.
- **Debugging**: the assembled procedure runs visibly. Bugs show up as wrong outputs the student then fixes. The same mental discipline that LOGO taught for geometry, taught here for biology.
- **Powerful idea**: many biological processes ARE procedures with sub-procedures, loops, and conditionals — recognizing this is itself the lesson.

## What the student does

1. A goal is posted: "**Write a procedure that produces a functional protein from a gene.**"
2. The left rail shows a palette of typed blocks, grouped by category:
   - `transcribe(gene) → mRNA`
   - `addCap(mRNA)`
   - `splice(mRNA)`
   - `polyadenylate(mRNA)`
   - `export(mRNA)`
   - `translate(mRNA) → protein`
   - `fold(protein)`
   - control flow: `repeat N times { … }`, `if (condition) { … }`
3. Student drags blocks into the assembly area, snapping them together. Blocks have typed sockets (e.g., `transcribe` outputs `mRNA`; `translate` accepts `mRNA`). Sockets visually rhyme: incompatible shapes won't snap.
4. Student hits **RUN**. The procedure animates step-by-step in the right pane, showing intermediate states ("mRNA produced", "spliced", "exported through nuclear pore", etc.).
5. If the procedure succeeds (reaches the goal state), the canonical "powerful idea" reveals: "Gene expression is a *pipeline* of named sub-procedures, each modifying the molecule."
6. If it fails, the engine shows where: "Your procedure produced unspliced pre-mRNA. The ribosome couldn't read it." The student debugs and re-runs.

## Biology examples

**Protein synthesis** (above) — central dogma as a procedure.

**Mitosis** — student composes: `replicateDNA()`, then `repeat 4 times { condensChromosomes(); … }`. Discover that mitosis has 4 named phases by *needing* to assemble them.

**Glucose homeostasis feedback loop** — student writes an `if/else` procedure: `if (blood_glucose > 110) { secreteInsulin(); } else if (blood_glucose < 70) { secreteGlucagon(); }`. Run on a time-series of meals. See whether their loop keeps glucose in range.

**Action potential** — `if (depolarized > -55mV) { openVoltageGatedNaChannels(); … repolarize(); refractoryPeriod(); }`. The student literally writes the firing-and-resetting logic.

**PCR** (polymerase chain reaction) — `repeat 30 times { denature(); anneal(); extend(); }`. Teaches both the procedure AND why PCR is exponential.

## Template data shape

```ts
type ProcedureBuilderData = {
  goal: string;                    // "Produce a functional protein"
  initialState: Record<string, unknown>;
  goalCheck: (state: Record<string, unknown>) => boolean;  // serialized as a named predicate id
  palette: BlockSpec[];            // available blocks (filtered to relevant)
  canonical: BlockInstance[];      // the canonical answer (for hint reveal)
  poweredIdea: string;             // reveal sentence
};

type BlockSpec = {
  id: string;
  label: string;
  inputs: Array<{ name: string; type: string }>;
  outputs: Array<{ name: string; type: string }>;
  kind: 'action' | 'repeat' | 'if' | 'else';
  body?: never;                    // for 'action'
};

type BlockInstance = {
  blockId: string;
  bindings: Record<string, string>;   // input name → upstream output id
  children?: BlockInstance[];          // for control-flow blocks
};
```

Execution engine: serializable interpreter. The state is a plain object; each block is a pure function `(state, args) => state'`. This makes mid-execution suspend/resume trivial.

## Reveal & feedback design

- **During assembly**: invalid snaps are prevented at the socket level (typed shapes). The student *sees* the type mismatch before submitting.
- **On run**: the procedure animates. Each block highlights as it executes, with a 400ms breathing rhythm so the student can read the sequence as a sentence.
- **On success**: the procedure stays on screen as a saved artifact in the student's "lab notebook" (local storage). Re-openable from the Journeys page. This is the *public, persistent artifact* constructionism demands.
- **On failure**: the diff is shown — "you produced X, the goal needs Y". The student can also tap **REVEAL CANONICAL** which shows a translucent ghost of the canonical procedure beside theirs.

## Variations

- **Optimize**: a procedure that works in 8 blocks but could be done in 5 unlocks a "compact procedure" achievement. Encourages elegance.
- **Refactor**: the engine offers `extractProcedure(selectedBlocks)` so the student can name a chunk (e.g., name a 3-block group `transcribe_and_process`) and reuse it. Direct LOGO-style sub-procedure invention.
- **Buggy starting code**: the student begins with a procedure that almost works, and must debug it. Pure Papert.

## Anti-patterns

- **Too much typing**: this is drag-snap, not code-typing. The student should never have to remember exact syntax.
- **Solution space too small**: if there's only one path, it's just a recipe, not programming. There must be ≥2 valid orderings or ≥2 valid factorings.
- **No animation**: a procedure that just produces a final answer is a calculator, not a microworld. The *running* is half the lesson.
- **Hidden semantics**: every block must be inspectable — hover shows its precondition / postcondition. No magic blocks.

## Authoring notes

- Pick processes that have ≥4 steps and at least one loop or conditional. Linear 2-step processes are better as recipe-sequencer (game type 06).
- Write the *block palette* as the unit of authorship — it scopes the search space.
- Provide ≥2 valid canonical solutions when they exist (e.g., two valid orderings of meiosis sub-phases for some contexts). The engine should accept any goal-satisfying procedure.
