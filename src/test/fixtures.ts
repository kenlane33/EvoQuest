import type {
  ActiveSession,
  Attempt,
  ScheduledItem,
  SelectionDescriptor,
  UserState,
} from '@/types';

export const EMPTY_USER_STATE: UserState = {
  units: {},
  disabledUnitIds: [],
};

export const SAMPLE_SELECTION: SelectionDescriptor = {
  kind: 'quick-mix',
  length: 3,
};

export const SAMPLE_QUEUE: ScheduledItem[] = [
  {
    unitId: 'evo.origin.abiogenesis.miller-urey',
    templateKind: 'speed-reveal-mnemonic',
    templateId: 'quiz.evo.origin.miller-urey.sr-1',
  },
  {
    unitId: 'evo.deep-time.cambrian.explosion',
    templateKind: 'speed-reveal-mnemonic',
    templateId: 'quiz.evo.deep-time.cambrian.sr-1',
  },
];

export function makeAttempt(
  overrides: Partial<Attempt> & Pick<Attempt, 'correct'>,
): Attempt {
  return {
    attemptId: 'att-1',
    unitId: SAMPLE_QUEUE[0].unitId,
    templateKind: SAMPLE_QUEUE[0].templateKind,
    templateId: SAMPLE_QUEUE[0].templateId,
    ms: 1200,
    ...overrides,
  };
}

export function makeSession(overrides: Partial<ActiveSession> = {}): ActiveSession {
  return {
    journeyId: 'journey-test-1',
    queue: SAMPLE_QUEUE,
    currentIndex: 0,
    attempts: [],
    startedAt: Date.now() - 60_000,
    bestStreak: 0,
    currentStreak: 0,
    selection: SAMPLE_SELECTION,
    powerupUsage: {},
    artifactIds: [],
    ...overrides,
  };
}
