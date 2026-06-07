'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { prepareReadAloud, speakReadAloud } from '@/audio/read-aloud-engine';
import { canAutoReadAloud, REACTION_SPEAK_TIMEOUT_MS } from '@/audio/read-aloud';
import { usePageReadAloudContext } from '@/components/audio/page-read-aloud-context';
import { useReadAloudBootstrap } from '@/hooks/use-read-aloud-bootstrap';
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
  const runId = useRef(0);

  const trimmed = text.trim();
  const textRef = useRef(trimmed);
  textRef.current = trimmed;

  const autoRead = Boolean(
    options?.autoRead && canAutoReadAloud(reading) && trimmed,
  );
  const autoReadKey = options?.autoReadKey ?? trimmed;
  const [autoReadDone, setAutoReadDone] = useState(() => !autoRead);

  useReadAloudBootstrap(reading.enabled && Boolean(options?.autoRead), reading.voice);

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

    const id = ++runId.current;
    const abort = new AbortController();
    const timeoutId = window.setTimeout(() => {
      if (runId.current === id) {
        setAutoReadDone(true);
      }
    }, REACTION_SPEAK_TIMEOUT_MS);

    void (async () => {
      try {
        await prepareReadAloud(reading.voice);
        if (runId.current !== id) return;
        await speakReadAloud(textRef.current, {
          voice: reading.voice,
          volume,
          signal: abort.signal,
        });
      } catch {
        /* error shown when user taps Read it */
      } finally {
        if (runId.current === id) {
          clearTimeout(timeoutId);
          setAutoReadDone(true);
        }
      }
    })();

    return () => {
      runId.current += 1;
      abort.abort();
      clearTimeout(timeoutId);
    };
  }, [autoRead, autoReadKey, reading.enabled, reading.autoRead, reading.voice, volume]);

  return autoReadDone;
}
