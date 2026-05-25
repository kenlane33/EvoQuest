'use client';

import type { ReactNode } from 'react';
import { SpeakButton } from '@/components/content/SpeakButton';
import { cn } from '@/lib/cn';

type EtymologyCardProps = {
  root: string;
  mnemonic?: string;
  /** Plain text for read-aloud; defaults to root. Set false to hide the button. */
  speakText?: string | false;
  speakSlot?: 'sidebar';
  children?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function EtymologyCard({
  root,
  mnemonic,
  speakText,
  speakSlot,
  children,
  compact = false,
  className,
}: EtymologyCardProps) {
  const readText = speakText === false ? '' : (speakText ?? root);

  return (
    <div
      className={cn(
        'etymology-gradient-border rounded-(--r-xl) bg-(--bg-soft) lift-card transition-shadow hover:glow-violet-md',
        compact ? 'p-3' : 'p-4',
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <span aria-hidden className="text-sm">
          📜
        </span>
        <span className="min-w-0 flex-1 font-headline text-micro font-bold uppercase tracking-[0.06em] text-(--accent-violet)">
          {root}
        </span>
        {readText ? (
          <SpeakButton
            slot={speakSlot}
            text={readText}
            label={`Read etymology: ${root}`}
          />
        ) : null}
      </div>
      {mnemonic && (
        <p className="font-mono text-[0.8125rem] leading-relaxed tracking-[0.02em] text-(--accent-amber)">
          {mnemonic}
        </p>
      )}
      {children}
    </div>
  );
}
