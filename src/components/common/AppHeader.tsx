'use client';

import { Link, useRouterState } from '@tanstack/react-router';
import { Settings } from 'lucide-react';
import { AutoReadToggle } from '@/components/audio/AutoReadToggle';
import { buttonPressClasses } from '@/components/common/Button';
import { cn } from '@/lib/cn';
import { devMark } from '@/lib/dev-mark';

/** App-wide top bar: auto-read toggle and settings (hidden during play — Hud is used there). */
export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith('/play/')) {
    return null;
  }

  return (
    <header
      {...devMark('shell.hdr')}
      className="sticky top-0 z-40 border-b border-(--border-faint) bg-(--bg-deep)/90 backdrop-blur-md"
    >
      <div className="page-wrap flex items-center justify-end gap-3 px-4 py-3">
        <div {...devMark('shell.autoread')}>
          <AutoReadToggle />
        </div>
        <Link
          to="/settings"
          {...devMark('shell.settings')}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border border-(--border-light) bg-(--bg-card) text-(--text-secondary) no-underline transition-colors hover:border-(--border-medium) hover:text-(--text-primary)',
            buttonPressClasses,
          )}
          aria-label="Settings"
        >
          <Settings size={18} />
        </Link>
      </div>
    </header>
  );
}
