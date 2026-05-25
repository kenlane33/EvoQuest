'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { TemplateRegistration } from '@/engine/templates/registry';
import {
  BeTheTurtleDataSchema,
  type BeTheTurtleData,
} from '@/types/schemas';

function BeTheTurtleRenderer({
  data,
  onResult,
}: {
  data: BeTheTurtleData;
  onResult: (result: { correct: boolean; ms: number }) => void;
}) {
  const startMs = useRef(Date.now());
  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));
  const [nodeId, setNodeId] = useState(data.startNodeId);
  const [trail, setTrail] = useState<string[]>([]);
  const [lastBiology, setLastBiology] = useState<string | null>(null);
  const [choices, setChoices] = useState<Array<{ label: string; optimal: boolean }>>([]);
  const [done, setDone] = useState(false);
  const finishedRef = useRef(false);

  const node = nodeMap.get(nodeId);

  function choose(choiceIndex: number) {
    if (!node || done) return;
    const choice = node.choices[choiceIndex];
    const nextChoices = [...choices, { label: choice.label, optimal: !!choice.isOptimal }];
    setChoices(nextChoices);
    setLastBiology(choice.biology);
    if (choice.fateTrail) setTrail((t) => [...t, choice.fateTrail!]);

    if (!choice.nextNodeId) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        setDone(true);
        onResult({ correct: nextChoices.every((c) => c.optimal), ms: Date.now() - startMs.current });
      }
      return;
    }
    setNodeId(choice.nextNodeId);
  }

  if (!node) return null;

  const isTerminal = node.choices.every((c) => c.nextNodeId === null);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-headline-sm font-black text-(--accent-cyan)">{data.roleTitle}</p>
        <p className="mt-1 text-body text-(--text-secondary)">{data.setup}</p>
      </div>

      {trail.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {trail.map((step, i) => (
            <span
              key={i}
              className="rounded-full border border-(--border-light) bg-(--bg-card) px-2 py-1 text-micro font-semibold text-(--text-secondary)"
            >
              {step}
            </span>
          ))}
        </div>
      ) : null}

      {lastBiology ? (
        <p className="animate-slide-up text-body italic text-(--text-dim)">{lastBiology}</p>
      ) : null}

      {!done ? (
        <>
          <Card>
            <p className="text-body-lg font-semibold text-(--text-primary)">{node.prompt}</p>
          </Card>
          <div className="flex flex-col gap-2">
            {node.choices.map((choice, i) => (
              <Button
                key={choice.label}
                variant="ghost"
                fullWidth
                onClick={() => choose(i)}
                className="justify-start border border-(--border-light) px-4 py-3 text-left text-body"
              >
                {choice.label}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <Card
          variant={node.isOptimalTerminal || choices.every((c) => c.optimal) ? 'correct' : 'wrong'}
          className="animate-slide-up"
        >
          <p className="text-headline-sm font-black text-(--text-primary)">
            {node.terminalTitle ?? 'Your fate'}
          </p>
          <p className="mt-2 text-body leading-relaxed text-(--text-secondary)">
            {node.terminalScene ?? lastBiology}
          </p>
          <p className="mt-3 text-body font-semibold text-(--accent-cyan)">{data.poweredIdea}</p>
        </Card>
      )}

      {done && !isTerminal ? null : null}
    </div>
  );
}

const exemplar: BeTheTurtleData = {
  roleTitle: 'You are a glucose molecule',
  setup: 'You enter a muscle cell. Oxygen is available.',
  startNodeId: 'start',
  nodes: [
    {
      id: 'start',
      prompt: 'Glycolysis splits you into pyruvate. What next?',
      choices: [
        {
          label: 'Enter the mitochondrion — aerobic respiration',
          nextNodeId: 'aerobic',
          biology: 'Pyruvate crosses into the mitochondrial matrix.',
          isOptimal: true,
          fateTrail: '→ pyruvate',
        },
        {
          label: 'Stay in the cytoplasm — ferment',
          nextNodeId: 'anaerobic',
          biology: 'Without entering mitochondria, fermentation begins.',
          fateTrail: '→ lactate',
        },
      ],
    },
    {
      id: 'aerobic',
      prompt: 'The Krebs cycle and electron transport spin up.',
      choices: [
        {
          label: 'Complete aerobic respiration',
          nextNodeId: null,
          biology: 'Full oxidation yields roughly 36 ATP.',
          isOptimal: true,
          fateTrail: '→ CO₂ + ATP',
        },
        {
          label: 'Abort and ferment instead',
          nextNodeId: null,
          biology: 'You leave most energy unharvested.',
        },
      ],
      terminalTitle: 'Exhaled as CO₂ — 36 ATP banked',
      terminalScene: 'You powered the muscle through complete aerobic respiration.',
      isOptimalTerminal: true,
    },
    {
      id: 'anaerobic',
      prompt: 'Oxygen ran low. Fermentation takes over.',
      choices: [
        {
          label: 'Accept the lactate fate',
          nextNodeId: null,
          biology: 'Only 2 ATP net — the muscle may burn.',
        },
      ],
      terminalTitle: 'Lactic acid — 2 ATP only',
      terminalScene: 'Anaerobic respiration harvests far less energy than aerobic.',
      isOptimalTerminal: false,
    },
  ],
  poweredIdea: 'Aerobic respiration extracts far more ATP from glucose than fermentation.',
};

const registration: TemplateRegistration<BeTheTurtleData> = {
  kind: 'be-the-turtle',
  schema: BeTheTurtleDataSchema,
  exemplar,
  classifications: {
    fastLane: true,
    microworld: false,
    constructionist: false,
    bodySyntonic: true,
    debugStyle: false,
  },
  Renderer: BeTheTurtleRenderer,
  describePrompt: (data) => `Be the turtle: ${data.roleTitle}`,
  estimateMs: () => 60_000,
  defaultConfidenceMs: 45_000,
};

export default registration;
