# 01 — Speed-Reveal Mnemonic

**One-liner**: The Latin/Greek root stays in plain sight; the mnemonic itself un-masks character-by-character in *shuffled* order over five seconds — irresistible to read, impossible to ignore.

## Papert principles embodied

- **Microworld**: a tiny safe place to dwell with one term — the only thing happening on screen is the term and its scaffolding.
- **Discovery-rich**: knowledge nuggets (root + mnemonic) are *revealed* by the world's own rules, not lectured. The student feels they're catching them as they appear.
- **Hard fun**: there's a 6-second clock. The pressure isn't from the answer, it's from the *mnemonic about to bloom* — and you want to see it.
- **No score-shame**: even if the student answers correctly before reveal, the mnemonic *still* plays out. Reward and reinforcement are coupled.

## What the student does

1. Question appears (any answer modality — multiple choice, fill, etc.). Etymology card sits below with the **root visible** ("Greek: endo + sym + bios").
2. A 6-second countdown bar drains. Mnemonic placeholder shows `░░░░░ ░░ ░░░░░░░░...` in dim violet.
3. At t=0, characters begin un-masking in **random order**, one every ~30-60ms across 5s. Each revealed char briefly glows amber with a text-shadow.
4. Student can answer at any time. **Answering does not stop the reveal** — it accelerates it to instant completion, so the student always sees the full mnemonic before moving on.
5. Feedback panel re-shows the etymology + the full mnemonic statically.

## Biology examples

**endosymbiosis** (the canonical case from `Evoquest.tsx`):

- Root: *Greek: endo (within) + sym (together) + bios (life)*
- Mnemonic: *"ENDO=INSIDE. SYM=TOGETHER. Prokaryotes moved IN and stayed — roommates for 2 billion years."*

**phenotype**:

- Root: *Greek: phainein (to show) + typos (impression)*
- Mnemonic: *"PHENO → PHONE → what you could PHONE home about because you can SEE it. Observable traits."*

**allopatric** vs **sympatric** speciation as a paired reveal:

- Root: *Greek: allos (other) / syn (together) + patris (fatherland)*
- Mnemonic: *"ALLO=OTHER LAND, SYM=SAME LAND — both broke up, different addresses."*

## Template data shape

```ts
type SpeedRevealData = {
  termId: string;                  // stable ID into the etymology DB
  root: string;                    // e.g. "Greek: endo + sym + bios"
  mnemonic: string;                // the unmaskable line
  question: InnerQuestion;         // any other template type can nest here as the answer modality
  countdownMs?: number;            // default 6000
  revealMs?: number;               // default 5000
};

type InnerQuestion =
  | { kind: 'multiple-choice'; prompt: string; options: string[]; correctIndex: number }
  | { kind: 'fill'; prompt: string; acceptable: string[]; hint?: string };
```

## Reveal & feedback design

The reveal *is* this game type's whole point. Two reveal phases:

- **Pre-answer**: the speed-reveal pattern above. The mnemonic blooms whether or not the student has committed.
- **Post-answer**: feedback shows a stationary card with root + full mnemonic + a short "powerful idea" tag ("Endosymbiosis is the powerful idea that *cells can be made of older cells*.").

## Variations

- **Reverse mode**: show the mnemonic, ask for the term. (Use sparingly — it's a different cognitive load.)
- **Multi-mnemonic**: some terms benefit from two mnemonics (visual + verbal). Cycle them across encounters.
- **Pair reveal**: show two related terms side-by-side (allopatric/sympatric), both reveal simultaneously, so the *contrast* is the lesson.

## Anti-patterns

- **Reveal blocks input**: never. The reveal is ambient, not modal.
- **Mnemonic is just a definition**: a true mnemonic uses *image*, *sound*, or *body* to bind the term to memory. A flat restatement defeats the purpose.
- **Etymology is buried**: the root must always be on screen during the question, not hidden behind a "show hint" button.
- **Random char order is *too* random**: the shuffle should be uniform but the *interval* between reveals should be steady — predictable timing reduces cognitive load on the un-masking itself.

## Authoring notes

- Mnemonics are the most expensive content to write well. Allow ≥3 minutes per term. The mnemonic must invoke a vivid image or a familiar word the student already knows.
- Use ALL CAPS for the morpheme→hook mapping inside the mnemonic so the eye latches on. The reveal animation already makes individual chars salient, but the human grammar of "ENDO=INSIDE" helps the brain index it.
- Keep mnemonics under ~140 chars so the reveal completes inside the 5-second budget at a comfortable per-char interval.
