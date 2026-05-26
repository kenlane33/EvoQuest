'use client';

import { create } from 'zustand';
import { ulid } from '@/lib/id';
import { buildGameQueue, introBiochemUnitIds } from '@/content/catalog';
import type {
  ActiveSession,
  CalibrationRecord,
  Journey,
  ScheduledItem,
  SelectionDescriptor,
  SessionState,
  Settings,
  StoredBlob,
  UnitProgress,
  UserState,
} from '@/types';
import { HINT_COUNTDOWN_MS, HINT_REVEAL_MS } from '@/types/schemas';

const APP_VERSION = '0.1.0';
const SCHEMA_VERSION = 1;

export const STORAGE_KEYS = {
  session: 'evo-quest.v1.session',
  sessionBackup: 'evo-quest.v1.session.backup',
  units: 'evo-quest.v1.units',
  journeys: 'evo-quest.v1.journeys',
  settings: 'evo-quest.v1.settings',
  firstRun: 'evo-quest.v1.firstRun',
  calibration: 'evo-quest.v1.calibration',
} as const;

export const DEFAULT_SETTINGS: Settings = {
  appearance: {
    contrast: 'normal',
    fontSize: 'md',
    bodyFont: 'nunito',
    colorBlindSafe: false,
  },
  motion: 'full',
  audio: {
    enabled: true,
    volume: 0.6,
    stings: {},
  },
  reading: {
    enabled: true,
    autoRead: true,
    voice: 'azelma',
    serverUrl: '',
  },
  reveals: {
    countdownMs: HINT_COUNTDOWN_MS.default,
    revealMs: HINT_REVEAL_MS.default,
  },
  practice: {
    confidenceFrequency: 'every-3',
    defaultMood: 'mixed',
    defaultLength: 10,
  },
  privacy: {
    anonymousCrashReports: false,
  },
};

type AppState = {
  hydrated: boolean;
  settings: Settings;
  unitProgress: Record<string, UnitProgress>;
  sessionState: SessionState;
  journeys: Journey[];
  calibrationRecords: CalibrationRecord[];
  firstRunCompleted: boolean;
  loadFromStorage: () => void;
  setSettings: (patch: Partial<Settings> | ((s: Settings) => Settings)) => void;
  updateUnitProgress: (unitId: string, progress: UnitProgress) => void;
  setSessionState: (state: SessionState) => void;
  setSession: (session: ActiveSession | null) => void;
  addJourney: (journey: Journey) => void;
  appendCalibration: (record: Omit<CalibrationRecord, 'id' | 'recordedAt'>) => void;
  completeFirstRun: () => void;
  embarkNewQuest: (selection?: SelectionDescriptor) => { sessionId: string; queue: ScheduledItem[] };
  clearSession: (resetState?: boolean) => void;
  exportAllData: () => string;
  importAllData: (json: string) => boolean;
  resetAllData: () => void;
};

function wrap<T>(payload: T): StoredBlob<T> {
  return {
    schemaVersion: SCHEMA_VERSION,
    savedAt: Date.now(),
    appVersion: APP_VERSION,
    payload,
  };
}

function readBlob<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredBlob<T> | T;
    if (parsed && typeof parsed === 'object' && 'payload' in parsed) {
      return (parsed as StoredBlob<T>).payload;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

function writeBlob<T>(key: string, payload: T, rotateBackup = false) {
  if (typeof window === 'undefined') return;
  try {
    if (rotateBackup) {
      const existing = localStorage.getItem(key);
      if (existing) {
        localStorage.setItem(STORAGE_KEYS.sessionBackup, existing);
      }
    }
    localStorage.setItem(key, JSON.stringify(wrap(payload)));
  } catch {
    /* quota or private mode */
  }
}

function removeKey(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist(state: AppState) {
  if (typeof window === 'undefined' || !state.hydrated) return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    writeBlob(STORAGE_KEYS.settings, state.settings);
    writeBlob(STORAGE_KEYS.units, state.unitProgress);
    writeBlob(STORAGE_KEYS.journeys, state.journeys);
    writeBlob(STORAGE_KEYS.calibration, state.calibrationRecords);
    writeBlob(STORAGE_KEYS.firstRun, { completedAt: state.firstRunCompleted ? Date.now() : undefined });

    const session = extractActiveSession(state.sessionState);
    if (session) {
      writeBlob(STORAGE_KEYS.session, session, true);
    } else {
      removeKey(STORAGE_KEYS.session);
    }
  }, 300);
}

