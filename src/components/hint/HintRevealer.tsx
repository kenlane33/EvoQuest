'use client';

import { useEffect, useRef, useState } from 'react';
import { SpeakButton } from '@/components/content/SpeakButton';
import { cn } from '@/lib/cn';
import { HINT_COUNTDOWN_MS, HINT_REVEAL_MS } from '@/types/schemas';

export type EtymHint = {
  root: string;
  mnemonic: string;
};

type HintRevealerProps = {
  hint: EtymHint | null;
  answered?: boolean;
  countdownSec?: number;
  revealMs?: number;
  showRoot?: boolean;
  className?: string;
  onPhaseChange?: (phase: 'waiting' | 'revealing' | 'done') => void;
};

export function HintRevealer({
  hint,
  answered = false,
  countdownSec = Math.round(HINT_COUNTDOWN_MS.default / 1000),
  revealMs = HINT_REVEAL_MS.default,
  showRoot = true,
  className,
  onPhaseChange,
}: HintRevealerProps) {
  const [countdown, setCountdown] = useState(countdownSec);
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<'waiting' | 'revealing' | 'done'>('waiting');
  const orderRef = useRef<number[]>([]);

  const root = hint?.root ?? '';
  const mnemonic = hint?.mnemonic ?? '';

  useEffect(() => {
    if (!mnemonic) return;
    const indices = Array.from({ length: mnemonic.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    orderRef.current = indices;
    setCountdown(countdownSec);
    setRevealedSet(new Set());
    setPhase('waiting');
  }, [mnemonic, root, countdownSec]);

  useEffect(() => {
    if (!mnemonic || phase !== 'waiting' || answered) return;
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
  }, [mnemonic, phase, answered]);

  useEffect(() => {
    if (!mnemonic || phase !== 'revealing') return;

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
  }, [mnemonic, phase, revealMs]);

  useEffect(() => {
    if (answered && mnemonic) {
      setRevealedSet(new Set(Array.from({ length: mnemonic.length }, (_, i) => i)));
      setPhase('done');
    }
  }, [answered, mnemonic]);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  if (!hint) return null;

  const pctBar = phase === 'waiting' ? (countdown / countdownSec) * 100 : 0;

  return (
    <div
      className={cn(
        'mt-5 rounded-(--r-lg) border border-[color-mix(in_oklab,var(--accent-violet)_20%,transparent)] bg-[color-mix(in_oklab,var(--accent-violet)_6%,transparent)] p-4',
        className,
      )}
    >
      {showRoot && (
        <div className="mb-2 flex items-center gap-2">
          <span aria-hidden>📜</span>
          <span className="min-w-0 flex-1 text-micro font-bold uppercase tracking-[0.06em] text-(--accent-violet)">
            {hint.root}
          </span>
          <SpeakButton
            slot="sidebar"
            text={hint.root}
            label={`Read etymology: ${hint.root}`}
          />
        </div>
      )}

      {phase === 'waiting' && (
        <div>
          <p className="mb-2 text-meta text-(--text-dim)">
            Revealing mnemonic in{' '}
            <span className="font-bold text-(--accent-violet)">{countdown}s</span>…
          </p>
          <div className="h-0.5 overflow-hidden rounded-full bg-(--bg-card-active)">
            <div
              className="h-full rounded-full bg-[color-mix(in_oklab,var(--accent-violet)_50%,transparent)] transition-[width] duration-1000 linear"
              style={{ width: `${pctBar}%` }}
            />
          </div>
        </div>
      )}

      {(phase === 'revealing' || phase === 'done') && (
        <p className="text-body">
          <span className="mr-1 text-meta text-(--text-dim)">💡 Remember:</span>
          <span className="font-mono text-[0.8125rem] leading-relaxed tracking-[0.02em]">
            {hint.mnemonic.split('').map((char, i) => {
              const isSpace = char === ' ';
              const isRevealed = revealedSet.has(i);
              return (
                <span
                  key={i}
                  className={cn(
                    'transition-all duration-300',
                    isSpace
                      ? 'text-transparent'
                      : isRevealed
                        ? 'text-(--accent-amber)'
                        : 'text-[color-mix(in_oklab,var(--accent-violet)_25%,transparent)]',
                  )}
                  style={
                    isRevealed && !isSpace
                      ? { textShadow: 'var(--glow-reveal-char)' }
                      : undefined
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
