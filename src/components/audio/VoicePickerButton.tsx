'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Speech } from 'lucide-react';
import { formatPocketTtsVoiceLabel } from '@/audio/pocket-tts';
import { buttonPressClasses } from '@/components/common/Button';
import { usePocketTtsVoices } from '@/hooks/use-pocket-tts-voices';
import { cn } from '@/lib/cn';
import { devMark } from '@/lib/dev-mark';
import { useAppStore } from '@/store/app-store';

type VoicePickerButtonProps = {
  /** Matches Hud icon sizing when true. */
  compact?: boolean;
  devId?: string;
};

/** Compact header control — opens a voice list backed by settings.reading.voice. */
export function VoicePickerButton({ compact = false, devId = 'shell.voice' }: VoicePickerButtonProps) {
  const reading = useAppStore((s) => s.settings.reading);
  const setSettings = useAppStore((s) => s.setSettings);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { voices, status, error } = usePocketTtsVoices({
    enabled: reading.enabled,
    voice: reading.voice,
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

  if (!reading.enabled) {
    return null;
  }

  const sizeClass = compact ? 'h-9 w-9' : 'h-10 w-10';
  const iconSize = compact ? 16 : 18;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        {...devMark(devId)}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Choose read-aloud voice"
        className={cn(
          'flex items-center justify-center rounded-full border border-(--border-light) bg-(--bg-card) text-(--text-secondary) transition-colors hover:border-(--border-medium) hover:text-(--text-primary)',
          sizeClass,
          buttonPressClasses,
          open && 'border-(--accent-cyan) text-(--accent-cyan)',
        )}
      >
        <Speech size={iconSize} aria-hidden />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Read-aloud voice"
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 max-h-[min(16rem,50dvh)] min-w-44 overflow-y-auto rounded-(--r-lg) border border-(--border-light) bg-(--bg-card) py-1 shadow-lg"
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
            const selected = voiceId === reading.voice;
            return (
              <button
                key={voiceId}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setSettings({ reading: { ...reading, voice: voiceId } });
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
