import { generateContentPrompt } from '@/content/authoring/generate-content-prompt';

/** Reference prompt with `{{PLACEHOLDER}}` tokens for the authoring guide. */
export function emitReferencePrompt(): string {
  return generateContentPrompt({
    topic: '{{TOPIC}}',
    moduleTitle: '{{MODULE_TITLE}}',
    wingIdPrefix: '{{WING_ID_PREFIX}}',
    sourceKind: 'notes',
    sourceMaterial: '{{SOURCE_MATERIAL}}',
    scope: 'drawer',
    authorRef: '{{AUTHOR}}',
  });
}
