'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Hud } from '@/components/common/Hud';
import { EtymologyCard } from '@/components/etymology/EtymologyCard';
import { immediateFeedbackSpeakText } from '@/audio/feedback-answer-speak';
import { feedbackHeadlineForAttempt } from '@/audio/feedback-phrases';
import {
  buildFeedbackReadBundle,
  feedbackAutoReadText,
  feedbackDescReadText,
} from '@/audio/feedback-read-text';
import { getQuizReadText } from '@/audio/quiz-read-text';
import { canAutoReadAloud, REACTION_SPEAK_TIMEOUT_MS } from '@/tts';
import { stopReadAloud } from '@/tts';
import { teachToPlainText } from '@/audio/teach-text';
import { SpeakButton } from '@/components/content/SpeakButton';
import {
  QuestionSpeakProvider,
  useQuestionSpeak,
} from '@/tts';
import { TeachPanel } from '@/components/content/TeachPanel';
import { HintRevealer } from '@/components/hint/HintRevealer';
import {
  buildQuestionReadBundle,
  useQuestionTtsPreload,
} from '@/hooks/use-question-tts-preload';
import { useAchievementMomentSpeak } from '@/hooks/use-achievement-moment-speak';
import { useFeedbackAutoRead } from '@/hooks/use-feedback-auto-read';
import { useFeedbackReadPreload } from '@/hooks/use-feedback-read-preload';
import { useImmediateFeedbackSpeak } from '@/hooks/use-immediate-feedback-speak';
import { usePageReadAloud } from '@/tts';
import { calibrationNote, shouldAskConfidence } from '@/engine/calibration';
import { ConfidencePrompt } from '@/components/play/ConfidencePrompt';
import { ContinueCountdownButton } from '@/components/play/ContinueCountdownButton';
import { AnswerFeedbackFlash } from '@/components/play/AnswerFeedbackFlash';
import { CorrectAnswerReveal } from '@/components/play/CorrectAnswerReveal';
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
  getQuizCorrectAnswerDisplay,
  getSafePlayHeading,
  shouldShowPlayEtymology,
} from '@/lib/quiz-answer-leak';
import { getQuizPlayFigures } from '@/lib/quiz-figures';
import { QuizPlayFigures } from '@/components/play/QuizPlayFigures';
import { AchievementEarnedMoment } from '@/components/play/AchievementEarnedMoment';
import { FillQuestion } from '@/components/play/FillQuestion';
import { JourneyGainsPanel } from '@/components/play/JourneyGainsPanel';
import {
  PowerUpEffectProvider,
  buildActiveEffects,
} from '@/components/play/PowerUpEffectContext';
import { PowerUpFirstUseModal } from '@/components/play/PowerUpFirstUseModal';
import { PowerUpSwapModal } from '@/components/play/PowerUpSwapModal';
import { PowerUpTray } from '@/components/play/PowerUpTray';
import type { EarnedAchievement } from '@/engine/achievements/detect';
import { getPowerUpDef } from '@/engine/powerups/catalog';
import {
  processAnswerRewards,
  processJourneyEndRewards,
  trackMorphemesFromUnit,
} from '@/engine/progress/process-answer';
import type {
  ActiveSession,
  Attempt,
  Feedback,
  FillData,
  InnerQuestion,
  KnowledgeUnit,
  MatchData,
  PowerUpEffect,
  PowerUpInstance,
  QuizTemplate,
  ScenarioData,
  SessionState,
  SpeedRevealData,
} from '@/types';
import { useReadAloudBootstrap } from '@/tts';
import { useDebouncedSessionSnapshot } from '@/hooks/use-debounced-session-snapshot';
import { useAppStore } from '@/store/app-store';

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
  dimmedIndex,
}: {
  question: Extract<InnerQuestion, { kind: 'multiple-choice' }>;
  disabled: boolean;
  onAnswer: (correct: boolean) => void;
  descText?: string;
  dimmedIndex?: number;
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
          const dimmed = dimmedIndex === i && picked === null;
          const faded = picked !== null && !isCorrect && !isWrong;
          return (
            <Button
              key={opt}
              variant="ghost"
              fullWidth
              disabled={disabled || picked !== null || Boolean(dimmed)}
              onClick={() => choose(i)}
              className={cn(
                'justify-between rounded-(--r-lg) border px-4 py-3 text-left text-body font-semibold hover:bg-transparent',
                dimmed && 'opacity-20 pointer-events-none',
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

function shuffleOptions<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MatchQuestion({
  data,
  disabled,
  onAnswer,
  descText,
  dimmedOption,
}: {
  data: MatchData;
  disabled: boolean;
  onAnswer: (correct: boolean) => void;
  descText?: string;
  dimmedOption?: string;
}) {
  const options = useMemo(
    () => shuffleOptions([data.correct, ...data.distractors]),
    [data.correct, data.distractors],
  );
  const [picked, setPicked] = useState<string | null>(null);

  function choose(option: string) {
    if (disabled || picked !== null) return;
    setPicked(option);
    onAnswer(norm(option) === norm(data.correct));
  }

  const readText = descText || `Match the term: ${data.term}`;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-body-lg font-semibold text-(--text-primary)">
          {data.term}
        </p>
        <SpeakButton slot="desc" text={readText} label="Read question" className="mt-0.5" />
      </div>
      <p className="text-meta text-(--text-dim)">Pick the best match.</p>
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const isCorrect = picked !== null && norm(opt) === norm(data.correct);
          const isWrong = picked === opt && !isCorrect;
          const dimmed = dimmedOption && norm(opt) === norm(dimmedOption) && picked === null;
          return (
            <Button
              key={opt}
              variant="ghost"
              fullWidth
              disabled={disabled || picked !== null || Boolean(dimmed)}
              onClick={() => choose(opt)}
              className={cn(
                'justify-start rounded-(--r-lg) border px-4 py-3 text-left text-body font-semibold hover:bg-transparent',
                dimmed && 'opacity-20 pointer-events-none',
                isCorrect &&
                  'border-[color-mix(in_oklab,var(--status-correct)_35%,transparent)] bg-[color-mix(in_oklab,var(--status-correct)_15%,transparent)] text-(--status-correct)',
                isWrong &&
                  'border-[color-mix(in_oklab,var(--status-wrong)_35%,transparent)] bg-[color-mix(in_oklab,var(--status-wrong)_15%,transparent)] text-(--status-wrong)',
                picked === null &&
                  'border-(--border-light) bg-(--bg-card) hover:border-(--border-medium) hover:bg-(--bg-card-hi)',
              )}
            >
              {opt}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function ScenarioQuestion({
  data,
  disabled,
  onAnswer,
  descText,
  dimmedIndex,
}: {
  data: ScenarioData;
  disabled: boolean;
  onAnswer: (correct: boolean) => void;
  descText?: string;
  dimmedIndex?: number;
}) {
  const correctIndex = useMemo(() => {
    const idx = data.options.findIndex((o) => norm(o) === norm(data.answer));
    return idx >= 0 ? idx : 0;
  }, [data.answer, data.options]);

  const prompt = `${data.story}\n\n${data.question}`;

  return (
    <MultipleChoiceQuestion
      question={{
        kind: 'multiple-choice',
        prompt,
        options: data.options,
        correctIndex,
      }}
      disabled={disabled}
      onAnswer={onAnswer}
      descText={descText || prompt}
      dimmedIndex={dimmedIndex}
    />
  );
}

function FeedbackNextButton({
  label,
  onNext,
  ready = true,
}: {
  label: string;
  onNext: () => void;
  /** Pulse green when feedback auto-read has finished; always clickable. */
  ready?: boolean;
}) {
  const { stop } = useQuestionSpeak();

  return (
    <Button
      variant="secondary"
      fullWidth
      className={cn(
        'mt-6 transition-[border-color,background-color,box-shadow,color] duration-300',
        ready &&
          'animate-next-ready-pulse border-[color-mix(in_oklab,var(--status-correct)_55%,var(--border-light))] bg-[color-mix(in_oklab,var(--status-correct)_14%,var(--bg-card-hi))] text-(--status-correct) hover:border-(--status-correct) hover:bg-[color-mix(in_oklab,var(--status-correct)_22%,var(--bg-card-hi))]',
      )}
      onClick={() => {
        stop();
        onNext();
      }}
    >
      {label}
    </Button>
  );
}

function BriefContinueButton({
  onContinue,
  ready = true,
}: {
  onContinue: () => void;
  /** Pulse when auto-read has finished; always clickable. */
  ready?: boolean;
}) {
  return (
    <Button
      variant="secondary"
      fullWidth
      {...devMark('brief.cont')}
      className={cn(
        'mt-8 max-w-sm animate-slide-up transition-[border-color,background-color,box-shadow,color] duration-300',
        ready &&
          'animate-next-ready-pulse border-[color-mix(in_oklab,var(--status-correct)_55%,var(--border-light))] bg-[color-mix(in_oklab,var(--status-correct)_14%,var(--bg-card-hi))] text-(--text-primary) hover:border-(--status-correct) hover:bg-[color-mix(in_oklab,var(--status-correct)_22%,var(--bg-card-hi))]',
      )}
      onClick={() => {
        stopReadAloud();
        onContinue();
      }}
    >
      CONTINUE →
    </Button>
  );
}

function TemplateRenderer({
  data,
  answered,
  blocked,
  onAnswer,
  descText,
  onHintShown,
}: {
  data: SpeedRevealData;
  answered: boolean;
  blocked?: boolean;
  onAnswer: (correct: boolean) => void;
  descText?: string;
  onHintShown?: (shown: boolean) => void;
}) {
  const disabled = answered || Boolean(blocked);
  if (data.question.kind === 'multiple-choice') {
    return (
      <MultipleChoiceQuestion
        question={data.question}
        disabled={disabled}
        onAnswer={onAnswer}
        descText={descText}
      />
    );
  }
  return (
    <FillQuestion
      question={data.question}
      disabled={disabled}
      onAnswer={onAnswer}
      descText={descText}
      onHintShown={onHintShown}
    />
  );
}

export function PlaySession({ sessionId }: PlaySessionProps) {
  const navigate = useNavigate();
  const { settings, sessionState, powerups, pendingJourneyRewards } = useAppStore(
    useShallow((s) => ({
      settings: s.settings,
      sessionState: s.sessionState,
      powerups: s.powerups,
      pendingJourneyRewards: s.pendingJourneyRewards,
    })),
  );
  const {
    setSessionState,
    updateUnitProgress,
    addJourney,
    appendCalibration,
    clearSession,
    grantPowerUp,
    swapPowerUp,
    usePowerUp,
    markPowerUpFirstUseShown,
    rollStreakReward,
    earnAchievement,
    updateAchievementState,
    updateMorphemeProgress,
    appendPendingJourneyReward,
  } = useAppStore(
    useShallow((s) => ({
      setSessionState: s.setSessionState,
      updateUnitProgress: s.updateUnitProgress,
      addJourney: s.addJourney,
      appendCalibration: s.appendCalibration,
      clearSession: s.clearSession,
      grantPowerUp: s.grantPowerUp,
      swapPowerUp: s.swapPowerUp,
      usePowerUp: s.usePowerUp,
      markPowerUpFirstUseShown: s.markPowerUpFirstUseShown,
      rollStreakReward: s.rollStreakReward,
      earnAchievement: s.earnAchievement,
      updateAchievementState: s.updateAchievementState,
      updateMorphemeProgress: s.updateMorphemeProgress,
      appendPendingJourneyReward: s.appendPendingJourneyReward,
    })),
  );

  const [answered, setAnswered] = useState(false);
  const [pendingCorrect, setPendingCorrect] = useState<boolean | null>(null);
  /** True after the play-phase answer recap; feedback skips repeating headline + answer. */
  const [answerRecapShown, setAnswerRecapShown] = useState(false);
  const [confidenceValue, setConfidenceValue] = useState<number | null>(null);
  const [confidenceCommitted, setConfidenceCommitted] = useState(false);
  const [fillHintShown, setFillHintShown] = useState(false);
  const [mnemonicPhase, setMnemonicPhase] = useState<'waiting' | 'revealing' | 'done'>('waiting');
  const [activeEffects, setActiveEffects] = useState<PowerUpEffect[]>([]);
  const [pendingFirstUseId, setPendingFirstUseId] = useState<string | null>(null);
  const [pendingFirstUseSlot, setPendingFirstUseSlot] = useState<0 | 1 | 2 | null>(null);
  const [pendingSwap, setPendingSwap] = useState<PowerUpInstance | null>(null);
  const [earnedMomentQueue, setEarnedMomentQueue] = useState<EarnedAchievement[]>([]);
  const [shownMoment, setShownMoment] = useState<EarnedAchievement | null>(null);
  const [matchDimmedOption, setMatchDimmedOption] = useState<string | undefined>();
  const [mcDimmedIndex, setMcDimmedIndex] = useState<number | undefined>();
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

  const saveInFlightSnapshot = useDebouncedSessionSnapshot(session, setSessionState);

  useReadAloudBootstrap(settings.reading.enabled, settings.reading.voice);

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
  }, [session]);

  phaseRef.current = sessionState.phase;

  useEffect(() => {
    if (sessionState.phase === 'play') {
      setAnswered(false);
      setPendingCorrect(null);
      setAnswerRecapShown(false);
      setFillHintShown(false);
      setMnemonicPhase('waiting');
      setConfidenceValue(null);
      setConfidenceCommitted(false);
      setActiveEffects([]);
      setMatchDimmedOption(undefined);
      setMcDimmedIndex(undefined);
    }
  }, [sessionState.phase, session?.currentIndex]);

  const askConfidence = useMemo(() => {
    if (!session) return false;
    return shouldAskConfidence(
      settings.practice.confidenceFrequency,
      session.currentIndex,
    );
  }, [session, settings.practice.confidenceFrequency]);

  const confidenceReady = !askConfidence || confidenceCommitted;

  const queueEarnedMoment = useCallback((achievements: EarnedAchievement[]) => {
    if (!achievements.length) return;
    setEarnedMomentQueue((q) => [...q, ...achievements]);
  }, []);

  useEffect(() => {
    if (shownMoment || earnedMomentQueue.length === 0) return;
    const [next, ...rest] = earnedMomentQueue;
    setShownMoment(next);
    setEarnedMomentQueue(rest);
  }, [earnedMomentQueue, shownMoment]);

  const achievementMomentActive = shownMoment !== null || earnedMomentQueue.length > 0;
  const stopAchievementSpeak = useAchievementMomentSpeak(shownMoment);

  const applyEarnedAchievements = useCallback(
    (achievements: EarnedAchievement[]) => {
      for (const ach of achievements) {
        earnAchievement(ach.id);
        if (ach.powerUpReward) {
          const instance: PowerUpInstance = {
            id: ach.powerUpReward,
            acquiredAt: Date.now(),
          };
          const result = grantPowerUp(instance);
          if (result.needsSwap) setPendingSwap(instance);
        }
      }
      queueEarnedMoment(achievements);
    },
    [earnAchievement, grantPowerUp, queueEarnedMoment],
  );

  const commitPowerUpUse = useCallback(
    (
      slotIndex: 0 | 1 | 2,
      instance: PowerUpInstance,
      effects: PowerUpEffect[],
      templateKind: string,
    ) => {
      usePowerUp(slotIndex);
      setActiveEffects(effects);

      for (const effect of effects) {
        if (effect.kind === 'reveal-option' && templateKind === 'match') {
          const currentSession = useAppStore.getState().sessionState;
          if (currentSession.phase === 'play' || currentSession.phase === 'paused') {
            const s = currentSession.session;
            const unit = getUnitById(s.queue[s.currentIndex].unitId);
            const quiz = unit?.quizzes.find((q) => q.id === s.queue[s.currentIndex].templateId);
            if (quiz?.kind === 'match') {
              const wrongs = quiz.data.distractors.filter((d) => d !== quiz.data.correct);
              if (wrongs.length) {
                setMatchDimmedOption(wrongs[Math.floor(Math.random() * wrongs.length)]);
              }
            }
          }
        }
        if (effect.kind === 'reveal-option' && templateKind === 'scenario') {
          const currentSession = useAppStore.getState().sessionState;
          if (currentSession.phase === 'play' || currentSession.phase === 'paused') {
            const s = currentSession.session;
            const unit = getUnitById(s.queue[s.currentIndex].unitId);
            const quiz = unit?.quizzes.find((q) => q.id === s.queue[s.currentIndex].templateId);
            if (quiz?.kind === 'scenario') {
              const wrongIndices = quiz.data.options
                .map((_, i) => i)
                .filter((i) => i !== quiz.data.options.indexOf(quiz.data.answer));
              if (wrongIndices.length) {
                setMcDimmedIndex(
                  wrongIndices[Math.floor(Math.random() * wrongIndices.length)],
                );
              }
            }
          }
        }
      }

      const currentSession = useAppStore.getState().sessionState;
      if (currentSession.phase === 'play' || currentSession.phase === 'paused') {
        const s = currentSession.session;
        const usage = s.powerupUsage ?? {};
        setSessionState({
          phase: 'play',
          session: {
            ...s,
            powerupUsage: { ...usage, [instance.id]: (usage[instance.id] ?? 0) + 1 },
          },
        });
      }
    },
    [setSessionState, usePowerUp],
  );

  const activatePowerUpAtSlot = useCallback(
    (slotIndex: 0 | 1 | 2) => {
      if (!session || sessionState.phase !== 'play') return;
      const instance = powerups.slots[slotIndex];
      if (!instance) return;
      const def = getPowerUpDef(instance.id);
      if (!def) return;

      const item = session.queue[session.currentIndex];

      if (def.effects.some((e) => e.kind === 'skip-no-penalty')) {
        usePowerUp(slotIndex);
        const requeue = { ...item };
        const newQueue = [...session.queue];
        newQueue.splice(session.currentIndex, 1);
        newQueue.push(requeue);
        setSessionState({
          phase: 'brief',
          session: { ...session, queue: newQueue, currentIndex: session.currentIndex },
        });
        return;
      }

      if (!powerups.firstUseShown.includes(instance.id)) {
        setPendingFirstUseId(instance.id);
        setPendingFirstUseSlot(slotIndex);
        return;
      }

      commitPowerUpUse(slotIndex, instance, def.effects, item.templateKind);
    },
    [session, sessionState.phase, powerups, setSessionState, usePowerUp, commitPowerUpUse],
  );

  const handleAnswerSelect = useCallback(
    (correct: boolean) => {
      if (!session || sessionState.phase !== 'play' || pendingCorrect !== null) return;
      if (!confidenceReady) return;
      setAnswered(true);
      setPendingCorrect(correct);
      setAnswerRecapShown(true);
    },
    [session, sessionState.phase, pendingCorrect, confidenceReady],
  );

  const handleContinueToFeedback = useCallback(() => {
    if (!session || sessionState.phase !== 'play' || pendingCorrect === null) return;

    stopReadAloud();

    const correct = pendingCorrect;
    const effectState = buildActiveEffects(activeEffects);

    if (!correct && effectState.allowRetry) {
      setPendingCorrect(null);
      setAnswerRecapShown(false);
      setAnswered(false);
      setActiveEffects(activeEffects.filter((e) => e.kind !== 'allow-retry'));
      return;
    }

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
      confidence: confidenceValue ?? undefined,
    };

    if (confidenceValue != null) {
      appendCalibration({
        attemptId: attempt.attemptId,
        unitId: item.unitId,
        templateKind: item.templateKind,
        confidence: confidenceValue,
        correct,
      });
    }

    let nextStreak = correct ? session.currentStreak + 1 : 0;
    if (!correct && effectState.streakShieldActive) {
      nextStreak = session.currentStreak;
      setActiveEffects(activeEffects.filter((e) => e.kind !== 'streak-shield'));
    }

    const nextSession: ActiveSession = {
      ...session,
      attempts: [...session.attempts, attempt],
      currentStreak: nextStreak,
      bestStreak: Math.max(session.bestStreak, nextStreak),
    };

    let nextProgress = unit
      ? computeProgress(useAppStore.getState().unitProgress[item.unitId], attempt)
      : undefined;
    const prevProgress = useAppStore.getState().unitProgress[item.unitId];

    if (unit && nextProgress) {
      updateUnitProgress(item.unitId, {
        ...nextProgress,
        achievementEarned: nextProgress.correct > 0,
        tier: nextProgress.correct > 0 ? nextProgress.tier : 'unlocked',
        unlockedAt: nextProgress.unlockedAt ?? (correct ? Date.now() : undefined),
      });

      const store = useAppStore.getState();
      const morphemeResult = trackMorphemesFromUnit(unit, store.morphemeProgress);
      for (const [id, prog] of Object.entries(morphemeResult.next)) {
        updateMorphemeProgress(id, prog);
      }
      if (morphemeResult.touchedFirst.length) {
        appendPendingJourneyReward({
          morphemesTouchedFirst: [
            ...store.pendingJourneyRewards.morphemesTouchedFirst,
            ...morphemeResult.touchedFirst,
          ],
        });
      }

      const rewards = processAnswerRewards({
        unit,
        prevProgress,
        nextProgress,
        correct,
        session: nextSession,
        nextStreak,
        unitProgress: { ...store.unitProgress, [item.unitId]: nextProgress },
        achievementState: store.achievementState,
        calibrationRecords: store.calibrationRecords,
        morphemeProgress: morphemeResult.next,
        artifactCount: session.artifactIds.length,
      });

      applyEarnedAchievements(rewards.achievements);
      if (rewards.tierUps.length) {
        appendPendingJourneyReward({ tierUps: [...store.pendingJourneyRewards.tierUps, ...rewards.tierUps] });
      }

      for (const bonus of rewards.wingClearBonuses) {
        updateAchievementState({
          firstClearedWingIds: [
            ...store.achievementState.firstClearedWingIds,
            bonus.wingId,
          ],
        });
        const commonResult = grantPowerUp(bonus.common);
        if (commonResult.needsSwap) setPendingSwap(bonus.common);
        const rareResult = grantPowerUp(bonus.rare);
        if (rareResult.needsSwap) setPendingSwap(bonus.rare);
      }

      if (rewards.streakRewardStreak) {
        const earned = rollStreakReward(rewards.streakRewardStreak, unit.achievement.wingId);
        if (earned && !useAppStore.getState().powerups.slots.some((s) => s?.id === earned.id)) {
          setPendingSwap(earned);
        }
      }
    }

    const feedback: Feedback = {
      correct,
      unitId: item.unitId,
      templateKind: item.templateKind,
      explanation:
        confidenceValue != null
          ? `${unit?.teach.poweredIdea ?? ''} ${calibrationNote(confidenceValue, correct)}`.trim()
          : unit?.teach.poweredIdea,
    };

    setSessionState({ phase: 'feedback', session: nextSession, feedback });
  }, [
    session,
    sessionState.phase,
    pendingCorrect,
    confidenceValue,
    activeEffects,
    setSessionState,
    updateUnitProgress,
    appendCalibration,
    updateMorphemeProgress,
    appendPendingJourneyReward,
    applyEarnedAchievements,
    updateAchievementState,
    grantPowerUp,
    rollStreakReward,
  ]);

  const finishJourney = useCallback(
    (session: ActiveSession, abandoned?: boolean) => {
      const elapsedSec = Math.floor((Date.now() - session.startedAt) / 1000);
      const correct = session.attempts.filter((a) => a.correct).length;
      const store = useAppStore.getState();
      const powerupsUsed = Object.values(session.powerupUsage).reduce((a, b) => a + b, 0);
      const endHidden = processJourneyEndRewards(
        {
          attempts: session.attempts,
          finalScore: { correct, total: session.attempts.length, bestStreak: session.bestStreak },
        },
        powerupsUsed,
        store.achievementState,
      );
      applyEarnedAchievements(endHidden);

      const rewards = store.pendingJourneyRewards;
      addJourney({
        id: session.journeyId,
        startedAt: session.startedAt,
        endedAt: Date.now(),
        abandoned,
        selection: session.selection,
        attempts: session.attempts,
        achievementsEarned: rewards.achievementsEarned,
        artifactsSaved: session.artifactIds,
        morphemesTouchedFirst: rewards.morphemesTouchedFirst,
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
    },
    [addJourney, applyEarnedAchievements, clearSession, setSessionState],
  );

  const goNext = useCallback(() => {
    stopReadAloud();
    if (sessionState.phase !== 'feedback') return;
    const { session } = sessionState;
    const nextIndex = session.currentIndex + 1;

    if (nextIndex >= session.queue.length) {
      finishJourney(session);
      return;
    }

    const nextSession = { ...session, currentIndex: nextIndex };
    setSessionState({ phase: 'brief', session: nextSession });
  }, [sessionState, finishJourney, setSessionState]);

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
    const elapsedSec = Math.floor((Date.now() - session.startedAt) / 1000);
    const correct = session.attempts.filter((a) => a.correct).length;
    const store = useAppStore.getState();
    const powerupsUsed = Object.values(session.powerupUsage).reduce((a, b) => a + b, 0);
    const endHidden = processJourneyEndRewards(
      {
        attempts: session.attempts,
        finalScore: { correct, total: session.attempts.length, bestStreak: session.bestStreak },
      },
      powerupsUsed,
      store.achievementState,
    );
    applyEarnedAchievements(endHidden);
    const rewards = store.pendingJourneyRewards;
    addJourney({
      id: session.journeyId,
      startedAt: session.startedAt,
      endedAt: Date.now(),
      abandoned: true,
      selection: session.selection,
      attempts: session.attempts,
      achievementsEarned: rewards.achievementsEarned,
      artifactsSaved: session.artifactIds,
      morphemesTouchedFirst: rewards.morphemesTouchedFirst,
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
  }, [addJourney, applyEarnedAchievements, clearSession, navigate]);

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

  const correctAnswerDisplay = useMemo(
    () => (activeQuiz ? getQuizCorrectAnswerDisplay(activeQuiz) : null),
    [activeQuiz],
  );

  const playHeading = useMemo(() => {
    if (!activeUnit) return '';
    return getSafePlayHeading(activeUnit, acceptableAnswers);
  }, [activeUnit, acceptableAnswers]);

  const quizPlayFigures = useMemo(() => {
    if (!activeUnit || !activeQuiz) return [];
    return getQuizPlayFigures(activeUnit, activeQuiz);
  }, [activeUnit, activeQuiz]);

  const effectState = buildActiveEffects(activeEffects);

  const showPlayEtymology = useMemo(() => {
    if (effectState.showEtymologyAll) return true;
    if (!activePlayCtx) return false;
    return shouldShowPlayEtymology(activePlayCtx.root, acceptableAnswers, answered);
  }, [activePlayCtx, acceptableAnswers, answered, effectState.showEtymologyAll]);

  const fillHintText = useMemo(() => {
    if (!activeQuiz) return undefined;
    const data = activeQuiz.data as { question?: { hint?: string }; hint?: string };
    const hint = data.question?.hint ?? data.hint;
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

  const pendingFeedbackSpeakText = useMemo(() => {
    if (pendingCorrect === null || !session || !activeQuiz || sessionState.phase !== 'play') {
      return null;
    }
    return immediateFeedbackSpeakText({
      journeyId: session.journeyId,
      questionIndex: session.currentIndex,
      currentStreak: session.currentStreak,
      correct: pendingCorrect,
      streakIncludesAnswer: false,
      quiz: activeQuiz,
    });
  }, [pendingCorrect, session, activeQuiz, sessionState.phase]);

  const feedbackPreloadTarget = useMemo(
    () =>
      session && sessionState.phase === 'play' && activeUnit && activeQuiz
        ? {
            journeyId: session.journeyId,
            questionIndex: session.currentIndex,
            currentStreak: session.currentStreak,
            unit: activeUnit,
            quiz: activeQuiz,
            playCtx: activePlayCtx,
          }
        : null,
    [session, sessionState.phase, activeUnit, activeQuiz, activePlayCtx],
  );

  useFeedbackReadPreload(feedbackPreloadTarget);

  useImmediateFeedbackSpeak(pendingFeedbackSpeakText);

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
        return feedbackAutoReadText(feedbackReadBundle);
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

  const feedbackAutoReadDone = useFeedbackAutoRead(
    feedbackReadBundle,
    sessionState.phase === 'feedback' && !achievementMomentActive
      ? pageReadAutoKey
      : null,
  );

  const feedbackNextReady =
    !achievementMomentActive &&
    (!canAutoReadAloud(settings.reading) ||
      !feedbackDescText ||
      feedbackAutoReadDone);

  const briefAutoAdvance = canAutoReadAloud(settings.reading);

  const briefReadDone = usePageReadAloud(pageReadText, {
    autoRead: sessionState.phase === 'brief',
    autoReadKey: pageReadAutoKey,
  });

  const advanceBriefToPlay = useCallback(() => {
    if (phaseRef.current !== 'brief' || !session) return;
    stopReadAloud();
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

  useEffect(() => {
    if (sessionState.phase !== 'brief' || !session || !briefAutoAdvance) return;
    const timeoutId = window.setTimeout(
      advanceBriefToPlay,
      REACTION_SPEAK_TIMEOUT_MS + 500,
    );
    return () => clearTimeout(timeoutId);
  }, [
    sessionState.phase,
    session,
    briefAutoAdvance,
    advanceBriefToPlay,
    pageReadAutoKey,
  ]);

  if (sessionState.phase === 'end') {
    const { summary } = sessionState;
    const pct =
      summary.total > 0 ? Math.round((summary.correct / summary.total) * 100) : 0;
    const grade =
      pct >= 93 ? 'A' : pct >= 85 ? 'B+' : pct >= 78 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';

    return (
      <div {...devMark('end')} className="mx-auto max-w-(--w-narrow) px-4 py-10 text-center animate-slide-up max-sm:px-3 safe-bottom">
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
        <JourneyGainsPanel
          achievementsEarned={pendingJourneyRewards.achievementsEarned}
          powerupsEarned={pendingJourneyRewards.powerupsEarned}
          morphemesTouchedFirst={pendingJourneyRewards.morphemesTouchedFirst}
          tierUps={pendingJourneyRewards.tierUps}
        />
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
        startedAt={session.startedAt}
        onProgressClick={pauseQuest}
      />

      {sessionState.phase === 'paused' && (
        <PauseModal
          session={session}
          onResume={resumeQuest}
          onEndJourney={endQuest}
        />
      )}

      {sessionState.phase === 'brief' && unit && (
        <div
          data-wing={unit.achievement.wingId}
          {...devMark('brief')}
          className="mx-auto flex min-h-[calc(100dvh-var(--hud-height,3.25rem))] max-w-(--w-content) flex-col items-center justify-center overflow-y-auto px-4 play-content-top play-content-bottom-with-readbar animate-pop-in max-sm:px-3"
        >
          <div {...devMark('brief.hero')} className="text-center">
            <div
              {...devMark('brief.emoji')}
              className="mb-4 text-5xl glow-wing-lg max-sm:text-4xl"
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
            {unit.teach.hook ? (
              <p className="mt-2 text-meta italic text-(--text-dim)">{unit.teach.hook}</p>
            ) : null}
          </div>
          <BriefContinueButton
            onContinue={advanceBriefToPlay}
            ready={!briefAutoAdvance || briefReadDone}
          />
        </div>
      )}

      {sessionState.phase === 'play' && unit && quiz && playCtx && (
        <PowerUpEffectProvider value={effectState}>
        <QuestionSpeakProvider
          slots={{
            title: playHeading,
            desc: questionDescText,
            sidebar: sidebarSpeakText,
          }}
          autoSlot="desc"
          autoWaitForIdle
          autoKey={pageReadAutoKey}
        >
          <div
            key={`play-${session.currentIndex}`}
            data-wing={unit.achievement.wingId}
            {...devMark('q')}
            className="mx-auto max-w-(--w-content) px-4 play-content-top play-content-bottom-with-readbar animate-slide-up max-sm:px-3"
          >
            <div {...devMark('q.title')} className="mb-5 flex flex-wrap items-start gap-x-2 gap-y-1">
              <span className="shrink-0 text-xl leading-none">{unit.emoji}</span>
              <span
                className={cn(
                  'min-w-0 flex-1 wrap-break-word font-headline font-black bg-[image:var(--wing-gradient)] bg-clip-text text-transparent',
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
                className="shrink-0"
              />
            </div>

            {showPlayEtymology ? (
              <div {...devMark('q.etym')}>
                <EtymologyCard
                root={playCtx.root}
                speakText={sidebarSpeakText}
                speakSlot="sidebar"
                compact
                collapsible
                />
              </div>
            ) : null}

            {askConfidence && !confidenceCommitted ? (
              <div className="mb-6">
                <ConfidencePrompt
                  onCommit={(value) => {
                    setConfidenceValue(value);
                    setConfidenceCommitted(true);
                  }}
                />
              </div>
            ) : null}

            <PowerUpTray
              inventory={powerups}
              templateKind={quiz.kind}
              onUseSlot={activatePowerUpAtSlot}
              className="relative mb-4"
            />

            <div {...devMark('q.body')} className={cn('mt-6', !confidenceReady && 'pointer-events-none opacity-40')}>
              {quiz.kind === 'speed-reveal-mnemonic' ? (
                <>
                  <QuizPlayFigures figures={quizPlayFigures} />
                  <TemplateRenderer
                    data={quiz.data}
                    answered={answered}
                    blocked={!confidenceReady}
                    onAnswer={handleAnswerSelect}
                    descText={questionDescText}
                    onHintShown={setFillHintShown}
                  />
                </>
              ) : quiz.kind === 'fill' ? (
                <>
                  <QuizPlayFigures figures={quizPlayFigures} />
                  <FillQuestion
                    question={{ kind: 'fill', ...(quiz.data as FillData) }}
                    disabled={answered || !confidenceReady}
                    onAnswer={handleAnswerSelect}
                    descText={questionDescText}
                    onHintShown={setFillHintShown}
                  />
                </>
              ) : quiz.kind === 'match' ? (
                <MatchQuestion
                  data={quiz.data as MatchData}
                  disabled={answered || !confidenceReady}
                  onAnswer={handleAnswerSelect}
                  descText={questionDescText}
                  dimmedOption={matchDimmedOption}
                />
              ) : quiz.kind === 'scenario' ? (
                <ScenarioQuestion
                  data={quiz.data as ScenarioData}
                  disabled={answered || !confidenceReady}
                  onAnswer={handleAnswerSelect}
                  descText={questionDescText}
                  dimmedIndex={mcDimmedIndex}
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
                    saveSnapshot={saveInFlightSnapshot}
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

            {pendingCorrect !== null && correctAnswerDisplay ? (
              <div {...devMark('q.answer')}>
                <CorrectAnswerReveal answer={correctAnswerDisplay} />
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
                countdownSec={Math.round(settings.reveals.countdownMs / 1000)}
                />
              </div>
            )}
          </div>
        </QuestionSpeakProvider>
        </PowerUpEffectProvider>
      )}

      {sessionState.phase === 'feedback' && feedbackReadBundle && (
        <QuestionSpeakProvider
          slots={{
            title: answerRecapShown ? '' : feedbackReadBundle.headline,
            desc: feedbackDescText,
            sidebar: feedbackSidebarText,
          }}
          autoKey={pageReadAutoKey}
        >
          <div {...devMark('fb')} className="mx-auto max-w-(--w-content) px-4 play-content-top play-content-bottom-with-readbar animate-slide-up max-sm:px-3">
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

            {!answerRecapShown ? (
              <>
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

                {correctAnswerDisplay ? (
                  <div {...devMark('fb.answer')}>
                    <CorrectAnswerReveal answer={correctAnswerDisplay} className="mb-6" />
                  </div>
                ) : null}
              </>
            ) : null}

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
                  collapsible
                />
              </div>
            ) : null}

            <div {...devMark('fb.next')}>
              <FeedbackNextButton
              label={session.currentIndex + 1 >= total ? 'SEE RESULTS →' : 'NEXT →'}
              onNext={goNext}
              ready={feedbackNextReady}
              />
            </div>
          </div>
        </QuestionSpeakProvider>
      )}

      {shownMoment ? (
        <AchievementEarnedMoment
          achievement={shownMoment}
          remainingCount={earnedMomentQueue.length}
          onContinue={() => {
            stopAchievementSpeak();
            setShownMoment(null);
          }}
          reducedMotion={settings.motion !== 'full'}
        />
      ) : null}

      {pendingFirstUseId && pendingFirstUseSlot !== null ? (
        <PowerUpFirstUseModal
          powerUpId={pendingFirstUseId}
          onConfirm={(dontShow) => {
            if (dontShow) markPowerUpFirstUseShown(pendingFirstUseId);
            const def = getPowerUpDef(pendingFirstUseId);
            const inst = powerups.slots[pendingFirstUseSlot];
            if (def && inst && session) {
              commitPowerUpUse(
                pendingFirstUseSlot,
                inst,
                def.effects,
                session.queue[session.currentIndex].templateKind,
              );
            }
            setPendingFirstUseId(null);
            setPendingFirstUseSlot(null);
          }}
          onCancel={() => {
            setPendingFirstUseId(null);
            setPendingFirstUseSlot(null);
          }}
        />
      ) : null}

      {pendingSwap ? (
        <PowerUpSwapModal
          earned={pendingSwap}
          slots={powerups.slots}
          onReplaceSlot={(slotIndex) => {
            swapPowerUp(slotIndex, pendingSwap);
            setPendingSwap(null);
          }}
          onDiscardEarned={() => setPendingSwap(null)}
        />
      ) : null}
    </>
  );
}
