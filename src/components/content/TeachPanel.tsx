import type { TeachBlock } from '@/types';
import type { QuestionSpeakSlot } from '@/components/audio/question-speak-context';
import { SpeakButton } from '@/components/content/SpeakButton';
import { cn } from '@/lib/cn';
import { MarkdownContent } from '@/components/content/MarkdownContent';

type TeachPanelProps = {
  teach: TeachBlock;
  compact?: boolean;
  showHeadline?: boolean;
  includeBody?: boolean;
  className?: string;
  /** Plain text for read-aloud on the headline row. Set false to hide the button. */
  speakText?: string | false;
  speakSlot?: QuestionSpeakSlot;
  speakLabel?: string;
};

export function TeachPanel({
  teach,
  compact = false,
  showHeadline = true,
  includeBody = true,
  className,
  speakText,
  speakSlot,
  speakLabel,
}: TeachPanelProps) {
  const readText = speakText === false ? '' : (speakText ?? '');

  return (
    <div className={cn('min-w-0', className)}>
      {showHeadline ? (
        <div className={cn('flex items-start gap-2', compact ? 'mb-2' : 'mb-3')}>
          <h3
            className={cn(
              'min-w-0 flex-1 font-headline font-black text-(--text-primary)',
              compact ? 'text-headline-md' : 'text-headline-lg',
            )}
          >
            {teach.headline}
          </h3>
          {readText ? (
            <SpeakButton
              slot={speakSlot}
              text={readText}
              label={speakLabel ?? `Read lesson: ${teach.headline}`}
            />
          ) : null}
        </div>
      ) : null}

      {teach.imageUrl ? (
        <img
          src={teach.imageUrl}
          alt=""
          loading="lazy"
          className="mb-4 block h-auto max-w-full rounded-lg"
        />
      ) : null}

      {includeBody && teach.body ? (
        <div data-testid="teach-body">
          <MarkdownContent
            content={teach.body}
            figures={teach.figures}
            compact={compact}
          />
        </div>
      ) : null}

      {!compact && teach.poweredIdea ? (
        <p className="mt-4 border-t border-(--border-faint) pt-4 text-body font-semibold text-(--accent-cyan)">
          {teach.poweredIdea}
        </p>
      ) : null}

      {teach.hook ? (
        <p className="mt-3 text-meta italic text-(--text-dim)">{teach.hook}</p>
      ) : null}
    </div>
  );
}
