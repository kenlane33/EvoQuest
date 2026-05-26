'use client';

import { useEffect } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { AchievementGrid } from '@/components/achievements/AchievementGrid';
import { Button } from '@/components/common/Button';
import { usePageReadAloud } from '@/hooks/use-page-read-aloud';
import { BIOLOGY_EOC_SELECTION, sectionStudySelection } from '@/content/catalog';
import type { WingSubgroup } from '@/content/catalog';
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

  function handleEocReview() {
    const { sessionId } = embarkNewQuest(BIOLOGY_EOC_SELECTION);
    navigate({ to: '/play/$sessionId', params: { sessionId } });
  }

  function handleTileEmbark(unitId: string) {
    const { sessionId } = embarkNewQuest({ kind: 'branch', nodeId: unitId });
    navigate({ to: '/play/$sessionId', params: { sessionId } });
  }

  function handleSectionStudy(subgroup: WingSubgroup) {
    const { sessionId } = embarkNewQuest(sectionStudySelection(subgroup.id));
    navigate({ to: '/play/$sessionId', params: { sessionId } });
  }

  const readText = resumeSession
    ? 'Home. Tap Study on a section or a topic tile to review. Progress shows on each tile. Continue your quest if one is in progress.'
    : 'Home. Tap Study on a section for that portion of the workbook, or tap a topic tile to drill one unit. Each tile shows your question progress.';

  usePageReadAloud(readText);

  return (
    <main className="page-wrap flex h-[calc(100dvh-var(--app-header-h))] max-h-[calc(100dvh-var(--app-header-h))] flex-col px-4 pt-4">
      <section
        {...devMark('grid')}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-4 [-webkit-overflow-scrolling:touch]"
        aria-label="Achievements"
      >
        {hydrated ? (
          <>
            <p className="mb-4 text-meta leading-relaxed text-(--text-dim)">
              Use the wide <span className="font-bold text-(--text-secondary)">Study</span> bar
              on each section, or tap a topic tile. Tiles show how many questions you&apos;ve done
              out of the total in each topic.
            </p>
            <AchievementGrid
              unitProgress={unitProgress}
              onTileSelect={(tile) => handleTileEmbark(tile.unitId)}
              onSubgroupStudy={handleSectionStudy}
            />
          </>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="min-h-[6.5rem] min-w-[8rem] animate-pulse rounded-(--r-lg) bg-(--bg-card)"
              />
            ))}
          </div>
        )}
      </section>

      <div
        {...devMark('dock')}
        className="shrink-0 border-t border-(--border-faint) bg-[color-mix(in_oklab,var(--bg-deep)_94%,transparent)] pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md"
      >
        <section className="mx-auto flex max-w-(--w-narrow) flex-row flex-wrap gap-2">
          {resumeSession ? (
            <>
              <Button variant="secondary" className="min-w-[9rem] flex-1" {...devMark('new')} onClick={handleNewQuest}>
                NEW QUEST
              </Button>
              <Button variant="primary" className="min-w-[9rem] flex-1" {...devMark('cont')} onClick={handleContinue}>
                CONTINUE
              </Button>
              <Button variant="secondary" className="min-w-[9rem] flex-1" {...devMark('eoc')} onClick={handleEocReview}>
                FULL EOC REVIEW
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" className="min-w-[9rem] flex-1" {...devMark('new')} onClick={handleNewQuest}>
                NEW QUEST
              </Button>
              <Button variant="secondary" className="min-w-[9rem] flex-1" {...devMark('eoc')} onClick={handleEocReview}>
                FULL EOC REVIEW
              </Button>
            </>
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
