'use client';

import { Loader2, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';
import type { PocketTtsStatus } from '@/audio/use-pocket-tts';

type ReadAloudButtonProps = {
  text: string;
  status: PocketTtsStatus;
  error: string | null;
  onToggle: () => void;
  className?: string;
  label?: string;
};

export function ReadAloudButton({
  text,
  status,
  error,
  onToggle,
  className,
  label = 'Read it',
}: ReadAloudButtonProps) {
  const busy = status === 'loading';
  const playing = status === 'playing';
  const disabled = !text.trim();

  return (
    <div className={cn('flex flex-col items-start gap-1 h-9', className)}>
      <Button
        variant="secondary"
        onClick={onToggle}
        disabled={disabled || busy}
        aria-label={playing ? 'Stop reading' : label}
        className="gap-2 h-9"
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin" aria-hidden />
        ) : playing ? (
          <Square size={16} aria-hidden />
        ) : (
          <Volume2 size={16} aria-hidden />
        )}
        {busy ? 'Loading…' : playing ? 'Stop' : label}
      </Button>
      {error ? (
        <p className="text-meta text-(--status-wrong)" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
