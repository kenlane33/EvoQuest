'use client';

import { createFileRoute } from '@tanstack/react-router';
import { BackLink } from '@/components/common/BackLink';
import { Card } from '@/components/common/Card';
import '@/engine/templates';
import { REGISTRY } from '@/engine/templates/registry';
import { usePageReadAloud } from '@/hooks/use-page-read-aloud';
import { devMark } from '@/lib/dev-mark';

export const Route = createFileRoute('/content/format')({
  component: ContentFormatPage,
});

function ContentFormatPage() {
  const kinds = Object.values(REGISTRY);
  const kindText = kinds.map((reg) => `${reg.kind}. ${reg.describePrompt(reg.exemplar)}`).join(' ');

  usePageReadAloud(
    `Formats. Registered question templates available to content authors. ${kindText}`,
  );

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8">
      <BackLink to="/content" label="Content" />
      <h1 className="text-display-lg mb-2 font-black">Formats</h1>
      <p className="mb-8 text-body text-(--text-secondary)">
        Registered question templates available to content authors.
      </p>

      <ul {...devMark('list')} className="space-y-4">
        {kinds.map((reg) => (
          <li key={reg.kind}>
            <Card>
              <div className="mb-1 font-mono text-micro uppercase text-(--accent-violet)">
                {reg.kind}
              </div>
              <p className="text-body text-(--text-secondary)">
                {reg.describePrompt(reg.exemplar)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-micro text-(--text-dim)">
                {reg.classifications.fastLane ? <span>fast-lane</span> : null}
                {reg.classifications.microworld ? <span>microworld</span> : null}
                {reg.classifications.constructionist ? <span>constructionist</span> : null}
                {reg.classifications.bodySyntonic ? <span>body-syntonic</span> : null}
                {reg.classifications.debugStyle ? <span>debug</span> : null}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
