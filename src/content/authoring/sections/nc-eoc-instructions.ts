import type { NcEocChunk } from '@/content/authoring/nc-eoc-chunks';
import { NC_EOC_MODULE } from '@/content/authoring/nc-eoc-chunks';

export function ncEocInstructionsSection(chunk: NcEocChunk): string {
  const bundledList = chunk.existingBundledUnits.map((id) => `- \`${id}\``).join('\n');
  const objectiveList = chunk.objectives.map((o) => `- ${o}`).join('\n');
  const drawerList = chunk.drawerHints.map((d) => `- ${d}`).join('\n');

  return `# NC Biology EOC program (this chunk)

You are building **one room** of a complete NC Biology End-of-Course study module. The student must be able to pass the **2025 operational EOC** (2023 NCSCOS, 50 items, four strands).

## Fixed module identity (every file must match)

| Field | Value |
|---|---|
| Module \`id\` | \`${NC_EOC_MODULE.id}\` |
| Module \`title\` | \`${NC_EOC_MODULE.title}\` |
| Module \`description\` | \`${NC_EOC_MODULE.description}\` |
| Module \`source\` | \`"user-import"\` |
| Module \`schemaVersion\` | \`1\` |
| Module \`appVersionAtAuthoring\` | \`"0.1.0"\` |
| Module \`authorRef\` | \`"${NC_EOC_MODULE.authorRef}"\` |
| Wing \`id\` | \`${NC_EOC_MODULE.wingId}\` |
| Wing \`slug\` | \`${NC_EOC_MODULE.wingSlug}\` |
| Wing \`title\` | \`${NC_EOC_MODULE.title}\` |
| Achievement \`wingId\` on every unit | \`"${NC_EOC_MODULE.wingId}"\` |

## This chunk only

| Field | Value |
|---|---|
| Output file name | \`plan/inbox/bio-eoc-${chunk.outFileSlug}.json\` |
| Room \`id\` | \`${chunk.roomId}\` |
| Room \`slug\` | \`${chunk.roomSlug}\` |
| Room title | ${chunk.roomTitle} |
| Room emoji | ${chunk.roomEmoji} |
| Units to author | **${chunk.unitCount}** KnowledgeUnits |
| Test weight | ${chunk.testWeight} |

### NC objectives — every unit must tag and note coverage

${objectiveList}

Put the objective code(s) in each unit's \`authorNotes\` and \`tags\` (include \`eoc\`).

### Suggested drawers inside this room

${drawerList}

## Quality bar (compelling + thorough)

1. **Beat the bundled scan content.** These existing units cover similar topics but are worksheet-thin. Your version must be deeper, more misconception-aware, and more interactive:

${bundledList}

2. **Quiz mix per unit:** 3–5 quizzes. At least **one** must NOT be plain \`fill\` or \`multiple-choice\` — use \`scenario\`, \`debug-the-claim\`, \`predict-run-reflect\`, \`match\`, \`cladogram-crafter\`, \`punnett-builder\`, \`pedigree-detective\`, \`food-web-builder\`, \`procedure-builder\`, etc. where the concept fits.

3. **EOC item patterns:** Base concepts on the **2025 NC Biology EOC released form** and NC Check-Ins 2.0 strand specs. **Reword** — do not copy test items verbatim. Note released item numbers in \`authorNotes\` when applicable.

4. **Misconceptions:** Every room needs at least one \`debug-the-claim\` or \`predict-run-reflect\` targeting a common EOC trap (Lamarckism, pesticide "makes bugs stronger", mitosis makes gametes, etc.).

5. **Teach blocks:** One \`poweredIdea\` sentence students can recall under test pressure. Use etymology when Greek/Latin roots help retention.

6. **Prerequisites:** Link units within the room when order matters (\`prerequisites\`: array of unit ids).

7. **Do not reuse IDs** from the bundled list above or from other \`bio.eoc.*\` files. Prefix all new unit ids with \`${chunk.roomId}.\`.

## Tree shape for this response

Output a \`ContentModule\` whose \`tree\` contains **exactly one Wing** (\`${NC_EOC_MODULE.wingId}\`) with **exactly one Room** (\`${chunk.roomId}\`) — no other rooms.

\`\`\`
tree[0] = Wing bio.eoc
  └── children[0] = Room ${chunk.roomId}
        └── 2–4 Drawers
              └── ${chunk.unitCount} KnowledgeUnits total
\`\`\`

## Source material for this chunk

${chunk.sourceMaterialHint}

If the author pastes additional source below, prefer it over your general knowledge.`;
}
