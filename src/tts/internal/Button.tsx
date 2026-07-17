'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export const buttonPressClasses =
  'cursor-pointer transition-transform duration-150 ease-out hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'icon' | 'text' | 'outline';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[image:var(--reveal-gradient)] text-(--bg-deep) font-headline font-extrabold tracking-wide glow-cyan-sm hover:glow-cyan-md border-0',
  secondary:
    'bg-(--bg-card-hi) text-(--text-primary) border border-(--border-light) hover:bg-(--bg-card-active) hover:border-(--border-medium)',
  ghost:
    'bg-transparent text-(--text-secondary) border border-transparent hover:text-(--text-primary) hover:bg-(--bg-card)',
  destructive:
    'bg-[color-mix(in_oklab,var(--accent-coral)_20%,transparent)] text-(--text-primary) border border-[color-mix(in_oklab,var(--accent-coral)_35%,transparent)] hover:bg-[color-mix(in_oklab,var(--accent-coral)_30%,transparent)]',
  icon:
    'h-10 w-10 shrink-0 rounded-full border border-(--border-light) bg-(--bg-card) p-0 text-(--text-secondary) hover:border-(--border-medium) hover:text-(--text-primary)',
  text: 'border-0 bg-transparent px-0 py-0 font-normal text-(--text-dim) hover:bg-transparent hover:text-(--text-secondary)',
  outline: 'border border-(--border-light) hover:border-(--border-medium)',
};

export function Button({
  variant = 'secondary',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const isIcon = variant === 'icon';
  const isText = variant === 'text';

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-(--r-md) text-body font-semibold disabled:opacity-40',
        buttonPressClasses,
        !isIcon && !isText && 'px-4 py-3',
        variantClasses[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
