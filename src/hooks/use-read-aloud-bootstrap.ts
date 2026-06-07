'use client';

import { useEffect, useState } from 'react';
import {
  getReadAloudBootstrapState,
  startReadAloudBootstrap,
  subscribeReadAloudBootstrap,
  type ReadAloudBootstrapState,
} from '@/audio/read-aloud-bootstrap';

/** Tracks Pocket TTS warm-up; kicks off bootstrap when enabled. */
export function useReadAloudBootstrap(enabled: boolean, voice: string): ReadAloudBootstrapState {
  const [bootstrap, setBootstrap] = useState(getReadAloudBootstrapState);

  useEffect(() => subscribeReadAloudBootstrap(() => setBootstrap(getReadAloudBootstrapState())), []);

  useEffect(() => {
    if (!enabled) return;
    void startReadAloudBootstrap(voice);
  }, [enabled, voice]);

  return bootstrap;
}
