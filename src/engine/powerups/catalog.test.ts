import { describe, expect, it } from 'vitest';
import { ALL_QUIZ_TEMPLATE_KINDS } from '@/engine/playable-kinds';
import {
  POWERUP_CATALOG,
  applicablePowerUpsForTemplate,
  powerUpAppliesToTemplate,
  powerUpTooltip,
} from '@/engine/powerups/catalog';

describe('power-up catalog', () => {
  it('covers every quiz template with at least one applicable power-up', () => {
    for (const kind of ALL_QUIZ_TEMPLATE_KINDS) {
      expect(applicablePowerUpsForTemplate(kind).length).toBeGreaterThan(0);
    }
  });

  it('gives every template multiple universal power-ups', () => {
    const universalCount = Object.values(POWERUP_CATALOG).filter(
      (def) => def.appliesToTemplates === 'all',
    ).length;
    expect(universalCount).toBeGreaterThanOrEqual(4);

    for (const kind of ALL_QUIZ_TEMPLATE_KINDS) {
      const applicable = applicablePowerUpsForTemplate(kind);
      expect(applicable.length).toBeGreaterThanOrEqual(universalCount);
    }
  });

  it('does not offer Darwin notebook on debug-the-claim (no multiple-choice options)', () => {
    const def = POWERUP_CATALOG['pu.darwin-notebook'];
    expect(powerUpAppliesToTemplate(def, 'debug-the-claim')).toBe(false);
  });

  it('offers Darwin notebook on speed-reveal multiple-choice questions', () => {
    const def = POWERUP_CATALOG['pu.darwin-notebook'];
    expect(powerUpAppliesToTemplate(def, 'speed-reveal-mnemonic')).toBe(true);
  });

  it('provides outcome tooltips for every power-up when applicable', () => {
    for (const def of Object.values(POWERUP_CATALOG)) {
      const kind =
        def.appliesToTemplates === 'all' ? ALL_QUIZ_TEMPLATE_KINDS[0] : def.appliesToTemplates[0];
      const text = powerUpTooltip(def, kind, true);
      expect(text).toMatch(/: /);
      expect(text.length).toBeGreaterThan(12);
    }
  });

  it('stores title and summary on every power-up', () => {
    for (const def of Object.values(POWERUP_CATALOG)) {
      expect(def.title.length).toBeGreaterThan(2);
      expect(def.summary.length).toBeGreaterThan(10);
    }
  });
});
