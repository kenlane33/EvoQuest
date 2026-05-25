import { describe, expect, it } from 'vitest';
import { applyMigrations, MissingMigrationError } from '@/storage/migrations';
import { STORAGE_KEYS } from '@/storage/keys';

describe('migrations', () => {
  it('passes through payload at latest version', () => {
    const payload = {
      motion: 'full',
      appearance: { bodyFont: 'nunito' },
      reading: { enabled: true, autoRead: true, voice: 'azelma', serverUrl: '' },
    };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 5);
    expect(result.payload).toEqual(payload);
    expect(result.toVersion).toBe(5);
  });

  it('migrates settings v4 to v5 from dyslexiaFont toggle to bodyFont', () => {
    const payload = {
      motion: 'full',
      appearance: {
        contrast: 'normal',
        fontSize: 'md',
        bodyFont: 'inter',
        dyslexiaFont: true,
        colorBlindSafe: false,
      },
      reading: { enabled: true, autoRead: true, voice: 'azelma', serverUrl: '' },
    };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 4);
    expect(result.toVersion).toBe(5);
    expect(result.payload).toMatchObject({
      appearance: { bodyFont: 'opendyslexic', dyslexiaFont: true },
    });
  });

  it('migrates settings v3 to v5 with bodyFont default', () => {
    const payload = {
      motion: 'full',
      appearance: { contrast: 'normal', fontSize: 'md', dyslexiaFont: false, colorBlindSafe: false },
      reading: { enabled: true, autoRead: true, voice: 'azelma', serverUrl: '' },
    };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 3);
    expect(result.toVersion).toBe(5);
    expect(result.payload).toMatchObject({
      appearance: { bodyFont: 'nunito' },
    });
  });

  it('migrates settings v2 to v5 with autoRead and bodyFont defaults', () => {
    const payload = {
      motion: 'full',
      reading: { enabled: true, voice: 'azelma', serverUrl: '' },
    };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 2);
    expect(result.toVersion).toBe(5);
    expect(result.payload).toMatchObject({
      reading: { autoRead: true },
      appearance: { bodyFont: 'nunito' },
    });
  });

  it('migrates settings v1 through v5 with reading and font defaults', () => {
    const payload = { motion: 'full', audio: { enabled: false, volume: 0.6, stings: {} } };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 1);
    expect(result.toVersion).toBe(5);
    expect(result.payload).toMatchObject({
      reading: { enabled: true, autoRead: true, voice: 'azelma', serverUrl: '' },
      appearance: { bodyFont: 'nunito' },
    });
  });

  it('throws MissingMigrationError when version gap has no step', () => {
    expect(() =>
      applyMigrations(STORAGE_KEYS.SETTINGS, { motion: 'full' }, 0),
    ).toThrow(MissingMigrationError);
  });
});
