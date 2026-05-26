'use client';

import { useRouterState } from '@tanstack/react-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

const COPY_FLASH_MS = 900;
const BADGE_CHECK_MS = 700;

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
  copyLabel: (label: string) => void;
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

type CopyFlash = {
  key: number;
  stack: readonly string[];
};

function DevCopyFlash({ flash }: { flash: CopyFlash | null }) {
  if (!flash) return null;

  const multi = flash.stack.length > 1;

  return (
    <div
      key={flash.key}
      className="dev-copy-flash pointer-events-none fixed bottom-12 left-2 z-[201] max-w-[min(calc(100vw-1rem),18rem)] rounded bg-black/92 px-2.5 py-1.5 font-mono text-[11px] font-medium leading-snug tracking-wide text-lime-300 shadow-lg"
      aria-live="polite"
      aria-atomic
    >
      {multi ? (
        <div className="whitespace-pre-wrap">
          <span aria-hidden>✓</span>
          {'\n'}
          {flash.stack.join('\n')}
        </div>
      ) : (
        <span>
          ✓ {flash.stack[0]}
        </span>
      )}
    </div>
  );
}

function DevPageLabelBadge({
  override,
  onCopy,
  checked,
}: {
  override: string | null;
  onCopy: (label: string) => void;
  checked: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sessionPhase = useAppStore((s) => s.sessionState.phase);
  const [enabled] = useDevPageLabelsEnabled();

  const label = useMemo(() => {
    if (override) return override;
    const onPlay = pathname.startsWith('/play/');
    return resolveDevPageLabel(pathname, onPlay ? sessionPhase : undefined);
  }, [override, pathname, sessionPhase]);

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
      title={title}
      aria-label={`Copy dev label: ${label}`}
      onClick={() => onCopy(label)}
    >
      {checked ? `✓ ${label}` : label}
    </button>
  );
}

export function DevPageLabelProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<string | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [enabled] = useDevPageLabelsEnabled();
  const [copyFlash, setCopyFlash] = useState<CopyFlash | null>(null);
  const [badgeChecked, setBadgeChecked] = useState(false);
  const flashTimerRef = useRef<number | null>(null);
  const badgeTimerRef = useRef<number | null>(null);

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

  const copyLabel = useCallback((label: string) => {
    const stack = copyDevLabel(label);
    if (stack.length === 0) return;

    setCopyFlash({ key: Date.now(), stack });
    setBadgeChecked(true);

    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current);
    }
    if (badgeTimerRef.current !== null) {
      window.clearTimeout(badgeTimerRef.current);
    }

    flashTimerRef.current = window.setTimeout(() => {
      setCopyFlash(null);
      flashTimerRef.current = null;
    }, COPY_FLASH_MS);

    badgeTimerRef.current = window.setTimeout(() => {
      setBadgeChecked(false);
      badgeTimerRef.current = null;
    }, BADGE_CHECK_MS);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onClick = (event: MouseEvent) => {
      const label = devMarkLabelAtClick(event);
      if (!label) return;
      event.preventDefault();
      event.stopPropagation();
      copyLabel(label);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [enabled, copyLabel]);

  useEffect(
    () => () => {
      if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current);
      if (badgeTimerRef.current !== null) window.clearTimeout(badgeTimerRef.current);
    },
    [],
  );

  const value = useMemo(
    () => ({
      setOverride,
      copyLabel,
    }),
    [copyLabel],
  );

  return (
    <DevPageLabelContext.Provider value={value}>
      {children}
      <DevPageLabelBadge override={override} onCopy={copyLabel} checked={badgeChecked} />
      <DevCopyFlash flash={copyFlash} />
    </DevPageLabelContext.Provider>
  );
}
