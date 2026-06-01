import { describe, expect, it } from 'vitest';
import {
  findUnmappedEmojis,
  replaceEmojisForSpeech,
} from '@/audio/speech-emoji-substitutions';
import { prepareTextForSpeech } from '@/audio/speech-substitutions';

describe('replaceEmojisForSpeech', () => {
  it('speaks robot and DNA emoji', () => {
    expect(replaceEmojisForSpeech('Cells 🤖 use 🧬')).toBe('Cells  robot  use  DNA ');
    expect(prepareTextForSpeech('Cells 🤖 use 🧬')).toBe('Cells robot use DNA');
  });

  it('handles variation selectors', () => {
    expect(prepareTextForSpeech('Photosynthesis ☀️')).toBe('Photosynthesis sun');
    expect(prepareTextForSpeech('Photosynthesis ☀')).toBe('Photosynthesis sun');
  });

  it('speaks check and cross marks', () => {
    expect(prepareTextForSpeech('✓ correct')).toBe('check correct');
    expect(prepareTextForSpeech('✗ wrong')).toBe('cross wrong');
  });

  it('maps all emoji found in src content', () => {
    // Spot-check high-frequency content emoji
    for (const sample of ['🧬', '🌱', '📋', '🦠', '⚗️', '🤖', '💡', '🏆']) {
      expect(findUnmappedEmojis(sample)).toEqual([]);
    }
  });
});

describe('prepareTextForSpeech emoji integration', () => {
  it('replaces em dash with hyphen', () => {
    expect(prepareTextForSpeech('Keep going — every attempt builds the map.')).toBe(
      'Keep going - every attempt builds the map.',
    );
    expect(prepareTextForSpeech('Keep going \u2014 every attempt builds the map.')).toBe(
      'Keep going - every attempt builds the map.',
    );
  });

  it('combines emoji replacement with chemistry rules', () => {
    expect(prepareTextForSpeech('🧪 Mix H₂O → product')).toBe(
      'test tube Mix H2O to product',
    );
  });
});
