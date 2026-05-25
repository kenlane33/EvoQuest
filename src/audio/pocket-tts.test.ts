import { describe, expect, it } from 'vitest';
import {
  POCKET_TTS_DEFAULT_LANGUAGE,
  POCKET_TTS_DEFAULT_VOICE,
} from '@/audio/pocket-tts';

describe('pocket-tts constants', () => {
  it('defaults to azelma and english bundle', () => {
    expect(POCKET_TTS_DEFAULT_VOICE).toBe('azelma');
    expect(POCKET_TTS_DEFAULT_LANGUAGE).toBe('english_2026-04');
  });
});
