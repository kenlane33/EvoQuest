'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { TemplateRegistration } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import {
  CounterfactualLabDataSchema,
  type CounterfactualLabData,
} from '@/types/schemas';

function chainsMatch(data: CounterfactualLabData, chain: string[]): boolean {
  if (chain.length !== data.canonicalChain.length) return false;
  const eq = (a: string[], b: string[]) => a.every((id, i) => id === b[i]);
  if (eq(chain, data.canonicalChain)) return true;
  return (data.alternateChains ?? []).some((alt) => eq(chain, alt));
}

function CounterfactualLabRenderer({
  data,
  onResult,
}: {
  data: CounterfactualLabData;
  onResult: (result: { correct: boolean; ms: number; details?: Record<string, unknown> }) => void;
}) {
  const startMs = useRef(Date.now());
  const [phase, setPhase] = useState<'chain' | 'final' | 'done'>('chain');
  const [chain, setChain] = useState<string[]>([]);
  const [pool, setPool] = useState(() => data.cards.map((c) => c.id));
  const [finalPick, setFinalPick] = useState<number | null>(null);
  const finishedRef = useRef(false);

  function pickCard(id: string) {
    if (phase !== 'chain') return;
    setChain((c) => [...c, id]);
    setPool((p) => p.filter((x) => x !== id));
  }

  function undoCard() {
    if (phase !== 'chain' || chain.length === 0) return;
    const last = chain[chain.length - 1];
    setChain((c) => c.slice(0, -1));
    setPool((p) => [...p, last]);
  }

  function toFinalPhase() {
    if (chain.length !== data.canonicalChain.length) return;
    setPhase('final');
  }

  function submitFinal(index: number) {
    if (finishedRef.current) return;
    setFinalPick(index);
    finishedRef.current = true;
    setPhase('done');
    const chainOk = chainsMatch(data, chain);
    const finalOk = data.finalStateOptions[index]?.canonical ?? false;
    onResult({
      correct: chainOk && finalOk,
      ms: Date.now() - startMs.current,
      details: { poweredIdea: data.poweredIdea },
    });
  }

  const cardById = new Map(data.cards.map((c) => [c.id, c]));

  return (
    <div className="space-y-5">
      <Card>
        <p className="text-body-lg font-bold text-(--text-primary)">{data.prompt}</p>
        <p className="mt-3 text-body text-(--text-secondary)">{data.context}</p>
      </Card>

      {phase === 'chain' ? (
        <>
          <div>
            <p className="mb-2 text-micro font-bold uppercase text-(--text-dim)">Your cascade</p>
            <ol className="min-h-[4rem] space-y-2 rounded-(--r-lg) border border-dashed border-(--border-medium) bg-(--bg-card) p-3">
              {chain.length === 0 ? (
                <li className="text-meta text-(--text-faint)">Tap cards below in causal order…</li>
              ) : (
                chain.map((id, i) => (
                  <li key={`${id}-${i}`} className="text-body text-(--text-primary)">
                    {i + 1}. {cardById.get(id)?.text}
                  </li>
                ))
              )}
            </ol>
          </div>

          <div className="flex flex-wrap gap-2">
            {pool.map((id) => (
              <Button key={id} variant="secondary" onClick={() => pickCard(id)} className="text-left">
                {cardById.get(id)?.text}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={undoCard} disabled={chain.length === 0}>
              Undo
            </Button>
            <Button
              variant="primary"
              fullWidth
              disabled={chain.length !== data.canonicalChain.length}
              onClick={toFinalPhase}
            >
              Continue
            </Button>
          </div>
        </>
      ) : null}

      {phase === 'final' || phase === 'done' ? (
        <div className="space-y-3">
          <p className="text-body font-semibold text-(--accent-cyan)">
            What is the final state of Earth&apos;s biosphere?
          </p>
          {data.finalStateOptions.map((opt, i) => (
            <Button
              key={opt.label}
              variant="ghost"
              fullWidth
              disabled={phase === 'done'}
              onClick={() => submitFinal(i)}
              className={cn(
                'justify-start border border-(--border-light) px-4 py-3 text-left',
                phase === 'done' && finalPick === i && opt.canonical && 'border-(--status-correct)',
                phase === 'done' && finalPick === i && !opt.canonical && 'border-(--status-wrong)',
              )}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      ) : null}

      {phase === 'done' ? (
        <Card>
          <p className="text-body text-(--text-secondary)">{data.poweredIdea}</p>
          <p className="mt-3 text-meta text-(--text-dim)">{data.consensusNotes}</p>
        </Card>
      ) : null}
    </div>
  );
}

const exemplar: CounterfactualLabData = {
  prompt: 'What if photosynthesis had never evolved?',
  context:
    'Oxygenic photosynthesis transformed Earth\'s atmosphere and enabled aerobic respiration, the ozone layer, and complex multicellular life.',
  cards: [
    { id: 'no-o2', text: 'No oxygen buildup in the atmosphere', depth: 'immediate' },
    { id: 'no-ozone', text: 'No ozone layer — high UV at the surface', depth: 'near' },
    { id: 'anaerobic', text: 'Anaerobic microbes dominate ecosystems', depth: 'far' },
    { id: 'no-plants', text: 'No land plants or oxygen-breathing animals', depth: 'far' },
  ],
  canonicalChain: ['no-o2', 'no-ozone', 'anaerobic', 'no-plants'],
  finalStateOptions: [
    {
      label: 'Anaerobic microbial mats only',
      canonical: true,
      explanation: 'Without oxygenic photosynthesis, energy budgets stay low and complexity stays microbial.',
    },
    {
      label: 'Thriving modern forests unchanged',
      canonical: false,
      explanation: 'Land plants depend on oxygenic photosynthesis.',
    },
  ],
  consensusNotes: 'Paleobiologists treat the Great Oxygenation Event as contingent on cyanobacterial photosynthesis.',
  poweredIdea: 'Earth\'s biosphere history is one path through many possible contingencies.',
};

const registration: TemplateRegistration<CounterfactualLabData> = {
  kind: 'counterfactual-lab',
  schema: CounterfactualLabDataSchema,
  exemplar,
  classifications: {
    fastLane: false,
    microworld: true,
    constructionist: true,
    bodySyntonic: false,
    debugStyle: true,
  },
  Renderer: CounterfactualLabRenderer,
  describePrompt: (d) => `Counterfactual: ${d.prompt}`,
  estimateMs: () => 120_000,
  defaultConfidenceMs: 150_000,
};

export default registration;
