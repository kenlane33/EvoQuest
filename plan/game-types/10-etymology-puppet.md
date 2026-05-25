# 10 — Etymology Puppet

**One-liner**: Drag Greek and Latin morpheme tokens into slots to *build* a biological term — and discover that "endosymbiosis" is just `endo` + `sym` + `bio` + `sis` waiting to be assembled.

## Papert principles embodied

- **Powerful ideas in mind-size bites**: morphemes ARE mind-size bites. Each one carries a tiny self-contained meaning the student can reuse. Once you own `bio`, you partially own every word that contains it.
- **Constructionism**: the term is *built*, not picked. The act of dragging the parts in is what creates the memory.
- **Discovery-rich**: a morpheme can show up in five terms in this app. Each time the student grabs `endo`, they're reactivating the meaning. Spaced reactivation across contexts is exactly what robust memory needs.
- **Object-to-think-with**: the morpheme tokens are the artifacts. They have persistent identity across the whole curriculum.

## What the student does

1. A definition prompt appears: "**Two species evolving in response to each other.**"
2. A slot bank shows 3-5 empty positions: `___` + `___` + `___`
3. A morpheme palette shows 6-10 draggable tokens at the bottom, each with its meaning visible: `co- (together)`, `endo- (within)`, `evo- (unroll)`, `-sis (process)`, `-tion (act of)`, `homo- (same)`, `hetero- (different)`...
4. The student drags morphemes into the slots in order. As each token snaps in, the slot reads the candidate term: `co + evo + lution`.
5. When the slots match a known term, the term highlights, the etymology card fires the speed-reveal mnemonic, and a tiny dictionary entry slides in showing the term used in a real sentence.
6. Bonus: morphemes used in the build *stay glowing in the palette* — a visible record that "you used `endo` today; here's where else it shows up."

## Biology examples

**endosymbiosis**: `endo` (within) + `sym` (together) + `bio` (life) + `-sis` (process). The mitochondrion lives *within*, *together*, as *life*, as a *process*.

**photosynthesis**: `photo` (light) + `syn` (together) + `thesis` (placing). Light + putting together. The verb-led structure of the morpheme stack matches the chemistry.

**heterozygote** / **homozygote**: `hetero/homo` (different/same) + `zygo` (yoked) + `-te` (one). Two alleles yoked into one organism; same or different.

**phenotype** vs **genotype**: `pheno` (show) + `typos` (impression) vs `geno` (birth/kind) + `typos`. The visible vs the inherited.

**autotroph** / **heterotroph**: `auto/hetero` (self/other) + `troph` (nourishment). Self-feeder vs other-feeder. Whole ecology in two morphemes.

## Template data shape

```ts
type EtymologyPuppetData = {
  definition: string;                // the prompt
  slots: number;                     // how many morpheme positions
  morphemes: MorphemeToken[];        // palette (mix of correct + plausible distractors)
  acceptedAnswers: string[][];       // ordered morpheme-id sequences that yield correct terms
  targetTerm: string;                // the canonical assembled term
  exampleSentence: string;
  poweredIdea: string;
};

type MorphemeToken = {
  id: string;
  morpheme: string;                  // "endo"
  meaning: string;                   // "within"
  language: 'Greek' | 'Latin' | 'Other';
  alsoSeenIn?: string[];             // other terms that use it — for the "glowing memory" feature
};
```

The morpheme registry is *shared across the whole app*. When a student first uses `endo` here, the app marks it `firstSeen` in storage; the next time it appears in any speed-reveal or fill question, it pre-glows familiar.

## Reveal & feedback design

- **Inline assembly**: as morphemes snap in, the resulting string is shown immediately, even if not yet a real term. Embraces play.
- **Correct assembly**: the term lights up gold, the speed-reveal mnemonic fires, and the example sentence types itself out below. The morpheme tokens in the palette get a glow-ring keyed to "you used this."
- **Distractor morphemes**: the palette contains 2-3 plausible-but-wrong morphemes (`exo`, `peri`) to make the puzzle real. They never punish the student; they get demoted to a "tried but rejected" row.
- **Cross-reference panel**: a small "you've now seen `endo` in 3 terms" counter — visible meta-memory of the student's growing vocabulary.

## Variations

- **Reverse mode**: given the term, drag the morphemes out into the slots. Tests decomposition skill.
- **Cousin terms**: assemble two related terms back-to-back (`homozygous`/`heterozygous`), comparing their morpheme stacks side-by-side. Differential definition.
- **Sentence completion**: the term you assemble plugs into a sentence that grades meaning, not spelling. Tests transfer.

## Anti-patterns

- **Morpheme list too clean**: real terms have irregular morphology (`endosymbiosis`, not `endosymbiogenesis`). Don't over-regularize. Allow `-sis` and `-tion` and `-gen` as separate options.
- **No example sentence**: a morpheme assembly without a real usage is sterile. Always show the term in action.
- **Distractors that aren't real morphemes**: distractors must be real morphemes, just wrong for this term. Otherwise the student learns nothing from rejecting them.
- **Treating morphemes as flashcards**: the registry MUST track them cross-context. A morpheme seen once should glow when seen again three units later.

## Authoring notes

- Source morphemes from Liddell-Scott (Greek) and Lewis-Short (Latin) — keep meanings short (1-2 words) and historically grounded.
- Include 10-20% morphemes that are *only* in the registry to support future content. Pre-seeding the vocabulary is cheap and makes the curriculum feel coherent over time.
- The "alsoSeenIn" array is *computed*, not authored — set up the engine to derive it from the cross-product of all `KnowledgeUnit` mnemonics.
