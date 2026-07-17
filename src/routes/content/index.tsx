'use client';

import { Link, createFileRoute } from '@tanstack/react-router';
import { ChevronRight, Package } from 'lucide-react';
import { BackLink } from '@/components/common/BackLink';
import { Card } from '@/components/common/Card';
import { CONTENT_MODULES } from '@/content';
import { flattenUnits } from '@/engine/world';
import { usePageReadAloud } from '@/tts';
import { devMark } from '@/lib/dev-mark';

export const Route = createFileRoute('/content/')({
  component: ContentPage,
});

const LINKS = [
  { to: '/content/import', label: 'Import backup' },
  { to: '/content/stats', label: 'Per-branch stats' },
  { to: '/content/format', label: 'Format reference' },
  { to: '/content/modules', label: 'Module list' },
] as const;

function ContentPage() {
  const moduleList = CONTENT_MODULES.map(
    (mod) => `${mod.title}. ${mod.description}`,
  ).join(' ');

  usePageReadAloud(
    `Content. Manage bundled modules, import backups, and view authoring formats. ${moduleList}`,
  );

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8">
      <BackLink />

      <h1 className="text-display-lg mb-2 font-black">Content</h1>
      <p className="mb-8 text-body text-(--text-secondary)">
        Manage bundled modules, import backups, and view authoring formats.
      </p>

      <section {...devMark('modules')} className="mb-8">
        <h2 className="mb-4 text-headline-md font-bold">Modules</h2>
        <ul className="space-y-3">
          {CONTENT_MODULES.map((mod) => (
            <li key={mod.id}>
              <Card className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--r-lg) bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)] text-(--accent-cyan)">
                  <Package size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-body font-bold text-(--text-primary)">{mod.title}</h3>
                    <span className="rounded-(--r-full) bg-(--bg-card-active) px-2 py-0.5 text-micro uppercase text-(--text-dim)">
                      bundled
                    </span>
                  </div>
                  <p className="mt-1 text-meta text-(--text-dim)">{mod.description}</p>
                  <p className="mt-2 text-micro text-(--text-faint)">
                    {flattenUnits([mod]).length} units · {mod.id}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section {...devMark('manage')}>
        <h2 className="mb-4 text-headline-md font-bold">Manage</h2>
        <ul className="space-y-2">
          {LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="flex items-center justify-between rounded-(--r-lg) border border-(--border-faint) bg-(--bg-card) px-4 py-3 text-body font-semibold text-(--text-primary) no-underline hover:border-(--border-medium)"
              >
                {link.label}
                <ChevronRight size={18} className="text-(--text-faint)" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
