import { describe, expect, it } from 'vitest';
import { reduce, reconstructSession } from '@/engine/session';
import {
  makeAttempt,
  makeSession,
  SAMPLE_QUEUE,
  SAMPLE_SELECTION,
} from '@/test/fixtures';

describe('session reducer', () => {
  it('embarks from menu into brief with a new session', () => {
    const next = reduce({ phase: 'menu' }, {
      kind: 'embark',
      queue: SAMPLE_QUEUE,
      selection: SAMPLE_SELECTION,
    });

    expect(next.phase).toBe('brief');
    if (next.phase !== 'brief') return;

    expect(next.session.queue).toEqual(SAMPLE_QUEUE);
    expect(next.session.currentIndex).toBe(0);
    expect(next.session.attempts).toEqual([]);
    expect(next.session.selection).toEqual(SAMPLE_SELECTION);
  });

  it('moves brief → play → feedback → brief on correct answer', () => {
    let state = reduce({ phase: 'menu' }, {
      kind: 'embark',
      queue: SAMPLE_QUEUE,
      selection: SAMPLE_SELECTION,
    });
    expect(state.phase).toBe('brief');

    state = reduce(state, { kind: 'briefEnd' });
    expect(state.phase).toBe('play');

    state = reduce(state, {
      kind: 'answer',
      correct: true,
      ms: 800,
      details: { explanation: 'Nice.' },
    });
    expect(state.phase).toBe('feedback');
    if (state.phase !== 'feedback') return;

    expect(state.feedback.correct).toBe(true);
    expect(state.session.attempts).toHaveLength(1);
    expect(state.session.currentStreak).toBe(1);
    expect(state.session.bestStreak).toBe(1);

    state = reduce(state, { kind: 'feedbackEnd' });
    expect(state.phase).toBe('brief');
    if (state.phase !== 'brief') return;
    expect(state.session.currentIndex).toBe(1);
  });

  it('resets streak on wrong answer', () => {
    let state = reduce({ phase: 'menu' }, {
      kind: 'embark',
      queue: SAMPLE_QUEUE,
      selection: SAMPLE_SELECTION,
    });
    state = reduce(state, { kind: 'briefEnd' });
    state = reduce(state, { kind: 'answer', correct: true, ms: 500 });
    state = reduce(state, { kind: 'feedbackEnd' });
    state = reduce(state, { kind: 'briefEnd' });
    state = reduce(state, { kind: 'answer', correct: false, ms: 900 });

    expect(state.phase).toBe('feedback');
    if (state.phase !== 'feedback') return;
    expect(state.session.currentStreak).toBe(0);
    expect(state.session.bestStreak).toBe(1);
  });

  it('ends session after final feedback', () => {
    const single = [SAMPLE_QUEUE[0]];
    let state = reduce({ phase: 'menu' }, {
      kind: 'embark',
      queue: single,
      selection: { kind: 'quick-mix', length: 1 },
    });
    state = reduce(state, { kind: 'briefEnd' });
    state = reduce(state, { kind: 'answer', correct: true, ms: 400 });
    state = reduce(state, { kind: 'feedbackEnd' });

    expect(state.phase).toBe('end');
    if (state.phase !== 'end') return;
    expect(state.summary.correct).toBe(1);
    expect(state.summary.total).toBe(1);
    expect(state.summary.abandoned).toBeUndefined();
  });

  it('pauses and unpauses from play', () => {
    let state = reduce({ phase: 'menu' }, {
      kind: 'embark',
      queue: SAMPLE_QUEUE,
      selection: SAMPLE_SELECTION,
    });
    state = reduce(state, { kind: 'briefEnd' });
    state = reduce(state, { kind: 'pause' });

    expect(state.phase).toBe('paused');
    state = reduce(state, { kind: 'unpause' });
    expect(state.phase).toBe('brief');
  });

  it('stores mid-question snapshot during play', () => {
    let state = reduce({ phase: 'menu' }, {
      kind: 'embark',
      queue: SAMPLE_QUEUE,
      selection: SAMPLE_SELECTION,
    });
    state = reduce(state, { kind: 'briefEnd' });
    state = reduce(state, {
      kind: 'midQuestionSnapshot',
      snapshot: { revealed: true, input: 'sugars' },
    });

    expect(state.phase).toBe('play');
    if (state.phase !== 'play') return;
    expect(state.session.inFlightSnapshot).toEqual({ revealed: true, input: 'sugars' });
  });

  it('reconstructs play phase when inFlightSnapshot exists', () => {
    const saved = makeSession({
      inFlightSnapshot: { step: 2 },
      attempts: [makeAttempt({ correct: true })],
    });

    const state = reconstructSession(saved);
    expect(state.phase).toBe('play');
    if (state.phase !== 'play') return;
    expect(state.session.inFlightSnapshot).toEqual({ step: 2 });
  });

  it('reconstructs brief when no in-flight snapshot', () => {
    const saved = makeSession({ currentIndex: 1 });
    const state = reconstructSession(saved);
    expect(state.phase).toBe('brief');
  });
});
