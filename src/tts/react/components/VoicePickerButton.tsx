'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Speech } from 'lucide-react';
import { formatPocketTtsVoiceLabel } from '../../engine/pocket-tts';
import { buttonPressClasses } from '../../internal/Button';
import { usePocketTtsVoices } from '../../hooks/use-pocket-tts-voices';
import { cn } from '../../internal/cn';
import { useReadAloudSettings } from '../ReadAloudProvider';

type VoicePickerButtonProps = {
  /** Matches Hud icon sizing when true. */
  compact?: boolean;
  className?: string;
  triggerClassName?: string;
  triggerProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  menuClassName?: string;
};

/** Compact header control — opens a voice list backed by read-aloud settings. */
export function VoicePickerButton({
  compact = false,
  className,
  triggerClassName,
  triggerProps,
  menuClassName,
}: VoicePickerButtonProps) {
  const { enabled, voice, setVoice } = useReadAloudSettings();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { voices, status, error } = usePocketTtsVoices({
    enabled,
    voice,
  });

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!enabled) {
    return null;
  }

  const sizeClass = compact ? 'h-9 w-9' : 'h-10 w-10';
  const iconSize = compact ? 16 : 18;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        {...triggerProps}
        onClick={(e) => {
          triggerProps?.onClick?.(e);
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Choose read-aloud voice"
        className={cn(
          'flex items-center justify-center rounded-full border border-(--border-light) bg-(--bg-card) text-(--text-secondary) transition-colors hover:border-(--border-medium) hover:text-(--text-primary)',
          sizeClass,
          buttonPressClasses,
          open && 'border-(--accent-cyan) text-(--accent-cyan)',
          triggerClassName,
        )}
      >
        <Speech size={iconSize} aria-hidden />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Read-aloud voice"
          className={cn(
            'absolute top-[calc(100%+0.5rem)] right-0 z-50 max-h-[min(16rem,50dvh)] min-w-44 overflow-y-auto rounded-(--r-lg) border border-(--border-light) bg-(--bg-card) py-1 shadow-lg',
            menuClassName,
          )}
        >
          {status === 'loading' ? (
            <p className="px-3 py-2 text-meta text-(--text-faint)">Loading voices…</p>
          ) : null}
          {status === 'error' ? (
            <p className="px-3 py-2 text-meta text-(--status-wrong)">
              {error ?? 'Could not load voices.'}
            </p>
          ) : null}
          {voices.map((voiceId) => {
            const selected = voiceId === voice;
            return (
              <button
                key={voiceId}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setVoice(voiceId);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-body transition-colors hover:bg-(--bg-card-active)',
                  selected && 'text-(--accent-cyan)',
                )}
              >
                <Check size={14} className={cn('shrink-0', !selected && 'invisible')} aria-hidden />
                {formatPocketTtsVoiceLabel(voiceId)}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
