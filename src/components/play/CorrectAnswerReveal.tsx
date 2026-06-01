'use client';

import { cn } from '@/lib/cn';

type CorrectAnswerRevealProps = {
  answer: string;
  className?: string;
};

/** Prominent correct-answer callout after a question is answered. */
export function CorrectAnswerReveal({ answer, className }: CorrectAnswerRevealProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('pointer-events-none px-2 py-4 text-center', className)}
    >
      <p className="text-micro font-bold uppercase tracking-[0.12em] text-(--text-dim)">
        Correct answer
      </p>
      <p
        className="mt-2 text-display-md font-black text-(--status-correct)"
        style={{
          textShadow:
            '0 0 24px color-mix(in oklab, var(--status-correct) 45%, transparent)',
        }}
      >
        {answer}
      </p>
    </div>
  );
}
