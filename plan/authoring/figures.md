# Figure sourcing workflow

How to add static SVG (or PNG) diagrams to evo-quest content.

## Approved sources (prefer in order)

1. **Wikimedia Commons** — CC0, CC-BY, CC-BY-SA, public domain. Verify license on the file page before download.
2. **OpenStax / NIH / CDC public-domain biology art** — check each asset’s license page.
3. **Self-authored SVG** — when no suitable open asset exists. Keep files small and label clearly.

Do **not** use stock images, textbook scans, or assets without a clear reuse license.

## Normalization checklist

Before committing a figure to `public/content/<module>/figures/`:

- [ ] Single root `<svg>` with a `viewBox` (no fixed width/height that breaks responsive layout)
- [ ] Descriptive `<title>` element inside the SVG
- [ ] No external font or image references (embed paths inline)
- [ ] Reasonable file size (prefer &lt; 100 KB for SVG; optimize paths)
- [ ] Labels readable at mobile width; avoid tiny text (&lt; 10px)
- [ ] Theme-friendly colors (avoid pure black backgrounds; use `#222` / `#555` text on light fills)

## Naming

| Module | Path constant | ID pattern | Example |
|---|---|---|---|
| Legacy biochemistry scan | `FIG` in `quiz-helpers.ts` | `pNN_topic` | `p06_cell_cycle` |
| Bio EOC rooms | `BIO_EOC_FIG` in `bio-eoc/figures.ts` | `bio_eoc_topic` | `bio_eoc_plant_animal_cells` |

File name = figure id + extension: `bio_eoc_plant_animal_cells.svg`

## Attribution manifest

Every figures directory has a `CREDITS.json` mapping figure id → `{ title, author, sourceUrl, license }`.

- Add an entry **before** wiring the figure into content.
- This file is **not** part of app storage schemas — it is a repo-only attribution record.

## Wire into content

Each unit that uses a diagram needs **both**:

1. **Markdown image** in `teach.body`:
   ```markdown
   ![Alt text describing the diagram](/content/bio-eoc/figures/bio_eoc_plant_animal_cells.svg)
   ```
2. **Metadata** in `teach.figures`:
   ```json
   { "id": "bio_eoc_plant_animal_cells", "alt": "...", "caption": "optional" }
   ```

For diagram-backed quizzes, write prompts that reference the figure (`"In the diagram…"`, `"From the graph…"`) so `getQuizPlayFigures` surfaces the image during play.

## Validation

```bash
bun run figure-report    # coverage baseline — which units lack diagrams
bun run check-figures    # fail on missing files or metadata/body mismatches
bun run validate-content # schema + figure checks (build gate)
```

## End-to-end steps

1. Run `bun run figure-report` to pick a unit that needs a diagram.
2. Find a CC-licensed SVG (or author one).
3. Normalize per checklist above.
4. Save to `public/content/<module>/figures/<id>.svg`.
5. Add entry to `CREDITS.json`.
6. Wire `teach.body` + `teach.figures` in the unit (TS or JSON).
7. Add at least one quiz whose prompt references the diagram.
8. Run `bun run validate-content && bun test`.

## Dev gallery

Use `/dx/preview` to review diagram–quiz pairings. Proposed items live in `src/lib/dx/preview-items.ts` until promoted into real quizzes.
