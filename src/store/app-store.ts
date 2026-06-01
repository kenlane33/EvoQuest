'use client';

import { create } from 'zustand';
import { ulid } from '@/lib/id';
import { buildGameQueue, introBiochemUnitIds } from '@/content/catalog';
import type {
  AchievementState,
  ActiveSession,
  CalibrationRecord,
  Journey,
  PowerUpInventory,
  PowerUpInstance,
  ScheduledItem,
  SelectionDescriptor,
  SessionState,
  Settings,
  UnitProgress,
  UserState,
} from '@/types';
import { HINT_COUNTDOWN_MS, HINT_REVEAL_MS } from '@/types/schemas';
import { rollStreakPowerUp } from '@/engine/powerups/rolls';
import { advanceDailyStreak } from '@/engine/achievements/detect';
import {
  exportAll,
  flushNow,
  importAll,
  loadState,
  removeState,
  saveState,
} from '@/storage';
import { STORAGE_KEY_PREFIX, STORAGE_KEYS } from '@/storage/keys';

export const DEFAULT_POWERUP_INVENTORY: PowerUpInventory = {
  slots: [null, null, null],
  earned: 0,
  spent: 0,
  firstUseShown: [],
};

function dayKeyFromTimestamp(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const DEFAULT_ACHIEVEMENT_STATE: AchievementState = {
  earned: {},
  dailyStreak: { count: 0, lastDayKey: dayKeyFromTimestamp(Date.now()) },
  firstClearedWingIds: [],
};

function loadPayload<T>(key: (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS], fallback: T): T {
  const result = loadState<T>(key);
  return result.ok ? result.value : fallback;
}

function mergeSettings(raw: Settings): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    appearance: { ...DEFAULT_SETTINGS.appearance, ...raw.appearance },
    audio: { ...DEFAULT_SETTINGS.audio, ...raw.audio },
    reading: { ...DEFAULT_SETTINGS.reading, ...raw.reading },
    reveals: { ...DEFAULT_SETTINGS.reveals, ...raw.reveals },
    practice: {
      ...DEFAULT_SETTINGS.practice,
      ...raw.practice,
      revisitLength: raw.practice?.revisitLength ?? DEFAULT_SETTINGS.practice.revisitLength,
    },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...raw.privacy },
  };
}

function persistIfHydrated(hydrated: boolean, key: (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS], payload: unknown) {
  if (hydrated) saveState(key, payload);
}

function persistSession(hydrated: boolean, sessionState: SessionState) {
  if (!hydrated) return;
  const session = extractActiveSession(sessionState);
  if (session) {
    saveState(STORAGE_KEYS.SESSION, session);
  } else {
    removeState(STORAGE_KEYS.SESSION);
  }
}

export const DEFAULT_SETTINGS: Settings = {
  appearance: {
    contrast: 'normal',
    fontSize: 'md',
    bodyFont: 'nunito',
    headlineFont: 'syne',
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
    revisitLength: 12,
  },
  privacy: {
    anonymousCrashReports: false,
  },
};

