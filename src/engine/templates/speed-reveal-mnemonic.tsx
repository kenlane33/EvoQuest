import { useEffect, useRef, useState } from 'react';
import type { InnerQuestion, SpeedRevealData } from '@/types';
import { SpeedRevealDataSchema } from '@/types';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';
import type { TemplateRegistration } from '@/engine/templates/registry';

type SpeedRevealSnapshot = {
  answered: boolean;
  phase: 'waiting' | 'revealing' | 'done';
  countdown: number;
  revealedIndices: number[];
  pick?: string;
  fillValue?: string;
};

type SpeedRevealDetails = {
  explanation?: string;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function shuffleIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

function MnemonicRevealer({
  root,
  mnemonic,
  answered,
  countdownMs = 6000,
  revealMs = 5000,
}: {
  root: string;
  mnemonic: string;
  answered: boolean;
  countdownMs?: number;
  revealMs?: number;
}) {
  const [countdown, setCountdown] = useState(Math.ceil(countdownMs / 1000));
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<'waiting' | 'revealing' | 'done'>('waiting');
  const orderRef = useRef<number[]>([]);

  useEffect(() => {
    orderRef.current = shuffleIndices(mnemonic.length);
  }, [mnemonic]);

  useEffect(() => {
    if (phase !== 'waiting' || answered) return;
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setPhase('revealing');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase, answered]);

  useEffect(() => {
    if (phase !== 'revealing') return;

    const total = mnemonic.length;
    const interval = Math.max(30, revealMs / total);
    let count = 0;

    const finish = () => {
      setRevealedSet(new Set(Array.from({ length: total }, (_, i) => i)));
      setPhase('done');
    };

    const revealNext = () => {
      if (count >= total) {
        finish();
        return true;
      }
      const index = orderRef.current[count];
      if (index !== undefined) {
        setRevealedSet((prev) => {
          const next = new Set(prev);
          next.add(index);
          return next;
        });
      }
      count++;
      if (count >= total) {
        finish();
        return true;
      }
      return false;
    };

    if (revealNext()) return;

    const iv = setInterval(() => {
      if (revealNext()) clearInterval(iv);
    }, interval);

    return () => clearInterval(iv);
  }, [phase, mnemonic.length, revealMs]);

  useEffect(() => {
    if (answered) {
      setRevealedSet(new Set(Array.from({ length: mnemonic.length }, (_, i) => i)));
      setPhase('done');
    }
  }, [answered, mnemonic.length]);

  const pctBar = phase === 'waiting' ? (countdown / Math.ceil(countdownMs / 1000)) * 100 : 0;

  return (
    <div className="mt-5 rounded-2xl border border-violet-500/15 bg-violet-500/5 p-4 transition-opacity">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm">📜</span>
        <span className="font-display text-[11px] font-bold uppercase tracking-wider text-violet-300">
          {root}
        </span>
      </div>

      {phase === 'waiting' && (
        <div>
          <p className="mb-1.5 text-[11px] text-white/35">
            Revealing mnemonic in{' '}
            <span className="font-bold text-violet-300">{countdown}s</span>...
          </p>
          <div className="h-[3px] overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-violet-500/50 transition-[width] duration-1000 linear"
              style={{ width: `${pctBar}%` }}
            />
          </div>
        </div>
      )}

      {(phase === 'revealing' || phase === 'done') && (
        <p className="text-xs leading-relaxed">
          <span className="mr-1 text-white/35">💡 Remember:</span>
          <span className="font-mono tracking-wide">
            {mnemonic.split('').map((char, i) => {
              const isSpace = char === ' ';
              const isRevealed = revealedSet.has(i);
              return (
                <span
                  key={i}
                  className={
                    isSpace
                      ? 'text-transparent'
                      : isRevealed
                        ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                        : 'text-violet-400/20'
                  }
                >
                  {isSpace ? ' ' : isRevealed ? char : '░'}
                </span>
              );
            })}
          </span>
        </p>
      )}
    </div>
  );
}

function FillQuestion({
  question,
  answered,
  onAnswer,
}: {
  question: Extract<InnerQuestion, { kind: 'fill' }>;
  answered: boolean;
  onAnswer: (correct: boolean, explanation: string) => void;
}) {
  const [val, setVal] = useState('');
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const parts = question.prompt.split('_____');
  const hasBlank = question.prompt.includes('_____');

  function submit() {
    if (!val.trim() || done || answered) return;
    setDone(true);
    const ok = question.acceptable.some((a) => norm(val) === norm(a));
    const explanation = ok
      ? `Correct! "${question.acceptable[0]}"`
      : `Answer: "${question.acceptable[0]}"`;
    onAnswer(ok, explanation);
  }

  const ok = done && question.acceptable.some((a) => norm(val) === norm(a));

  return (
    <div>
      <div className="mb-5 rounded-2xl border border-white/12 bg-white/5 p-5">
        <p className="text-[15px] leading-relaxed text-white/85">
          {hasBlank ? (
            <>
              {parts[0]}
              <span
                className={`mx-1 inline-block min-w-[3rem] max-sm:min-w-[2.5rem] border-b-2 px-1 font-bold ${
                  done
                    ? ok
                      ? 'border-emerald-400 text-emerald-300'
                      : 'border-rose-400 text-rose-300'
                    : 'border-cyan-400 text-cyan-300'
                }`}
              >
                {val || '?????'}
              </span>
              {parts[1]}
            </>
          ) : (
            question.prompt
          )}
        </p>
      </div>
      <div className="mb-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          disabled={done || answered}
          placeholder="Type your answer..."
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="flex-1 rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
        />
        <Button
          onClick={submit}
          disabled={!val.trim() || done || answered}
          className={cn(
            'rounded-xl border-0 px-5 py-3 text-sm font-bold',
            val.trim() && !done && !answered
              ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950'
              : 'bg-white/5 text-white/20',
          )}
        >
          GO
        </Button>
      </div>
      {!done && !answered && question.hint && (
        <Button
          variant="text"
          onClick={() => setHint(true)}
          className={cn(
            'text-[11px]',
            hint ? 'text-amber-300 hover:text-amber-300' : 'text-white/25 hover:text-white/40',
          )}
        >
          {hint ? `💡 ${question.hint}` : 'Need a hint?'}
        </Button>
      )}
    </div>
  );
}

function MultipleChoiceQuestion({
  question,
  answered,
  onAnswer,
}: {
  question: Extract<InnerQuestion, { kind: 'multiple-choice' }>;
  answered: boolean;
  onAnswer: (correct: boolean, explanation: string) => void;
}) {
  const [pick, setPick] = useState<string | null>(null);

  function tap(option: string, index: number) {
    if (pick || answered) return;
    setPick(option);
    const ok = index === question.correctIndex;
    const explanation = ok
      ? `✓ ${option}`
      : `Correct: ${question.options[question.correctIndex]}`;
    setTimeout(() => onAnswer(ok, explanation), ok ? 800 : 2400);
  }

  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-white/70">{question.prompt}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isRight = pick !== null && i === question.correctIndex;
          const isWrong = pick === option && i !== question.correctIndex;
          const faded = pick !== null && !isRight && !isWrong;
          return (
            <Button
              key={option}
              variant="ghost"
              fullWidth
              onClick={() => tap(option, i)}
              disabled={!!pick || answered}
              className={cn(
                'justify-start rounded-xl border px-4 py-3 text-left text-sm font-semibold hover:bg-transparent',
                isRight
                  ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300'
                  : isWrong
                    ? 'border-rose-400/30 bg-rose-400/15 text-rose-300'
                    : faded
                      ? 'border-white/4 bg-white/[0.02] text-white/20'
                      : 'border-white/12 bg-white/[0.06] text-white/90 hover:bg-white/10',
              )}
            >
              <span className="mr-2 font-mono text-xs text-white/25">
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function SpeedRevealRenderer({
  data,
  onResult,
  resumeFromSnapshot,
  saveSnapshot,
}: {
  data: SpeedRevealData;
  onResult: (result: { correct: boolean; ms: number; details?: SpeedRevealDetails }) => void;
  resumeFromSnapshot?: unknown;
  saveSnapshot?: (snapshot: unknown) => void;
}) {
  const startMs = useRef(Date.now());
  const snap = resumeFromSnapshot as SpeedRevealSnapshot | undefined;
  const [answered, setAnswered] = useState(snap?.answered ?? false);

  useEffect(() => {
    saveSnapshot?.({
      answered,
      phase: snap?.phase ?? 'waiting',
      countdown: snap?.countdown ?? 6,
      revealedIndices: snap?.revealedIndices ?? [],
    });
  }, [answered, saveSnapshot, snap?.countdown, snap?.phase, snap?.revealedIndices]);

  function handleAnswer(correct: boolean, explanation: string) {
    if (answered) return;
    setAnswered(true);
    const ms = Date.now() - startMs.current;
    setTimeout(() => {
      onResult({ correct, ms, details: { explanation } });
    }, correct ? 800 : 2400);
  }

  return (
    <div className="animate-[slideUp_0.25s_ease-out]">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-xl">⚡</span>
        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text font-display text-xs font-black uppercase tracking-widest text-transparent">
          Speed Reveal
        </span>
      </div>

      {data.question.kind === 'fill' ? (
        <FillQuestion
          question={data.question}
          answered={answered}
          onAnswer={handleAnswer}
        />
      ) : (
        <MultipleChoiceQuestion
          question={data.question}
          answered={answered}
          onAnswer={handleAnswer}
        />
      )}

      <MnemonicRevealer
        root={data.root}
        mnemonic={data.mnemonic}
        answered={answered}
        countdownMs={data.countdownMs ?? 6000}
        revealMs={data.revealMs ?? 5000}
      />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const exemplar: SpeedRevealData = {
  termId: 'term.endosymbiosis',
  root: 'Greek: endo (within) + sym (together) + bios (life)',
  mnemonic:
    'ENDO=INSIDE. SYM=TOGETHER. Prokaryotes moved IN and stayed — roommates for 2 billion years.',
  question: {
    kind: 'fill',
    prompt: 'Lynn Margulis proposed the _____ Theory for eukaryotic cell evolution.',
    acceptable: ['endosymbiotic', 'endosymbiosis'],
    hint: 'Endo=within, symbiotic=together',
  },
};

const registration: TemplateRegistration<SpeedRevealData, SpeedRevealDetails> = {
  kind: 'speed-reveal-mnemonic',
  schema: SpeedRevealDataSchema,
  exemplar,
  classifications: {
    fastLane: true,
    microworld: false,
    constructionist: false,
    bodySyntonic: false,
    debugStyle: false,
  },
  Renderer: SpeedRevealRenderer,
  describePrompt: (data) => {
    const q =
      data.question.kind === 'fill' ? data.question.prompt : data.question.prompt;
    return `Speed reveal for ${data.termId}: ${q}`;
  },
  estimateMs: () => 45_000,
  defaultConfidenceMs: 30_000,
};

export default registration;
