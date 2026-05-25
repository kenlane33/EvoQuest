'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Hud } from '@/components/common/Hud';
import { EtymologyCard } from '@/components/etymology/EtymologyCard';
import { feedbackHeadlineForAttempt } from '@/audio/feedback-phrases';
import {
  buildFeedbackReadBundle,
  feedbackDescReadText,
  feedbackPageReadText,
} from '@/audio/feedback-read-text';
import { getQuizReadText } from '@/audio/quiz-read-text';
import { canAutoReadAloud } from '@/audio/read-aloud';
import { stopPocketTtsEngine } from '@/audio/pocket-tts-engine';
import { teachToPlainText } from '@/audio/teach-text';
import { SpeakButton } from '@/components/content/SpeakButton';
import {
  QuestionSpeakProvider,
  useQuestionSpeak,
} from '@/components/audio/question-speak-context';
import { TeachPanel } from '@/components/content/TeachPanel';
import { HintRevealer } from '@/components/hint/HintRevealer';
import {
  buildQuestionReadBundle,
  useQuestionTtsPreload,
} from '@/hooks/use-question-tts-preload';
import { useFeedbackAutoRead } from '@/hooks/use-feedback-auto-read';
import { useFeedbackReadPreload } from '@/hooks/use-feedback-read-preload';
import { useImmediateFeedbackSpeak } from '@/hooks/use-immediate-feedback-speak';
import { usePageReadAloud } from '@/hooks/use-page-read-aloud';
import { AnswerFeedbackFlash } from '@/components/play/AnswerFeedbackFlash';
import { PauseModal } from '@/components/play/PauseModal';
import { getUnitById } from '@/content/catalog';
import { ulid } from '@/lib/id';
import { devMark } from '@/lib/dev-mark';
import { updateUnitProgress as computeProgress } from '@/engine/scoring';
import { REGISTRY } from '@/engine/templates/registry';
import '@/engine/templates';
import { cn } from '@/lib/cn';
import {
  getQuizAcceptableAnswers,
  getSafePlayHeading,
  shouldShowPlayEtymology,
} from '@/lib/quiz-answer-leak';
import { useAppStore } from '@/store/app-store';
import type {
  ActiveSession,
  Attempt,
  Feedback,
  InnerQuestion,
  KnowledgeUnit,
  QuizTemplate,
  SessionState,
  SpeedRevealData,
} from '@/types';

type PlaySessionProps = {
  sessionId: string;
};

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getQuiz(unit: KnowledgeUnit, templateId: string): QuizTemplate | undefined {
  return unit.quizzes.find((q) => q.id === templateId);
}

function getPlayContext(unit: KnowledgeUnit, quiz: QuizTemplate) {
  const fallback = {
    root: unit.teach.etymology?.rootSummary ?? unit.teach.headline,
    mnemonic: unit.teach.mnemonic,
  };
  if (quiz.kind === 'speed-reveal-mnemonic') {
    return { root: quiz.data.root, mnemonic: quiz.data.mnemonic };
  }
  const data = quiz.data as {
    root?: string;
    mnemonic?: string;
    poweredIdea?: string;
  };
  return {
    root: data.root ?? fallback.root,
    mnemonic: data.mnemonic ?? fallback.mnemonic,
  };
}

