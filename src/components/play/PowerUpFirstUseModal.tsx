'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { getPowerUpDef } from '@/engine/powerups/catalog';

type PowerUpFirstUseModalProps = {
  powerUpId: string;
  onConfirm: (dontShowAgain: boolean) => void;
  onCancel: () => void;
};

export function PowerUpFirstUseModal({ powerUpId, onConfirm, onCancel }: PowerUpFirstUseModalProps) {
  const def = getPowerUpDef(powerUpId);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!def) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-(--r-lg) border border-(--border-light) bg-(--bg-card) p-6 animate-pop-in">
        <p className="text-body text-(--text-secondary)">{def.firstUseCopy}</p>
        <label className="mt-4 flex items-center gap-2 text-meta text-(--text-dim)">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded"
          />
          Don&apos;t show this again
        </label>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="primary" fullWidth onClick={() => onConfirm(dontShowAgain)}>
            Use it now
          </Button>
          <Button variant="ghost" fullWidth onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
