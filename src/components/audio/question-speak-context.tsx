'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  getPocketTtsEngine,
  stopPocketTtsEngine,
  waitForPocketTtsIdle,
} from '@/audio/pocket-tts-engine';
import { canAutoReadAloud } from '@/audio/read-aloud';
import { useAppStore } from '@/store/app-store';

export type QuestionSpeakSlot = 'title' | 'desc' | 'sidebar';

export type QuestionSpeakStatus = 'idle' | 'loading' | 'playing';

type QuestionSpeakContextValue = {
  activeSlot: QuestionSpeakSlot | null;
  status: QuestionSpeakStatus;
  toggle: (slot: QuestionSpeakSlot) => void;
  stop: () => void;
};

const QuestionSpeakContext = createContext<QuestionSpeakContextValue | null>(null);

export function useQuestionSpeak() {
  const ctx = useContext(QuestionSpeakContext);
  if (!ctx) {
    throw new Error('useQuestionSpeak must be used within QuestionSpeakProvider');
  }
  return ctx;
}

export function useQuestionSpeakOptional() {
  return useContext(QuestionSpeakContext);
}

type QuestionSpeakProviderProps = {
  children: ReactNode;
  slots: Partial<Record<QuestionSpeakSlot, string>>;
  /** Auto-read this slot when autoKey changes (if reading is enabled). */
  autoSlot?: QuestionSpeakSlot;
  /** Auto-read these slots in order when autoKey changes (overrides autoSlot). */
  autoSequence?: QuestionSpeakSlot[];
  /** Wait for in-flight speech before starting autoSequence (feedback handoff). */
  autoWaitForIdle?: boolean;
  autoKey?: string;
};

export function QuestionSpeakProvider({
  children,
  slots,
  autoSlot,
  autoSequence,
  autoWaitForIdle = false,
  autoKey,
}: QuestionSpeakProviderProps) {
  const reading = useAppStore((s) => s.settings.reading);
  const voice = useAppStore((s) => s.settings.reading.voice);
  const volume = useAppStore((s) => s.settings.audio.volume);
  const [activeSlot, setActiveSlot] = useState<QuestionSpeakSlot | null>(null);
  const [status, setStatus] = useState<QuestionSpeakStatus>('idle');
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const cancelActive = useCallback(() => {
    requestId.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    stopPocketTtsEngine();
  }, []);

  const stop = useCallback(() => {
    cancelActive();
    setActiveSlot(null);
    setStatus('idle');
  }, [cancelActive]);

  const speak = useCallback(
    async (slot: QuestionSpeakSlot) => {
      const text = slotsRef.current[slot]?.trim();
      if (!text || !reading.enabled) return;

      const id = ++requestId.current;
      cancelActive();
      const abort = new AbortController();
      abortRef.current = abort;
      setActiveSlot(slot);
      setStatus('loading');

      try {
        await getPocketTtsEngine().speak(text, { voice, volume, signal: abort.signal });
        if (requestId.current === id) {
          setStatus('idle');
          setActiveSlot(null);
        }
      } catch {
        if (requestId.current === id) {
          setStatus('idle');
          setActiveSlot(null);
        }
      } finally {
        if (abortRef.current === abort) {
          abortRef.current = null;
        }
      }
    },
    [reading.enabled, voice, volume, cancelActive],
  );

  const toggle = useCallback(
    (slot: QuestionSpeakSlot) => {
      if (activeSlot === slot && (status === 'loading' || status === 'playing')) {
        stop();
        return;
      }
      void speak(slot);
    },
    [activeSlot, status, speak, stop],
  );

  const autoSequenceKey =
    autoSequence && autoSequence.length > 0
      ? autoSequence.join('|')
      : autoSlot ?? '';

  useEffect(() => {
    const sequence =
      autoSequence && autoSequence.length > 0
        ? autoSequence
        : autoSlot
          ? [autoSlot]
          : [];
    if (sequence.length === 0 || !autoKey || !canAutoReadAloud(reading)) return;

    const id = ++requestId.current;
    const abort = new AbortController();
    abortRef.current = abort;

    const runSequence = async () => {
      if (autoWaitForIdle) {
        await waitForPocketTtsIdle();
        if (abort.signal.aborted || requestId.current !== id) return;
      }

      for (const slot of sequence) {
        if (abort.signal.aborted || requestId.current !== id) return;
        const text = slotsRef.current[slot]?.trim();
        if (!text) continue;

        setActiveSlot(slot);
        setStatus('loading');

        try {
          await getPocketTtsEngine().speak(text, { voice, volume, signal: abort.signal });
        } catch {
          if (abort.signal.aborted || requestId.current !== id) return;
          if (requestId.current === id) {
            setStatus('idle');
            setActiveSlot(null);
          }
          return;
        }
      }

      if (requestId.current === id) {
        setStatus('idle');
        setActiveSlot(null);
      }
    };

    void runSequence().finally(() => {
      if (abortRef.current === abort) {
        abortRef.current = null;
      }
    });

    return () => {
      abort.abort();
      if (requestId.current === id) {
        requestId.current += 1;
        setActiveSlot(null);
        setStatus('idle');
      }
    };
  }, [
    autoSequenceKey,
    autoWaitForIdle,
    autoKey,
    reading.enabled,
    reading.autoRead,
    voice,
    volume,
  ]);

  useEffect(() => {
    if (status !== 'loading') return;
    const t = window.setTimeout(() => setStatus('playing'), 120);
    return () => clearTimeout(t);
  }, [status, activeSlot]);

  const value = useMemo(
    () => ({ activeSlot, status, toggle, stop }),
    [activeSlot, status, toggle, stop],
  );

  return (
    <QuestionSpeakContext.Provider value={value}>{children}</QuestionSpeakContext.Provider>
  );
}
