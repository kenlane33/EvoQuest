'use client';

import type { PowerUpInstance } from '@/types';
import { getPowerUpCopy } from '@/engine/powerups/catalog';

type JourneyGainsPanelProps = {
  achievementsEarned: string[];
  powerupsEarned: PowerUpInstance[];
  morphemesTouchedFirst: string[];
  tierUps: Array<{ unitId: string; tier: string }>;
};

export function JourneyGainsPanel({
  achievementsEarned,
  powerupsEarned,
  morphemesTouchedFirst,
  tierUps,
}: JourneyGainsPanelProps) {
  const hasGains =
    achievementsEarned.length > 0 ||
    powerupsEarned.length > 0 ||
    morphemesTouchedFirst.length > 0 ||
    tierUps.length > 0;

  if (!hasGains) return null;

  return (
    <div className="mt-6 rounded-(--r-lg) border border-(--border-faint) bg-(--bg-card) p-4 text-left">
      <h3 className="text-micro font-extrabold uppercase tracking-[0.12em] text-(--text-dim)">
        What you gained
      </h3>
      <ul className="mt-3 space-y-2 text-body text-(--text-secondary)">
        {achievementsEarned.length > 0 ? (
          <li>
            <span className="font-semibold text-(--text-primary)">
              {achievementsEarned.length}
            </span>{' '}
            achievement{achievementsEarned.length === 1 ? '' : 's'} earned
          </li>
        ) : null}
        {tierUps.length > 0 ? (
          <li>
            <span className="font-semibold text-(--text-primary)">{tierUps.length}</span>{' '}
            topic{tierUps.length === 1 ? '' : 's'} leveled up
          </li>
        ) : null}
        {powerupsEarned.length > 0 ? (
          <li className="flex flex-wrap items-center gap-2">
            <span>
              <span className="font-semibold text-(--text-primary)">
                {powerupsEarned.length}
              </span>{' '}
              power-up{powerupsEarned.length === 1 ? '' : 's'}:
            </span>
            {powerupsEarned.map((pu, i) => {
              const copy = getPowerUpCopy(pu);
              return (
                <span
                  key={`${pu.id}-${i}`}
                  className="text-xl"
                  title={copy ? `${copy.title}: ${copy.summary}` : undefined}
                  aria-label={copy?.title ?? 'Power-up'}
                >
                  {copy?.icon ?? '✨'}
                </span>
              );
            })}
          </li>
        ) : null}
        {morphemesTouchedFirst.length > 0 ? (
          <li>
            <span className="font-semibold text-(--text-primary)">
              {morphemesTouchedFirst.length}
            </span>{' '}
            new root{morphemesTouchedFirst.length === 1 ? '' : 's'} in the garden
          </li>
        ) : null}
      </ul>
    </div>
  );
}
