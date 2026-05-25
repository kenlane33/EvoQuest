import {
  loadKey,
  loadSession,
  type LoadResult,
} from '@/storage/reader';
import {
  ALL_STORAGE_KEYS,
  LATEST_VERSIONS,
  listLocalStorageKeys,
  STORAGE_KEY_PREFIX,
  STORAGE_KEYS,
  type StorageKey,
} from '@/storage/keys';
import { applyMigrations, MissingMigrationError } from '@/storage/migrations';
import {
  ExportEnvelopeSchema,
  StoredBlobSchema,
  type ExportEnvelope,
  type StoredBlob,
} from '@/types/schemas';
import {
  APP_VERSION,
  flushNow,
  scheduleWrite,
  writeBlob,
} from '@/storage/writer';
import { z } from 'zod';

export type { LoadResult } from '@/storage/reader';

const envelopeSchema = StoredBlobSchema(z.unknown());

function assertClient(): void {
  if (typeof window === 'undefined') {
    throw new Error('Storage API is client-only');
  }
}

export function saveState(key: StorageKey, payload: unknown): void {
  assertClient();
  scheduleWrite(key, payload, LATEST_VERSIONS[key]);
}

export function loadState<T>(key: StorageKey): LoadResult<T> {
  assertClient();
  if (key === STORAGE_KEYS.SESSION) {
    return loadSession<T>();
  }
  return loadKey<T>(key);
}

export async function hardReset(): Promise<void> {
  assertClient();
  flushNow();

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  }

  if (typeof indexedDB !== 'undefined') {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('evo-quest');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });
  }
}

export function exportAll(): ExportEnvelope {
  assertClient();

  const storageKeys: Record<string, unknown> = {};
  for (const key of listLocalStorageKeys()) {
    const raw = localStorage.getItem(key);
    if (!raw) {
      continue;
    }
    try {
      storageKeys[key] = JSON.parse(raw) as unknown;
    } catch {
      storageKeys[key] = raw;
    }
  }

  return {
    formatVersion: 1,
    exportedAt: Date.now(),
    appVersion: APP_VERSION,
    storageKeys,
  };
}

export type ImportResult = {
  ok: boolean;
  imported: StorageKey[];
  failed: Array<{ key: string; reason: string }>;
};

function importStorageKey(key: string, value: unknown): { ok: true } | { ok: false; reason: string } {
  if (!key.startsWith(STORAGE_KEY_PREFIX)) {
    return { ok: false, reason: 'not a storage key' };
  }

  if (!(ALL_STORAGE_KEYS as string[]).includes(key)) {
    return { ok: false, reason: 'unknown storage key' };
  }

  const storageKey = key as StorageKey;
  const envelopeResult = envelopeSchema.safeParse(value);
  if (!envelopeResult.success) {
    return { ok: false, reason: 'missing StoredBlob envelope' };
  }

  const envelope = envelopeResult.data;
  let payload = envelope.payload;

  try {
    if (envelope.schemaVersion < LATEST_VERSIONS[storageKey]) {
      const migrated = applyMigrations(
        storageKey,
        payload,
        envelope.schemaVersion,
      );
      payload = migrated.payload;
    } else if (envelope.schemaVersion > LATEST_VERSIONS[storageKey]) {
      return { ok: false, reason: 'future schema version' };
    }
  } catch (error) {
    if (error instanceof MissingMigrationError) {
      return { ok: false, reason: error.message };
    }
    throw error;
  }

  const blob: StoredBlob<unknown> = {
    schemaVersion: LATEST_VERSIONS[storageKey],
    savedAt: Date.now(),
    appVersion: APP_VERSION,
    payload,
  };

  writeBlob(storageKey, blob);
  return { ok: true };
}

export function importAll(data: unknown): ImportResult {
  assertClient();

  const parsed = ExportEnvelopeSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      imported: [],
      failed: [{ key: '*', reason: 'invalid export envelope' }],
    };
  }

  const backup = exportAll();
  const backupBlob: StoredBlob<ExportEnvelope> = {
    schemaVersion: LATEST_VERSIONS[STORAGE_KEYS.PRE_IMPORT_BACKUP],
    savedAt: Date.now(),
    appVersion: APP_VERSION,
    payload: backup,
  };
  localStorage.setItem(
    STORAGE_KEYS.PRE_IMPORT_BACKUP,
    JSON.stringify(backupBlob),
  );

  const imported: StorageKey[] = [];
  const failed: Array<{ key: string; reason: string }> = [];

  for (const [key, value] of Object.entries(parsed.data.storageKeys)) {
    const result = importStorageKey(key, value);
    if (result.ok) {
      imported.push(key as StorageKey);
    } else {
      failed.push({ key, reason: result.reason });
    }
  }

  return {
    ok: failed.length === 0,
    imported,
    failed,
  };
}

export { flushNow } from '@/storage/writer';
