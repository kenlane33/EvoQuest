'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  feedbackDescReadText,
  type FeedbackReadBundle,
} from '@/audio/feedback-read-text';
import { canAutoReadAloud } from '@/audio/read-aloud';
import { getPocketTtsEngine, waitForPocketTtsIdle } from '@/audio/pocket-tts-engine';
import { useAppStore } from '@/store/app-store';

/**
 * Auto-read feedback body (explanation + teach) after the reaction headline
 * finishes. Skips title (useImmediateFeedbackSpeak) and fb.etym sidebar.
 *
 * @returns Whether auto-read for this feedback has finished (always true when auto-read is off).
 */
export function useFeedbackAutoRead(
  bundle: FeedbackReadBundle | null,
  autoKey: string | null,
): boolean {
  const reading = useAppStore((s) => s.settings.reading);
  const voice = reading.voice;
  const volume = useAppStore((s) => s.settings.audio.volume);
  const runId = useRef(0);
  const descText = bundle ? feedbackDescReadText(bundle) : '';
  const autoRead = Boolean(autoKey && canAutoReadAloud(reading) && descText);
  const [autoReadDone, setAutoReadDone] = useState(() => !autoRead);

  useLayoutEffect(() => {
    setAutoReadDone(!autoRead);
  }, [autoRead, autoKey]);

  useEffect(() => {
    if (!autoRead) return;

    const id = ++runId.current;
    const abort = new AbortController();

    const run = async () => {
      await waitForPocketTtsIdle();
      if (abort.signal.aborted || runId.current !== id) return;

      try {
        await getPocketTtsEngine().speak(descText, {
          voice,
          volume,
          signal: abort.signal,
        });
      } catch {
        if (abort.signal.aborted || runId.current !== id) return;
      } finally {
        if (!abort.signal.aborted && runId.current === id) {
          setAutoReadDone(true);
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
  }, [autoRead, autoKey, descText, voice, volume]);

  return autoReadDone;
}
