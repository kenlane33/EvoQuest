'use client';

import { useCallback, useEffect, useState } from 'react';

export function readStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') return initialValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return initialValue;
    return JSON.parse(raw) as T;
  } catch {
    return initialValue;
  }
}

export function writeStoredValue<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable */
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [state, setState] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStoredValue(key, initialValue));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialValue is a bootstrap default only
  }, [key]);

  useEffect(() => {
    if (hydrated) writeStoredValue(key, state);
  }, [hydrated, key, state]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => (typeof value === 'function' ? (value as (prev: T) => T)(prev) : value));
  }, []);

  return [state, setValue, hydrated];
}
