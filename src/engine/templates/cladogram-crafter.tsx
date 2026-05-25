'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { orderMatchesCanonical, scoreOrder } from '@/engine/cladogram/scoring';
import type { TemplateRegistration } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import {
  CladogramCrafterDataSchema,
  type CladogramCrafterData,
} from '@/types/schemas';

function CladogramCrafterRenderer({
  data,
  onResult,
}: {
  data: CladogramCrafterData;
  onResult: (result: { correct: boolean; ms: number; details?: Record<string, unknown> }) => void;
}) {
  const startMs = useRef(Date.now());
  const [order, setOrder] = useState(() => data.taxa.map((t) => t.id));
  const [submitted, setSubmitted] = useState(false);
  const finishedRef = useRef(false);

  const score = useMemo(() => scoreOrder(data, order), [data, order]);
  const canonicalScore = scoreOrder(data, data.canonicalOrder);

  function move(index: number, dir: -1 | 1) {
    if (submitted) return;
    const next = [...order];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setOrder(next);
  }

  function submit() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setSubmitted(true);
    const correct = orderMatchesCanonical(data, order);
    onResult({
      correct,
      ms: Date.now() - startMs.current,
      details: { score, poweredIdea: data.poweredIdea },
    });
  }

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-micro">
          <thead>
            <tr>
              <th className="p-2 text-left text-(--text-dim)">Taxon</th>
              {data.traits.map((t) => (
                <th key={t.id} className="p-2 text-center text-(--text-dim)">
                  {t.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.taxa.map((taxon) => (
              <tr key={taxon.id} className="border-t border-(--border-faint)">
                <td className="p-2 font-semibold text-(--text-primary)">
                  {taxon.icon ? `${taxon.icon} ` : ''}
                  {taxon.name}
                </td>
                {data.traits.map((t) => (
                  <td key={t.id} className="p-2 text-center text-(--text-secondary)">
                    {data.traitMatrix[taxon.id]?.[t.id] ?? 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card>
        <p className="mb-3 text-body text-(--text-secondary)">
          Arrange taxa (outgroup left) to minimize parsimony score. Lower is better.
        </p>
        <p className="text-meta text-(--accent-cyan)">
          Parsimony score: {score} (target ≤ {data.canonicalParsimonyScore}, best {canonicalScore})
        </p>
      </Card>

      <ol className="space-y-2">
        {order.map((id, index) => {
          const taxon = data.taxa.find((t) => t.id === id)!;
          return (
            <li
              key={id}
              className="flex items-center gap-2 rounded-(--r-lg) border border-(--border-light) bg-(--bg-card) px-3 py-2"
            >
              <span className="flex-1 text-body font-semibold text-(--text-primary)">
                {index + 1}. {taxon.name}
                {taxon.isOutgroup ? ' (outgroup)' : ''}
              </span>
              <Button variant="ghost" disabled={submitted || index === 0} onClick={() => move(index, -1)}>
                ↑
              </Button>
              <Button
                variant="ghost"
                disabled={submitted || index === order.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </Button>
            </li>
          );
        })}
      </ol>

      {!submitted ? (
        <Button variant="primary" fullWidth onClick={submit}>
          Submit tree order
        </Button>
      ) : (
        <Card variant={score <= data.canonicalParsimonyScore ? 'correct' : 'wrong'}>
          <p className="text-body text-(--text-secondary)">{data.poweredIdea}</p>
          {data.synapomorphies?.map((s) => (
            <p key={s.traitId} className={cn('mt-2 text-meta text-(--text-dim)')}>
              {s.label}
            </p>
          ))}
        </Card>
      )}
    </div>
  );
}

const exemplar: CladogramCrafterData = {
  taxa: [
    { id: 'lancelet', name: 'Lancelet', isOutgroup: true },
    { id: 'shark', name: 'Shark' },
    { id: 'frog', name: 'Frog' },
    { id: 'lizard', name: 'Lizard' },
    { id: 'sparrow', name: 'Sparrow' },
    { id: 'mouse', name: 'Mouse' },
  ],
  outgroupId: 'lancelet',
  traits: [
    { id: 'vert', label: 'Vertebrae' },
    { id: 'lungs', label: 'Lungs' },
    { id: 'amniotic', label: 'Amniotic egg' },
    { id: 'hair', label: 'Hair' },
    { id: 'feathers', label: 'Feathers' },
  ],
  traitMatrix: {
    lancelet: { vert: 0, lungs: 0, amniotic: 0, hair: 0, feathers: 0 },
    shark: { vert: 1, lungs: 0, amniotic: 0, hair: 0, feathers: 0 },
    frog: { vert: 1, lungs: 1, amniotic: 0, hair: 0, feathers: 0 },
    lizard: { vert: 1, lungs: 1, amniotic: 1, hair: 0, feathers: 0 },
    sparrow: { vert: 1, lungs: 1, amniotic: 1, hair: 0, feathers: 1 },
    mouse: { vert: 1, lungs: 1, amniotic: 1, hair: 1, feathers: 0 },
  },
  canonicalOrder: ['lancelet', 'shark', 'frog', 'lizard', 'mouse', 'sparrow'],
  canonicalParsimonyScore: 6,
  poweredIdea:
    'Shared derived traits (synapomorphies) cluster taxa on the most parsimonious tree.',
  synapomorphies: [
    { traitId: 'amniotic', label: 'Amniotic egg unites reptiles, birds, and mammals.', taxonIds: ['lizard', 'sparrow', 'mouse'] },
  ],
};

const registration: TemplateRegistration<CladogramCrafterData> = {
  kind: 'cladogram-crafter',
  schema: CladogramCrafterDataSchema,
  exemplar,
  classifications: {
    fastLane: false,
    microworld: true,
    constructionist: true,
    bodySyntonic: false,
    debugStyle: false,
  },
  Renderer: CladogramCrafterRenderer,
  describePrompt: (d) => `Cladogram crafter: ${d.taxa.length} taxa`,
  estimateMs: (d) => 60_000 + d.taxa.length * 10_000,
  defaultConfidenceMs: 120_000,
};

export default registration;
