'use client';

import { useEffect } from 'react';
import '@/engine/templates';
import {
  preloadReadAloud,
  primeWebSpeechVoices,
  GlobalReadAloudBar,
} from '@/tts';
import { AppReadAloudProvider } from '@/components/audio/AppReadAloudProvider';
import { AppHeader } from '@/components/common/AppHeader';
import { VersionBadge } from '@/components/common/VersionBadge';
import { DevPageLabelProvider } from '@/components/dev/DevPageLabel';
import { ensureFlushHooks } from '@/storage';
import { useAppStore } from '@/store/app-store';
import { applyBodyFont, applyHeadlineFont } from '@/lib/google-fonts';
import { useRouterState } from '@tanstack/react-router';

export function AppHydrator({ children }: { children: React.ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const loadFromStorage = useAppStore((s) => s.loadFromStorage);
  const settings = useAppStore((s) => s.settings);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onPlayRoute = pathname.startsWith('/play/');
  const onHome = pathname === '/';

  useEffect(() => {
    loadFromStorage();
    ensureFlushHooks();
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
    applyHeadlineFont(settings.appearance.headlineFont);
    if (settings.motion !== 'full') {
      root.setAttribute('data-motion', settings.motion);
    } else {
      root.removeAttribute('data-motion');
    }
  }, [settings]);

  useEffect(() => {
    primeWebSpeechVoices();
  }, []);

  // Warm the ONNX bundle cache as soon as the shell mounts (during "Loading…").
  useEffect(() => {
    if (settings.reading.enabled) {
      preloadReadAloud(settings.reading.voice);
    }
  }, [settings.reading.enabled, settings.reading.voice]);

  return (
    <>
      <VersionBadge />
      {!hydrated ? (
        <div className="flex min-h-screen items-center justify-center text-(--text-dim)">
          Loading…
        </div>
      ) : (
        <DevPageLabelProvider>
          <AppReadAloudProvider>
            <AppHeader />
            {children}
            <GlobalReadAloudBar onHome={onHome} onPlayRoute={onPlayRoute} />
          </AppReadAloudProvider>
        </DevPageLabelProvider>
      )}
    </>
  );
}
