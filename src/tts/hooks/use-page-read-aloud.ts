'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { prepareReadAloud, speakReadAloud } from '../engine/read-aloud-engine';
import { canAutoReadAloud, REACTION_SPEAK_TIMEOUT_MS } from '../engine/read-aloud';
import { usePageReadAloudContext } from '../react/page-read-aloud-context';
import { useReadAloudBootstrap } from './use-read-aloud-bootstrap';
import { useReadAloudSettings } from '../react/ReadAloudProvider';

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
  const { enabled, autoRead: autoReadSetting, voice, volume } = useReadAloudSettings();
  const { setPageReadAloud, clearPageReadAloud } = usePageReadAloudContext();
  const runId = useRef(0);

  const trimmed = text.trim();
  const textRef = useRef(trimmed);
  textRef.current = trimmed;

  const autoRead = Boolean(
    options?.autoRead && canAutoReadAloud({ enabled, autoRead: autoReadSetting }) && trimmed,
  );
  const autoReadKey = options?.autoReadKey ?? trimmed;
  const [autoReadDone, setAutoReadDone] = useState(() => !autoRead);

  useReadAloudBootstrap(enabled && Boolean(options?.autoRead), voice);

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
        await prepareReadAloud(voice);
        if (runId.current !== id) return;
        await speakReadAloud(textRef.current, {
          voice,
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
  }, [autoRead, autoReadKey, enabled, autoReadSetting, voice, volume]);

  return autoReadDone;
}
