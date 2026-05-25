import { describe, expect, it, vi } from 'vitest';
import { loadKey } from '@/storage/reader';
import {
  flushNow,
  scheduleWrite,
  writeBlob,
} from '@/storage/writer';
import { STORAGE_KEYS } from '@/storage/keys';
import { DEFAULT_SETTINGS } from '@/store/app-store';
import type { Settings } from '@/types';
import type { StoredBlob } from '@/types/schemas';

describe('storage writer', () => {
  it('writes settings with StoredBlob envelope', () => {
    writeBlob(STORAGE_KEYS.SETTINGS, {
      schemaVersion: 1,
      savedAt: Date.now(),
      appVersion: '0.0.0',
      payload: DEFAULT_SETTINGS,
    });

    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    expect(raw).toBeTruthy();

    const parsed = JSON.parse(raw!) as StoredBlob<typeof DEFAULT_SETTINGS>;
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.payload.appearance.fontSize).toBe('md');
  });

  it('debounces writes and flushes on demand', () => {
    vi.useFakeTimers();

    scheduleWrite(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS, 1);
    expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).toBeNull();

    vi.advanceTimersByTime(300);
    expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).toBeTruthy();

    vi.useRealTimers();
  });

  it('backs up session before overwriting', () => {
    const session = {
      id: 'sess-1',
      startedAt: Date.now(),
      queue: [],
      currentIndex: 0,
      score: 0,
      streak: 0,
      answered: [],
      powerUpsUsed: [],
    };

    writeBlob(STORAGE_KEYS.SESSION, {
      schemaVersion: 1,
      savedAt: Date.now(),
      appVersion: '0.0.0',
      payload: session,
    });

    const updated = { ...session, score: 10 };
    writeBlob(STORAGE_KEYS.SESSION, {
      schemaVersion: 1,
      savedAt: Date.now(),
      appVersion: '0.0.0',
      payload: updated,
    });

    const backupRaw = localStorage.getItem(STORAGE_KEYS.SESSION_BACKUP);
    expect(backupRaw).toBeTruthy();
    const backup = JSON.parse(backupRaw!) as StoredBlob<typeof session>;
    expect(backup.payload.score).toBe(0);
  });
});

describe('storage reader', () => {
  it('returns not-found for missing keys', () => {
    const result = loadKey(STORAGE_KEYS.SETTINGS);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('not-found');
    }
  });

  it('quarantines corrupt JSON instead of wiping', () => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, '{not json');

    const result = loadKey(STORAGE_KEYS.SETTINGS);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.quarantined).toBe(true);
      expect(result.reason).toBe('parse-fail');
    }

    expect(localStorage.getItem(STORAGE_KEYS.CORRUPT)).toBeTruthy();
  });

  it('loads valid settings after flush', () => {
    scheduleWrite(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS, 1);
    flushNow();

    const result = loadKey<Settings>(STORAGE_KEYS.SETTINGS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.motion).toBe('full');
    }
  });
});
