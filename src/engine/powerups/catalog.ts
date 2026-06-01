import type { PowerUpEffect } from '@/types';

export type PowerUpRarity = 'common' | 'rare';

export type PowerUpTheme = 'evo' | 'cell' | 'gen' | 'origin' | 'universal' | 'spatial';

export type PowerUpDefinition = {
  id: string;
  theme: PowerUpTheme;
  rarity: PowerUpRarity;
  icon: string;
  /** Wing-themed visual variants (same function). */
  skinIcons: Partial<Record<string, string>>;
  effects: PowerUpEffect[];
  appliesToTemplates: string[] | 'all';
  firstUseCopy: string;
  disabledHint?: string;
};

export const POWERUP_CATALOG: Record<string, PowerUpDefinition> = {
  'pu.darwin-notebook': {
    id: 'pu.darwin-notebook',
    theme: 'evo',
    rarity: 'common',
    icon: '📓',
    skinIcons: { evo: '📓', cell: '🔬', gen: '🌱', biochem: '🔬', 'bio.eoc': '🔬' },
    effects: [{ kind: 'reveal-option', index: -1 }],
    appliesToTemplates: ['match', 'scenario', 'debug-the-claim'],
    firstUseCopy:
      "**Darwin's Notebook.** Darwin filled notebooks with observations. Open it now — one wrong option will dim. The right answer is still yours to find.",
    disabledHint: 'Save this for a multiple-choice question.',
  },
  'pu.galapagos-compass': {
    id: 'pu.galapagos-compass',
    theme: 'evo',
    rarity: 'common',
    icon: '🧭',
    skinIcons: { evo: '🧭', cell: '🚪', gen: '🌳', biochem: '🚪', 'bio.eoc': '🚪' },
    effects: [{ kind: 'skip-no-penalty' }],
    appliesToTemplates: 'all',
    firstUseCopy:
      "**Galápagos Compass.** Sometimes the right move is to come back later. Skip this one without breaking your streak — it'll re-queue at the end with a different angle.",
  },
  'pu.atp-boost': {
    id: 'pu.atp-boost',
    theme: 'cell',
    rarity: 'common',
    icon: '⚡',
    skinIcons: { evo: '⏳', cell: '⚡', gen: '⏰', biochem: '⚡', 'bio.eoc': '⚡' },
    effects: [{ kind: 'add-time', ms: 30_000 }],
    appliesToTemplates: ['speed-reveal-mnemonic', 'microworld-sandbox', 'predict-run-reflect'],
    firstUseCopy:
      "**ATP Boost.** Your cell's energy currency. Buys you 30 more seconds before the mnemonic reveals — time to think, not skip.",
    disabledHint: 'Save this for a timed question.',
  },
  'pu.lysosome': {
    id: 'pu.lysosome',
    theme: 'cell',
    rarity: 'common',
    icon: '🧹',
    skinIcons: { evo: '🧹', cell: '🧹', gen: '🧹', biochem: '🧹', 'bio.eoc': '🧹' },
    effects: [{ kind: 'allow-retry' }],
    appliesToTemplates: 'all',
    firstUseCopy:
      "**Lysosome.** The cell's recycler. Wrong answer? Re-digest it — get one retry without breaking your streak.",
  },
  'pu.punnett-predictor': {
    id: 'pu.punnett-predictor',
    theme: 'gen',
    rarity: 'common',
    icon: '🌱',
    skinIcons: { evo: '🌱', cell: '🌱', gen: '🌱', biochem: '🌱', 'bio.eoc': '🌱' },
    effects: [{ kind: 'reveal-mnemonic-now' }],
    appliesToTemplates: ['predict-run-reflect', 'punnett-builder'],
    firstUseCopy:
      "**Punnett Predictor.** Reveal the underlying numeric truth for this question. The biology reasoning is still yours; we'll just spare you the arithmetic.",
    disabledHint: 'Save this for a prediction or Punnett question.',
  },
  'pu.mendel-pea': {
    id: 'pu.mendel-pea',
    theme: 'gen',
    rarity: 'common',
    icon: '🟢',
    skinIcons: { evo: '📜', cell: '🦠', gen: '🟢', biochem: '🟢', 'bio.eoc': '🟢' },
    effects: [{ kind: 'show-etymology-all' }],
    appliesToTemplates: ['etymology-puppet', 'speed-reveal-mnemonic', 'fill', 'match', 'scenario'],
    firstUseCopy:
      "**Mendel's Pea.** Reveal one of the morphemes in this question's etymology — and the meaning that goes with it. Mendel cataloged 28,000 plants. He'd be okay with a little assistance.",
  },
  'pu.mitochondrion-shield': {
    id: 'pu.mitochondrion-shield',
    theme: 'cell',
    rarity: 'common',
    icon: '🛡️',
    skinIcons: { evo: '🦴', cell: '🛡️', gen: '🧬', biochem: '🛡️', 'bio.eoc': '🛡️' },
    effects: [{ kind: 'streak-shield' }],
    appliesToTemplates: 'all',
    firstUseCopy:
      '**Mitochondrion Shield.** Streak protection: your next wrong answer won\'t reset your streak. One-time forgiveness.',
  },
  'pu.rna-flashback': {
    id: 'pu.rna-flashback',
    theme: 'origin',
    rarity: 'rare',
    icon: '🪞',
    skinIcons: {},
    effects: [{ kind: 'reroll-question' }],
    appliesToTemplates: 'all',
    firstUseCopy:
      "**RNA Flashback.** Replay the last unit you got wrong, with a different framing. RNA was Earth's first redo-er.",
  },
  'pu.etymology-lens': {
    id: 'pu.etymology-lens',
    theme: 'universal',
    rarity: 'common',
    icon: '🔍',
    skinIcons: { evo: '🔍', cell: '🔬', gen: '🧐', biochem: '🔍', 'bio.eoc': '🔍' },
    effects: [{ kind: 'show-etymology-all' }],
    appliesToTemplates: 'all',
    firstUseCopy:
      '**Etymology Lens.** Reveal the roots + meanings of every Greek/Latin morpheme in this question. The language is the lesson, when you can see it.',
  },
  'pu.palace-portal': {
    id: 'pu.palace-portal',
    theme: 'spatial',
    rarity: 'rare',
    icon: '🌀',
    skinIcons: {},
    effects: [{ kind: 'palace-teleport', toTileId: '' }],
    appliesToTemplates: ['palace-walk'],
    firstUseCopy:
      "**Palace Portal.** In Palace Walk, teleport to any tile you've already visited. Spatial cognition is older than language — use it.",
    disabledHint: 'Save this for a Palace Walk question.',
  },
};

export const COMMON_POWERUP_IDS = Object.values(POWERUP_CATALOG)
  .filter((p) => p.rarity === 'common')
  .map((p) => p.id);

export const RARE_POWERUP_IDS = Object.values(POWERUP_CATALOG)
  .filter((p) => p.rarity === 'rare')
  .map((p) => p.id);

export function getPowerUpDef(id: string): PowerUpDefinition | undefined {
  return POWERUP_CATALOG[id];
}

export function powerUpAppliesToTemplate(def: PowerUpDefinition, templateKind: string): boolean {
  if (def.appliesToTemplates === 'all') return true;
  return def.appliesToTemplates.includes(templateKind);
}

export function displayIconForPowerUp(def: PowerUpDefinition, themedFor?: string): string {
  if (themedFor && def.skinIcons[themedFor]) {
    return def.skinIcons[themedFor]!;
  }
  return def.icon;
}

/** Max one rare of each type in inventory. */
export function canHoldRare(inventory: { slots: Array<{ id: string } | null> }, rareId: string): boolean {
  return !inventory.slots.some((s) => s?.id === rareId);
}
