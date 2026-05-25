export * from '@/types/schemas';

export type Feedback = {
  correct: boolean;
  unitId: string;
  templateKind: string;
  explanation?: string;
};

export type SessionSummary = {
  journeyId: string;
  correct: number;
  total: number;
  bestStreak: number;
  elapsedMs: number;
  abandoned?: boolean;
};

export type SessionState =
  | { phase: 'loading' }
  | { phase: 'menu' }
  | { phase: 'brief'; session: import('@/types/schemas').ActiveSession }
  | { phase: 'play'; session: import('@/types/schemas').ActiveSession }
  | { phase: 'feedback'; session: import('@/types/schemas').ActiveSession; feedback: Feedback }
  | { phase: 'paused'; session: import('@/types/schemas').ActiveSession }
  | { phase: 'end'; summary: SessionSummary };

export type PowerUpEffect =
  | { kind: 'reveal-option'; index: number }
  | { kind: 'skip-no-penalty' }
  | { kind: 'add-time'; ms: number }
  | { kind: 'allow-retry' }
  | { kind: 'reveal-mnemonic-now' }
  | { kind: 'streak-shield' }
  | { kind: 'reroll-question' }
  | { kind: 'show-etymology-all' }
  | { kind: 'palace-teleport'; toTileId: string };

export type SessionAction =
  | { kind: 'embark'; selection: import('@/types/schemas').SelectionDescriptor; queue: import('@/types/schemas').ScheduledItem[] }
  | { kind: 'resume'; saved: import('@/types/schemas').ActiveSession }
  | { kind: 'briefEnd' }
  | { kind: 'answer'; correct: boolean; ms: number; details?: unknown }
  | { kind: 'feedbackEnd' }
  | { kind: 'pause' }
  | { kind: 'unpause' }
  | { kind: 'usePowerUp'; powerUpId: string; effects: PowerUpEffect[] }
  | { kind: 'midQuestionSnapshot'; snapshot: unknown }
  | { kind: 'endJourney'; abandoned?: boolean };

export type UserState = {
  units: Record<string, import('@/types/schemas').UnitProgress>;
  disabledUnitIds?: string[];
};

export type World = {
  modules: import('@/types/schemas').ContentModule[];
};
