'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import {
  findInconsistencies,
  PATTERN_LABELS,
} from '@/engine/pedigree/check';
import type { TemplateRegistration } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import {
  PedigreeDetectiveDataSchema,
  type InheritancePattern,
  type PedigreeDetectiveData,
} from '@/types/schemas';

const PATTERNS = Object.keys(PATTERN_LABELS) as InheritancePattern[];

function PedigreeDetectiveRenderer({
  data,
  onResult,
}: {
  data: PedigreeDetectiveData;
  onResult: (result: { correct: boolean; ms: number; details?: Record<string, unknown> }) => void;
}) {
  const startMs = useRef(Date.now());
  const [pattern, setPattern] = useState<InheritancePattern | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const finishedRef = useRef(false);

  const inconsistencies = pattern ? findInconsistencies(data, pattern) : [];
  const badIds = new Set(inconsistencies.map((i) => i.personId));

  function submit() {
    if (!pattern || finishedRef.current) return;
    finishedRef.current = true;
    setSubmitted(true);
    const correct =
      pattern === data.canonical.pattern && inconsistencies.length === 0;
    if (!correct && data.hints && hintIndex < data.hints.length) {
      setHintIndex((i) => i + 1);
    }
    onResult({
      correct,
      ms: Date.now() - startMs.current,
      details: { pattern, poweredIdea: data.canonical.poweredIdea },
    });
  }

  const gens = [...new Set(data.people.map((p) => p.generation))].sort();

  return (
    <div className="space-y-5">
      <Card>
        <p className="text-body-lg text-(--text-primary)">
          Trait: <span className="font-bold">{data.traitLabel}</span>
        </p>
      </Card>

      <div className="space-y-6">
        {gens.map((gen) => (
          <div key={gen} className="flex flex-wrap justify-center gap-4">
            {data.people
              .filter((p) => p.generation === gen)
              .map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-(--r-lg) border px-3 py-2',
                    badIds.has(p.id)
                      ? 'border-(--status-wrong) bg-[color-mix(in_oklab,var(--status-wrong)_12%,transparent)]'
                      : 'border-(--border-light) bg-(--bg-card)',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center border-2 text-sm font-bold',
                      p.sex === 'M' ? 'rounded-sm' : 'rounded-full',
                      p.affected
                        ? 'border-(--status-wrong) bg-[color-mix(in_oklab,var(--status-wrong)_25%,transparent)]'
                        : 'border-(--border-medium) bg-(--bg-card-hi)',
                    )}
                  >
                    {p.sex}
                  </span>
                  <span className="text-micro text-(--text-dim)">{p.label}</span>
                </div>
              ))}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 max-sm:w-full sm:flex-row sm:flex-wrap">
        {PATTERNS.map((p) => (
          <Button
            key={p}
            variant={pattern === p ? 'primary' : 'secondary'}
            disabled={submitted}
            fullWidth
            className="max-sm:w-full text-micro sm:w-auto"
            onClick={() => setPattern(p)}
          >
            {PATTERN_LABELS[p]}
          </Button>
        ))}
      </div>

      {pattern && inconsistencies.length > 0 ? (
        <Card variant="wrong">
          <ul className="space-y-1 text-meta text-(--text-secondary)">
            {inconsistencies.map((i) => (
              <li key={i.personId}>{i.message}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {data.hints && hintIndex > 0 ? (
        <p className="text-meta text-(--accent-amber)">Hint: {data.hints[hintIndex - 1]}</p>
      ) : null}

      {!submitted ? (
        <Button variant="primary" fullWidth disabled={!pattern} onClick={submit}>
          Test hypothesis
        </Button>
      ) : (
        <Card variant={pattern === data.canonical.pattern ? 'correct' : 'wrong'}>
          <p className="text-body text-(--text-secondary)">{data.canonical.poweredIdea}</p>
        </Card>
      )}
    </div>
  );
}

const exemplar: PedigreeDetectiveData = {
  traitLabel: 'Cystic fibrosis',
  people: [
    { id: 'I-1', label: 'I-1', sex: 'M', affected: false, generation: 1 },
    { id: 'I-2', label: 'I-2', sex: 'F', affected: false, generation: 1 },
    { id: 'II-1', label: 'II-1', sex: 'F', affected: false, generation: 2, motherId: 'I-2', fatherId: 'I-1' },
    { id: 'II-2', label: 'II-2', sex: 'M', affected: true, generation: 2, motherId: 'I-2', fatherId: 'I-1' },
  ],
  canonical: {
    pattern: 'autosomal-recessive',
    poweredIdea:
      'Two unaffected carrier parents can have an affected child — the hallmark of autosomal recessive inheritance.',
  },
  hints: ['Count affected vs unaffected by sex.', 'Can both parents be unaffected?'],
};

const registration: TemplateRegistration<PedigreeDetectiveData> = {
  kind: 'pedigree-detective',
  schema: PedigreeDetectiveDataSchema,
  exemplar,
  classifications: {
    fastLane: false,
    microworld: false,
    constructionist: true,
    bodySyntonic: false,
    debugStyle: true,
  },
  Renderer: PedigreeDetectiveRenderer,
  describePrompt: (d) => `Pedigree detective: ${d.traitLabel}`,
  estimateMs: () => 120_000,
  defaultConfidenceMs: 150_000,
};

export default registration;
