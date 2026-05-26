'use client';

import { Link } from '@tanstack/react-router';
import { buttonPressClasses } from '@/components/common/Button';
import { cn } from '@/lib/cn';
import { devMark } from '@/lib/dev-mark';

type MenuHomeButtonProps = {
  devId: string;
  size?: 'default' | 'compact';
  className?: string;
};

export function MenuHomeButton({ devId, size = 'default', className }: MenuHomeButtonProps) {
  return (
    <Link
      to="/"
      {...devMark(devId)}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border border-(--border-light) bg-(--bg-card) text-(--text-secondary) no-underline transition-colors hover:border-(--border-medium) hover:text-(--text-primary)',
        size === 'compact' ? 'h-9 w-9 text-lg' : 'h-10 w-10 text-xl',
        buttonPressClasses,
        className,
      )}
      aria-label="Menu"
    >
      <span aria-hidden>🧬</span>
    </Link>
  );
}
