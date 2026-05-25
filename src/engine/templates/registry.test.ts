import { describe, expect, it } from 'vitest';
import '@/engine/templates';
import { REGISTRY } from '@/engine/templates/registry';

const NEW_KINDS = [
  'microworld-sandbox',
  'pedigree-detective',
  'cladogram-crafter',
  'counterfactual-lab',
] as const;

describe('template registry', () => {
  it('registers 13 interactive template kinds', () => {
    expect(Object.keys(REGISTRY).sort()).toHaveLength(13);
  });

  it.each(NEW_KINDS)('validates exemplar for %s', (kind) => {
    const reg = REGISTRY[kind];
    expect(reg).toBeDefined();
    expect(() => reg.schema.parse(reg.exemplar)).not.toThrow();
  });
});
