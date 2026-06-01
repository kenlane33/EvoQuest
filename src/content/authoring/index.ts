export { generateContentPrompt } from '@/content/authoring/generate-content-prompt';
export {
  generateNcEocMasterBrief,
  generateNcEocPrompt,
} from '@/content/authoring/generate-nc-eoc-prompt';
export {
  getNcEocChunk,
  NC_EOC_CHUNKS,
  NC_EOC_MODULE,
  pendingNcEocChunks,
  type NcEocChunk,
  type NcEocChunkId,
} from '@/content/authoring/nc-eoc-chunks';
export type {
  AuthorPromptOptions,
  AuthorScope,
  SourceKind,
} from '@/content/authoring/types';
export {
  SCOPE_LABELS,
  SOURCE_KIND_LABELS,
} from '@/content/authoring/types';
