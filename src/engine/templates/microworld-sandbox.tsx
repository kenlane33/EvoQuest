'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { TemplateRegistration } from '@/engine/templates/registry';
import {
  MicroworldSandboxDataSchema,
  type MicroworldSandboxData,
} from '@/types/schemas';

function simulateLogistic(
  params: Record<string, number>,
  generations: number,
): number[] {
  const r = params.r ?? 0.4;
  const K = params.K ?? 200;
  let n = params.N0 ?? 30;
  const series = [n];
  for (let i = 0; i < generations; i++) {
    n = Math.max(0, n + r * n * (1 - n / K));
    series.push(n);
  }
  return series;
}

function goalMet(data: MicroworldSandboxData, finalValue: number): boolean {
  const { goal } = data;
  if (goal.kind === 'reachValue') {
    return finalValue >= goal.min && finalValue <= goal.max;
  }
  return finalValue <= goal.below;
}

function goalLabel(data: MicroworldSandboxData): string {
  const { goal } = data;
  if (goal.kind === 'reachValue') {
    return `Population between ${goal.min} and ${goal.max}`;
  }
  return `Population below ${goal.below}`;
}

function MicroworldSandboxRenderer({
  data,
  onResult,
}: {
  data: MicroworldSandboxData;
  onResult: (result: { correct: boolean; ms: number; details?: Record<string, unknown> }) => void;
}) {
  const startMs = useRef(Date.now());
  const initial = useMemo(() => {
    const values: Record<string, number> = {};
    for (const p of data.parameters) values[p.key] = p.default;
    return values;
  }, [data.parameters]);

  const [params, setParams] = useState(initial);
  const [done, setDone] = useState(false);
  const finishedRef = useRef(false);

  const series = useMemo(
    () => simulateLogistic(params, data.generations),
    [params, data.generations],
  );
  const finalPop = series[series.length - 1] ?? 0;
  const met = goalMet(data, finalPop);
  const maxY = Math.max(...series, 1);

  function submit() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setDone(true);
    onResult({
      correct: met,
      ms: Date.now() - startMs.current,
      details: { finalPop, params, poweredIdea: data.poweredIdea },
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <p className="text-body-lg text-(--text-primary)">{data.reveal}</p>
        <p className="mt-2 text-meta text-(--accent-cyan)">Goal: {goalLabel(data)}</p>
      </Card>

      <div className="rounded-(--r-lg) border border-(--border-light) bg-(--bg-card) p-4">
        <svg viewBox="0 0 320 120" className="h-32 w-full" role="img" aria-label="Population over time">
          <polyline
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="2"
            points={series
              .map((v, i) => `${(i / (series.length - 1)) * 300 + 10},${110 - (v / maxY) * 90}`)
              .join(' ')}
          />
        </svg>
        <p className="text-center text-meta text-(--text-dim)">
          Final population: <span className="font-bold text-(--text-primary)">{Math.round(finalPop)}</span>
        </p>
      </div>

      <div className="space-y-4">
        {data.parameters.map((p) => (
          <label key={p.key} className="block">
            <span className="text-body font-semibold text-(--text-secondary)">
              {p.label}
              {p.units ? ` (${p.units})` : ''}: {params[p.key]}
            </span>
            <input
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={params[p.key]}
              disabled={done}
              onChange={(e) =>
                setParams((prev) => ({ ...prev, [p.key]: Number(e.target.value) }))
              }
              className="mt-2 w-full accent-(--accent-cyan)"
            />
          </label>
        ))}
      </div>

      {!done ? (
        <Button variant="primary" fullWidth onClick={submit}>
          Lock in parameters
        </Button>
      ) : (
        <Card variant={met ? 'correct' : 'wrong'}>
          <p className="text-body text-(--text-secondary)">{data.poweredIdea}</p>
        </Card>
      )}
    </div>
  );
}

const exemplar: MicroworldSandboxData = {
  modelId: 'logistic',
  parameters: [
    { key: 'r', label: 'Growth rate', min: 0.1, max: 1.2, default: 0.3, step: 0.05 },
    { key: 'K', label: 'Carrying capacity', min: 100, max: 400, default: 150, step: 10 },
    { key: 'N0', label: 'Starting population', min: 10, max: 80, default: 25, step: 5 },
  ],
  goal: { kind: 'reachValue', signal: 'finalPopulation', min: 180, max: 220 },
  generations: 40,
  reveal: 'Tinker growth rate and carrying capacity until the population stabilizes near K.',
  poweredIdea: 'Logistic growth slows as population approaches carrying capacity.',
};

const registration: TemplateRegistration<MicroworldSandboxData> = {
  kind: 'microworld-sandbox',
  schema: MicroworldSandboxDataSchema,
  exemplar,
  classifications: {
    fastLane: false,
    microworld: true,
    constructionist: false,
    bodySyntonic: false,
    debugStyle: true,
  },
  Renderer: MicroworldSandboxRenderer,
  describePrompt: (d) => `Microworld: ${d.reveal}`,
  estimateMs: () => 90_000,
  defaultConfidenceMs: 120_000,
};

export default registration;
