import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearSessionUi,
  persistSessionUi,
  readSessionUi,
  resumeSessionState,
} from '@/storage/session-ui';
import type { ActiveSession } from '@/types/schemas';

const session: ActiveSession = {
  journeyId: 'j1',
  queue: [{ unitId: 'u1', templateKind: 'fill', templateId: 'q1' }],
  currentIndex: 0,
  attempts: [],
  startedAt: 1,
  bestStreak: 0,
  currentStreak: 0,
  selection: { kind: 'quick-mix', length: 10 },
  powerupUsage: {},
  artifactIds: [],
};

describe('session-ui', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearSessionUi();
  });

  it('defaults to brief when no UI phase is stored', () => {
    expect(resumeSessionState(session)).toEqual({ phase: 'brief', session });
  });

  it('restores play phase from sessionStorage', () => {
    persistSessionUi({ phase: 'play', session });
    expect(readSessionUi()?.phase).toBe('play');
    expect(resumeSessionState(session)).toEqual({ phase: 'play', session });
  });

  it('restores feedback phase with payload', () => {
    const feedback = {
      correct: true,
      unitId: 'u1',
      templateKind: 'fill',
      explanation: 'Nice.',
    };
    persistSessionUi({ phase: 'feedback', session, feedback });
    expect(resumeSessionState(session)).toEqual({ phase: 'feedback', session, feedback });
  });
});
