import '@/engine/templates';
import { REGISTRY } from '@/engine/templates/registry';

const BASIC_EXEMPLARS = {
  fill: {
    kind: 'fill',
    id: 'quiz.example.unit.prompt-id',
    data: {
      prompt: 'The monomer of carbohydrates is a _____.',
      acceptable: ['monosaccharide', 'monosaccharides'],
      hint: 'Single sugar unit',
    },
  },
  match: {
    kind: 'match',
    id: 'quiz.example.unit.match-id',
    data: {
      term: 'Insulin',
      correct: 'Protein',
      distractors: ['Carbohydrate', 'Lipid', 'Nucleic acid'],
    },
  },
  scenario: {
    kind: 'scenario',
    id: 'quiz.example.unit.scenario-id',
    data: {
      story: 'A student claims DNA is built from amino acids.',
      question: 'What macromolecule class is DNA?',
      answer: 'Nucleic acid',
      options: ['Protein', 'Nucleic acid', 'Lipid', 'Carbohydrate'],
      explanation: 'DNA is a nucleic acid; amino acids are protein monomers.',
    },
  },
} as const;

function formatExemplar(kind: string, data: unknown): string {
  return `## kind: "${kind}"
\`\`\`json
${JSON.stringify({ kind, id: `quiz.example.${kind}`, data }, null, 2)}
\`\`\``;
}

export function quizKindsSection(): string {
  const basic = Object.entries(BASIC_EXEMPLARS).map(([kind, ex]) =>
    formatExemplar(kind, ex.data),
  );

  const registry = Object.values(REGISTRY)
    .sort((a, b) => a.kind.localeCompare(b.kind))
    .map((reg) => formatExemplar(reg.kind, reg.exemplar));

  return `# Quiz templates

Each quiz entry:

\`\`\`json
{ "kind": "...", "id": "quiz.unique.stable.id", "preferred": true, "data": { ... } }
\`\`\`

- \`id\` is stable forever; use dotted paths tied to the unit.
- \`preferred: true\` on the best fast-review question for that unit.
- Use **fill** for cloze prompts with \`_____\` (five underscores) as the blank.
- Prefer **fill**, **match**, and **scenario** for worksheet/EOC-style review.
- Add **speed-reveal-mnemonic** when a term has Greek/Latin roots worth memorizing.
- Use microworld kinds (recipe-sequencer, punnett-builder, etc.) only when the source teaches a process, diagram, or interactive model — not for every unit.

## Basic kinds (fast review)

${basic.join('\n\n')}

## Interactive kinds (microworld / constructionist)

${registry.join('\n\n')}`;
}
