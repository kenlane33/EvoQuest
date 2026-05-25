'use client';

import { createFileRoute } from '@tanstack/react-router';
import { BackLink } from '@/components/common/BackLink';
import { Card } from '@/components/common/Card';
import { getUnitById } from '@/content/catalog';
import { isTrouble } from '@/engine/scoring';
import { usePageReadAloud } from '@/hooks/use-page-read-aloud';
import { devMark } from '@/lib/dev-mark';
import { useAppStore } from '@/store/app-store';

export const Route = createFileRoute('/content/stats')({
  component: ContentStatsPage,
});

function ContentStatsPage() {
  const unitProgress = useAppStore((s) => s.unitProgress);
  const entries = Object.values(unitProgress).filter((p) => p.attempts > 0);

  const trouble = entries.filter((p) => isTrouble(p));
  const mastered = entries.filter((p) => p.tier === 'gold' || p.tier === 'silver');

  usePageReadAloud(
    `Stats. Per-unit progress from your local study history. ${entries.length} units touched. ${mastered.length} mastered. ${trouble.length} need review.`,
  );

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8">
      <BackLink to="/content" label="Content" />
      <h1 className="text-display-lg mb-2 font-black">Stats</h1>
      <p className="mb-8 text-body text-(--text-secondary)">
        Per-unit progress from your local study history.
      </p>

      <div {...devMark('summary')} className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-display-md font-black text-(--accent-cyan)">{entries.length}</div>
          <p className="text-meta text-(--text-dim)">Units touched</p>
        </Card>
        <Card>
          <div className="text-display-md font-black text-(--status-streak)">{mastered.length}</div>
          <p className="text-meta text-(--text-dim)">Silver or gold</p>
        </Card>
        <Card>
          <div className="text-display-md font-black text-(--status-wrong)">{trouble.length}</div>
          <p className="text-meta text-(--text-dim)">Need review</p>
        </Card>
      </div>

      {trouble.length > 0 ? (
        <section>
          <h2 className="mb-4 text-headline-md font-bold">Trouble units</h2>
          <ul className="space-y-2">
            {trouble.map((p) => {
              const unit = getUnitById(p.unitId);
              return (
                <li
                  key={p.unitId}
                  className="rounded-(--r-lg) border border-(--border-faint) bg-(--bg-card) px-4 py-3 text-body"
                >
                  {unit?.title ?? p.unitId} — {p.correct}/{p.attempts} correct
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <Card variant="hint">
          <p className="text-body text-(--text-secondary)">No trouble units yet — keep studying.</p>
        </Card>
      )}
    </main>
  );
}
