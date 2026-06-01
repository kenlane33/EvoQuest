'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { SpeakButton } from '@/components/content/SpeakButton';
import { CONFIDENCE_MARKS } from '@/engine/calibration';

const PROMPT = 'How likely are you to get this one right?';

type ConfidencePromptProps = {
  onCommit: (confidence: number) => void;
};

export function ConfidencePrompt({ onCommit }: ConfidencePromptProps) {
  const [markIndex, setMarkIndex] = useState(2);

  const confidence = CONFIDENCE_MARKS[markIndex];
  const pct = Math.round(confidence * 100);

  return (
    <Card className="animate-slide-up">
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-body-lg font-semibold text-(--text-primary)">
          {PROMPT}
        </p>
        <SpeakButton text={PROMPT} label="Read confidence prompt" />
      </div>
      <p className="mt-2 text-display-sm font-black text-(--accent-cyan)">{pct}%</p>
      <input
        type="range"
        min={0}
        max={CONFIDENCE_MARKS.length - 1}
        step={1}
        value={markIndex}
        onChange={(e) => setMarkIndex(Number(e.target.value))}
        className="mt-4 w-full accent-(--accent-cyan)"
        aria-label="Confidence prediction"
      />
      <div className="mt-1 flex justify-between text-micro text-(--text-dim) max-sm:hidden">
        {CONFIDENCE_MARKS.map((mark) => (
          <span key={mark}>{Math.round(mark * 100)}%</span>
        ))}
      </div>
      <Button
        variant="primary"
        fullWidth
        className="mt-4"
        onClick={() => onCommit(confidence)}
      >
        Lock in prediction
      </Button>
    </Card>
  );
}
