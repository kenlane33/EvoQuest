# 06 — Recipe Sequencer

**One-liner**: Drag-arrange the canonical steps of a process into the right order — and see the cause→effect arrows light up as the chain assembles.

## Papert principles embodied

- **Procedural decomposition** without the full programming surface — a gentler ramp than procedure-builder (game type 05). Some processes are pure sequences; this is the right tool for those.
- **Bricolage**: drag, try, rearrange, course-correct. The cards are tactile.
- **Powerful idea**: a process is *more than* its steps — it's the *order* and *cause-effect* between them. Get the order wrong and the chain breaks.
- **Discovery-rich**: each correct placement reveals a tiny consequence ("Now the chromosomes are aligned. Why does that matter for what comes next?").

## What the student does

1. A title posts the process: "**The Krebs Cycle — arrange the 8 steps.**" A circular or linear track sits on screen with empty slots.
2. A shuffled stack of step cards appears below. Each card has a verb-led title ("acetyl-CoA joins oxaloacetate") and a small icon.
3. The student drags cards into slots. Each placement triggers a small validation:
   - If correct, the slot locks with a soft glow and an arrow from the previous step lights up.
   - If incorrect, the card bounces back to the stack with a brief tooltip hint ("look at what this step needs as an input").
4. Once all slots are filled correctly, the whole chain animates — the molecule trail traces through, with intermediates labeled as they appear.
5. A "**Why this order?**" panel slides up, highlighting one or two *causal* links that make the order non-arbitrary (e.g., "you must condense before aligning — loose chromosomes can't be sorted").

## Biology examples

**Mitosis phases** — prophase → prometaphase → metaphase → anaphase → telophase → cytokinesis. Causal hook: each phase prepares the substrate the next phase acts on.

**DNA replication** — helicase → topoisomerase → primase → polymerase → ligase. Causal hook: each enzyme produces what the next consumes.

**Translation** — initiation (small subunit binds mRNA cap, scans to AUG, large subunit joins) → elongation (aminoacyl-tRNA in A site, peptide bond, translocation) → termination (stop codon, release factor).

**Pasteur's swan-neck flask experiment** — boil broth → bend flask neck → set aside → broth stays clear → snap neck → broth clouds. Why-this-order: the bent neck is the *trap* that lets air in but keeps microbes out. Order is the whole logic.

**Calvin Cycle** — CO₂ fixation → reduction → regeneration of RuBP. Hook: cyclic, so any starting point works… *except* CO₂ entry, which must happen for the cycle to gain carbon.

## Template data shape

```ts
type RecipeSequencerData = {
  processTitle: string;
  steps: Array<{
    id: string;
    title: string;                // verb-led, ≤80 chars
    icon?: string;                // emoji or path
    consequenceHint: string;      // shown on incorrect placement near this slot
  }>;
  causalLinks: Array<{
    fromId: string;
    toId: string;
    why: string;                  // shown in the "Why this order?" panel
  }>;
  cyclic?: boolean;               // if true, accept any rotation
  acceptAlternateOrders?: string[][];  // some processes have ≥1 valid order
};
```

Correctness: the engine validates against canonical order(s); for cyclic processes, accepts any rotation.

## Reveal & feedback design

- **Per-step**: on correct placement, a one-line "what just happened" reveals next to the slot. The eye catches it without leaving the task.
- **Causal arrows**: arrows fill in only between steps the student has correctly placed *consecutively*. Half-correct chains show partial arrows. Visual feedback for partial progress.
- **Full-chain animation**: when complete, a 4-second animation traces the substrate through every step.
- **Etymology layer**: any Greek/Latin step name (e.g., "anaphase" = *ana* + *phase*) triggers the speed-reveal mnemonic at first encounter only.

## Variations

- **Time-budget mode**: a soft 60s timer. Fast-correct earns a "fluent" badge. Speed should reward *practiced* sequences, not pressure new ones.
- **Wrong-step plant**: deliberately add a non-canonical card (e.g., "metaphase II" in a mitosis sequence) that the student must *reject* — drag it to a "not in this process" zone. Tests discrimination, not just ordering.
- **Reverse mode**: given the *outcome*, work backward to identify the prerequisite step.

## Anti-patterns

- **Two-step "sequences"**: trivial. Use multiple-choice for those.
- **Cards with synonyms or near-duplicates**: should be combined or rewritten.
- **No causal link panel**: without the "why this order" reveal, this is just memorization. The causal hooks are *the lesson*.
- **All-or-nothing scoring**: partial-correct placement should earn partial credit, both for fairness and to teach what was *almost* right.

## Authoring notes

- Pick processes with 4-8 steps. Fewer feels trivial; more overwhelms working memory.
- Write each step as a present-tense verb-led action: "Polymerase reads the template strand" — not a noun phrase.
- The *causal* link descriptions are the highest-value content. Spend the writing time there.
