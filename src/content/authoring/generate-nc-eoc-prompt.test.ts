import { describe, expect, it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import '@/engine/templates';
import {
  generateNcEocMasterBrief,
  generateNcEocPrompt,
} from '@/content/authoring/generate-nc-eoc-prompt';
import {
  NC_EOC_CHUNKS,
  NC_EOC_MODULE,
  type NcEocChunkId,
} from '@/content/authoring/nc-eoc-chunks';

describe('generateNcEocPrompt', () => {
  it('includes chunk-specific room id and NC objectives', () => {
    const prompt = generateNcEocPrompt({ chunkId: 'macromolecules' });
    expect(prompt).toContain(NC_EOC_MODULE.id);
    expect(prompt).toContain('bio.eoc.macromolecules');
    expect(prompt).toContain('LS.Bio.1.1');
    expect(prompt).toContain('biochem.macromolecules.four-groups');
    expect(prompt).toContain('kind: "fill"');
    expect(prompt).toContain('teach.figures');
    expect(prompt).toContain('Diagrams and figures');
  });

  it('master brief lists all chunk files', () => {
    const brief = generateNcEocMasterBrief();
    for (const chunk of NC_EOC_CHUNKS) {
      expect(brief).toContain(`bio-eoc-${chunk.outFileSlug}.json`);
    }
    expect(brief).toContain('bio-eoc-evolution.json');
    expect(brief).toContain('DONE');
  });

  it('syncs plan/authoring/chunk-prompts when SYNC_CHUNK_PROMPTS=1', () => {
    if (process.env.SYNC_CHUNK_PROMPTS !== '1') return;

    const outDir = join(process.cwd(), 'plan/authoring/chunk-prompts');
    mkdirSync(outDir, { recursive: true });

    for (const chunk of NC_EOC_CHUNKS) {
      const prompt = generateNcEocPrompt({ chunkId: chunk.id });
      writeFileSync(join(outDir, `${chunk.outFileSlug}.md`), `${prompt}\n`, 'utf8');
    }

    expect(generateNcEocPrompt({ chunkId: 'macromolecules' })).toContain('Diagrams and figures');
  });
});

/** CLI: CHUNK=macromolecules|master bun run print-nc-eoc-prompt */
describe('printNcEocPrompt CLI', () => {
  it('prints prompt to stdout when CHUNK env is set', () => {
    const chunk = process.env.CHUNK;
    if (!chunk) return;

    if (chunk === 'master') {
      console.log(generateNcEocMasterBrief());
      return;
    }

    const known = NC_EOC_CHUNKS.find((c) => c.id === chunk);
    if (!known) {
      throw new Error(`Unknown chunk "${chunk}"`);
    }
    if (known.status === 'done') {
      throw new Error(`Chunk "${chunk}" already done`);
    }
    console.log(generateNcEocPrompt({ chunkId: chunk as NcEocChunkId }));
  });
});
