'use client';

import type { ReactNode } from 'react';
import { ReadAloudRoot, useReadAloudSettings, useValidateStoredVoice } from '@/tts';
import { useAppStore } from '@/store/app-store';

function ValidateStoredVoice() {
  const { enabled } = useReadAloudSettings();
  useValidateStoredVoice(enabled);
  return null;
}

/** Bridges Zustand app settings into the portable read-aloud library. */
export function AppReadAloudProvider({ children }: { children: ReactNode }) {
  const reading = useAppStore((s) => s.settings.reading);
  const volume = useAppStore((s) => s.settings.audio.volume);
  const setSettings = useAppStore((s) => s.setSettings);

  return (
    <ReadAloudRoot
      enabled={reading.enabled}
      autoRead={reading.autoRead}
      voice={reading.voice}
      volume={volume}
      setVoice={(voice) =>
        setSettings((prev) => ({
          ...prev,
          reading: { ...prev.reading, voice },
        }))
      }
      setAutoRead={(autoRead) =>
        setSettings((prev) => ({
          ...prev,
          reading: { ...prev.reading, autoRead },
        }))
      }
      setEnabled={(enabled) =>
        setSettings((prev) => ({
          ...prev,
          reading: { ...prev.reading, enabled },
        }))
      }
    >
      <ValidateStoredVoice />
      {children}
    </ReadAloudRoot>
  );
}
