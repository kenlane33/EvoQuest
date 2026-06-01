import { describe, expect, it } from 'vitest';
import '@/engine/templates';
import { REGISTRY } from '@/engine/templates/registry';
import { generateContentPrompt } from '@/content/authoring/generate-content-prompt';

describe('generateContentPrompt', () => {
  it('includes topic, source material, and output contract', () => {
    const prompt = generateContentPrompt({
      topic: 'Cell membrane transport',
      moduleTitle: 'Membrane Transport',
      wingIdPrefix: 'bio.cells',
      sourceKind: 'notes',
      sourceMaterial: 'Diffusion moves from high to low concentration.',
      scope: 'drawer',
      authorRef: 'ken',
    });

    expect(prompt).toContain('Cell membrane transport');
    expect(prompt).toContain('Diffusion moves from high to low concentration.');
    expect(prompt).toContain('mod.bio-cells.user');
    expect(prompt).toContain('bio.cells');
    expect(prompt).toContain('No markdown code fences');
    expect(prompt).toContain('kind: "fill"');
    expect(prompt).toContain('Diagrams and figures');
    expect(prompt).toContain('teach.figures');
  });

  it('lists every registered interactive template kind', () => {
    const prompt = generateContentPrompt({
      topic: 'Test',
      sourceKind: 'knowledge-outline',
      sourceMaterial: 'Topic A\nTopic B',
      scope: 'single-unit',
    });

    for (const kind of Object.keys(REGISTRY)) {
      expect(prompt).toContain(`kind: "${kind}"`);
    }
  });
});
