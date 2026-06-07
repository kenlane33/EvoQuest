'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { speakReadAloud } from '@/audio/read-aloud-engine';
import { orderMatchesProcedure } from '@/engine/procedure/scoring';
import type { TemplateRegistration } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store/app-store';
import {
  ProcedureBuilderDataSchema,
  type ProcedureBuilderData,
} from '@/types/schemas';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function blockById(data: ProcedureBuilderData, id: string) {
  return data.blocks.find((b) => b.id === id);
}

function ProcedureBuilderRenderer({
  data,
  onResult,
  resumeFromSnapshot,
  saveSnapshot,
}: {
  data: ProcedureBuilderData;
  onResult: (result: { correct: boolean; ms: number; details?: Record<string, unknown> }) => void;
  resumeFromSnapshot?: unknown;
  saveSnapshot?: (snapshot: unknown) => void;
}) {
  const reading = useAppStore((s) => s.settings.reading);
  const voice = reading.voice;
  const volume = useAppStore((s) => s.settings.audio.volume);
  const startMs = useRef(Date.now());
  const snap = resumeFromSnapshot as
    | { order: string[]; pool: string[]; running: boolean; done: boolean }
    | undefined;

  const blockIds = useMemo(() => data.blocks.map((b) => b.id), [data.blocks]);
  const [order, setOrder] = useState<string[]>(
    snap?.order ?? Array.from({ length: data.blocks.length }, () => ''),
  );
  const [pool, setPool] = useState<string[]>(snap?.pool ?? shuffle(blockIds));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [running, setRunning] = useState(snap?.running ?? false);
  const [runIndex, setRunIndex] = useState(-1);
  const [done, setDone] = useState(snap?.done ?? false);
  const [runLog, setRunLog] = useState<string[]>([]);
  const finishedRef = useRef(false);

  const persist = useCallback(
    (next: Partial<{ order: string[]; pool: string[]; running: boolean; done: boolean }>) => {
      saveSnapshot?.({
        order: next.order ?? order,
        pool: next.pool ?? pool,
        running: next.running ?? running,
        done: next.done ?? done,
      });
    },
    [done, order, pool, running, saveSnapshot],
  );

  const filled = order.every(Boolean);

  function placeBlock(stepId: string, slotIndex: number) {
    if (running || done) return;
    const prev = order[slotIndex];
    const nextOrder = [...order];
    nextOrder[slotIndex] = stepId;
    const nextPool = pool.filter((id) => id !== stepId);
    if (prev) nextPool.push(prev);
    setOrder(nextOrder);
    setPool(nextPool);
    setSelectedId(null);
    persist({ order: nextOrder, pool: nextPool });
  }

  async function runProcedure() {
    if (!filled || running || done) return;
    setRunning(true);
    setRunLog([]);
    persist({ running: true });

    for (let i = 0; i < order.length; i++) {
      setRunIndex(i);
      const block = blockById(data, order[i]);
      if (!block) continue;
      setRunLog((log) => [...log, block.label]);
      if (reading.enabled && block.narration.trim()) {
        try {
          await speakReadAloud(block.narration, { voice, volume });
        } catch {
          /* aborted or unavailable */
        }
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
    }

    setRunIndex(-1);
    setRunning(false);
    if (finishedRef.current) return;
    finishedRef.current = true;
    setDone(true);
    persist({ running: false, done: true });

    const correct = orderMatchesProcedure(data, order);
    onResult({
      correct,
      ms: Date.now() - startMs.current,
      details: {
        order,
        poweredIdea: data.poweredIdea,
      },
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <p className="text-body-lg font-semibold text-(--text-primary)">{data.goal}</p>
        <p className="mt-2 text-meta text-(--text-dim)">
          {data.initialState} → {data.targetState}
        </p>
      </Card>

      <ol className="flex flex-col gap-2">
        {order.map((stepId, i) => {
          const block = stepId ? blockById(data, stepId) : null;
          const active = running && runIndex === i;
          return (
            <li key={i}>
              <button
                type="button"
                disabled={running || done || !selectedId}
                onClick={() => selectedId && placeBlock(selectedId, i)}
                className={cn(
                  'flex min-h-14 w-full items-center gap-3 rounded-(--r-lg) border px-3 py-2 text-left transition-colors',
                  active
                    ? 'border-(--accent-cyan) bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)]'
                    : block
                      ? 'border-[color-mix(in_oklab,var(--status-correct)_35%,transparent)] bg-[color-mix(in_oklab,var(--status-correct)_10%,transparent)]'
                      : selectedId
                        ? 'border-(--accent-cyan) border-dashed bg-[color-mix(in_oklab,var(--accent-cyan)_8%,transparent)]'
                        : 'border-dashed border-(--border-light) bg-(--bg-card)',
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--bg-card-active) text-micro font-black text-(--text-dim)">
                  {i + 1}
                </span>
                {block ? (
                  <span className="text-body font-semibold text-(--text-primary)">
                    {block.icon ? `${block.icon} ` : ''}
                    {block.label}
                  </span>
                ) : (
                  <span className="text-body text-(--text-dim)">Drop block {i + 1}</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {pool.length > 0 && !done && !running ? (
        <div className="flex flex-wrap gap-2">
          {pool.map((id) => {
            const block = blockById(data, id);
            if (!block) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedId((prev) => (prev === id ? null : id))}
                className={cn(
                  'rounded-(--r-lg) border px-3 py-2 text-body font-semibold',
                  selectedId === id
                    ? 'border-(--accent-cyan) bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)] text-(--accent-cyan)'
                    : 'border-(--border-light) bg-(--bg-card-hi) text-(--text-primary)',
                )}
              >
                {block.icon ? `${block.icon} ` : ''}
                {block.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {runLog.length > 0 ? (
        <Card variant={done ? 'correct' : undefined}>
          <p className="text-micro font-bold uppercase tracking-widest text-(--text-dim)">
            Run log
          </p>
          <ul className="mt-2 space-y-1">
            {runLog.map((line, i) => (
              <li key={i} className="text-body text-(--text-secondary)">
                {i + 1}. {line}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {!done ? (
        <Button variant="primary" fullWidth disabled={!filled || running} onClick={() => void runProcedure()}>
          {running ? 'Running…' : 'RUN procedure'}
        </Button>
      ) : (
        <Card variant={orderMatchesProcedure(data, order) ? 'correct' : 'wrong'}>
          <p className="text-body text-(--text-secondary)">{data.poweredIdea}</p>
        </Card>
      )}
    </div>
  );
}

const exemplar: ProcedureBuilderData = {
  goal: 'Write a procedure that produces a functional protein from a gene.',
  initialState: 'DNA in nucleus',
  targetState: 'Folded protein in cytoplasm',
  blocks: [
    {
      id: 'transcribe',
      label: 'Transcribe gene → pre-mRNA',
      icon: '📝',
      narration: 'RNA polymerase copies the gene into messenger RNA.',
    },
    {
      id: 'splice',
      label: 'Splice introns from pre-mRNA',
      icon: '✂️',
      narration: 'Spliceosomes remove introns and join exons.',
    },
    {
      id: 'export',
      label: 'Export mRNA through nuclear pore',
      icon: '🚪',
      narration: 'Processed mRNA leaves the nucleus.',
    },
    {
      id: 'translate',
      label: 'Translate mRNA at ribosome',
      icon: '🔤',
      narration: 'Ribosomes read codons and assemble amino acids.',
    },
    {
      id: 'fold',
      label: 'Fold polypeptide into protein',
      icon: '🧶',
      narration: 'The polypeptide chain folds into its functional shape.',
    },
  ],
  canonicalOrder: ['transcribe', 'splice', 'export', 'translate', 'fold'],
  poweredIdea: 'Gene expression is a pipeline of named sub-procedures.',
};

const registration: TemplateRegistration<ProcedureBuilderData> = {
  kind: 'procedure-builder',
  schema: ProcedureBuilderDataSchema,
  exemplar,
  classifications: {
    fastLane: false,
    microworld: true,
    constructionist: true,
    bodySyntonic: false,
    debugStyle: true,
  },
  Renderer: ProcedureBuilderRenderer,
  describePrompt: (d) => `Procedure builder: ${d.goal}`,
  estimateMs: (d) => 60_000 + d.blocks.length * 12_000,
  defaultConfidenceMs: 120_000,
};

export default registration;
