'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { PowerUpEffect } from '@/types';

export type ActivePowerUpEffects = {
  effects: PowerUpEffect[];
  /** Wrong option index to dim (-1 = pick at render time). */
  revealWrongIndex?: number;
  extraTimeMs: number;
  showEtymologyAll: boolean;
  streakShieldActive: boolean;
  allowRetry: boolean;
  skipNoPenalty: boolean;
};

const defaultEffects: ActivePowerUpEffects = {
  effects: [],
  extraTimeMs: 0,
  showEtymologyAll: false,
  streakShieldActive: false,
  allowRetry: false,
  skipNoPenalty: false,
};

const PowerUpEffectContext = createContext<ActivePowerUpEffects>(defaultEffects);

export function PowerUpEffectProvider({
  value,
  children,
}: {
  value: ActivePowerUpEffects;
  children: ReactNode;
}) {
  return (
    <PowerUpEffectContext.Provider value={value}>{children}</PowerUpEffectContext.Provider>
  );
}

export function usePowerUpEffects() {
  return useContext(PowerUpEffectContext);
}

export function buildActiveEffects(effects: PowerUpEffect[]): ActivePowerUpEffects {
  const active: ActivePowerUpEffects = { ...defaultEffects, effects: [...effects] };
  for (const effect of effects) {
    switch (effect.kind) {
      case 'reveal-option':
        active.revealWrongIndex = effect.index;
        break;
      case 'add-time':
        active.extraTimeMs += effect.ms;
        break;
      case 'show-etymology-all':
        active.showEtymologyAll = true;
        break;
      case 'streak-shield':
        active.streakShieldActive = true;
        break;
      case 'allow-retry':
        active.allowRetry = true;
        break;
      case 'skip-no-penalty':
        active.skipNoPenalty = true;
        break;
      default:
        break;
    }
  }
  return active;
}