type AppState = {
  hydrated: boolean;
  settings: Settings;
  unitProgress: Record<string, UnitProgress>;
  powerups: PowerUpInventory;
  achievementState: AchievementState;
  morphemeProgress: Record<string, import('@/types').MorphemeProgress>;
  sessionState: SessionState;
  journeys: Journey[];
  calibrationRecords: CalibrationRecord[];
  firstRunCompleted: boolean;
  /** Journey-scoped rewards earned this session (for end screen). */
  pendingJourneyRewards: {
    achievementsEarned: string[];
    powerupsEarned: PowerUpInstance[];
    morphemesTouchedFirst: string[];
    tierUps: Array<{ unitId: string; tier: UnitProgress['tier'] }>;
  };
  loadFromStorage: () => void;
  setSettings: (patch: Partial<Settings> | ((s: Settings) => Settings)) => void;
  updateUnitProgress: (unitId: string, progress: UnitProgress) => void;
  grantPowerUp: (instance: PowerUpInstance) => { granted: boolean; needsSwap: boolean; instance: PowerUpInstance };
  swapPowerUp: (slotIndex: 0 | 1 | 2, instance: PowerUpInstance) => void;
  usePowerUp: (slotIndex: 0 | 1 | 2) => PowerUpInstance | null;
  markPowerUpFirstUseShown: (powerUpId: string) => void;
  rollStreakReward: (streak: number, recentWingId?: string) => PowerUpInstance | null;
  earnAchievement: (achievementId: string) => boolean;
  updateAchievementState: (patch: Partial<AchievementState>) => void;
  updateMorphemeProgress: (morphemeId: string, progress: import('@/types').MorphemeProgress) => void;
  resetPendingJourneyRewards: () => void;
  appendPendingJourneyReward: (patch: Partial<AppState['pendingJourneyRewards']>) => void;
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
  const result = loadState<ActiveSession>(STORAGE_KEYS.SESSION);
  const saved = result.ok ? result.value : null;
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
  powerups: DEFAULT_POWERUP_INVENTORY,
  achievementState: DEFAULT_ACHIEVEMENT_STATE,
  morphemeProgress: {},
  firstRunCompleted: false,
  pendingJourneyRewards: {
    achievementsEarned: [],
    powerupsEarned: [],
    morphemesTouchedFirst: [],
    tierUps: [],
  },

  loadFromStorage: () => {
    const rawSettings = loadPayload<Settings | null>(STORAGE_KEYS.SETTINGS, null);
    const settings = rawSettings ? mergeSettings(rawSettings) : DEFAULT_SETTINGS;
    const storedProgress = loadPayload<Record<string, UnitProgress>>(STORAGE_KEYS.UNITS, {});
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
          quizAttemptCounts: {},
          tier: 'unlocked',
          unlockedAt: Date.now(),
          achievementEarned: false,
        };
      }
    }
    const journeys = loadPayload<Journey[]>(STORAGE_KEYS.JOURNEYS, []);
    const calibrationRecords = loadPayload<CalibrationRecord[]>(STORAGE_KEYS.CALIBRATION, []);
    const firstRun = loadPayload<{ completedAt?: number }>(STORAGE_KEYS.FIRST_RUN, {});
    const rawPowerups = loadPayload<PowerUpInventory | null>(STORAGE_KEYS.POWERUPS, null);
    const powerups: PowerUpInventory = rawPowerups
      ? {
          ...DEFAULT_POWERUP_INVENTORY,
          ...rawPowerups,
          firstUseShown: rawPowerups.firstUseShown ?? [],
        }
      : DEFAULT_POWERUP_INVENTORY;
    const rawAchievements = loadPayload<AchievementState | null>(STORAGE_KEYS.ACHIEVEMENTS, null);
    const achievementState: AchievementState = rawAchievements
      ? {
          ...DEFAULT_ACHIEVEMENT_STATE,
          ...rawAchievements,
          dailyStreak: rawAchievements.dailyStreak ?? DEFAULT_ACHIEVEMENT_STATE.dailyStreak,
          firstClearedWingIds: rawAchievements.firstClearedWingIds ?? [],
        }
      : DEFAULT_ACHIEVEMENT_STATE;
    const morphemeProgress =
      loadPayload<Record<string, import('@/types').MorphemeProgress>>(STORAGE_KEYS.MORPHEMES, {});
    const sessionState = sessionFromStorage();

    set({
      hydrated: true,
      settings,
      unitProgress,
      powerups,
      achievementState,
      morphemeProgress,
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
      persistIfHydrated(s.hydrated, STORAGE_KEYS.SETTINGS, next);
      return { settings: next };
    });
  },

  updateUnitProgress: (unitId, progress) => {
    set((s) => {
      const unitProgress = { ...s.unitProgress, [unitId]: progress };
      persistIfHydrated(s.hydrated, STORAGE_KEYS.UNITS, unitProgress);
      return { unitProgress };
    });
  },

  grantPowerUp: (instance) => {
    const state = get();
    const emptyIndex = state.powerups.slots.findIndex((s) => s === null);
    if (emptyIndex === -1) {
      return { granted: false, needsSwap: true, instance };
    }
    const slots = [...state.powerups.slots] as PowerUpInventory['slots'];
    slots[emptyIndex] = instance;
    const powerups: PowerUpInventory = {
      ...state.powerups,
      slots,
      earned: state.powerups.earned + 1,
    };
    set((s) => {
      persistIfHydrated(s.hydrated, STORAGE_KEYS.POWERUPS, powerups);
      return {
        powerups,
        pendingJourneyRewards: {
          ...s.pendingJourneyRewards,
          powerupsEarned: [...s.pendingJourneyRewards.powerupsEarned, instance],
        },
      };
    });
    return { granted: true, needsSwap: false, instance };
  },

  swapPowerUp: (slotIndex, instance) => {
    set((s) => {
      const slots = [...s.powerups.slots] as PowerUpInventory['slots'];
      slots[slotIndex] = instance;
      const powerups: PowerUpInventory = {
        ...s.powerups,
        slots,
        earned: s.powerups.earned + 1,
      };
      persistIfHydrated(s.hydrated, STORAGE_KEYS.POWERUPS, powerups);
      return {
        powerups,
        pendingJourneyRewards: {
          ...s.pendingJourneyRewards,
          powerupsEarned: [...s.pendingJourneyRewards.powerupsEarned, instance],
        },
      };
    });
  },

  usePowerUp: (slotIndex) => {
    const state = get();
    const instance = state.powerups.slots[slotIndex];
    if (!instance) return null;
    const slots = [...state.powerups.slots] as PowerUpInventory['slots'];
    slots[slotIndex] = null;
    const powerups: PowerUpInventory = {
      ...state.powerups,
      slots,
      spent: state.powerups.spent + 1,
    };
    set((s) => {
      persistIfHydrated(s.hydrated, STORAGE_KEYS.POWERUPS, powerups);
      return { powerups };
    });
    return instance;
  },

  markPowerUpFirstUseShown: (powerUpId) => {
    set((s) => {
      if (s.powerups.firstUseShown.includes(powerUpId)) return s;
      const powerups: PowerUpInventory = {
        ...s.powerups,
        firstUseShown: [...s.powerups.firstUseShown, powerUpId],
      };
      persistIfHydrated(s.hydrated, STORAGE_KEYS.POWERUPS, powerups);
      return { powerups };
    });
  },

  rollStreakReward: (streak, recentWingId) => {
    const state = get();
    const roll = rollStreakPowerUp(streak, recentWingId, state.powerups);
    if (!roll) return null;
    const result = get().grantPowerUp(roll.instance);
    if (result.needsSwap) {
      return roll.instance;
    }
    return result.granted ? roll.instance : null;
  },

  earnAchievement: (achievementId) => {
    const state = get();
    if (state.achievementState.earned[achievementId]) return false;
    const achievementState: AchievementState = {
      ...state.achievementState,
      earned: { ...state.achievementState.earned, [achievementId]: Date.now() },
    };
    set((s) => {
      persistIfHydrated(s.hydrated, STORAGE_KEYS.ACHIEVEMENTS, achievementState);
      return {
        achievementState,
        pendingJourneyRewards: {
          ...s.pendingJourneyRewards,
          achievementsEarned: [...s.pendingJourneyRewards.achievementsEarned, achievementId],
        },
      };
    });
    return true;
  },

  updateAchievementState: (patch) => {
    set((s) => {
      const achievementState: AchievementState = {
        ...s.achievementState,
        ...patch,
        earned: patch.earned ?? s.achievementState.earned,
        dailyStreak: patch.dailyStreak ?? s.achievementState.dailyStreak,
        firstClearedWingIds: patch.firstClearedWingIds ?? s.achievementState.firstClearedWingIds,
      };
      persistIfHydrated(s.hydrated, STORAGE_KEYS.ACHIEVEMENTS, achievementState);
      return { achievementState };
    });
  },

  updateMorphemeProgress: (morphemeId, progress) => {
    set((s) => {
      const morphemeProgress = { ...s.morphemeProgress, [morphemeId]: progress };
      persistIfHydrated(s.hydrated, STORAGE_KEYS.MORPHEMES, morphemeProgress);
      return { morphemeProgress };
    });
  },

  resetPendingJourneyRewards: () => {
    set({
      pendingJourneyRewards: {
        achievementsEarned: [],
        powerupsEarned: [],
        morphemesTouchedFirst: [],
        tierUps: [],
      },
    });
  },

  appendPendingJourneyReward: (patch) => {
    set((s) => ({
      pendingJourneyRewards: {
        achievementsEarned: patch.achievementsEarned ?? s.pendingJourneyRewards.achievementsEarned,
        powerupsEarned: patch.powerupsEarned ?? s.pendingJourneyRewards.powerupsEarned,
        morphemesTouchedFirst: patch.morphemesTouchedFirst ?? s.pendingJourneyRewards.morphemesTouchedFirst,
        tierUps: patch.tierUps ?? s.pendingJourneyRewards.tierUps,
      },
    }));
  },

  setSessionState: (sessionState) => {
    set((s) => {
      persistSession(s.hydrated, sessionState);
      return { sessionState };
    });
  },

  setSession: (session) => {
    set((s) => {
      const sessionState: SessionState = session
        ? { phase: 'brief', session }
        : { phase: 'menu' };
      persistSession(s.hydrated, sessionState);
      return { sessionState };
    });
  },

  addJourney: (journey) => {
    set((s) => {
      const journeys = [journey, ...s.journeys].slice(0, 500);
      persistIfHydrated(s.hydrated, STORAGE_KEYS.JOURNEYS, journeys);
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
      persistIfHydrated(s.hydrated, STORAGE_KEYS.CALIBRATION, calibrationRecords);
      return { calibrationRecords };
    });
  },

  completeFirstRun: () => {
    set((s) => {
      persistIfHydrated(s.hydrated, STORAGE_KEYS.FIRST_RUN, { completedAt: Date.now() });
      return { firstRunCompleted: true };
    });
  },

  embarkNewQuest: (selection) => {
    const state = get();
    const desc: SelectionDescriptor = selection ?? {
      kind: 'quick-mix',
      length: state.settings.practice.defaultLength,
    };
    const { next: dailyStreak, achievements: dailyAchievements } = advanceDailyStreak(
      state.achievementState,
    );
    if (dailyStreak !== state.achievementState.dailyStreak) {
      get().updateAchievementState({ dailyStreak });
    }
    for (const ach of dailyAchievements) {
      get().earnAchievement(ach.id);
    }

    get().resetPendingJourneyRewards();

    const userState: UserState = {
      units: state.unitProgress,
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
    removeState(STORAGE_KEYS.SESSION);
    removeState(STORAGE_KEYS.SESSION_BACKUP);
    if (resetState) {
      set({ sessionState: { phase: 'menu' } });
    }
  },

  exportAllData: () => {
    flushNow();
    return JSON.stringify(exportAll(), null, 2);
  },

  importAllData: (json) => {
    try {
      const data = JSON.parse(json) as unknown;
      if (typeof window === 'undefined') return false;
      flushNow();
      const result = importAll(data);
      if (result.imported.length > 0) {
        get().loadFromStorage();
      }
      return result.ok;
    } catch {
      return false;
    }
  },

  resetAllData: () => {
    if (typeof window !== 'undefined') {
      flushNow();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    }
    set({
      settings: DEFAULT_SETTINGS,
      unitProgress: {},
      powerups: DEFAULT_POWERUP_INVENTORY,
      achievementState: DEFAULT_ACHIEVEMENT_STATE,
      morphemeProgress: {},
      sessionState: { phase: 'menu' },
      journeys: [],
      calibrationRecords: [],
      firstRunCompleted: false,
      pendingJourneyRewards: {
        achievementsEarned: [],
        powerupsEarned: [],
        morphemesTouchedFirst: [],
        tierUps: [],
      },
    });
  },
}));

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

export function usePowerups() {
  return useAppStore((s) => s.powerups);
}

export function useAchievementState() {
  return useAppStore((s) => s.achievementState);
}

export { dayKeyFromTimestamp };
