# 08 — Punnett Builder

**One-liner**: Drag alleles into the grid yourself, watch the ratios fall out — Punnett squares are objects-to-think-with, not multiple-choice questions about objects-to-think-with.

## Papert principles embodied

- **Constructionism**: the student *builds* the Punnett square. The square is then a persistent artifact they can re-open from their journey log.
- **Objects-to-think-with**: the Punnett square is a paradigm example of a Papertian thinkable artifact — "an intersection of cultural presence, embedded knowledge, and the possibility for personal identification." Working geneticists use this exact diagram. The student is briefly *being a geneticist*.
- **Powerful idea**: ratios *emerge* from the combinatorics, not from a rule the student has to memorize. Build the grid → count the colors → see the 3:1.
- **Discovery-rich**: the grid silently teaches probability, independent assortment, dominance — without naming any of those yet.

## What the student does

1. The scenario posts: "**Cross a heterozygous purple pea (Pp) with a homozygous white pea (pp). What are the offspring ratios?**"
2. Two parents are shown at top, each with their alleles displayed as draggable tokens.
3. An empty 2×2 grid (or 4×4 for dihybrid) sits below.
4. The student drags one parent's alleles into the column headers and the other's into the row headers. **The grid auto-fills the cells** by combining the headers — that's the magic part, the visible "rule of the microworld."
5. The student then **clicks each cell** to declare its phenotype (purple? white?) — a small palette beside the grid.
6. As the student fills phenotypes, a *live tally bar* updates: "Purple: 2/4 = 50%. White: 2/4 = 50%."
7. The student commits an answer for the question (ratio or percentage). Engine verifies against the auto-computed truth from the student's own grid AND against the canonical truth.

## Biology examples

**Monohybrid (Mendel)**: Pp × pp → 1:1 purple:white. The canonical first lesson.

**Heterozygous × Heterozygous**: Pp × Pp → 3:1. The student *sees* why heterozygous crosses give 3:1 and homozygous crosses don't.

**Incomplete dominance**: RW × WW → 50% pink, 50% white. Engine recognizes "blend" phenotypes.

**Codominance — blood type**: IᴬIᴮ × ii → 50% Type A, 50% Type B. Student learns that AB heterozygotes can produce *non-AB* children.

**Dihybrid (4×4)**: YyRr × YyRr → 9:3:3:1. The grid grows to 16 cells; the ratios are far less obvious; the student *sees* independent assortment.

**Sex-linked**: XᴮY × XᴮXᵇ → carrier daughters + 50% colorblind sons. Grid uses X/Y as header types.

## Template data shape

```ts
type PunnettBuilderData = {
  scenario: string;
  parents: [Parent, Parent];
  gridSize: 2 | 4;                  // 2 = monohybrid, 4 = dihybrid
  phenotypeMap: Record<string, {    // genotype → phenotype
    label: string;
    color: string;
    icon?: string;
  }>;
  question: PunnettQuestion;
  notes?: string;                   // shown in feedback
};

type Parent = {
  label: string;
  alleles: string[];                // e.g. ['P', 'p'] or ['Iᴬ', 'i']
};

type PunnettQuestion =
  | { kind: 'ratio'; targetPhenotype: string; expected: string }   // "3:1"
  | { kind: 'percentage'; targetPhenotype: string; expected: number }
  | { kind: 'count-of-N'; targetPhenotype: string; expected: number };
```

Correctness: engine reads the student's filled grid and computes the ratio. Compares to expected. Tolerant of equivalent expressions ("3:1" ≡ "75%" ≡ "3 out of 4").

## Reveal & feedback design

- **Live tally**: phenotype counts update on every cell click. This is the *whole experience*.
- **Auto-fill is honest**: the cells auto-combine alleles deterministically. The student can't "build a wrong square" by miscombining — the *combining rule* is the grid's behavior, and that rule is itself the lesson.
- **On submit**: the canonical phenotype distribution overlays as faint percentage labels in each cell. The student sees their assignment vs. canonical at a glance.
- **Etymology card**: relevant terms (homozygous, heterozygous, codominant, allele) get root + mnemonic via the speed-reveal pattern.

## Variations

- **Backwards mode**: given the ratios, infer the parents' genotypes. The student drags candidate parent genotypes until the resulting grid produces the target ratios. Pure inverse reasoning.
- **Three-allele systems**: blood type lets the student work with codominance + recessive in the same grid (IᴬIᴮ × Iᴮi). Engine handles ≥3 alleles per locus.
- **Pedigree compatibility check** (cross-references game type 09): given a Punnett-built prediction, the student verifies it against the family pedigree two screens later.

## Anti-patterns

- **Pre-filled grid**: defeats the entire game. The student must *do the filling*.
- **No live tally**: the student should never have to count cells manually. The tally is the feedback signal.
- **Hidden phenotype mapping**: genotype→phenotype must be visible at all times in a small legend; otherwise the student is guessing under uncertainty about both biology AND symbol convention.
- **Wrong genotype symbols**: use the field-standard symbols (P/p, I superscript A/B, Xᴮ/Xᵇ). Mismatched notation breaks transfer to the textbook.

## Authoring notes

- For dihybrid (4×4), heavily emphasize the *independent assortment* powerful idea in the reveal. That's the take-home from a 4×4 vs a 2×2.
- Always provide the legend (icon + color per phenotype). Color-blind-safe palettes only — use icons too, never color alone.
- The `notes` field is a good place for "real-world hooks" — Mendel's pea data, ABO transfusion implications, etc. Surface them in the feedback panel.
