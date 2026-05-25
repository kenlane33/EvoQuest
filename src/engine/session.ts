import type {
  ActiveSession,
  Attempt,
  Feedback,
  ScheduledItem,
  SessionAction,
  SessionState,
  SessionSummary,
} from '@/types';

export type { SessionAction, SessionState };

function ulid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

function computeFeedback(item: ScheduledItem, attempt: Attempt): Feedback {
  return {
    correct: attempt.correct,
    unitId: item.unitId,
    templateKind: item.templateKind,
    explanation: attempt.details?.explanation as string | undefined,
  };
}

function summarize(session: ActiveSession): SessionSummary {
  const correct = session.attempts.filter((a) => a.correct).length;
  return {
    journeyId: session.journeyId,
    correct,
    total: session.attempts.length,
    bestStreak: session.bestStreak,
    elapsedMs: Date.now() - session.startedAt,
  };
}

export function reduce(state: SessionState, action: SessionAction): SessionState {
  switch (state.phase) {
    case 'loading':
      if (action.kind === 'embark' || action.kind === 'resume') {
        return reduce({ phase: 'menu' }, action);
      }
      return state;

    case 'menu':
      if (action.kind === 'embark') {
        return {
          phase: 'brief',
          session: {
            journeyId: ulid(),
            queue: action.queue,
            currentIndex: 0,
            attempts: [],
            startedAt: Date.now(),
            bestStreak: 0,
            currentStreak: 0,
            selection: action.selection,
            powerupUsage: {},
            artifactIds: [],
          },
        };
      }
      if (action.kind === 'resume') {
        return { phase: 'brief', session: action.saved };
      }
      return state;

    case 'brief':
      if (action.kind === 'briefEnd') {
        return { phase: 'play', session: state.session };
      }
      if (action.kind === 'pause') {
        return { phase: 'paused', session: state.session };
      }
      if (action.kind === 'endJourney') {
        return {
          phase: 'end',
          summary: { ...summarize(state.session), abandoned: action.abandoned ?? true },
        };
      }
      return state;

    case 'play':
      if (action.kind === 'midQuestionSnapshot') {
        return {
          phase: 'play',
          session: { ...state.session, inFlightSnapshot: action.snapshot },
        };
      }
      if (action.kind === 'pause') {
        return { phase: 'paused', session: state.session };
      }
      if (action.kind === 'endJourney') {
        return {
          phase: 'end',
          summary: { ...summarize(state.session), abandoned: action.abandoned ?? true },
        };
      }
      if (action.kind === 'answer') {
        const item = state.session.queue[state.session.currentIndex];
        const attempt: Attempt = {
          attemptId: ulid(),
          unitId: item.unitId,
          templateKind: item.templateKind,
          templateId: item.templateId,
          correct: action.correct,
          ms: action.ms,
          details: action.details as Record<string, unknown> | undefined,
        };
        const newStreak = action.correct ? state.session.currentStreak + 1 : 0;
        return {
          phase: 'feedback',
          session: {
            ...state.session,
            attempts: [...state.session.attempts, attempt],
            currentStreak: newStreak,
            bestStreak: Math.max(state.session.bestStreak, newStreak),
            inFlightSnapshot: undefined,
          },
          feedback: computeFeedback(item, attempt),
        };
      }
      return state;

    case 'feedback':
      if (action.kind === 'pause') {
        return { phase: 'paused', session: state.session };
      }
      if (action.kind === 'feedbackEnd') {
        const next = state.session.currentIndex + 1;
        if (next >= state.session.queue.length) {
          return { phase: 'end', summary: summarize(state.session) };
        }
        return {
          phase: 'brief',
          session: { ...state.session, currentIndex: next },
        };
      }
      return state;

    case 'paused':
      if (action.kind === 'unpause') {
        return { phase: 'brief', session: state.session };
      }
      if (action.kind === 'endJourney') {
        return {
          phase: 'end',
          summary: { ...summarize(state.session), abandoned: action.abandoned ?? true },
        };
      }
      return state;

    case 'end':
      if (action.kind === 'endJourney') {
        return { phase: 'menu' };
      }
      return state;

    default:
      return state;
  }
}

export function reconstructSession(saved: ActiveSession): SessionState {
  return saved.inFlightSnapshot
    ? { phase: 'play', session: saved }
    : { phase: 'brief', session: saved };
}
