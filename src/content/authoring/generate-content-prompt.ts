import { contentModuleSchemaSection } from '@/content/authoring/sections/content-module-schema';
import { figuresSection } from '@/content/authoring/sections/figures';
import { minimalExampleSection } from '@/content/authoring/sections/minimal-example';
import { outputSection } from '@/content/authoring/sections/output';
import { quizKindsSection } from '@/content/authoring/sections/quiz-kinds';
import { roleSection } from '@/content/authoring/sections/role';
import { rulesSection } from '@/content/authoring/sections/rules';
import { sourceInstructionsSection } from '@/content/authoring/sections/source-instructions';
import { treeSchemaSection } from '@/content/authoring/sections/tree-schema';
import type { AuthorPromptOptions } from '@/content/authoring/types';

export function generateContentPrompt(options: AuthorPromptOptions): string {
  return [
    roleSection(options),
    sourceInstructionsSection(options),
    contentModuleSchemaSection(options),
    treeSchemaSection(),
    figuresSection(),
    quizKindsSection(),
    rulesSection(options),
    minimalExampleSection(),
    outputSection(),
  ].join('\n\n');
}
