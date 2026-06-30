import { describe, expect, it } from 'vitest';
import {
  formatPocketTtsVoiceLabel,
  POCKET_TTS_DEFAULT_LANGUAGE,
  POCKET_TTS_DEFAULT_VOICE,
} from '@/audio/pocket-tts';
import { resolvePocketTtsVoice } from '@/hooks/use-pocket-tts-voices';

describe('pocket-tts constants', () => {
  it('defaults to azelma and english bundle', () => {
    expect(POCKET_TTS_DEFAULT_VOICE).toBe('azelma');
    expect(POCKET_TTS_DEFAULT_LANGUAGE).toBe('english_2026-04');
  });
});

describe('formatPocketTtsVoiceLabel', () => {
  it('title-cases simple ids', () => {
    expect(formatPocketTtsVoiceLabel('azelma')).toBe('Azelma');
    expect(formatPocketTtsVoiceLabel('alba')).toBe('Alba');
  });

  it('title-cases underscore ids', () => {
    expect(formatPocketTtsVoiceLabel('bill_boerst')).toBe('Bill Boerst');
    expect(formatPocketTtsVoiceLabel('peter_yearsley')).toBe('Peter Yearsley');
    expect(formatPocketTtsVoiceLabel('a_janelle_risa')).toBe('A Janelle Risa');
    expect(formatPocketTtsVoiceLabel('alan_davis_drake')).toBe('Alan Davis Drake');
    expect(formatPocketTtsVoiceLabel('amy_koenig')).toBe('Amy Koenig');
  });
});

describe('resolvePocketTtsVoice', () => {
  const voices = ['alba', 'azelma', 'mary'] as const;

  it('keeps a valid stored voice', () => {
    expect(resolvePocketTtsVoice('mary', voices)).toBe('mary');
  });

  it('falls back to default when stored voice is missing', () => {
    expect(resolvePocketTtsVoice('unknown', voices)).toBe('azelma');
  });

  it('falls back to first voice when default is missing', () => {
    expect(resolvePocketTtsVoice('unknown', ['alba', 'mary'])).toBe('alba');
  });
});
