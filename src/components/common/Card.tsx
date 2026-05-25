'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardVariant = 'default' | 'hint' | 'correct' | 'wrong';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  children: ReactNode;
};

const variantClasses: Record<CardVariant, string> = {
  default: 'border-(--border-light)',
  hint: 'border-(--border-light) border-l-4 border-l-(--status-hint)',
  correct: 'border-(--border-light) border-l-4 border-l-(--status-correct)',
  wrong: 'border-(--border-light) border-l-4 border-l-(--status-wrong)',
};

export function Card({
  variant = 'default',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-(--r-xl) border bg-(--bg-card) p-5 lift-card transition-shadow duration-150 hover:lift-card-hi',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
