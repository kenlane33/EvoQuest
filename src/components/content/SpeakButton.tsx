'use client';

import { useCallback, useRef, useState } from 'react';
import { Loader2, Square, Volume2 } from 'lucide-react';
import type { QuestionSpeakSlot } from '@/components/audio/question-speak-context';
import { useQuestionSpeakOptional } from '@/components/audio/question-speak-context';
import { getPocketTtsEngine, stopPocketTtsEngine } from '@/audio/pocket-tts-engine';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store/app-store';

type SpeakButtonProps = {
  text: string;
  /** When set, joins the question speak group (interrupt + active state). */
  slot?: QuestionSpeakSlot;
  /** Accessible label; defaults to "Read aloud". */
  label?: string;
  className?: string;
};

/** Compact play/stop control for optional read-aloud on a text snippet. */
export function SpeakButton({ text, slot, label = 'Read aloud', className }: SpeakButtonProps) {
  const enabled = useAppStore((s) => s.settings.reading.enabled);
  const voice = useAppStore((s) => s.settings.reading.voice);
  const volume = useAppStore((s) => s.settings.audio.volume);
  const questionSpeak = useQuestionSpeakOptional();

  const trimmed = text.trim();
  const coordinated = Boolean(slot && questionSpeak);
  const [soloActive, setSoloActive] = useState(false);
  const soloAbort = useRef<AbortController | null>(null);
  const soloRequest = useRef(0);

  const isActive =
    coordinated &&
    questionSpeak!.activeSlot === slot &&
    (questionSpeak!.status === 'loading' || questionSpeak!.status === 'playing');
  const busy = coordinated
    ? questionSpeak!.status === 'loading'
    : soloActive && !isActive;

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!trimmed) return;

      if (coordinated && slot) {
        questionSpeak!.toggle(slot);
        return;
      }

      if (soloActive) {
        soloAbort.current?.abort();
        soloAbort.current = null;
        stopPocketTtsEngine();
        setSoloActive(false);
        return;
      }

      const id = ++soloRequest.current;
      const abort = new AbortController();
      soloAbort.current = abort;
      setSoloActive(true);

      try {
        await getPocketTtsEngine().speak(trimmed, { voice, volume, signal: abort.signal });
      } catch {
        /* surfaced via global bar on demand */
      } finally {
        if (soloAbort.current === abort) {
          soloAbort.current = null;
        }
        if (soloRequest.current === id) {
          setSoloActive(false);
        }
      }
    },
    [trimmed, coordinated, slot, questionSpeak, voice, volume, soloActive],
  );

  if (!enabled || !trimmed) return null;

  const showActive = isActive || soloActive;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={showActive ? `Stop: ${label}` : label}
      aria-pressed={showActive}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-(--r-md) p-1.5 transition-colors',
        showActive
          ? 'bg-[color-mix(in_oklab,var(--accent-cyan)_15%,transparent)] text-(--accent-cyan)'
          : 'text-(--text-dim) hover:bg-(--bg-card-active) hover:text-(--accent-cyan)',
        busy && 'opacity-70',
        className,
      )}
    >
      {busy ? (
        <Loader2 size={14} className="animate-spin" aria-hidden />
      ) : showActive ? (
        <Square size={14} aria-hidden />
      ) : (
        <Volume2 size={14} aria-hidden />
      )}
    </button>
  );
}
