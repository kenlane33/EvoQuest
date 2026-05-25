'use client';

import { useEffect, useRef } from 'react';
import {
  feedbackDescReadText,
  type FeedbackReadBundle,
} from '@/audio/feedback-read-text';
import { canAutoReadAloud } from '@/audio/read-aloud';
import { getPocketTtsEngine, waitForPocketTtsIdle } from '@/audio/pocket-tts-engine';
import { useAppStore } from '@/store/app-store';

/**
 * Auto-read feedback body (explanation + teach + sidebar) after the reaction
 * headline finishes. Skips the title — useImmediateFeedbackSpeak covers that.
 */
export function useFeedbackAutoRead(
  bundle: FeedbackReadBundle | null,
  autoKey: string | null,
) {
  const reading = useAppStore((s) => s.settings.reading);
  const voice = reading.voice;
  const volume = useAppStore((s) => s.settings.audio.volume);
  const runId = useRef(0);
  const descText = bundle ? feedbackDescReadText(bundle) : '';
  const sidebarText = bundle?.sidebar.trim() ?? '';

  useEffect(() => {
    if (!autoKey || !canAutoReadAloud(reading)) return;

    const parts = [descText, sidebarText].filter((p) => p.length > 0);
    if (parts.length === 0) return;

    const id = ++runId.current;
    const abort = new AbortController();

    const run = async () => {
      await waitForPocketTtsIdle();
      if (abort.signal.aborted || runId.current !== id) return;

      for (const text of parts) {
        if (abort.signal.aborted || runId.current !== id) return;
        try {
          await getPocketTtsEngine().speak(text, {
            voice,
            volume,
            signal: abort.signal,
          });
        } catch {
          if (abort.signal.aborted || runId.current !== id) return;
        }
      }
    };

    void run();

    return () => {
      abort.abort();
      if (runId.current === id) {
        runId.current += 1;
      }
    };
  }, [
    autoKey,
    descText,
    sidebarText,
    reading.enabled,
    reading.autoRead,
    voice,
    volume,
  ]);
}
