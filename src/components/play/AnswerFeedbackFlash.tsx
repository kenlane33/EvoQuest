'use client';

import { cn } from '@/lib/cn';

type AnswerFeedbackFlashProps = {
  headline: string;
  correct: boolean;
};

/** Same headline as the feedback page title — pulses while CONTINUE counts down. */
export function AnswerFeedbackFlash({ headline, correct }: AnswerFeedbackFlashProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none flex justify-center px-2 py-3"
    >
      <h3
        className={cn(
          'max-w-full text-center text-headline-lg font-black animate-feedback-headline-pulse',
          correct ? 'text-(--status-correct)' : 'text-(--status-wrong)',
        )}
        style={{
          textShadow: correct
            ? '0 0 28px color-mix(in oklab, var(--status-correct) 50%, transparent)'
            : '0 0 28px color-mix(in oklab, var(--status-wrong) 50%, transparent)',
        }}
      >
        {headline}
      </h3>
    </div>
  );
}
