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
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 10);
    expect(result.payload).toEqual(payload);
    expect(result.toVersion).toBe(10);
  });

  it('migrates settings v6 to v7 by clamping countdownMs', () => {
    const payload = {
      motion: 'full',
      reveals: { countdownMs: 1000, revealMs: 20000 },
    };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 6);
    expect(result.toVersion).toBe(10);
    expect(result.payload).toMatchObject({
      reveals: { countdownMs: 2000 },
    });
  });

  it('migrates settings v6 to v7 with default countdownMs when missing', () => {
    const payload = {
      motion: 'full',
      reveals: { revealMs: 20000 },
    };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 6);
    expect(result.toVersion).toBe(10);
    expect(result.payload).toMatchObject({
      reveals: { countdownMs: 8000 },
    });
  });

  it('migrates settings v5 to v6 by clamping revealMs', () => {
    const payload = {
      motion: 'full',
      reveals: { countdownMs: 6000, revealMs: 3000 },
    };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 5);
    expect(result.toVersion).toBe(10);
    expect(result.payload).toMatchObject({
      reveals: { revealMs: 4000 },
    });
  });

  it('migrates settings v5 to v6 with default revealMs when missing', () => {
    const payload = { motion: 'full' };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 5);
    expect(result.toVersion).toBe(10);
    expect(result.payload).toMatchObject({
      reveals: { revealMs: 20000 },
    });
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
    expect(result.toVersion).toBe(10);
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
    expect(result.toVersion).toBe(10);
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
    expect(result.toVersion).toBe(10);
    expect(result.payload).toMatchObject({
      reading: { autoRead: true },
      appearance: { bodyFont: 'nunito' },
    });
  });

  it('migrates settings v1 through v5 with reading and font defaults', () => {
    const payload = { motion: 'full', audio: { enabled: false, volume: 0.6, stings: {} } };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 1);
    expect(result.toVersion).toBe(10);
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

  it('migrates units v1 to v2 with quizAttemptCounts from templatesEncountered', () => {
    const payload = {
      'bio.eoc.test': {
        unitId: 'bio.eoc.test',
        firstSeenAt: 1,
        attempts: 2,
        correct: 1,
        lastSeenAt: 2,
        lastFiveOutcomes: [],
        templatesEncountered: ['quiz.a', 'speed-reveal-mnemonic'],
        tier: 'unlocked',
        achievementEarned: false,
      },
    };
    const result = applyMigrations(STORAGE_KEYS.UNITS, payload, 1);
    expect(result.toVersion).toBe(2);
    expect(result.payload).toMatchObject({
      'bio.eoc.test': {
        quizAttemptCounts: { 'quiz.a': 1 },
      },
    });
  });

  it('migrates settings v7 to v8 with revisitLength default', () => {
    const payload = {
      motion: 'full',
      practice: { confidenceFrequency: 'every-3', defaultMood: 'mixed', defaultLength: 10 },
    };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 7);
    expect(result.toVersion).toBe(10);
    expect(result.payload).toMatchObject({
      practice: { revisitLength: 12, confidenceFrequency: 'never' },
    });
  });

  it('migrates settings v9 to v10 with confidence check-ins off by default', () => {
    const payload = {
      motion: 'full',
      practice: { confidenceFrequency: 'every-3', defaultMood: 'mixed', defaultLength: 10, revisitLength: 12 },
    };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 9);
    expect(result.toVersion).toBe(10);
    expect(result.payload).toMatchObject({
      practice: { confidenceFrequency: 'never' },
    });
  });

  it('preserves explicit every confidence frequency in v9 to v10 migration', () => {
    const payload = {
      motion: 'full',
      practice: { confidenceFrequency: 'every', defaultMood: 'mixed', defaultLength: 10, revisitLength: 12 },
    };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 9);
    expect(result.payload).toMatchObject({
      practice: { confidenceFrequency: 'every' },
    });
  });

  it('migrates settings v8 to v9 with headlineFont default', () => {
    const payload = {
      motion: 'full',
      appearance: { contrast: 'normal', fontSize: 'md', bodyFont: 'nunito', colorBlindSafe: false },
    };
    const result = applyMigrations(STORAGE_KEYS.SETTINGS, payload, 8);
    expect(result.toVersion).toBe(10);
    expect(result.payload).toMatchObject({
      appearance: { headlineFont: 'syne' },
    });
  });

  it('passes through achievements payload at latest version', () => {
    const payload = {
      earned: { 'ach.test': 123 },
      dailyStreak: { count: 1, lastDayKey: '2026-06-01' },
      firstClearedWingIds: [],
    };
    const result = applyMigrations(STORAGE_KEYS.ACHIEVEMENTS, payload, 1);
    expect(result.toVersion).toBe(1);
    expect(result.payload).toEqual(payload);
  });
});
