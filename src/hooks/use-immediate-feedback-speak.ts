'use client';

import { useEffect, useRef, useState } from 'react';
import {
  canAutoReadAloud,
  REACTION_SPEAK_TIMEOUT_MS,
} from '@/audio/read-aloud';
import { getPocketTtsEngine } from '@/audio/pocket-tts-engine';
import { useAppStore } from '@/store/app-store';

/** Speak the feedback title as soon as the player answers (uses pre-cached audio when ready). */
export function useImmediateFeedbackSpeak(headline: string | null): boolean {
  const reading = useAppStore((s) => s.settings.reading);
  const voice = reading.voice;
  const volume = useAppStore((s) => s.settings.audio.volume);
  const lastSpoken = useRef('');
  const abortRef = useRef<AbortController | null>(null);
  const speakGen = useRef(0);
  const [reactionReady, setReactionReady] = useState(true);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  useEffect(() => {
    const trimmed = headline?.trim();
    if (!trimmed) {
      setReactionReady(true);
      return;
    }
    if (!canAutoReadAloud(reading)) {
      setReactionReady(true);
      return;
    }
    if (lastSpoken.current === trimmed) {
      setReactionReady(true);
      return;
    }

    abortRef.current?.abort();
    lastSpoken.current = trimmed;
    setReactionReady(false);

    const gen = ++speakGen.current;
    const abort = new AbortController();
    abortRef.current = abort;
    const timeoutId = window.setTimeout(() => {
      setReactionReady(true);
    }, REACTION_SPEAK_TIMEOUT_MS);

    void getPocketTtsEngine()
      .speak(trimmed, { voice, volume, signal: abort.signal })
      .catch(() => {
        /* no audio — unblock continue; feedback page reads the body */
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (abortRef.current === abort) {
          abortRef.current = null;
        }
        setReactionReady(true);
      });

    return () => {
      if (speakGen.current !== gen) {
        abort.abort();
      }
      if (abortRef.current === abort) {
        abortRef.current = null;
      }
    };
  }, [headline, reading.enabled, reading.autoRead, voice, volume]);

  return reactionReady;
}
