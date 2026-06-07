/**
 * Ephemeral session UI phase in sessionStorage (tab-scoped resume for /play deep links).
 * ActiveSession data lives in localStorage; this restores brief/play/feedback/paused.
 */

import type { Feedback, SessionState } from '@/types';

const SESSION_UI_KEY = 'evo-quest.v1.session-ui';

type StoredSessionUi = {
  phase: 'brief' | 'play' | 'feedback' | 'paused';
  feedback?: Feedback;
};

function isStoredSessionUi(value: unknown): value is StoredSessionUi {
  if (!value || typeof value !== 'object') return false;
  const phase = (value as StoredSessionUi).phase;
  return phase === 'brief' || phase === 'play' || phase === 'feedback' || phase === 'paused';
}

export function persistSessionUi(state: SessionState): void {
  if (typeof sessionStorage === 'undefined') return;

  switch (state.phase) {
    case 'brief':
    case 'play':
    case 'paused':
      sessionStorage.setItem(SESSION_UI_KEY, JSON.stringify({ phase: state.phase }));
      return;
    case 'feedback':
      sessionStorage.setItem(
        SESSION_UI_KEY,
        JSON.stringify({ phase: 'feedback', feedback: state.feedback }),
      );
      return;
    default:
      sessionStorage.removeItem(SESSION_UI_KEY);
  }
}

export function clearSessionUi(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(SESSION_UI_KEY);
}

export function readSessionUi(): StoredSessionUi | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_UI_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStoredSessionUi(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Merge stored session payload with tab UI phase for cold /play loads. */
export function resumeSessionState(
  session: import('@/types/schemas').ActiveSession,
): Extract<SessionState, { phase: 'brief' | 'play' | 'feedback' | 'paused' }> {
  const ui = readSessionUi();
  if (ui?.phase === 'play') {
    return { phase: 'play', session };
  }
  if (ui?.phase === 'paused') {
    return { phase: 'paused', session };
  }
  if (ui?.phase === 'feedback' && ui.feedback) {
    return { phase: 'feedback', session, feedback: ui.feedback };
  }
  return { phase: 'brief', session };
}
