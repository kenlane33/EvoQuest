/**
 * Normalized model for the "Test as Reader" pages (/t1, /t2).
 * Both quizzes are mapped into these shapes so a single ReaderQuiz component
 * can render and read them aloud.
 */

export type ReaderChoice = {
  /** Display letter (A, B, C, ...). */
  label: string;
  text: string;
  correct: boolean;
};

/** Single- or multi-select multiple choice. */
export type ChoiceBody = {
  kind: 'choice';
  multi: boolean;
  /** For multiselect: how many to choose. */
  selectCount?: number;
  choices: ReaderChoice[];
};

/** Inline-choice (dropdown) item: a sentence template with blanks. */
export type InlineBody = {
  kind: 'inline';
  /** Contains placeholders like {dropdown1}. */
  template: string;
  dropdowns: { id: string; options: string[]; answer: string }[];
};

/** Open-ended / drag-and-drop item shown as a revealed answer block. */
export type OpenBody = {
  kind: 'open';
  answerText: string;
};

export type ReaderQuestionBase = {
  /** Stable id, also used as the per-lap progress key. */
  id: string;
  /** Display number/label. */
  label: string;
  /** Optional item-set group id (passage + figures rendered once above). */
  groupId?: string;
  stem: string;
  /** Text descriptions of figures/tables shown to give the reader context. */
  figureNotes?: string[];
  /** Monospace ASCII art (e.g. a codon chart) rendered when the source lacks an image. */
  ascii?: string;
};

export type ReaderQuestion = ReaderQuestionBase & (ChoiceBody | InlineBody | OpenBody);

export type ReaderGroup = {
  id: string;
  title: string;
  passage: string;
  figures: { label: string; title: string; description: string }[];
};
