'use client';

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Map } from 'lucide-react';
import { AchievementGrid } from '@/components/achievements/AchievementGrid';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { CalibrationPanel } from '@/components/journeys/CalibrationPanel';
import { usePageReadAloud } from '@/hooks/use-page-read-aloud';
import { computeMasteryOverview } from '@/engine/progress/coverage';
import { devMark } from '@/lib/dev-mark';
import { useAppStore } from '@/store/app-store';

export const Route = createFileRoute('/journeys/')({
  component: JourneysPage,
});

function JourneysPage() {
  const journeys = useAppStore((s) => s.journeys);
  const calibrationRecords = useAppStore((s) => s.calibrationRecords);
  const unitProgress = useAppStore((s) => s.unitProgress);
  const embarkNewQuest = useAppStore((s) => s.embarkNewQuest);
  const navigate = useNavigate();

  function handleEmbark() {
    const { sessionId } = embarkNewQuest();
    navigate({ to: '/play/$sessionId', params: { sessionId } });
  }

  const overview = computeMasteryOverview(unitProgress);
  const lapLine = `${overview.laps} full ${overview.laps === 1 ? 'lap' : 'laps'} through everything · next lap ${overview.nextLapPct}%`;

  const journeySummary =
    journeys.length === 0
      ? 'No journeys yet.'
      : journeys
          .slice(0, 8)
          .map(
            (j) =>
              `${j.finalScore.correct} of ${j.finalScore.total} correct, best streak ${j.finalScore.bestStreak}`,
          )
          .join('. ');

  usePageReadAloud(
    `Journeys. ${lapLine}. Your study sessions, archived here. Embark a new mix when you are ready. ${journeySummary}`,
  );

  return (
    <main className="page-wrap px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-meta text-(--text-dim) no-underline hover:text-(--text-secondary)"
      >
        <ChevronLeft size={16} />
        Home
      </Link>

      <h1 className="text-display-lg mb-2 font-black text-(--text-primary)">Journeys</h1>
      <p className="mb-2 max-w-(--w-medium) text-body text-(--text-secondary)">
        Your study sessions, archived here. Embark a new mix when you are ready.
      </p>
      <p className="mb-8 text-meta text-(--text-dim)">{lapLine}</p>

      <Card {...devMark('embark')} className="mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-(--accent-cyan)">
              <Map size={18} />
              <span className="font-headline text-headline-md font-bold">Embark</span>
            </div>
            <p className="text-body text-(--text-dim)">
              Start a quick mix from unlocked units.
            </p>
          </div>
          <Button variant="primary" {...devMark('embark.btn')} onClick={handleEmbark} className="sm:min-w-[160px]">
            EMBARK
          </Button>
        </div>
      </Card>

      <section {...devMark('list')} className="mb-12">
        <h2 className="mb-4 text-headline-md font-bold text-(--text-primary)">
          Recent journeys
        </h2>
        {journeys.length === 0 ? (
          <p className="text-body text-(--text-dim)">No completed journeys yet.</p>
        ) : (
          <ul className="space-y-2">
            {journeys.slice(0, 20).map((j) => (
              <li key={j.id}>
                <Link
                  to="/journeys/$id"
                  params={{ id: j.id }}
                  className="block rounded-(--r-lg) border border-(--border-faint) bg-(--bg-card) px-4 py-3 no-underline transition hover:border-(--border-medium)"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-body font-semibold text-(--text-primary)">
                      {j.finalScore.correct}/{j.finalScore.total} correct
                    </span>
                    <span className="text-meta text-(--text-dim)">
                      {new Date(j.endedAt ?? j.startedAt).toLocaleDateString()} ·{' '}
                      {Math.floor(j.elapsedSec / 60)}:
                      {String(j.elapsedSec % 60).padStart(2, '0')}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CalibrationPanel records={calibrationRecords} />

      <section {...devMark('map')}>
        <h2 className="mb-4 text-headline-md font-bold text-(--text-primary)">
          Achievement map
        </h2>
        <AchievementGrid unitProgress={unitProgress} />
      </section>
    </main>
  );
}
