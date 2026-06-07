'use client';

import { useEffect, useMemo } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { AchievementGrid } from '@/components/achievements/AchievementGrid';
import { Button } from '@/components/common/Button';
import { MasteryOverview } from '@/components/home/MasteryOverview';
import { usePageReadAloud } from '@/hooks/use-page-read-aloud';
import {
  BIOLOGY_EOC_SELECTION,
  revisitSelection,
  sectionStudySelection,
} from '@/content/catalog';
import type { WingSubgroup } from '@/content/catalog';
import { computeMasteryOverview } from '@/engine/progress/coverage';
import { devMark } from '@/lib/dev-mark';
import { useAppStore } from '@/store/app-store';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const hydrated = useAppStore((s) => s.hydrated);
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const unitProgress = useAppStore((s) => s.unitProgress);
  const achievementState = useAppStore((s) => s.achievementState);
  const sessionState = useAppStore((s) => s.sessionState);
  const completeFirstRun = useAppStore((s) => s.completeFirstRun);
  const firstRunCompleted = useAppStore((s) => s.firstRunCompleted);
  const embarkNewQuest = useAppStore((s) => s.embarkNewQuest);

  const overview = useMemo(
    () => (hydrated ? computeMasteryOverview(unitProgress) : null),
    [hydrated, unitProgress],
  );

  useEffect(() => {
    if (hydrated && !firstRunCompleted) {
      completeFirstRun();
    }
  }, [hydrated, firstRunCompleted, completeFirstRun]);

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

  function handleRevisit() {
    const length = settings.practice.revisitLength;
    const { sessionId } = embarkNewQuest(revisitSelection(length));
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

  const lapSummary = overview
    ? `${overview.totalLapsLabel} laps through everything. Next lap ${overview.nextLapPct} percent.`
    : '';

  const readText = resumeSession
    ? `Home. ${lapSummary} Continue your next lap to advance coverage, or continue an in-progress session. Study bars and topic tiles drill one section or unit.`
    : `Home. ${lapSummary} Continue your next lap to work toward the next full pass. Study bars and topic tiles drill one section or unit.`;

  usePageReadAloud(readText);

  return (
    <main className="page-wrap flex h-[calc(100dvh-var(--app-header-h))] max-h-[calc(100dvh-var(--app-header-h))] flex-col px-4 pt-4">
      <section
        {...devMark('scroll')}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-4 [-webkit-overflow-scrolling:touch]"
        aria-label="Study overview"
      >
        {hydrated ? (
          <>
            <MasteryOverview
              unitProgress={unitProgress}
              achievementState={achievementState}
              settings={settings}
              onRevisitLengthChange={(revisitLength) =>
                setSettings({ practice: { ...settings.practice, revisitLength } })
              }
            />
            <p className="mb-4 text-meta leading-relaxed text-(--text-dim)">
              Use the wide <span className="font-bold text-(--text-secondary)">Study</span> bar
              on each section, or tap a topic tile. Tiles show how many questions you&apos;ve done
              out of the total in each topic.
            </p>
            <AchievementGrid
              unitProgress={unitProgress}
              achievementState={achievementState}
              onTileSelect={(tile) => handleTileEmbark(tile.unitId)}
              onEmbarkUnit={handleTileEmbark}
              onSubgroupStudy={handleSectionStudy}
            />
          </>
        ) : (
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-(--r-lg) bg-(--bg-card)" />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[6.5rem] min-w-[8rem] animate-pulse rounded-(--r-lg) bg-(--bg-card)"
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <div
        {...devMark('dock')}
        className="glass-md glass-bg-dock shrink-0 border-t border-(--border-faint) pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <section className="mx-auto flex flex-row flex-wrap gap-2">
          {resumeSession ? (
            <>
              <Button
                variant="primary"
                className="min-w-[9rem] flex-1"
                {...devMark('revisit')}
                onClick={handleRevisit}
              >
                NEXT LAP
              </Button>
              <Button
                variant="secondary"
                className="min-w-[9rem] flex-1"
                {...devMark('cont')}
                onClick={handleContinue}
              >
                CONTINUE
              </Button>
              <Button
                variant="secondary"
                className="min-w-[9rem] flex-1"
                {...devMark('new')}
                onClick={handleNewQuest}
              >
                NEW QUEST
              </Button>
              <Button
                variant="secondary"
                className="min-w-[7rem] flex-1"
                {...devMark('eoc')}
                onClick={handleEocReview}
              >
                FULL EOC REVIEW
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                className="min-w-[9rem] flex-1"
                {...devMark('revisit')}
                onClick={handleRevisit}
              >
                NEXT LAP
              </Button>
              <Button
                variant="secondary"
                className="min-w-[9rem] flex-1"
                {...devMark('new')}
                onClick={handleNewQuest}
              >
                NEW QUEST
              </Button>
              <Button
                variant="secondary"
                className="min-w-[9rem] flex-1"
                {...devMark('eoc')}
                onClick={handleEocReview}
              >
                FULL EOC REVIEW
              </Button>
            </>
          )}
        </section>

        <footer {...devMark('nav')} className="mt-4 text-center sm:mt-6">
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
            <Link
              to="/about"
              {...devMark('aboutlnk')}
              className="text-(--text-dim) no-underline hover:text-(--text-secondary)"
            >
              About
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
