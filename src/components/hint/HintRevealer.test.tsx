import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HintRevealer } from '@/components/hint/HintRevealer';

const HINT = {
  root: 'Greek: a- + bios + genesis',
  mnemonic: 'A=WITHOUT, BIO=LIFE',
};

describe('HintRevealer', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('counts down toward reveal', () => {
    vi.useFakeTimers();
    render(
      <HintRevealer hint={HINT} countdownSec={3} revealMs={300} />,
    );

    expect(screen.getByText('3s')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('2s')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText(/Remember:/)).toBeTruthy();
  });

  it('does not reset countdown when parent passes a new hint object', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <HintRevealer hint={HINT} countdownSec={6} revealMs={500} />,
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('4s')).toBeTruthy();

    rerender(
      <HintRevealer hint={{ ...HINT }} countdownSec={6} revealMs={500} />,
    );
    expect(screen.getByText('4s')).toBeTruthy();
    expect(screen.queryByText('6s')).toBeNull();
  });

  it('reveals every character when the animation finishes', () => {
    vi.useFakeTimers();
    const mnemonic = 'ENDO=INSIDE. SYM=TOGETHER.';
    const { container } = render(
      <HintRevealer hint={{ root: 'r', mnemonic }} countdownSec={1} revealMs={300} />,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const interval = Math.max(30, 300 / mnemonic.length);
    act(() => {
      vi.advanceTimersByTime(interval * mnemonic.length + interval * 2);
    });

    expect(container.textContent).not.toContain('░');
    expect(container.textContent).toContain('ENDO');
  });
});
