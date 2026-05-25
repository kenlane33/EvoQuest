'use client';

import { useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { BackLink } from '@/components/common/BackLink';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { usePageReadAloud } from '@/hooks/use-page-read-aloud';
import { devMark } from '@/lib/dev-mark';
import { useAppStore } from '@/store/app-store';

export const Route = createFileRoute('/content/import')({
  component: ContentImportPage,
});

function ContentImportPage() {
  const importAllData = useAppStore((s) => s.importAllData);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  usePageReadAloud(
    'Import. Restore progress from an export file. Your current data is backed up before import.',
  );

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importAllData(String(reader.result));
      setMessage(ok ? 'Import successful.' : 'Import failed — invalid file.');
    };
    reader.readAsText(file);
  }

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8">
      <BackLink to="/content" label="Content" />
      <h1 className="text-display-lg mb-2 font-black">Import</h1>
      <p className="mb-8 text-body text-(--text-secondary)">
        Restore progress from an export file. Your current data is backed up before import.
      </p>

      <Card {...devMark('pick')} className="mb-6">
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <Button variant="primary" onClick={() => fileRef.current?.click()}>
          Choose JSON file
        </Button>
        {message ? <p className="mt-4 text-body text-(--text-secondary)">{message}</p> : null}
      </Card>
    </main>
  );
}
