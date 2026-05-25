'use client';

import { createFileRoute } from '@tanstack/react-router';
import { Package } from 'lucide-react';
import { BackLink } from '@/components/common/BackLink';
import { Card } from '@/components/common/Card';
import { CONTENT_MODULES } from '@/content';
import { flattenUnits } from '@/engine/world';
import { usePageReadAloud } from '@/hooks/use-page-read-aloud';
import { devMark } from '@/lib/dev-mark';

export const Route = createFileRoute('/content/modules')({
  component: ContentModulesPage,
});

function ContentModulesPage() {
  const moduleText = CONTENT_MODULES.map(
    (mod) => `${mod.title}. ${mod.description}. ${flattenUnits([mod]).length} units.`,
  ).join(' ');

  usePageReadAloud(`Modules. Bundled content modules registered in the app. ${moduleText}`);

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8">
      <BackLink to="/content" label="Content" />
      <h1 className="text-display-lg mb-2 font-black">Modules</h1>
      <p className="mb-8 text-body text-(--text-secondary)">
        Bundled content modules registered in the app.
      </p>

      <ul {...devMark('list')} className="space-y-3">
        {CONTENT_MODULES.map((mod) => (
          <li key={mod.id}>
            <Card className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--r-lg) bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)] text-(--accent-cyan)">
                <Package size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-body font-bold text-(--text-primary)">{mod.title}</h3>
                <p className="mt-1 text-meta text-(--text-dim)">{mod.description}</p>
                <p className="mt-2 text-micro text-(--text-faint)">
                  {flattenUnits([mod]).length} units · {mod.id}
                </p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
