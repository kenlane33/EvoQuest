import {
  ALL_STORAGE_KEYS,
  LATEST_VERSIONS,
  STORAGE_KEYS,
  type StorageKey,
} from '@/storage/keys';
import { POCKET_TTS_DEFAULT_VOICE } from '@/tts';
import type { HeadlineFontId } from '@/lib/google-fonts';
import { HEADLINE_FONT_IDS } from '@/lib/google-fonts';
import { HINT_COUNTDOWN_MS, HINT_REVEAL_MS } from '@/types/schemas';

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

const settingsV5ToV6: Migration = {
  fromVersion: 5,
  toVersion: 6,
  forward: (old) => {
    const prev = old as Record<string, unknown>;
    const reveals = (prev.reveals ?? {}) as Record<string, unknown>;
    const raw = reveals.revealMs;
    const revealMs =
      typeof raw === 'number'
        ? Math.min(HINT_REVEAL_MS.max, Math.max(HINT_REVEAL_MS.min, raw))
        : HINT_REVEAL_MS.default;
    return {
      ...prev,
      reveals: {
        ...reveals,
        revealMs,
      },
    };
  },
  describe: 'Clamp reveals.revealMs to supported 4–60s range',
};

const powerupsV1ToV2: Migration = {
  fromVersion: 1,
  toVersion: 2,
  forward: (old) => ({
    ...(old as Record<string, unknown>),
    firstUseShown: [],
  }),
  describe: 'Add firstUseShown for power-up explain modals',
};

const unitsV1ToV2: Migration = {
  fromVersion: 1,
  toVersion: 2,
  forward: (old) => {
    const record = old as Record<string, Record<string, unknown>>;
    const next: Record<string, Record<string, unknown>> = {};
    for (const [unitId, unit] of Object.entries(record)) {
      const encountered = (unit.templatesEncountered ?? []) as string[];
      const quizAttemptCounts: Record<string, number> = {};
      for (const id of encountered) {
        if (id.startsWith('quiz.')) {
          quizAttemptCounts[id] = 1;
        }
      }
      next[unitId] = {
        ...unit,
        quizAttemptCounts,
      };
    }
    return next;
  },
  describe: 'Add quizAttemptCounts seeded from quiz.* templatesEncountered',
};

const settingsV6ToV7: Migration = {
  fromVersion: 6,
  toVersion: 7,
  forward: (old) => {
    const prev = old as Record<string, unknown>;
    const reveals = (prev.reveals ?? {}) as Record<string, unknown>;
    const raw = reveals.countdownMs;
    const countdownMs =
      typeof raw === 'number'
        ? Math.min(HINT_COUNTDOWN_MS.max, Math.max(HINT_COUNTDOWN_MS.min, raw))
        : HINT_COUNTDOWN_MS.default;
    return {
      ...prev,
      reveals: {
        ...reveals,
        countdownMs,
      },
    };
  },
  describe: 'Clamp reveals.countdownMs to supported 2–60s range',
};

const settingsV7ToV8: Migration = {
  fromVersion: 7,
  toVersion: 8,
  forward: (old) => {
    const prev = old as Record<string, unknown>;
    const practice = (prev.practice ?? {}) as Record<string, unknown>;
    return {
      ...prev,
      practice: {
        ...practice,
        revisitLength: typeof practice.revisitLength === 'number' ? practice.revisitLength : 12,
      },
    };
  },
  describe: 'Add practice.revisitLength (default 12 questions per revisit pass)',
};

const settingsV8ToV9: Migration = {
  fromVersion: 8,
  toVersion: 9,
  forward: (old) => {
    const prev = old as Record<string, unknown>;
    const appearance = (prev.appearance ?? {}) as Record<string, unknown>;
    const raw = appearance.headlineFont;
    const headlineFont =
      typeof raw === 'string' && HEADLINE_FONT_IDS.includes(raw as HeadlineFontId)
        ? raw
        : 'syne';
    return {
      ...prev,
      appearance: {
        ...appearance,
        headlineFont,
      },
    };
  },
  describe: 'Add appearance.headlineFont for display text (default Syne)',
};

const settingsV9ToV10: Migration = {
  fromVersion: 9,
  toVersion: 10,
  forward: (old) => {
    const prev = old as Record<string, unknown>;
    const practice = (prev.practice ?? {}) as Record<string, unknown>;
    const raw = practice.confidenceFrequency;
    const confidenceFrequency = raw === 'every' ? 'every' : 'never';
    return {
      ...prev,
      practice: {
        ...practice,
        confidenceFrequency,
      },
    };
  },
  describe: 'Default confidence check-ins off (every-3 → never)',
};

/** Append-only migration chains — one per storage key. */
export const MIGRATIONS: Record<StorageKey, MigrationChain> = {
  ...Object.fromEntries(
    ALL_STORAGE_KEYS.map((key) => [key, emptyChain()]),
  ),
  [STORAGE_KEYS.UNITS]: [unitsV1ToV2],
  [STORAGE_KEYS.SETTINGS]: [
    settingsV1ToV2,
    settingsV2ToV3,
    settingsV3ToV4,
    settingsV4ToV5,
    settingsV5ToV6,
    settingsV6ToV7,
    settingsV7ToV8,
    settingsV8ToV9,
    settingsV9ToV10,
  ],
  [STORAGE_KEYS.POWERUPS]: [powerupsV1ToV2],
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
