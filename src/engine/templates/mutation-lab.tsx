'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import {
  classifySubstitution,
  proteinString,
  splitCodons,
  translateDna,
} from '@/engine/genetics/codonTable';
import type { TemplateRegistration } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import {
  MutationLabDataSchema,
  MutationTypeSchema,
  type MutationLabData,
} from '@/types/schemas';

type Phase = 'edit' | 'predict' | 'reveal';

const TYPE_LABELS: Record<string, string> = {
  silent: 'Silent',
  missense: 'Missense',
  nonsense: 'Nonsense',
  frameshift: 'Frameshift',
};

function MutationLabRenderer({
  data,
  onResult,
}: {
  data: MutationLabData;
  onResult: (result: { correct: boolean; ms: number }) => void;
}) {
  const startMs = useRef(Date.now());
  const [dna, setDna] = useState(data.templateDna);
  const [phase, setPhase] = useState<Phase>('edit');
  const [pickedType, setPickedType] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const finishedRef = useRef(false);

  const origProtein = useMemo(() => proteinString(translateDna(data.templateDna)), [data.templateDna]);
  const mutProtein = useMemo(() => proteinString(translateDna(dna)), [dna]);
  const actualType = useMemo(
    () => classifySubstitution(data.templateDna, dna),
    [data.templateDna, dna],
  );
  const codons = splitCodons(dna);
  const edited = dna !== data.templateDna;

  function replaceBase(base: 'A' | 'T' | 'G' | 'C') {
    const chars = dna.split('');
    chars[data.editableIndex] = base;
    setDna(chars.join(''));
  }

  function goPredict() {
    if (!edited) return;
    setPhase('predict');
  }

  function submitPrediction(type: string) {
    setPickedType(type);
    setPhase('reveal');
    setRevealed(true);
    if (!finishedRef.current) {
      finishedRef.current = true;
      const typeCorrect = type === data.correctMutationType;
      onResult({ correct: typeCorrect, ms: Date.now() - startMs.current });
    }
  }

  const types = MutationTypeSchema.options;

  return (
    <div className="space-y-5">
      <p className="text-body-lg text-(--text-secondary)">{data.scenario}</p>
      <p className="text-meta text-(--text-dim)">
        Click the highlighted base, choose a replacement, predict the mutation type, then watch translation.
      </p>

      <Card>
        <p className="mb-2 text-micro font-bold uppercase text-(--text-dim)">DNA</p>
        <div className="flex flex-wrap gap-1 font-mono text-sm">
          {dna.split('').map((base, i) => (
            <span
              key={i}
              className={cn(
                'rounded px-1 py-0.5',
                i === data.editableIndex
                  ? 'bg-[color-mix(in_oklab,var(--accent-cyan)_20%,transparent)] text-(--accent-cyan) ring-1 ring-(--accent-cyan)'
                  : 'text-(--text-primary)',
                i > 0 && i % 3 === 0 && 'ml-2',
              )}
            >
              {base}
            </span>
          ))}
        </div>
        <p className="mt-3 text-micro text-(--text-dim)">
          Codons: {codons.join(' | ')}
        </p>
      </Card>

      {phase === 'edit' ? (
        <div>
          <p className="mb-2 text-body font-semibold">Substitute the highlighted base:</p>
          <div className="flex flex-wrap gap-2">
            {data.replacements.map((base) => (
              <Button
                key={base}
                variant="secondary"
                onClick={() => replaceBase(base)}
              >
                {base}
              </Button>
            ))}
          </div>
          <Button variant="primary" className="mt-4" disabled={!edited} onClick={goPredict}>
            Lock in mutation → predict
          </Button>
        </div>
      ) : null}

      {phase === 'predict' ? (
        <div className="animate-slide-up space-y-3">
          <p className="text-body font-semibold">Predict the mutation type:</p>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Button key={type} variant="ghost" onClick={() => submitPrediction(type)}>
                {TYPE_LABELS[type]}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {revealed ? (
        <Card variant={pickedType === data.correctMutationType ? 'correct' : 'wrong'} className="animate-slide-up">
          <p className="text-micro font-bold uppercase text-(--accent-violet)">
            {TYPE_LABELS[actualType]} mutation
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-micro text-(--text-dim)">Original protein</p>
              <p className="font-mono text-sm">{origProtein}</p>
            </div>
            <div>
              <p className="text-micro text-(--text-dim)">Mutated protein</p>
              <p className="font-mono text-sm text-(--status-correct)">{mutProtein}</p>
            </div>
          </div>
          <p className="mt-3 text-body text-(--text-secondary)">{data.clinicalHook}</p>
          <p className="mt-2 text-body font-semibold text-(--accent-cyan)">{data.poweredIdea}</p>
        </Card>
      ) : null}
    </div>
  );
}

const exemplar: MutationLabData = {
  scenario: 'Sickle cell site — one base change alters hemoglobin.',
  templateDna: 'ATGGAGGGCTAA',
  editableIndex: 4,
  replacements: ['A', 'T', 'G', 'C'],
  correctReplacement: 'T',
  correctMutationType: 'missense',
  clinicalHook: 'Glu → Val at position 2 causes sickle-shaped red blood cells.',
  poweredIdea: 'A single base substitution can change one amino acid and disease phenotype.',
};

const registration: TemplateRegistration<MutationLabData> = {
  kind: 'mutation-lab',
  schema: MutationLabDataSchema,
  exemplar,
  classifications: {
    fastLane: true,
    microworld: true,
    constructionist: true,
    bodySyntonic: false,
    debugStyle: true,
  },
  Renderer: MutationLabRenderer,
  describePrompt: (data) => `Mutation lab: ${data.scenario.slice(0, 40)}…`,
  estimateMs: () => 75_000,
  defaultConfidenceMs: 50_000,
};

export default registration;
