export function figuresSection(): string {
  return `# Diagrams and figures

When a unit teaches a **structure, process, graph, or labeled diagram**, propose figure metadata even though SVG files are added separately by the author.

## When to include figures

Add \`teach.figures\` when the unit covers:

- Cell or organelle layouts (plant vs animal, prokaryote vs eukaryote)
- Cycles or pathways (cell cycle, nitrogen cycle, central dogma)
- Graphs students must read (enzyme activity, population curves)
- Comparison panels (evolution evidence, osmosis outcomes)
- Lab visuals (gel electrophoresis, karyotype, cladogram)

Skip figures for purely definitional vocabulary units with no visual anchor.

## teach.figures shape

\`\`\`json
"figures": [
  {
    "id": "bio_eoc_plant_animal_cells",
    "alt": "Cross-sections of plant and animal cells with labeled organelles",
    "caption": "Optional short caption shown below the image"
  }
]
\`\`\`

- \`id\`: stable kebab/snake identifier — **do not invent file URLs or paths**
- \`alt\`: full description for screen readers (what labels or panels exist)
- \`caption\`: optional; one line clarifying what to notice

## teach.body markdown

Reference the figure with a markdown image using a placeholder path the author will wire:

\`\`\`markdown
![Cross-sections of plant and animal cells with labeled organelles](/content/bio-eoc/figures/bio_eoc_plant_animal_cells.svg)
\`\`\`

The \`id\` in \`figures[]\` must match the filename (without extension).

## Diagram-backed quizzes

When a figure is central to the unit, include **at least one quiz** whose prompt references it:

- "In the diagram, the substrate binds at the _____."
- "From the graph, the optimum temperature is about _____°C."
- "On the cell cycle diagram, letter A is _____."

Phrases like *diagram*, *graph*, *figure*, or *in the diagram* let the app show the figure beside the question during play.

## authorNotes sourcing hint

If you propose a figure, add one line to \`authorNotes\`:

\`\`\`
Figure needed: plant vs animal cell cross-section (Wikimedia CC-BY or self-author).
\`\`\`

Do **not** embed binary SVG content in JSON — only metadata and the markdown image line.`;
}
