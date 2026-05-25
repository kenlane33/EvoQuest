# 11 — Mutation Lab

**One-liner**: Apply a mutation to a DNA sequence with your own hand, *predict* what the protein becomes, then watch the codon table reveal it letter by letter.

## Papert principles embodied

- **Debugging the genetic program**: DNA *is* a program. Mutations are edits to the program. The student is literally debugging biology's source code — the most Papertian framing possible.
- **Microworld**: a tiny 30-60 base sequence with a codon table and a protein readout. Three objects. Tiny rules. Discovery-rich.
- **Predict-run-reflect (composes with game type 04)**: the student commits a prediction before the engine translates.
- **Powerful idea**: mutations have *categories* (silent, missense, nonsense, frameshift) whose names *describe* their effects. The category emerges from the edit, not from memorization.

## What the student does

1. A short DNA sequence appears, divided into codons with light vertical guides: `ATG | TTT | GGC | AAG | TAA`.
2. Below it, the canonical mRNA, then the canonical protein: `Met-Phe-Gly-Lys-STOP`.
3. A toolbar offers mutation operations:
   - **Substitute** a single base (click a base, pick A/T/G/C)
   - **Insert** a base (click between bases, pick A/T/G/C)
   - **Delete** a base (click a base, hit delete)
4. The student applies one mutation. The mRNA below highlights the changed region but does NOT yet show the new protein.
5. **Predict phase**: the student picks the predicted effect from chips: `Silent`, `Missense`, `Nonsense`, `Frameshift`, `In-frame insertion`. Optionally types the predicted new protein.
6. The codon table animates the translation — codon by codon, the protein letters appear. The student watches their prediction collide with the truth.
7. The mutation type is named in big letters: "**FRAMESHIFT.**" Etymology mnemonic fires for the term. Reflect panel shows: "Your prediction matched / differed because…"

## Biology examples

**Sickle cell** — GAG → GTG, glutamate → valine. Classic missense. The student sees that a single base change can be catastrophic AND that it's also been retained in populations because of malaria resistance — a powerful contingency lesson.

**Premature stop** — substitute mid-protein to create a TAA/TAG/TGA. Truncated protein. Nonsense mutation.

**Frameshift** — insert one base near the start. Every downstream codon shifts. Usually catastrophic loss-of-function. Compare with in-frame 3-base insertion which adds one amino acid.

**Silent mutation** — wobble position substitution that doesn't change the amino acid. Teaches the *redundancy* of the genetic code.

**Trinucleotide repeat expansion** — Huntington's CAG repeats. Same mutation type (insertion) but in copies; advanced mode.

## Template data shape

```ts
type MutationLabData = {
  startSequence: string;            // DNA, multiple of 3, with start (ATG) and stop
  startProtein: string;             // canonical translation, as 3-letter or 1-letter
  scenario: string;                 // "Sickle cell mutation site"
  allowedOperations: Array<'substitute' | 'insert' | 'delete'>;
  prediction: {
    chooseType: boolean;            // require choosing a mutation type
    typeProtein: boolean;           // require typing predicted protein
  };
  goalMutation?: {                  // optional: the student must achieve a specific mutation
    fromBase: number;
    toBase: number;
    description: string;
  };
  poweredIdea: string;
};
```

The codon table is a shared resource (`src/engine/genetics/codonTable.ts`); the engine handles translation deterministically.

## Reveal & feedback design

- **Codon-by-codon animation**: the new protein appears letter by letter as each codon is read. The student feels the ribosome's tempo.
- **Side-by-side compare**: original protein and mutated protein stay on screen together with differences highlighted.
- **Mutation type reveal**: the type name fires the speed-reveal mnemonic — *frameshift* (`frame` + `shift`), *missense* (`miss` + `sense`), *nonsense* (`non` + `sense`).
- **Real-world hook**: every lab session ends with a one-line clinical or evolutionary connection ("This is the mutation in sickle cell anemia — heterozygotes are malaria-resistant.").

## Variations

- **Reverse engineering**: given a mutated protein, find the mutation in the DNA. Inverse problem; harder.
- **Multi-mutation**: apply two mutations and predict the *combined* effect. Sometimes silent + missense → restoration; sometimes catastrophic.
- **Repair tools**: introduce CRISPR-style "edit back" operations. The student debugs *to* the canonical sequence.
- **Codon table puzzle mode**: the table is hidden; the student must deduce it from observed translations. Discovery learning.

## Anti-patterns

- **Codon table always blank**: students need the table visible, at least until they've internalized the four most common codons. Hiding it makes this a memorization quiz, not a microworld.
- **No prediction phase**: skipping prediction collapses this into "watch the engine translate." The whole point is the student's prior model meeting reality.
- **Sequences without ATG and stop**: students should always see complete ORFs so they internalize "start codon, codons, stop codon."
- **One-shot scoring**: the student should be able to apply mutations freely and observe — making mutation a thing they *play* with, not a thing they're tested on once.

## Authoring notes

- Keep starting sequences under 30 codons. Anything longer drowns the visual.
- Use real disease-causing mutations as the canonical "scenarios" — sickle cell, CF ΔF508, Tay-Sachs HEXA, BRCA1. They carry cultural presence.
- Always name the resulting protein change in three notation forms: `Glu6Val`, `E6V`, "glutamate at position 6 became valine." Cross-referencing notations is its own lesson.
