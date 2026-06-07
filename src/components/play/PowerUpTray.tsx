'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { PowerUpInventory } from '@/types';
import {
  displayIconForPowerUp,
  getPowerUpDef,
  powerUpAppliesToTemplate,
  powerUpTooltip,
} from '@/engine/powerups/catalog';

type PowerUpTrayProps = {
  inventory: PowerUpInventory;
  templateKind: string;
  onUseSlot: (slotIndex: 0 | 1 | 2) => void;
  className?: string;
};

function PowerUpSlotTooltip({ text }: { text: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-30 w-max max-w-[min(14rem,calc(100vw-2rem))] -translate-x-1/2 rounded-(--r-md) border border-(--border-light) bg-(--bg-deep) px-2.5 py-1.5 text-center text-micro leading-snug text-(--text-secondary) opacity-0 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition-none group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {text}
    </span>
  );
}

export function PowerUpTray({ inventory, templateKind, onUseSlot, className }: PowerUpTrayProps) {
  const [disabledHint, setDisabledHint] = useState<string | null>(null);

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="flex items-center justify-center gap-2">
        {inventory.slots.map((slot, index) => {
          const slotIndex = index as 0 | 1 | 2;
          const def = slot ? getPowerUpDef(slot.id) : undefined;
          const applies = def ? powerUpAppliesToTemplate(def, templateKind) : false;
          const icon = def ? displayIconForPowerUp(def, slot?.themedFor) : null;
          const tooltip =
            def && slot
              ? powerUpTooltip(def, templateKind, applies)
              : 'Empty slot — earn power-ups from streaks and achievements.';

          return (
            <div key={index} className="group relative">
              <button
                type="button"
                disabled={!slot}
                aria-label={
                  slot && def
                    ? `${powerUpTooltip(def, templateKind, applies)} Tap to use.`
                    : 'Empty power-up slot'
                }
                onClick={() => {
                  if (!slot || !def) return;
                  if (!applies) {
                    setDisabledHint(def.disabledHint ?? 'This power-up does not apply here.');
                    setTimeout(() => setDisabledHint(null), 2500);
                    return;
                  }
                  onUseSlot(slotIndex);
                }}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full border text-xl transition-all',
                  slot
                    ? applies
                      ? 'border-(--border-medium) bg-(--bg-card) hover:border-(--accent-cyan) hover:shadow-[0_0_12px_var(--wing-glow)]'
                      : 'border-(--border-faint) bg-(--bg-card) opacity-50'
                    : 'border-dashed border-(--border-faint) bg-transparent opacity-30',
                )}
              >
                {icon ?? '·'}
              </button>
              <PowerUpSlotTooltip text={tooltip} />
            </div>
          );
        })}
      </div>
      <span className="text-micro text-(--text-faint)">Power-ups</span>
      {disabledHint ? (
        <p className="absolute left-1/2 mt-14 w-full max-w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 px-2 text-center text-micro text-(--text-dim) animate-slide-up">
          {disabledHint}
        </p>
      ) : null}
    </div>
  );
}
