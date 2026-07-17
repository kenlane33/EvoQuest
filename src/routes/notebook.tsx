'use client';

import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { BackLink } from '@/components/common/BackLink';
import { Card } from '@/components/common/Card';
import { loadKey } from '@/storage/reader';
import { STORAGE_KEYS } from '@/storage/keys';
import type { LabArtifact } from '@/types';
import { usePageReadAloud } from '@/tts';
import { devMark } from '@/lib/dev-mark';

export const Route = createFileRoute('/notebook')({
  component: NotebookPage,
});

function NotebookPage() {
  const [artifacts, setArtifacts] = useState<LabArtifact[]>([]);

  useEffect(() => {
    const result = loadKey<LabArtifact[]>(STORAGE_KEYS.NOTEBOOK);
    setArtifacts(result.ok ? result.value : []);
  }, []);

  const readText =
    artifacts.length === 0
      ? 'Lab notebook. Artifacts you build during play, Punnett grids, concept maps, procedures, saved here. Nothing saved yet.'
      : `Lab notebook. ${artifacts.length} saved artifacts. ${artifacts.map((a) => a.title).join('. ')}`;

  usePageReadAloud(readText);

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8">
      <BackLink />
      <h1 className="text-display-lg mb-2 font-black">Lab notebook</h1>
      <p className="mb-8 text-body text-(--text-secondary)">
        Artifacts you build during play — Punnett grids, concept maps, procedures — saved here.
      </p>

      {artifacts.length === 0 ? (
        <Card {...devMark('empty')} variant="hint">
          <p className="text-body text-(--text-secondary)">
            Nothing saved yet. Complete construction-style questions and your work appears here.
          </p>
        </Card>
      ) : (
        <ul {...devMark('list')} className="space-y-3">
          {artifacts.map((a) => (
            <li key={a.id}>
              <Card>
                <div className="text-body font-bold text-(--text-primary)">{a.title}</div>
                <p className="mt-1 text-meta text-(--text-dim)">
                  {a.kind} · {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
