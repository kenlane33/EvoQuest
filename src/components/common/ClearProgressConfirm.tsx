'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';

export const PROGRESS_NUKE_PHRASE = 'yes nuke it';

type ClearProgressConfirmProps = {
  onConfirm: () => void;
  onCancel: () => void;
  /** Full-screen modal (version menu) vs inline block (settings). */
  asModal?: boolean;
};

/** Stern confirmation: user must type the exact phrase before erasing progress. */
export function ClearProgressConfirm({
  onConfirm,
  onCancel,
  asModal = false,
}: ClearProgressConfirmProps) {
  const [phrase, setPhrase] = useState('');
  const canConfirm = phrase === PROGRESS_NUKE_PHRASE;

  function handleCancel() {
    setPhrase('');
    onCancel();
  }

  function handleConfirm() {
    if (!canConfirm) return;
    setPhrase('');
    onConfirm();
  }

  const panel = (
    <div
      className={cn(
        asModal &&
          'w-full max-w-sm animate-slide-up rounded-(--r-xl) border-2 border-[color-mix(in_oklab,var(--accent-coral)_45%,transparent)] bg-(--bg-card) p-6 shadow-xl',
        !asModal && 'space-y-2',
      )}
    >
      <h2
        id="clear-progress-title"
        className={cn(
          'font-black uppercase tracking-wide text-(--status-wrong)',
          asModal ? 'text-headline-md' : 'text-body',
        )}
      >
        Erase all progress?
      </h2>
      <p className={cn('text-body text-(--text-primary)', asModal ? 'mt-4' : 'text-(--status-wrong)')}>
        {asModal ? (
          <>
            This permanently deletes every quest, achievement, unit tier, power-up, notebook entry,
            and in-progress session stored on this device.
          </>
        ) : (
          <>This erases all local progress. Cannot be undone. Your settings are kept.</>
        )}
      </p>
      {asModal ? (
        <p className="mt-3 text-body font-bold text-(--status-wrong)">
          There is no undo. Your settings will not be changed.
        </p>
      ) : null}
      <label className={cn('block', asModal ? 'mt-5' : 'mt-2')}>
        <span className="text-meta text-(--text-secondary)">
          Type <span className="font-mono text-(--text-primary)">{PROGRESS_NUKE_PHRASE}</span> to
          confirm
        </span>
        <input
          type="text"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canConfirm) handleConfirm();
          }}
          autoComplete="off"
          spellCheck={false}
          autoFocus={asModal}
          aria-labelledby="clear-progress-title"
          className="mt-2 w-full rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 font-mono text-body text-(--text-primary) outline-none focus:border-(--status-wrong)"
        />
      </label>
      <div className={cn('flex flex-col gap-2', asModal ? 'mt-6' : 'mt-2')}>
        <Button variant="destructive" fullWidth disabled={!canConfirm} onClick={handleConfirm}>
          Yes, erase all progress
        </Button>
        <Button variant="ghost" fullWidth onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );

  if (!asModal) {
    return panel;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-progress-title"
    >
      {panel}
    </div>
  );
}
