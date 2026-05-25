'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/common/Card';
import type { TemplateRegistration } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import {
  RecipeSequencerDataSchema,
  type RecipeSequencerData,
} from '@/types/schemas';

type RecipeSequencerDetails = {
  moves: number;
  wrongPlacements: number;
};

type Snapshot = {
  slots: (string | null)[];
  pool: string[];
  locked: boolean[];
  moves: number;
  wrongPlacements: number;
  complete: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function stepById(data: RecipeSequencerData, id: string) {
  return data.steps.find((s) => s.id === id);
}

function RecipeSequencerRenderer({
  data,
  onResult,
  resumeFromSnapshot,
  saveSnapshot,
}: {
  data: RecipeSequencerData;
  onResult: (result: {
    correct: boolean;
    ms: number;
    details?: RecipeSequencerDetails;
  }) => void;
  resumeFromSnapshot?: unknown;
  saveSnapshot?: (snapshot: unknown) => void;
}) {
  const startMs = useRef(Date.now());
  const snap = resumeFromSnapshot as Snapshot | undefined;
  const stepIds = useMemo(() => data.steps.map((s) => s.id), [data.steps]);

  const [slots, setSlots] = useState<(string | null)[]>(
    snap?.slots ?? Array.from({ length: data.steps.length }, () => null),
  );
  const [pool, setPool] = useState<string[]>(
    snap?.pool ?? shuffle(stepIds),
  );
  const [locked, setLocked] = useState<boolean[]>(
    snap?.locked ?? Array.from({ length: data.steps.length }, () => false),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [moves, setMoves] = useState(snap?.moves ?? 0);
  const [wrongPlacements, setWrongPlacements] = useState(snap?.wrongPlacements ?? 0);
  const [complete, setComplete] = useState(snap?.complete ?? false);
  const [showWhy, setShowWhy] = useState(false);
  const finishedRef = useRef(false);

  const persist = useCallback(
    (
      next: Partial<{
        slots: (string | null)[];
        pool: string[];
        locked: boolean[];
        moves: number;
        wrongPlacements: number;
        complete: boolean;
      }>,
    ) => {
      saveSnapshot?.({
        slots: next.slots ?? slots,
        pool: next.pool ?? pool,
        locked: next.locked ?? locked,
        moves: next.moves ?? moves,
        wrongPlacements: next.wrongPlacements ?? wrongPlacements,
        complete: next.complete ?? complete,
      });
    },
    [complete, locked, moves, pool, saveSnapshot, slots, wrongPlacements],
  );

  const finish = useCallback(
    (nextMoves: number, nextWrong: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setComplete(true);
      setShowWhy(true);
      persist({ complete: true, moves: nextMoves, wrongPlacements: nextWrong });
      onResult({
        correct: true,
        ms: Date.now() - startMs.current,
        details: { moves: nextMoves, wrongPlacements: nextWrong },
      });
    },
    [onResult, persist],
  );

  const tryPlace = useCallback(
    (stepId: string, slotIndex: number) => {
      if (complete || locked[slotIndex]) return;
      const expectedId = data.steps[slotIndex].id;
      const nextMoves = moves + 1;

      if (stepId !== expectedId) {
        setMoves(nextMoves);
        setWrongPlacements((w) => w + 1);
        setHint(data.steps[slotIndex].consequenceHint);
        setSelectedId(null);
        persist({ moves: nextMoves, wrongPlacements: wrongPlacements + 1 });
        return;
      }

      const nextSlots = [...slots];
      nextSlots[slotIndex] = stepId;
      const nextPool = pool.filter((id) => id !== stepId);
      const nextLocked = [...locked];
      nextLocked[slotIndex] = true;
      setSlots(nextSlots);
      setPool(nextPool);
      setLocked(nextLocked);
      setMoves(nextMoves);
      setHint(null);
      setSelectedId(null);
      persist({
        slots: nextSlots,
        pool: nextPool,
        locked: nextLocked,
        moves: nextMoves,
      });

      if (nextLocked.every(Boolean)) {
        finish(nextMoves, wrongPlacements);
      }
    },
    [
      complete,
      data.steps,
      finish,
      locked,
      moves,
      persist,
      pool,
      slots,
      wrongPlacements,
    ],
  );

  function onDragStart(stepId: string) {
    if (complete || !pool.includes(stepId)) return;
    setDraggingId(stepId);
    setSelectedId(null);
  }

  function onDragEnd() {
    setDraggingId(null);
  }

  function onDropSlot(slotIndex: number) {
    if (!draggingId) return;
    tryPlace(draggingId, slotIndex);
    setDraggingId(null);
  }

  function onTileClick(stepId: string) {
    if (complete || !pool.includes(stepId)) return;
    setSelectedId((prev) => (prev === stepId ? null : stepId));
    setHint(null);
  }

  function onSlotClick(slotIndex: number) {
    if (!selectedId) return;
    tryPlace(selectedId, slotIndex);
  }

  return (
    <div className="space-y-5">
      <p className="text-body-lg font-semibold text-(--text-primary)">{data.processTitle}</p>
      <p className="text-meta text-(--text-dim)">
        Drag each step into its slot — or tap a card, then tap a slot.
      </p>

      <ol className="flex flex-col gap-2">
        {data.steps.map((step, i) => {
          const placedId = slots[i];
          const placed = placedId ? stepById(data, placedId) : null;
          const isLocked = locked[i];
          return (
            <li key={step.id}>
              <div
                role="button"
                tabIndex={selectedId && !isLocked && !complete ? 0 : -1}
                onClick={() => onSlotClick(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSlotClick(i);
                }}
                onDragOver={(e) => {
                  if (!complete && !isLocked) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  onDropSlot(i);
                }}
                className={cn(
                  'flex min-h-14 items-center gap-3 rounded-(--r-lg) border px-3 py-2 transition-colors',
                  isLocked
                    ? 'border-[color-mix(in_oklab,var(--status-correct)_35%,transparent)] bg-[color-mix(in_oklab,var(--status-correct)_10%,transparent)]'
                    : selectedId
                      ? 'border-(--accent-cyan) bg-[color-mix(in_oklab,var(--accent-cyan)_8%,transparent)]'
                      : 'border-dashed border-(--border-light) bg-(--bg-card)',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-micro font-black',
                    isLocked
                      ? 'bg-[color-mix(in_oklab,var(--status-correct)_20%,transparent)] text-(--status-correct)'
                      : 'bg-(--bg-card-active) text-(--text-dim)',
                  )}
                >
                  {isLocked ? '✓' : i + 1}
                </span>
                {placed ? (
                  <span className="flex flex-1 items-center gap-2 text-body font-semibold text-(--text-primary)">
                    {placed.icon ? <span aria-hidden>{placed.icon}</span> : null}
                    {placed.title}
                  </span>
                ) : (
                  <span className="text-body text-(--text-dim)">Drop step {i + 1} here</span>
                )}
              </div>
              {isLocked && i > 0 && locked[i - 1] ? (
                <div
                  className="ml-3.5 h-3 w-0.5 bg-[color-mix(in_oklab,var(--status-correct)_40%,transparent)]"
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      {hint ? (
        <p className="animate-slide-up rounded-(--r-lg) border border-[color-mix(in_oklab,var(--accent-amber)_30%,transparent)] bg-[color-mix(in_oklab,var(--accent-amber)_8%,transparent)] px-4 py-3 text-body text-(--accent-amber)">
          {hint}
        </p>
      ) : null}

      {pool.length > 0 && !complete ? (
        <div>
          <p className="mb-2 text-micro font-bold uppercase tracking-widest text-(--text-dim)">
            Step cards
          </p>
          <div className="flex flex-wrap gap-2">
            {pool.map((id) => {
              const step = stepById(data, id);
              if (!step) return null;
              const isSelected = selectedId === id;
              const isDragging = draggingId === id;
              return (
                <button
                  key={id}
                  type="button"
                  draggable
                  onDragStart={() => onDragStart(id)}
                  onDragEnd={onDragEnd}
                  onClick={() => onTileClick(id)}
                  className={cn(
                    'cursor-grab rounded-(--r-lg) border px-3 py-2 text-left text-body font-semibold active:cursor-grabbing',
                    isSelected
                      ? 'border-(--accent-cyan) bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)] text-(--accent-cyan)'
                      : isDragging
                        ? 'border-(--border-medium) bg-(--bg-card-active) opacity-60'
                        : 'border-(--border-light) bg-(--bg-card-hi) text-(--text-primary) hover:border-(--border-medium)',
                  )}
                >
                  {step.icon ? (
                    <span className="mr-1.5" aria-hidden>
                      {step.icon}
                    </span>
                  ) : null}
                  {step.title}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {showWhy && data.causalLinks.length > 0 ? (
        <Card className="animate-slide-up">
          <p className="mb-2 text-micro font-bold uppercase tracking-widest text-(--accent-violet)">
            Why this order?
          </p>
          <ul className="space-y-2">
            {data.causalLinks.map((link) => {
              const from = stepById(data, link.fromId);
              const to = stepById(data, link.toId);
              if (!from || !to) return null;
              return (
                <li key={`${link.fromId}-${link.toId}`} className="text-body text-(--text-secondary)">
                  <span className="font-semibold text-(--text-primary)">{from.title}</span>
                  {' → '}
                  <span className="font-semibold text-(--text-primary)">{to.title}</span>
                  {': '}
                  {link.why}
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

const exemplar: RecipeSequencerData = {
  processTitle: 'Mitosis — arrange the four phases',
  root: 'Greek: ana (up/apart) + phase (stage)',
  mnemonic: 'PMAT: Prophase, Metaphase, Anaphase, Telophase — Please Make A Taco.',
  steps: [
    {
      id: 'prophase',
      title: 'Prophase — chromosomes condense',
      icon: '🧬',
      consequenceHint: 'Chromosomes must condense before they can be sorted.',
    },
    {
      id: 'metaphase',
      title: 'Metaphase — chromosomes align at equator',
      icon: '⚖️',
      consequenceHint: 'Alignment comes before separation — you cannot pull apart what is not lined up.',
    },
    {
      id: 'anaphase',
      title: 'Anaphase — sister chromatids separate',
      icon: '↔️',
      consequenceHint: 'Separation happens only after alignment at the metaphase plate.',
    },
    {
      id: 'telophase',
      title: 'Telophase — nuclear envelopes reform',
      icon: '🎁',
      consequenceHint: 'New nuclei form only after chromatids have reached the poles.',
    },
  ],
  causalLinks: [
    {
      fromId: 'prophase',
      toId: 'metaphase',
      why: 'Condensed chromosomes can be captured by the spindle.',
    },
    {
      fromId: 'metaphase',
      toId: 'anaphase',
      why: 'The spindle pulls sister chromatids apart only after they align.',
    },
    {
      fromId: 'anaphase',
      toId: 'telophase',
      why: 'Nuclear envelopes rebuild around the separated chromosome sets.',
    },
  ],
};

const registration: TemplateRegistration<RecipeSequencerData, RecipeSequencerDetails> = {
  kind: 'recipe-sequencer',
  schema: RecipeSequencerDataSchema,
  exemplar,
  classifications: {
    fastLane: true,
    microworld: false,
    constructionist: true,
    bodySyntonic: false,
    debugStyle: false,
  },
  Renderer: RecipeSequencerRenderer,
  describePrompt: (data) => `Recipe sequencer: ${data.processTitle}`,
  estimateMs: (data) => 30_000 + data.steps.length * 8_000,
  defaultConfidenceMs: 45_000,
};

export default registration;