function extractActiveSession(state: SessionState): ActiveSession | null {
  switch (state.phase) {
    case 'brief':
    case 'play':
    case 'feedback':
    case 'paused':
      return state.session;
    default:
      return null;
  }
}

function sessionFromStorage(): SessionState {
  const saved = readBlob<ActiveSession>(STORAGE_KEYS.session);
  if (saved && saved.queue?.length && saved.currentIndex < saved.queue.length) {
    return { phase: 'brief', session: saved };
  }
  return { phase: 'menu' };
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  settings: DEFAULT_SETTINGS,
  unitProgress: {},
  sessionState: { phase: 'loading' },
  journeys: [],
  calibrationRecords: [],
  firstRunCompleted: false,

  loadFromStorage: () => {
    const rawSettings = readBlob<Settings>(STORAGE_KEYS.settings);
    const settings = rawSettings
      ? {
          ...DEFAULT_SETTINGS,
          ...rawSettings,
          appearance: { ...DEFAULT_SETTINGS.appearance, ...rawSettings.appearance },
          audio: { ...DEFAULT_SETTINGS.audio, ...rawSettings.audio },
          reading: { ...DEFAULT_SETTINGS.reading, ...rawSettings.reading },
          reveals: { ...DEFAULT_SETTINGS.reveals, ...rawSettings.reveals },
          practice: { ...DEFAULT_SETTINGS.practice, ...rawSettings.practice },
          privacy: { ...DEFAULT_SETTINGS.privacy, ...rawSettings.privacy },
        }
      : DEFAULT_SETTINGS;
    const storedProgress = readBlob<Record<string, UnitProgress>>(STORAGE_KEYS.units) ?? {};
    const unitProgress = { ...storedProgress };
    for (const unitId of introBiochemUnitIds()) {
      if (!unitProgress[unitId]) {
        unitProgress[unitId] = {
          unitId,
          firstSeenAt: 0,
          attempts: 0,
          correct: 0,
          lastSeenAt: 0,
          lastFiveOutcomes: [],
          templatesEncountered: [],
          tier: 'unlocked',
          unlockedAt: Date.now(),
          achievementEarned: false,
        };
      }
    }
    const journeys = readBlob<Journey[]>(STORAGE_KEYS.journeys) ?? [];
    const calibrationRecords =
      readBlob<CalibrationRecord[]>(STORAGE_KEYS.calibration) ?? [];
    const firstRun = readBlob<{ completedAt?: number }>(STORAGE_KEYS.firstRun);
    const sessionState = sessionFromStorage();

    set({
      hydrated: true,
      settings,
      unitProgress,
      journeys,
      calibrationRecords,
      firstRunCompleted: Boolean(firstRun?.completedAt),
      sessionState,
    });
  },

  setSettings: (patch) => {
    set((s) => {
      const next =
        typeof patch === 'function'
          ? patch(s.settings)
          : {
              ...s.settings,
              ...patch,
              appearance: { ...s.settings.appearance, ...patch.appearance },
              audio: { ...s.settings.audio, ...patch.audio },
              reading: { ...s.settings.reading, ...patch.reading },
              reveals: { ...s.settings.reveals, ...patch.reveals },
              practice: { ...s.settings.practice, ...patch.practice },
              privacy: { ...s.settings.privacy, ...patch.privacy },
            };
      schedulePersist({ ...s, settings: next });
      return { settings: next };
    });
  },

  updateUnitProgress: (unitId, progress) => {
    set((s) => {
      const unitProgress = { ...s.unitProgress, [unitId]: progress };
      schedulePersist({ ...s, unitProgress });
      return { unitProgress };
    });
  },

  setSessionState: (sessionState) => {
    set((s) => {
      schedulePersist({ ...s, sessionState });
      return { sessionState };
    });
  },

  setSession: (session) => {
    set((s) => {
      const sessionState: SessionState = session
        ? { phase: 'brief', session }
        : { phase: 'menu' };
      schedulePersist({ ...s, sessionState });
      return { sessionState };
    });
  },

  addJourney: (journey) => {
    set((s) => {
      const journeys = [journey, ...s.journeys].slice(0, 500);
      schedulePersist({ ...s, journeys });
      return { journeys };
    });
  },

  appendCalibration: (record) => {
    set((s) => {
      const entry: CalibrationRecord = {
        ...record,
        id: ulid(),
        recordedAt: Date.now(),
      };
      const calibrationRecords = [entry, ...s.calibrationRecords].slice(0, 2000);
      schedulePersist({ ...s, calibrationRecords });
      return { calibrationRecords };
    });
  },

  completeFirstRun: () => {
    set((s) => {
      schedulePersist({ ...s, firstRunCompleted: true });
      return { firstRunCompleted: true };
    });
  },

  embarkNewQuest: (selection) => {
    const desc: SelectionDescriptor = selection ?? {
      kind: 'quick-mix',
      length: get().settings.practice.defaultLength,
    };
    const userState: UserState = {
      units: get().unitProgress,
    };
    const queue = buildGameQueue(desc, userState);
    const session: ActiveSession = {
      journeyId: ulid(),
      queue,
      currentIndex: 0,
      attempts: [],
      startedAt: Date.now(),
      bestStreak: 0,
      currentStreak: 0,
      selection: desc,
      powerupUsage: {},
      artifactIds: [],
    };
    get().setSession(session);
    return { sessionId: session.journeyId, queue };
  },

  clearSession: (resetState = true) => {
    removeKey(STORAGE_KEYS.session);
    removeKey(STORAGE_KEYS.sessionBackup);
    if (resetState) {
      set({ sessionState: { phase: 'menu' } });
    }
  },

  exportAllData: () => {
    const keys = Object.values(STORAGE_KEYS);
    const storageKeys: Record<string, unknown> = {};
    if (typeof window !== 'undefined') {
      for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            storageKeys[key] = JSON.parse(raw);
          } catch {
            storageKeys[key] = raw;
          }
        }
      }
    }
    return JSON.stringify(
      {
        formatVersion: 1,
        exportedAt: Date.now(),
        appVersion: APP_VERSION,
        storageKeys,
      },
      null,
      2,
    );
  },

  importAllData: (json) => {
    try {
      const envelope = JSON.parse(json) as { storageKeys?: Record<string, unknown> };
      if (!envelope.storageKeys || typeof window === 'undefined') return false;
      for (const [key, value] of Object.entries(envelope.storageKeys)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
      get().loadFromStorage();
      return true;
    } catch {
      return false;
    }
  },

  resetAllData: () => {
    if (typeof window !== 'undefined') {
      for (const key of Object.values(STORAGE_KEYS)) {
        localStorage.removeItem(key);
      }
    }
    set({
      settings: DEFAULT_SETTINGS,
      unitProgress: {},
      sessionState: { phase: 'menu' },
      journeys: [],
      calibrationRecords: [],
      firstRunCompleted: false,
    });
  },
}));

