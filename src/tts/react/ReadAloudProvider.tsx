'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { getPocketTtsEngine } from '../engine/pocket-tts-engine';
import { resolvePocketTtsVoice } from '../hooks/use-pocket-tts-voices';

export type ReadAloudSettings = {
  /** Master switch for read-aloud features. */
  enabled: boolean;
  /** Speak automatically when page content changes. */
  autoRead: boolean;
  /** Active Pocket TTS voice id. */
  voice: string;
  /** Playback volume 0–1. */
  volume: number;
};

export type ReadAloudSettingsActions = {
  setVoice: (voice: string) => void;
  setAutoRead: (autoRead: boolean) => void;
  setEnabled?: (enabled: boolean) => void;
};

export type ReadAloudContextValue = ReadAloudSettings & ReadAloudSettingsActions;

const ReadAloudContext = createContext<ReadAloudContextValue | null>(null);

export type ReadAloudProviderProps = ReadAloudSettings &
  ReadAloudSettingsActions & {
    children: ReactNode;
  };

/** Supplies read-aloud settings to hooks and components. Wire to your app store at the root. */
export function ReadAloudProvider({
  children,
  enabled,
  autoRead,
  voice,
  volume,
  setVoice,
  setAutoRead,
  setEnabled,
}: ReadAloudProviderProps) {
  const value = useMemo<ReadAloudContextValue>(
    () => ({
      enabled,
      autoRead,
      voice,
      volume,
      setVoice,
      setAutoRead,
      setEnabled,
    }),
    [enabled, autoRead, voice, volume, setVoice, setAutoRead, setEnabled],
  );

  return (
    <ReadAloudContext.Provider value={value}>{children}</ReadAloudContext.Provider>
  );
}

export function useReadAloudSettings(): ReadAloudContextValue {
  const ctx = useContext(ReadAloudContext);
  if (!ctx) {
    throw new Error('useReadAloudSettings must be used within ReadAloudProvider');
  }
  return ctx;
}

/** Optional access when a component may render outside the provider. */
export function useReadAloudSettingsOptional(): ReadAloudContextValue | null {
  return useContext(ReadAloudContext);
}

/** Clamp a stored voice id to voices reported by the loaded bundle. */
export function useValidateStoredVoice(enabled: boolean): void {
  const { voice, setVoice } = useReadAloudSettings();

  useEffect(() => {
    if (!enabled) return;

    const engine = getPocketTtsEngine();
    const validate = () => {
      const available = engine.getAvailableVoices();
      if (available.length === 0) return;
      const resolved = resolvePocketTtsVoice(voice, available);
      if (resolved !== voice) {
        setVoice(resolved);
      }
    };

    const unsub = engine.subscribeVoices(validate);
    validate();
    return unsub;
  }, [enabled, voice, setVoice]);
}
