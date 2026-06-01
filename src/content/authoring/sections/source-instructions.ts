import type { AuthorPromptOptions, SourceKind } from '@/content/authoring/types';

const SOURCE_GUIDANCE: Record<SourceKind, string> = {
  notes: `The source is class notes or a textbook excerpt. Extract key terms, definitions, and relationships. Turn each major concept into a KnowledgeUnit with a teach block and 3–8 quiz questions grounded in the notes. Do not invent facts not supported by the source unless filling obvious gaps (mark those in authorNotes).`,
  presentation: `The source is slide or presentation text (possibly bullet-heavy). Group slides into Drawers by subtopic. Each slide cluster becomes one unit; bullets become teach body and quiz prompts. Preserve vocabulary the presenter used.`,
  'example-questions': `The source is existing questions (worksheet, EOC bank, etc.). Reverse-engineer teach blocks that would prepare a student for each question cluster. Reuse the question wording where possible. Map each question to a quiz template (\`fill\`, \`match\`, \`scenario\`, or \`speed-reveal-mnemonic\`). Include all acceptable answer variants.`,
  'knowledge-outline': `The source is an outline or checklist of topics. Expand each leaf into a full KnowledgeUnit: headline, 1–3 short teach paragraphs, poweredIdea, achievement, and quizzes that test the outline item.`,
};

export function sourceInstructionsSection(options: AuthorPromptOptions): string {
  const material = options.sourceMaterial.trim();
  const guidance = SOURCE_GUIDANCE[options.sourceKind];

  return `# Source material

Interpretation (${options.sourceKind}):
${guidance}

---
${material || '[Author will paste notes, slides, example questions, or an outline here before sending this prompt.]'}
---`;
}
