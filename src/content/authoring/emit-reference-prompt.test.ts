import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import '@/engine/templates';
import { emitReferencePrompt } from '@/content/authoring/emit-reference-prompt';

describe('emitReferencePrompt', () => {
  it('includes placeholders and every quiz kind section', () => {
    const prompt = emitReferencePrompt();
    expect(prompt).toContain('{{TOPIC}}');
    expect(prompt).toContain('{{SOURCE_MATERIAL}}');
    expect(prompt).toContain('kind: "fill"');
    expect(prompt).toContain('kind: "palace-walk"');
  });

  it('syncs plan/design/ai-authoring-prompt.md when SYNC_AI_AUTHORING_DOC=1', () => {
    if (process.env.SYNC_AI_AUTHORING_DOC !== '1') return;

    const prompt = emitReferencePrompt();
    const docPath = join(process.cwd(), 'plan/design/ai-authoring-prompt.md');
    const body = buildDoc(prompt);
    writeFileSync(docPath, body, 'utf8');
    expect(readFileSync(docPath, 'utf8')).toContain('{{TOPIC}}');
  });
});

function buildDoc(prompt: string): string {
  return `# AI authoring prompt guide

Self-contained reference for turning **notes, presentation text, example
questions, or a topic outline** into evo-quest \`ContentModule\` JSON.
Field names and exemplars match \`src/types/schemas.ts\` and
\`src/engine/templates/\`.

> **Refresh from code:** \`SYNC_AI_AUTHORING_DOC=1 bun run test src/content/authoring/emit-reference-prompt.test.ts\`

---

## Quick workflow

1. Replace the \`{{…}}\` placeholders in [Copy-paste prompt](#copy-paste-prompt) below
   (or use **Content → Format reference** in the app to fill them automatically).
2. Paste the prompt into an external chat (ChatGPT, Claude, Gemini, etc.).
3. The model replies with **only** raw JSON — no markdown fences, no commentary.
4. Paste that JSON into evo-quest import or a Cursor chat to merge into bundled content.

### Placeholders

| Token | Replace with |
|---|---|
| \`{{TOPIC}}\` | What the content is about |
| \`{{MODULE_TITLE}}\` | Human module title (or same as topic) |
| \`{{WING_ID_PREFIX}}\` | Dotted ID prefix for units, e.g. \`biochem.cells\` |
| \`{{MODULE_ID}}\` | Module id: \`mod.\` + prefix with dots → hyphens + \`.user\` (e.g. \`mod.biochem-cells.user\`) |
| \`{{AUTHOR}}\` | Your handle (optional) |
| \`{{SOURCE_MATERIAL}}\` | Pasted notes, slides, questions, or outline |

### Source type (edit the \`Interpretation (...)\` line in the prompt)

| \`sourceKind\` | Use when |
|---|---|
| \`notes\` | Class notes or textbook excerpt |
| \`presentation\` | Slide deck text export |
| \`example-questions\` | Worksheet / EOC / quiz bank |
| \`knowledge-outline\` | Topic checklist to expand |

### Scope (edit the \`Scope:\` line in the prompt)

| Scope | Typical output |
|---|---|
| \`single-unit\` | One KnowledgeUnit |
| \`drawer\` | 3–6 units in one Drawer |
| \`room\` | 2–4 Drawers |
| \`module\` | Full wing sized to source |

---

## Zod schema reference (exact field names)

Source of truth: \`src/types/schemas.ts\`. ID patterns: tree nodes
\`/^[a-z0-9.-]+$/\`, unit ids \`/^[a-z0-9-]+(\\\\.[a-z0-9-]+)+/\`, slugs
\`/^[a-z0-9-]+$/\`.

### ContentModule

| Field | Type | Required | Notes |
|---|---|---|---|
| \`id\` | string | yes | \`mod.<prefix-with-hyphens>.user\` — dots → hyphens (\`biochem.cells\` → \`mod.biochem-cells.user\`) |
| \`title\` | string | yes | ≤80 chars |
| \`description\` | string | yes | 1–2 sentences |
| \`authorRef\` | string | no | handle |
| \`schemaVersion\` | number | yes | always \`1\` |
| \`appVersionAtAuthoring\` | string | yes | e.g. \`0.1.0\` |
| \`source\` | \`"bundled"\` \\| \`"user-import"\` | yes | use \`"user-import"\` for pasted content |
| \`createdAt\` | number | yes | Unix ms |
| \`tree\` | Wing[] | yes | see below |
| \`etymologyContributions\` | Morpheme[] | no | morphemes not in core registry |

### Wing / Room / Drawer (tree nodes)

| Field | Type | Required | Notes |
|---|---|---|---|
| \`id\` | string | yes | dotted, e.g. \`biochem.cells\` |
| \`aliases\` | string[] | no | |
| \`slug\` | string | yes | kebab-case |
| \`title\` | string | yes | ≤80 chars |
| \`emoji\` | string | no | topic-shaped |
| \`description\` | string | no | ≤280 chars |
| \`children\` | array | yes | Room[] / Drawer[] / KnowledgeUnit[] |

### KnowledgeUnit

| Field | Type | Required | Notes |
|---|---|---|---|
| \`id\` | string | yes | \`wing.room.drawer.slug\` |
| \`aliases\` | string[] | no | |
| \`slug\` | string | yes | kebab-case |
| \`title\` | string | yes | ≤80 |
| \`emoji\` | string | yes | 1–8 chars, topic-shaped |
| \`shortLabel\` | string | yes | ≤14 chars |
| \`longLabel\` | string | yes | ≤40 chars |
| \`description\` | string | no | ≤280 |
| \`teach\` | TeachBlock | yes | see below |
| \`quizzes\` | QuizTemplate[] | yes | min 1 |
| \`achievement\` | Achievement | yes | see below |
| \`prerequisites\` | string[] | no | unit ids |
| \`difficulty\` | \`intro\` \\| \`core\` \\| \`deep\` | no | |
| \`tags\` | string[] | no | |
| \`enabled\` | boolean | yes | default \`true\` |
| \`authorNotes\` | string | no | source citations |

### TeachBlock

| Field | Type | Required | Notes |
|---|---|---|---|
| \`headline\` | string | yes | ≤60 |
| \`body\` | string | yes | markdown |
| \`etymology\` | Etymology | no | see below |
| \`mnemonic\` | string | no | ≤140, ALL-CAPS hooks |
| \`poweredIdea\` | string | yes | ≤120, one sentence |
| \`imageUrl\` | string | no | |
| \`figures\` | TeachFigure[] | no | \`{ id, alt, caption? }\` |
| \`cite\` | string[] | no | |

### Etymology / Morpheme

\`\`\`json
{
  "termId": "term.endosymbiosis",
  "term": "endosymbiosis",
  "morphemes": [{ "morphemeId": "morph.endo", "asUsed": "endo" }],
  "rootSummary": "Greek: endo (within) + sym (together) + bios (life)"
}
\`\`\`

\`etymologyContributions[]\` entry:

\`\`\`json
{
  "id": "morph.endo",
  "morpheme": "endo-",
  "language": "Greek",
  "meaning": "within",
  "cousins": ["endoscope"],
  "appearsIn": ["term.endosymbiosis"]
}
\`\`\`

\`language\`: \`Greek\` | \`Latin\` | \`Old English\` | \`Other\`

### Achievement

| Field | Type | Required | Notes |
|---|---|---|---|
| \`id\` | string | yes | \`ach.<unit-id>\` |
| \`emoji\` | string | yes | topic-shaped; no 🏆 ⭐ 💯 🥇 |
| \`shortLabel\` | string | yes | |
| \`longLabel\` | string | yes | |
| \`flavor\` | string | yes | ≤140; narrates the idea |
| \`wingId\` | string | yes | top wing \`id\` |
| \`hidden\` | boolean | no | |
| \`aggregate\` | object | no | drawer/room/wing rollup |

### QuizTemplate (discriminated union on \`kind\`)

Every entry:

\`\`\`json
{ "kind": "fill", "id": "quiz.stable.id", "preferred": true, "data": { } }
\`\`\`

| \`kind\` | \`data\` schema | Play style |
|---|---|---|
| \`fill\` | \`{ prompt, acceptable[], hint? }\` | Cloze; prompt uses \`_____\` |
| \`match\` | \`{ term, correct, distractors[] }\` | Pick category |
| \`scenario\` | \`{ story, question, answer, options[], explanation }\` | MC with story |
| \`speed-reveal-mnemonic\` | \`{ termId, root, mnemonic, question, countdownMs?, revealMs? }\` | question is InnerQuestion |
| \`recipe-sequencer\` | RecipeSequencerData | Ordered steps |
| \`etymology-puppet\` | EtymologyPuppetData | Build term from morphemes |
| \`debug-the-claim\` | DebugTheClaimData | Find the bug |
| \`punnett-builder\` | PunnettBuilderData | Punnett square |
| \`predict-run-reflect\` | PredictRunReflectData | Predict → run → reflect |
| \`be-the-turtle\` | BeTheTurtleData | First-person choices |
| \`mutation-lab\` | MutationLabData | DNA edit |
| \`food-web-builder\` | FoodWebBuilderData | Trophic web |
| \`microworld-sandbox\` | MicroworldSandboxData | Parameter sliders |
| \`pedigree-detective\` | PedigreeDetectiveData | Inheritance pattern |
| \`cladogram-crafter\` | CladogramCrafterData | Phylogeny tree |
| \`counterfactual-lab\` | CounterfactualLabData | What-if chain |
| \`procedure-builder\` | ProcedureBuilderData | Drag procedure blocks |
| \`concept-map-builder\` | ConceptMapBuilderData | Concept graph |
| \`palace-walk\` | PalaceWalkData | Grid + totem questions |

**InnerQuestion** (inside \`speed-reveal-mnemonic\` and \`palace-walk\` totems):

- \`{ kind: "fill", prompt, acceptable[], hint? }\`
- \`{ kind: "multiple-choice", prompt, options[], correctIndex }\`

---

## Copy-paste prompt

Replace \`{{…}}\` placeholders, then send everything below to your external chat.

\`\`\`\`text
${prompt}
\`\`\`\`

---

## After the model responds

1. Parse as JSON (must be valid — double quotes, no trailing commas).
2. Validate with \`ContentModuleSchema\` (\`bun run validate-content\` pattern) or future import UI.
3. For bundled TypeScript: convert using \`unit()\` in \`src/content/helpers.ts\` and quiz helpers in \`src/content/biochemistry/quiz-helpers.ts\`, or paste JSON in Cursor and ask to integrate.

See [\`authoring.md\`](./authoring.md) for the three authoring paths.
`;
}
