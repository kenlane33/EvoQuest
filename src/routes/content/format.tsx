'use client';

import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { BackLink } from '@/components/common/BackLink';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import {
  generateContentPrompt,
  SCOPE_LABELS,
  SOURCE_KIND_LABELS,
  type AuthorScope,
  type SourceKind,
} from '@/content/authoring';
import '@/engine/templates';
import { REGISTRY } from '@/engine/templates/registry';
import { usePageReadAloud } from '@/hooks/use-page-read-aloud';
import { devMark } from '@/lib/dev-mark';

export const Route = createFileRoute('/content/format')({
  component: ContentFormatPage,
});

function CopyPromptButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <Button variant="primary" onClick={copy}>
      {copied ? 'Copied!' : 'Copy AI prompt'}
    </Button>
  );
}

function ContentFormatPage() {
  const kinds = Object.values(REGISTRY);
  const kindText = kinds.map((reg) => `${reg.kind}. ${reg.describePrompt(reg.exemplar)}`).join(' ');

  const [topic, setTopic] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [wingIdPrefix, setWingIdPrefix] = useState('');
  const [sourceKind, setSourceKind] = useState<SourceKind>('notes');
  const [scope, setScope] = useState<AuthorScope>('drawer');
  const [authorRef, setAuthorRef] = useState('');
  const [sourceMaterial, setSourceMaterial] = useState('');

  const aiPrompt = useMemo(
    () =>
      generateContentPrompt({
        topic,
        moduleTitle: moduleTitle || undefined,
        wingIdPrefix: wingIdPrefix || undefined,
        sourceKind,
        sourceMaterial,
        scope,
        authorRef: authorRef || undefined,
      }),
    [topic, moduleTitle, wingIdPrefix, sourceKind, sourceMaterial, scope, authorRef],
  );

  usePageReadAloud(
    `Formats. Registered question templates available to content authors. ${kindText}`,
  );

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8">
      <BackLink to="/content" label="Content" />
      <h1 className="text-display-lg mb-2 font-black">Formats</h1>
      <p className="mb-8 text-body text-(--text-secondary)">
        Registered question templates and the AI prompt for authoring new content from notes,
        slides, or example questions.
      </p>

      <section {...devMark('prompt')} className="mb-10">
        <h2 className="mb-2 text-headline-md font-bold">AI authoring prompt</h2>
        <p className="mb-4 text-body text-(--text-secondary)">
          Paste your source material, copy the prompt into another chat, and paste the JSON
          response back here for import. Full schema + prompt template:{' '}
          <code className="text-(--accent-cyan)">plan/design/ai-authoring-prompt.md</code>
        </p>

        <Card className="mb-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-meta font-semibold text-(--text-dim)">Topic</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Cell membrane transport"
              className="w-full rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 text-body text-(--text-primary) outline-none focus:border-(--accent-cyan)"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-meta font-semibold text-(--text-dim)">
                Module title (optional)
              </span>
              <input
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="Defaults to topic"
                className="w-full rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 text-body text-(--text-primary) outline-none focus:border-(--accent-cyan)"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-meta font-semibold text-(--text-dim)">
                ID prefix (optional)
              </span>
              <input
                value={wingIdPrefix}
                onChange={(e) => setWingIdPrefix(e.target.value)}
                placeholder="e.g. biochem.cells"
                className="w-full rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 font-mono text-body text-(--text-primary) outline-none focus:border-(--accent-cyan)"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-meta font-semibold text-(--text-dim)">
                Source type
              </span>
              <select
                value={sourceKind}
                onChange={(e) => setSourceKind(e.target.value as SourceKind)}
                className="w-full rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 text-body text-(--text-primary) outline-none focus:border-(--accent-cyan)"
              >
                {(Object.entries(SOURCE_KIND_LABELS) as [SourceKind, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-meta font-semibold text-(--text-dim)">Scope</span>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as AuthorScope)}
                className="w-full rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 text-body text-(--text-primary) outline-none focus:border-(--accent-cyan)"
              >
                {(Object.entries(SCOPE_LABELS) as [AuthorScope, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-meta font-semibold text-(--text-dim)">
              Author handle (optional)
            </span>
            <input
              value={authorRef}
              onChange={(e) => setAuthorRef(e.target.value)}
              placeholder="Your name or handle"
              className="w-full rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 text-body text-(--text-primary) outline-none focus:border-(--accent-cyan)"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-meta font-semibold text-(--text-dim)">
              Source material
            </span>
            <textarea
              value={sourceMaterial}
              onChange={(e) => setSourceMaterial(e.target.value)}
              rows={8}
              placeholder="Paste notes, slide text, example questions, or an outline…"
              className="w-full resize-y rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 font-mono text-meta text-(--text-primary) outline-none placeholder:text-(--text-faint) focus:border-(--accent-cyan)"
            />
          </label>

          <CopyPromptButton text={aiPrompt} />
        </Card>

        <details className="rounded-(--r-lg) border border-(--border-faint) bg-(--bg-card)">
          <summary className="cursor-pointer px-4 py-3 text-body font-semibold text-(--text-primary)">
            Preview generated prompt
          </summary>
          <pre className="max-h-[28rem] overflow-auto border-t border-(--border-faint) px-4 py-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-(--text-dim)">
            {aiPrompt}
          </pre>
        </details>
      </section>

      <section {...devMark('list')}>
        <h2 className="mb-4 text-headline-md font-bold">Registered templates</h2>
        <ul className="space-y-4">
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
          <li>
            <Card>
              <div className="mb-1 font-mono text-micro uppercase text-(--accent-violet)">fill</div>
              <p className="text-body text-(--text-secondary)">
                Cloze blank with five underscores — primary format for worksheet-style review.
              </p>
              <span className="mt-3 inline-block text-micro text-(--text-dim)">fast-lane</span>
            </Card>
          </li>
          <li>
            <Card>
              <div className="mb-1 font-mono text-micro uppercase text-(--accent-violet)">match</div>
              <p className="text-body text-(--text-secondary)">
                Match a term to the correct category from distractors.
              </p>
              <span className="mt-3 inline-block text-micro text-(--text-dim)">fast-lane</span>
            </Card>
          </li>
          <li>
            <Card>
              <div className="mb-1 font-mono text-micro uppercase text-(--accent-violet)">
                scenario
              </div>
              <p className="text-body text-(--text-secondary)">
                Short story setup with multiple-choice answer and explanation.
              </p>
              <span className="mt-3 inline-block text-micro text-(--text-dim)">fast-lane</span>
            </Card>
          </li>
        </ul>
      </section>
    </main>
  );
}
