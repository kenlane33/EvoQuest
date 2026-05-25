# 16 — Cladogram Crafter

**One-liner**: Given a trait table for several organisms, drag them onto a branching tree so that shared traits cluster — and the engine grades by *parsimony* (fewest evolutionary changes).

## Papert principles embodied

- **Constructionism**: the tree is built by the student. The dragging and re-arranging is the thinking.
- **Powerful idea**: phylogeny is *inferred from shared derived characters*, and the most parsimonious tree (fewest character-state changes) is the best hypothesis. Once a student internalizes parsimony, they can read any cladogram.
- **Microworld**: a few organisms (4-6) and a few traits (5-10). Tiny world, rich rules.
- **Debugging**: when the engine reports a parsimony score, the student can move organisms around and watch the score change. The score *is* the bug report.

## What the student does

1. A trait table appears at the top:

   ```
                Hair  Vertebrae  Lungs  Feathers  Amniotic Egg
   Shark         0       1         0       0          0
   Frog          0       1         1       0          0
   Lizard        0       1         1       0          1
   Sparrow       0       1         1       1          1
   Mouse         1       1         1       0          1
   Lancelet      0       0         0       0          0     (outgroup)
   ```

2. A blank branching tree skeleton sits below — a few node-junctions and leaf-slots. The student drags organism chips into the leaf positions.
3. As the student arranges, the engine annotates internal nodes with the *traits gained* at that node ("Vertebrae appears here").
4. A **parsimony score** updates live: number of independent trait-state changes across the tree. Lower is better.
5. The student rearranges until they minimize the score. The engine confirms when they reach the most parsimonious topology (or one of multiple equally-parsimonious topologies).
6. Reveal: the canonical phylogeny with synapomorphies labeled (e.g., "amniotic egg = synapomorphy uniting reptiles, birds, mammals"). Etymology mnemonic for *synapomorphy* fires.

## Biology examples

**Tetrapod origins** (above) — classic teaching set: shark, frog, lizard, sparrow, mouse, lancelet outgroup.

**Mammal orders** — primates, rodents, cetaceans, bats, marsupials. Traits: placenta, hair, milk, echolocation, brain-body ratio.

**Insects** — fly, ant, bee, butterfly, mosquito. Traits: number of wings, sting, eusociality, holometabolous metamorphosis.

**Angiosperm divisions** — grass, oak, rose, water lily, sunflower. Traits: monocot vs dicot, flower symmetry, leaf venation.

**Hominins** — *Australopithecus*, *Homo habilis*, *Homo erectus*, *Homo neanderthalensis*, *Homo sapiens*. Traits: bipedalism, brain volume, tool use. The drama is in *us*.

## Template data shape

```ts
type CladogramCrafterData = {
  taxa: Taxon[];                    // includes the outgroup
  outgroupId: string;
  traits: Trait[];
  traitMatrix: Record<string, Record<string, 0 | 1>>;  // taxon id → trait id → state
  canonicalTopologies: string[];    // Newick-format trees of equally parsimonious solutions
  canonicalParsimonyScore: number;
  synapomorphies: Array<{           // for the reveal
    cladeMembers: string[];
    trait: string;
    label: string;
  }>;
  poweredIdea: string;
};

type Taxon = { id: string; name: string; icon?: string; isOutgroup?: boolean };
type Trait = { id: string; label: string };
```

The engine handles Newick parsing and parsimony scoring (Fitch algorithm) — well-known, ~50 LOC.

## Reveal & feedback design

- **Live parsimony score**: visible top-right. Updates on every drag. The score going down is the most satisfying feedback in the app.
- **Node annotations**: internal nodes auto-label with traits gained/lost beneath them. The student sees the *evolutionary history* their tree implies.
- **Trait-by-trait coloring**: a small toggle lets the student color the tree by one trait at a time. Watch how that trait maps onto their tree — does it appear once (parsimonious) or multiple times (homoplasy)?
- **Reveal on parsimony**: the canonical tree(s) are drawn beside the student's. Synapomorphies are highlighted with the etymology card sliding in for *synapomorphy* (Greek: *syn* + *apo* + *morphē* — "together off from form").

## Variations

- **Multiple-outgroup mode**: provide two outgroup options. Picking the right outgroup is itself the puzzle (advanced).
- **Molecular data mode**: instead of morphological traits, use DNA sequence similarity. Same parsimony idea, different data type.
- **Conflict resolution**: present a dataset where two traits give conflicting trees. The student picks which trait is the *homoplasy* (independently evolved). Real systematic biology.
- **Build the matrix**: give the student a set of organism photos; *they* score the traits. Tests observation skill.

## Anti-patterns

- **Too many taxa**: more than 7 leaves explodes the topology space. Keep small.
- **Hiding the score**: the parsimony score is the *driving feedback*. It must be visible.
- **No outgroup**: an unrooted tree leaves the student lost. Always include an outgroup, and tell the student which it is.
- **Treating cladograms as fact, not hypothesis**: phylogenies are hypotheses, sometimes revised. The reveal should note where the canonical tree is contested (e.g., placement of cetaceans within Artiodactyla).

## Authoring notes

- Hand-build the trait matrix so that there is one *clearly* most-parsimonious topology, but include 1-2 traits that conflict to motivate the discussion of homoplasy.
- Always include the outgroup; it roots the tree and gives the parsimony scoring something to anchor against.
- The synapomorphies are the *take-home lesson*. Each one is a "powerful idea" — write the labels carefully ("Amniotic egg: a portable pond that freed vertebrates from water for reproduction.").
- Use real organism icons or simple silhouettes — students remember trees better when leaves are recognizable.