/** Subscribe once at app boot to flush on tab hide / unload. */
export function attachPersistHooks() {
  if (typeof window === 'undefined') return () => {};

  const flush = () => {
    const state = useAppStore.getState();
    if (!state.hydrated) return;
    if (persistTimer) clearTimeout(persistTimer);
    writeBlob(STORAGE_KEYS.settings, state.settings);
    writeBlob(STORAGE_KEYS.units, state.unitProgress);
    writeBlob(STORAGE_KEYS.journeys, state.journeys);
    writeBlob(STORAGE_KEYS.calibration, state.calibrationRecords);
    writeBlob(STORAGE_KEYS.firstRun, { completedAt: state.firstRunCompleted ? Date.now() : undefined });
    const session = extractActiveSession(state.sessionState);
    if (session) writeBlob(STORAGE_KEYS.session, session, true);
  };

  const onHide = () => {
    if (document.visibilityState === 'hidden') flush();
  };

  window.addEventListener('beforeunload', flush);
  document.addEventListener('visibilitychange', onHide);

  return () => {
    window.removeEventListener('beforeunload', flush);
    document.removeEventListener('visibilitychange', onHide);
  };
}

export function useHydrated() {
  return useAppStore((s) => s.hydrated);
}

export function useSettings() {
  return useAppStore((s) => s.settings);
}

export function useUnitProgress() {
  return useAppStore((s) => s.unitProgress);
}

export function useSessionState() {
  return useAppStore((s) => s.sessionState);
}

export function useJourneys() {
  return useAppStore((s) => s.journeys);
}
