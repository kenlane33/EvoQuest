'use client';

import { useEffect } from 'react';
import '@/engine/templates';
import { preloadPocketTts } from '@/audio/pocket-tts-engine';
import { AppHeader } from '@/components/common/AppHeader';
import { DevPageLabelProvider } from '@/components/dev/DevPageLabel';
import { GlobalReadAloudBar } from '@/components/audio/GlobalReadAloudBar';
import { PageReadAloudProvider } from '@/components/audio/page-read-aloud-context';
import { attachPersistHooks, useAppStore } from '@/store/app-store';
import { applyBodyFont } from '@/lib/google-fonts';

export function AppHydrator({ children }: { children: React.ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const loadFromStorage = useAppStore((s) => s.loadFromStorage);
  const settings = useAppStore((s) => s.settings);

  useEffect(() => {
    loadFromStorage();
    return attachPersistHooks();
  }, [loadFromStorage]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-contrast', settings.appearance.contrast);
    root.setAttribute('data-font-size', settings.appearance.fontSize);
    root.setAttribute(
      'data-dyslexia',
      String(settings.appearance.bodyFont === 'opendyslexic'),
    );
    applyBodyFont(settings.appearance.bodyFont);
    if (settings.motion !== 'full') {
      root.setAttribute('data-motion', settings.motion);
    } else {
      root.removeAttribute('data-motion');
    }
  }, [settings]);

  // Warm the ONNX bundle cache as soon as the shell mounts (during "Loading…").
  useEffect(() => {
    if (settings.reading.enabled) {
      preloadPocketTts(settings.reading.voice);
    }
  }, [settings.reading.enabled, settings.reading.voice]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-(--text-dim)">
        Loading…
      </div>
    );
  }

  return (
    <DevPageLabelProvider>
      <PageReadAloudProvider>
        <AppHeader />
        {children}
        <GlobalReadAloudBar />
      </PageReadAloudProvider>
    </DevPageLabelProvider>
  );
}
