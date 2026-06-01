/**
 * Canonical NC Biology EOC room registration.
 * Order matches NC_EOC_CHUNKS in nc-eoc-chunks.ts (2023 NCSCOS strand flow).
 */
import type { ContentModule } from '@/types';
import { NC_EOC_CHUNKS } from '@/content/authoring/nc-eoc-chunks';
import biotech from '@/content/bio-eoc/rooms/bio-eoc-biotech.json';
import cellStructure from '@/content/bio-eoc/rooms/bio-eoc-cell-structure.json';
import divisionHomeostasis from '@/content/bio-eoc/rooms/bio-eoc-division-homeostasis.json';
import ecosystems from '@/content/bio-eoc/rooms/bio-eoc-ecosystems.json';
import energy from '@/content/bio-eoc/rooms/bio-eoc-energy.json';
import evolution from '@/content/bio-eoc/rooms/bio-eoc-evolution.json';
import geneExpression from '@/content/bio-eoc/rooms/bio-eoc-gene-expression.json';
import heredity from '@/content/bio-eoc/rooms/bio-eoc-heredity.json';
import macromolecules from '@/content/bio-eoc/rooms/bio-eoc-macromolecules.json';

/** outFileSlug → merged room JSON. */
const ROOM_IMPORTS: Record<string, ContentModule> = {
  macromolecules: macromolecules as ContentModule,
  'cell-structure': cellStructure as ContentModule,
  'gene-expression': geneExpression as ContentModule,
  'division-homeostasis': divisionHomeostasis as ContentModule,
  energy: energy as ContentModule,
  ecosystems: ecosystems as ContentModule,
  heredity: heredity as ContentModule,
  biotech: biotech as ContentModule,
  evolution: evolution as ContentModule,
};

/** Merged rooms in NC EOC study order — driven by chunk status in nc-eoc-chunks.ts. */
export const ROOM_MODULES: ContentModule[] = NC_EOC_CHUNKS.filter(
  (chunk) => chunk.status === 'done',
).map((chunk) => {
  const mod = ROOM_IMPORTS[chunk.outFileSlug];
  if (!mod) {
    throw new Error(
      `Missing room import for merged chunk "${chunk.id}" (bio-eoc-${chunk.outFileSlug}.json)`,
    );
  }
  return mod;
});

/** Canonical room order for merged + pending chunks (documentation / merge checklist). */
export const NC_EOC_ROOM_ORDER = NC_EOC_CHUNKS.map((chunk) => ({
  chunkId: chunk.id,
  outFile: `bio-eoc-${chunk.outFileSlug}.json`,
  roomId: chunk.roomId,
  status: chunk.status,
}));
