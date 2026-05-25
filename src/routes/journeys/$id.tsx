'use client';

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { BackLink } from '@/components/common/BackLink';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { getUnitById } from '@/content/catalog';
import { usePageReadAloud } from '@/hooks/use-page-read-aloud';
import { devMark } from '@/lib/dev-mark';
import { useAppStore } from '@/store/app-store';

export const Route = createFileRoute('/journeys/$id')({
  component: JourneyDetailPage,
});

function JourneyDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const journeys = useAppStore((s) => s.journeys);
  const embarkNewQuest = useAppStore((s) => s.embarkNewQuest);
  const journey = journeys.find((j) => j.id === id);

  const readText = journey
    ? `Journey. ${journey.finalScore.correct} of ${journey.finalScore.total} correct. Best streak ${journey.finalScore.bestStreak}. ${journey.abandoned ? 'Abandoned.' : ''}`
    : 'Journey not found.';

  usePageReadAloud(readText);

  if (!journey) {
    return (
      <main className="page-wrap max-w-(--w-medium) px-4 py-8">
        <BackLink to="/journeys" label="Journeys" />
        <p className="text-body text-(--text-dim)">Journey not found.</p>
      </main>
    );
  }

  const pct =
    journey.finalScore.total > 0
      ? Math.round((journey.finalScore.correct / journey.finalScore.total) * 100)
      : 0;

  function reEmbark() {
    if (!journey) return;
    const { sessionId } = embarkNewQuest(journey.selection);
    navigate({ to: '/play/$sessionId', params: { sessionId } });
  }

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8">
      <BackLink to="/journeys" label="Journeys" />

      <h1 className="text-display-lg mb-2 font-black">Journey</h1>
      <p className="mb-6 text-body text-(--text-secondary)">
        {new Date(journey.endedAt ?? journey.startedAt).toLocaleString()} ·{' '}
        {Math.floor(journey.elapsedSec / 60)}:
        {String(journey.elapsedSec % 60).padStart(2, '0')}
      </p>

      <Card {...devMark('score')} className="mb-8">
        <div className="text-display-md font-black text-(--accent-cyan)">{pct}%</div>
        <p className="text-body text-(--text-secondary)">
          {journey.finalScore.correct}/{journey.finalScore.total} correct · best streak{' '}
          {journey.finalScore.bestStreak}
        </p>
        {journey.abandoned ? (
          <p className="mt-2 text-meta text-(--status-wrong)">Abandoned</p>
        ) : null}
      </Card>

      <section {...devMark('attempts')} className="mb-8">
        <h2 className="mb-4 text-headline-md font-bold">Attempts</h2>
        <ul className="space-y-2">
          {journey.attempts.map((a) => {
            const unit = getUnitById(a.unitId);
            return (
              <li
                key={a.attemptId}
                className="flex items-center justify-between gap-2 rounded-(--r-lg) border border-(--border-faint) bg-(--bg-card) px-4 py-3"
              >
                <span className="text-body text-(--text-primary)">
                  {unit?.achievement.shortLabel ?? a.unitId}
                </span>
                <span
                  className={
                    a.correct ? 'text-(--status-correct)' : 'text-(--status-wrong)'
                  }
                >
                  {a.correct ? '✓' : '✗'}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {journey.achievementsEarned.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-4 text-headline-md font-bold">New achievements</h2>
          <p className="text-body text-(--text-secondary)">
            {journey.achievementsEarned.length} tile(s) unlocked this session.
          </p>
        </section>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button variant="primary" fullWidth {...devMark('reembark')} onClick={reEmbark}>
          RE-EMBARK
        </Button>
        <Link to="/journeys" className="text-center text-meta text-(--text-dim) no-underline">
          Back to journeys
        </Link>
      </div>
    </main>
  );
}
