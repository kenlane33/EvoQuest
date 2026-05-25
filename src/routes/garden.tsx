'use client';

import { createFileRoute } from '@tanstack/react-router';
import { BackLink } from '@/components/common/BackLink';
import { Card } from '@/components/common/Card';
import { EtymologyCard } from '@/components/etymology/EtymologyCard';
import { CONTENT_MODULES } from '@/content';
import { flattenUnits } from '@/engine/world';
import { usePageReadAloud } from '@/hooks/use-page-read-aloud';
import { devMark } from '@/lib/dev-mark';
import { useAppStore } from '@/store/app-store';

export const Route = createFileRoute('/garden')({
  component: GardenPage,
});

function GardenPage() {
  const unitProgress = useAppStore((s) => s.unitProgress);

  const morphemes = flattenUnits(CONTENT_MODULES)
    .filter((u) => u.teach.etymology)
    .map((u) => ({
      unitId: u.id,
      term: u.teach.etymology!.term,
      root: u.teach.etymology!.rootSummary,
      seen: Boolean(unitProgress[u.id]?.templatesEncountered.length),
    }));

  const discovered = morphemes.filter((m) => m.seen);

  const readText =
    discovered.length === 0
      ? 'Etymology garden. Roots you have encountered bloom here as you study. No roots discovered yet. Answer questions to grow the garden.'
      : `Etymology garden. ${discovered.length} roots discovered. ${discovered.map((m) => `${m.term}: ${m.root}`).join('. ')}`;

  usePageReadAloud(readText);

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8">
      <BackLink />
      <h1 className="text-display-lg mb-2 font-black">Etymology garden</h1>
      <p className="mb-8 text-body text-(--text-secondary)">
        Roots you have encountered bloom here as you study.
      </p>

      {discovered.length === 0 ? (
        <Card {...devMark('empty')} variant="hint">
          <p className="text-body text-(--text-secondary)">
            No roots discovered yet. Answer questions to grow the garden.
          </p>
        </Card>
      ) : (
        <ul {...devMark('roots')} className="space-y-4">
          {discovered.map((m) => (
            <li key={m.unitId}>
              <Card>
                <div className="mb-2 text-body font-bold text-(--text-primary)">{m.term}</div>
                <EtymologyCard root={m.root} compact />
              </Card>
            </li>
          ))}
        </ul>
      )}

      {morphemes.length > discovered.length ? (
        <p className="mt-8 text-meta text-(--text-dim)">
          {discovered.length} of {morphemes.length} roots discovered
        </p>
      ) : null}
    </main>
  );
}
