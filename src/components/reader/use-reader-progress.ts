'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Per-page progress for a reader quiz, persisted to localStorage.
 *
 * A "lap" is one full pass through every question. Progress is reported as a
 * decimal lap count with two digits past the int (e.g. 2.45 laps): completed
 * full laps plus the fraction of questions marked done in the current lap.
 * Finishing the last question of a lap rolls over: the lap counter increments
 * and the per-question marks reset for the next lap.
 */

type StoredProgress = {
  v: 1;
  lapsCompleted: number;
  done: string[];
};

const STORAGE_PREFIX = 'evo-quest.v1.reader.';

function read(key: string): StoredProgress {
  if (typeof window === 'undefined') return { v: 1, lapsCompleted: 0, done: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return { v: 1, lapsCompleted: 0, done: [] };
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    return {
      v: 1,
      lapsCompleted: typeof parsed.lapsCompleted === 'number' ? parsed.lapsCompleted : 0,
      done: Array.isArray(parsed.done) ? parsed.done.filter((d) => typeof d === 'string') : [],
    };
  } catch {
    return { v: 1, lapsCompleted: 0, done: [] };
  }
}

function write(key: string, value: StoredProgress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — progress is best-effort */
  }
}

export type ReaderProgress = {
  hydrated: boolean;
  total: number;
  doneCount: number;
  isDone: (id: string) => boolean;
  toggle: (id: string) => void;
  /** Idempotent: marks an id done (used when an answer is revealed). */
  markDone: (id: string) => void;
  /** Whole-number percent complete for the current lap. */
  lapPct: number;
  /** Decimal lap count (completed laps + current-lap fraction). */
  totalLaps: number;
  /** totalLaps formatted to two decimals, e.g. "2.45". */
  totalLapsLabel: string;
  reset: () => void;
};

export function useReaderProgress(key: string, total: number): ReaderProgress {
  const [state, setState] = useState<StoredProgress>({ v: 1, lapsCompleted: 0, done: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read(key));
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (hydrated) write(key, state);
  }, [hydrated, key, state]);

  const doneSet = useMemo(() => new Set(state.done), [state.done]);

  const isDone = useCallback((id: string) => doneSet.has(id), [doneSet]);

  const toggle = useCallback(
    (id: string) => {
      setState((prev) => {
        const set = new Set(prev.done);
        if (set.has(id)) {
          set.delete(id);
          return { ...prev, done: [...set] };
        }
        set.add(id);
        // Completing the final question rolls the lap over.
        if (total > 0 && set.size >= total) {
          return { ...prev, lapsCompleted: prev.lapsCompleted + 1, done: [] };
        }
        return { ...prev, done: [...set] };
      });
    },
    [total],
  );

  const markDone = useCallback(
    (id: string) => {
      setState((prev) => {
        if (prev.done.includes(id)) return prev;
        const set = new Set(prev.done);
        set.add(id);
        if (total > 0 && set.size >= total) {
          return { ...prev, lapsCompleted: prev.lapsCompleted + 1, done: [] };
        }
        return { ...prev, done: [...set] };
      });
    },
    [total],
  );

  const reset = useCallback(() => {
    setState({ v: 1, lapsCompleted: 0, done: [] });
  }, []);

  const doneCount = doneSet.size;
  const lapPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const totalLaps = state.lapsCompleted + (total > 0 ? doneCount / total : 0);
  const totalLapsLabel = totalLaps.toFixed(2);

  return {
    hydrated,
    total,
    doneCount,
    isDone,
    toggle,
    markDone,
    lapPct,
    totalLaps,
    totalLapsLabel,
    reset,
  };
}
