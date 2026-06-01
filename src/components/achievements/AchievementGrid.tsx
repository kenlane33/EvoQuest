'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';
import type { UnitProgress } from '@/types';
import { WING_GROUPS, type AchievementTile, type WingSubgroup } from '@/content/catalog';
import {
  summarizeSubgroupProgress,
  summarizeTileProgress,
  tierRingClass,
} from '@/components/achievements/tile-progress';
import { AGGREGATE_CATALOG } from '@/engine/achievements/aggregates';
import { HIDDEN_ACHIEVEMENTS } from '@/engine/achievements/catalog';
import { getUnitById } from '@/content/catalog';
import type { AchievementState } from '@/types';

type AchievementGridProps = {
  unitProgress: Record<string, UnitProgress>;
  achievementState?: AchievementState;
  preview?: boolean;
  className?: string;
  onTileSelect?: (tile: AchievementTile) => void;
  onEmbarkUnit?: (unitId: string) => void;
  onSubgroupStudy?: (subgroup: WingSubgroup) => void;
};

function LockedTilePopover({
  tile,
  onEmbark,
  onClose,
}: {
  tile: AchievementTile;
  onEmbark: () => void;
  onClose: () => void;
}) {
  const unit = getUnitById(tile.unitId);
  const headline = unit?.teach.headline ?? tile.longLabel;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-(--r-lg) border border-(--border-light) bg-(--bg-card) p-5 animate-slide-up">
        <div className="text-center">
          <span className="text-4xl" aria-hidden>{tile.emoji}</span>
          <h3 className="mt-2 text-headline-md font-black uppercase text-(--text-primary)">
            {tile.shortLabel}
          </h3>
        </div>
        <p className="mt-4 text-body text-(--text-secondary)">{headline}</p>
        {unit?.teach.hook ? (
          <p className="mt-2 text-meta italic text-(--text-dim)">{unit.teach.hook}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="primary" fullWidth onClick={onEmbark}>
            Embark this one
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function AggregateTile({
  emoji,
  shortLabel,
  flavor,
  large,
}: {
  emoji: string;
  shortLabel: string;
  flavor: string;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-1 rounded-(--r-lg) border border-(--border-medium) bg-[color-mix(in_oklab,var(--wing-primary)_18%,transparent)] px-3 py-3 text-center glow-wing-md',
        large ? 'col-span-full min-h-[5rem]' : 'min-h-[6.5rem]',
      )}
      title={flavor}
    >
      <span className={cn(large ? 'text-4xl' : 'text-3xl')} aria-hidden>{emoji}</span>
      <span className="text-micro font-extrabold uppercase tracking-[0.1em] text-(--text-secondary)">
        {shortLabel}
      </span>
    </div>
  );
}

function Tile({
  tile,
  progress,
  preview,
  delay,
  onSelect,
}: {
  tile: AchievementTile;
  progress?: UnitProgress;
  preview?: boolean;
  delay?: number;
  onSelect?: (tile: AchievementTile) => void;
}) {
  const stats = summarizeTileProgress(tile.unitId, progress);
  const unlocked =
    preview ||
    stats.tier !== 'locked' ||
    progress?.achievementEarned;

  const completionPct =
    stats.quizCount > 0 ? Math.round((stats.quizzesTried / stats.quizCount) * 100) : 0;

  const className = cn(
    'relative flex min-h-[6.5rem] w-full min-w-[8rem] flex-col items-center justify-between gap-1 rounded-(--r-lg) border px-2 py-2.5 text-center transition-all duration-300',
    tierRingClass(stats.tier),
    unlocked
      ? 'border-(--border-medium) bg-[color-mix(in_oklab,var(--wing-primary)_12%,transparent)] glow-wing-md'
      : 'border-(--border-faint) bg-(--bg-card) opacity-75',
    preview && 'animate-cascade opacity-100',
    onSelect &&
      'cursor-pointer hover:border-(--border-medium) hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-cyan)',
  );

  const progressLabel = stats.started
    ? stats.quizCount > 0
      ? `${stats.quizzesTried}/${stats.quizCount} questions`
      : `${stats.attempts} answered`
    : stats.quizCount > 0
      ? `${stats.quizCount} Qs`
      : 'Not started';

  const content = (
    <>
      <span
        className={cn(
          'text-3xl leading-none',
          !unlocked && 'opacity-35 grayscale',
        )}
        aria-hidden
      >
        {tile.emoji}
      </span>
      <span
        className={cn(
          'w-full text-center text-[11px] font-bold uppercase leading-snug sm:text-micro',
          unlocked ? 'text-(--text-secondary)' : 'text-(--text-faint)',
        )}
      >
        {tile.shortLabel}
      </span>
      {!preview && (
        <div className="mt-auto w-full space-y-1">
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--bg-card-active)_80%,transparent)]"
            aria-hidden
          >
            <div
              className={cn(
                'h-full rounded-full transition-all',
                stats.started ? 'bg-(--accent-cyan)' : 'w-0 bg-transparent',
              )}
              style={
                stats.started
                  ? { width: `${Math.max(completionPct, stats.quizzesTried > 0 ? 8 : 0)}%` }
                  : undefined
              }
            />
          </div>
          <span className="block text-[9px] font-semibold uppercase tracking-[0.06em] text-(--text-faint)">
            {progressLabel}
          </span>
        </div>
      )}
    </>
  );

  const title = stats.started
    ? `${tile.longLabel} — ${stats.quizzesTried}/${stats.quizCount} questions, ${stats.correct}/${stats.attempts} correct`
    : tile.longLabel;

  if (onSelect) {
    return (
      <button
        type="button"
        data-wing={tile.wingId}
        className={className}
        style={preview && delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
        title={title}
        aria-label={`${tile.longLabel}. ${progressLabel}. Tap to study.`}
        onClick={() => onSelect(tile)}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      data-wing={tile.wingId}
      className={className}
      style={preview && delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
      title={title}
    >
      {content}
    </div>
  );
}

function TileGrid({
  tiles,
  unitProgress,
  preview,
  startDelay = 0,
  onTileSelect,
}: {
  tiles: AchievementTile[];
  unitProgress: Record<string, UnitProgress>;
  preview?: boolean;
  startDelay?: number;
  onTileSelect?: (tile: AchievementTile) => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2.5 sm:gap-3">
      {tiles.map((tile, i) => (
        <Tile
          key={tile.unitId}
          tile={tile}
          progress={unitProgress[tile.unitId]}
          preview={preview}
          delay={preview ? startDelay + i * 80 : undefined}
          onSelect={onTileSelect}
        />
      ))}
    </div>
  );
}

function SectionStudyButton({
  subgroup,
  unitProgress,
  onStudy,
}: {
  subgroup: WingSubgroup;
  unitProgress: Record<string, UnitProgress>;
  onStudy: (subgroup: WingSubgroup) => void;
}) {
  const unitIds = subgroup.tiles.map((t) => t.unitId);
  const stats = summarizeSubgroupProgress(unitIds, unitProgress);
  const completionPct =
    stats.totalQuizCount > 0
      ? Math.round((stats.totalQuizzesTried / stats.totalQuizCount) * 100)
      : 0;
  const scoreLabel =
    stats.totalQuizCount > 0
      ? stats.totalQuizzesTried > 0
        ? `${stats.totalQuizzesTried}/${stats.totalQuizCount} questions · ${stats.totalCorrect}/${stats.totalAttempts} correct`
        : `${stats.totalQuizCount} questions in this section`
      : 'Tap to study this section';

  return (
    <button
      type="button"
      className="mb-3 w-full cursor-pointer rounded-(--r-lg) border border-(--border-light) bg-(--bg-card) px-4 py-3 text-left transition hover:border-(--accent-cyan) hover:bg-[color-mix(in_oklab,var(--accent-cyan)_8%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-cyan)"
      onClick={() => onStudy(subgroup)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-body font-bold text-(--text-primary)">
          Study {subgroup.title}
        </span>
        <span className="text-micro font-bold uppercase tracking-[0.08em] text-(--accent-cyan)">
          {stats.topics} topics
        </span>
      </div>
      <p className="mt-1 text-meta text-(--text-dim)">{scoreLabel}</p>
      <div className="mt-2 flex items-center gap-3">
        <div
          className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-(--bg-card-active)"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-(--accent-cyan) transition-all"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <span className="shrink-0 text-micro font-semibold text-(--text-faint)">
          {stats.totalQuizzesTried}/{stats.totalQuizCount} questions
          {stats.topicsMastered > 0 ? ` · ${stats.topicsMastered} mastered` : ''}
        </span>
      </div>
    </button>
  );
}

export function AchievementGrid({
  unitProgress,
  achievementState,
  preview = false,
  className,
  onTileSelect,
  onEmbarkUnit,
  onSubgroupStudy,
}: AchievementGridProps) {
  const [lockedTile, setLockedTile] = useState<AchievementTile | null>(null);
  const earned = achievementState?.earned ?? {};

  function handleTileClick(tile: AchievementTile) {
    const stats = summarizeTileProgress(tile.unitId, unitProgress[tile.unitId]);
    const unlocked = stats.tier !== 'locked' || unitProgress[tile.unitId]?.achievementEarned;
    if (!unlocked && onEmbarkUnit) {
      setLockedTile(tile);
      return;
    }
    onTileSelect?.(tile);
  }

  const hiddenEarned = Object.keys(HIDDEN_ACHIEVEMENTS)
    .filter((id) => earned[id])
    .map((id) => HIDDEN_ACHIEVEMENTS[id]!);

  return (
    <div className={cn('space-y-8', className)}>
      {hiddenEarned.length > 0 ? (
        <section className="rounded-(--r-lg) border border-(--border-faint) bg-(--bg-card) p-4">
          <h2 className="text-micro font-extrabold uppercase tracking-[0.15em] text-(--text-dim)">
            Discovered
          </h2>
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2.5">
            {hiddenEarned.map((h) => (
              <AggregateTile
                key={h.id}
                emoji={h.emoji}
                shortLabel={h.shortLabel}
                flavor={h.flavor}
              />
            ))}
          </div>
        </section>
      ) : null}

      {WING_GROUPS.map((group) => {
        const wingAgg = AGGREGATE_CATALOG.find(
          (a) => a.scope === 'wing' && a.nodeId === group.wingId,
        );
        const wingAggEarned = wingAgg && earned[wingAgg.id];

        return (
          <section
            key={group.wingId}
            data-wing={group.wingId}
            className="rounded-(--r-lg) border border-(--border-faint) bg-[color-mix(in_oklab,var(--wing-primary)_4%,transparent)] p-4"
          >
            <header className="mb-4 flex items-baseline justify-between gap-3 border-b border-(--border-faint) pb-3">
              <h2 className="text-micro font-extrabold uppercase tracking-[0.15em] text-(--text-dim)">
                <span aria-hidden className="mr-2">{group.emoji}</span>
                {group.title}
              </h2>
              <span className="text-micro text-(--text-faint)">
                {group.tiles.length} units
              </span>
            </header>

            {wingAggEarned && wingAgg ? (
              <div className="mb-4">
                <AggregateTile
                  emoji={wingAgg.emoji}
                  shortLabel={wingAgg.shortLabel}
                  flavor={wingAgg.flavor}
                  large
                />
              </div>
            ) : null}

            {group.subgroups ? (
              <div className="space-y-8">
                {group.subgroups.map((subgroup, subIndex) => {
                  const roomAgg = AGGREGATE_CATALOG.find((a) => a.nodeId === subgroup.id);
                  const roomAggEarned = roomAgg && earned[roomAgg.id];
                  return (
                    <div key={subgroup.id}>
                      <div className="mb-2 flex items-center gap-2">
                        <span aria-hidden className="text-lg">{subgroup.emoji}</span>
                        <h3 className="text-micro font-bold uppercase tracking-[0.12em] text-(--text-faint)">
                          {subgroup.title}
                        </h3>
                      </div>
                      {roomAggEarned && roomAgg ? (
                        <div className="mb-3">
                          <AggregateTile
                            emoji={roomAgg.emoji}
                            shortLabel={roomAgg.shortLabel}
                            flavor={roomAgg.flavor}
                          />
                        </div>
                      ) : null}
                      {onSubgroupStudy && !preview && subgroup.tiles.length > 0 && (
                        <SectionStudyButton
                          subgroup={subgroup}
                          unitProgress={unitProgress}
                          onStudy={onSubgroupStudy}
                        />
                      )}
                      <TileGrid
                        tiles={subgroup.tiles}
                        unitProgress={unitProgress}
                        preview={preview}
                        startDelay={subIndex * 40}
                        onTileSelect={handleTileClick}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <TileGrid
                tiles={group.tiles}
                unitProgress={unitProgress}
                preview={preview}
                onTileSelect={handleTileClick}
              />
            )}
          </section>
        );
      })}

      {lockedTile && onEmbarkUnit ? (
        <LockedTilePopover
          tile={lockedTile}
          onEmbark={() => {
            onEmbarkUnit(lockedTile.unitId);
            setLockedTile(null);
          }}
          onClose={() => setLockedTile(null)}
        />
      ) : null}
    </div>
  );
}
