'use client';

import { useEffect, useState } from 'react';

/** Live elapsed seconds since `startedAt` — ticks once per second, local to the caller. */
export function useElapsedSec(startedAt: number): number {
  const [elapsedSec, setElapsedSec] = useState(() =>
    Math.floor((Date.now() - startedAt) / 1000),
  );

  useEffect(() => {
    const tick = () => {
      setElapsedSec(Math.floor((Date.now() - startedAt) / 1000));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [startedAt]);

  return elapsedSec;
}
