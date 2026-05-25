# evo-quest — Design Docs Index

> "The principal role of the Turtle is to serve as a model for other
> objects, yet to be invented." — Seymour Papert, *Mindstorms*

This folder is the design library for evo-quest. Pick your entry point
below; the docs are organized so an implementing agent can read *only*
what's relevant to the slice they're building, while a designer or
contributor can sweep the whole thing top to bottom.

## How the design docs are organized

```
plan/
├── design/
│   ├── index.md              ← you are here
│   ├── app.md                ← comprehensive single-read overview (36 sections)
│   ├── data-model.md         ← every Type + Zod schema
│   ├── storage.md            ← resume contract, migrations, recovery
│   ├── engine.md             ← session machine, template registry, selection
│   ├── achievements.md       ← topic-shaped design language + full catalog
│   ├── power-ups.md          ← full power-up catalog + balance
│   ├── authoring.md          ← three authoring paths + the AI prompt blurb
│   ├── aesthetic.md          ← design system reference
│   ├── accessibility.md      ← per-game-type a11y deep dive
│   ├── deployment.md         ← Cloudflare + Wrangler + GitHub Actions
│   └── testing.md            ← test strategy + invariant suite
├── game-types/
│   ├── 00-index.md           ← game-type index + shared QuizTemplate contract
│   └── 01..17-*.md           ← one file per quiz template kind
└── code-examples/
    ├── Evoquest.tsx          ← the speed-reveal mnemonic reference
    ├── history-roguelike.tsx ← the palace-walk reference
    └── biogenesis_protocol.html  ← the knowledge-unit/RPG reference
```

## Reading order by goal

### "I want the big picture in one sitting"

→ Read [`app.md`](./app.md) cover to cover (~30 minutes). Skim
[`game-types/00-index.md`](../game-types/00-index.md). Done.

### "I'm implementing the storage / resume layer"

→ [`storage.md`](./storage.md) is the contract. Then read
[`data-model.md`](./data-model.md) for type shapes and
[`testing.md`](./testing.md) for the invariant suite that must pass.

### "I'm building the play loop / quiz engine"

→ [`engine.md`](./engine.md) for the session state machine and selection
algorithms. Then pick the game types you're rendering from
[`../game-types/`](../game-types/). Cross-reference
[`data-model.md`](./data-model.md) for types.

### "I'm authoring content"

→ [`authoring.md`](./authoring.md) for the three paths (TypeScript / AI /
JSON) and the full AI prompt blurb. Then survey
[`../game-types/`](../game-types/) for the game types you'll author for.
Reference [`achievements.md`](./achievements.md) for the topic-shaped
achievement design rules.

### "I'm designing a new game type"

→ Start with [`../game-types/00-index.md`](../game-types/00-index.md) for
the contract. Copy an existing file (e.g.
[`01-speed-reveal-mnemonic.md`](../game-types/01-speed-reveal-mnemonic.md))
as a template. Update [`engine.md`](./engine.md) registry rules if your
template needs new selection behavior.

### "I'm working on the visual/audio aesthetic"

→ [`aesthetic.md`](./aesthetic.md) covers color tokens, typography, motion
primitives, audio palette, per-Wing themes. App.md §16-18 is the summary;
this is the depth.

### "I'm setting up accessibility"

→ [`accessibility.md`](./accessibility.md) has keyboard maps per game type,
screen-reader announcement patterns, motion-reduction degradations,
dyslexia mode, drag-and-drop accessibility.

### "I'm wiring up Cloudflare / CI"

→ [`deployment.md`](./deployment.md) for Wrangler config, GitHub Actions
YAML, preview deployments, secret management.

### "I'm running the Papert / Kay litmus tests on a feature"

→ App.md §§34-35. The full checklists are at the end of the main doc.

## Source-of-truth hierarchy

When docs disagree:

1. **The game-type design specs** ([`../game-types/`](../game-types/)) are
   authoritative for any quiz template's mechanics, data shape, and
   reveal design.
2. **The data-model doc** ([`data-model.md`](./data-model.md)) is
   authoritative for any TypeScript / Zod type shape.
