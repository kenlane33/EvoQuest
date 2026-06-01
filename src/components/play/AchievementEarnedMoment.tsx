'use client';

import { cn } from '@/lib/cn';
import type { EarnedAchievement } from '@/engine/achievements/detect';

type AchievementEarnedMomentProps = {
  achievement: EarnedAchievement;
  onDismiss: () => void;
  reducedMotion?: boolean;
};

export function AchievementEarnedMoment({
  achievement,
  onDismiss,
  reducedMotion = false,
}: AchievementEarnedMomentProps) {
  const isAggregate = achievement.kind === 'aggregate';
  const isTier = achievement.kind === 'tier';

  return (
    <div
      className="fixed inset-x-0 bottom-24 z-[90] flex justify-center px-4 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={onDismiss}
        className={cn(
          'pointer-events-auto max-w-sm rounded-(--r-lg) border border-(--border-medium) bg-[color-mix(in_oklab,var(--bg-card)_95%,transparent)] px-5 py-4 text-center shadow-lg backdrop-blur-md',
          !reducedMotion && (isAggregate ? 'animate-pop-in' : 'animate-slide-up'),
        )}
      >
        <div
          className={cn(
            'text-4xl',
            !reducedMotion && !isTier && 'animate-pop-in',
          )}
          aria-hidden
        >
          {achievement.emoji}
        </div>
        <p className="mt-1 text-micro font-extrabold uppercase tracking-[0.12em] text-(--accent-cyan)">
          {achievement.shortLabel}
          {isTier && achievement.tier ? ` · ${achievement.tier}` : ''}
        </p>
        <p className="mt-2 text-body italic text-(--text-secondary)">{achievement.flavor}</p>
        {achievement.hook ? (
          <p className="mt-2 text-meta text-(--text-dim)">{achievement.hook}</p>
        ) : null}
      </button>
    </div>
  );
}
