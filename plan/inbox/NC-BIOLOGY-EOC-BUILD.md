# NC Biology EOC — multi-file build guide

Complete study coverage for the **NC Biology End-of-Course exam** (2023 NCSCOS,
2025 operational form). One JSON file per **Room**; merge into one module, then
blend with existing bundled `biochem.*` content.

## Status — complete

| File | Room | NC strand | Units | Status |
|---|---|---|---|---|
| `bio-eoc-macromolecules.json` | Macromolecules & Enzymes | Bio.1.1–1.2 | 5 | **Merged** |
| `bio-eoc-cell-structure.json` | Cell Structure & Transport | Bio.1.3–1.4 | 5 | **Merged** |
| `bio-eoc-gene-expression.json` | DNA, RNA & Protein Synthesis | Bio.1.5, 2.2 | 5 | **Merged** |
| `bio-eoc-division-homeostasis.json` | Cell Division & Homeostasis | Bio.2.1, 3.1 | 4 | **Merged** |
| `bio-eoc-energy.json` | Photosynthesis & Respiration | Bio.3.2–3.3 | 5 | **Merged** |
| `bio-eoc-ecosystems.json` | Ecosystems & Populations | Bio.4–5 | 6 | **Merged** |
| `bio-eoc-heredity.json` | Heredity & Genetics | Bio.6–7 | 10 | **Merged** |
| `bio-eoc-biotech.json` | Biotechnology | Bio.8 | 4 | **Merged** |
| `bio-eoc-evolution.json` | Evolution & Natural Selection | Bio.9, Bio.10 | 6 | **Merged** |

**50 `bio.eoc.*` units** across 9 rooms. All **35 legacy `biochem.*` units** superseded and disabled.

---

## Merge workflow (for future content)

1. Drop `plan/inbox/bio-eoc-<slug>.json`
2. Validate, fix schema issues, move to `src/content/bio-eoc/rooms/`
3. Register in `src/content/bio-eoc/room-registry.ts` (`ROOM_IMPORTS`) and set
   `status: 'done'` on the chunk in `nc-eoc-chunks.ts`
4. Activate supersede entries in `src/content/bio-eoc/supersedes.ts`
5. Run `bun run validate-content && bun run test`

Room order is automatic from `NC_EOC_CHUNKS`. Full legacy mapping in `BIO_EOC_SUPERSEDES_MAP`.
