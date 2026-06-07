import { z } from 'zod';
import {
  AchievementStateSchema,
  ActiveSessionSchema,
  CalibrationRecordSchema,
  FirstRunStateSchema,
  JourneySchema,
  LabArtifactSchema,
  ModulesStateSchema,
  MorphemeProgressSchema,
  PowerUpInventorySchema,
  QuarantineEntrySchema,
  SettingsSchema,
  UnitProgressSchema,
} from '@/types/schemas';

export const STORAGE_KEYS = {
  SESSION: 'evo-quest.v1.session',
  SESSION_BACKUP: 'evo-quest.v1.session.backup',
  JOURNEYS: 'evo-quest.v1.journeys',
  UNITS: 'evo-quest.v1.units',
  MORPHEMES: 'evo-quest.v1.morphemes',
  NOTEBOOK: 'evo-quest.v1.notebook',
  MODULES: 'evo-quest.v1.modules',
  SETTINGS: 'evo-quest.v1.settings',
  POWERUPS: 'evo-quest.v1.powerups',
  ACHIEVEMENTS: 'evo-quest.v1.achievements',
  CALIBRATION: 'evo-quest.v1.calibration',
  CORRUPT: 'evo-quest.v1.corrupt',
  FIRST_RUN: 'evo-quest.v1.firstRun',
  PRE_IMPORT_BACKUP: 'evo-quest.v1.preImportBackup',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const ALL_STORAGE_KEYS: StorageKey[] = Object.values(STORAGE_KEYS);

/** Gameplay progress keys — settings and quarantine backups are excluded. */
export const PROGRESS_STORAGE_KEYS: StorageKey[] = [
  STORAGE_KEYS.SESSION,
  STORAGE_KEYS.SESSION_BACKUP,
  STORAGE_KEYS.JOURNEYS,
  STORAGE_KEYS.UNITS,
  STORAGE_KEYS.MORPHEMES,
  STORAGE_KEYS.NOTEBOOK,
  STORAGE_KEYS.MODULES,
  STORAGE_KEYS.POWERUPS,
  STORAGE_KEYS.ACHIEVEMENTS,
  STORAGE_KEYS.CALIBRATION,
  STORAGE_KEYS.FIRST_RUN,
];

export const LATEST_VERSIONS: Record<StorageKey, number> = {
  [STORAGE_KEYS.SESSION]: 1,
  [STORAGE_KEYS.SESSION_BACKUP]: 1,
  [STORAGE_KEYS.JOURNEYS]: 1,
  [STORAGE_KEYS.UNITS]: 2,
  [STORAGE_KEYS.MORPHEMES]: 1,
  [STORAGE_KEYS.NOTEBOOK]: 1,
  [STORAGE_KEYS.MODULES]: 1,
  [STORAGE_KEYS.SETTINGS]: 10,
  [STORAGE_KEYS.POWERUPS]: 2,
  [STORAGE_KEYS.ACHIEVEMENTS]: 1,
  [STORAGE_KEYS.CALIBRATION]: 1,
  [STORAGE_KEYS.CORRUPT]: 1,
  [STORAGE_KEYS.FIRST_RUN]: 1,
  [STORAGE_KEYS.PRE_IMPORT_BACKUP]: 1,
};

/** Latest-version Zod payload schema per storage key. */
export const PAYLOAD_SCHEMAS: Record<StorageKey, z.ZodTypeAny> = {
  [STORAGE_KEYS.SESSION]: ActiveSessionSchema,
  [STORAGE_KEYS.SESSION_BACKUP]: ActiveSessionSchema,
  [STORAGE_KEYS.JOURNEYS]: z.array(JourneySchema),
  [STORAGE_KEYS.UNITS]: z.record(UnitProgressSchema),
  [STORAGE_KEYS.MORPHEMES]: z.record(MorphemeProgressSchema),
  [STORAGE_KEYS.NOTEBOOK]: z.array(LabArtifactSchema),
  [STORAGE_KEYS.MODULES]: ModulesStateSchema,
  [STORAGE_KEYS.SETTINGS]: SettingsSchema,
  [STORAGE_KEYS.POWERUPS]: PowerUpInventorySchema,
  [STORAGE_KEYS.ACHIEVEMENTS]: AchievementStateSchema,
  [STORAGE_KEYS.CALIBRATION]: z.array(CalibrationRecordSchema),
  [STORAGE_KEYS.CORRUPT]: z.array(QuarantineEntrySchema),
  [STORAGE_KEYS.FIRST_RUN]: FirstRunStateSchema,
  [STORAGE_KEYS.PRE_IMPORT_BACKUP]: z.record(z.unknown()),
};

/** Keys written through the storage writer (excludes backup / corrupt). */
export const WRITABLE_STORAGE_KEYS: StorageKey[] = ALL_STORAGE_KEYS.filter(
  (key) =>
    key !== STORAGE_KEYS.SESSION_BACKUP &&
    key !== STORAGE_KEYS.CORRUPT &&
    key !== STORAGE_KEYS.PRE_IMPORT_BACKUP,
);

export const STORAGE_KEY_PREFIX = 'evo-quest.v1.';

export function isStorageKey(key: string): key is StorageKey {
  return (ALL_STORAGE_KEYS as string[]).includes(key);
}

export function listLocalStorageKeys(): StorageKey[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const keys: StorageKey[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isStorageKey(key)) {
      keys.push(key);
    }
  }
  return keys;
}
