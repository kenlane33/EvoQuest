'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Check, ChevronLeft, Pause, Play, RotateCcw, Volume2, X } from 'lucide-react';
import { usePocketTts } from '@/audio/use-pocket-tts';
import { cn } from '@/lib/cn';
import { devMark } from '@/lib/dev-mark';
import { useAppStore } from '@/store/app-store';
import { useReaderProgress } from '@/components/reader/use-reader-progress';
import type { ReaderGroup, ReaderQuestion } from '@/components/reader/reader-types';
import {
  SILLY_ANSWER_INTROS,
  SILLY_QUESTION_INTROS,
  WRONG_CUES,
  autoTransitionLine,
  maybeSilly,
} from '@/audio/silly-reader';

type ReaderQuizProps = {
  storageKey: string;
  eyebrow: string;
  title: string;
  intro: string;
  questions: ReaderQuestion[];
  groups?: ReaderGroup[];
};

type Phase = 'reading' | 'countdown' | 'await' | 'answer';

/** Per-question interactive state: wrong choices clicked (red) + whether revealed (green). */
type Response = { wrong: string[]; revealed: boolean };

const COUNTDOWN_STEPS = [3, 2, 1] as const;
const COUNTDOWN_MS = 850;
const ADVANCE_GAP_MS = 750;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function questionReadText(q: ReaderQuestion): string {
  if (q.kind === 'choice') {
    const opts = q.choices.map((c) => `${c.label}. ${c.text}`).join(' ');
    return `${q.stem} ${opts}`;
  }
  if (q.kind === 'inline') {
    return `${q.stem} ${q.template.replace(/\{[^}]+\}/g, ' blank ')}`;
  }
  return q.stem;
}

function answerReadText(q: ReaderQuestion): string {
  if (q.kind === 'choice') {
    const correct = q.choices.filter((c) => c.correct);
    if (correct.length === 0) return '';
    if (q.multi) return `The correct answers are: ${correct.map((c) => c.text).join('; ')}`;
    return `The correct answer is ${correct[0].label}. ${correct[0].text}`;
  }
  if (q.kind === 'inline') {
    const filled = q.template.replace(/\{([^}]+)\}/g, (_m, id) => {
      const dd = q.dropdowns.find((d) => d.id === id);
      return dd ? ` ${dd.answer} ` : ' blank ';
    });
    return `The correct response: ${filled}`;
  }
  return `The correct answer: ${q.answerText}`;
}

