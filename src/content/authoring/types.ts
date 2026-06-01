export type SourceKind =
  | 'notes'
  | 'presentation'
  | 'example-questions'
  | 'knowledge-outline';

export type AuthorScope = 'single-unit' | 'drawer' | 'room' | 'module';

export type AuthorPromptOptions = {
  /** What the module or unit is about — shown to the external LLM. */
  topic: string;
  /** Human title for the ContentModule (defaults from topic). */
  moduleTitle?: string;
  /** Dotted ID prefix for new units, e.g. "biochem.cells". */
  wingIdPrefix?: string;
  /** How to interpret the pasted source material. */
  sourceKind: SourceKind;
  /** Raw notes, slides text, example Q/A, or outline pasted by the author. */
  sourceMaterial: string;
  /** How much structure to generate in one pass. */
  scope: AuthorScope;
  authorRef?: string;
};

export const SOURCE_KIND_LABELS: Record<SourceKind, string> = {
  notes: 'Class notes or textbook excerpt',
  presentation: 'Presentation or slide deck (text export)',
  'example-questions': 'Example questions (worksheet, EOC, quiz bank)',
  'knowledge-outline': 'Topic outline or knowledge checklist',
};

export const SCOPE_LABELS: Record<AuthorScope, string> = {
  'single-unit': 'One KnowledgeUnit (teach block + quizzes)',
  drawer: 'One Drawer (several related units)',
  room: 'One Room (multiple drawers)',
  module: 'Full ContentModule (wing or more)',
};
