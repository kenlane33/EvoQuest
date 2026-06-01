'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';

type ContinueCountdownButtonProps = {
  onContinue: () => void;
  countdownSec?: number;
};

export function ContinueCountdownButton({
  onContinue,
  countdownSec = 3,
}: ContinueCountdownButtonProps) {
  const [remaining, setRemaining] = useState(countdownSec);
  const firedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const fire = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    clearTimer();
    onContinue();
  }, [onContinue, clearTimer]);

  useEffect(() => {
    firedRef.current = false;
    setRemaining(countdownSec);
  }, [countdownSec]);

  useEffect(() => {
    clearTimer();
    if (remaining <= 0 || firedRef.current) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setRemaining((r) => r - 1);
    }, 1000);

    return clearTimer;
  }, [remaining, clearTimer]);

  useEffect(() => {
    if (remaining <= 0) {
      fire();
    }
  }, [remaining, fire]);

  return (
    <Button
      variant="primary"
      fullWidth
      className="mt-6 animate-slide-up"
      onClick={fire}
    >
      CONTINUE{remaining > 0 ? ` · ${remaining}s` : ''}
    </Button>
  );
}