function MultipleChoiceQuestion({
  question,
  disabled,
  onAnswer,
  descText,
}: {
  question: Extract<InnerQuestion, { kind: 'multiple-choice' }>;
  disabled: boolean;
  onAnswer: (correct: boolean) => void;
  descText?: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);

  function choose(index: number) {
    if (disabled || picked !== null) return;
    setPicked(index);
    onAnswer(index === question.correctIndex);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-body-lg text-(--text-secondary)">{question.prompt}</p>
        {descText ? (
          <SpeakButton slot="desc" text={descText} label="Read question" className="mt-0.5" />
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        {question.options.map((opt, i) => {
          const isCorrect = picked !== null && i === question.correctIndex;
          const isWrong = picked === i && i !== question.correctIndex;
          const faded = picked !== null && !isCorrect && !isWrong;
          return (
            <Button
              key={opt}
              variant="ghost"
              fullWidth
              disabled={disabled || picked !== null}
              onClick={() => choose(i)}
              className={cn(
                'justify-between rounded-(--r-lg) border px-4 py-3 text-left text-body font-semibold hover:bg-transparent',
                isCorrect &&
                  'border-[color-mix(in_oklab,var(--status-correct)_35%,transparent)] bg-[color-mix(in_oklab,var(--status-correct)_15%,transparent)] text-(--status-correct)',
                isWrong &&
                  'border-[color-mix(in_oklab,var(--status-wrong)_35%,transparent)] bg-[color-mix(in_oklab,var(--status-wrong)_15%,transparent)] text-(--status-wrong)',
                faded && 'opacity-25',
                picked === null &&
                  'border-(--border-light) bg-(--bg-card) hover:border-(--border-medium) hover:bg-(--bg-card-hi)',
              )}
            >
              <span>{opt}</span>
              {isCorrect ? (
                <span aria-hidden className="ml-3 shrink-0 text-lg font-bold text-(--status-correct)">
                  ✓
                </span>
              ) : isWrong ? (
                <span aria-hidden className="ml-3 shrink-0 text-lg font-bold text-(--status-wrong)">
                  ✗
                </span>
              ) : null}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function FillQuestion({
  question,
  disabled,
  onAnswer,
  descText,
  onHintShown,
}: {
  question: Extract<InnerQuestion, { kind: 'fill' }>;
  disabled: boolean;
  onAnswer: (correct: boolean) => void;
  descText?: string;
  onHintShown?: (shown: boolean) => void;
}) {
  const [val, setVal] = useState('');
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  function submit() {
    if (!val.trim() || done || disabled) return;
    setDone(true);
    const ok = question.acceptable.some((a) => norm(val) === norm(a));
    onAnswer(ok);
  }

  const parts = question.prompt.split('_____');
  const ok = done && question.acceptable.some((a) => norm(val) === norm(a));
  const correctAnswer = question.acceptable[0];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-body-lg leading-relaxed text-(--text-primary)">
            {parts[0]}
            <span
              className={cn(
                'mx-1 inline-flex min-w-[4rem] items-center gap-1 border-b-2 px-1 font-bold',
                done
                  ? 'border-(--status-correct) text-(--status-correct)'
                  : 'border-(--accent-cyan) text-(--accent-cyan)',
              )}
            >
              {done ? (ok ? val : correctAnswer) : val || '?????'}
              {done ? (
                <span aria-hidden className="text-(--status-correct)">
                  ✓
                </span>
              ) : null}
            </span>
            {parts[1]}
          </p>
          {descText ? (
            <SpeakButton slot="desc" text={descText} label="Read question" className="mt-0.5" />
          ) : null}
        </div>
      </Card>
      {done && !ok && (
        <p className="text-meta text-(--text-dim)">
          Your answer:{' '}
          <span className="font-semibold text-(--status-wrong)">
            ✗ {val}
          </span>
        </p>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={val}
          disabled={done || disabled}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Type your answer…"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 text-body text-(--text-primary) outline-none focus:border-(--accent-cyan)"
        />
        <Button variant="primary" disabled={!val.trim() || done || disabled} onClick={submit}>
          GO
        </Button>
      </div>
      {!done && question.hint && (
        <div className="flex items-center gap-1">
          <Button
            variant="text"
            onClick={() => {
              setShowHint(true);
              onHintShown?.(true);
            }}
            className={showHint ? 'text-(--accent-amber) hover:text-(--accent-amber)' : 'hover:text-(--accent-amber)'}
          >
            {showHint ? `💡 ${question.hint}` : 'Need a hint?'}
          </Button>
        </div>
      )}
    </div>
  );
}

function FeedbackNextButton({
  label,
  onNext,
}: {
  label: string;
  onNext: () => void;
}) {
  const { stop } = useQuestionSpeak();

  return (
    <Button
      variant="secondary"
      fullWidth
      className="mt-6"
      onClick={() => {
        stop();
        onNext();
      }}
    >
      {label}
    </Button>
  );
}

function ContinueCountdownButton({
  onContinue,
  countdownSec = 3,
  continueReady = true,
}: {
  onContinue: () => void;
  countdownSec?: number;
  /** When false, hold until answer-reaction speech finishes. */
  continueReady?: boolean;
}) {
  const [remaining, setRemaining] = useState(countdownSec);
  const firedRef = useRef(false);

  const fire = useCallback(() => {
    if (firedRef.current || !continueReady) return;
    firedRef.current = true;
    onContinue();
  }, [onContinue, continueReady]);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  useEffect(() => {
    if (remaining <= 0 && continueReady) {
      fire();
    }
  }, [remaining, continueReady, fire]);

  const waitingOnSpeech = !continueReady;

  return (
    <Button
      variant="primary"
      fullWidth
      className="mt-6 animate-slide-up"
      onClick={fire}
      disabled={waitingOnSpeech}
    >
      CONTINUE
      {remaining > 0 ? ` · ${remaining}s` : waitingOnSpeech ? ' · …' : ''}
    </Button>
  );
}

function TemplateRenderer({
  data,
  answered,
  onAnswer,
  descText,
  onHintShown,
}: {
  data: SpeedRevealData;
  answered: boolean;
  onAnswer: (correct: boolean) => void;
  descText?: string;
  onHintShown?: (shown: boolean) => void;
}) {
  if (data.question.kind === 'multiple-choice') {
    return (
      <MultipleChoiceQuestion
        question={data.question}
        disabled={answered}
        onAnswer={onAnswer}
        descText={descText}
      />
    );
  }
  return (
    <FillQuestion
      question={data.question}
      disabled={answered}
      onAnswer={onAnswer}
      descText={descText}
      onHintShown={onHintShown}
    />
  );
}

export function PlaySession({ sessionId }: PlaySessionProps) {
  const navigate = useNavigate();
  const settings = useAppStore((s) => s.settings);
  const sessionState = useAppStore((s) => s.sessionState);
  const setSessionState = useAppStore((s) => s.setSessionState);
  const updateUnitProgress = useAppStore((s) => s.updateUnitProgress);
  const addJourney = useAppStore((s) => s.addJourney);
  const clearSession = useAppStore((s) => s.clearSession);

  const [answered, setAnswered] = useState(false);
  const [pendingCorrect, setPendingCorrect] = useState<boolean | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [fillHintShown, setFillHintShown] = useState(false);
  const [mnemonicPhase, setMnemonicPhase] = useState<'waiting' | 'revealing' | 'done'>('waiting');
  const startRef = useRef<number>(Date.now());
  const phaseRef = useRef<string>('loading');
  const pauseSnapshotRef = useRef<
    Extract<SessionState, { phase: 'brief' | 'play' | 'feedback' }> | null
  >(null);

  const session: ActiveSession | null = useMemo(() => {
    if (sessionState.phase === 'end') return null;
    if (
      sessionState.phase === 'brief' ||
      sessionState.phase === 'play' ||
      sessionState.phase === 'feedback' ||
      sessionState.phase === 'paused'
    ) {
      return sessionState.session;
    }
    return null;
  }, [sessionState]);

  useEffect(() => {
    if (sessionState.phase === 'end') return;
    if (!session) {
      navigate({ to: '/' });
      return;
    }
    if (session.journeyId !== sessionId) {
      navigate({ to: '/' });
    }
  }, [session, sessionId, navigate, sessionState.phase]);

  useEffect(() => {
    if (!session) return;
    startRef.current = session.startedAt;
    const iv = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(iv);
  }, [session]);

  phaseRef.current = sessionState.phase;

  useEffect(() => {
    if (sessionState.phase === 'play') {
      setAnswered(false);
      setPendingCorrect(null);
      setFillHintShown(false);
      setMnemonicPhase('waiting');
    }
  }, [sessionState.phase, session?.currentIndex]);

  const handleAnswerSelect = useCallback(
    (correct: boolean) => {
      if (!session || sessionState.phase !== 'play' || pendingCorrect !== null) return;
      setAnswered(true);
      setPendingCorrect(correct);
    },
    [session, sessionState.phase, pendingCorrect],
  );

  const handleContinueToFeedback = useCallback(() => {
    if (!session || sessionState.phase !== 'play' || pendingCorrect === null) return;

    const correct = pendingCorrect;
    setPendingCorrect(null);

    const item = session.queue[session.currentIndex];
    const unit = getUnitById(item.unitId);
    const attempt: Attempt = {
      attemptId: ulid(),
      unitId: item.unitId,
      templateKind: item.templateKind,
      templateId: item.templateId,
      correct,
      ms: Date.now() - startRef.current,
    };

    const nextStreak = correct ? session.currentStreak + 1 : 0;
    const nextSession: ActiveSession = {
      ...session,
      attempts: [...session.attempts, attempt],
      currentStreak: nextStreak,
      bestStreak: Math.max(session.bestStreak, nextStreak),
    };

    if (unit) {
      const prev = useAppStore.getState().unitProgress[item.unitId];
      const updated = computeProgress(prev, attempt);
      updateUnitProgress(item.unitId, {
        ...updated,
        achievementEarned: updated.correct > 0,
        tier: updated.correct > 0 ? updated.tier : 'unlocked',
        unlockedAt: updated.unlockedAt ?? (correct ? Date.now() : undefined),
      });
    }

    const feedback: Feedback = {
      correct,
      unitId: item.unitId,
      templateKind: item.templateKind,
      explanation: unit?.teach.poweredIdea,
    };

    setSessionState({ phase: 'feedback', session: nextSession, feedback });
  }, [session, sessionState.phase, pendingCorrect, setSessionState, updateUnitProgress]);

  const goNext = useCallback(() => {
    stopPocketTtsEngine();
    if (sessionState.phase !== 'feedback') return;
    const { session } = sessionState;
    const nextIndex = session.currentIndex + 1;

    if (nextIndex >= session.queue.length) {
      const correct = session.attempts.filter((a) => a.correct).length;
      addJourney({
        id: session.journeyId,
        startedAt: session.startedAt,
        endedAt: Date.now(),
        selection: session.selection,
        attempts: session.attempts,
        achievementsEarned: [],
        artifactsSaved: session.artifactIds,
        morphemesTouchedFirst: [],
        finalScore: {
          correct,
          total: session.attempts.length,
          bestStreak: session.bestStreak,
        },
        elapsedSec,
      });
      setSessionState({
        phase: 'end',
        summary: {
          journeyId: session.journeyId,
          correct,
          total: session.attempts.length,
          bestStreak: session.bestStreak,
          elapsedMs: elapsedSec * 1000,
        },
      });
      clearSession(false);
      return;
    }

    const nextSession = { ...session, currentIndex: nextIndex };
    setSessionState({ phase: 'brief', session: nextSession });
  }, [sessionState, elapsedSec, addJourney, clearSession, setSessionState]);

  const pauseQuest = useCallback(() => {
    const state = useAppStore.getState().sessionState;
    if (state.phase !== 'brief' && state.phase !== 'play' && state.phase !== 'feedback') {
      return;
    }
    pauseSnapshotRef.current = state;
    setSessionState({ phase: 'paused', session: state.session });
  }, [setSessionState]);

  const resumeQuest = useCallback(() => {
    const state = useAppStore.getState().sessionState;
    if (state.phase !== 'paused') return;

    const snap =
      pauseSnapshotRef.current ??
      (state.session.inFlightSnapshot
        ? ({ phase: 'play' as const, session: state.session })
        : ({ phase: 'brief' as const, session: state.session }));

    setSessionState(snap);
    pauseSnapshotRef.current = null;
  }, [setSessionState]);

  const endQuest = useCallback(() => {
    const state = useAppStore.getState().sessionState;
    if (state.phase !== 'paused') return;
    const session = state.session;
    const correct = session.attempts.filter((a) => a.correct).length;

    addJourney({
      id: session.journeyId,
      startedAt: session.startedAt,
      endedAt: Date.now(),
      abandoned: true,
      selection: session.selection,
      attempts: session.attempts,
      achievementsEarned: [],
      artifactsSaved: session.artifactIds,
      morphemesTouchedFirst: [],
      finalScore: {
        correct,
        total: session.attempts.length,
        bestStreak: session.bestStreak,
      },
      elapsedSec,
    });

    pauseSnapshotRef.current = null;
    clearSession(true);
    navigate({ to: '/' });
  }, [addJourney, clearSession, elapsedSec, navigate]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      const phase = useAppStore.getState().sessionState.phase;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (phase === 'paused') resumeQuest();
        else if (phase === 'brief' || phase === 'play' || phase === 'feedback') pauseQuest();
        return;
      }

      if (e.key === 'p' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (phase === 'paused') resumeQuest();
        else if (phase === 'brief' || phase === 'play' || phase === 'feedback') pauseQuest();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pauseQuest, resumeQuest]);

  const activeItem =
    session && session.currentIndex < session.queue.length
      ? session.queue[session.currentIndex]
      : null;
  const activeUnit = activeItem ? getUnitById(activeItem.unitId) : undefined;
  const activeQuiz =
    activeUnit && activeItem ? getQuiz(activeUnit, activeItem.templateId) : undefined;
  const activePlayCtx = useMemo(
    () => (activeUnit && activeQuiz ? getPlayContext(activeUnit, activeQuiz) : null),
    [activeUnit, activeQuiz],
  );

  const questionDescText = activeQuiz ? getQuizReadText(activeQuiz) : '';

  const acceptableAnswers = useMemo(
    () => (activeQuiz ? getQuizAcceptableAnswers(activeQuiz) : []),
    [activeQuiz],
  );

  const playHeading = useMemo(() => {
    if (!activeUnit) return '';
    return getSafePlayHeading(activeUnit, acceptableAnswers);
  }, [activeUnit, acceptableAnswers]);

  const showPlayEtymology = useMemo(() => {
    if (!activePlayCtx) return false;
    return shouldShowPlayEtymology(activePlayCtx.root, acceptableAnswers, answered);
  }, [activePlayCtx, acceptableAnswers, answered]);

  const fillHintText = useMemo(() => {
    if (!activeQuiz) return undefined;
    const data = activeQuiz.data as { question?: { hint?: string } };
    const hint = data.question?.hint;
    return typeof hint === 'string' && hint.trim() ? hint.trim() : undefined;
  }, [activeQuiz]);

  const sidebarSpeakText = useMemo(() => {
    if (!activePlayCtx) return '';
    if (fillHintShown && fillHintText) return fillHintText;
    if (mnemonicPhase !== 'waiting' && activePlayCtx.mnemonic?.trim()) {
      const rootPrefix = showPlayEtymology ? `${activePlayCtx.root}. ` : '';
      return `${rootPrefix}Remember: ${activePlayCtx.mnemonic}`;
    }
    if (!showPlayEtymology) return '';
    return activePlayCtx.root;
  }, [activePlayCtx, fillHintShown, fillHintText, mnemonicPhase, showPlayEtymology]);

  const feedbackHeadline = useMemo(() => {
    if (sessionState.phase !== 'feedback' || !session) return '';
    return feedbackHeadlineForAttempt(
      session.journeyId,
      session.currentIndex,
      session.currentStreak,
      sessionState.feedback.correct,
      true,
    );
  }, [sessionState, session]);

  const pendingFeedbackHeadline = useMemo(() => {
    if (pendingCorrect === null || !session || sessionState.phase !== 'play') return null;
    return feedbackHeadlineForAttempt(
      session.journeyId,
      session.currentIndex,
      session.currentStreak,
      pendingCorrect,
      false,
    );
  }, [pendingCorrect, session, sessionState.phase]);

  const feedbackPreloadTarget = useMemo(
    () =>
      session && sessionState.phase === 'play' && activeUnit
        ? {
            journeyId: session.journeyId,
            questionIndex: session.currentIndex,
            currentStreak: session.currentStreak,
            unit: activeUnit,
            playCtx: activePlayCtx,
          }
        : null,
    [session, sessionState.phase, activeUnit, activePlayCtx],
  );

  useFeedbackReadPreload(feedbackPreloadTarget);

  const answerReactionReady = useImmediateFeedbackSpeak(pendingFeedbackHeadline);

  const holdForReactionSpeech = Boolean(
    pendingFeedbackHeadline && canAutoReadAloud(settings.reading),
  );
  const continueReady = !holdForReactionSpeech || answerReactionReady;

  const feedbackReadBundle = useMemo(() => {
    if (sessionState.phase !== 'feedback' || !activeUnit) return null;
    const explanation =
      sessionState.feedback.explanation ??
      'Keep going — every attempt builds the map.';
    return buildFeedbackReadBundle(
      feedbackHeadline,
      explanation,
      activeUnit.teach,
      activePlayCtx,
    );
  }, [sessionState, activeUnit, feedbackHeadline, activePlayCtx]);

  const feedbackDescText = feedbackReadBundle
    ? feedbackDescReadText(feedbackReadBundle)
    : '';
  const feedbackSidebarText = feedbackReadBundle?.sidebar ?? '';

  const pageReadText = useMemo(() => {
    if (sessionState.phase === 'end') {
      const { summary } = sessionState;
      const pct =
        summary.total > 0
          ? Math.round((summary.correct / summary.total) * 100)
          : 0;
      const grade =
        pct >= 93
          ? 'A'
          : pct >= 85
            ? 'B plus'
            : pct >= 78
              ? 'B'
              : pct >= 70
                ? 'C'
                : pct >= 60
                  ? 'D'
                  : 'F';
      return `Journey complete. Grade ${grade}. ${summary.correct} of ${summary.total} correct, ${pct} percent. Best streak ${summary.bestStreak}.`;
    }
    if (!session || !activeUnit) return '';

    if (sessionState.phase === 'brief') {
      return teachToPlainText(activeUnit.teach, { includeBody: false });
    }

    if (sessionState.phase === 'feedback') {
      if (feedbackReadBundle) {
        return feedbackPageReadText(feedbackReadBundle);
      }
      return '';
    }

    if (
      (sessionState.phase === 'play' || sessionState.phase === 'paused') &&
      activeQuiz
    ) {
      return getQuizReadText(activeQuiz);
    }

    return '';
  }, [sessionState, session, activeUnit, activeQuiz, feedbackReadBundle]);

  const nextQuestionBundle = useMemo(() => {
    if (!session) return null;
    const nextIndex =
      sessionState.phase === 'feedback'
        ? session.currentIndex + 1
        : session.currentIndex + 1;
    if (nextIndex >= session.queue.length) return null;
    const item = session.queue[nextIndex];
    const unit = getUnitById(item.unitId);
    const quiz = unit ? getQuiz(unit, item.templateId) : undefined;
    if (!unit || !quiz) return null;
    return buildQuestionReadBundle(unit, quiz, getPlayContext(unit, quiz));
  }, [session, sessionState.phase]);

  useQuestionTtsPreload({
    bundle:
      sessionState.phase === 'play' ||
      sessionState.phase === 'paused' ||
      sessionState.phase === 'feedback'
        ? nextQuestionBundle
        : null,
    delayMs: sessionState.phase === 'feedback' ? 400 : 1400,
  });

  const pageReadAutoKey = useMemo(() => {
    if (sessionState.phase === 'end') return 'end';
    if (!session) return 'none';
    return `${sessionState.phase}:${session.currentIndex}:${session.journeyId}`;
  }, [sessionState.phase, session]);

  useFeedbackAutoRead(
    feedbackReadBundle,
    sessionState.phase === 'feedback' ? pageReadAutoKey : null,
  );

  const briefAutoAdvance = canAutoReadAloud(settings.reading);

  const briefReadDone = usePageReadAloud(pageReadText, {
    autoRead: sessionState.phase === 'brief',
    autoReadKey: pageReadAutoKey,
  });

  const advanceBriefToPlay = useCallback(() => {
    if (phaseRef.current !== 'brief' || !session) return;
    setSessionState({ phase: 'play', session });
    setAnswered(false);
    setPendingCorrect(null);
  }, [session, setSessionState]);

  useEffect(() => {
    if (sessionState.phase !== 'brief' || !session || !briefAutoAdvance) return;
    if (!briefReadDone) return;
    advanceBriefToPlay();
  }, [
    sessionState.phase,
    session,
    briefAutoAdvance,
    briefReadDone,
    advanceBriefToPlay,
  ]);

  if (sessionState.phase === 'end') {
    const { summary } = sessionState;
    const pct =
      summary.total > 0 ? Math.round((summary.correct / summary.total) * 100) : 0;
    const grade =
      pct >= 93 ? 'A' : pct >= 85 ? 'B+' : pct >= 78 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';

    return (
      <div {...devMark('end')} className="mx-auto max-w-(--w-narrow) px-5 py-10 text-center animate-slide-up">
        <div {...devMark('end.grade')} className="mb-2 text-5xl" aria-hidden>
          🏆
        </div>
        <div
          {...devMark('end.letter')}
          className="text-display-xl font-black"
          style={{ color: pct >= 85 ? 'var(--status-correct)' : pct >= 70 ? 'var(--status-streak)' : 'var(--status-wrong)' }}
        >
          {grade}
        </div>
        <p {...devMark('end.score')} className="mt-2 text-body text-(--text-secondary)">
          {summary.correct}/{summary.total} correct — {pct}%
        </p>
        <p className="text-meta text-(--text-dim)">
          Best streak: {summary.bestStreak}🔥
        </p>
        <div {...devMark('end.actions')} className="mt-8 flex flex-col gap-3">
          <Button variant="primary" fullWidth {...devMark('end.home')} onClick={() => navigate({ to: '/' })}>
            BACK HOME
          </Button>
          <Button variant="secondary" fullWidth {...devMark('end.journeys')} onClick={() => navigate({ to: '/journeys' })}>
            VIEW JOURNEYS
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-(--text-dim)">
        Loading session…
      </div>
    );
  }

  const item = activeItem!;
  const unit = activeUnit!;
  const quiz = activeQuiz;
  const playCtx = activePlayCtx;
  const templateReg = quiz ? REGISTRY[quiz.kind] : undefined;
  const total = session.queue.length;
  const score = session.attempts.filter((a) => a.correct).length;
  const pctIndex =
    sessionState.phase === 'feedback' ? session.currentIndex + 1 : session.currentIndex;

  return (
    <>
      <Hud
        current={pctIndex + 1}
        total={total}
        score={score}
        streak={session.currentStreak}
        elapsedSec={elapsedSec}
        onProgressClick={pauseQuest}
      />

      {sessionState.phase === 'paused' && (
        <PauseModal
          session={session}
          elapsedSec={elapsedSec}
          onResume={resumeQuest}
          onEndJourney={endQuest}
        />
      )}

      {sessionState.phase === 'brief' && unit && (
        <div
          data-wing={unit.achievement.wingId}
          {...devMark('brief')}
          className="mx-auto flex min-h-screen max-w-(--w-content) flex-col items-center justify-center px-6 pt-16 animate-pop-in"
        >
          <div {...devMark('brief.hero')} className="text-center">
            <div
              {...devMark('brief.emoji')}
              className="mb-4 text-6xl glow-wing-lg"
              style={{ filter: 'drop-shadow(0 0 48px var(--wing-glow))' }}
            >
              {unit.emoji}
            </div>
            <h2 {...devMark('brief.title')} className="text-display-md font-black bg-[image:var(--wing-gradient)] bg-clip-text text-transparent">
              {unit.shortLabel}
            </h2>
          </div>
          <div {...devMark('brief.teach')} className="mt-6 w-full text-left">
            <TeachPanel teach={unit.teach} compact includeBody={false} />
            <p {...devMark('brief.idea')} className="mt-3 text-body font-semibold text-(--accent-cyan)">
              {unit.teach.poweredIdea}
            </p>
          </div>
          {!briefAutoAdvance ? (
            <Button
              variant="primary"
              fullWidth
              {...devMark('brief.cont')}
              className="mt-8 max-w-sm animate-slide-up"
              onClick={advanceBriefToPlay}
            >
              CONTINUE →
            </Button>
          ) : null}
        </div>
      )}

      {sessionState.phase === 'play' && unit && quiz && playCtx && (
        <QuestionSpeakProvider
          slots={{
            title: playHeading,
            desc: questionDescText,
            sidebar: sidebarSpeakText,
          }}
          autoSlot="desc"
          autoKey={pageReadAutoKey}
        >
          <div
            key={`play-${session.currentIndex}`}
            data-wing={unit.achievement.wingId}
            {...devMark('q')}
            className="mx-auto max-w-(--w-content) px-5 pb-10 pt-20 animate-slide-up"
          >
            <div {...devMark('q.title')} className="mb-5 flex items-center gap-2">
              <span className="text-xl">{unit.emoji}</span>
              <span
                className={cn(
                  'min-w-0 flex-1 font-headline font-black bg-[image:var(--wing-gradient)] bg-clip-text text-transparent',
                  playHeading === unit.shortLabel
                    ? 'text-micro uppercase tracking-[0.1em]'
                    : 'text-sm leading-snug',
                )}
              >
                {playHeading}
              </span>
              <SpeakButton
                slot="title"
                text={playHeading}
                label={`Read title: ${playHeading}`}
              />
            </div>

            {showPlayEtymology ? (
              <div {...devMark('q.etym')}>
                <EtymologyCard
                root={playCtx.root}
                speakText={sidebarSpeakText}
                speakSlot="sidebar"
                compact
                />
              </div>
            ) : null}

            <div {...devMark('q.body')} className="mt-6">
              {quiz.kind === 'speed-reveal-mnemonic' ? (
                <TemplateRenderer
                  data={quiz.data}
                  answered={answered}
                  onAnswer={handleAnswerSelect}
                  descText={questionDescText}
                  onHintShown={setFillHintShown}
                />
              ) : templateReg ? (
                <>
                  {questionDescText && quiz.kind !== 'predict-run-reflect' ? (
                    <div className="mb-3 flex justify-end">
                      <SpeakButton
                        slot="desc"
                        text={questionDescText}
                        label="Read question"
                      />
                    </div>
                  ) : null}
                  <templateReg.Renderer
                    data={quiz.data}
                    descText={questionDescText || undefined}
                    onResult={(result) => handleAnswerSelect(result.correct)}
                    resumeFromSnapshot={session.inFlightSnapshot}
                    saveSnapshot={(snapshot) => {
                      setSessionState({
                        phase: 'play',
                        session: { ...session, inFlightSnapshot: snapshot },
                      });
                    }}
                  />
                </>
              ) : (
                <p className="text-body text-(--text-dim)">This question type is not available yet.</p>
              )}
            </div>

            {playCtx.mnemonic ? (
              <div {...devMark('q.hint')}>
                <HintRevealer
                hint={{ root: playCtx.root, mnemonic: playCtx.mnemonic }}
                answered={answered}
                countdownSec={Math.round(settings.reveals.countdownMs / 1000)}
                revealMs={settings.reveals.revealMs}
                showRoot={false}
                onPhaseChange={setMnemonicPhase}
                />
              </div>
            ) : null}

            {pendingCorrect !== null && pendingFeedbackHeadline ? (
              <div {...devMark('q.flash')}>
                <AnswerFeedbackFlash
                key={`answer-feedback-${session.currentIndex}`}
                headline={pendingFeedbackHeadline}
                correct={pendingCorrect}
                />
              </div>
            ) : null}

            {pendingCorrect !== null && (
              <div {...devMark('q.cont')}>
                <ContinueCountdownButton
                key={`continue-${session.currentIndex}`}
                onContinue={handleContinueToFeedback}
                continueReady={continueReady}
                />
              </div>
            )}
          </div>
        </QuestionSpeakProvider>
      )}

      {sessionState.phase === 'feedback' && feedbackReadBundle && (
        <QuestionSpeakProvider
          slots={{
            title: feedbackReadBundle.headline,
            desc: feedbackDescText,
            sidebar: feedbackSidebarText,
          }}
          autoKey={pageReadAutoKey}
        >
          <div {...devMark('fb')} className="mx-auto max-w-(--w-content) px-5 pb-10 pt-20 animate-slide-up">
            {unit ? (
              <div {...devMark('fb.unit')} className="mb-5 flex items-center gap-2">
                <span className="text-xl">{unit.emoji}</span>
                <span className="min-w-0 flex-1 font-headline text-micro font-black uppercase tracking-[0.1em] bg-[image:var(--wing-gradient)] bg-clip-text text-transparent">
                  {unit.shortLabel}
                </span>
                <SpeakButton
                  text={unit.shortLabel}
                  label={`Read title: ${unit.shortLabel}`}
                />
              </div>
            ) : null}

            <div {...devMark('fb.verdict')} className="mb-6 text-center">
              <div
                {...devMark('fb.icon')}
                className={cn(
                  'mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-3xl',
                  sessionState.feedback.correct
                    ? 'bg-[color-mix(in_oklab,var(--status-correct)_15%,transparent)]'
                    : 'bg-[color-mix(in_oklab,var(--status-wrong)_15%,transparent)]',
                )}
              >
                {sessionState.feedback.correct ? '✓' : '✗'}
              </div>
              <div {...devMark('fb.headline')} className="flex items-center justify-center gap-2">
                <h3
                  className="text-headline-lg font-black"
                  style={{
                    color: sessionState.feedback.correct
                      ? 'var(--status-correct)'
                      : 'var(--status-wrong)',
                  }}
                >
                  {feedbackHeadline}
                </h3>
                <SpeakButton
                  slot="title"
                  text={feedbackReadBundle.headline}
                  label={`Read feedback: ${feedbackHeadline}`}
                />
              </div>
            </div>

            <Card {...devMark('fb.explain')} variant={sessionState.feedback.correct ? 'correct' : 'wrong'}>
              <div className="flex items-start gap-2">
                <p className="min-w-0 flex-1 text-body leading-relaxed text-(--text-secondary)">
                  {sessionState.feedback.explanation ??
                    'Keep going — every attempt builds the map.'}
                </p>
                {feedbackReadBundle.explanation ? (
                  <SpeakButton
                    slot="desc"
                    text={feedbackDescText}
                    label="Read explanation and lesson"
                  />
                ) : null}
              </div>
            </Card>

            {unit ? (
              <div {...devMark('fb.teach')} className="mt-4">
                <TeachPanel
                  teach={unit.teach}
                  compact
                  speakText={feedbackReadBundle.teach}
                  speakLabel={`Read lesson: ${unit.teach.headline}`}
                />
              </div>
            ) : null}

            {unit && playCtx && feedbackSidebarText ? (
              <div {...devMark('fb.etym')} className="mt-4">
                <EtymologyCard
                  root={playCtx.root}
                  mnemonic={playCtx.mnemonic}
                  speakText={feedbackSidebarText}
                  speakSlot="sidebar"
                  compact
                />
              </div>
            ) : null}

            <div {...devMark('fb.next')}>
              <FeedbackNextButton
              label={session.currentIndex + 1 >= total ? 'SEE RESULTS →' : 'NEXT →'}
              onNext={goNext}
              />
            </div>
          </div>
        </QuestionSpeakProvider>
      )}
    </>
  );
}
