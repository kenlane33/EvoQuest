'use client';

import { Button } from '@/components/common/Button';
import {
  ACHIEVEMENT_MOMENT_TITLE,
  achievementContext,
} from '@/audio/achievement-read-text';
import { cn } from '@/lib/cn';
import type { EarnedAchievement } from '@/engine/achievements/detect';

type AchievementEarnedMomentProps = {
  achievement: EarnedAchievement;
  remainingCount?: number;
  onContinue: () => void;
  reducedMotion?: boolean;
};

export function AchievementEarnedMoment({
  achievement,
  remainingCount = 0,
  onContinue,
  reducedMotion = false,
}: AchievementEarnedMomentProps) {
  const isAggregate = achievement.kind === 'aggregate';
  const isTier = achievement.kind === 'tier';
  const context = achievementContext(achievement);

  return (
    <div
      className="fixed inset-0 z-90 flex items-end justify-center px-4 pb-24 pt-8 sm:items-center sm:pb-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-moment-title"
      aria-describedby="achievement-moment-desc"
    >
      <div
        className="glass-sm glass-bg-overlay-moment absolute inset-0"
        aria-hidden
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-sm rounded-(--r-lg) border border-(--border-medium) bg-(--bg-card) px-5 py-5 text-center shadow-xl',
          !reducedMotion && (isAggregate ? 'animate-pop-in' : 'animate-slide-up'),
        )}
      >
        <h2
          id="achievement-moment-title"
          className="text-headline-lg font-black text-(--text-primary)"
        >
          {ACHIEVEMENT_MOMENT_TITLE}
        </h2>
        <p className="mt-1 text-micro font-bold uppercase tracking-[0.12em] text-(--text-dim)">
          {context}
        </p>
        <div
          className={cn(
            'mt-3 text-4xl',
            !reducedMotion && !isTier && 'animate-pop-in',
          )}
          aria-hidden
        >
          {achievement.emoji}
        </div>
        <p className="mt-2 text-micro font-extrabold uppercase tracking-[0.12em] text-(--accent-cyan)">
          {achievement.shortLabel}
        </p>
        <p id="achievement-moment-desc" className="mt-2 text-body italic text-(--text-secondary)">
          {achievement.flavor}
        </p>
        {achievement.hook ? (
          <p className="mt-2 text-meta text-(--text-dim)">{achievement.hook}</p>
        ) : null}
        {remainingCount > 0 ? (
          <p className="mt-3 text-meta text-(--text-dim)">
            {remainingCount} more achievement{remainingCount === 1 ? '' : 's'} after this
          </p>
        ) : null}
        <Button variant="primary" fullWidth className="mt-4" onClick={onContinue}>
          CONTINUE
        </Button>
      </div>
    </div>
  );
}
