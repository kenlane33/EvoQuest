import type { ContentModule, Morpheme, Room, Wing } from '@/types';
import { ContentModuleSchema } from '@/types/schemas';

function mergeMorphemes(modules: ContentModule[]): Morpheme[] {
  const byId = new Map<string, Morpheme>();
  for (const mod of modules) {
    for (const morph of mod.etymologyContributions ?? []) {
      byId.set(morph.id, morph);
    }
  }
  return [...byId.values()];
}

function extractRoom(mod: ContentModule): Room {
  const wing = mod.tree[0];
  const room = wing?.children?.[0];
  if (!wing || !room) {
    throw new Error(`Expected ContentModule tree Wing → Room in ${mod.id}`);
  }
  return room;
}

/** Merge per-room ContentModule JSON fragments into one EOC wing. */
export function mergeBioEocRoomModules(modules: ContentModule[]): {
  wing: Wing;
  etymologyContributions: Morpheme[];
} {
  const parsed = modules.map((mod) => ContentModuleSchema.parse(mod));
  const rooms = parsed.map(extractRoom);

  const wing: Wing = {
    id: 'bio.eoc',
    slug: 'bio-eoc',
    title: 'Biology EOC (2025)',
    emoji: '🧬',
    description:
      'NC Biology EOC review aligned to 2023 NCSCOS and the 2025 released form — misconception-aware, interactive.',
    children: rooms,
  };

  return {
    wing,
    etymologyContributions: mergeMorphemes(parsed),
  };
}
