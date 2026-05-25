# 14 — Debug The Claim

**One-liner**: A confident-looking textbook paragraph hides a conceptual bug — click the bug, name it, fix it.

## Papert principles embodied

- **Debugging is the central act of learning**: Papert wrote that "the question to ask… is not whether [a child] knows the right answer to a question, but whether s/he knows what to do to find out." This game type asks the student to *find what's wrong* — pure debugging.
- **Powerful ideas**: a single mis-framed sentence can lock in a wrong intuition for years. Surfacing these classic textbook misconceptions makes them visible and exorcisable.
- **Microworld**: the paragraph is a tiny artifact. The bug is local, findable, namable.
- **Cultural presence**: many of the bugs come from real textbooks and real public-discourse confusions ("survival of the fittest means the strongest"). Putting them on screen and tearing them down has cultural weight.

## What the student does

1. A short paragraph appears, written in confident textbook prose. Two to four sentences. It contains exactly one *significant* conceptual bug.
2. The student reads, then **clicks the bug** — the offending word, phrase, or sentence.
3. A bug-classification panel appears: which kind of bug?
   - `Lamarckian sneak` (acquired traits being inherited)
   - `Teleology` ("evolution wants X" / "the species needs Y")
   - `Progress fallacy` ("higher" species, evolution heading somewhere)
   - `Strong vs fit confusion` ("strongest survives")
   - `Confused vocabulary` (e.g., "theory" used colloquially)
   - `Causal direction reversed` (effect labeled as cause)
   - `Scale confusion` (individual vs population vs species)
4. The student picks a classification. If wrong, gentle hint: "Read the third sentence again — what is being attributed to whom?"
5. The student then writes a **one-sentence fix** (or picks from candidate rewrites). Engine grades for inclusion of the right correction.

## Biology examples

**The Lamarckian sneak**: *"Giraffes have long necks because their ancestors stretched to reach high leaves, and this lengthening was passed to their offspring."* Bug: acquired traits inherited. Fix: variation existed first; long-necked giraffes survived better.

**Teleology**: *"Bacteria evolved antibiotic resistance to survive penicillin treatment."* Bug: bacteria didn't "want to" survive; mutations were random; selection retained the lucky resistant ones. Fix: "Mutations conferring resistance pre-existed in the population; antibiotics selected for them."

**Progress fallacy**: *"Mammals evolved from primitive reptiles to become more advanced."* Bug: no "primitive" or "advanced"; lineages are differently adapted, not on a ladder.

**Strong-vs-fit**: *"In natural selection, the strongest organisms survive."* Bug: "fittest" means best-reproducing in the *current* environment, not strongest. A camouflaged moth is fit; a strong-but-visible moth is dead.

**Theory vs theory**: *"Evolution is just a theory."* Bug: colloquial "theory" ≠ scientific theory. Fix: scientific theories are explanatory frameworks supported by evidence; gravity is also "just a theory."

**Direction reversed**: *"Animals get fur to stay warm in cold environments."* Bug: animals don't "get" traits to fulfill a need; cold environments select for furred ancestors. Fix: "Animals with denser fur survived cold environments and out-reproduced; descendants inherited the trait."

**Scale confusion**: *"During the ice age, a polar bear adapted by growing thicker fur."* Bug: individuals don't adapt; populations evolve across generations. The lone polar bear didn't grow anything.

## Template data shape

```ts
type DebugTheClaimData = {
  paragraph: string;                // the buggy text
  bugSpan: { start: number; end: number };   // character indices of the bug
  bugClass: BugClass;               // the canonical classification
  hint: string;                     // shown after one wrong click
  correctFix: {
    rubric: string[];               // must include phrases or concepts in the student's fix
    canonical: string;              // the model fix sentence
    candidateRewrites?: string[];   // for multiple-choice fix mode
  };
  poweredIdea: string;
};

type BugClass =
  | 'lamarckian-sneak'
  | 'teleology'
  | 'progress-fallacy'
  | 'strong-vs-fit'
  | 'confused-vocabulary'
  | 'causal-direction-reversed'
  | 'scale-confusion'
  | 'other';
```

## Reveal & feedback design

- **Click-to-highlight**: the student clicks anywhere in the paragraph; the engine snaps to the nearest *meaningful unit* (word, phrase) so they don't have to be pixel-precise.
- **Wrong-click feedback**: "That phrase is fine. The bug is somewhere in this paragraph." A gentle nudge, not a strike.
- **Reveal-and-rewrite**: after correct classification, the engine highlights the bug in red and shows the canonical fix beside the original. The student then writes their own fix and the engine grades against the rubric.
- **Powered-idea reveal**: a one-line "lesson learned" — "Lamarck wasn't crazy; he just thought the wrong thing. Catching his ghost in modern writing keeps your evolutionary thinking clean."
- **Etymology card**: relevant terms (*teleology* from Greek *telos*, *Lamarckian*, *adaptive*) fire the speed-reveal mnemonic.

## Variations

- **Two-bug paragraph**: an advanced mode with two bugs. The student must find and classify both.
- **Source-attributed bugs**: pull actual sentences from real textbooks (with citation) so the student sees that textbook ≠ unimpeachable.
- **Peer-debug**: the student's own previous fix is shown back later and they must check whether *they* introduced a new bug. Meta.

## Anti-patterns

- **Bug too subtle**: if a careful reader has to squint, the bug isn't pedagogically useful. The bug should be a *common* misconception, vividly stated.
- **Bug isn't actually wrong**: never include "bugs" that are merely simplifications acceptable in some contexts. Bugs must be *clear* misconceptions.
- **Single-click classification skipped**: skipping the classification reduces this to spot-the-typo. The classification IS the lesson.
- **Punitive grading on fix**: the rubric should be generous about phrasing. Look for the *concept*, not the exact words.

## Authoring notes

- Mine real textbook prose, popular science articles, and student essays for authentic bugs. Cite the source if you copy.
- Write the canonical fix as a *better paragraph*, not just a corrected sentence — show what *good* explanation looks like by example.
- Keep paragraphs under 80 words. Longer paragraphs let the bug hide.
- For each `bugClass`, build up a small library across the curriculum so the student can see the *pattern* of that misconception across topics.
