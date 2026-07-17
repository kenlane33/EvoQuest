import { describe, expect, it } from 'vitest';
import { canAutoReadAloud, isReadAloudAvailable } from '@/tts';

describe('canAutoReadAloud', () => {
  it('is false when auto-read is off even if reading is enabled', () => {
    expect(canAutoReadAloud({ enabled: true, autoRead: false })).toBe(false);
  });

  it('is false when reading is disabled', () => {
    expect(canAutoReadAloud({ enabled: false, autoRead: true })).toBe(false);
  });
});

describe('isReadAloudAvailable', () => {
  it('is false without pocket TTS or speech synthesis', () => {
    expect(isReadAloudAvailable()).toBe(false);
  });
});
