'use client';

import { memo, useDeferredValue, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { SpeakButton } from '@/components/content/SpeakButton';
import { cn } from '@/lib/cn';
import type { InnerQuestion } from '@/types';

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export type FillQuestionProps = {
  question: Extract<InnerQuestion, { kind: 'fill' }>;
  disabled: boolean;
  onAnswer: (correct: boolean) => void;
  descText?: string;
  onHintShown?: (shown: boolean) => void;
};

function FillQuestionInner({
  question,
  disabled,
  onAnswer,
  descText,
  onHintShown,
}: FillQuestionProps) {
  const [val, setVal] = useState('');
  const displayVal = useDeferredValue(val);
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (disabled || done) return;
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [disabled, done]);

  function submit() {
    if (!val.trim() || done || disabled) return;
    setDone(true);
    const ok = question.acceptable.some((a) => norm(val) === norm(a));
    onAnswer(ok);
  }

  const parts = question.prompt.split('_____');
  const ok = done && question.acceptable.some((a) => norm(val) === norm(a));
  const correctAnswer = question.acceptable[0];
  const blankText = done ? (ok ? val : correctAnswer) : displayVal || '?????';

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-body-lg leading-relaxed text-(--text-primary)">
            {parts[0]}
            <span
              className={cn(
                'mx-1 inline-flex min-w-[3rem] max-sm:min-w-[2.5rem] items-center gap-1 border-b-2 px-1 font-bold',
                done
                  ? 'border-(--status-correct) text-(--status-correct)'
                  : 'border-(--accent-cyan) text-(--accent-cyan)',
              )}
            >
              {blankText}
              {done ? (
                <span aria-hidden className="text-(--status-correct)">
                  ✓
                </span>
              ) : null}
            </span>
            {parts[1]}
          </p>
          {descText ? (
            <SpeakButton slot="desc" text={descText} label="Read question" className="mt-0.5" />
          ) : null}
        </div>
      </Card>
      {done && !ok && (
        <p className="text-meta text-(--text-dim)">
          Your answer:{' '}
          <span className="font-semibold text-(--status-wrong)">
            ✗ {val}
          </span>
        </p>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={val}
          disabled={done || disabled}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Type your answer…"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 text-body text-(--text-primary) outline-none focus:border-(--accent-cyan)"
        />
        <Button variant="primary" disabled={!val.trim() || done || disabled} onClick={submit}>
          GO
        </Button>
      </div>
      {!done && question.hint && (
        <div className="flex items-center gap-1">
          <Button
            variant="text"
            onClick={() => {
              setShowHint(true);
              onHintShown?.(true);
            }}
            className={showHint ? 'text-(--accent-amber) hover:text-(--accent-amber)' : 'hover:text-(--accent-amber)'}
          >
            {showHint ? `💡 ${question.hint}` : 'Need a hint?'}
          </Button>
        </div>
      )}
    </div>
  );
}

export const FillQuestion = memo(FillQuestionInner);
