# 09 — Pedigree Detective

**One-liner**: Propose an inheritance-pattern hypothesis; the engine tests it against the family tree's data; the student debugs the hypothesis when it fails.

## Papert principles embodied

- **Debugging hypotheses**: the *whole* mechanic is "guess what's wrong and fix it." Wrong hypotheses don't get a red X — they get a *counter-example individual* the engine highlights for the student to consider.
- **Powerful idea**: a genetic hypothesis is a *theory* that must be consistent with *every* observation. One inconsistent member of the family tree falsifies the whole hypothesis. Falsifiability made physical.
- **Constructionism (light)**: the student annotates the pedigree with their predicted carrier markings — they're building a labeled artifact.
- **Hard fun**: real geneticists do this. The student is doing the actual job.

## What the student does

1. A pedigree (family tree) renders — squares for males, circles for females, filled = affected, half-filled = carrier (initially hidden), generations stacked vertically.
2. The student is told the trait being tracked ("polydactyly" or "hemophilia" or "PKU") with no further hints.
3. A panel of hypothesis chips appears below: `Autosomal Dominant`, `Autosomal Recessive`, `X-linked Dominant`, `X-linked Recessive`, `Y-linked`, `Mitochondrial`.
4. The student picks a hypothesis chip. The engine runs a consistency check across every member and marks **any contradiction** with a pulsing red outline ("This person is unaffected but both parents are affected — under your hypothesis, that's impossible.").
5. The student can then either change hypotheses OR annotate carrier states they think *would* make the hypothesis consistent. The engine re-evaluates.
6. When the hypothesis is consistent with the data AND the carrier annotations match canonical, the puzzle is solved. The engine reveals the underlying biology in a one-line "powerful idea" ("X-linked recessive: more males affected, mothers transmit silently to half their sons.").

## Biology examples

**Hemophilia** — X-linked recessive. Classic Romanov family pedigree as a real-world hook.

**Huntington's disease** — autosomal dominant. Every affected person has an affected parent; ~50% inheritance.

**Cystic fibrosis** — autosomal recessive. Two unaffected parents have an affected child — the carrier insight.

**Leber's hereditary optic neuropathy** — mitochondrial. *All* children of affected mothers are affected; *no* children of affected fathers are. The asymmetry is the giveaway.

**Color blindness** — X-linked recessive. Mostly males affected; carrier mothers; granddads pass to grandsons through unaffected daughters.

## Template data shape

```ts
type PedigreeDetectiveData = {
  traitLabel: string;             // shown to student
  generations: Generation[];
  canonical: {
    pattern: InheritancePattern;
    carriers: string[];           // person ids that should be marked carrier
    poweredIdea: string;
  };
  hints?: string[];               // released on incorrect attempts, progressively
};

type Generation = { id: 'I' | 'II' | 'III' | 'IV'; people: Person[] };

type Person = {
  id: string;
  sex: 'M' | 'F';
  affected: boolean;
  parents?: [string, string];
  partner?: string;
  notes?: string;                 // "deceased, age 12" etc.
};

type InheritancePattern =
  | 'autosomal-dominant' | 'autosomal-recessive'
  | 'x-linked-dominant' | 'x-linked-recessive'
  | 'y-linked' | 'mitochondrial';
```

The consistency-checker is a deterministic function: `(pattern, carrierAnnotations, pedigree) => Inconsistency[]`. Each `Inconsistency` carries a person id and an explanation.

## Reveal & feedback design

- **Pulsing contradictions**: when a hypothesis is inconsistent, the offending individuals glow red. Hovering shows the contradiction sentence — "Under autosomal dominant, affected fathers must produce affected children in expectation. Person III-4 is unaffected — that violates the hypothesis." This is the *bug report* the student must read.
- **Annotation persistence**: carrier annotations persist across hypothesis changes so the student can iterate.
- **Hints ladder**: after 3 failed hypothesis selections, the engine offers a hint ("Count the affected by sex…"). Progressive, never spoiled.
- **Reveal on solve**: the canonical carrier states animate in. The "powerful idea" appears beneath the pedigree.
- **Etymology card**: terms like *autosomal*, *heterozygote*, *carrier* fire the speed-reveal mnemonic on first encounter.

## Variations

- **Multi-trait pedigree**: one family, two co-segregating traits. The student must hypothesize independently for each, then notice if they're linked. Advanced.
- **Predict the next child**: given a confirmed pattern, predict the next generation's risk percentages. Bridges into Punnett-builder.
- **Real-history families**: Hapsburg (autosomal recessive jaw), Romanovs (X-linked hemophilia), Charles Darwin's family. Cultural-presence Papert criterion satisfied.

## Anti-patterns

- **Hypothesis is given**: collapses the game into "annotate carriers." The hypothesis-search is the whole point.
- **Engine reveals contradictions silently**: every contradiction must come with the *biological reason* it's a contradiction. Otherwise the student learns nothing from being wrong.
- **One-attempt mode**: the student must be able to iterate freely. Pedigree puzzles are about hypothesis-revision.
- **Pedigrees with <5 people**: too few constraints; multiple patterns are consistent. Aim for 8-15 people across 3-4 generations.

## Authoring notes

- Hand-design pedigrees that are *uniquely* consistent with one pattern. Run the consistency checker against all six patterns yourself and confirm exactly one passes.
- The "ah-ha" individuals (the affected daughter of two carriers, the male-only affected line) are the *teachers*. Make sure your pedigree has at least one of these.
- Person notes ("died young", "from outside the family") let you encode plausible deniability without breaking the puzzle.
