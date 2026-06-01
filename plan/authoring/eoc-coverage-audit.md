# NC Biology EOC — coverage audit

Use this when validating a **sample test** (e.g. 2025 released form) against the
**Biology EOC Review** module (`bio.eoc.*`).

Score **Form tested?** and **Module drilled?** separately — they are not the same.

## Module inventory (post gap-fill)

| Room | Units | Quizzes (approx.) |
|---|---|---|
| Macromolecules & Enzymes | 5 | 19 |
| Cell Structure & Transport | 5 | 20 |
| DNA, RNA & Protein Synthesis | 5 | 21 |
| Cell Division & Homeostasis | 4 | 16 |
| Photosynthesis & Respiration | 5 | 21 |
| Ecosystems & Populations | 6 | 27 |
| Heredity & Genetics | 10 | 44 |
| Biotechnology | 4 | 17 |
| Evolution & Natural Selection | 6 | 27 |
| **Total** | **50** | **~212** |

## Objective coverage map

| Objective | Primary unit(s) | 2025 form items |
|---|---|---|
| LS.Bio.7.2 | `heredity.beyond.incomplete-codominance`, `heredity.beyond.sex-linked` | Module-only |
| LS.Bio.7.3 | `heredity.pedigrees.disorders`, `heredity.pedigrees.karyotype` | Module-only |
| LS.Bio.8.1 gel migration | `biotech.techniques.gel-electrophoresis` | Module-only (#23 = paternity only) |
| LS.Bio.3.3 fermentation yield | `energy.respiration.aerobic-anaerobic` | Module-only (#33/#48 = photo-resp) |
| LS.Bio.10.1 environmental pressure | `ecosystems.interactions.stability` | #3, #22 |
| LS.Bio.10.2 dichotomous keys | `evolution.classification.dichotomous-key` | #30, #32 |
| LS.Bio.10.2 cladogram reading | `evolution.classification.phylogeny-reading`, `evolution.core.common-ancestry` | #26, #44, #50 |

## Misconception trap matrix

| Trap | Form tested? | Module drilled? | Gap type |
|---|---|---|---|
| Lamarckism / organisms try to evolve | Yes (#3, #28, #45) | `evolution.core.variation-first` | aligned |
| Mitosis produces gametes | Weak (#19) | `division.cycle.mitosis-meiosis` | module-only |
| Larger DNA fragments travel farther | No (#23 paternity only) | `biotech.techniques.gel-electrophoresis` | module-only |
| Top trophic level has most energy | Yes (#15, #16, #34) | `ecosystems.energy.energy-pyramid` | aligned |
| Plants don't respire | Yes (#33, #48) | `energy.respiration.photo-resp-cycle` | aligned |
| Diffusion requires ATP / low→high | Weak (#13 osmosis) | `cell-structure.transport.passive-active` | module-only |
| Identical genes = identical phenotype | Yes (#7, #40, #46) | `gene-expression.regulation.expression-differentiation`, `heredity.complex.environment` | aligned |

**Gap types:**

- **aligned** — form item and module quiz both target the trap
- **module-only** — drilled in EvoQuest but 2025 form lacks a clean item
- **form-only** — on test but no dedicated module quiz (flag for content add)
- **both missing** — highest priority

## Audit prompt snippet

For each sample-test item (1–50):

1. Assign `LS.Bio.*` objective code(s)
2. Map to closest `bio.eoc.*` unit id (or **GAP**)
3. Rate readiness: **Strong** (≥2 quizzes), **Thin** (1), **Missing** (0)

Flag objectives with **0 form items** OR **Missing/Thin** module coverage.

## Items the 2025 form cannot validate

These objectives are now drilled in the module but had **no clean released-form items**:

- Sex-linked inheritance (7.2)
- Incomplete dominance / roan coat (7.2)
- Karyotype / nondisjunction (7.3)
- Dedicated pedigree-disorder patterns beyond intro (7.3)
- Gel fragment migration direction (8.1)
- Fermentation ATP yield vs aerobic (3.3)

Do not treat module-only traps as content gaps when the form is the validator.
