'use client';

import { ToggleSwitch } from '@/components/common/ToggleSwitch';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store/app-store';

type AutoReadToggleProps = {
  /** Icon-only label on narrow screens to save header width. */
  compact?: boolean;
};

export function AutoReadToggle({ compact = false }: AutoReadToggleProps) {
  const reading = useAppStore((s) => s.settings.reading);
  const setSettings = useAppStore((s) => s.setSettings);
  const disabled = !reading.enabled;
  const on = reading.autoRead && !disabled;

  return (
    <label
      className={cn(
        'flex items-center gap-2 rounded-(--r-full) border border-(--border-light) bg-(--bg-card) py-1.5',
        compact ? 'px-2 max-sm:gap-1.5 sm:px-3' : 'px-3',
        disabled && 'opacity-50',
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
        checked={reading.autoRead}
        disabled={disabled}
        aria-label="Auto-read aloud when page content changes"
        onCheckedChange={(autoRead) =>
          setSettings({ reading: { ...reading, autoRead } })
        }
      />
    </label>
  );
}
