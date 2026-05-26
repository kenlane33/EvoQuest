'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { SpeakButton } from '@/components/content/SpeakButton';
import type { TemplateRegistration } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import {
  PalaceWalkDataSchema,
  type PalaceTotem,
  type PalaceWalkData,
} from '@/types/schemas';

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function TotemQuiz({
  totem,
  onDone,
}: {
  totem: PalaceTotem;
  onDone: (correct: boolean) => void;
}) {
  const [val, setVal] = useState('');
  const [picked, setPicked] = useState<number | null>(null);
  const q = totem.question;

  function submitFill() {
    if (q.kind !== 'fill') return;
    const ok = q.acceptable.some((a) => norm(val) === norm(a));
    onDone(ok);
  }

  function pickMc(index: number) {
    if (q.kind !== 'multiple-choice' || picked !== null) return;
    setPicked(index);
    onDone(index === q.correctIndex);
  }

  return (
    <Card className="animate-pop-in">
      <div className="mb-3 flex items-start gap-2">
        <span className="text-2xl" aria-hidden>
          {totem.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-micro font-bold uppercase tracking-widest text-(--text-dim)">
            {totem.label}
          </p>
          <p className="mt-1 text-body-lg text-(--text-primary)">{q.prompt}</p>
        </div>
        <SpeakButton text={q.prompt} label={`Read ${totem.label} question`} />
      </div>

      {q.kind === 'fill' ? (
        <div className="flex gap-2">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitFill()}
            className="flex-1 rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-active) px-3 py-2 text-body text-(--text-primary)"
            autoFocus
          />
          <Button variant="primary" onClick={submitFill}>
            Answer
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => (
            <Button
              key={opt}
              variant="ghost"
              fullWidth
              disabled={picked !== null}
              onClick={() => pickMc(i)}
              className={cn(
                'justify-start border border-(--border-light) text-left',
                picked === i &&
                  (i === q.correctIndex
                    ? 'border-[color-mix(in_oklab,var(--status-correct)_35%,transparent)] text-(--status-correct)'
                    : 'border-[color-mix(in_oklab,var(--status-wrong)_35%,transparent)] text-(--status-wrong)'),
              )}
            >
              {opt}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}

function PalaceWalkRenderer({
  data,
  onResult,
  resumeFromSnapshot,
  saveSnapshot,
}: {
  data: PalaceWalkData;
  onResult: (result: { correct: boolean; ms: number; details?: Record<string, unknown> }) => void;
  resumeFromSnapshot?: unknown;
  saveSnapshot?: (snapshot: unknown) => void;
}) {
  const startMs = useRef(Date.now());
  const snap = resumeFromSnapshot as
    | { pos: { x: number; y: number }; cleared: string[]; activeTotemId: string | null }
    | undefined;
  const height = data.layout.length;
  const width = data.layout[0]?.length ?? 0;

  const [pos, setPos] = useState(snap?.pos ?? data.spawn);
  const [cleared, setCleared] = useState<string[]>(snap?.cleared ?? []);
  const [activeTotem, setActiveTotem] = useState<PalaceTotem | null>(() => {
    const id = snap?.activeTotemId;
    return id ? data.totems.find((t) => t.id === id) ?? null : null;
  });
  const [done, setDone] = useState(false);
  const finishedRef = useRef(false);

  const remaining = useMemo(
    () => data.totems.filter((t) => !cleared.includes(t.id)),
    [data.totems, cleared],
  );

  const persist = useCallback(
    (next: {
      pos?: { x: number; y: number };
      cleared?: string[];
      activeTotemId?: string | null;
    }) => {
      saveSnapshot?.({
        pos: next.pos ?? pos,
        cleared: next.cleared ?? cleared,
        activeTotemId:
          next.activeTotemId === undefined
            ? activeTotem?.id ?? null
            : next.activeTotemId,
      });
    },
    [activeTotem?.id, cleared, pos, saveSnapshot],
  );

  const tryMove = useCallback(
    (dx: number, dy: number) => {
      if (activeTotem || done) return;
      const nx = pos.x + dx;
      const ny = pos.y + dy;
      if (nx < 0 || ny < 0 || ny >= height || nx >= width) return;
      if (data.layout[ny][nx] === 1) return;
      const nextPos = { x: nx, y: ny };
      setPos(nextPos);

      const hit = remaining.find((t) => t.x === nx && t.y === ny);
      if (hit) {
        setActiveTotem(hit);
        persist({ pos: nextPos, activeTotemId: hit.id });
      } else {
        persist({ pos: nextPos });
      }
    },
    [activeTotem, data.layout, done, height, persist, pos, remaining, width],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      const map: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0],
      };
      const delta = map[e.key];
      if (!delta) return;
      e.preventDefault();
      tryMove(delta[0], delta[1]);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tryMove]);

  function finishTotem(correct: boolean) {
    if (!activeTotem) return;
    const nextCleared = correct ? [...cleared, activeTotem.id] : cleared;
    setActiveTotem(null);
    setCleared(nextCleared);
    persist({ cleared: nextCleared, activeTotemId: null });

    if (correct && nextCleared.length === data.totems.length) {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setDone(true);
      onResult({
        correct: true,
        ms: Date.now() - startMs.current,
        details: { cleared: nextCleared.length, poweredIdea: data.poweredIdea },
      });
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-body-lg font-semibold text-(--text-primary)">
            {data.roomTitle}
          </p>
          <SpeakButton
            text={`${data.roomTitle}. Walk with arrow keys. Bump totems to answer.`}
            label="Read room intro"
          />
        </div>
        <p className="mt-2 text-meta text-(--text-dim)">
          {cleared.length}/{data.totems.length} totems cleared · Arrow keys or WASD
        </p>
      </Card>

      <div
        className="mx-auto grid gap-0.5 rounded-(--r-lg) border border-(--border-light) bg-(--bg-card) p-2"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          maxWidth: `${width * 2.5}rem`,
        }}
      >
        {data.layout.map((row, y) =>
          row.map((cell, x) => {
            const totem = data.totems.find((t) => t.x === x && t.y === y);
            const isPlayer = pos.x === x && pos.y === y;
            const isWall = cell === 1;
            const clearedTotem = totem && cleared.includes(totem.id);
            return (
              <div
                key={`${x}-${y}`}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-sm text-lg',
                  isWall
                    ? 'bg-(--bg-card-active)'
                    : clearedTotem
                      ? 'bg-[color-mix(in_oklab,var(--status-correct)_15%,transparent)]'
                      : 'bg-[color-mix(in_oklab,var(--accent-violet)_6%,transparent)]',
                )}
              >
                {isPlayer ? '🧙' : clearedTotem ? '✓' : totem && !clearedTotem ? totem.icon : null}
              </div>
            );
          }),
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" onClick={() => tryMove(0, -1)}>
          ↑
        </Button>
        <Button variant="secondary" onClick={() => tryMove(-1, 0)}>
          ←
        </Button>
        <Button variant="secondary" onClick={() => tryMove(1, 0)}>
          →
        </Button>
        <Button variant="secondary" onClick={() => tryMove(0, 1)}>
          ↓
        </Button>
      </div>

      {activeTotem ? (
        <TotemQuiz totem={activeTotem} onDone={finishTotem} />
      ) : done ? (
        <Card variant="correct">
          <p className="text-body text-(--text-secondary)">{data.poweredIdea}</p>
        </Card>
      ) : null}
    </div>
  );
}

