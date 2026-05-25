'use client';

import { useRouterState } from '@tanstack/react-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEV_PAGE_LABELS_EVENT,
  copyDevLabel,
  devLabelCopyCount,
  devPageLabelsEnabled,
  resolveDevPageLabel,
  setDevPageLabelsEnabled,
} from '@/lib/dev-page-labels';
import { devMarkLabelAtClick } from '@/lib/dev-mark';
import { useAppStore } from '@/store/app-store';

export function useDevPageLabelsEnabled(): [boolean, (on: boolean) => void] {
  const [enabled, setEnabled] = useState(() => devPageLabelsEnabled());

  useEffect(() => {
    const sync = () => setEnabled(devPageLabelsEnabled());
    sync();
    window.addEventListener(DEV_PAGE_LABELS_EVENT, sync);
    return () => window.removeEventListener(DEV_PAGE_LABELS_EVENT, sync);
  }, []);

  return [enabled, setDevPageLabelsEnabled];
}

type DevPageLabelContextValue = {
  setOverride: (label: string | null) => void;
};

const DevPageLabelContext = createContext<DevPageLabelContextValue | null>(null);

/** Register a page-local sub-state label (e.g. welcome steps). */
export function useDevPageLabel(label: string) {
  const ctx = useContext(DevPageLabelContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setOverride(label);
    return () => ctx.setOverride(null);
  }, [ctx, label]);
}

function DevPageLabelBadge({ override }: { override: string | null }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sessionPhase = useAppStore((s) => s.sessionState.phase);
  const [enabled] = useDevPageLabelsEnabled();
  const [copied, setCopied] = useState(false);

  const label = useMemo(() => {
    if (override) return override;
    const onPlay = pathname.startsWith('/play/');
    return resolveDevPageLabel(pathname, onPlay ? sessionPhase : undefined);
  }, [override, pathname, sessionPhase]);

  const handleCopy = useCallback(() => {
    copyDevLabel(label);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 600);
  }, [label]);

  if (!enabled) return null;

  const count = devLabelCopyCount();
  const title =
    count > 1
      ? `Copy label (${count} in clipboard, newline-separated)`
      : 'Copy label (click more to append with newline)';

  return (
    <button
      type="button"
      className="fixed top-2 left-2 z-[200] cursor-pointer rounded bg-black/80 px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide text-lime-400 transition-colors hover:bg-black/95 hover:text-lime-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400"
      style={{ opacity: copied ? 0.55 : 1 }}
      title={title}
      aria-label={`Copy dev label: ${label}`}
      onClick={handleCopy}
    >
      {label}
    </button>
  );
}

export function DevPageLabelProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<string | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [enabled] = useDevPageLabelsEnabled();

  useEffect(() => {
    setOverride(null);
  }, [pathname]);

  useEffect(() => {
    if (enabled) {
      document.documentElement.dataset.devLabels = '1';
    } else {
      delete document.documentElement.dataset.devLabels;
    }
    return () => {
      delete document.documentElement.dataset.devLabels;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onClick = (event: MouseEvent) => {
      const label = devMarkLabelAtClick(event);
      if (!label) return;
      event.preventDefault();
      event.stopPropagation();
      copyDevLabel(label);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [enabled]);

  const value = useMemo(
    () => ({
      setOverride,
    }),
    [],
  );

  return (
    <DevPageLabelContext.Provider value={value}>
      {children}
      <DevPageLabelBadge override={override} />
    </DevPageLabelContext.Provider>
  );
}
