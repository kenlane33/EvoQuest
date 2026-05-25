'use client';

import { Lock } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { UnitProgress } from '@/types';
import { WING_GROUPS, type AchievementTile } from '@/content/catalog';

type AchievementGridProps = {
  unitProgress: Record<string, UnitProgress>;
  preview?: boolean;
  className?: string;
};

function Tile({
  tile,
  progress,
  preview,
  delay,
}: {
  tile: AchievementTile;
  progress?: UnitProgress;
  preview?: boolean;
  delay?: number;
}) {
  const unlocked =
    preview ||
    (progress?.tier !== 'locked' && progress?.tier !== undefined) ||
    progress?.achievementEarned;

  return (
    <div
      data-wing={tile.wingId}
      className={cn(
        'flex aspect-square w-[60px] flex-col items-center justify-center gap-1 rounded-(--r-lg) border text-center transition-all duration-300',
        unlocked
          ? 'border-(--border-medium) bg-[color-mix(in_oklab,var(--wing-primary)_12%,transparent)] glow-wing-md'
          : 'border-(--border-faint) bg-(--bg-card) opacity-60',
        preview && 'animate-cascade',
      )}
      style={preview && delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
      title={tile.longLabel}
    >
      <span
        className={cn(
          'text-2xl leading-none',
          !unlocked && 'opacity-30 grayscale',
        )}
        aria-hidden
      >
        {tile.emoji}
      </span>
      <span
        className={cn(
          'max-w-[52px] truncate text-micro font-bold uppercase leading-tight',
          unlocked ? 'text-(--text-secondary)' : 'text-(--text-faint)',
        )}
      >
        {tile.shortLabel}
      </span>
      {!unlocked && !preview && (
        <Lock size={12} className="absolute opacity-0" aria-label="Locked" />
      )}
    </div>
  );
}

export function AchievementGrid({ unitProgress, preview = false, className }: AchievementGridProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {WING_GROUPS.map((group) => (
        <section key={group.wingId} data-wing={group.wingId}>
          <h2 className="mb-3 text-micro font-extrabold uppercase tracking-[0.15em] text-(--text-dim)">
            {group.title}
          </h2>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {group.tiles.map((tile, i) => (
              <Tile
                key={tile.unitId}
                tile={tile}
                progress={unitProgress[tile.unitId]}
                preview={preview}
                delay={preview ? i * 80 : undefined}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
