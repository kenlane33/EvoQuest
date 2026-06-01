'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { devMark } from '@/lib/dev-mark';
import { computeMasteryOverview } from '@/engine/progress/coverage';
import type { AchievementState, Settings, UnitProgress } from '@/types';

type MasteryOverviewProps = {
  unitProgress: Record<string, UnitProgress>;
  achievementState: AchievementState;
  settings: Settings;
  onRevisitLengthChange: (length: number) => void;
  className?: string;
};

export function MasteryOverview({
  unitProgress,
  achievementState,
  settings,
  onRevisitLengthChange,
  className,
}: MasteryOverviewProps) {
  const overview = useMemo(
    () => computeMasteryOverview(unitProgress),
    [unitProgress],
  );
  const dailyStreak = achievementState.dailyStreak?.count ?? 0;
  const revisitLength = settings.practice.revisitLength;

  return (
    <section
      {...devMark('mastery')}
      className={cn(
        'mb-6 rounded-(--r-lg) border border-(--border-light) bg-[color-mix(in_oklab,var(--accent-violet)_10%,var(--bg-card))] p-4 sm:p-5',
        className,
      )}
      aria-label="Progress overview"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-micro font-extrabold uppercase tracking-[0.14em] text-(--text-dim)">
            Full passes through everything
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-headline text-[2.75rem] font-black leading-none text-(--accent-cyan)">
              ×{overview.laps}
            </span>
            <span className="text-body font-semibold text-(--text-secondary)">
              {overview.laps === 1 ? 'lap' : 'laps'}
            </span>
          </p>
          <p className="mt-2 max-w-[20rem] text-meta text-(--text-dim)">
            A lap counts when every question in the workbook has been answered at least that many
            times.
          </p>
        </div>

        <div className="min-w-[8rem] text-right">
          <p className="text-micro font-bold uppercase tracking-[0.1em] text-(--text-faint)">
            Study streak
          </p>
          <p className="mt-1 font-headline text-headline-lg font-black text-(--text-primary)">
            {dailyStreak}
            <span className="ml-1 text-body font-semibold text-(--text-dim)">days</span>
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-meta font-bold text-(--text-secondary)">
            Next lap · {overview.nextLapPct}%
          </span>
          <span className="text-micro text-(--text-faint)">
            {overview.totalQuizzes} questions total
          </span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-(--bg-card-active)"
          role="progressbar"
          aria-valuenow={overview.nextLapPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress toward next full lap"
        >
          <div
            className="h-full rounded-full bg-(--accent-cyan) transition-all duration-500"
            style={{ width: `${overview.nextLapPct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-meta text-(--text-dim)">
        <span>
          <span className="font-bold text-(--text-secondary)">{overview.masteredTopics}</span>
          {' '}
          of {overview.totalTopics} topics at bronze or higher
        </span>
        <span>
          <span className="font-bold text-(--text-secondary)">{overview.startedTopics}</span>
          {' '}
          topics started
        </span>
      </div>

      <div className="mt-4 border-t border-(--border-faint) pt-4">
        <label className="text-micro font-bold uppercase tracking-[0.08em] text-(--text-dim)">
          Questions per revisit pass
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={revisitLength}
            onChange={(e) => onRevisitLengthChange(Number(e.target.value))}
            className="w-full accent-(--accent-violet)"
            aria-label="Questions per revisit pass"
          />
          <span className="w-8 shrink-0 text-right text-meta font-bold tabular-nums text-(--text-secondary)">
            {revisitLength}
          </span>
        </div>
      </div>
    </section>
  );
}
