'use client';

import { useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { Flame, Heart, Settings } from 'lucide-react';
import { AutoReadToggle } from '@/components/audio/AutoReadToggle';
import { VoicePickerButton } from '@/components/audio/VoicePickerButton';
import { buttonPressClasses } from '@/components/common/Button';
import { MenuHomeButton } from '@/components/common/MenuHomeButton';
import { useElapsedSec } from '@/hooks/use-elapsed-sec';
import { cn } from '@/lib/cn';
import { devMark } from '@/lib/dev-mark';

type HudProps = {
  current: number;
  total: number;
  score: number;
  streak: number;
  startedAt: number;
  onProgressClick?: () => void;
  className?: string;
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function Hud({ current, total, score, streak, startedAt, onProgressClick, className }: HudProps) {
  const elapsedSec = useElapsedSec(startedAt);
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const syncHeight = () => {
      document.documentElement.style.setProperty('--hud-height', `${el.offsetHeight}px`);
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--hud-height');
    };
  }, []);

  return (
    <header
      ref={headerRef}
      {...devMark('hud')}
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b border-(--border-faint) bg-[color-mix(in_oklab,var(--bg-deep)_96%,transparent)] safe-top',
        className,
      )}
    >
      <div className="mx-auto flex max-w-(--w-content) items-center gap-1.5 px-3 py-2 max-sm:gap-1 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 max-sm:gap-1 sm:gap-2">
          <MenuHomeButton devId="hud.menu" size="compact" />
          <button
            type="button"
            {...devMark('hud.prog')}
            onClick={onProgressClick}
            disabled={!onProgressClick}
            aria-label={onProgressClick ? 'Pause quest' : undefined}
            className={cn(
              'flex min-h-9 min-w-0 flex-1 items-center gap-1.5 rounded-(--r-md) px-1 -mx-1 sm:min-h-11 sm:gap-2',
              onProgressClick
                ? cn(
                    buttonPressClasses,
                    'cursor-pointer hover:bg-(--bg-card) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-cyan)',
                  )
                : 'cursor-default',
            )}
          >
            <span className="shrink-0 text-micro font-extrabold uppercase text-(--accent-cyan)">
              {Math.min(current, total)}/{total}
            </span>
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-(--bg-card-active)">
              <div
                className="h-full rounded-full bg-[image:linear-gradient(90deg,var(--accent-cyan),var(--accent-green))] transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </button>
        </div>

        <div
          {...devMark('hud.stats')}
          className="flex shrink-0 items-center justify-end gap-1 text-meta font-bold max-sm:gap-1 sm:gap-2 md:gap-3"
        >
          <div {...devMark('hud.autoread')}>
            <AutoReadToggle compact />
          </div>
          <VoicePickerButton compact devId="hud.voice" />
          <Link
            to="/settings"
            {...devMark('hud.settings')}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--border-light) bg-(--bg-card) text-(--text-secondary) no-underline transition-colors hover:border-(--border-medium) hover:text-(--text-primary)',
              buttonPressClasses,
            )}
            aria-label="Settings"
          >
            <Settings size={16} />
          </Link>
          {score > 0 && (
            <span className="text-(--status-correct)">{score}✓</span>
          )}
          {streak > 1 && (
            <span
              className="flex items-center gap-1 text-(--status-streak)"
              aria-label={`${streak} streak`}
            >
              <Flame size={14} aria-hidden />
              {streak}
            </span>
          )}
          <span className="flex items-center gap-1 font-mono text-(--text-dim)">
            <Heart size={14} className="text-(--status-coral)" aria-hidden />
            <span className="sr-only">Elapsed time</span>
            {formatTime(elapsedSec)}
          </span>
        </div>
      </div>
    </header>
  );
}
