'use client';

import { Button } from '@/components/common/Button';
import { useElapsedSec } from '@/hooks/use-elapsed-sec';
import type { ActiveSession } from '@/types';
import { devMark } from '@/lib/dev-mark';

type PauseModalProps = {
  session: ActiveSession;
  onResume: () => void;
  onEndJourney: () => void;
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function PauseModal({ session, onResume, onEndJourney }: PauseModalProps) {
  const elapsedSec = useElapsedSec(session.startedAt);
  const total = session.queue.length;
  const answered = session.attempts.length;
  const correct = session.attempts.filter((a) => a.correct).length;
  const current = Math.min(session.currentIndex + 1, total);

  return (
    <div
      {...devMark('pause')}
      className="glass-sm glass-bg-overlay-play fixed inset-0 z-[100] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="w-full max-w-sm animate-slide-up rounded-(--r-xl) border border-(--border-light) bg-(--bg-card) p-6 shadow-xl">
        <h2 id="pause-title" className="text-headline-lg font-black text-(--text-primary)">
          Quest paused
        </h2>
        <p className="mt-2 text-body text-(--text-secondary)">
          Question {current}/{total} · {correct}/{answered} correct · {formatTime(elapsedSec)}
        </p>
        <p className="mt-1 text-meta text-(--text-dim)">
          Progress is saved. Ending finalizes this journey.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="primary" fullWidth {...devMark('pause.resume')} onClick={onResume} autoFocus>
            Resume
          </Button>
          <Button variant="destructive" fullWidth {...devMark('pause.end')} onClick={onEndJourney}>
            End Journey
          </Button>
        </div>
      </div>
    </div>
  );
}
