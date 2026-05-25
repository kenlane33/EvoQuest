import { describe, expect, it } from 'vitest';
import { canAutoReadAloud } from '@/audio/read-aloud';

describe('canAutoReadAloud', () => {
  it('is false when auto-read is off even if reading is enabled', () => {
    expect(canAutoReadAloud({ enabled: true, autoRead: false })).toBe(false);
  });

  it('is false when reading is disabled', () => {
    expect(canAutoReadAloud({ enabled: false, autoRead: true })).toBe(false);
  });
});
