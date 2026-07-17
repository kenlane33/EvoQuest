'use client';

import type { ReactNode } from 'react';
import { Loader2, Pause, Square, Volume2 } from 'lucide-react';
import { Button } from '../../internal/Button';
import { cn } from '../../internal/cn';
import type { PocketTtsStatus } from '../../hooks/use-pocket-tts';

type ReadAloudButtonProps = {
  text: string;
  status: PocketTtsStatus;
  error: string | null;
  onToggle: () => void;
  className?: string;
  buttonClassName?: string;
  label?: string;
  /** Visible + accessible label shown while playing. Defaults to "Stop". */
  playingLabel?: string;
  /** Icon shown while playing. Defaults to a stop square. */
  playingIcon?: ReactNode;
  /** When true, control is inactive (e.g. voice model still loading). */
  disabled?: boolean;
};

export function ReadAloudButton({
  text,
  status,
  error,
  onToggle,
  className,
  buttonClassName,
  label = 'Read it',
  playingLabel,
  playingIcon,
  disabled: disabledExternal = false,
}: ReadAloudButtonProps) {
  const busy = status === 'loading';
  const playing = status === 'playing';
  const disabled = disabledExternal || !text.trim();
  const resolvedPlayingIcon =
    playingIcon ?? (playingLabel ? <Pause size={16} aria-hidden /> : <Square size={16} aria-hidden />);

  return (
    <div className={cn('flex flex-col items-start gap-1 h-9', className)}>
      <Button
        variant="secondary"
        onClick={onToggle}
        disabled={disabled || busy}
        aria-label={playing ? (playingLabel ?? 'Stop reading') : label}
        className={cn('gap-2 h-9', buttonClassName)}
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin" aria-hidden />
        ) : playing ? (
          resolvedPlayingIcon
        ) : (
          <Volume2 size={16} aria-hidden />
        )}
        {busy ? 'Loading…' : playing ? (playingLabel ?? 'Stop') : label}
      </Button>
      {error ? (
        <p className="text-meta text-(--status-wrong)" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
