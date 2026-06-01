import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContinueCountdownButton } from '@/components/play/ContinueCountdownButton';

describe('ContinueCountdownButton', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('calls onContinue when clicked during countdown', () => {
    vi.useFakeTimers();
    const onContinue = vi.fn();
    render(
      <ContinueCountdownButton onContinue={onContinue} countdownSec={3} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /CONTINUE · 3s/i }));
    expect(onContinue).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('auto-continues when countdown reaches zero', () => {
    vi.useFakeTimers();
    const onContinue = vi.fn();
    render(
      <ContinueCountdownButton onContinue={onContinue} countdownSec={2} />,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('counts down immediately without waiting on speech', () => {
    vi.useFakeTimers();
    const onContinue = vi.fn();
    render(
      <ContinueCountdownButton onContinue={onContinue} countdownSec={3} />,
    );

    expect(screen.getByRole('button', { name: /CONTINUE · 3s/i })).toHaveProperty(
      'disabled',
      false,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('button', { name: /CONTINUE · 2s/i })).toBeTruthy();
    expect(onContinue).not.toHaveBeenCalled();
  });
});