export function ReaderQuiz({
  storageKey,
  eyebrow,
  title,
  intro,
  questions,
  groups = [],
}: ReaderQuizProps) {
  const voice = useAppStore((s) => s.settings.reading.voice);
  const volume = useAppStore((s) => s.settings.audio.volume);
  const silly = useAppStore((s) => s.settings.reading.sillyReader);
  const { speak, stop } = usePocketTts({ voice, volume });
  const progress = useReaderProgress(storageKey, questions.length);

  const groupById = useMemo(() => {
    const m = new Map<string, ReaderGroup>();
    for (const g of groups) m.set(g.id, g);
    return m;
  }, [groups]);
  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    questions.forEach((q, i) => m.set(q.id, i));
    return m;
  }, [questions]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('reading');
  const [count, setCount] = useState<number>(3);
  const [plainId, setPlainId] = useState<string | null>(null);
  const [paused, setPausedState] = useState(false);
  const [responses, setResponses] = useState<Record<string, Response>>({});

  const autoKey = `evo-quest.v1.reader.${storageKey}.auto`;
  const [auto, setAutoState] = useState(true);

  // Mutable mirrors so the async sequence reads live values without stale closures.
  const runRef = useRef(0);
  const autoRef = useRef(true);
  const pausedRef = useRef(false);
  const revealedRef = useRef<Set<string>>(new Set());
  const sillyRef = useRef(silly);
  sillyRef.current = silly;

  useEffect(() => {
    try {
      const v = localStorage.getItem(autoKey);
      if (v !== null) {
        const b = v === '1';
        setAutoState(b);
        autoRef.current = b;
      }
    } catch {
      /* ignore */
    }
  }, [autoKey]);

  const setAuto = useCallback(
    (b: boolean) => {
      setAutoState(b);
      autoRef.current = b;
      try {
        localStorage.setItem(autoKey, b ? '1' : '0');
      } catch {
        /* ignore */
      }
    },
    [autoKey],
  );

  const setPaused = useCallback(
    (b: boolean) => {
      setPausedState(b);
      pausedRef.current = b;
      if (b) stop();
    },
    [stop],
  );

  const cancel = useCallback(() => {
    runRef.current += 1;
    stop();
    setActiveId(null);
    setPlainId(null);
    setPaused(false);
  }, [setPaused, stop]);

  useEffect(() => () => cancel(), [cancel]);

  const reveal = useCallback((id: string) => {
    revealedRef.current.add(id);
    setResponses((prev) => ({ ...prev, [id]: { wrong: prev[id]?.wrong ?? [], revealed: true } }));
  }, []);

  const addWrong = useCallback((id: string, key: string) => {
    setResponses((prev) => {
      const cur = prev[id] ?? { wrong: [], revealed: false };
      if (cur.wrong.includes(key)) return prev;
      return { ...prev, [id]: { ...cur, wrong: [...cur.wrong, key] } };
    });
  }, []);

  /** Un-toggle a wrong choice to erase the mistake. */
  const removeWrong = useCallback((id: string, key: string) => {
    setResponses((prev) => {
      const cur = prev[id];
      if (!cur || !cur.wrong.includes(key)) return prev;
      return { ...prev, [id]: { ...cur, wrong: cur.wrong.filter((w) => w !== key) } };
    });
  }, []);

  /** Student may pick any time this question is live — including during TTS read/countdown. */
  const canChooseAnswers = useCallback(
    (q: ReaderQuestion) => {
      if (activeId !== q.id) return false;
      if (responses[q.id]?.revealed) return false;
      return true;
    },
    [activeId, responses],
  );

  const pausableWait = useCallback(async (ms: number, token: number) => {
    let remaining = ms;
    while (remaining > 0) {
      if (runRef.current !== token) return;
      await delay(60);
      if (!pausedRef.current) remaining -= 60;
    }
  }, []);

  // Forward declaration via ref so playAnswerAndAdvance can re-enter runQuestion.
  const runQuestionRef = useRef<(q: ReaderQuestion) => Promise<void>>(async () => {});

  const playAnswerAndAdvance = useCallback(
    async (q: ReaderQuestion, token: number) => {
      setPhase('answer');
      reveal(q.id);
      progress.markDone(q.id);
      const answer = answerReadText(q);
      if (answer) {
        const aIntro = maybeSilly(SILLY_ANSWER_INTROS, sillyRef.current);
        await speak(aIntro ? `${aIntro} ${answer}` : answer);
      }
      if (runRef.current !== token) return;
      if (autoRef.current) {
        await pausableWait(ADVANCE_GAP_MS, token);
        if (runRef.current !== token) return;
        const idx = indexById.get(q.id) ?? -1;
        const next = idx >= 0 ? questions[idx + 1] : undefined;
        if (next) {
          await speak(autoTransitionLine(sillyRef.current));
          if (runRef.current !== token) return;
          void runQuestionRef.current(next);
        } else {
          setActiveId(null);
        }
      } else {
        setActiveId(null);
      }
    },
    [indexById, pausableWait, progress, questions, reveal, speak],
  );

  const runQuestion = useCallback(
    async (q: ReaderQuestion) => {
      // Tapping the already-active card stops everything.
      if (activeId === q.id && !revealedRef.current.has(q.id)) {
        cancel();
        return;
      }
      const token = ++runRef.current;
      setPlainId(null);
      setPaused(false);
      setActiveId(q.id);
      setPhase('reading');

      const qIntro = maybeSilly(SILLY_QUESTION_INTROS, sillyRef.current);
      const qText = questionReadText(q);
      await speak(qIntro ? `${qIntro} ${qText}` : qText);
      if (runRef.current !== token) return;

      if (!autoRef.current) {
        // Non-auto: stop after reading; the student must click to answer/proceed.
        setPhase('await');
        return;
      }

      setPhase('countdown');
      if (!revealedRef.current.has(q.id)) {
        for (const step of COUNTDOWN_STEPS) {
          setCount(step);
          await pausableWait(COUNTDOWN_MS, token);
          if (runRef.current !== token) return;
          if (revealedRef.current.has(q.id)) break;
        }
      }
      await playAnswerAndAdvance(q, token);
    },
    [activeId, cancel, playAnswerAndAdvance, setPaused, speak],
  );
  runQuestionRef.current = runQuestion;

  /** Correct answer: reveal + read it aloud (audio + visual feedback); advance only in Auto. */
  const answerCorrect = useCallback(
    (q: ReaderQuestion) => {
      if (!canChooseAnswers(q)) return;
      const token = ++runRef.current;
      stop();
      setPlainId(null);
      setPaused(false);
      setActiveId(q.id);
      void playAnswerAndAdvance(q, token);
    },
    [canChooseAnswers, playAnswerAndAdvance, setPaused, stop],
  );

  /**
   * Click on a choice/option. Correct → reveal + feedback. Wrong → mark red and (Auto off)
   * speak a short cue. Clicking an already-wrong choice un-toggles it.
   */
  const choose = useCallback(
    (q: ReaderQuestion, key: string, correct: boolean) => {
      const cur = responses[q.id];
      if (cur?.revealed) return;
      if (cur?.wrong.includes(key)) {
        removeWrong(q.id, key);
        return;
      }
      if (!canChooseAnswers(q)) return;
      if (correct) {
        answerCorrect(q);
      } else {
        addWrong(q.id, key);
        if (!autoRef.current) {
          void speak(WRONG_CUES[Math.floor(Math.random() * WRONG_CUES.length)]);
        }
      }
    },
    [addWrong, answerCorrect, canChooseAnswers, removeWrong, responses, speak],
  );

  const playPlain = useCallback(
    async (id: string, text: string) => {
      if (plainId === id) {
        cancel();
        return;
      }
      const token = ++runRef.current;
      setActiveId(null);
      setPlainId(id);
      await speak(text);
      if (runRef.current === token) setPlainId(null);
    },
    [cancel, plainId, speak],
  );

  const sequenceActive = activeId !== null;
  let lastGroupId: string | undefined;

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8">
      {/* Fixed left-middle controls: Auto toggle + Pause */}
      <div className="fixed left-2 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 sm:left-3">
        <button
          type="button"
          {...devMark('auto')}
          onClick={() => setAuto(!auto)}
          aria-pressed={auto}
          title={auto ? 'Auto play is on — plays straight through' : 'Auto play is off — tap to answer'}
          className={cn(
            'flex h-12 w-12 flex-col items-center justify-center rounded-full border text-[9px] font-black uppercase tracking-wider shadow-lg transition-colors',
            auto
              ? 'border-(--accent-violet) bg-(--accent-violet) text-white'
              : 'border-(--border-medium) bg-(--bg-card) text-(--text-dim)',
          )}
        >
          <span className="text-[11px] leading-none">Auto</span>
          <span className="leading-none opacity-80">{auto ? 'on' : 'off'}</span>
        </button>
        {sequenceActive ? (
          <button
            type="button"
            {...devMark('pause')}
            onClick={() => setPaused(!paused)}
            aria-pressed={paused}
            title={paused ? 'Resume' : 'Pause to think'}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-colors',
              paused
                ? 'border-(--accent-violet) bg-(--accent-violet) text-white'
                : 'border-(--border-medium) bg-(--bg-card) text-(--text-secondary) hover:text-(--text-primary)',
            )}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        ) : null}
      </div>

      <Link
        to="/"
        {...devMark('back')}
        className="mb-6 inline-flex items-center gap-1 text-meta text-(--text-dim) no-underline hover:text-(--text-secondary)"
      >
        <ChevronLeft size={16} />
        Home
      </Link>

      <header className="mb-2">
        <p className="text-meta uppercase tracking-[0.15em] text-(--accent-violet)">{eyebrow}</p>
        <h1 className="text-display-lg font-black text-(--text-primary)">{title}</h1>
      </header>
      <p className="mb-5 text-body text-(--text-secondary)">{intro}</p>

      <div
        {...devMark('progress')}
        className="glass-sm sticky top-[calc(var(--app-header-h)+0.5rem)] z-20 mb-6 rounded-(--r-lg) border border-(--border-faint) bg-(--bg-card) p-3"
      >
        <div className="flex items-center justify-between gap-3 text-meta">
          <span className="font-bold text-(--text-secondary)">
            {progress.hydrated ? (
              <>
                {progress.doneCount}/{progress.total} this lap · {progress.lapPct}%
              </>
            ) : (
              'Progress'
            )}
          </span>
          <span className="flex items-center gap-2">
            <span className="font-black text-(--accent-violet)">
              {progress.hydrated ? `${progress.totalLapsLabel} laps` : '—'}
            </span>
            <button
              type="button"
              {...devMark('reset')}
              onClick={progress.reset}
              title="Reset progress"
              aria-label="Reset progress"
              className="flex h-6 w-6 items-center justify-center rounded-full text-(--text-dim) transition-colors hover:text-(--text-secondary)"
            >
              <RotateCcw size={13} />
            </button>
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-(--bg-elevated)">
          <div
            className="h-full rounded-full bg-(--accent-violet) transition-[width] duration-300"
            style={{ width: `${progress.hydrated ? progress.lapPct : 0}%` }}
          />
        </div>
      </div>

      <ol className="space-y-5">
        {questions.map((q) => {
          const group = q.groupId && q.groupId !== lastGroupId ? groupById.get(q.groupId) : null;
          lastGroupId = q.groupId;
          return (
            <Fragment key={q.id}>
              {group ? (
                <li>
                  <GroupBlock
                    group={group}
                    speaking={plainId === group.id}
                    onPlay={() =>
                      void playPlain(
                        group.id,
                        `${group.title}. ${group.passage} ${group.figures
                          .map((f) => `${f.label}. ${f.title}. ${f.description}`)
                          .join(' ')}`,
                      )
                    }
                  />
                </li>
              ) : null}
              <li>
                <QuestionCard
                  q={q}
                  active={activeId === q.id}
                  phase={phase}
                  count={count}
                  paused={paused}
                  auto={auto}
                  response={responses[q.id]}
                  done={progress.isDone(q.id)}
                  onPlay={() => void runQuestion(q)}
                  onToggleDone={() => progress.toggle(q.id)}
                  onChoose={(key, correct) => choose(q, key, correct)}
                  onAnswerCorrect={() => answerCorrect(q)}
                />
              </li>
            </Fragment>
          );
        })}
      </ol>
    </main>
  );
}

