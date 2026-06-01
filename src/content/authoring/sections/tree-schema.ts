export function treeSchemaSection(): string {
  return `# Content tree

Hierarchy: **Wing → Room → Drawer → KnowledgeUnit**

Each tree node (Wing, Room, Drawer) shares:

\`\`\`json
{
  "id": "dotted.id",
  "slug": "kebab-case",
  "title": "string ≤80",
  "emoji": "optional topic emoji",
  "description": "optional ≤280",
  "children": [ /* next level */ ]
}
\`\`\`

## KnowledgeUnit

\`\`\`json
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
\`\`\``;
}
