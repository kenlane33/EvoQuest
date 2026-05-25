import {
  ALL_STORAGE_KEYS,
  LATEST_VERSIONS,
  STORAGE_KEYS,
  type StorageKey,
} from '@/storage/keys';
import { POCKET_TTS_DEFAULT_VOICE } from '@/audio/pocket-tts';

export type Migration<From = unknown, To = unknown> = {
  fromVersion: number;
  toVersion: number;
  forward: (oldPayload: From) => To;
  describe: string;
};

export type MigrationChain = Migration[];

function emptyChain(): MigrationChain {
  return [];
}

const settingsV1ToV2: Migration = {
  fromVersion: 1,
  toVersion: 2,
  forward: (old) => ({
    ...(old as Record<string, unknown>),
    reading: {
      enabled: true,
      voice: POCKET_TTS_DEFAULT_VOICE,
      serverUrl: '',
    },
  }),
  describe: 'Add pocket-tts read-aloud settings (voice azelma)',
};

const settingsV2ToV3: Migration = {
  fromVersion: 2,
  toVersion: 3,
  forward: (old) => {
    const prev = old as Record<string, unknown>;
    const reading = (prev.reading ?? {}) as Record<string, unknown>;
    return {
      ...prev,
      reading: {
        ...reading,
        autoRead: true,
      },
    };
  },
  describe: 'Add reading.autoRead toggle (default on)',
};

const settingsV3ToV4: Migration = {
  fromVersion: 3,
  toVersion: 4,
  forward: (old) => {
    const prev = old as Record<string, unknown>;
    const appearance = (prev.appearance ?? {}) as Record<string, unknown>;
    return {
      ...prev,
      appearance: {
        ...appearance,
        bodyFont: 'nunito',
      },
    };
  },
  describe: 'Add appearance.bodyFont (default nunito)',
};

const settingsV4ToV5: Migration = {
  fromVersion: 4,
  toVersion: 5,
  forward: (old) => {
    const prev = old as Record<string, unknown>;
    const appearance = (prev.appearance ?? {}) as Record<string, unknown>;
    const bodyFont =
      appearance.dyslexiaFont === true
        ? 'opendyslexic'
        : (appearance.bodyFont ?? 'nunito');
    return {
      ...prev,
      appearance: {
        ...appearance,
        bodyFont,
      },
    };
  },
  describe: 'Fold dyslexiaFont toggle into bodyFont opendyslexic option',
};

/** Append-only migration chains — one per storage key. */
export const MIGRATIONS: Record<StorageKey, MigrationChain> = {
  ...Object.fromEntries(
    ALL_STORAGE_KEYS.map((key) => [key, emptyChain()]),
  ),
  [STORAGE_KEYS.SETTINGS]: [
    settingsV1ToV2,
    settingsV2ToV3,
    settingsV3ToV4,
    settingsV4ToV5,
  ],
} as Record<StorageKey, MigrationChain>;

export class MissingMigrationError extends Error {
  readonly key: StorageKey;
  readonly fromVersion: number;

  constructor(key: StorageKey, fromVersion: number) {
    super(`Missing migration for ${key} from version ${fromVersion}`);
    this.name = 'MissingMigrationError';
    this.key = key;
    this.fromVersion = fromVersion;
  }
}

export function applyMigrations(
  key: StorageKey,
  payload: unknown,
  fromVersion: number,
): { payload: unknown; toVersion: number } {
  const chain = MIGRATIONS[key];
  let current = payload;
  let version = fromVersion;
  const target = LATEST_VERSIONS[key];

  while (version < target) {
    const step = chain.find((migration) => migration.fromVersion === version);
    if (!step) {
      throw new MissingMigrationError(key, version);
    }
    current = step.forward(current);
    version = step.toVersion;
  }

  return { payload: current, toVersion: version };
}

export { LATEST_VERSIONS };
