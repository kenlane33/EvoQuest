'use client';

import { APP_VERSION } from '@/storage/writer';

/** Tiny build stamp — fixed at the top-right corner of every page. */
export function VersionBadge() {
  return (
    <span
      className="pointer-events-none fixed top-1 right-2 z-60 font-mono text-[10px] leading-none tabular-nums text-(--text-faint)"
      aria-hidden
    >
      v{APP_VERSION}
    </span>
  );
}
