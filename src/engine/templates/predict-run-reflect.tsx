'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { SpeakButton } from '@/components/content/SpeakButton';
import type { TemplateRegistration, RendererProps } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import {
  PredictRunReflectDataSchema,
  type PredictRunReflectData,
} from '@/types/schemas';

type Phase = 'predict' | 'run' | 'reflect' | 'done';

function PredictRunReflectRenderer({
  data,
  descText,
  onResult,
}: RendererProps<PredictRunReflectData>) {
  const startMs = useRef(Date.now());
  const [phase, setPhase] = useState<Phase>('predict');
  const [prediction, setPrediction] = useState<number | null>(null);
  const [bugPick, setBugPick] = useState<number | null>(null);
  const finishedRef = useRef(false);

  function finish(correct: boolean) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase('done');
    onResult({ correct, ms: Date.now() - startMs.current });
  }

  function commitPrediction(index: number) {
    setPrediction(index);
    setPhase('run');
    const gotIt = index === data.correctPredictionIndex;
    setTimeout(() => {
      if (gotIt) finish(true);
      else setPhase('reflect');
    }, 2200);
  }

  function commitBug(index: number) {
    setBugPick(index);
    const candidate = data.bugCandidates[index];
    finish(candidate.isTheBug);
  }

  const predictionText =
    prediction !== null ? data.predictOptions[prediction] : null;
  const truthText = data.predictOptions[data.correctPredictionIndex];
  const matched = prediction === data.correctPredictionIndex;

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-body-lg leading-relaxed text-(--text-primary)">{data.scenario}</p>
            {phase === 'predict' ? (
              <p className="text-body font-semibold text-(--accent-cyan)">{data.predictPrompt}</p>
            ) : null}
          </div>
          {descText ? (
            <SpeakButton slot="desc" text={descText} label="Read question" className="mt-0.5" />
          ) : null}
        </div>
      </Card>

      {phase === 'predict' ? (
        <>
          <p className="text-meta text-(--text-dim)">
            Commit a prediction before seeing the outcome.
          </p>
          <div className="animate-slide-up flex flex-col gap-2">
            {data.predictOptions.map((option, i) => (
              <Button
                key={option}
                variant="ghost"
                fullWidth
                onClick={() => commitPrediction(i)}
                className="justify-start border border-(--border-light) px-4 py-3 text-left"
              >
                {option}
              </Button>
            ))}
          </div>
        </>
      ) : null}

      {phase === 'run' || phase === 'reflect' || phase === 'done' ? (
        <div className="animate-slide-up space-y-3">
          <p className="text-micro font-bold uppercase tracking-widest text-(--accent-violet)">
            {phase === 'run' ? 'Running…' : matched ? 'Match' : 'Compare'}
          </p>
          <Card>
            <p className="text-body leading-relaxed text-(--text-secondary)">{data.runNarrative}</p>
          </Card>
          <div className="grid gap-2 sm:grid-cols-2">
            <div
              className={cn(
                'rounded-(--r-lg) border px-4 py-3',
                matched
                  ? 'border-[color-mix(in_oklab,var(--status-correct)_35%,transparent)] bg-[color-mix(in_oklab,var(--status-correct)_8%,transparent)]'
                  : 'border-[color-mix(in_oklab,var(--status-wrong)_25%,transparent)] opacity-80',
              )}
            >
              <p className="text-micro text-(--text-dim)">You predicted</p>
              <p
                className={cn(
                  'text-body font-semibold',
                  matched ? 'text-(--status-correct)' : 'text-(--text-primary)',
                )}
              >
                {predictionText}
                {matched ? ' ✓' : null}
              </p>
            </div>
            <div className="rounded-(--r-lg) border border-[color-mix(in_oklab,var(--status-correct)_35%,transparent)] bg-[color-mix(in_oklab,var(--status-correct)_8%,transparent)] px-4 py-3">
              <p className="text-micro text-(--text-dim)">Reality</p>
              <p className="text-body font-semibold text-(--status-correct)">{truthText}</p>
            </div>
          </div>
          <p className="text-body text-(--text-secondary)">{data.truthSummary}</p>
        </div>
      ) : null}

      {phase === 'reflect' ? (
        <div className="animate-slide-up space-y-3">
          <p className="text-body font-semibold text-(--text-primary)">
            Your prediction missed — what was the bug in your mental model?
          </p>
          <div className="flex flex-col gap-2">
            {data.bugCandidates.map((candidate, i) => (
              <Button
                key={candidate.label}
                variant="ghost"
                fullWidth
                onClick={() => commitBug(i)}
                className="justify-start border border-(--border-light) px-4 py-3 text-left"
              >
                {candidate.label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {phase === 'done' && matched ? (
        <Card variant="correct" className="animate-slide-up">
          <p className="text-body text-(--text-secondary)">
            Your prediction matched reality — no bug to debug.
          </p>
          <p className="mt-2 text-body font-semibold text-(--accent-cyan)">{data.poweredIdea}</p>
        </Card>
      ) : null}

      {phase === 'done' && !matched && bugPick !== null ? (
        <Card variant={data.bugCandidates[bugPick].isTheBug ? 'correct' : 'wrong'} className="animate-slide-up">
          <p className="text-body text-(--text-secondary)">
            {data.bugCandidates[bugPick].explanation}
          </p>
          <p className="mt-2 text-body font-semibold text-(--accent-cyan)">{data.poweredIdea}</p>
        </Card>
      ) : null}
    </div>
  );
}

const exemplar: PredictRunReflectData = {
  scenario:
    'A hospital uses the same antibiotic for ten years. Bacteria in patients increasingly resist it.',
  predictPrompt: 'Why do resistant bacteria become more common over time?',
  predictOptions: [
    'Bacteria evolved resistance to survive the drug',
    'Random mutations were selected — resistant variants reproduced more',
    'The antibiotic made bacteria stronger',
    'Patients passed resistance to each other like a cold',
  ],
  correctPredictionIndex: 1,
  runNarrative:
    'Resistant mutants already existed in the population. Each treatment killed susceptible cells, leaving resistant survivors to multiply. Over years the population shifted.',
  truthSummary:
    'Selection acts on existing variation — bacteria did not "try" to resist; resistant forms happened to survive.',
  bugCandidates: [
    {
      label: 'I treated evolution as intentional — bacteria wanted to survive',
      isTheBug: true,
      explanation: 'Teleology sneaks in when we say organisms evolve "to" do something.',
    },
    {
      label: 'I forgot that variation must exist before selection',
      isTheBug: false,
      explanation: 'Close — but the main bug here is teleological language.',
    },
    {
      label: 'I confused individual adaptation with population change',
      isTheBug: false,
      explanation: 'Individuals do not evolve; populations change allele frequencies.',
    },
  ],
  poweredIdea: 'Natural selection filters variation that already exists — it does not design solutions.',
};

const registration: TemplateRegistration<PredictRunReflectData> = {
  kind: 'predict-run-reflect',
  schema: PredictRunReflectDataSchema,
  exemplar,
  classifications: {
    fastLane: true,
    microworld: false,
    constructionist: false,
    bodySyntonic: false,
    debugStyle: true,
  },
  Renderer: PredictRunReflectRenderer,
  describePrompt: (data) => `Predict-run-reflect: ${data.scenario.slice(0, 50)}…`,
  estimateMs: () => 75_000,
  defaultConfidenceMs: 50_000,
};

export default registration;
