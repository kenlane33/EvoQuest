import type { AuthorPromptOptions } from '@/content/authoring/types';

const APP_VERSION = '0.1.0';

export function contentModuleSchemaSection(options: AuthorPromptOptions): string {
  const wingPrefix = options.wingIdPrefix?.trim() || 'user.topic';
  const moduleSlug =
    wingPrefix === '{{WING_ID_PREFIX}}'
      ? '<hyphenate-{{WING_ID_PREFIX}}>'
      : wingPrefix.replace(/\./g, '-');

  return `# ContentModule (top level)

Return a single JSON object with this shape:

\`\`\`json
{
  "id": "mod.${moduleSlug}.user",
  "title": "string — human title, ≤80 chars",
  "description": "string — 1–2 sentences",
  "authorRef": "string — optional handle",
  "schemaVersion": 1,
  "appVersionAtAuthoring": "${APP_VERSION}",
  "source": "user-import",
  "createdAt": 1716595200000,
  "tree": [ /* Wing[] — see below */ ],
  "etymologyContributions": [ /* optional Morpheme[] for morphemes not in core */ ]
}
\`\`\`

Module \`id\`: dots in the wing prefix become hyphens (e.g. \`biochem.cells\` → \`mod.biochem-cells.user\`).
Unit \`id\`s keep dots: \`biochem.cells.membrane.transport\`.

Use \`createdAt\` as current Unix time in milliseconds if you know it; otherwise use ${Date.now()}.

Suggested ID prefix for new units: \`${wingPrefix}\` (dotted hierarchy, lowercase, immutable forever).`;
}