function GroupBlock({
  group,
  speaking,
  onPlay,
}: {
  group: ReaderGroup;
  speaking: boolean;
  onPlay: () => void;
}) {
  return (
    <section
      {...devMark(`group.${group.id}`)}
      className={cn(
        'rounded-(--r-xl) border border-l-4 border-(--border-light) border-l-(--accent-violet) p-5 transition-colors',
        speaking
          ? 'bg-[color-mix(in_oklab,var(--accent-amber)_16%,var(--bg-card))]'
          : 'bg-[color-mix(in_oklab,var(--accent-violet)_6%,var(--bg-card))]',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h2 className="text-body-lg font-black text-(--text-primary)">{group.title}</h2>
        <button
          type="button"
          onClick={onPlay}
          aria-label={`Read passage: ${group.title}`}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors',
            speaking
              ? 'border-(--accent-violet) text-(--accent-violet)'
              : 'border-(--border-light) text-(--text-dim) hover:text-(--text-secondary)',
          )}
        >
          <Volume2 size={16} className={speaking ? 'animate-pulse' : undefined} />
        </button>
      </div>
      <p className="text-body leading-relaxed text-(--text-secondary)">{group.passage}</p>
      {group.figures.length > 0 ? (
        <dl className="mt-3 space-y-2">
          {group.figures.map((f) => (
            <div key={f.label} className="rounded-(--r-lg) bg-(--bg-elevated) p-3">
              <dt className="text-meta font-bold text-(--text-secondary)">
                {f.label}: {f.title}
              </dt>
              <dd className="mt-1 text-meta italic leading-relaxed text-(--text-dim)">
                {f.description}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

function QuestionCard({
  q,
  active,
  phase,
  count,
  paused,
  auto,
  response,
  done,
  onPlay,
  onToggleDone,
  onChoose,
  onAnswerCorrect,
}: {
  q: ReaderQuestion;
  active: boolean;
  phase: Phase;
  count: number;
  paused: boolean;
  auto: boolean;
  response: Response | undefined;
  done: boolean;
  onPlay: () => void;
  onToggleDone: () => void;
  onChoose: (key: string, correct: boolean) => void;
  onAnswerCorrect: () => void;
}) {
  const revealed = response?.revealed ?? false;
  const wrong = response?.wrong ?? [];
  const showCountdown = active && phase === 'countdown' && !paused;
  // Blinking frame cues "your turn to choose": when paused, or Auto-off after the read.
  const awaitingChoice =
    active && !revealed && (paused || (!auto && phase === 'await'));
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (active) cardRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [active]);
  return (
    <div
      ref={cardRef}
      {...devMark(`q${q.label}`)}
      className={cn(
        'relative rounded-(--r-xl) border p-5 transition-all duration-150 lift-card',
        active
          ? 'animate-reader-active-frame border-(--accent-violet) ring-2 ring-(--accent-violet) animate-pulse'
          : done || revealed
            ? 'border-l-4 border-(--border-light) border-l-(--status-correct) bg-(--bg-card)'
            : 'border-(--border-light) bg-(--bg-card)',
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onPlay}
          aria-pressed={active}
          className="flex flex-1 items-start gap-3 text-left focus:outline-none focus-visible:rounded-(--r-lg) focus-visible:ring-2 focus-visible:ring-(--accent-violet)"
        >
          <span
            className={cn(
              'mt-0.5 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-meta font-bold',
              active ? 'bg-(--accent-violet) text-white' : 'bg-(--bg-elevated) text-(--text-dim)',
            )}
          >
            {q.label}
          </span>
          <span className="flex-1 text-body-lg font-bold leading-snug text-(--text-primary)">
            {q.stem}
          </span>
          {active && phase === 'reading' ? (
            <Volume2 size={18} className="mt-1 shrink-0 animate-pulse text-(--accent-violet)" />
          ) : null}
        </button>
        <DoneToggle done={done} onToggle={onToggleDone} />
      </div>

      {q.ascii ? (
        <pre className="mt-3 overflow-x-auto rounded-(--r-lg) bg-(--bg-elevated) p-3 font-mono text-[11px] leading-tight text-(--text-secondary)">
          {q.ascii}
        </pre>
      ) : null}

      {q.figureNotes && q.figureNotes.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {q.figureNotes.map((note, i) => (
            <li
              key={i}
              className="rounded-(--r-lg) bg-(--bg-elevated) px-3 py-2 text-meta italic leading-relaxed text-(--text-dim)"
            >
              {note}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative mt-4">
        {q.kind === 'choice' ? (
          <ChoiceBodyView q={q} revealed={revealed} wrong={wrong} onChoose={onChoose} />
        ) : null}
        {q.kind === 'inline' ? (
          <InlineBodyView q={q} revealed={revealed} wrong={wrong} onChoose={onChoose} />
        ) : null}
        {q.kind === 'open' ? (
          <OpenBodyView q={q} revealed={revealed} onReveal={onAnswerCorrect} />
        ) : null}

        {showCountdown ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-(--r-lg) bg-[color-mix(in_oklab,var(--bg-card)_60%,transparent)] backdrop-blur-[1.3px]">
            <span
              key={count}
              className="animate-[ping_0.85s_ease-out] text-display-xl font-black text-(--accent-violet)"
            >
              {count}
            </span>
          </div>
        ) : null}

        {awaitingChoice ? (
          <div className="pointer-events-none absolute -inset-1 animate-reader-await-frame rounded-(--r-lg)" />
        ) : null}
      </div>
    </div>
  );
}

function DoneToggle({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={done}
      title={done ? 'Mark not done' : 'Mark done'}
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
        done
          ? 'border-(--status-correct) bg-(--status-correct) text-white'
          : 'border-(--border-medium) text-transparent hover:border-(--status-correct)',
      )}
    >
      <Check size={15} />
    </button>
  );
}

function ChoiceBodyView({
  q,
  revealed,
  wrong,
  onChoose,
}: {
  q: Extract<ReaderQuestion, { kind: 'choice' }>;
  revealed: boolean;
  wrong: string[];
  onChoose: (label: string, correct: boolean) => void;
}) {
  return (
    <>
      {q.multi ? (
        <p className="mb-2 text-meta uppercase tracking-[0.1em] text-(--text-dim)">
          Select {q.selectCount ?? q.choices.filter((c) => c.correct).length}
        </p>
      ) : null}
      <ul className="space-y-2">
        {q.choices.map((c) => {
          const isGreen = revealed && c.correct;
          const isRed = wrong.includes(c.label);
          return (
            <li key={c.label}>
              <button
                type="button"
                onClick={() => onChoose(c.label, c.correct)}
                disabled={revealed}
                className={cn(
                  'flex w-full items-start gap-2.5 rounded-(--r-lg) border px-3 py-2 text-left text-body transition-colors duration-200',
                  isGreen
                    ? 'border-(--status-correct) bg-[color-mix(in_oklab,var(--status-correct)_16%,transparent)] text-(--text-primary)'
                    : isRed
                      ? 'border-(--status-wrong) bg-[color-mix(in_oklab,var(--status-wrong)_14%,transparent)] text-(--text-secondary)'
                      : 'border-(--border-faint) text-(--text-secondary) hover:border-(--accent-violet) hover:bg-(--bg-card-hi)',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full text-meta font-bold',
                    isGreen
                      ? 'bg-(--status-correct) text-white'
                      : isRed
                        ? 'bg-(--status-wrong) text-white'
                        : 'bg-(--bg-elevated) text-(--text-dim)',
                  )}
                >
                  {c.label}
                </span>
                <span
                  className={cn(
                    'flex-1 whitespace-pre-line',
                    q.choicesMono ? 'font-mono leading-tight' : 'leading-snug',
                  )}
                >
                  {c.text}
                </span>
                {isGreen ? <Check size={18} className="mt-0.5 shrink-0 text-(--status-correct)" /> : null}
                {isRed ? <X size={18} className="mt-0.5 shrink-0 text-(--status-wrong)" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function InlineBodyView({
  q,
  revealed,
  wrong,
  onChoose,
}: {
  q: Extract<ReaderQuestion, { kind: 'inline' }>;
  revealed: boolean;
  wrong: string[];
  onChoose: (key: string, correct: boolean) => void;
}) {
  const parts = q.template.split(/(\{[^}]+\})/g);
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-body leading-relaxed text-(--text-secondary)">
      {parts.map((part, i) => {
        const m = part.match(/^\{([^}]+)\}$/);
        if (!m) return <span key={i}>{part}</span>;
        const dd = q.dropdowns.find((d) => d.id === m[1]);
        if (!dd) return <span key={i}>{part}</span>;
        return (
          <span key={i} className="inline-flex flex-wrap items-center gap-1 align-middle">
            {dd.options.map((opt) => {
              const isAnswer = opt === dd.answer;
              const isGreen = revealed && isAnswer;
              const isRed = wrong.includes(`${dd.id}::${opt}`);
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={revealed}
                  onClick={() => onChoose(`${dd.id}::${opt}`, isAnswer)}
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-meta transition-colors duration-200',
                    isGreen
                      ? 'border-(--status-correct) bg-[color-mix(in_oklab,var(--status-correct)_18%,transparent)] font-bold text-(--text-primary)'
                      : isRed
                        ? 'border-(--status-wrong) bg-[color-mix(in_oklab,var(--status-wrong)_16%,transparent)] line-through'
                        : revealed
                          ? 'border-(--border-faint) text-(--text-dim) line-through'
                          : 'border-(--border-light) text-(--text-secondary) hover:border-(--accent-violet)',
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </span>
        );
      })}
    </p>
  );
}

function OpenBodyView({
  q,
  revealed,
  onReveal,
}: {
  q: Extract<ReaderQuestion, { kind: 'open' }>;
  revealed: boolean;
  onReveal: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onReveal}
      disabled={revealed}
      className={cn(
        'w-full rounded-(--r-lg) border px-3 py-2.5 text-left text-body transition-colors duration-200',
        revealed
          ? 'border-(--status-correct) bg-[color-mix(in_oklab,var(--status-correct)_14%,transparent)] text-(--text-primary)'
          : 'border-dashed border-(--border-light) text-(--text-dim) hover:border-(--accent-violet)',
      )}
    >
      <span className="mr-1.5 text-meta font-bold uppercase tracking-[0.1em] text-(--text-dim)">
        Answer
      </span>
      {revealed ? q.answerText : 'Tap to reveal the correct response.'}
    </button>
  );
}
