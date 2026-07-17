'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type PageReadAloudState = {
  ownerId: string;
  text: string;
  autoRead: boolean;
  autoReadKey: string;
};

const empty: PageReadAloudState = {
  ownerId: '',
  text: '',
  autoRead: false,
  autoReadKey: '',
};

type PageReadAloudContextValue = {
  state: PageReadAloudState;
  setPageReadAloud: (patch: Partial<PageReadAloudState>) => void;
  /** Clear only when this owner still owns the bar (avoids route-transition races). */
  clearPageReadAloud: (ownerId: string) => void;
};

const PageReadAloudContext = createContext<PageReadAloudContextValue | null>(null);

export function PageReadAloudProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PageReadAloudState>(empty);

  const setPageReadAloud = useCallback((patch: Partial<PageReadAloudState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearPageReadAloud = useCallback((ownerId: string) => {
    setState((prev) => (prev.ownerId === ownerId ? empty : prev));
  }, []);

  const value = useMemo(
    () => ({ state, setPageReadAloud, clearPageReadAloud }),
    [state, setPageReadAloud, clearPageReadAloud],
  );

  return (
    <PageReadAloudContext.Provider value={value}>{children}</PageReadAloudContext.Provider>
  );
}

export function usePageReadAloudContext() {
  const ctx = useContext(PageReadAloudContext);
  if (!ctx) {
    throw new Error('usePageReadAloudContext must be used within PageReadAloudProvider');
  }
  return ctx;
}
