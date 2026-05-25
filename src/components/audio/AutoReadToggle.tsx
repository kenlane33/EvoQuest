'use client';

import { ToggleSwitch } from '@/components/common/ToggleSwitch';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store/app-store';

export function AutoReadToggle() {
  const reading = useAppStore((s) => s.settings.reading);
  const setSettings = useAppStore((s) => s.setSettings);
  const disabled = !reading.enabled;
  const on = reading.autoRead && !disabled;

  return (
    <label
      className={cn(
        'flex items-center gap-2 rounded-(--r-full) border border-(--border-light) bg-(--bg-card) px-3 py-1.5',
        disabled && 'opacity-50',
      )}
    >
      <span
        className={cn(
          'text-meta font-bold uppercase tracking-[0.06em]',
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
