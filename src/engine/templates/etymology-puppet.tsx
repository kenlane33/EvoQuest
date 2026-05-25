'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { TemplateRegistration } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import {
  EtymologyPuppetDataSchema,
  type EtymologyPuppetData,
} from '@/types/schemas';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function EtymologyPuppetRenderer({
  data,
  onResult,
}: {
  data: EtymologyPuppetData;
  onResult: (result: { correct: boolean; ms: number }) => void;
}) {
  const startMs = useRef(Date.now());
  const morphemeById = useMemo(
    () => new Map(data.morphemes.map((m) => [m.id, m])),
    [data.morphemes],
  );
  const [slots, setSlots] = useState<(string | null)[]>(
    () => Array.from({ length: data.slots }, () => null),
  );
  const [pool, setPool] = useState(() => shuffle(data.morphemes.map((m) => m.id)));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const finishedRef = useRef(false);

  const assembled = slots
    .map((id) => (id ? morphemeById.get(id)?.morpheme ?? '' : ''))
    .join('');

  const hasPlacements = slots.some((s) => s !== null);

  const resetBoard = useCallback(() => {
    if (done) return;
    setSlots(Array.from({ length: data.slots }, () => null));
    setPool(shuffle(data.morphemes.map((m) => m.id)));
    setSelectedId(null);
    setDraggingId(null);
  }, [data.morphemes, data.slots, done]);

  const checkComplete = useCallback(
    (nextSlots: (string | null)[]) => {
      if (nextSlots.some((s) => s === null)) return false;
      const seq = nextSlots as string[];
      return data.acceptedAnswers.some(
        (answer) => answer.length === seq.length && answer.every((id, i) => id === seq[i]),
      );
    },
    [data.acceptedAnswers],
  );

  const placeInSlot = useCallback(
    (morphemeId: string, slotIndex: number) => {
      if (done || slots[slotIndex] !== null) return;
      const nextSlots = [...slots];
      nextSlots[slotIndex] = morphemeId;
      const nextPool = pool.filter((id) => id !== morphemeId);
      setSlots(nextSlots);
      setPool(nextPool);
      setSelectedId(null);
      setDraggingId(null);

      if (checkComplete(nextSlots) && !finishedRef.current) {
        finishedRef.current = true;
        setDone(true);
        onResult({ correct: true, ms: Date.now() - startMs.current });
      }
    },
    [checkComplete, done, onResult, pool, slots],
  );

  return (
    <div className="space-y-5">
      <p className="text-body-lg text-(--text-secondary)">{data.definition}</p>
      <p className="text-meta text-(--text-dim)">
        Drag morpheme tiles into the slots to build the term.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {slots.map((id, i) => {
          const token = id ? morphemeById.get(id) : null;
          return (
            <div
              key={i}
              role="button"
              tabIndex={selectedId && !id ? 0 : -1}
              onClick={() => selectedId && !id && placeInSlot(selectedId, i)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && selectedId && !id) {
                  placeInSlot(selectedId, i);
                }
              }}
              onDragOver={(e) => {
                if (!id && !done) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingId && !id) placeInSlot(draggingId, i);
              }}
              className={cn(
                'flex min-h-12 min-w-20 items-center justify-center rounded-(--r-lg) border px-3 py-2 text-center',
                token
                  ? 'border-[color-mix(in_oklab,var(--status-correct)_35%,transparent)] bg-[color-mix(in_oklab,var(--status-correct)_10%,transparent)]'
                  : selectedId
                    ? 'border-(--accent-cyan) border-dashed bg-[color-mix(in_oklab,var(--accent-cyan)_8%,transparent)]'
                    : 'border-dashed border-(--border-light) bg-(--bg-card)',
              )}
            >
              {token ? (
                <span>
                  <span className="block font-bold text-(--text-primary)">{token.morpheme}</span>
                  <span className="text-micro text-(--text-dim)">{token.meaning}</span>
                </span>
              ) : (
                <span className="text-meta text-(--text-dim)">slot {i + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      <p
        className={cn(
          'font-headline text-headline-md font-black transition-colors',
          done ? 'text-(--status-correct)' : 'text-(--text-dim)',
        )}
      >
        {assembled || '???'}
      </p>

      {!done ? (
        <Button variant="ghost" onClick={resetBoard} disabled={!hasPlacements}>
          Reset
        </Button>
      ) : null}

      {pool.length > 0 && !done ? (
        <div className="flex flex-wrap gap-2">
          {pool.map((id) => {
            const token = morphemeById.get(id);
            if (!token) return null;
            return (
              <button
                key={id}
                type="button"
                draggable
                onDragStart={() => setDraggingId(id)}
                onDragEnd={() => setDraggingId(null)}
                onClick={() => setSelectedId((prev) => (prev === id ? null : id))}
                className={cn(
                  'cursor-grab rounded-(--r-lg) border px-3 py-2 text-left active:cursor-grabbing',
                  selectedId === id
                    ? 'border-(--accent-cyan) bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)]'
                    : 'border-(--border-light) bg-(--bg-card-hi) hover:border-(--border-medium)',
                )}
              >
                <span className="block font-bold text-(--text-primary)">{token.morpheme}</span>
                <span className="text-micro text-(--text-dim)">
                  {token.meaning} · {token.language}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {done ? (
        <Card variant="correct" className="animate-slide-up">
          <p className="text-headline-sm font-black text-(--status-correct)">{data.targetTerm}</p>
          <p className="mt-2 text-body text-(--text-secondary)">{data.exampleSentence}</p>
          <p className="mt-2 text-body font-semibold text-(--accent-cyan)">{data.poweredIdea}</p>
        </Card>
      ) : null}
    </div>
  );
}

const exemplar: EtymologyPuppetData = {
  definition: 'One species living inside another in a lasting partnership.',
  slots: 4,
  morphemes: [
    { id: 'endo', morpheme: 'endo-', meaning: 'within', language: 'Greek' },
    { id: 'sym', morpheme: 'sym-', meaning: 'together', language: 'Greek' },
    { id: 'bio', morpheme: 'bio-', meaning: 'life', language: 'Greek' },
    { id: 'sis', morpheme: '-sis', meaning: 'process', language: 'Greek' },
    { id: 'exo', morpheme: 'exo-', meaning: 'outside', language: 'Greek' },
    { id: 'photo', morpheme: 'photo-', meaning: 'light', language: 'Greek' },
  ],
  acceptedAnswers: [['endo', 'sym', 'bio', 'sis']],
  targetTerm: 'endosymbiosis',
  exampleSentence: 'Mitochondria may be descendants of an ancient endosymbiosis event.',
  poweredIdea: 'The term literally means life living together within.',
};

const registration: TemplateRegistration<EtymologyPuppetData> = {
  kind: 'etymology-puppet',
  schema: EtymologyPuppetDataSchema,
  exemplar,
  classifications: {
    fastLane: true,
    microworld: false,
    constructionist: true,
    bodySyntonic: false,
    debugStyle: false,
  },
  Renderer: EtymologyPuppetRenderer,
  describePrompt: (data) => `Etymology puppet: build "${data.targetTerm}"`,
  estimateMs: () => 45_000,
  defaultConfidenceMs: 30_000,
};

export default registration;
