'use client';

import { cn } from '@/lib/cn';

type ToggleSwitchSize = 'sm' | 'md';

const SIZE = {
  sm: {
    track: 'h-6 w-10 p-[2px]',
    thumb: 'h-5 w-5',
  },
  md: {
    track: 'h-7 w-12 p-[3px]',
    thumb: 'h-6 w-6',
  },
} as const;

export type ToggleSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: ToggleSwitchSize;
  'aria-label': string;
  className?: string;
};

/** On/off switch with always-visible green (on) or red (off) track. */
export function ToggleSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  size = 'md',
  'aria-label': ariaLabel,
  className,
}: ToggleSwitchProps) {
  const s = SIZE[size];
  const on = checked && !disabled;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center rounded-full border transition-[background-color,border-color]',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'leading-none',
        s.track,
        on ? 'justify-end' : 'justify-start',
        disabled
          ? 'border-(--border-light) bg-(--bg-card-active)'
          : on
            ? 'border-[color-mix(in_oklab,var(--status-correct)_60%,var(--border-light))] bg-[color-mix(in_oklab,var(--status-correct)_55%,var(--bg-card-active))]'
            : 'border-[color-mix(in_oklab,var(--status-wrong)_60%,var(--border-light))] bg-[color-mix(in_oklab,var(--status-wrong)_55%,var(--bg-card-active))]',
        className,
      )}
    >
      <span
        className={cn(
          'block shrink-0 rounded-full bg-white shadow-sm transition-transform',
          s.thumb,
        )}
      />
    </button>
  );
}
