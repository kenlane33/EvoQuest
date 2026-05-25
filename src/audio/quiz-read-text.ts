import type { QuizTemplate } from '@/types';

/** Replace fill-in blanks with a spoken placeholder. */
export function normalizePromptForSpeech(text: string): string {
  return text
    .replace(/_{3,}/g, ' blank ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Plain text for TTS from a quiz template's main prompt. */
export function getQuizReadText(quiz: QuizTemplate): string {
  const data = quiz.data as Record<string, unknown>;

  const inner = data.question;
  if (inner && typeof inner === 'object') {
    const q = inner as Record<string, unknown>;
    if (typeof q.prompt === 'string' && q.prompt.trim()) {
      return normalizePromptForSpeech(q.prompt.trim());
    }
  }

  if (typeof data.prompt === 'string' && data.prompt.trim()) {
    return normalizePromptForSpeech(data.prompt.trim());
  }
  if (typeof data.scenario === 'string' && data.scenario.trim()) {
    const scenario = data.scenario.trim();
    if (typeof data.predictPrompt === 'string' && data.predictPrompt.trim()) {
      const posit = scenario.replace(/\.\s*$/, '');
      const prompt = normalizePromptForSpeech(data.predictPrompt.trim());
      return `${posit}. ${prompt}`;
    }
    return scenario;
  }
  if (typeof data.headline === 'string' && data.headline.trim()) {
    return data.headline.trim();
  }
  return '';
}
