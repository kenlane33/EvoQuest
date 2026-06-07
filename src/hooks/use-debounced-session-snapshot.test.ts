import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedSessionSnapshot } from '@/hooks/use-debounced-session-snapshot';
import type { ActiveSession } from '@/types';

const baseSession: ActiveSession = {
  journeyId: 'j1',
  startedAt: 1,
  currentIndex: 0,
  currentStreak: 0,
  bestStreak: 0,
  selection: { kind: 'quick-mix', length: 5 },
  queue: [],
  attempts: [],
  artifactIds: [],
};

describe('useDebouncedSessionSnapshot', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces snapshot writes to session state', () => {
    const setSessionState = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedSessionSnapshot(baseSession, setSessionState),
    );

    act(() => {
      result.current({ step: 1 });
      result.current({ step: 2 });
    });

    expect(setSessionState).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(setSessionState).toHaveBeenCalledTimes(1);
    expect(setSessionState).toHaveBeenCalledWith({
      phase: 'play',
      session: { ...baseSession, inFlightSnapshot: { step: 2 } },
    });
  });
});
