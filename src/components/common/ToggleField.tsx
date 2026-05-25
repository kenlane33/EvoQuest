'use client';

import { ToggleSwitch } from '@/components/common/ToggleSwitch';
import { cn } from '@/lib/cn';

type ToggleFieldProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Card style (onboarding) vs plain row (settings). */
  variant?: 'plain' | 'card';
};

export function ToggleField({
  label,
  description,
  checked,
  onChange,
  variant = 'plain',
}: ToggleFieldProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-between gap-4',
        variant === 'card' &&
          'rounded-(--r-xl) border border-(--border-light) bg-(--bg-card) p-4',
      )}
    >
      <div className={description ? 'text-left' : undefined}>
        <span className="text-body font-bold text-(--text-primary)">{label}</span>
        {description ? (
          <div className="text-meta text-(--text-dim)">{description}</div>
        ) : null}
      </div>
      <ToggleSwitch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  );
}
