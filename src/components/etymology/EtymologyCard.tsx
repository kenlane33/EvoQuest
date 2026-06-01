'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
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
  /** Collapse to a tap-to-expand strip below sm breakpoint. */
  collapsible?: boolean;
  className?: string;
};

export function EtymologyCard({
  root,
  mnemonic,
  speakText,
  speakSlot,
  children,
  compact = false,
  collapsible = false,
  className,
}: EtymologyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const readText = speakText === false ? '' : (speakText ?? root);

  const header = (
    <div className="flex items-center gap-2">
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
          className={cn(collapsible && !expanded && 'max-sm:hidden')}
        />
      ) : null}
      {collapsible ? (
        <ChevronDown
          size={16}
          aria-hidden
          className={cn(
            'shrink-0 text-(--text-dim) transition-transform sm:hidden',
            expanded && 'rotate-180',
          )}
        />
      ) : null}
    </div>
  );

  const body = (
    <>
      {mnemonic && (
        <p className="font-mono text-[0.8125rem] leading-relaxed tracking-[0.02em] text-(--accent-amber)">
          {mnemonic}
        </p>
      )}
      {children}
    </>
  );

  if (collapsible) {
    return (
      <div
        className={cn(
          'etymology-gradient-border rounded-(--r-xl) bg-(--bg-soft) lift-card transition-shadow hover:glow-violet-md',
          compact ? 'p-3' : 'p-4',
          className,
        )}
      >
        <button
          type="button"
          className={cn(
            'w-full text-left sm:cursor-default',
            !expanded && 'sm:pointer-events-none',
          )}
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {header}
        </button>
        <div className={cn('mt-2 space-y-2', !expanded && 'hidden sm:block')}>{body}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'etymology-gradient-border rounded-(--r-xl) bg-(--bg-soft) lift-card transition-shadow hover:glow-violet-md',
        compact ? 'p-3' : 'p-4',
        className,
      )}
    >
      <div className="mb-2">{header}</div>
      {body}
    </div>
  );
}
