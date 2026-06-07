'use client';

import { useEffect, useRef, useState } from 'react';
import { clearTtsCache } from '@/audio/read-aloud-engine';
import { buttonPressClasses } from '@/components/common/Button';
import { ClearProgressConfirm } from '@/components/common/ClearProgressConfirm';
import { cn } from '@/lib/cn';
import { APP_VERSION } from '@/storage/writer';
import { useAppStore } from '@/store/app-store';

type MenuBusy = 'tts' | 'settings' | null;

const menuItemClass =
  'flex w-full px-3 py-2 text-left text-body transition-colors hover:bg-(--bg-card-active) disabled:opacity-50';

/** Tiny build stamp — fixed at the top-right corner; opens a dev menu on click. */
export function VersionBadge() {
  const clearAllSettings = useAppStore((s) => s.clearAllSettings);
  const clearAllProgress = useAppStore((s) => s.clearAllProgress);
  const [open, setOpen] = useState(false);
  const [confirmProgress, setConfirmProgress] = useState(false);
  const [busy, setBusy] = useState<MenuBusy>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open && !confirmProgress) return;

    function onPointerDown(event: PointerEvent) {
      if (confirmProgress) return;
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (confirmProgress) {
        setConfirmProgress(false);
        return;
      }
      setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, confirmProgress]);

  async function handleClearTtsCache() {
    setBusy('tts');
    try {
      await clearTtsCache();
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  function handleClearAllSettings() {
    setBusy('settings');
    try {
      clearAllSettings();
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  return (
    <>
      <div ref={rootRef} className="fixed top-1 right-2 z-60">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={`App version ${APP_VERSION}`}
          className={cn(
            'font-mono text-[10px] leading-none tabular-nums text-(--text-faint) transition-colors hover:text-(--text-dim)',
            buttonPressClasses,
            open && 'text-(--text-dim)',
          )}
        >
          v{APP_VERSION}
        </button>

        {open ? (
          <div
            role="menu"
            aria-label="Version menu"
            className="absolute top-[calc(100%+0.25rem)] right-0 z-50 min-w-44 rounded-(--r-lg) border border-(--border-light) bg-(--bg-card) py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              disabled={busy !== null}
              onClick={() => void handleClearTtsCache()}
              className={cn(
                menuItemClass,
                'text-(--text-secondary) hover:text-(--text-primary)',
                buttonPressClasses,
              )}
            >
              {busy === 'tts' ? 'Clearing…' : 'Clear TTS cache'}
            </button>
            <button
              type="button"
              role="menuitem"
              disabled={busy !== null}
              onClick={handleClearAllSettings}
              className={cn(
                menuItemClass,
                'text-(--text-secondary) hover:text-(--text-primary)',
                buttonPressClasses,
              )}
            >
              {busy === 'settings' ? 'Clearing…' : 'Clear all settings'}
            </button>
            <button
              type="button"
              role="menuitem"
              disabled={busy !== null}
              onClick={() => {
                setOpen(false);
                setConfirmProgress(true);
              }}
              className={cn(
                menuItemClass,
                'text-(--status-wrong) hover:text-(--status-wrong)',
                buttonPressClasses,
              )}
            >
              Clear all progress
            </button>
          </div>
        ) : null}
      </div>

      {confirmProgress ? (
        <ClearProgressConfirm
          asModal
          onConfirm={() => {
            clearAllProgress();
            setConfirmProgress(false);
          }}
          onCancel={() => setConfirmProgress(false)}
        />
      ) : null}
    </>
  );
}
