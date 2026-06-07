'use client';

import { cn } from '@/lib/cn';
import type { PowerUpInstance, PowerUpInventory } from '@/types';
import { getPowerUpCopy, type PowerUpCopy } from '@/engine/powerups/catalog';

type PowerUpSwapModalProps = {
  earned: PowerUpInstance;
  slots: PowerUpInventory['slots'];
  onReplaceSlot: (slotIndex: 0 | 1 | 2) => void;
  onDiscardEarned: () => void;
};

type DiscardTarget = 'earned' | 0 | 1 | 2;

function keepTitles(
  discard: DiscardTarget,
  earned: PowerUpCopy,
  slotCopies: Array<PowerUpCopy | undefined>,
): string {
  const kept: string[] = [];
  if (discard !== 'earned') kept.push(earned.title);
  for (let i = 0; i < 3; i++) {
    if (discard !== i && slotCopies[i]) kept.push(slotCopies[i]!.title);
  }
  return kept.join(', ');
}

function SwapChoiceButton({
  copy,
  badge,
  keepLine,
  onSelect,
  className,
}: {
  copy: PowerUpCopy;
  badge?: 'New';
  keepLine: string;
  onSelect: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-(--r-lg) border px-4 py-3 text-left transition-colors',
        'border-(--border-light) bg-(--bg-card) hover:border-(--accent-cyan) hover:bg-(--bg-card-hi)',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-cyan)',
        className,
      )}
    >
      <div className="flex gap-3">
        <span className="shrink-0 text-2xl leading-none" aria-hidden>
          {copy.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {badge ? (
              <span className="rounded-full border border-(--accent-cyan) bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)] px-2 py-0.5 text-micro font-bold uppercase tracking-wider text-(--accent-cyan)">
                {badge}
              </span>
            ) : null}
            <span className="text-body font-bold text-(--text-primary)">{copy.title}</span>
            {copy.rarity === 'rare' ? (
              <span className="text-micro font-semibold uppercase text-(--accent-violet)">Rare</span>
            ) : null}
          </div>
          <p className="mt-1 text-meta leading-snug text-(--text-secondary)">{copy.summary}</p>
          <p className="mt-2 text-micro text-(--text-dim)">
            <span className="font-semibold text-(--text-secondary)">You keep:</span> {keepLine}
          </p>
        </div>
      </div>
      <p className="mt-3 text-micro font-bold uppercase tracking-wide text-(--accent-coral)">
        Discard {copy.title}
      </p>
    </button>
  );
}

export function PowerUpSwapModal({
  earned,
  slots,
  onReplaceSlot,
  onDiscardEarned,
}: PowerUpSwapModalProps) {
  const earnedCopy = getPowerUpCopy(earned);
  if (!earnedCopy) return null;

  const slotCopies = slots.map((slot) => (slot ? getPowerUpCopy(slot) : undefined));

  return (
    <div className="glass-sm glass-bg-overlay-modal fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="max-h-[min(90vh,40rem)] w-full max-w-md overflow-y-auto rounded-(--r-lg) border border-(--border-light) bg-(--bg-card) p-6 animate-pop-in">
        <h2 className="text-headline-sm font-black text-(--text-primary)">Inventory full</h2>
        <p className="mt-2 text-body text-(--text-secondary)">
          Pick one power-up to discard. Each option shows what you give up and what stays in your
          tray.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <SwapChoiceButton
            copy={earnedCopy}
            badge="New"
            keepLine={keepTitles('earned', earnedCopy, slotCopies)}
            onSelect={onDiscardEarned}
            className="border-[color-mix(in_oklab,var(--accent-cyan)_35%,var(--border-light))]"
          />
          {slots.map((slot, index) => {
            if (!slot) return null;
            const copy = slotCopies[index];
            if (!copy) return null;
            const slotIndex = index as 0 | 1 | 2;
            return (
              <SwapChoiceButton
                key={slotIndex}
                copy={copy}
                keepLine={keepTitles(slotIndex, earnedCopy, slotCopies)}
                onSelect={() => onReplaceSlot(slotIndex)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
