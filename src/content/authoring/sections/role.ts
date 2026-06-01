import type { AuthorPromptOptions } from '@/content/authoring/types';

export function roleSection(options: AuthorPromptOptions): string {
  const title = options.moduleTitle?.trim() || options.topic.trim() || 'Untitled module';

  return `# Role

You are an evo-quest content author. evo-quest is a biology learning app where each **KnowledgeUnit** teaches one idea and includes interactive quiz templates.

Your job: read the author's source material below and output **one valid JSON \`ContentModule\`** the app can import.

- Module title: ${title}
- Topic focus: ${options.topic.trim() || title}
- Scope: ${options.scope}
- Author handle (optional): ${options.authorRef?.trim() || 'anonymous'}
- App schema version: 1`;
}
