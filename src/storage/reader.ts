import {
  applyMigrations,
  LATEST_VERSIONS,
  MissingMigrationError,
} from '@/storage/migrations';
import {
  isStorageKey,
  PAYLOAD_SCHEMAS,
  STORAGE_KEYS,
  type StorageKey,
} from '@/storage/keys';
import { APP_VERSION } from '@/storage/writer';
import {
  QuarantineEntrySchema,
  StoredBlobSchema,
  type QuarantineEntry,
  type QuarantineReason,
  type StoredBlob,
} from '@/types/schemas';
import { z } from 'zod';

export type LoadSuccess<T> = {
  ok: true;
  value: T;
  fromVersion: number;
  toVersion: number;
  recoveredFromBackup?: boolean;
  futureVersion?: boolean;
};

export type LoadFailure = {
  ok: false;
  quarantined: boolean;
  reason: QuarantineReason | 'not-found';
  key: StorageKey;
};

export type LoadResult<T> = LoadSuccess<T> | LoadFailure;

const envelopeSchema = StoredBlobSchema(z.unknown());

function assertClient(): void {
  if (typeof window === 'undefined') {
    throw new Error('Storage reader is client-only');
  }
}

function readRaw(key: StorageKey): string | null {
  assertClient();
  return localStorage.getItem(key);
}

function appendQuarantine(entry: QuarantineEntry): void {
  const existingRaw = readRaw(STORAGE_KEYS.CORRUPT);
  let entries: QuarantineEntry[] = [];

  if (existingRaw) {
    try {
      const parsed = JSON.parse(existingRaw) as unknown;
      const envelope = envelopeSchema.safeParse(parsed);
      if (envelope.success) {
        const validated = z.array(QuarantineEntrySchema).safeParse(
          envelope.data.payload,
        );
        if (validated.success) {
          entries = validated.data;
        }
      }
    } catch {
      // Start fresh if corrupt log itself is unreadable.
    }
  }

  entries.push(entry);

  const blob: StoredBlob<QuarantineEntry[]> = {
    schemaVersion: LATEST_VERSIONS[STORAGE_KEYS.CORRUPT],
    savedAt: Date.now(),
    appVersion: APP_VERSION,
    payload: entries,
  };

  localStorage.setItem(STORAGE_KEYS.CORRUPT, JSON.stringify(blob));
}

function quarantine(
  key: StorageKey,
  raw: string,
  reason: QuarantineReason,
  zodErrors?: string[],
): LoadFailure {
  appendQuarantine({
    key,
    blob: raw,
    reason,
    detectedAt: Date.now(),
    appVersion: APP_VERSION,
    zodErrors,
  });

  return { ok: false, quarantined: true, reason, key };
}

function parseEnvelope(raw: string): StoredBlob<unknown> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = envelopeSchema.safeParse(parsed);
  if (!result.success || result.data.payload === undefined) {
    return null;
  }

  const { schemaVersion, savedAt, appVersion, payload } = result.data;
  return { schemaVersion, savedAt, appVersion, payload };
}

function validatePayload(key: StorageKey, payload: unknown):
  | { ok: true; value: unknown }
  | { ok: false; zodErrors: string[] } {
  const schema = PAYLOAD_SCHEMAS[key];
  const result = schema.safeParse(payload);
  if (result.success) {
    return { ok: true, value: result.data };
  }

  return {
    ok: false,
    zodErrors: result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    ),
  };
}

function loadEnvelopeKey<T>(
  key: StorageKey,
  raw: string,
): LoadResult<T> {
  const envelope = parseEnvelope(raw);
  if (!envelope) {
    return quarantine(key, raw, 'parse-fail');
  }

  const latest = LATEST_VERSIONS[key];
  let payload = envelope.payload;
  let fromVersion = envelope.schemaVersion;
  let futureVersion = false;

  if (envelope.schemaVersion > latest) {
    futureVersion = true;
  } else if (envelope.schemaVersion < latest) {
    try {
      const migrated = applyMigrations(
        key,
        payload,
        envelope.schemaVersion,
      );
      payload = migrated.payload;
      fromVersion = envelope.schemaVersion;
    } catch (error) {
      if (error instanceof MissingMigrationError) {
        return quarantine(key, raw, 'missing-migration');
      }
      throw error;
    }
  }

  const validated = validatePayload(key, payload);
  if (!validated.ok) {
    return quarantine(key, raw, 'validation-fail', validated.zodErrors);
  }

  return {
    ok: true,
    value: validated.value as T,
    fromVersion,
    toVersion: latest,
    futureVersion: futureVersion || undefined,
  };
}

export function loadKey<T>(key: StorageKey): LoadResult<T> {
  const raw = readRaw(key);
  if (raw === null) {
    return { ok: false, quarantined: false, reason: 'not-found', key };
  }

  return loadEnvelopeKey<T>(key, raw);
}

export function loadSession<T>(): LoadResult<T> {
  const primary = loadKey<T>(STORAGE_KEYS.SESSION);
  if (primary.ok) {
    return primary;
  }

  if (primary.reason === 'not-found') {
    return primary;
  }

  const backupRaw = readRaw(STORAGE_KEYS.SESSION_BACKUP);
  if (!backupRaw) {
    return primary;
  }

  const backup = loadEnvelopeKey<T>(STORAGE_KEYS.SESSION_BACKUP, backupRaw);
  if (backup.ok) {
    return { ...backup, recoveredFromBackup: true };
  }

  return primary;
}

export function readStoredBlob(key: StorageKey): StoredBlob<unknown> | null {
  const raw = readRaw(key);
  if (!raw) {
    return null;
  }
  return parseEnvelope(raw);
}

export function listQuarantineEntries(): QuarantineEntry[] {
  const result = loadKey<QuarantineEntry[]>(STORAGE_KEYS.CORRUPT);
  if (result.ok) {
    return result.value;
  }
  return [];
}

export function isEvoQuestStorageKey(key: string): key is StorageKey {
  return isStorageKey(key);
}
