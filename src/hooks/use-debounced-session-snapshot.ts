'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ActiveSession, SessionState } from '@/types';

const SNAPSHOT_DEBOUNCE_MS = 450;

type PlaySessionState = Extract<SessionState, { phase: 'play' }>;

/**
 * Debounce in-flight template snapshots so drag/tinker interactions do not
 * re-render the full play shell or persist on every pointer move.
 */
export function useDebouncedSessionSnapshot(
  session: ActiveSession | null,
  setSessionState: (state: SessionState) => void,
) {
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const pendingRef = useRef<unknown>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const snap = pendingRef.current;
    const s = sessionRef.current;
    if (snap === undefined || !s) return;
    pendingRef.current = undefined;
    const next: PlaySessionState = {
      phase: 'play',
      session: { ...s, inFlightSnapshot: snap },
    };
    setSessionState(next);
  }, [setSessionState]);

  const saveSnapshot = useCallback(
    (snapshot: unknown) => {
      pendingRef.current = snapshot;
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        flush();
      }, SNAPSHOT_DEBOUNCE_MS);
    },
    [flush],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (pendingRef.current !== undefined) flush();
    };
  }, [flush]);

  useEffect(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = undefined;
  }, [session?.currentIndex, session?.journeyId]);

  return saveSnapshot;
}
