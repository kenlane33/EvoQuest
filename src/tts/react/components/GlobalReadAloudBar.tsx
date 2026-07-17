'use client';

import { Button } from '../../internal/Button';
import { ReadAloudButton } from './ReadAloudButton';
import { usePageReadAloudContext } from '../page-read-aloud-context';
import { useQuestionSpeakOptional } from '../question-speak-context';
import { useReadAloudBootstrap } from '../../hooks/use-read-aloud-bootstrap';
import { preloadReadAloud } from '../../engine/read-aloud-engine';
import { cn } from '../../internal/cn';
import { usePocketTts } from '../../hooks/use-pocket-tts';
import type { PocketTtsStatus } from '../../hooks/use-pocket-tts';
import { useReadAloudSettings } from '../ReadAloudProvider';

export type GlobalReadAloudBarProps = {
  /** When true, position at top (home page). */
  onHome?: boolean;
  /** When true, position at play-route bottom offset. */
  onPlayRoute?: boolean;
  className?: string;
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  stopButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  readButtonProps?: { buttonClassName?: string };
};

/** Fixed Read it control — uses text registered by the active page. */
export function GlobalReadAloudBar({
  onHome = false,
  onPlayRoute = false,
  className,
  rootProps,
  stopButtonProps,
  readButtonProps,
}: GlobalReadAloudBarProps) {
  const { enabled, voice, volume } = useReadAloudSettings();
  const bootstrap = useReadAloudBootstrap(enabled, voice);
  const tts = usePocketTts({ voice, volume });
  const questionSpeak = useQuestionSpeakOptional();
  const { state } = usePageReadAloudContext();

  if (!enabled || !state.text.trim()) {
    return null;
  }

  const bootstrapping = bootstrap.status === 'loading';
  const bootstrapReady = bootstrap.status === 'ready';
  const controlsLocked = bootstrapping || !bootstrapReady;
  const showLoadReaderLink = controlsLocked && !bootstrapping;

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
    if (controlsLocked) return;
    if (questionSpeak) {
      questionSpeak.toggle('desc');
      return;
    }
    tts.toggle(state.text);
  }

  return (
    <div
      {...rootProps}
      className={cn(
        'pointer-events-none fixed right-4 z-50 flex max-w-[min(100vw-2rem,24rem)] flex-col items-end',
        onHome
          ? 'top-[calc(var(--app-header-h)+0.5rem)]'
          : onPlayRoute
            ? 'bottom-(--play-readbar-bottom)'
            : 'bottom-[max(1.25rem,env(safe-area-inset-bottom))]',
        className,
        rootProps?.className,
      )}
      aria-live="polite"
    >
      <div className="glass-sm glass-bg-readbar pointer-events-auto rounded-(--r-xl) border border-(--border-light) p-2 shadow-lg max-sm:p-1.5">
        <div className="flex items-start gap-1.5 max-sm:gap-1">
          <Button
            variant="secondary"
            {...stopButtonProps}
            onClick={(e) => {
              stopButtonProps?.onClick?.(e);
              handleStop();
            }}
            disabled={controlsLocked}
            aria-label="Stop reading"
            className={cn(
              'shrink-0 max-sm:px-2 max-sm:py-1.5 max-sm:text-micro h-9',
              isActive && 'border-[color-mix(in_oklab,var(--status-wrong)_40%,transparent)]',
              stopButtonProps?.className,
            )}
          >
            Shhh...
          </Button>
          <ReadAloudButton
            text={state.text}
            status={status}
            error={coordinated ? null : tts.error}
            onToggle={handleToggle}
            label="Read it"
            disabled={controlsLocked}
            buttonClassName={readButtonProps?.buttonClassName}
          />
        </div>
        {bootstrapping ? (
          <div className="mt-1.5 px-0.5" aria-hidden={false}>
            <div
              className="h-0.5 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--border-light)_85%,transparent)]"
              role="progressbar"
              aria-valuenow={Math.round(bootstrap.progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Loading read-aloud voice"
            >
              <div
                className="h-full rounded-full bg-[color-mix(in_oklab,var(--accent-cyan)_50%,transparent)] transition-[width] duration-300 ease-out"
                style={{ width: `${Math.max(4, Math.round(bootstrap.progress * 100))}%` }}
              />
            </div>
          </div>
        ) : showLoadReaderLink ? (
          <div className="mt-1 flex justify-end px-0.5">
            <button
              type="button"
              onClick={() => preloadReadAloud(voice)}
              className="text-micro text-(--accent-cyan) underline-offset-2 hover:underline"
            >
              Load reader
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
