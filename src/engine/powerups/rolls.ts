import type { PowerUpInstance } from '@/types';
import {
  COMMON_POWERUP_IDS,
  POWERUP_CATALOG,
  RARE_POWERUP_IDS,
  canHoldRare,
  getPowerUpDef,
  type PowerUpDefinition,
} from '@/engine/powerups/catalog';

export type StreakRollResult = {
  instance: PowerUpInstance;
  catalogId: string;
};

/** Probability of rare pool at each streak milestone (§4.1). */
export function rareChanceForStreak(streak: number): number {
  if (streak < 10) return 0;
  if (streak < 15) return 0.1;
  if (streak < 20) return 0.2;
  if (streak < 25) return 0.3;
  return 0.4;
}

function pickRandom<T>(items: T[], rng = Math.random): T {
  return items[Math.floor(rng() * items.length)]!;
}

export function pickWingTheme(recentWingIds: string[]): string | undefined {
  const filtered = recentWingIds.filter(Boolean);
  if (!filtered.length) return undefined;
  return filtered[filtered.length - 1];
}

export function rollStreakPowerUp(
  streak: number,
  recentWingId?: string,
  inventory?: { slots: Array<{ id: string } | null> },
  rng = Math.random,
): StreakRollResult | null {
  if (streak < 5 || streak % 5 !== 0) return null;

  const rareChance = rareChanceForStreak(streak);
  const useRare = rng() < rareChance;

  let pool = useRare ? [...RARE_POWERUP_IDS] : [...COMMON_POWERUP_IDS];
  if (inventory) {
    pool = pool.filter((id) => {
      const def = getPowerUpDef(id);
      if (!def) return false;
      if (def.rarity === 'rare') return canHoldRare(inventory, id);
      return true;
    });
  }
  if (!pool.length) {
    pool = COMMON_POWERUP_IDS.filter((id) => {
      if (!inventory) return true;
      const def = getPowerUpDef(id);
      return def?.rarity !== 'rare' || canHoldRare(inventory, id);
    });
  }
  if (!pool.length) return null;

  const catalogId = pickRandom(pool, rng);
  const instance: PowerUpInstance = {
    id: catalogId,
    acquiredAt: Date.now(),
    themedFor: recentWingId,
  };
  return { instance, catalogId };
}

export function wingThemedPowerUpIds(wingId: string, rarity: 'common' | 'rare'): string[] {
  const wingThemeMap: Record<string, string> = {
    evo: 'evo',
    cell: 'cell',
    gen: 'gen',
    origin: 'origin',
    biochem: 'cell',
    'bio.eoc': 'cell',
  };
  const theme = wingThemeMap[wingId] ?? 'universal';
  return Object.values(POWERUP_CATALOG)
    .filter(
      (def: PowerUpDefinition) =>
        def.rarity === rarity && (def.theme === theme || def.theme === 'universal'),
    )
    .map((def) => def.id);
}

export function rollWingClearBonus(
  wingId: string,
  rng = Math.random,
): { common: PowerUpInstance; rare: PowerUpInstance } {
  const commons = wingThemedPowerUpIds(wingId, 'common');
  const rares = wingThemedPowerUpIds(wingId, 'rare');
  const commonId = pickRandom(commons.length ? commons : COMMON_POWERUP_IDS, rng);
  const rareId = pickRandom(rares.length ? rares : RARE_POWERUP_IDS, rng);
  const now = Date.now();
  return {
    common: { id: commonId, acquiredAt: now, themedFor: wingId },
    rare: { id: rareId, acquiredAt: now, themedFor: wingId },
  };
}
