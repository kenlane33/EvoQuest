'use client';

import { ToggleSwitch } from '../../internal/ToggleSwitch';
import { cn } from '../../internal/cn';
import { useReadAloudSettings } from '../ReadAloudProvider';

type AutoReadToggleProps = {
  /** Icon-only label on narrow screens to save header width. */
  compact?: boolean;
  className?: string;
};

export function AutoReadToggle({ compact = false, className }: AutoReadToggleProps) {
  const { enabled, autoRead, setAutoRead } = useReadAloudSettings();
  const disabled = !enabled;
  const on = autoRead && !disabled;

  return (
    <label
      className={cn(
        'flex items-center gap-2 rounded-(--r-full) border border-(--border-light) bg-(--bg-card) py-1.5',
        compact ? 'px-2 max-sm:gap-1.5 sm:px-3' : 'px-3',
        disabled && 'opacity-50',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'text-meta font-bold uppercase tracking-[0.06em]',
          compact && 'max-sm:sr-only',
          disabled
            ? 'text-(--text-dim)'
            : on
              ? 'text-(--status-correct)'
              : 'text-(--status-wrong)',
        )}
      >
        Auto-read
      </span>
      <ToggleSwitch
        size="sm"
        checked={autoRead}
        disabled={disabled}
        aria-label="Auto-read aloud when page content changes"
        onCheckedChange={setAutoRead}
      />
    </label>
  );
}