const exemplar: PalaceWalkData = {
  roomTitle: 'Mitochondrion memory palace',
  layout: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  spawn: { x: 1, y: 1 },
  totems: [
    {
      id: 'cristae',
      x: 3,
      y: 1,
      icon: '🌊',
      label: 'Cristae',
      question: {
        kind: 'fill',
        prompt: 'Cristae increase surface area for _____.',
        acceptable: ['atp', 'energy'],
      },
    },
    {
      id: 'matrix',
      x: 5,
      y: 3,
      icon: '🧪',
      label: 'Matrix',
      question: {
        kind: 'fill',
        prompt: 'The Krebs cycle runs in the mitochondrial _____.',
        acceptable: ['matrix'],
      },
    },
  ],
  poweredIdea: 'Spatial neighborhoods help you recall organelle jobs.',
};

const registration: TemplateRegistration<PalaceWalkData> = {
  kind: 'palace-walk',
  schema: PalaceWalkDataSchema,
  exemplar,
  classifications: {
    fastLane: false,
    microworld: true,
    constructionist: false,
    bodySyntonic: true,
    debugStyle: false,
  },
  Renderer: PalaceWalkRenderer,
  describePrompt: (d) => `Palace walk: ${d.roomTitle}`,
  estimateMs: (d) => 120_000 + d.totems.length * 20_000,
  defaultConfidenceMs: 180_000,
};

export default registration;
