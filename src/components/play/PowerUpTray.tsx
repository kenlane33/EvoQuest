'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { PowerUpInventory } from '@/types';
import {
  displayIconForPowerUp,
  getPowerUpDef,
  powerUpAppliesToTemplate,
} from '@/engine/powerups/catalog';

type PowerUpTrayProps = {
  inventory: PowerUpInventory;
  templateKind: string;
  onUseSlot: (slotIndex: 0 | 1 | 2) => void;
  className?: string;
};

export function PowerUpTray({ inventory, templateKind, onUseSlot, className }: PowerUpTrayProps) {
  const [disabledHint, setDisabledHint] = useState<string | null>(null);

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {inventory.slots.map((slot, index) => {
        const slotIndex = index as 0 | 1 | 2;
        const def = slot ? getPowerUpDef(slot.id) : undefined;
        const applies = def ? powerUpAppliesToTemplate(def, templateKind) : false;
        const icon = def ? displayIconForPowerUp(def, slot?.themedFor) : null;

        return (
          <button
            key={index}
            type="button"
            disabled={!slot}
            title={def?.firstUseCopy.split('.')[0]?.replace(/\*\*/g, '') ?? 'Empty slot'}
            aria-label={
              slot && def
                ? `Use ${def.firstUseCopy.split('.')[0]?.replace(/\*\*/g, '')}`
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
        );
      })}
      {disabledHint ? (
        <p className="absolute left-1/2 mt-14 w-full max-w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 px-2 text-center text-micro text-(--text-dim) animate-slide-up">
          {disabledHint}
        </p>
      ) : null}
    </div>
  );
}
