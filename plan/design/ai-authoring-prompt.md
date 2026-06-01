# AI authoring prompt guide

Self-contained reference for turning **notes, presentation text, example
questions, or a topic outline** into evo-quest `ContentModule` JSON.
Field names and exemplars match `src/types/schemas.ts` and
`src/engine/templates/`.

> **Refresh from code:** `SYNC_AI_AUTHORING_DOC=1 bun run test src/content/authoring/emit-reference-prompt.test.ts`

---

## Quick workflow

1. Replace the `{{…}}` placeholders in [Copy-paste prompt](#copy-paste-prompt) below
   (or use **Content → Format reference** in the app to fill them automatically).
2. Paste the prompt into an external chat (ChatGPT, Claude, Gemini, etc.).
3. The model replies with **only** raw JSON — no markdown fences, no commentary.
4. Paste that JSON into evo-quest import or a Cursor chat to merge into bundled content.

### Placeholders

| Token | Replace with |
|---|---|
| `{{TOPIC}}` | What the content is about |
| `{{MODULE_TITLE}}` | Human module title (or same as topic) |
| `{{WING_ID_PREFIX}}` | Dotted ID prefix for units, e.g. `biochem.cells` |
| `{{MODULE_ID}}` | Module id: `mod.` + prefix with dots → hyphens + `.user` (e.g. `mod.biochem-cells.user`) |
| `{{AUTHOR}}` | Your handle (optional) |
| `{{SOURCE_MATERIAL}}` | Pasted notes, slides, questions, or outline |

### Source type (edit the `Interpretation (...)` line in the prompt)

| `sourceKind` | Use when |
|---|---|
| `notes` | Class notes or textbook excerpt |
| `presentation` | Slide deck text export |
| `example-questions` | Worksheet / EOC / quiz bank |
| `knowledge-outline` | Topic checklist to expand |

### Scope (edit the `Scope:` line in the prompt)

| Scope | Typical output |
|---|---|
| `single-unit` | One KnowledgeUnit |
| `drawer` | 3–6 units in one Drawer |
| `room` | 2–4 Drawers |
| `module` | Full wing sized to source |

---

## Zod schema reference (exact field names)

Source of truth: `src/types/schemas.ts`. ID patterns: tree nodes
`/^[a-z0-9.-]+$/`, unit ids `/^[a-z0-9-]+(\\.[a-z0-9-]+)+/`, slugs
`/^[a-z0-9-]+$/`.

### ContentModule

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | `mod.<prefix-with-hyphens>.user` — dots → hyphens (`biochem.cells` → `mod.biochem-cells.user`) |
| `title` | string | yes | ≤80 chars |
| `description` | string | yes | 1–2 sentences |
| `authorRef` | string | no | handle |
| `schemaVersion` | number | yes | always `1` |
| `appVersionAtAuthoring` | string | yes | e.g. `0.1.0` |
| `source` | `"bundled"` \| `"user-import"` | yes | use `"user-import"` for pasted content |
| `createdAt` | number | yes | Unix ms |
| `tree` | Wing[] | yes | see below |
| `etymologyContributions` | Morpheme[] | no | morphemes not in core registry |

### Wing / Room / Drawer (tree nodes)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | dotted, e.g. `biochem.cells` |
| `aliases` | string[] | no | |
| `slug` | string | yes | kebab-case |
| `title` | string | yes | ≤80 chars |
| `emoji` | string | no | topic-shaped |
| `description` | string | no | ≤280 chars |
| `children` | array | yes | Room[] / Drawer[] / KnowledgeUnit[] |

### KnowledgeUnit

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | `wing.room.drawer.slug` |
| `aliases` | string[] | no | |
| `slug` | string | yes | kebab-case |
| `title` | string | yes | ≤80 |
| `emoji` | string | yes | 1–8 chars, topic-shaped |
| `shortLabel` | string | yes | ≤14 chars |
| `longLabel` | string | yes | ≤40 chars |
| `description` | string | no | ≤280 |
| `teach` | TeachBlock | yes | see below |
| `quizzes` | QuizTemplate[] | yes | min 1 |
| `achievement` | Achievement | yes | see below |
| `prerequisites` | string[] | no | unit ids |
| `difficulty` | `intro` \| `core` \| `deep` | no | |
| `tags` | string[] | no | |
| `enabled` | boolean | yes | default `true` |
| `authorNotes` | string | no | source citations |

### TeachBlock

| Field | Type | Required | Notes |
|---|---|---|---|
| `headline` | string | yes | ≤60 |
| `body` | string | yes | markdown |
| `etymology` | Etymology | no | see below |
| `mnemonic` | string | no | ≤140, ALL-CAPS hooks |
| `poweredIdea` | string | yes | ≤120, one sentence |
| `imageUrl` | string | no | |
| `figures` | TeachFigure[] | no | `{ id, alt, caption? }` |
| `cite` | string[] | no | |

### Etymology / Morpheme

```json
{
  "termId": "term.endosymbiosis",
  "term": "endosymbiosis",
  "morphemes": [{ "morphemeId": "morph.endo", "asUsed": "endo" }],
  "rootSummary": "Greek: endo (within) + sym (together) + bios (life)"
}
```

`etymologyContributions[]` entry:

```json
{
  "id": "morph.endo",
  "morpheme": "endo-",
  "language": "Greek",
  "meaning": "within",
  "cousins": ["endoscope"],
  "appearsIn": ["term.endosymbiosis"]
}
```

`language`: `Greek` | `Latin` | `Old English` | `Other`

### Achievement

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | `ach.<unit-id>` |
| `emoji` | string | yes | topic-shaped; no 🏆 ⭐ 💯 🥇 |
| `shortLabel` | string | yes | |
| `longLabel` | string | yes | |
| `flavor` | string | yes | ≤140; narrates the idea |
| `wingId` | string | yes | top wing `id` |
| `hidden` | boolean | no | |
| `aggregate` | object | no | drawer/room/wing rollup |

### QuizTemplate (discriminated union on `kind`)

Every entry:

```json
{ "kind": "fill", "id": "quiz.stable.id", "preferred": true, "data": { } }
```

| `kind` | `data` schema | Play style |
|---|---|---|
| `fill` | `{ prompt, acceptable[], hint? }` | Cloze; prompt uses `_____` |
| `match` | `{ term, correct, distractors[] }` | Pick category |
| `scenario` | `{ story, question, answer, options[], explanation }` | MC with story |
| `speed-reveal-mnemonic` | `{ termId, root, mnemonic, question, countdownMs?, revealMs? }` | question is InnerQuestion |
| `recipe-sequencer` | RecipeSequencerData | Ordered steps |
| `etymology-puppet` | EtymologyPuppetData | Build term from morphemes |
| `debug-the-claim` | DebugTheClaimData | Find the bug |
| `punnett-builder` | PunnettBuilderData | Punnett square |
| `predict-run-reflect` | PredictRunReflectData | Predict → run → reflect |
| `be-the-turtle` | BeTheTurtleData | First-person choices |
| `mutation-lab` | MutationLabData | DNA edit |
| `food-web-builder` | FoodWebBuilderData | Trophic web |
| `microworld-sandbox` | MicroworldSandboxData | Parameter sliders |
| `pedigree-detective` | PedigreeDetectiveData | Inheritance pattern |
| `cladogram-crafter` | CladogramCrafterData | Phylogeny tree |
| `counterfactual-lab` | CounterfactualLabData | What-if chain |
| `procedure-builder` | ProcedureBuilderData | Drag procedure blocks |
| `concept-map-builder` | ConceptMapBuilderData | Concept graph |
| `palace-walk` | PalaceWalkData | Grid + totem questions |

**InnerQuestion** (inside `speed-reveal-mnemonic` and `palace-walk` totems):

- `{ kind: "fill", prompt, acceptable[], hint? }`
- `{ kind: "multiple-choice", prompt, options[], correctIndex }`

---

## Copy-paste prompt

Replace `{{…}}` placeholders, then send everything below to your external chat.

````text
# Role

You are an evo-quest content author. evo-quest is a biology learning app where each **KnowledgeUnit** teaches one idea and includes interactive quiz templates.

Your job: read the author's source material below and output **one valid JSON `ContentModule`** the app can import.

- Module title: {{MODULE_TITLE}}
- Topic focus: {{TOPIC}}
- Scope: drawer
- Author handle (optional): {{AUTHOR}}
- App schema version: 1

# Source material

Interpretation (notes):
The source is class notes or a textbook excerpt. Extract key terms, definitions, and relationships. Turn each major concept into a KnowledgeUnit with a teach block and 3–8 quiz questions grounded in the notes. Do not invent facts not supported by the source unless filling obvious gaps (mark those in authorNotes).

---
{{SOURCE_MATERIAL}}
---

# ContentModule (top level)

Return a single JSON object with this shape:

```json
{
  "id": "mod.<hyphenate-{{WING_ID_PREFIX}}>.user",
  "title": "string — human title, ≤80 chars",
  "description": "string — 1–2 sentences",
  "authorRef": "string — optional handle",
  "schemaVersion": 1,
  "appVersionAtAuthoring": "0.1.0",
  "source": "user-import",
  "createdAt": 1716595200000,
  "tree": [ /* Wing[] — see below */ ],
  "etymologyContributions": [ /* optional Morpheme[] for morphemes not in core */ ]
}
```

Module `id`: dots in the wing prefix become hyphens (e.g. `biochem.cells` → `mod.biochem-cells.user`).
Unit `id`s keep dots: `biochem.cells.membrane.transport`.

Use `createdAt` as current Unix time in milliseconds if you know it; otherwise use 1780317735426.

Suggested ID prefix for new units: `{{WING_ID_PREFIX}}` (dotted hierarchy, lowercase, immutable forever).

# Content tree

Hierarchy: **Wing → Room → Drawer → KnowledgeUnit**

Each tree node (Wing, Room, Drawer) shares:

```json
{
  "id": "dotted.id",
  "slug": "kebab-case",
  "title": "string ≤80",
  "emoji": "optional topic emoji",
  "description": "optional ≤280",
  "children": [ /* next level */ ]
}
```

## KnowledgeUnit

```json
{
  "id": "wing.room.drawer.slug",
  "slug": "kebab-case",
  "title": "string ≤80",
  "emoji": "topic-shaped — NOT trophy/star/medal",
  "shortLabel": "≤14 chars",
  "longLabel": "≤40 chars",
  "description": "optional ≤280",
  "teach": {
    "headline": "≤60 chars",
    "body": "markdown, 1–3 short paragraphs",
    "etymology": { "termId": "term.word", "term": "...", "morphemes": [{ "morphemeId": "morph.x", "asUsed": "..." }], "rootSummary": "Greek: ..." },
    "mnemonic": "optional ≤140 chars, ALL-CAPS morpheme hooks",
    "poweredIdea": "≤120 chars, one sentence",
    "figures": [{ "id": "figure_id", "alt": "accessible description", "caption": "optional" }]
  },
  "quizzes": [ /* ≥1 QuizTemplate — see next section */ ],
  "achievement": {
    "id": "ach.unit.id",
    "emoji": "same topic emoji as unit",
    "shortLabel": "1–2 words",
    "longLabel": "2–6 words",
    "flavor": "one present-tense second-person sentence narrating the IDEA ≤140 chars",
    "wingId": "top-level wing id"
  },
  "prerequisites": ["optional unit ids"],
  "difficulty": "intro | core | deep",
  "tags": ["optional"],
  "enabled": true,
  "authorNotes": "optional — cite source page or flag uncertain facts"
}
```

# Diagrams and figures

When a unit teaches a **structure, process, graph, or labeled diagram**, propose figure metadata even though SVG files are added separately by the author.

## When to include figures

Add `teach.figures` when the unit covers:

- Cell or organelle layouts (plant vs animal, prokaryote vs eukaryote)
- Cycles or pathways (cell cycle, nitrogen cycle, central dogma)
- Graphs students must read (enzyme activity, population curves)
- Comparison panels (evolution evidence, osmosis outcomes)
- Lab visuals (gel electrophoresis, karyotype, cladogram)

Skip figures for purely definitional vocabulary units with no visual anchor.

## teach.figures shape

```json
"figures": [
  {
    "id": "bio_eoc_plant_animal_cells",
    "alt": "Cross-sections of plant and animal cells with labeled organelles",
    "caption": "Optional short caption shown below the image"
  }
]
```

- `id`: stable kebab/snake identifier — **do not invent file URLs or paths**
- `alt`: full description for screen readers (what labels or panels exist)
- `caption`: optional; one line clarifying what to notice

## teach.body markdown

Reference the figure with a markdown image using a placeholder path the author will wire:

```markdown
![Cross-sections of plant and animal cells with labeled organelles](/content/bio-eoc/figures/bio_eoc_plant_animal_cells.svg)
```

The `id` in `figures[]` must match the filename (without extension).

## Diagram-backed quizzes

When a figure is central to the unit, include **at least one quiz** whose prompt references it:

- "In the diagram, the substrate binds at the _____."
- "From the graph, the optimum temperature is about _____°C."
- "On the cell cycle diagram, letter A is _____."

Phrases like *diagram*, *graph*, *figure*, or *in the diagram* let the app show the figure beside the question during play.

## authorNotes sourcing hint

If you propose a figure, add one line to `authorNotes`:

```
Figure needed: plant vs animal cell cross-section (Wikimedia CC-BY or self-author).
```

Do **not** embed binary SVG content in JSON — only metadata and the markdown image line.

# Quiz templates

Each quiz entry:

```json
{ "kind": "...", "id": "quiz.unique.stable.id", "preferred": true, "data": { ... } }
```

- `id` is stable forever; use dotted paths tied to the unit.
- `preferred: true` on the best fast-review question for that unit.
- Use **fill** for cloze prompts with `_____` (five underscores) as the blank.
- Prefer **fill**, **match**, and **scenario** for worksheet/EOC-style review.
- Add **speed-reveal-mnemonic** when a term has Greek/Latin roots worth memorizing.
- Use microworld kinds (recipe-sequencer, punnett-builder, etc.) only when the source teaches a process, diagram, or interactive model — not for every unit.

## Basic kinds (fast review)

## kind: "fill"
```json
{
  "kind": "fill",
  "id": "quiz.example.fill",
  "data": {
    "prompt": "The monomer of carbohydrates is a _____.",
    "acceptable": [
      "monosaccharide",
      "monosaccharides"
    ],
    "hint": "Single sugar unit"
  }
}
```

## kind: "match"
```json
{
  "kind": "match",
  "id": "quiz.example.match",
  "data": {
    "term": "Insulin",
    "correct": "Protein",
    "distractors": [
      "Carbohydrate",
      "Lipid",
      "Nucleic acid"
    ]
  }
}
```

## kind: "scenario"
```json
{
  "kind": "scenario",
  "id": "quiz.example.scenario",
  "data": {
    "story": "A student claims DNA is built from amino acids.",
    "question": "What macromolecule class is DNA?",
    "answer": "Nucleic acid",
    "options": [
      "Protein",
      "Nucleic acid",
      "Lipid",
      "Carbohydrate"
    ],
    "explanation": "DNA is a nucleic acid; amino acids are protein monomers."
  }
}
```

## Interactive kinds (microworld / constructionist)

## kind: "be-the-turtle"
```json
{
  "kind": "be-the-turtle",
  "id": "quiz.example.be-the-turtle",
  "data": {
    "roleTitle": "You are a glucose molecule",
    "setup": "You enter a muscle cell. Oxygen is available.",
    "startNodeId": "start",
    "nodes": [
      {
        "id": "start",
        "prompt": "Glycolysis splits you into pyruvate. What next?",
        "choices": [
          {
            "label": "Enter the mitochondrion — aerobic respiration",
            "nextNodeId": "aerobic",
            "biology": "Pyruvate crosses into the mitochondrial matrix.",
            "isOptimal": true,
            "fateTrail": "→ pyruvate"
          },
          {
            "label": "Stay in the cytoplasm — ferment",
            "nextNodeId": "anaerobic",
            "biology": "Without entering mitochondria, fermentation begins.",
            "fateTrail": "→ lactate"
          }
        ]
      },
      {
        "id": "aerobic",
        "prompt": "The Krebs cycle and electron transport spin up.",
        "choices": [
          {
            "label": "Complete aerobic respiration",
            "nextNodeId": null,
            "biology": "Full oxidation yields roughly 36 ATP.",
            "isOptimal": true,
            "fateTrail": "→ CO₂ + ATP"
          },
          {
            "label": "Abort and ferment instead",
            "nextNodeId": null,
            "biology": "You leave most energy unharvested."
          }
        ],
        "terminalTitle": "Exhaled as CO₂ — 36 ATP banked",
        "terminalScene": "You powered the muscle through complete aerobic respiration.",
        "isOptimalTerminal": true
      },
      {
        "id": "anaerobic",
        "prompt": "Oxygen ran low. Fermentation takes over.",
        "choices": [
          {
            "label": "Accept the lactate fate",
            "nextNodeId": null,
            "biology": "Only 2 ATP net — the muscle may burn."
          }
        ],
        "terminalTitle": "Lactic acid — 2 ATP only",
        "terminalScene": "Anaerobic respiration harvests far less energy than aerobic.",
        "isOptimalTerminal": false
      }
    ],
    "poweredIdea": "Aerobic respiration extracts far more ATP from glucose than fermentation."
  }
}
```

## kind: "cladogram-crafter"
```json
{
  "kind": "cladogram-crafter",
  "id": "quiz.example.cladogram-crafter",
  "data": {
    "taxa": [
      {
        "id": "lancelet",
        "name": "Lancelet",
        "isOutgroup": true
      },
      {
        "id": "shark",
        "name": "Shark"
      },
      {
        "id": "frog",
        "name": "Frog"
      },
      {
        "id": "lizard",
        "name": "Lizard"
      },
      {
        "id": "sparrow",
        "name": "Sparrow"
      },
      {
        "id": "mouse",
        "name": "Mouse"
      }
    ],
    "outgroupId": "lancelet",
    "traits": [
      {
        "id": "vert",
        "label": "Vertebrae"
      },
      {
        "id": "lungs",
        "label": "Lungs"
      },
      {
        "id": "amniotic",
        "label": "Amniotic egg"
      },
      {
        "id": "hair",
        "label": "Hair"
      },
      {
        "id": "feathers",
        "label": "Feathers"
      }
    ],
    "traitMatrix": {
      "lancelet": {
        "vert": 0,
        "lungs": 0,
        "amniotic": 0,
        "hair": 0,
        "feathers": 0
      },
      "shark": {
        "vert": 1,
        "lungs": 0,
        "amniotic": 0,
        "hair": 0,
        "feathers": 0
      },
      "frog": {
        "vert": 1,
        "lungs": 1,
        "amniotic": 0,
        "hair": 0,
        "feathers": 0
      },
      "lizard": {
        "vert": 1,
        "lungs": 1,
        "amniotic": 1,
        "hair": 0,
        "feathers": 0
      },
      "sparrow": {
        "vert": 1,
        "lungs": 1,
        "amniotic": 1,
        "hair": 0,
        "feathers": 1
      },
      "mouse": {
        "vert": 1,
        "lungs": 1,
        "amniotic": 1,
        "hair": 1,
        "feathers": 0
      }
    },
    "canonicalOrder": [
      "lancelet",
      "shark",
      "frog",
      "lizard",
      "mouse",
      "sparrow"
    ],
    "canonicalParsimonyScore": 6,
    "poweredIdea": "Shared derived traits (synapomorphies) cluster taxa on the most parsimonious tree.",
    "synapomorphies": [
      {
        "traitId": "amniotic",
        "label": "Amniotic egg unites reptiles, birds, and mammals.",
        "taxonIds": [
          "lizard",
          "sparrow",
          "mouse"
        ]
      }
    ]
  }
}
```

## kind: "concept-map-builder"
```json
{
  "kind": "concept-map-builder",
  "id": "quiz.example.concept-map-builder",
  "data": {
    "focalConcept": "Cellular Respiration",
    "nodes": [
      {
        "id": "glucose",
        "label": "Glucose",
        "icon": "🍬"
      },
      {
        "id": "o2",
        "label": "Oxygen",
        "icon": "💨"
      },
      {
        "id": "atp",
        "label": "ATP",
        "icon": "⚡"
      },
      {
        "id": "mito",
        "label": "Mitochondrion",
        "icon": "🔋"
      }
    ],
    "canonicalEdges": [
      {
        "from": "glucose",
        "to": "mito",
        "label": "enters",
        "importance": "critical",
        "reasonIfMissing": "Glucose feeds respiration inside the mitochondrion."
      },
      {
        "from": "mito",
        "to": "atp",
        "label": "produces",
        "importance": "critical",
        "reasonIfMissing": "The mitochondrion harvests ATP from nutrient oxidation."
      },
      {
        "from": "o2",
        "to": "mito",
        "label": "enters",
        "importance": "critical",
        "reasonIfMissing": "Oxygen is the final electron acceptor in aerobic respiration."
      }
    ],
    "allowedLabels": [
      "enters",
      "produces",
      "consumes",
      "requires"
    ],
    "poweredIdea": "Respiration is a network of inputs, stages, and outputs."
  }
}
```

## kind: "counterfactual-lab"
```json
{
  "kind": "counterfactual-lab",
  "id": "quiz.example.counterfactual-lab",
  "data": {
    "prompt": "What if photosynthesis had never evolved?",
    "context": "Oxygenic photosynthesis transformed Earth's atmosphere and enabled aerobic respiration, the ozone layer, and complex multicellular life.",
    "cards": [
      {
        "id": "no-o2",
        "text": "No oxygen buildup in the atmosphere",
        "depth": "immediate"
      },
      {
        "id": "no-ozone",
        "text": "No ozone layer — high UV at the surface",
        "depth": "near"
      },
      {
        "id": "anaerobic",
        "text": "Anaerobic microbes dominate ecosystems",
        "depth": "far"
      },
      {
        "id": "no-plants",
        "text": "No land plants or oxygen-breathing animals",
        "depth": "far"
      }
    ],
    "canonicalChain": [
      "no-o2",
      "no-ozone",
      "anaerobic",
      "no-plants"
    ],
    "finalStateOptions": [
      {
        "label": "Anaerobic microbial mats only",
        "canonical": true,
        "explanation": "Without oxygenic photosynthesis, energy budgets stay low and complexity stays microbial."
      },
      {
        "label": "Thriving modern forests unchanged",
        "canonical": false,
        "explanation": "Land plants depend on oxygenic photosynthesis."
      }
    ],
    "consensusNotes": "Paleobiologists treat the Great Oxygenation Event as contingent on cyanobacterial photosynthesis.",
    "poweredIdea": "Earth's biosphere history is one path through many possible contingencies."
  }
}
```

## kind: "debug-the-claim"
```json
{
  "kind": "debug-the-claim",
  "id": "quiz.example.debug-the-claim",
  "data": {
    "paragraph": "Giraffes evolved long necks because their ancestors stretched to reach high leaves, and this lengthening was passed to their offspring.",
    "bugPhrase": "stretched to reach high leaves, and this lengthening was passed to their offspring",
    "bugClass": "lamarckian-sneak",
    "hint": "Can a lifetime of stretching rewrite DNA passed to offspring?",
    "canonicalFix": "Giraffes with longer necks survived better and reproduced more — variation existed first; the environment selected it.",
    "poweredIdea": "Acquired traits in one lifetime are not inherited by the next generation."
  }
}
```

## kind: "etymology-puppet"
```json
{
  "kind": "etymology-puppet",
  "id": "quiz.example.etymology-puppet",
  "data": {
    "definition": "One species living inside another in a lasting partnership.",
    "slots": 4,
    "morphemes": [
      {
        "id": "endo",
        "morpheme": "endo-",
        "meaning": "within",
        "language": "Greek"
      },
      {
        "id": "sym",
        "morpheme": "sym-",
        "meaning": "together",
        "language": "Greek"
      },
      {
        "id": "bio",
        "morpheme": "bio-",
        "meaning": "life",
        "language": "Greek"
      },
      {
        "id": "sis",
        "morpheme": "-sis",
        "meaning": "process",
        "language": "Greek"
      },
      {
        "id": "exo",
        "morpheme": "exo-",
        "meaning": "outside",
        "language": "Greek"
      },
      {
        "id": "photo",
        "morpheme": "photo-",
        "meaning": "light",
        "language": "Greek"
      }
    ],
    "acceptedAnswers": [
      [
        "endo",
        "sym",
        "bio",
        "sis"
      ]
    ],
    "targetTerm": "endosymbiosis",
    "exampleSentence": "Mitochondria may be descendants of an ancient endosymbiosis event.",
    "poweredIdea": "The term literally means life living together within."
  }
}
```

## kind: "food-web-builder"
```json
{
  "kind": "food-web-builder",
  "id": "quiz.example.food-web-builder",
  "data": {
    "ecosystem": "Pond food web",
    "nodes": [
      {
        "id": "grass",
        "name": "Grass",
        "trophicLevel": "producer",
        "icon": "🌿"
      },
      {
        "id": "rabbit",
        "name": "Rabbit",
        "trophicLevel": "primary",
        "icon": "🐰"
      },
      {
        "id": "snail",
        "name": "Snail",
        "trophicLevel": "primary",
        "icon": "🐌"
      },
      {
        "id": "hawk",
        "name": "Hawk",
        "trophicLevel": "tertiary",
        "icon": "🦅"
      }
    ],
    "requiredEdges": [
      {
        "preyId": "grass",
        "predatorId": "rabbit"
      },
      {
        "preyId": "grass",
        "predatorId": "snail"
      },
      {
        "preyId": "rabbit",
        "predatorId": "hawk"
      },
      {
        "preyId": "snail",
        "predatorId": "hawk"
      }
    ],
    "perturbation": {
      "removeNodeId": "snail",
      "description": "Remove snails from the ecosystem."
    },
    "predictNodes": [
      {
        "nodeId": "hawk",
        "expected": "crash",
        "reason": "Hawks lose a prey source when snails disappear."
      },
      {
        "nodeId": "grass",
        "expected": "boom",
        "reason": "Less grazing pressure from snails lets producers increase."
      }
    ],
    "poweredIdea": "Removing one node ripples through the whole web — ecosystems are graphs."
  }
}
```

## kind: "microworld-sandbox"
```json
{
  "kind": "microworld-sandbox",
  "id": "quiz.example.microworld-sandbox",
  "data": {
    "modelId": "logistic",
    "parameters": [
      {
        "key": "r",
        "label": "Growth rate",
        "min": 0.1,
        "max": 1.2,
        "default": 0.3,
        "step": 0.05
      },
      {
        "key": "K",
        "label": "Carrying capacity",
        "min": 100,
        "max": 400,
        "default": 150,
        "step": 10
      },
      {
        "key": "N0",
        "label": "Starting population",
        "min": 10,
        "max": 80,
        "default": 25,
        "step": 5
      }
    ],
    "goal": {
      "kind": "reachValue",
      "signal": "finalPopulation",
      "min": 180,
      "max": 220
    },
    "generations": 40,
    "reveal": "Tinker growth rate and carrying capacity until the population stabilizes near K.",
    "poweredIdea": "Logistic growth slows as population approaches carrying capacity."
  }
}
```

## kind: "mutation-lab"
```json
{
  "kind": "mutation-lab",
  "id": "quiz.example.mutation-lab",
  "data": {
    "scenario": "Sickle cell site — one base change alters hemoglobin.",
    "templateDna": "ATGGAGGGCTAA",
    "editableIndex": 4,
    "replacements": [
      "A",
      "T",
      "G",
      "C"
    ],
    "correctReplacement": "T",
    "correctMutationType": "missense",
    "clinicalHook": "Glu → Val at position 2 causes sickle-shaped red blood cells.",
    "poweredIdea": "A single base substitution can change one amino acid and disease phenotype."
  }
}
```

## kind: "palace-walk"
```json
{
  "kind": "palace-walk",
  "id": "quiz.example.palace-walk",
  "data": {
    "roomTitle": "Mitochondrion memory palace",
    "layout": [
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    ],
    "spawn": {
      "x": 1,
      "y": 1
    },
    "totems": [
      {
        "id": "cristae",
        "x": 3,
        "y": 1,
        "icon": "🌊",
        "label": "Cristae",
        "question": {
          "kind": "fill",
          "prompt": "Cristae increase surface area for _____.",
          "acceptable": [
            "atp",
            "energy"
          ]
        }
      },
      {
        "id": "matrix",
        "x": 5,
        "y": 3,
        "icon": "🧪",
        "label": "Matrix",
        "question": {
          "kind": "fill",
          "prompt": "The Krebs cycle runs in the mitochondrial _____.",
          "acceptable": [
            "matrix"
          ]
        }
      }
    ],
    "poweredIdea": "Spatial neighborhoods help you recall organelle jobs."
  }
}
```

## kind: "pedigree-detective"
```json
{
  "kind": "pedigree-detective",
  "id": "quiz.example.pedigree-detective",
  "data": {
    "traitLabel": "Cystic fibrosis",
    "people": [
      {
        "id": "I-1",
        "label": "I-1",
        "sex": "M",
        "affected": false,
        "generation": 1
      },
      {
        "id": "I-2",
        "label": "I-2",
        "sex": "F",
        "affected": false,
        "generation": 1
      },
      {
        "id": "II-1",
        "label": "II-1",
        "sex": "F",
        "affected": false,
        "generation": 2,
        "motherId": "I-2",
        "fatherId": "I-1"
      },
      {
        "id": "II-2",
        "label": "II-2",
        "sex": "M",
        "affected": true,
        "generation": 2,
        "motherId": "I-2",
        "fatherId": "I-1"
      }
    ],
    "canonical": {
      "pattern": "autosomal-recessive",
      "poweredIdea": "Two unaffected carrier parents can have an affected child — the hallmark of autosomal recessive inheritance."
    },
    "hints": [
      "Count affected vs unaffected by sex.",
      "Can both parents be unaffected?"
    ]
  }
}
```

## kind: "predict-run-reflect"
```json
{
  "kind": "predict-run-reflect",
  "id": "quiz.example.predict-run-reflect",
  "data": {
    "scenario": "A hospital uses the same antibiotic for ten years. Bacteria in patients increasingly resist it.",
    "predictPrompt": "Why do resistant bacteria become more common over time?",
    "predictOptions": [
      "Bacteria evolved resistance to survive the drug",
      "Random mutations were selected — resistant variants reproduced more",
      "The antibiotic made bacteria stronger",
      "Patients passed resistance to each other like a cold"
    ],
    "correctPredictionIndex": 1,
    "runNarrative": "Resistant mutants already existed in the population. Each treatment killed susceptible cells, leaving resistant survivors to multiply. Over years the population shifted.",
    "truthSummary": "Selection acts on existing variation — bacteria did not \"try\" to resist; resistant forms happened to survive.",
    "bugCandidates": [
      {
        "label": "I treated evolution as intentional — bacteria wanted to survive",
        "isTheBug": true,
        "explanation": "Teleology sneaks in when we say organisms evolve \"to\" do something."
      },
      {
        "label": "I forgot that variation must exist before selection",
        "isTheBug": false,
        "explanation": "Close — but the main bug here is teleological language."
      },
      {
        "label": "I confused individual adaptation with population change",
        "isTheBug": false,
        "explanation": "Individuals do not evolve; populations change allele frequencies."
      }
    ],
    "poweredIdea": "Natural selection filters variation that already exists — it does not design solutions."
  }
}
```

## kind: "procedure-builder"
```json
{
  "kind": "procedure-builder",
  "id": "quiz.example.procedure-builder",
  "data": {
    "goal": "Write a procedure that produces a functional protein from a gene.",
    "initialState": "DNA in nucleus",
    "targetState": "Folded protein in cytoplasm",
    "blocks": [
      {
        "id": "transcribe",
        "label": "Transcribe gene → pre-mRNA",
        "icon": "📝",
        "narration": "RNA polymerase copies the gene into messenger RNA."
      },
      {
        "id": "splice",
        "label": "Splice introns from pre-mRNA",
        "icon": "✂️",
        "narration": "Spliceosomes remove introns and join exons."
      },
      {
        "id": "export",
        "label": "Export mRNA through nuclear pore",
        "icon": "🚪",
        "narration": "Processed mRNA leaves the nucleus."
      },
      {
        "id": "translate",
        "label": "Translate mRNA at ribosome",
        "icon": "🔤",
        "narration": "Ribosomes read codons and assemble amino acids."
      },
      {
        "id": "fold",
        "label": "Fold polypeptide into protein",
        "icon": "🧶",
        "narration": "The polypeptide chain folds into its functional shape."
      }
    ],
    "canonicalOrder": [
      "transcribe",
      "splice",
      "export",
      "translate",
      "fold"
    ],
    "poweredIdea": "Gene expression is a pipeline of named sub-procedures."
  }
}
```

## kind: "punnett-builder"
```json
{
  "kind": "punnett-builder",
  "id": "quiz.example.punnett-builder",
  "data": {
    "scenario": "Cross Pp × pp. What ratio of purple to white offspring?",
    "parents": [
      {
        "label": "Parent 1 (heterozygous)",
        "alleles": [
          "P",
          "p"
        ]
      },
      {
        "label": "Parent 2 (homozygous recessive)",
        "alleles": [
          "p",
          "p"
        ]
      }
    ],
    "phenotypeMap": {
      "PP": {
        "label": "Purple",
        "color": "#a855f7",
        "icon": "🟣"
      },
      "Pp": {
        "label": "Purple",
        "color": "#a855f7",
        "icon": "🟣"
      },
      "pp": {
        "label": "White",
        "color": "#94a3b8",
        "icon": "⚪"
      }
    },
    "dominantPhenotype": "Purple",
    "expectedRatio": "2:2",
    "notes": "Half the offspring inherit a dominant P allele — 1:1 purple to white."
  }
}
```

## kind: "recipe-sequencer"
```json
{
  "kind": "recipe-sequencer",
  "id": "quiz.example.recipe-sequencer",
  "data": {
    "processTitle": "Mitosis — arrange the four phases",
    "root": "Greek: ana (up/apart) + phase (stage)",
    "mnemonic": "PMAT: Prophase, Metaphase, Anaphase, Telophase — Please Make A Taco.",
    "steps": [
      {
        "id": "prophase",
        "title": "Prophase — chromosomes condense",
        "icon": "🧬",
        "consequenceHint": "Chromosomes must condense before they can be sorted."
      },
      {
        "id": "metaphase",
        "title": "Metaphase — chromosomes align at equator",
        "icon": "⚖️",
        "consequenceHint": "Alignment comes before separation — you cannot pull apart what is not lined up."
      },
      {
        "id": "anaphase",
        "title": "Anaphase — sister chromatids separate",
        "icon": "↔️",
        "consequenceHint": "Separation happens only after alignment at the metaphase plate."
      },
      {
        "id": "telophase",
        "title": "Telophase — nuclear envelopes reform",
        "icon": "🎁",
        "consequenceHint": "New nuclei form only after chromatids have reached the poles."
      }
    ],
    "causalLinks": [
      {
        "fromId": "prophase",
        "toId": "metaphase",
        "why": "Condensed chromosomes can be captured by the spindle."
      },
      {
        "fromId": "metaphase",
        "toId": "anaphase",
        "why": "The spindle pulls sister chromatids apart only after they align."
      },
      {
        "fromId": "anaphase",
        "toId": "telophase",
        "why": "Nuclear envelopes rebuild around the separated chromosome sets."
      }
    ]
  }
}
```

## kind: "speed-reveal-mnemonic"
```json
{
  "kind": "speed-reveal-mnemonic",
  "id": "quiz.example.speed-reveal-mnemonic",
  "data": {
    "termId": "term.endosymbiosis",
    "root": "Greek: endo (within) + sym (together) + bios (life)",
    "mnemonic": "ENDO=INSIDE. SYM=TOGETHER. Prokaryotes moved IN and stayed — roommates for 2 billion years.",
    "question": {
      "kind": "fill",
      "prompt": "Lynn Margulis proposed the _____ Theory for eukaryotic cell evolution.",
      "acceptable": [
        "endosymbiotic",
        "endosymbiosis"
      ],
      "hint": "Endo=within, symbiotic=together"
    }
  }
}
```

# Authoring rules

1. **IDs are immutable.** Lowercase, dotted hierarchy. Never reuse or rename shipped IDs.
2. **Mnemonics:** ALL-CAPS morpheme hooks (e.g. `ENDO=INSIDE`). ≤140 chars. Vivid image, not a restated definition.
3. **Achievement flavor:** Second person, present tense, narrates the *idea* — not "Great job!" Never use trophy emojis (🏆 ⭐ 💯 🥇).
4. **Emojis:** Topic-shaped (🧬 ⚗️ 🌿), not generic praise icons.
5. **Every unit needs ≥1 quiz.** Two to eight is typical for review material; match the source density.
6. **Fill prompts** must contain exactly `_____` where the student types (five underscores).
7. **Acceptable answers:** include synonyms, plural forms, and common abbreviations students might type.
8. **Etymology:** include for Greek/Latin terms; add unknown morphemes to `etymologyContributions`.
9. **Accuracy:** stay faithful to the source. If unsure, note it in `authorNotes` rather than guessing boldly.
10. **Scope for this request:** Output **3–6** KnowledgeUnits in one Drawer.

## Game-type hints

| Source teaches… | Prefer |
|---|---|
| Vocabulary / definitions | `fill`, `match`, `speed-reveal-mnemonic` |
| Worksheet / EOC questions | `fill`, `scenario`, `match` |
| Ordered process | `recipe-sequencer`, `procedure-builder` |
| Punnett / pedigree | `punnett-builder`, `pedigree-detective` |
| Misconception | `debug-the-claim` |
| Food chains / systems | `food-web-builder`, `concept-map-builder` |

# Minimal worked example

Use this as a structural reference (replace all IDs and content):

```json
{
  "id": "mod.example.user",
  "title": "Example: Macromolecules",
  "description": "One sample unit showing the expected JSON shape.",
  "authorRef": "example",
  "schemaVersion": 1,
  "appVersionAtAuthoring": "0.1.0",
  "source": "user-import",
  "createdAt": 1716595200000,
  "tree": [
    {
      "id": "example",
      "slug": "example",
      "title": "Example Wing",
      "emoji": "🧪",
      "children": [
        {
          "id": "example.review",
          "slug": "review",
          "title": "Review",
          "emoji": "📋",
          "children": [
            {
              "id": "example.review.core",
              "slug": "core",
              "title": "Core",
              "children": [
                {
                  "id": "example.review.core.carbs",
                  "slug": "carbs",
                  "title": "Carbohydrate Monomers",
                  "emoji": "🍬",
                  "shortLabel": "Carbs",
                  "longLabel": "Carbohydrate Monomers",
                  "teach": {
                    "headline": "Sugars Are the Carb Monomer",
                    "body": "Carbohydrates are built from monosaccharides — single sugar units like glucose.",
                    "poweredIdea": "Monosaccharides are the building blocks of carbohydrates."
                  },
                  "quizzes": [
                    {
                      "kind": "fill",
                      "id": "quiz.example.review.carbs.monomer",
                      "preferred": true,
                      "data": {
                        "prompt": "The monomer of carbohydrates is a _____.",
                        "acceptable": [
                          "monosaccharide",
                          "monosaccharides"
                        ],
                        "hint": "Single sugar"
                      }
                    }
                  ],
                  "achievement": {
                    "id": "ach.example.review.core.carbs",
                    "emoji": "🍬",
                    "shortLabel": "Carbs",
                    "longLabel": "Carbohydrate Monomers",
                    "flavor": "Glucose links into chains that store and release energy.",
                    "wingId": "example"
                  },
                  "difficulty": "intro",
                  "enabled": true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

# Output format (critical)

Respond with **only** the JSON `ContentModule` object:

- Valid JSON (double quotes, no trailing commas)
- No markdown code fences
- No commentary before or after
- No `//` comments inside JSON

The author will paste your response into evo-quest for validation and import.
````

---

## After the model responds

1. Parse as JSON (must be valid — double quotes, no trailing commas).
2. Validate with `ContentModuleSchema` (`bun run validate-content` pattern) or future import UI.
3. For bundled TypeScript: convert using `unit()` in `src/content/helpers.ts` and quiz helpers in `src/content/biochemistry/quiz-helpers.ts`, or paste JSON in Cursor and ask to integrate.

See [`authoring.md`](./authoring.md) for the three authoring paths.
