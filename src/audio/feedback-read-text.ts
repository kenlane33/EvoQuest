import { feedbackReadAloudText } from '@/audio/feedback-phrases';
import { stripMarkdown } from '@/audio/teach-text';
import type { TeachBlock } from '@/types';

export type FeedbackReadBundle = {
  headline: string;
  explanation: string;
  teach: string;
  sidebar: string;
};

type PlayContext = {
  root: string;
  mnemonic?: string;
};

/** Plain-text slots for feedback read-aloud (matches question page title / desc / sidebar). */
export function buildFeedbackReadBundle(
  headline: string,
  explanation: string,
  teach: TeachBlock,
  playCtx: PlayContext | null,
): FeedbackReadBundle {
  const teachParts: string[] = [teach.headline.trim()];
  if (teach.body?.trim()) {
    teachParts.push(stripMarkdown(teach.body));
  }

  const sidebarParts: string[] = [];
  if (playCtx?.root.trim()) {
    sidebarParts.push(playCtx.root.trim());
  }
  if (playCtx?.mnemonic?.trim()) {
    sidebarParts.push(`Remember: ${playCtx.mnemonic.trim()}`);
  }

  return {
    headline: headline.trim(),
    explanation: explanation.trim(),
    teach: teachParts.filter((p) => p.length > 0).join('. '),
    sidebar: sidebarParts.join('. '),
  };
}

export function feedbackDescReadText(bundle: FeedbackReadBundle): string {
  return [bundle.explanation, bundle.teach].filter((p) => p.length > 0).join('. ');
}

/** Default auto-read / Read it text (excludes fb.etym sidebar). */
export function feedbackAutoReadText(bundle: FeedbackReadBundle): string {
  return feedbackReadAloudText(bundle.headline, feedbackDescReadText(bundle));
}

/** Full page text including etymology (manual sidebar speak). */
export function feedbackPageReadText(bundle: FeedbackReadBundle): string {
  const core = feedbackAutoReadText(bundle);
  return [core, bundle.sidebar].filter((p) => p.length > 0).join('. ');
}
