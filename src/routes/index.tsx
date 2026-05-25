'use client';

import { useEffect } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { AchievementGrid } from '@/components/achievements/AchievementGrid';
import { Button } from '@/components/common/Button';
import { usePageReadAloud } from '@/hooks/use-page-read-aloud';
import { devMark } from '@/lib/dev-mark';
import { useAppStore } from '@/store/app-store';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const hydrated = useAppStore((s) => s.hydrated);
  const unitProgress = useAppStore((s) => s.unitProgress);
  const sessionState = useAppStore((s) => s.sessionState);
  const firstRunCompleted = useAppStore((s) => s.firstRunCompleted);
  const embarkNewQuest = useAppStore((s) => s.embarkNewQuest);

  useEffect(() => {
    if (hydrated && !firstRunCompleted) {
      navigate({ to: '/welcome' });
    }
  }, [hydrated, firstRunCompleted, navigate]);

  const hasResume =
    sessionState.phase === 'brief' ||
    sessionState.phase === 'play' ||
    sessionState.phase === 'feedback' ||
    sessionState.phase === 'paused';

  const resumeSession =
    hasResume && 'session' in sessionState ? sessionState.session : null;

  function handleContinue() {
    if (resumeSession) {
      navigate({ to: '/play/$sessionId', params: { sessionId: resumeSession.journeyId } });
    }
  }

  function handleNewQuest() {
    const { sessionId } = embarkNewQuest();
    navigate({ to: '/play/$sessionId', params: { sessionId } });
  }

  const readText = resumeSession
    ? 'Home. Your biology achievement grid. Continue your quest in progress, or start a new one.'
    : 'Home. Your biology achievement grid. Start a new quest when you are ready.';

  usePageReadAloud(readText);

  return (
    <main className="page-wrap flex h-[calc(100dvh-var(--app-header-h))] max-h-[calc(100dvh-var(--app-header-h))] flex-col px-4 pt-4">
      <section
        {...devMark('grid')}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-4 [-webkit-overflow-scrolling:touch]"
        aria-label="Achievements"
      >
        {hydrated ? (
          <AchievementGrid unitProgress={unitProgress} />
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-(--r-lg) bg-(--bg-card)"
              />
            ))}
          </div>
        )}
      </section>

      <div
        {...devMark('dock')}
        className="shrink-0 border-t border-(--border-faint) bg-[color-mix(in_oklab,var(--bg-deep)_94%,transparent)] pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md"
      >
        <section className="mx-auto flex max-w-(--w-narrow) flex-col gap-3">
          {resumeSession ? (
            <>
              <Button variant="primary" fullWidth {...devMark('cont')} onClick={handleContinue}>
                CONTINUE
              </Button>
              <Button variant="secondary" fullWidth {...devMark('new')} onClick={handleNewQuest}>
                NEW QUEST
              </Button>
            </>
          ) : (
            <Button variant="primary" fullWidth {...devMark('new')} onClick={handleNewQuest}>
              NEW QUEST
            </Button>
          )}
        </section>

        <footer {...devMark('nav')} className="mt-4 space-y-4 text-center sm:mt-6 sm:space-y-6">
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-meta uppercase tracking-[0.1em] sm:gap-x-4">
            <Link to="/journeys" className="text-(--text-dim) no-underline hover:text-(--text-secondary)">
              Journeys
            </Link>
            <Link to="/content" className="text-(--text-dim) no-underline hover:text-(--text-secondary)">
              Content
            </Link>
            <Link to="/notebook" className="text-(--text-dim) no-underline hover:text-(--text-secondary)">
              Notebook
            </Link>
            <Link to="/garden" className="text-(--text-dim) no-underline hover:text-(--text-secondary)">
              Garden
            </Link>
          </nav>
          <Link
            to="/about"
            {...devMark('aboutlnk')}
            className="block text-meta uppercase tracking-[0.12em] text-(--text-dim) no-underline hover:text-(--text-secondary)"
          >
            What is this?
          </Link>
        </footer>
      </div>
    </main>
  );
}
