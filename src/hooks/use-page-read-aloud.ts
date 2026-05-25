'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { getPocketTtsEngine } from '@/audio/pocket-tts-engine';
import { canAutoReadAloud, REACTION_SPEAK_TIMEOUT_MS } from '@/audio/read-aloud';
import { usePageReadAloudContext } from '@/components/audio/page-read-aloud-context';
import { useAppStore } from '@/store/app-store';

type UsePageReadAloudOptions = {
  /** Speak automatically when text or key changes (if reading is enabled). */
  autoRead?: boolean;
  /** Bust auto-read when content changes without remounting. */
  autoReadKey?: string;
};

/**
 * Registers this page's main readable text and optionally auto-reads it.
 * Pair with the global Read it bar in the app shell.
 *
 * @returns Whether auto-read for this page has finished (always true when auto-read is off).
 */
export function usePageReadAloud(text: string, options?: UsePageReadAloudOptions): boolean {
  const ownerId = useId();
  const reading = useAppStore((s) => s.settings.reading);
  const volume = useAppStore((s) => s.settings.audio.volume);
  const { setPageReadAloud, clearPageReadAloud } = usePageReadAloudContext();

  const trimmed = text.trim();
  const textRef = useRef(trimmed);
  textRef.current = trimmed;

  const autoRead = Boolean(
    options?.autoRead && canAutoReadAloud(reading) && trimmed,
  );
  const autoReadKey = options?.autoReadKey ?? trimmed;
  const [autoReadDone, setAutoReadDone] = useState(() => !autoRead);

  useLayoutEffect(() => {
    setAutoReadDone(!autoRead);
  }, [autoRead, autoReadKey]);

  useEffect(() => {
    setPageReadAloud({
      ownerId,
      text: trimmed,
      autoRead: Boolean(options?.autoRead),
      autoReadKey,
    });
    return () => clearPageReadAloud(ownerId);
  }, [ownerId, trimmed, autoReadKey, options?.autoRead, setPageReadAloud, clearPageReadAloud]);

  useEffect(() => {
    if (!autoRead) return;

    const abort = new AbortController();
    const engine = getPocketTtsEngine();
    const timeoutId = window.setTimeout(
      () => setAutoReadDone(true),
      REACTION_SPEAK_TIMEOUT_MS,
    );

    void engine
      .speak(textRef.current, {
        voice: reading.voice,
        volume,
        signal: abort.signal,
      })
      .catch(() => {
        /* error shown when user taps Read it */
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setAutoReadDone(true);
      });

    return () => {
      abort.abort();
      clearTimeout(timeoutId);
    };
  }, [autoRead, autoReadKey, reading.voice, volume]);

  return autoReadDone;
}
