'use client';

import { Link } from '@tanstack/react-router';
import { Home } from 'lucide-react';
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
        size === 'compact' ? 'h-9 w-9' : 'h-10 w-10',
        buttonPressClasses,
        className,
      )}
      aria-label="Home"
      title="Home"
    >
      <Home size={size === 'compact' ? 16 : 18} aria-hidden />
    </Link>
  );
}
