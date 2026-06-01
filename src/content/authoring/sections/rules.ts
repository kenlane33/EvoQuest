import type { AuthorPromptOptions } from '@/content/authoring/types';

const SCOPE_COUNTS: Record<AuthorPromptOptions['scope'], string> = {
  'single-unit': 'Output exactly **one** KnowledgeUnit inside a minimal tree (one Wing → one Room → one Drawer → one unit).',
  drawer: 'Output **3–6** KnowledgeUnits in one Drawer.',
  room: 'Output **2–4** Drawers with **2–4** units each.',
  module: 'Output a complete module sized to the source — typically one Wing with several Rooms.',
};

export function rulesSection(options: AuthorPromptOptions): string {
  return `# Authoring rules

1. **IDs are immutable.** Lowercase, dotted hierarchy. Never reuse or rename shipped IDs.
2. **Mnemonics:** ALL-CAPS morpheme hooks (e.g. \`ENDO=INSIDE\`). ≤140 chars. Vivid image, not a restated definition.
3. **Achievement flavor:** Second person, present tense, narrates the *idea* — not "Great job!" Never use trophy emojis (🏆 ⭐ 💯 🥇).
4. **Emojis:** Topic-shaped (🧬 ⚗️ 🌿), not generic praise icons.
5. **Every unit needs ≥1 quiz.** Two to eight is typical for review material; match the source density.
6. **Fill prompts** must contain exactly \`_____\` where the student types (five underscores).
7. **Acceptable answers:** include synonyms, plural forms, and common abbreviations students might type.
8. **Etymology:** include for Greek/Latin terms; add unknown morphemes to \`etymologyContributions\`.
9. **Accuracy:** stay faithful to the source. If unsure, note it in \`authorNotes\` rather than guessing boldly.
10. **Scope for this request:** ${SCOPE_COUNTS[options.scope]}

## Game-type hints

| Source teaches… | Prefer |
|---|---|
| Vocabulary / definitions | \`fill\`, \`match\`, \`speed-reveal-mnemonic\` |
| Worksheet / EOC questions | \`fill\`, \`scenario\`, \`match\` |
| Ordered process | \`recipe-sequencer\`, \`procedure-builder\` |
| Punnett / pedigree | \`punnett-builder\`, \`pedigree-detective\` |
| Misconception | \`debug-the-claim\` |
| Food chains / systems | \`food-web-builder\`, \`concept-map-builder\` |`;
}
