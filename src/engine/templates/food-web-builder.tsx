'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { TemplateRegistration } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import {
  CascadeOutcomeSchema,
  FoodWebBuilderDataSchema,
  type FoodWebBuilderData,
} from '@/types/schemas';

type Phase = 'build' | 'predict' | 'reveal';

const OUTCOME_LABELS: Record<string, string> = {
  crash: 'Crash ↓',
  boom: 'Boom ↑',
  stable: 'Stable →',
};

function edgeKey(preyId: string, predatorId: string) {
  return `${preyId}→${predatorId}`;
}

function FoodWebBuilderRenderer({
  data,
  onResult,
}: {
  data: FoodWebBuilderData;
  onResult: (result: { correct: boolean; ms: number }) => void;
}) {
  const startMs = useRef(Date.now());
  const nodeMap = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data.nodes]);
  const [phase, setPhase] = useState<Phase>('build');
  const [edges, setEdges] = useState<string[]>([]);
  const [linkFrom, setLinkFrom] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);
  const [buildHelpUsed, setBuildHelpUsed] = useState(false);
  const [predictHelpUsed, setPredictHelpUsed] = useState(false);
  const finishedRef = useRef(false);

  const required = useMemo(
    () => new Set(data.requiredEdges.map((e) => edgeKey(e.preyId, e.predatorId))),
    [data.requiredEdges],
  );
  const edgeSet = new Set(edges);
  const webComplete = [...required].every((k) => edgeSet.has(k));

  function toggleLink(nodeId: string) {
    if (phase !== 'build') return;
    if (!linkFrom) {
      setLinkFrom(nodeId);
      return;
    }
    if (linkFrom === nodeId) {
      setLinkFrom(null);
      return;
    }
    const key = edgeKey(linkFrom, nodeId);
    setEdges((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    setLinkFrom(null);
  }

  function missingEdgeKeys() {
    return data.requiredEdges
      .map((e) => edgeKey(e.preyId, e.predatorId))
      .filter((k) => !edgeSet.has(k));
  }

  function edgeLabel(key: string) {
    const [preyId, predatorId] = key.split('→');
    const prey = nodeMap.get(preyId);
    const predator = nodeMap.get(predatorId);
    return `${prey?.name ?? preyId} → ${predator?.name ?? predatorId}`;
  }

  function fillMissingEdges() {
    const missing = missingEdgeKeys();
    if (missing.length === 0) return;
    setBuildHelpUsed(true);
    setEdges((prev) => [...prev, ...missing]);
    setLinkFrom(null);
  }

  function skipBuild() {
    if (finishedRef.current) return;
    setEdges(data.requiredEdges.map((e) => edgeKey(e.preyId, e.predatorId)));
    setLinkFrom(null);
    setPhase('predict');
  }

  function startPredict() {
    if (!webComplete) return;
    setPhase('predict');
  }

  function setPrediction(nodeId: string, outcome: string) {
    setPredictions((prev) => ({ ...prev, [nodeId]: outcome }));
  }

  function fillPredictions() {
    setPredictHelpUsed(true);
    setPredictions((prev) => {
      const next = { ...prev };
      for (const item of data.predictNodes) {
        if (!next[item.nodeId]) next[item.nodeId] = item.expected;
      }
      return next;
    });
  }

  function finishCascade(
    predictionMap: Record<string, string>,
    opts: { skip?: boolean; helpUsed?: boolean } = {},
  ) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase('reveal');
    setRevealed(true);
    const predictionsCorrect = data.predictNodes.every(
      (p) => predictionMap[p.nodeId] === p.expected,
    );
    const correct = !opts.skip && !opts.helpUsed && predictionsCorrect;
    onResult({ correct, ms: Date.now() - startMs.current });
  }

  function runCascade() {
    const allPicked = data.predictNodes.every((p) => predictions[p.nodeId]);
    if (!allPicked || finishedRef.current) return;
    finishCascade(predictions, { helpUsed: predictHelpUsed });
  }

  function skipPredict() {
    if (finishedRef.current) return;
    const filled = Object.fromEntries(
      data.predictNodes.map((p) => [p.nodeId, p.expected]),
    );
    setPredictions(filled);
    finishCascade(filled, { skip: true });
  }

  return (
    <div className="space-y-5">
      <p className="text-body-lg font-semibold text-(--text-primary)">{data.ecosystem}</p>
      <p className="text-meta text-(--text-dim)">
        Tap prey, then predator to draw energy arrows (from eaten → eater).
      </p>

      <div className="relative min-h-48 rounded-(--r-lg) border border-(--border-light) bg-(--bg-card) p-4 max-sm:min-h-0 max-sm:p-3">
        <div className="flex flex-col gap-2 sm:hidden">
          {data.nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => toggleLink(node.id)}
              className={cn(
                'flex items-center gap-3 rounded-(--r-lg) border px-3 py-2 text-left transition-colors',
                linkFrom === node.id
                  ? 'border-(--accent-cyan) bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)]'
                  : 'border-(--border-light) bg-(--bg-card-hi) hover:border-(--border-medium)',
              )}
            >
              <span className="text-xl">{node.icon}</span>
              <span className="text-body font-bold text-(--text-primary)">{node.name}</span>
            </button>
          ))}
        </div>
        <div className="hidden sm:block">
        {data.nodes.map((node, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => toggleLink(node.id)}
              className={cn(
                'absolute flex flex-col items-center rounded-(--r-lg) border px-3 py-2 text-center transition-colors',
                linkFrom === node.id
                  ? 'border-(--accent-cyan) bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)]'
                  : 'border-(--border-light) bg-(--bg-card-hi) hover:border-(--border-medium)',
              )}
              style={{ left: `${12 + col * 30}%`, top: `${12 + row * 28}%` }}
            >
              <span className="text-xl">{node.icon}</span>
              <span className="text-micro font-bold">{node.name}</span>
            </button>
          );
        })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-micro text-(--text-dim)">
        {edges.map((e) => (
          <span key={e} className="rounded-full bg-(--bg-card-active) px-2 py-1">
            {e.replace('→', ' → ')}
          </span>
        ))}
      </div>

      {phase === 'build' ? (
        <div className="space-y-3">
          <Button variant="primary" disabled={!webComplete} onClick={startPredict}>
            Web complete — predict cascade
          </Button>
          {!webComplete ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="text" onClick={fillMissingEdges} className="text-(--accent-amber)">
                Get Help!
              </Button>
              <Button variant="text" onClick={skipBuild} className="text-(--text-dim)">
                Skip ahead →
              </Button>
            </div>
          ) : null}
          {buildHelpUsed && !webComplete ? (
            <p className="text-meta text-(--accent-amber)">
              Still missing: {missingEdgeKeys().map(edgeLabel).join(', ')}
            </p>
          ) : null}
        </div>
      ) : null}

      {phase === 'predict' || phase === 'reveal' ? (
        <Card className="animate-slide-up">
          <p className="text-body font-semibold text-(--accent-amber)">{data.perturbation.description}</p>
          <p className="mt-2 text-meta text-(--text-dim)">Predict each species trajectory:</p>
          <div className="mt-3 space-y-3">
            {data.predictNodes.map((item) => {
              const node = nodeMap.get(item.nodeId);
              return (
                <div key={item.nodeId}>
                  <p className="mb-1 text-body font-semibold">
                    {node?.icon} {node?.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CascadeOutcomeSchema.options.map((outcome) => (
                      <Button
                        key={outcome}
                        variant="ghost"
                        disabled={phase === 'reveal'}
                        onClick={() => setPrediction(item.nodeId, outcome)}
                        className={cn(
                          'border px-3 py-1 text-micro',
                          predictions[item.nodeId] === outcome
                            ? outcome === item.expected && revealed
                              ? 'border-(--status-correct) text-(--status-correct)'
                              : revealed && predictions[item.nodeId] === outcome
                                ? 'border-(--status-wrong) text-(--status-wrong)'
                                : 'border-(--accent-cyan)'
                            : 'border-(--border-light)',
                        )}
                      >
                        {OUTCOME_LABELS[outcome]}
                      </Button>
                    ))}
                  </div>
                  {revealed && predictions[item.nodeId] !== item.expected ? (
                    <p className="mt-1 text-meta text-(--text-dim)">{item.reason}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
          {phase === 'predict' ? (
            <div className="mt-4 space-y-3">
              <Button
                variant="primary"
                disabled={!data.predictNodes.every((p) => predictions[p.nodeId])}
                onClick={runCascade}
              >
                Run cascade
              </Button>
              {!data.predictNodes.every((p) => predictions[p.nodeId]) ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="text" onClick={fillPredictions} className="text-(--accent-amber)">
                    Get Help!
                  </Button>
                  <Button variant="text" onClick={skipPredict} className="text-(--text-dim)">
                    Skip ahead →
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-body font-semibold text-(--accent-cyan)">{data.poweredIdea}</p>
          )}
        </Card>
      ) : null}
    </div>
  );
}

const exemplar: FoodWebBuilderData = {
  ecosystem: 'Pond food web',
  nodes: [
    { id: 'grass', name: 'Grass', trophicLevel: 'producer', icon: '🌿' },
    { id: 'rabbit', name: 'Rabbit', trophicLevel: 'primary', icon: '🐰' },
    { id: 'snail', name: 'Snail', trophicLevel: 'primary', icon: '🐌' },
    { id: 'hawk', name: 'Hawk', trophicLevel: 'tertiary', icon: '🦅' },
  ],
  requiredEdges: [
    { preyId: 'grass', predatorId: 'rabbit' },
    { preyId: 'grass', predatorId: 'snail' },
    { preyId: 'rabbit', predatorId: 'hawk' },
    { preyId: 'snail', predatorId: 'hawk' },
  ],
  perturbation: {
    removeNodeId: 'snail',
    description: 'Remove snails from the ecosystem.',
  },
  predictNodes: [
    {
      nodeId: 'hawk',
      expected: 'crash',
      reason: 'Hawks lose a prey source when snails disappear.',
    },
    {
      nodeId: 'grass',
      expected: 'boom',
      reason: 'Less grazing pressure from snails lets producers increase.',
    },
  ],
  poweredIdea: 'Removing one node ripples through the whole web — ecosystems are graphs.',
};

const registration: TemplateRegistration<FoodWebBuilderData> = {
  kind: 'food-web-builder',
  schema: FoodWebBuilderDataSchema,
  exemplar,
  classifications: {
    fastLane: false,
    microworld: true,
    constructionist: true,
    bodySyntonic: false,
    debugStyle: true,
  },
  Renderer: FoodWebBuilderRenderer,
  describePrompt: (data) => `Food web: ${data.ecosystem}`,
  estimateMs: () => 120_000,
  defaultConfidenceMs: 90_000,
};

export default registration;
