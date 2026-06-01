'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { TemplateRegistration } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import {
  BugClassSchema,
  DebugTheClaimDataSchema,
  type BugClass,
  type DebugTheClaimData,
} from '@/types/schemas';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const BUG_LABELS: Record<BugClass, string> = {
  'lamarckian-sneak': 'Lamarckian sneak',
  teleology: 'Teleology',
  'progress-fallacy': 'Progress fallacy',
  'strong-vs-fit': 'Strong vs fit confusion',
  'confused-vocabulary': 'Confused vocabulary',
  'causal-direction-reversed': 'Causal direction reversed',
  'scale-confusion': 'Scale confusion',
  other: 'Other misconception',
};

type Phase = 'read' | 'classify' | 'done';

function tokenizeParagraph(paragraph: string) {
  const parts = paragraph.split(/(\s+)/);
  const tokens: Array<{ text: string; start: number; end: number; isWord: boolean }> = [];
  let pos = 0;
  for (const part of parts) {
    const start = pos;
    const end = pos + part.length;
    tokens.push({ text: part, start, end, isWord: /\S/.test(part) });
    pos = end;
  }
  return tokens;
}

function DebugTheClaimRenderer({
  data,
  onResult,
}: {
  data: DebugTheClaimData;
  onResult: (result: { correct: boolean; ms: number }) => void;
}) {
  const startMs = useRef(Date.now());
  const tokens = useMemo(() => tokenizeParagraph(data.paragraph), [data.paragraph]);
  const bugStart = data.paragraph.indexOf(data.bugPhrase);
  const bugEnd = bugStart + data.bugPhrase.length;

  const [phase, setPhase] = useState<Phase>('read');
  const [selectedSpan, setSelectedSpan] = useState<{ start: number; end: number } | null>(null);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [pickedClass, setPickedClass] = useState<BugClass | null>(null);
  const finishedRef = useRef(false);

  function overlapsBug(start: number, end: number) {
    return start <= bugEnd && end >= bugStart;
  }

  function onTokenClick(token: { text: string; start: number; end: number; isWord: boolean }) {
    if (!token.isWord || phase === 'done') return;
    if (overlapsBug(token.start, token.end)) {
      setSelectedSpan({ start: token.start, end: token.end });
      setPhase('classify');
      return;
    }
    setWrongClicks((n) => n + 1);
    setSelectedSpan(null);
  }

  function onClassify(choice: BugClass) {
    setPickedClass(choice);
    const correct = choice === data.bugClass;
    if (correct && !finishedRef.current) {
      finishedRef.current = true;
      setPhase('done');
      onResult({ correct: true, ms: Date.now() - startMs.current });
    }
  }

  const offeredClasses = useMemo(() => {
    const all = BugClassSchema.options;
    const rest = all.filter((c) => c !== data.bugClass);
    const picks = rest.slice(0, 3);
    return shuffle([data.bugClass, ...picks]);
  }, [data.bugClass]);

  return (
    <div className="space-y-5">
      <p className="text-meta text-(--text-dim)">
        Read the paragraph. Click the conceptual bug, then name what kind of mistake it is.
      </p>

      <Card>
        <p className="text-body-lg leading-relaxed text-(--text-primary)">
          {tokens.map((token, i) => {
            if (!token.isWord) return <span key={i}>{token.text}</span>;
            const isBug =
              phase === 'done' || (selectedSpan && overlapsBug(token.start, token.end));
            const isWrongPick =
              selectedSpan &&
              phase !== 'done' &&
              token.start === selectedSpan.start &&
              !overlapsBug(token.start, token.end);
            return (
              <button
                key={i}
                type="button"
                onClick={() => onTokenClick(token)}
                disabled={phase === 'done'}
                className={cn(
                  'mx-0.5 inline-flex min-h-11 items-center rounded px-1.5 py-1 underline-offset-4 transition-colors disabled:cursor-not-allowed',
                  isBug
                    ? 'bg-[color-mix(in_oklab,var(--status-wrong)_20%,transparent)] text-(--status-wrong) underline'
                    : isWrongPick
                      ? 'bg-[color-mix(in_oklab,var(--accent-amber)_15%,transparent)]'
                      : 'underline decoration-[color-mix(in_oklab,var(--text-dim)_45%,transparent)] hover:bg-(--bg-card-active) hover:decoration-(--text-primary)',
                )}
              >
                {token.text}
              </button>
            );
          })}
        </p>
      </Card>

      {wrongClicks > 0 && phase === 'read' ? (
        <p className="text-meta text-(--accent-amber)">
          {wrongClicks >= 2 ? data.hint : 'That phrase looks fine — keep looking.'}
        </p>
      ) : null}

      {phase === 'classify' ? (
        <div className="animate-slide-up space-y-3">
          <p className="text-body font-semibold text-(--text-primary)">What kind of bug is this?</p>
          <div className="flex flex-col gap-2">
            {offeredClasses.map((choice) => (
              <Button
                key={choice}
                variant="ghost"
                fullWidth
                onClick={() => onClassify(choice)}
                className={cn(
                  'justify-start border px-4 py-3 text-left',
                  pickedClass === choice && choice !== data.bugClass
                    ? 'border-[color-mix(in_oklab,var(--status-wrong)_35%,transparent)] text-(--status-wrong)'
                    : 'border-(--border-light)',
                )}
              >
                {BUG_LABELS[choice]}
              </Button>
            ))}
          </div>
          {pickedClass && pickedClass !== data.bugClass ? (
            <p className="text-meta text-(--text-dim)">{data.hint}</p>
          ) : null}
        </div>
      ) : null}

      {phase === 'done' ? (
        <Card variant="correct" className="animate-slide-up">
          <p className="text-micro font-bold uppercase tracking-widest text-(--status-correct)">
            Fixed
          </p>
          <p className="mt-2 text-body text-(--text-secondary)">{data.canonicalFix}</p>
          <p className="mt-2 text-body font-semibold text-(--accent-cyan)">{data.poweredIdea}</p>
        </Card>
      ) : null}
    </div>
  );
}

const exemplar: DebugTheClaimData = {
  paragraph:
    'Giraffes evolved long necks because their ancestors stretched to reach high leaves, and this lengthening was passed to their offspring.',
  bugPhrase: 'stretched to reach high leaves, and this lengthening was passed to their offspring',
  bugClass: 'lamarckian-sneak',
  hint: 'Can a lifetime of stretching rewrite DNA passed to offspring?',
  canonicalFix:
    'Giraffes with longer necks survived better and reproduced more — variation existed first; the environment selected it.',
  poweredIdea: 'Acquired traits in one lifetime are not inherited by the next generation.',
};

const registration: TemplateRegistration<DebugTheClaimData> = {
  kind: 'debug-the-claim',
  schema: DebugTheClaimDataSchema,
  exemplar,
  classifications: {
    fastLane: true,
    microworld: false,
    constructionist: false,
    bodySyntonic: false,
    debugStyle: true,
  },
  Renderer: DebugTheClaimRenderer,
  describePrompt: (data) => `Debug the claim: ${data.bugPhrase.slice(0, 40)}…`,
  estimateMs: () => 60_000,
  defaultConfidenceMs: 45_000,
};

export default registration;
