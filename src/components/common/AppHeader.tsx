'use client';

import { Link, useRouterState } from '@tanstack/react-router';
import { Settings } from 'lucide-react';
import { AutoReadToggle } from '@/components/audio/AutoReadToggle';
import { VoicePickerButton } from '@/components/audio/VoicePickerButton';
import { buttonPressClasses } from '@/components/common/Button';
import { MenuHomeButton } from '@/components/common/MenuHomeButton';
import { cn } from '@/lib/cn';
import { devMark } from '@/lib/dev-mark';

/** App-wide top bar: menu, auto-read toggle, and settings (hidden during play — Hud is used there). */
export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith('/play/')) {
    return null;
  }

  const showMenu = pathname !== '/' && pathname !== '/welcome';
  const isT1 = pathname === '/t1';
  const isT2 = pathname === '/t2';

  const tLinkClass = (active: boolean) =>
    cn(
      'flex h-10 w-10 items-center justify-center rounded-full border bg-(--bg-card) text-meta font-black no-underline transition-colors',
      buttonPressClasses,
      active
        ? 'border-(--accent-violet) text-(--text-primary) bg-[color-mix(in_oklab,var(--accent-violet)_10%,transparent)]'
        : 'border-(--border-light) text-(--text-secondary) hover:border-(--accent-violet) hover:text-(--text-primary)',
    );

  return (
    <header
      {...devMark('shell.hdr')}
      className="glass-md glass-bg-header sticky top-0 z-40 border-b border-(--border-faint)"
    >
      <div className="page-wrap flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-10">
          {showMenu ? <MenuHomeButton devId="shell.menu" /> : null}
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/t1"
            {...devMark('shell.t1')}
            className={tLinkClass(isT1)}
            title="Test as Reader (T1)"
            aria-label="Test as Reader page T1"
            aria-current={isT1 ? 'page' : undefined}
          >
            T1
          </Link>
          <Link
            to="/t2"
            {...devMark('shell.t2')}
            className={tLinkClass(isT2)}
            title="Test as Reader (T2)"
            aria-label="Test as Reader page T2"
            aria-current={isT2 ? 'page' : undefined}
          >
            T2
          </Link>
          <Link
            to="/dx/preview"
            {...devMark('shell.dxpreview')}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border border-(--border-light) bg-(--bg-card) text-lg leading-none no-underline transition-colors hover:border-(--accent-violet) hover:bg-[color-mix(in_oklab,var(--accent-violet)_10%,transparent)]',
              buttonPressClasses,
            )}
            title="Preview diagram questions (DX)"
            aria-label="Preview diagram questions for approval"
          >
            <span aria-hidden>🔬</span>
          </Link>
          <div {...devMark('shell.autoread')}>
            <AutoReadToggle />
          </div>
          <VoicePickerButton />
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
      </div>
    </header>
  );
}
