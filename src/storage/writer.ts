import { LATEST_VERSIONS } from '@/storage/migrations';
import { STORAGE_KEYS, type StorageKey } from '@/storage/keys';
import type { StoredBlob } from '@/types/schemas';

const DEBOUNCE_MS = 300;

export const APP_VERSION = '2026.06.02.1';

type PendingWrite = {
  key: StorageKey;
  payload: unknown;
  timer: ReturnType<typeof setTimeout> | null;
};

const pending = new Map<StorageKey, PendingWrite>();
let listenersAttached = false;

function assertClient(): void {
  if (typeof window === 'undefined') {
    throw new Error('Storage writer is client-only');
  }
}

function attachFlushListeners(): void {
  if (listenersAttached || typeof window === 'undefined') {
    return;
  }
  listenersAttached = true;

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushNow();
    }
  });

  window.addEventListener('beforeunload', () => {
    flushNow();
  });
}

function wrapEnvelope<T>(payload: T, schemaVersion: number): StoredBlob<T> {
  return {
    schemaVersion,
    savedAt: Date.now(),
    appVersion: APP_VERSION,
    payload,
  };
}

function writeRaw(key: StorageKey, json: string): void {
  assertClient();

  if (key === STORAGE_KEYS.SESSION) {
    const existing = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (existing) {
      localStorage.setItem(STORAGE_KEYS.SESSION_BACKUP, existing);
    }
  }

  localStorage.setItem(key, json);
}

export function writeBlob(key: StorageKey, blob: StoredBlob<unknown>): void {
  writeRaw(key, JSON.stringify(blob));
}

export function scheduleWrite(
  key: StorageKey,
  payload: unknown,
  schemaVersion: number,
): void {
  assertClient();
  attachFlushListeners();

  if (payload === undefined) {
    const message = `Refusing to write undefined payload for ${key}`;
    if (import.meta.env.DEV) {
      throw new Error(message);
    }
    console.error(message);
    return;
  }

  let entry = pending.get(key);
  if (!entry) {
    entry = { key, payload, timer: null };
    pending.set(key, entry);
  } else {
    entry.payload = payload;
    if (entry.timer) {
      clearTimeout(entry.timer);
    }
  }

  entry.timer = setTimeout(() => {
    flushKey(key, schemaVersion);
  }, DEBOUNCE_MS);
}

function flushKey(key: StorageKey, schemaVersion: number): void {
  const entry = pending.get(key);
  if (!entry) {
    return;
  }

  if (entry.timer) {
    clearTimeout(entry.timer);
    entry.timer = null;
  }

  const blob = wrapEnvelope(entry.payload, schemaVersion);
  writeRaw(key, JSON.stringify(blob));
  pending.delete(key);
}

export function flushNow(): void {
  if (typeof window === 'undefined') {
    return;
  }

  for (const key of pending.keys()) {
    flushKey(key, LATEST_VERSIONS[key]);
  }
}

export function hasPendingWrites(): boolean {
  return pending.size > 0;
}

export function cancelPending(key: StorageKey): void {
  const entry = pending.get(key);
  if (!entry) {
    return;
  }
  if (entry.timer) {
    clearTimeout(entry.timer);
  }
  pending.delete(key);
}

/** Attach visibility / unload flush hooks (idempotent). Call once at app boot. */
export function ensureFlushHooks(): void {
  attachFlushListeners();
}
