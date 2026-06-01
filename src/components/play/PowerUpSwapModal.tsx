'use client';

import { Button } from '@/components/common/Button';
import type { PowerUpInstance } from '@/types';
import { displayIconForPowerUp, getPowerUpDef } from '@/engine/powerups/catalog';

type PowerUpSwapModalProps = {
  earned: PowerUpInstance;
  inventory: PowerUpInstance[];
  onSwap: (slotIndex: 0 | 1 | 2) => void;
  onDiscard: () => void;
};

export function PowerUpSwapModal({ earned, inventory, onSwap, onDiscard }: PowerUpSwapModalProps) {
  const def = getPowerUpDef(earned.id);
  const icon = def ? displayIconForPowerUp(def, earned.themedFor) : '✨';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-(--r-lg) border border-(--border-light) bg-(--bg-card) p-6 animate-pop-in">
        <p className="text-body text-(--text-secondary)">
          You earned {icon}. Your inventory is full. Replace which one?
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {inventory.map((slot, i) => {
            if (!slot) return null;
            const slotDef = getPowerUpDef(slot.id);
            const slotIcon = slotDef ? displayIconForPowerUp(slotDef, slot.themedFor) : '?';
            return (
              <Button
                key={i}
                variant="secondary"
                fullWidth
                onClick={() => onSwap(i as 0 | 1 | 2)}
              >
                Replace {slotIcon}
              </Button>
            );
          })}
          <Button variant="ghost" fullWidth onClick={onDiscard}>
            Discard the new one
          </Button>
        </div>
      </div>
    </div>
  );
}
