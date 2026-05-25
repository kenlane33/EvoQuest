# 12 — Concept Map Builder

**One-liner**: Drag concept nodes onto a canvas and draw labeled edges between them — the student's mental model becomes a literal map the engine can diff against canonical.

## Papert principles embodied

- **Constructionism**: the concept map is a public, persistent artifact. The student walks away with *their map*, viewable later from the journeys page, and can revise it across encounters.
- **Powerful idea**: knowledge is *relational*. Knowing what something *is* matters less than knowing what it *causes, produces, regulates, contains, requires*. The edge labels carry the cognitive payload.
- **Debugging**: the engine's diff against canonical isn't "wrong/right" — it lists *missing edges* and *over-claimed edges*. Each is a bug in the student's model they can fix on the same canvas.
- **Bricolage**: the canvas is endlessly rearrangeable. Drag a node, move an edge; the map breathes.

## What the student does

1. A focal concept appears at the canvas center: e.g., **Cellular Respiration**.
2. A drawer of *unconnected* concept nodes opens: `glucose`, `O₂`, `CO₂`, `H₂O`, `ATP`, `mitochondrion`, `glycolysis`, `Krebs cycle`, `electron transport chain`, `pyruvate`, `acetyl-CoA`.
3. The student drags nodes onto the canvas and arranges them spatially. (Spatial arrangement isn't graded — it's the student's organizational thinking made visible.)
4. To draw an edge: click a source node, click a destination node. An edge-label picker appears: `produces`, `consumes`, `requires`, `occurs in`, `is a type of`, `regulates`, `precedes`, `inhibits`, `contains`.
5. The student picks a label. The edge is committed.
6. Hitting **CHECK** runs a diff: green checkmarks on correct edges, blue "missing" hints for canonical edges the student didn't draw, amber "double-check" hints for edges the student drew that aren't in the canonical (with brief explanations).
7. The student revises and re-checks freely.

## Biology examples

**Cellular respiration** — the canonical example. The student discovers (or fails to draw, then learns) that glycolysis *produces* pyruvate; pyruvate *enters* the mitochondrion; the Krebs cycle *produces* CO₂; the ETC *produces* ATP; O₂ is the *final electron acceptor* — a critical edge students often miss.

**Photosynthesis ↔ Respiration as inverses** — two focal concepts on one canvas. Edges within each cycle and a small set of cross-cycle edges (`photosynthesis` *produces* O₂, *which is consumed by* respiration). The visible inversion is the lesson.

**Endocrine system overview** — nodes are hormones, glands, target tissues. Edges include `regulates`, `inhibits`, `targets`. The negative-feedback loops emerge as cyclic subgraphs.

**Trophic levels** — producers, primary consumers, secondary consumers, decomposers. Edges are `is eaten by`, `decomposed by`. The pyramid emerges spatially.

**Mendel's Laws** — nodes are concepts (segregation, independent assortment, allele, gamete, dominance). Edges connect rules to observations.

## Template data shape

```ts
type ConceptMapBuilderData = {
  focalConcept: string;
  nodes: ConceptNode[];
  canonicalEdges: CanonicalEdge[];
  allowedLabels: string[];          // edge labels available in the picker
  decoyNodes?: ConceptNode[];       // optional distractor nodes that shouldn't be connected
  poweredIdea: string;
};

type ConceptNode = { id: string; label: string; icon?: string };

type CanonicalEdge = {
  from: string;
  to: string;
  label: string;
  importance: 'critical' | 'standard' | 'nice-to-have';
  reasonIfMissing: string;          // shown as the blue "missing" hint
};
```

The diff algorithm is a graph comparison weighted by `importance` — getting all `critical` edges right is required to pass the unit; `standard` edges earn the streak bonus; `nice-to-have` edges earn an "elegant map" achievement.

## Reveal & feedback design

- **Live edge labeling**: while the student is choosing a label, a tooltip shows what each label *means* with a tiny example ("produces → A creates B as output").
- **Diff annotation**: missing edges appear as dashed blue arrows the student can tap to add. Over-claimed edges glow amber with a "really?" tooltip linking to the canonical reasoning.
- **Powered-idea reveal**: after passing, a one-line synthesis appears at the top of the map ("Respiration is the slow burn that turns sugar back into the gases plants exhaled.").
- **Map preserved**: the student's final map is saved as an SVG snapshot on the journeys page. They literally carry away an artifact.

## Variations

- **Free build**: no canonical comparison; the student maps a topic of their choice (from a list of pre-prepared focal topics). The engine surfaces the map for self-review only. Pure construction.
- **Partial start**: the canonical map is half-drawn. The student fills in the missing edges. Lower difficulty.
- **Multi-student maps** (out of scope for v1): two students compare maps of the same topic, discuss differences. Pedagogical gold.

## Anti-patterns

- **Edges without labels**: an unlabeled edge is useless — it's just "these two are related somehow." Always require a label.
- **Single canonical map**: real concept maps vary in valid ways. The canonical map should accept *some* topological variation (different spatial arrangement, different edge orderings) but specific edge presence.
- **Punishing over-drawing**: if a student draws an extra valid edge that's just outside the canonical, treat it as "nice-to-have" — never wrong.
- **Hidden label semantics**: the meaning of each edge label must be discoverable from the UI itself, not from a manual.

## Authoring notes

- Limit canvases to 6-12 nodes. Larger maps lose the student in visual complexity.
- Hand-author each canonical edge with a `reasonIfMissing` sentence — this is the lesson the student learns when their map is incomplete. Don't skimp.
- Decoy nodes are powerful: an extra `Golgi apparatus` node on the respiration map invites the student to *not* connect it, which teaches restraint.
- Critical edges should be 30-50% of the canonical set; the rest split between standard and nice-to-have.