3. **The storage doc** ([`storage.md`](./storage.md)) is authoritative
   for any persistence-related concern.
4. **App.md** is the synthesized comprehensive view. When sections
   overlap, the deep-dive subfile wins for detail; app.md wins for
   high-level intent.

Update the deep-dive subfile *first*, then sync app.md, then code.

## Three docs that should never go stale

Three docs commit the project to specific external surfaces. Treat them
as contracts:

- [`storage.md`](./storage.md) — the resume contract. A broken contract
  here makes a real user lose real work. Any change requires a migration.
- [`data-model.md`](./data-model.md) — the type contract. Imported
  content is validated against these schemas. Renaming a field is a
  breaking change for every user-imported module.
- [`../game-types/00-index.md`](../game-types/00-index.md) — the quiz
  template kind registry. Renaming a `kind` orphans every saved attempt
  log entry for that kind.

`AGENTS.md` (in the repo root once the project is scaffolded) restates
these contracts in shorter form as guardrails for future automated
modifications.

## Voice & copy invariants

A non-negotiable rule for every piece of user-facing text. The app
*does* the work; it does not narrate itself. The student gets to form
their own opinion.

1. **Never name the app inside the experience.** No "Welcome to
   evo-quest", no "evo-quest is built for…". The product name belongs
   on the About page and the install/share surfaces only.
2. **Never list features in the UI.** No taglines under the title
   ("Active Recall · Latin Roots · Mnemonics"). The grid, the
   speed-reveal, the etymology card *are* the demo. Words about them
   would be redundant noise.
3. **Never use internal feature names with the student.** Briefing
   cards show the *topic* (the unit's emoji + shortLabel), never the
   game type's name ("Speed Reveal Mnemonic", "Punnett Builder").
   Developer-facing names stay developer-facing.
4. **Never praise the app or its features.** No "amazing",
   "wonderful", "the best way to learn". Let the experience earn
   judgement; don't pre-judge for the student.
5. **Never praise the student in feature-flavored terms.** "Great job
   using our power-up!" — never. Achievement flavors narrate *the
   idea*; never the student's act of getting it right.
6. **The About page is the one exception.** Naming, describing,
   citing inspirations, and listing design choices live at `/about`
   and only there. Even there: factual and short.

These rules are reinforced in:

- [`achievements.md`](./achievements.md) §9 (anti-patterns)
- `app.md` §4.4 (copy invariant on game-type names)
- `app.md` §8.1 (home page has no tagline)
- `app.md` §21 (onboarding shows the work, doesn't describe it)

## Inspirations and primary sources

- Papert, S. (1980, 2nd ed. 1993). *Mindstorms: Children, Computers, and
  Powerful Ideas.* Basic Books.
- Papert, S. (1993). *The Children's Machine.* Basic Books.
- Papert, S. (2002). [*Hard Fun*](http://papert.org/articles/HardFun.html).
- Papert, S. ["Situating Constructionism"](https://dailypapert.com/situating-constructionism/).
- Kay, A. (1972). *A Personal Computer for Children of All Ages.*
- Kay, A. (1993). *The Early History of Smalltalk.*

## Reference code in `plan/code-examples/`

The three files in `plan/code-examples/` are the design ancestors of
evo-quest:

- [`Evoquest.tsx`](../code-examples/Evoquest.tsx) — the speed-reveal
  mnemonic pattern, etymology card, and 5 initial quiz types. Most of
  the home/play/feedback aesthetic comes from here.
- [`history-roguelike.tsx`](../code-examples/history-roguelike.tsx) — the
  palace-walk grid-microworld pattern: movement triggers questions,
  items reward exploration.
- [`biogenesis_protocol.html`](../code-examples/biogenesis_protocol.html) —
  the knowledge-unit data shape (teach + puzzle + lore + skill), the
  skill-tree progression, the wave + power-up RPG framing, the WebAudio
  feedback stings, and the full localStorage save/load pattern.

When in doubt about "what does this look like in motion?" — open one of
these and play.
