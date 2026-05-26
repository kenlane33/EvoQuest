'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { SpeakButton } from '@/components/content/SpeakButton';
import {
  diffConceptMap,
  passesConceptMap,
  type StudentEdge,
} from '@/engine/concept-map/diff';
import type { TemplateRegistration } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import {
  ConceptMapBuilderDataSchema,
  type ConceptMapBuilderData,
  type ConceptNode,
} from '@/types/schemas';

function nodeLabel(nodes: ConceptNode[], id: string) {
  return nodes.find((n) => n.id === id)?.label ?? id;
}

function ConceptMapBuilderRenderer({
  data,
  onResult,
}: {
  data: ConceptMapBuilderData;
  onResult: (result: { correct: boolean; ms: number; details?: Record<string, unknown> }) => void;
}) {
  const startMs = useRef(Date.now());
  const allNodes = useMemo(
    () => [...data.nodes, ...(data.decoyNodes ?? [])],
    [data.nodes, data.decoyNodes],
  );
  const [placed, setPlaced] = useState<string[]>(() => data.nodes.map((n) => n.id));
  const [edges, setEdges] = useState<StudentEdge[]>([]);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const finishedRef = useRef(false);

  const diff = checked ? diffConceptMap(data, edges) : null;
  const passed = checked && passesConceptMap(data, edges);

  function togglePlaced(id: string) {
    if (checked) return;
    setPlaced((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  function pickSource(id: string) {
    if (checked || !placed.includes(id)) return;
    setSourceId(id);
    setPendingTarget(null);
  }

  function pickTarget(id: string) {
    if (checked || !sourceId || !placed.includes(id) || id === sourceId) return;
    setPendingTarget(id);
  }

  function commitEdge(label: string) {
    if (!sourceId || !pendingTarget) return;
    setEdges((e) => [
      ...e.filter((x) => !(x.from === sourceId && x.to === pendingTarget)),
      { from: sourceId, to: pendingTarget, label },
    ]);
    setSourceId(null);
    setPendingTarget(null);
  }

  function submit() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setChecked(true);
    const correct = passesConceptMap(data, edges);
    onResult({
      correct,
      ms: Date.now() - startMs.current,
      details: { edgeCount: edges.length, poweredIdea: data.poweredIdea },
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-body-lg font-semibold text-(--text-primary)">
            Map: <span className="text-(--accent-cyan)">{data.focalConcept}</span>
          </p>
          <SpeakButton
            text={`Concept map for ${data.focalConcept}. Connect nodes with labeled edges.`}
            label="Read instructions"
          />
        </div>
        <p className="mt-2 text-meta text-(--text-dim)">
          Tap a source node, then a target, then pick a relationship label.
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        {allNodes.map((node) => {
          const onCanvas = placed.includes(node.id);
          const isSource = sourceId === node.id;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => {
                if (sourceId && sourceId !== node.id && onCanvas) pickTarget(node.id);
                else pickSource(node.id);
              }}
              onDoubleClick={() => togglePlaced(node.id)}
              className={cn(
                'rounded-(--r-lg) border px-3 py-2 text-body font-semibold',
                !onCanvas && 'opacity-40',
                isSource
                  ? 'border-(--accent-cyan) bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)]'
                  : pendingTarget === node.id
                    ? 'border-(--accent-violet) bg-[color-mix(in_oklab,var(--accent-violet)_12%,transparent)]'
                    : 'border-(--border-light) bg-(--bg-card-hi) text-(--text-primary)',
              )}
            >
              {node.icon ? `${node.icon} ` : ''}
              {node.label}
            </button>
          );
        })}
      </div>

      {sourceId && pendingTarget ? (
        <Card>
          <p className="mb-2 text-meta text-(--text-dim)">
            {nodeLabel(allNodes, sourceId)} → {nodeLabel(allNodes, pendingTarget)}
          </p>
          <div className="flex flex-wrap gap-2">
            {data.allowedLabels.map((label) => (
              <Button key={label} variant="secondary" onClick={() => commitEdge(label)}>
                {label}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}

      {edges.length > 0 ? (
        <ul className="space-y-1 rounded-(--r-lg) border border-(--border-faint) bg-(--bg-card) p-3">
          {edges.map((edge, i) => (
            <li key={i} className="flex items-center gap-2 text-body text-(--text-secondary)">
              <SpeakButton
                text={`${nodeLabel(allNodes, edge.from)} ${edge.label} ${nodeLabel(allNodes, edge.to)}`}
                label="Read edge"
              />
              <span>
                {nodeLabel(allNodes, edge.from)}{' '}
                <span className="font-semibold text-(--accent-cyan)">{edge.label}</span>{' '}
                {nodeLabel(allNodes, edge.to)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {diff ? (
        <div className="space-y-3">
          {diff.missing.map((edge) => (
            <p
              key={`${edge.from}-${edge.to}-${edge.label}`}
              className="rounded-(--r-lg) border border-[color-mix(in_oklab,var(--accent-cyan)_30%,transparent)] bg-[color-mix(in_oklab,var(--accent-cyan)_8%,transparent)] px-3 py-2 text-body text-(--accent-cyan)"
            >
              Missing: {nodeLabel(allNodes, edge.from)} {edge.label}{' '}
              {nodeLabel(allNodes, edge.to)} — {edge.reasonIfMissing}
            </p>
          ))}
          {diff.wrongLabel.map(({ edge, expected }) => (
            <p
              key={`wrong-${edge.from}-${edge.to}`}
              className="rounded-(--r-lg) border border-[color-mix(in_oklab,var(--accent-amber)_30%,transparent)] bg-[color-mix(in_oklab,var(--accent-amber)_8%,transparent)] px-3 py-2 text-body text-(--accent-amber)"
            >
              Try &quot;{expected.label}&quot; between {nodeLabel(allNodes, edge.from)} and{' '}
              {nodeLabel(allNodes, edge.to)}.
            </p>
          ))}
        </div>
      ) : null}

      {!checked ? (
        <Button variant="primary" fullWidth onClick={submit}>
          Check map
        </Button>
      ) : (
        <Card variant={passed ? 'correct' : 'wrong'}>
          <p className="text-body text-(--text-secondary)">{data.poweredIdea}</p>
        </Card>
      )}
    </div>
  );
}

const exemplar: ConceptMapBuilderData = {
  focalConcept: 'Cellular Respiration',
  nodes: [
    { id: 'glucose', label: 'Glucose', icon: '🍬' },
    { id: 'o2', label: 'Oxygen', icon: '💨' },
    { id: 'atp', label: 'ATP', icon: '⚡' },
    { id: 'mito', label: 'Mitochondrion', icon: '🔋' },
  ],
  canonicalEdges: [
    {
      from: 'glucose',
      to: 'mito',
      label: 'enters',
      importance: 'critical',
      reasonIfMissing: 'Glucose feeds respiration inside the mitochondrion.',
    },
    {
      from: 'mito',
      to: 'atp',
      label: 'produces',
      importance: 'critical',
      reasonIfMissing: 'The mitochondrion harvests ATP from nutrient oxidation.',
    },
    {
      from: 'o2',
      to: 'mito',
      label: 'enters',
      importance: 'critical',
      reasonIfMissing: 'Oxygen is the final electron acceptor in aerobic respiration.',
    },
  ],
  allowedLabels: ['enters', 'produces', 'consumes', 'requires'],
  poweredIdea: 'Respiration is a network of inputs, stages, and outputs.',
};

const registration: TemplateRegistration<ConceptMapBuilderData> = {
  kind: 'concept-map-builder',
  schema: ConceptMapBuilderDataSchema,
  exemplar,
  classifications: {
    fastLane: false,
    microworld: false,
    constructionist: true,
    bodySyntonic: false,
    debugStyle: true,
  },
  Renderer: ConceptMapBuilderRenderer,
  describePrompt: (d) => `Concept map: ${d.focalConcept}`,
  estimateMs: () => 90_000,
  defaultConfidenceMs: 120_000,
};

export default registration;
