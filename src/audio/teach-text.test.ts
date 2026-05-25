import { describe, expect, it } from 'vitest';
import { stripMarkdown, teachToPlainText } from '@/audio/teach-text';
import type { TeachBlock } from '@/types';

describe('stripMarkdown', () => {
  it('removes images and link syntax', () => {
    const md = 'See ![alt](/img.png) and [link](https://x.com).';
    expect(stripMarkdown(md)).toBe('See and link.');
  });
});

describe('teachToPlainText', () => {
  const teach: TeachBlock = {
    headline: 'Enzymes',
    body: '## Section\n\n**Bold** word.',
    poweredIdea: 'Rate depends on temperature.',
  };

  it('joins headline, body, and powered idea', () => {
    expect(teachToPlainText(teach)).toContain('Enzymes');
    expect(teachToPlainText(teach)).toContain('Bold word');
    expect(teachToPlainText(teach)).toContain('Rate depends on temperature');
  });

  it('omits body when includeBody is false', () => {
    const text = teachToPlainText(teach, { includeBody: false });
    expect(text).not.toContain('Bold');
    expect(text).toContain('Rate depends on temperature');
  });
});
