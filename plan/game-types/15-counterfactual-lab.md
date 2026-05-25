# 15 — Counterfactual Lab

**One-liner**: Pick an alternate-history "what if" — *what if photosynthesis hadn't evolved?* — and reason your way through the cascade of consequences in order.

## Papert principles embodied

- **Powerful idea: contingency.** Evolution is not destiny. The actual history of life is *one* path through possibility space. Asking "what if" trains the student to see the contingencies in the real history.
- **Constructionism**: the student *builds* the cascade — drags consequence cards into a sequence, draws relationships between them.
- **Bricolage**: re-arrange the cascade until it reads coherently. Course-correct in dialogue with the materials.
- **Hard fun**: open-ended counterfactual reasoning has no single right answer; the student is doing real intellectual work that paleontologists do.

## What the student does

1. A counterfactual prompt: "**What if photosynthesis had never evolved?**"
2. A short context paragraph anchors the present-day reality: "Cyanobacteria evolved oxygenic photosynthesis ~2.7 billion years ago. Oxygen accumulated in the atmosphere over the next ~500 million years (the Great Oxygenation Event), enabling aerobic respiration and the ozone layer."
3. A deck of **consequence cards** appears, shuffled. Each card describes one downstream effect: `no oxygen atmosphere`, `no ozone layer`, `UV scours the surface`, `no aerobic respiration`, `no multicellular eukaryotes`, `no plants`, `no animals`, `extremophile-only biosphere`, `metabolic energy 10× lower`.
4. The student drags cards into a **cascade chain** in order of how they would unfold, with arrows between them.
5. The student then picks the **final state of Earth's biosphere** from candidate descriptions (e.g., "anaerobic microbial mats only," "biosphere collapse," "alternative oxidizer evolved").
6. The engine reveals the canonical scientific consensus — with citations to actual paleobiology papers — and shows where the student's chain matched, where it diverged, and where reasonable scientists disagree.

## Biology examples

**No photosynthesis** — above. The grand counterfactual.

**No Cambrian explosion** — what if body plans had stayed simple? Cascade: no predator-prey arms race → no skeletons → no fossils → biology stays microscopic and squishy for another billion years.

**No K-Pg asteroid** — dinosaurs persist, mammals stay small, primates never emerge, no humans. Tests how contingent our existence is.

**No endosymbiosis** — what if proto-mitochondria had stayed free-living? No eukaryotic energy budget → no large complex cells → bacteria and archaea forever.

**No land colonization** — what if plants never moved onto land at ~470 mya? Cascade: no rooted soils, no terrestrial animals, no insects, no tetrapods, no us.

**No nervous system** — sponges and jellyfish persist, but no centralized cognition. Tests what "behavior" means without neurons.

## Template data shape

```ts
type CounterfactualLabData = {
  prompt: string;
  context: string;                  // anchoring real-world background
  cards: ConsequenceCard[];
  canonicalChain: string[];         // ordered list of card ids (≥1 valid chain)
  alternateChains?: string[][];     // other defensible orderings
  finalStateOptions: Array<{
    label: string;
    canonical: boolean;
    explanation: string;
  }>;
  consensusNotes: string;           // shown in the reveal — citations + caveats
  poweredIdea: string;
};

type ConsequenceCard = {
  id: string;
  text: string;                     // the consequence claim
  depth: 'immediate' | 'near' | 'far';   // for the cascade visualization
  authoredJustification: string;    // for the per-card reveal
};
```

The engine evaluates the student's chain with a graph-distance metric against canonical (and any registered alternates), tolerant of reasonable reorderings within a depth tier.

## Reveal & feedback design

- **Chain visualization**: as the student places cards, arrows draw automatically between sequential cards. The cascade reads top-to-bottom or left-to-right.
- **Per-card hover**: hovering a card shows its `authoredJustification` — the canonical reasoning for that consequence's placement.
- **Reveal**: the canonical chain animates beside the student's. Matches glow green; reasonable variants glow blue ("scientists disagree on the ordering here"); errors glow amber with the canonical reasoning.
- **Consensus caveats**: the reveal includes "where biologists disagree" — students learn that science has *unresolved* questions, not just settled facts.
- **Powered-idea reveal**: "Life's actual history is one path among many that *could have* unfolded. Recognizing the alternatives makes the real history feel earned, not inevitable."

## Variations

- **Open writing mode**: instead of cards, the student writes a 3-paragraph essay describing the counterfactual cascade. Engine grades via rubric inclusion (key consequences mentioned). For advanced students.
- **Pair counterfactuals**: two simultaneous "what ifs" (no photosynthesis AND no endosymbiosis). Interaction effects.
- **Walk-back mode**: given a hypothetical present (e.g., "intelligent reptiles dominate Earth"), reason backward to what historical event must have differed. Inverse reasoning.

## Anti-patterns

- **Treating counterfactuals as having one right answer**: they don't. The reveal must explicitly say "reasonable people disagree on X, but most paleobiologists think Y because Z."
- **Cards without justification**: every consequence card must have an `authoredJustification` so the reveal can explain *why* it belongs where it does in canonical.
- **Glib alternate-history**: avoid "what if humans had evolved on Mars" framings. Counterfactuals should be *historically plausible* and tied to identifiable contingencies.
- **No citation**: counterfactual biology is grounded in real paleobiology. Cite Knoll, Lane, Nick Lane, etc. in the consensus notes when appropriate.

## Authoring notes

- These are the *most* expensive game-types to author well. Pick counterfactuals where the cascade is well-documented in the literature.
- Aim for 6-10 consequence cards. Fewer is trivial; more loses the cascade structure.
- Be honest about scientific uncertainty in the consensus notes. Pretending counterfactuals have settled answers teaches students that science is more settled than it is.
- Tie back to the powered-idea: every counterfactual should reveal one specific *contingency* in evolutionary history (oxygen rise, body plans, asteroid timing, endosymbiosis, land colonization).
