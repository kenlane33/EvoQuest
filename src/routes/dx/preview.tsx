'use client';

import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Figure } from '@/components/content/Figure';
import { Card } from '@/components/common/Card';
import { cn } from '@/lib/cn';
import {
  buildDiagramPreviewCatalog,
  groupPreviewByFigure,
  type PreviewItem,
  type PreviewItemStatus,
} from '@/lib/dx/preview-items';
import { devMark } from '@/lib/dev-mark';

export const Route = createFileRoute('/dx/preview')({
  component: DxPreviewPage,
});

type Filter = 'all' | PreviewItemStatus;

function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded border border-(--border-light) bg-(--bg-card-hi) px-2 py-1 font-mono text-[11px] text-(--accent-cyan) transition hover:border-(--accent-cyan)"
      title="Copy ID to paste for approval"
    >
      {copied ? 'Copied' : 'Copy ID'}
    </button>
  );
}

function PreviewCard({ item }: { item: PreviewItem }) {
  return (
    <Card
      {...devMark(`dx.${item.id}`)}
      className={cn(
        'scroll-mt-28 border-l-4',
        item.status === 'shipped'
          ? 'border-l-(--status-correct)'
          : 'border-l-(--accent-violet)',
      )}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <code className="block break-all font-mono text-[12px] text-(--accent-cyan)">{item.id}</code>
          <p className="text-meta text-(--text-dim)">
            {item.sectionTitle} · {item.unitTitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]',
              item.status === 'shipped'
                ? 'bg-[color-mix(in_oklab,var(--status-correct)_18%,transparent)] text-(--status-correct)'
                : 'bg-[color-mix(in_oklab,var(--accent-violet)_18%,transparent)] text-(--accent-violet)',
            )}
          >
            {item.status}
          </span>
          <CopyIdButton id={item.id} />
        </div>
      </div>

      <Figure src={item.figureSrc} alt={item.figureAlt} className="my-3" />

      <div className="space-y-2 text-body">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-(--text-faint)">
          {item.templateKind}
          {item.showsFigureInPlay ? ' · figure shows in play' : ' · figure teach-only today'}
        </p>
        <p className="leading-relaxed text-(--text-primary)">{item.prompt}</p>
        <p className="text-body font-semibold text-(--status-correct)">
          A: {item.answers.join(' · ')}
        </p>
        {item.ocrRef ? (
          <p className="text-meta text-(--text-dim)">OCR: {item.ocrRef}</p>
        ) : null}
        {item.notes ? (
          <p className="text-meta italic text-(--text-dim)">{item.notes}</p>
        ) : null}
      </div>
    </Card>
  );
}

function DxPreviewPage() {
  const catalog = useMemo(() => buildDiagramPreviewCatalog(), []);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return catalog.items;
    return catalog.items.filter((item) => item.status === filter);
  }, [catalog.items, filter]);

  const grouped = useMemo(() => groupPreviewByFigure(filtered), [filtered]);

  async function copyAllIds() {
    const ids = filtered.map((item) => item.id).join('\n');
    try {
      await navigator.clipboard.writeText(ids);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8 pb-24">
      <header {...devMark('dx.preview.hdr')} className="mb-8 space-y-4">
        <p className="text-micro font-bold uppercase tracking-[0.12em] text-(--accent-violet)">
          DX · Preview new items
        </p>
        <h1 className="text-display-lg font-black text-(--text-primary)">
          Diagram questions — review &amp; approve
        </h1>
        <p className="max-w-(--w-narrow) text-body leading-relaxed text-(--text-secondary)">
          Every diagram-linked question on one page. Copy an ID and paste it in chat to approve
          (e.g. <code className="text-(--accent-cyan)">proposed.quiz.biochem.cells.diagram.cell-wall</code>
          {' '}or shipped IDs to confirm). Proposed items are not in play yet.
        </p>

        <div className="flex flex-wrap gap-2 text-meta">
          <span className="rounded-(--r-lg) border border-(--border-light) px-3 py-1">
            {catalog.shippedCount} shipped
          </span>
          <span className="rounded-(--r-lg) border border-(--border-light) px-3 py-1">
            {catalog.proposedCount} proposed
          </span>
          <span className="rounded-(--r-lg) border border-(--border-light) px-3 py-1">
            {catalog.figureCount} figures
          </span>
          <span className="rounded-(--r-lg) border border-(--border-light) px-3 py-1">
            {catalog.items.length} total Q/A
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'shipped', 'proposed'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                'cursor-pointer rounded-(--r-lg) border px-3 py-1.5 text-micro font-bold uppercase tracking-[0.08em] transition',
                filter === key
                  ? 'border-(--accent-cyan) bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)] text-(--accent-cyan)'
                  : 'border-(--border-light) text-(--text-dim) hover:border-(--border-medium)',
              )}
            >
              {key}
            </button>
          ))}
          <button
            type="button"
            onClick={copyAllIds}
            className="cursor-pointer rounded-(--r-lg) border border-(--border-light) px-3 py-1.5 text-micro font-bold uppercase tracking-[0.08em] text-(--text-secondary) transition hover:border-(--accent-cyan)"
          >
            Copy all visible IDs
          </button>
        </div>
      </header>

      <div className="space-y-12">
        {[...grouped.entries()].map(([figureId, items]) => (
          <section key={figureId} {...devMark(`dx.fig.${figureId}`)}>
            <h2 className="mb-4 border-b border-(--border-faint) pb-2 font-mono text-body font-bold text-(--text-primary)">
              {items[0]?.figureSrc.split('/').pop() ?? `${figureId}.svg`}
              <span className="ml-2 text-meta font-normal text-(--text-faint)">
                ({items.length} question{items.length === 1 ? '' : 's'})
              </span>
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <PreviewCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
