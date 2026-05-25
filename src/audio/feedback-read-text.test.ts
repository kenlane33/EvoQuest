import { describe, expect, it } from 'vitest';
import {
  buildFeedbackReadBundle,
  feedbackDescReadText,
  feedbackPageReadText,
} from '@/audio/feedback-read-text';
import type { TeachBlock } from '@/types';

describe('buildFeedbackReadBundle', () => {
  const teach: TeachBlock = {
    headline: 'Acquired Traits Do Not Rewrite DNA',
    body: 'Lamarck proposed **use or disuse**.',
    poweredIdea: 'Traits selected in a lifetime are not automatically passed to offspring.',
  };

  it('builds structured slots without duplicating powered idea in teach', () => {
    const bundle = buildFeedbackReadBundle(
      'Well done.',
      teach.poweredIdea!,
      teach,
      {
        root: 'Named: Jean-Baptiste Lamarck (French naturalist)',
        mnemonic: 'LAMARCK = LIFETIME changes passed down.',
      },
    );

    expect(bundle.headline).toBe('Well done.');
    expect(bundle.explanation).toBe(teach.poweredIdea);
    expect(bundle.teach).toContain('Acquired Traits Do Not Rewrite DNA');
    expect(bundle.teach).toContain('use or disuse');
    expect(bundle.teach).not.toContain(teach.poweredIdea!);
    expect(bundle.sidebar).toContain('Jean-Baptiste Lamarck');
    expect(bundle.sidebar).toContain('Remember: LAMARCK = LIFETIME');
  });

  it('joins slots for page and desc read text', () => {
    const bundle = buildFeedbackReadBundle('Yes!', 'Short idea.', teach, null);
    expect(feedbackDescReadText(bundle)).toContain('Short idea.');
    expect(feedbackDescReadText(bundle)).toContain('Acquired Traits');
    expect(feedbackPageReadText(bundle)).toContain('Yes!');
    expect(feedbackPageReadText(bundle)).toContain('Short idea.');
  });
});
