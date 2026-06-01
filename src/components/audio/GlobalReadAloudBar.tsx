'use client';

import { useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/common/Button';
import { ReadAloudButton } from '@/components/content/ReadAloudButton';
import { usePageReadAloudContext } from '@/components/audio/page-read-aloud-context';
import { useQuestionSpeakOptional } from '@/components/audio/question-speak-context';
import { cn } from '@/lib/cn';
import { usePocketTts } from '@/audio/use-pocket-tts';
import type { PocketTtsStatus } from '@/audio/use-pocket-tts';
import { useAppStore } from '@/store/app-store';
import { devMark } from '@/lib/dev-mark';

/** Fixed Read it control — uses text registered by the active page. */
export function GlobalReadAloudBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const readingEnabled = useAppStore((s) => s.settings.reading.enabled);
  const voice = useAppStore((s) => s.settings.reading.voice);
  const volume = useAppStore((s) => s.settings.audio.volume);
  const { state } = usePageReadAloudContext();
  const questionSpeak = useQuestionSpeakOptional();
  const tts = usePocketTts({ voice, volume });

  const onPlayRoute = pathname.startsWith('/play/');
  const onHome = pathname === '/';

  if (!readingEnabled || !state.text.trim()) {
    return null;
  }

  const coordinated = Boolean(questionSpeak);
  const status: PocketTtsStatus = coordinated
    ? questionSpeak!.status === 'loading'
      ? 'loading'
      : questionSpeak!.status === 'playing'
        ? 'playing'
        : 'idle'
    : tts.status;
  const isActive = coordinated
    ? questionSpeak!.status === 'loading' || questionSpeak!.status === 'playing'
    : tts.isActive;

  function handleStop() {
    questionSpeak?.stop();
    tts.stop();
  }

  function handleToggle() {
    if (questionSpeak) {
      questionSpeak.toggle('desc');
      return;
    }
    tts.toggle(state.text);
  }

  return (
    <div
      {...devMark('shell.readbar')}
      className={cn(
        'pointer-events-none fixed right-4 z-50 flex max-w-[min(100vw-2rem,24rem)] flex-col items-end',
        onHome
          ? 'top-[calc(var(--app-header-h)+0.5rem)]'
          : onPlayRoute
            ? 'bottom-(--play-readbar-bottom)'
            : 'bottom-[max(1.25rem,env(safe-area-inset-bottom))]',
      )}
      aria-live="polite"
    >
      <div className="pointer-events-auto rounded-(--r-xl) border border-(--border-light) bg-(--bg-card)/95 p-2 shadow-lg backdrop-blur-sm max-sm:p-1.5">
        <div className="flex items-start gap-1.5 max-sm:gap-1">
          <Button
            variant="secondary"
            {...devMark('shell.shhh')}
            onClick={handleStop}
            aria-label="Stop reading"
            className={cn(
              'shrink-0 max-sm:px-2 max-sm:py-1.5 max-sm:text-micro h-9',
              isActive && 'border-[color-mix(in_oklab,var(--status-wrong)_40%,transparent)]',
            )}
          >
            Shhh...
          </Button>
          <div {...devMark('shell.readit')}>
            <ReadAloudButton
            text={state.text}
            status={status}
            error={coordinated ? null : tts.error}
            onToggle={handleToggle}
            label="Read it"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
