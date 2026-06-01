'use client';

import { useCallback, useEffect, useRef } from 'react';
import { achievementSpeakText } from '@/audio/achievement-read-text';
import { canAutoReadAloud } from '@/audio/read-aloud';
import { getPocketTtsEngine, stopPocketTtsEngine } from '@/audio/pocket-tts-engine';
import type { EarnedAchievement } from '@/engine/achievements/detect';
import { useAppStore } from '@/store/app-store';

/** Speak the achievement moment before feedback AAR auto-read. */
export function useAchievementMomentSpeak(achievement: EarnedAchievement | null): () => void {
  const reading = useAppStore((s) => s.settings.reading);
  const voice = reading.voice;
  const volume = useAppStore((s) => s.settings.audio.volume);
  const lastSpokenId = useRef('');
  const abortRef = useRef<AbortController | null>(null);
  const speakGen = useRef(0);

  const stopSpeaking = useCallback(() => {
    speakGen.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    stopPocketTtsEngine();
  }, []);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  useEffect(() => {
    if (!achievement) return;

    const text = achievementSpeakText(achievement).trim();
    if (!text || !canAutoReadAloud(reading)) return;

    if (lastSpokenId.current === achievement.id) return;

    stopSpeaking();
    lastSpokenId.current = achievement.id;

    const gen = ++speakGen.current;
    const abort = new AbortController();
    abortRef.current = abort;

    void getPocketTtsEngine()
      .speak(text, { voice, volume, signal: abort.signal })
      .catch(() => {
        /* no audio */
      })
      .finally(() => {
        if (abortRef.current === abort) {
          abortRef.current = null;
        }
      });

    return () => {
      if (speakGen.current === gen) {
        abort.abort();
        if (abortRef.current === abort) {
          abortRef.current = null;
        }
      }
    };
  }, [achievement, reading.enabled, reading.autoRead, voice, volume, stopSpeaking]);

  return stopSpeaking;
}
