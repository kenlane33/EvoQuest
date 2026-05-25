import { describe, expect, it } from 'vitest';
import { feedbackHeadlineForAttempt } from '@/audio/feedback-phrases';

describe('feedbackHeadlineForAttempt', () => {
  it('matches pending and committed headlines for the same answer', () => {
    const journeyId = 'j1';
    const index = 2;
    const pending = feedbackHeadlineForAttempt(journeyId, index, 1, true, false);
    const committed = feedbackHeadlineForAttempt(journeyId, index, 2, true, true);
    expect(pending).toBe(committed);
  });

  it('picks stable wrong headline', () => {
    const a = feedbackHeadlineForAttempt('j1', 0, 0, false, false);
    const b = feedbackHeadlineForAttempt('j1', 0, 0, false, true);
    expect(a).toBe(b);
  });
});
