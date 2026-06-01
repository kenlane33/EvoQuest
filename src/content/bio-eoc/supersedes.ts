/**
 * Legacy worksheet-scan biochem.* units superseded by bio.eoc.* EOC rooms.
 *
 * Applied at bundle time via applyBioEocSupersedes() — disabled units stay in the
 * module for ID stability but are hidden from the grid and play queues.
 */

export type BioEocSupersedesEntry = {
  /** Legacy bundled unit id (biochem.*). */
  legacyUnitId: string;
  /** Replacement bio.eoc room id. */
  replacementRoomId: string;
  /** When false, listed for documentation only until the room JSON is merged. */
  active: boolean;
};

/**
 * All 35 legacy biochem.* units mapped to their deeper bio.eoc.* replacement room.
 * Source: existingBundledUnits in nc-eoc-chunks.ts + bundled module inventory.
 */
export const BIO_EOC_SUPERSEDES_MAP: readonly BioEocSupersedesEntry[] = [
  // bio.eoc.macromolecules (LS.Bio.1.1–1.2)
  { legacyUnitId: 'biochem.macromolecules.four-groups', replacementRoomId: 'bio.eoc.macromolecules', active: true },
  { legacyUnitId: 'biochem.macromolecules.examples', replacementRoomId: 'bio.eoc.macromolecules', active: true },
  { legacyUnitId: 'biochem.enzymes.basics', replacementRoomId: 'bio.eoc.macromolecules', active: true },
  { legacyUnitId: 'biochem.enzymes.factors', replacementRoomId: 'bio.eoc.macromolecules', active: true },

  // bio.eoc.cell-structure (LS.Bio.1.3–1.4)
  { legacyUnitId: 'biochem.cells.organelles', replacementRoomId: 'bio.eoc.cell-structure', active: true },
  { legacyUnitId: 'biochem.cells.compare', replacementRoomId: 'bio.eoc.cell-structure', active: true },
  { legacyUnitId: 'biochem.cells.diagrams', replacementRoomId: 'bio.eoc.cell-structure', active: true },
  { legacyUnitId: 'biochem.transport.types', replacementRoomId: 'bio.eoc.cell-structure', active: true },
  { legacyUnitId: 'biochem.transport.osmosis', replacementRoomId: 'bio.eoc.cell-structure', active: true },

  // bio.eoc.gene-expression (LS.Bio.1.5, 2.2)
  { legacyUnitId: 'biochem.protein.dna-structure', replacementRoomId: 'bio.eoc.gene-expression', active: true },
  { legacyUnitId: 'biochem.protein.dna-vs-rna', replacementRoomId: 'bio.eoc.gene-expression', active: true },
  { legacyUnitId: 'biochem.protein.transcription', replacementRoomId: 'bio.eoc.gene-expression', active: true },
  { legacyUnitId: 'biochem.protein.mutations', replacementRoomId: 'bio.eoc.gene-expression', active: true },
  { legacyUnitId: 'biochem.division.stem-cells', replacementRoomId: 'bio.eoc.gene-expression', active: true },

  // bio.eoc.division (LS.Bio.2.1, 3.1)
  { legacyUnitId: 'biochem.division.cell-cycle', replacementRoomId: 'bio.eoc.division', active: true },
  { legacyUnitId: 'biochem.division.mitosis-meiosis', replacementRoomId: 'bio.eoc.division', active: true },
  { legacyUnitId: 'biochem.division.crossing-over', replacementRoomId: 'bio.eoc.division', active: true },

  // bio.eoc.energy (LS.Bio.3.2–3.3)
  { legacyUnitId: 'biochem.energy.photosynthesis-respiration', replacementRoomId: 'bio.eoc.energy', active: true },

  // bio.eoc.ecosystems (LS.Bio.4–5)
  { legacyUnitId: 'biochem.ecology.levels', replacementRoomId: 'bio.eoc.ecosystems', active: true },
  { legacyUnitId: 'biochem.ecology.food-web', replacementRoomId: 'bio.eoc.ecosystems', active: true },
  { legacyUnitId: 'biochem.ecology.energy-pyramid', replacementRoomId: 'bio.eoc.ecosystems', active: true },
  { legacyUnitId: 'biochem.ecology.cycles', replacementRoomId: 'bio.eoc.ecosystems', active: true },
  { legacyUnitId: 'biochem.ecology.population', replacementRoomId: 'bio.eoc.ecosystems', active: true },
  { legacyUnitId: 'biochem.ecology.behavior-conservation', replacementRoomId: 'bio.eoc.ecosystems', active: true },
  { legacyUnitId: 'biochem.ecology.plants-atmosphere', replacementRoomId: 'bio.eoc.ecosystems', active: true },

  // bio.eoc.heredity (LS.Bio.6–7)
  { legacyUnitId: 'biochem.heredity.patterns', replacementRoomId: 'bio.eoc.heredity', active: true },
  { legacyUnitId: 'biochem.heredity.karyotype', replacementRoomId: 'bio.eoc.heredity', active: true },

  // bio.eoc.biotech (LS.Bio.8)
  { legacyUnitId: 'biochem.heredity.gel-electrophoresis', replacementRoomId: 'bio.eoc.biotech', active: true },
  { legacyUnitId: 'biochem.heredity.dna-fingerprint', replacementRoomId: 'bio.eoc.biotech', active: true },
  { legacyUnitId: 'biochem.heredity.biotech', replacementRoomId: 'bio.eoc.biotech', active: true },

  // bio.eoc.evolution (LS.Bio.9–10)
  { legacyUnitId: 'biochem.evolution.evidence', replacementRoomId: 'bio.eoc.evolution', active: true },
  { legacyUnitId: 'biochem.evolution.natural-selection', replacementRoomId: 'bio.eoc.evolution', active: true },
  { legacyUnitId: 'biochem.evolution.speciation', replacementRoomId: 'bio.eoc.evolution', active: true },
  { legacyUnitId: 'biochem.evolution.classification', replacementRoomId: 'bio.eoc.evolution', active: true },
  { legacyUnitId: 'biochem.evolution.dichotomous-key', replacementRoomId: 'bio.eoc.evolution', active: true },
] as const;

/** Legacy unit ids disabled at bundle time (active supersede entries only). */
export const BIO_EOC_SUPERSEDES_BIOCHEM = BIO_EOC_SUPERSEDES_MAP.filter((e) => e.active).map(
  (e) => e.legacyUnitId,
);

export const BIO_EOC_SUPERSEDES_SET = new Set<string>(BIO_EOC_SUPERSEDES_BIOCHEM);

/** Pending supersede entries — none when all rooms are merged. */
export const BIO_EOC_SUPERSEDES_PENDING = BIO_EOC_SUPERSEDES_MAP.filter((e) => !e.active);

/** Group active supersede entries by replacement room (for docs / debugging). */
export function supersedesByRoom(): Record<string, string[]> {
  const byRoom: Record<string, string[]> = {};
  for (const entry of BIO_EOC_SUPERSEDES_MAP.filter((e) => e.active)) {
    (byRoom[entry.replacementRoomId] ??= []).push(entry.legacyUnitId);
  }
  return byRoom;
}
