'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ChevronLeft, Plus, RotateCcw, RotateCw, Settings2, Square, Trash2 } from 'lucide-react';
import { formatPocketTtsVoiceLabel, POCKET_TTS_DEFAULT_VOICE } from '@/audio/pocket-tts';
import type { SpeakWord } from '@/audio/speak-word-sync';
import {
  buildSpeakLayout,
  clipSpeakRawText,
  clampWordIndex,
  estimateMsAtWordIndex,
  sliderValueFromWordIndex,
  speakTextFromWordIndex,
  wordIndexFromMs,
  wordIndexFromSlider,
} from '@/audio/speak-word-sync';
import { usePocketTts } from '@/audio/use-pocket-tts';
import { ReadAloudButton } from '@/components/content/ReadAloudButton';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ToggleField } from '@/components/common/ToggleField';
import { useLocalStorage, readStoredValue } from '@/hooks/use-local-storage';
import { usePocketTtsVoices, resolvePocketTtsVoice } from '@/hooks/use-pocket-tts-voices';
import { useReadAloudBootstrap } from '@/hooks/use-read-aloud-bootstrap';
import { useSpeakWordProgress } from '@/hooks/use-speak-word-progress';
import { cn } from '@/lib/cn';
import { ulid } from '@/lib/id';
import { useAppStore } from '@/store/app-store';

export const Route = createFileRoute('/tts')({
  component: TtsPage,
});

const CLIPS_STORAGE_KEY = 'evo-quest.v1.tts-workbench-clips';
const SELECTED_CLIP_STORAGE_KEY = 'evo-quest.v1.tts-workbench-selected-id';
/** @deprecated Migrated to CLIPS + SELECTED_CLIP keys; read once on hydrate. */
const LEGACY_WORKBENCH_KEY = 'evo-quest.v1.tts-workbench';
/** Idle time after the last seek before (re)starting audio. */
const SEEK_COMMIT_DELAY_MS = 200;

type TtsClip = {
  id: string;
  name: string;
  title: string;
  text: string;
  noTitle: boolean;
  voice: string;
  updatedAt: number;
};

type TtsClipStored = Omit<TtsClip, 'voice'> & { voice?: string };

type TtsWorkbenchClipsState = {
  clips: TtsClip[];
};

const EMPTY_CLIPS: TtsWorkbenchClipsState = {
  clips: [],
};

type LegacyTtsWorkbenchState = {
  clips: TtsClipStored[];
  selectedId?: string | null;
};

function createClip(name = 'New clip', voice = POCKET_TTS_DEFAULT_VOICE): TtsClip {
  return {
    id: ulid(),
    name,
    title: '',
    text: '',
    noTitle: false,
    voice,
    updatedAt: Date.now(),
  };
}

function normalizeClip(clip: TtsClipStored, defaultVoice: string): TtsClip {
  return {
    ...clip,
    voice: clip.voice ?? defaultVoice,
  };
}

function normalizeClips(clips: TtsClipStored[], defaultVoice: string): TtsClip[] {
  return clips.map((clip) => normalizeClip(clip, defaultVoice));
}

function harvestTitleFromText(fullText: string): { title: string; body: string } {
  const normalized = fullText.replace(/\r\n/g, '\n');
  const firstBreak = normalized.indexOf('\n');
  if (firstBreak === -1) {
    return { title: normalized.trim(), body: '' };
  }
  return {
    title: normalized.slice(0, firstBreak).trim(),
    body: normalized.slice(firstBreak + 1).replace(/^\n+/, ''),
  };
}

function defaultNameForTitle(title: string, currentName: string): string {
  const trimmed = title.trim();
  if (!trimmed) return currentName;
  if (!currentName.trim() || currentName === 'New clip') return trimmed;
  return currentName;
}

function formatPlaybackClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function scrollElementToVerticalCenter(
  container: HTMLElement,
  element: HTMLElement,
  behavior: ScrollBehavior = 'smooth',
): void {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const delta = elementRect.top - containerRect.top - (containerRect.height - elementRect.height) / 2;
  container.scrollTo({ top: container.scrollTop + delta, behavior });
}

function spokenWordHighlightClass(distance: number): string {
  if (distance === 0) {
    return 'rounded-[0.2em] bg-[color-mix(in_oklab,var(--accent-cyan)_22%,transparent)] text-(--text-primary) font-semibold';
  }
  if (distance === 1) return 'text-(--text-secondary)';
  return 'text-(--text-faint)';
}

function renderHighlightedPlainText(
  text: string,
  words: SpeakWord[],
  activeWordIndex: number | null,
  activeWordRef?: React.RefObject<HTMLSpanElement | null>,
) {
  if (activeWordIndex == null || words.length === 0) {
    return text;
  }

  const active = clampWordIndex(activeWordIndex, words.length);
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  words.forEach((word, index) => {
    if (word.start > cursor) {
      parts.push(text.slice(cursor, word.start));
    }
    const distance = Math.abs(index - active);
    parts.push(
      <span
        key={`${word.start}-${word.text}`}
        ref={index === active ? activeWordRef : undefined}
        className={cn(
          spokenWordHighlightClass(distance),
          distance === 0 ? 'oo--spoken-text-word' : undefined,
        )}
      >
        {word.text}
      </span>,
    );
    cursor = word.start + word.text.length;
  });

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
}

function SpokenTextHighlight({
  text,
  words,
  activeWordIndex,
}: {
  text: string;
  words: SpeakWord[];
  activeWordIndex: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!scrollRef.current || !activeWordRef.current) return;
    scrollElementToVerticalCenter(scrollRef.current, activeWordRef.current);
  }, [activeWordIndex, text]);

  if (words.length === 0) {
    return (
      <div className="oo--tts-spoken-text-empty rounded-(--r-lg) border border-(--border-light) bg-[color-mix(in_oklab,var(--bg-card-hi)_70%,transparent)] px-3 py-2 text-body leading-relaxed text-(--text-faint)">
        No text to speak yet
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="oo--tts-spoken-text max-h-[calc(3*1.625*1em+1rem)] overflow-y-auto overscroll-y-contain scroll-smooth rounded-(--r-lg) border border-(--border-light) bg-[color-mix(in_oklab,var(--bg-card-hi)_70%,transparent)] px-3 py-2 text-body leading-relaxed scrollbar-thin"
    >
      <p className="whitespace-pre-wrap wrap-break-word">
        {renderHighlightedPlainText(text, words, activeWordIndex, activeWordRef)}
      </p>
    </div>
  );
}

function TtsPage() {
  const [workbench, setWorkbench, clipsHydrated] = useLocalStorage<TtsWorkbenchClipsState>(
    CLIPS_STORAGE_KEY,
    EMPTY_CLIPS,
  );
  const [selectedClipId, setSelectedClipId, selectedHydrated] = useLocalStorage<string | null>(
    SELECTED_CLIP_STORAGE_KEY,
    null,
  );
  const hydrated = clipsHydrated && selectedHydrated;
  const migrationDoneRef = useRef(false);
  const clips = workbench.clips;
  const settings = useAppStore((s) => s.settings);
  const selectedClip = useMemo(
    () => clips.find((clip) => clip.id === selectedClipId) ?? null,
    [clips, selectedClipId],
  );
  const clipVoice = selectedClip?.voice ?? settings.reading.voice;
  const bootstrap = useReadAloudBootstrap(true, clipVoice);
  const { voices: pocketVoices } = usePocketTtsVoices({
    enabled: true,
    voice: clipVoice,
  });
  const resolvedClipVoice = useMemo(
    () =>
      resolvePocketTtsVoice(
        clipVoice,
        pocketVoices.length > 0 ? pocketVoices : [clipVoice],
      ),
    [clipVoice, pocketVoices],
  );
  const { status, error, speak, stop } = usePocketTts({
    voice: resolvedClipVoice,
    volume: settings.audio.volume,
  });
  const [cursorWordIndex, setCursorWordIndex] = useState(0);
  const [playbackAnchorWordIndex, setPlaybackAnchorWordIndex] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const scrubRef = useRef(false);
  const scrubWordRef = useRef(0);
  const wasPlayingBeforeScrubRef = useRef(false);
  const seekTimerRef = useRef<number | null>(null);
  const pendingTargetWordRef = useRef<number | null>(null);

  const sortedClips = useMemo(
    () => [...clips].sort((a, b) => b.updatedAt - a.updatedAt),
    [clips],
  );

  const speakLayout = useMemo(
    () =>
      selectedClip
        ? buildSpeakLayout(clipSpeakRawText(selectedClip))
        : buildSpeakLayout(''),
    [selectedClip],
  );
  const { spokenText, words: speakWords, weights: speakWeights, estimatedMs: fullEstimatedMs } =
    speakLayout;
  const wordCount = speakWords.length;
  const { elapsedMs, estimatedMs, estWordIndex } = useSpeakWordProgress(
    spokenText,
    speakWords,
    status,
    playbackAnchorWordIndex,
  );
  const canPlay = Boolean(spokenText);
  const isActive = status === 'loading' || status === 'playing';
  const modelBootstrapping = bootstrap.status === 'loading';
  const modelReady = bootstrap.status === 'ready';
  const playbackLocked = modelBootstrapping || !modelReady;
  const displayWordIndex =
    status === 'playing' && !isScrubbing ? estWordIndex : cursorWordIndex;
  const sliderPct = sliderValueFromWordIndex(displayWordIndex, wordCount);
  const voiceLoading =
    (modelBootstrapping || (status === 'loading' && !isScrubbing)) && !isScrubbing;
  const spokenTextDiffers = selectedClip ? speakLayout.spokenText !== speakLayout.rawText : false;

  const cancelPendingSeek = useCallback(() => {
    if (seekTimerRef.current != null) {
      window.clearTimeout(seekTimerRef.current);
      seekTimerRef.current = null;
    }
    pendingTargetWordRef.current = null;
  }, []);

  useEffect(() => {
    cancelPendingSeek();
    setCursorWordIndex(0);
    setPlaybackAnchorWordIndex(0);
    setIsScrubbing(false);
    scrubRef.current = false;
    scrubWordRef.current = 0;
  }, [cancelPendingSeek, selectedClip?.id]);

  useEffect(() => {
    return () => {
      if (seekTimerRef.current != null) {
        window.clearTimeout(seekTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setCursorWordIndex((index) => clampWordIndex(index, wordCount));
  }, [wordCount]);

  useEffect(() => {
    if (status === 'playing' && !isScrubbing) {
      setCursorWordIndex(estWordIndex);
    }
  }, [estWordIndex, isScrubbing, status]);

  const seekToWord = useCallback(
    (wordIndex: number) => {
      const clamped = clampWordIndex(wordIndex, wordCount);
      setPlaybackAnchorWordIndex(clamped);
      setCursorWordIndex(clamped);
    },
    [wordCount],
  );

  const speakFromWord = useCallback(
    (wordIndex: number) => {
      if (playbackLocked) return;
      const clamped = clampWordIndex(wordIndex, wordCount);
      const text = speakTextFromWordIndex(spokenText, speakWords, clamped);
      if (!text) return;
      if (isActive) stop();
      seekToWord(clamped);
      void speak(text);
    },
    [isActive, playbackLocked, seekToWord, speak, spokenText, speakWords, stop, wordCount],
  );

  const scheduleResume = useCallback(
    (wordIndex: number) => {
      pendingTargetWordRef.current = wordIndex;
      if (seekTimerRef.current != null) {
        window.clearTimeout(seekTimerRef.current);
      }
      seekTimerRef.current = window.setTimeout(() => {
        const target = pendingTargetWordRef.current;
        seekTimerRef.current = null;
        pendingTargetWordRef.current = null;
        if (target != null) {
          speakFromWord(target);
        }
      }, SEEK_COMMIT_DELAY_MS);
    },
    [speakFromWord],
  );

  const handleSliderPointerDown = useCallback(() => {
    if (!canPlay || wordCount === 0) return;
    cancelPendingSeek();
    wasPlayingBeforeScrubRef.current = isActive;
    scrubRef.current = true;
    scrubWordRef.current = cursorWordIndex;
    setIsScrubbing(true);
    if (isActive) stop();
  }, [cancelPendingSeek, canPlay, cursorWordIndex, isActive, stop, wordCount]);

  const handleSliderChange = useCallback(
    (value: number) => {
      if (!canPlay || wordCount === 0) return;
      const index = wordIndexFromSlider(value, wordCount);
      scrubWordRef.current = index;
      setCursorWordIndex(index);
      setPlaybackAnchorWordIndex(index);
    },
    [canPlay, wordCount],
  );

  const finishScrub = useCallback(() => {
    if (!scrubRef.current || !canPlay || wordCount === 0) return;
    scrubRef.current = false;
    setIsScrubbing(false);
    const index = scrubWordRef.current;
    seekToWord(index);
    if (wasPlayingBeforeScrubRef.current) {
      scheduleResume(index);
    }
  }, [canPlay, scheduleResume, seekToWord, wordCount]);

  const handlePlaybackToggle = useCallback(() => {
    if (playbackLocked && !isActive) return;
    if (isActive) {
      cancelPendingSeek();
      stop();
      return;
    }
    speakFromWord(cursorWordIndex);
  }, [cancelPendingSeek, cursorWordIndex, isActive, playbackLocked, speakFromWord, stop]);

  const playbackMs = useMemo(() => {
    if (status === 'playing') {
      return (
        estimateMsAtWordIndex(speakWeights, playbackAnchorWordIndex, fullEstimatedMs) + elapsedMs
      );
    }
    return estimateMsAtWordIndex(speakWeights, displayWordIndex, fullEstimatedMs);
  }, [
    displayWordIndex,
    elapsedMs,
    fullEstimatedMs,
    playbackAnchorWordIndex,
    speakWeights,
    status,
  ]);

  const canRestart =
    displayWordIndex > 0 || playbackAnchorWordIndex > 0 || elapsedMs > 0;

  const seekBySeconds = useCallback(
    (deltaSec: number) => {
      if (!canPlay || wordCount === 0) return;
      const baseMs =
        pendingTargetWordRef.current != null
          ? estimateMsAtWordIndex(speakWeights, pendingTargetWordRef.current, fullEstimatedMs)
          : playbackMs;
      const targetMs = Math.max(0, Math.min(fullEstimatedMs, baseMs + deltaSec * 1000));
      const wordIndex = wordIndexFromMs(targetMs, speakWeights, fullEstimatedMs);
      seekToWord(wordIndex);
      if (isActive || pendingTargetWordRef.current != null) {
        scheduleResume(wordIndex);
      }
    },
    [
      canPlay,
      fullEstimatedMs,
      isActive,
      playbackMs,
      scheduleResume,
      seekToWord,
      speakWeights,
      wordCount,
    ],
  );

  const handleRestart = useCallback(() => {
    cancelPendingSeek();
    if (isActive) stop();
    seekToWord(0);
  }, [cancelPendingSeek, isActive, seekToWord, stop]);

  const updateClip = useCallback(
    (clipId: string, patch: Partial<TtsClip>) => {
      setWorkbench((prev) => ({
        clips: prev.clips.map((clip) =>
          clip.id === clipId ? { ...clip, ...patch, updatedAt: Date.now() } : clip,
        ),
      }));
    },
    [setWorkbench],
  );

  const selectClip = useCallback(
    (clipId: string) => {
      cancelPendingSeek();
      stop();
      setSelectedClipId(clipId);
    },
    [cancelPendingSeek, setSelectedClipId, stop],
  );

  const createNewClip = useCallback(() => {
    cancelPendingSeek();
    stop();
    const clip = createClip('New clip', settings.reading.voice);
    setWorkbench((prev) => ({
      clips: [clip, ...prev.clips],
    }));
    setSelectedClipId(clip.id);
  }, [cancelPendingSeek, setSelectedClipId, setWorkbench, settings.reading.voice, stop]);

  const deleteSelectedClip = useCallback(() => {
    if (!selectedClip) return;
    cancelPendingSeek();
    stop();
    setWorkbench((prev) => ({
      clips: prev.clips.filter((clip) => clip.id !== selectedClip.id),
    }));
    setSelectedClipId((currentId) => {
      const nextClips = clips.filter((clip) => clip.id !== selectedClip.id);
      if (currentId && nextClips.some((clip) => clip.id === currentId)) return currentId;
      return nextClips[0]?.id ?? null;
    });
  }, [cancelPendingSeek, clips, selectedClip, setSelectedClipId, setWorkbench, stop]);

  useEffect(() => {
    if (!hydrated || migrationDoneRef.current) return;
    migrationDoneRef.current = true;

    const legacy = readStoredValue<LegacyTtsWorkbenchState>(LEGACY_WORKBENCH_KEY, { clips: [] });
    const defaultVoice = settings.reading.voice;
    const storedClips = clips.length > 0 ? clips : legacy.clips;
    const normalizedStored = normalizeClips(storedClips, defaultVoice);
    const normalizedLegacy = normalizeClips(legacy.clips, defaultVoice);
    const needsVoiceMigration = storedClips.some((clip) => !clip.voice);

    if (clips.length === 0 && legacy.clips.length > 0) {
      setWorkbench({ clips: normalizedLegacy });
    } else if (needsVoiceMigration) {
      setWorkbench({ clips: normalizedStored });
    }

    const clipList =
      clips.length > 0
        ? needsVoiceMigration
          ? normalizedStored
          : clips
        : normalizedLegacy;
    const legacySelected =
      legacy.selectedId && clipList.some((clip) => clip.id === legacy.selectedId)
        ? legacy.selectedId
        : null;
    const resolvedSelected =
      selectedClipId && clipList.some((clip) => clip.id === selectedClipId)
        ? selectedClipId
        : legacySelected ?? clipList[0]?.id ?? null;

    if (resolvedSelected !== selectedClipId) {
      setSelectedClipId(resolvedSelected);
    }
  }, [clips, hydrated, selectedClipId, setSelectedClipId, setWorkbench, settings.reading.voice]);

  useEffect(() => {
    if (!hydrated || clips.length === 0) return;
    if (selectedClipId && clips.some((clip) => clip.id === selectedClipId)) return;
    setSelectedClipId(sortedClips[0]?.id ?? null);
  }, [clips, hydrated, selectedClipId, setSelectedClipId, sortedClips]);

  const handlePasteText = useCallback(
    (pasted: string) => {
      if (!selectedClip || selectedClip.noTitle) return;
      const { title, body } = harvestTitleFromText(pasted);
      updateClip(selectedClip.id, {
        title,
        text: body,
        name: defaultNameForTitle(title, selectedClip.name),
      });
    },
    [selectedClip, updateClip],
  );

  if (!hydrated) {
    return (
      <main className="C--TtsPage oo--tts-page page-wrap px-4 py-8">
        <p className="oo--tts-loading-status text-body text-(--text-dim)">Loading…</p>
      </main>
    );
  }

  if (clips.length === 0) {
    return (
      <main className="C--TtsPage oo--tts-page page-wrap px-4 py-8">
        <Link
          to="/"
          className="xx--tts-home-link mb-6 inline-flex items-center gap-1 text-meta text-(--text-dim) no-underline hover:text-(--text-secondary)"
        >
          <ChevronLeft size={16} />
          Home
        </Link>
        <h1 className="text-display-lg mb-4 font-black">TTS Workbench</h1>
        <Card className="oo--tts-empty-state max-w-(--w-medium) space-y-4">
          <p className="text-body text-(--text-secondary)">
            Paste text, pick a name, and try read-aloud voices.
          </p>
          <Button variant="primary" className="xx--tts-new-clip" onClick={createNewClip}>
            <Plus size={16} />
            New clip
          </Button>
        </Card>
      </main>
    );
  }

  if (!selectedClip) {
    return (
      <main className="C--TtsPage oo--tts-page page-wrap px-4 py-8">
        <p className="oo--tts-loading-status text-body text-(--text-dim)">Loading…</p>
      </main>
    );
  }

  return (
    <main className="C--TtsPage oo--tts-page page-wrap px-4 py-8">
      <Link
        to="/"
        className="xx--tts-home-link mb-6 inline-flex items-center gap-1 text-meta text-(--text-dim) no-underline hover:text-(--text-secondary)"
      >
        <ChevronLeft size={16} />
        Home
      </Link>

      <h1 className="text-display-lg mb-6 font-black">TTS Workbench</h1>

      <div className="oo--tts-workbench grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="oo--tts-clip-list-section min-h-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-headline-md font-bold">Saved clips</h2>
            <Button variant="secondary" className="xx--tts-new-clip" onClick={createNewClip}>
              <Plus size={16} />
              New
            </Button>
          </div>
          <Card className="oo--tts-clip-list max-h-[min(70vh,720px)] overflow-y-auto p-2">
            <ul className="oo--tts-clip-list-items space-y-1">
              {sortedClips.map((clip) => {
                const active = clip.id === selectedClip.id;
                return (
                  <li key={clip.id}>
                    <button
                      type="button"
                      onClick={() => selectClip(clip.id)}
                      className={cn(
                        'xx--tts-clip-select w-full rounded-(--r-lg) px-4 py-3 text-left transition-colors',
                        active
                          ? 'bg-[color-mix(in_oklab,var(--accent-cyan)_16%,transparent)] text-(--text-primary)'
                          : 'text-(--text-secondary) hover:bg-(--bg-card-active) hover:text-(--text-primary)',
                      )}
                    >
                      <div className="truncate text-body font-semibold">{clip.name || 'Untitled'}</div>
                      <div className="truncate text-meta text-(--text-faint)">
                        {clip.noTitle
                          ? clip.text.trim() || 'No text yet'
                          : clip.title.trim() || clip.text.trim() || 'No text yet'}
                        {pocketVoices.length > 0 ? (
                          <span className="text-(--text-faint)">
                            {' · '}
                            {formatPocketTtsVoiceLabel(
                              resolvePocketTtsVoice(
                                clip.voice,
                                pocketVoices.length > 0 ? pocketVoices : [clip.voice],
                              ),
                            )}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>

        <section className="oo--tts-detail-section space-y-5">
          <Card className="oo--tts-playback-card glass-md glass-bg-header sticky top-16 z-30 space-y-4 border-(--border-light) shadow-[0_8px_24px_color-mix(in_oklab,var(--bg-deep)_40%,transparent)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-headline-md font-bold">Playback</h2>
                <p className="mt-1 text-meta text-(--text-faint)">
                  {formatPocketTtsVoiceLabel(resolvedClipVoice)} ·{' '}
                  {Math.round(settings.audio.volume * 100)}% volume
                </p>
              </div>
              <Link
                to="/settings"
                className="xx--tts-settings-link inline-flex shrink-0 items-center gap-1 rounded-(--r-lg) px-2 py-1.5 text-meta text-(--text-dim) no-underline hover:bg-(--bg-card-active) hover:text-(--text-secondary)"
              >
                <Settings2 size={14} aria-hidden />
                Settings
              </Link>
            </div>

            {modelBootstrapping ? (
              <div className="oo--tts-model-load-progress space-y-1.5" aria-live="polite">
                <p className="text-meta text-(--text-faint)">
                  Loading voice model… {Math.round(bootstrap.progress * 100)}%
                </p>
                <div
                  className="h-1 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--border-light)_85%,transparent)]"
                  role="progressbar"
                  aria-valuenow={Math.round(bootstrap.progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Loading TTS voice model"
                >
                  <div
                    className="h-full rounded-full bg-[color-mix(in_oklab,var(--accent-cyan)_55%,transparent)] transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.max(4, Math.round(bootstrap.progress * 100))}%` }}
                  />
                </div>
              </div>
            ) : bootstrap.status === 'error' ? (
              <p className="oo--tts-model-load-error text-meta text-(--status-wrong)" role="status">
                {bootstrap.error ?? 'Failed to load voice model'}
              </p>
            ) : null}

            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={sliderPct}
                disabled={!canPlay || wordCount === 0 || playbackLocked}
                onPointerDown={handleSliderPointerDown}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                onPointerUp={finishScrub}
                onPointerCancel={finishScrub}
                onBlur={finishScrub}
                aria-label="Seek through spoken text by word"
                aria-valuetext={`Word ${displayWordIndex + 1} of ${wordCount}`}
                className="xx--tts-playback-seek w-full accent-(--accent-cyan) disabled:opacity-40"
              />
              <div className="flex items-center justify-between gap-3 text-meta tabular-nums text-(--text-faint)">
                <span>{formatPlaybackClock(elapsedMs)}</span>
                <span className="truncate text-center">
                  {canPlay
                    ? voiceLoading
                      ? modelBootstrapping
                        ? `Loading model… ${Math.round(bootstrap.progress * 100)}%`
                        : 'Preparing playback…'
                      : `Word ${displayWordIndex + 1}/${wordCount} (est.)`
                    : 'Add text to preview'}
                </span>
                <span>{formatPlaybackClock(estimatedMs)}</span>
              </div>
            </div>

            <SpokenTextHighlight
              text={spokenText}
              words={speakWords}
              activeWordIndex={displayWordIndex}
            />
            {spokenTextDiffers ? (
              <p className="oo--tts-spoken-text-note text-meta text-(--text-faint)">
                Speech expands abbreviations and symbols.
              </p>
            ) : null}

            <div className="oo--tts-playback-controls flex flex-wrap items-center gap-2">
              <ReadAloudButton
                text={spokenText}
                status={status}
                error={error}
                onToggle={handlePlaybackToggle}
                label="Play clip"
                disabled={playbackLocked}
                className="min-w-38"
                buttonClassName="xx--tts-playback-play"
              />
              <Button
                variant="ghost"
                disabled={!canPlay || wordCount === 0 || playbackLocked}
                onClick={() => seekBySeconds(-5)}
                aria-label="Back 5 seconds"
                className="xx--tts-playback-back gap-1.5 tabular-nums"
              >
                <RotateCcw size={14} aria-hidden />
                5
              </Button>
              <Button
                variant="ghost"
                disabled={!canPlay || wordCount === 0 || playbackLocked}
                onClick={() => seekBySeconds(5)}
                aria-label="Forward 5 seconds"
                className="xx--tts-playback-forward gap-1.5 tabular-nums"
              >
                <RotateCw size={14} aria-hidden />
                5
              </Button>
              <Button
                variant="ghost"
                disabled={!canRestart || playbackLocked}
                onClick={handleRestart}
                aria-label="Jump to beginning"
                className="xx--tts-playback-restart gap-2"
              >
                <Square size={14} aria-hidden />
                Restart
              </Button>
              <Button
                variant="ghost"
                disabled={!isActive}
                onClick={stop}
                aria-label="Stop playback"
                className="xx--tts-playback-stop gap-2"
              >
                <Square size={14} aria-hidden />
                Stop
              </Button>
            </div>
          </Card>

          <Card className="oo--tts-clip-editor space-y-5">
            <Field label="Name">
              <input
                value={selectedClip.name}
                onChange={(e) => updateClip(selectedClip.id, { name: e.target.value })}
                placeholder="Clip name"
                className={cn(inputClassName, 'xx--tts-clip-name')}
              />
            </Field>

            <ToggleField
              label="No title"
              description="Use a single text field without a separate title line"
              checked={selectedClip.noTitle}
              className="xx--tts-no-title-toggle"
              onChange={(noTitle) => {
                if (noTitle) {
                  updateClip(selectedClip.id, { noTitle: true });
                  return;
                }
                const combined = selectedClip.title
                  ? `${selectedClip.title}\n${selectedClip.text}`
                  : selectedClip.text;
                const { title, body } = harvestTitleFromText(combined);
                updateClip(selectedClip.id, {
                  noTitle: false,
                  title,
                  text: body,
                  name: defaultNameForTitle(title, selectedClip.name),
                });
              }}
            />

            <Field label="Voice">
              <select
                value={resolvedClipVoice}
                onChange={(e) => {
                  cancelPendingSeek();
                  stop();
                  updateClip(selectedClip.id, { voice: e.target.value });
                }}
                disabled={pocketVoices.length === 0}
                className={cn(inputClassName, 'xx--tts-voice-select')}
              >
                {(pocketVoices.length > 0 ? pocketVoices : [resolvedClipVoice]).map((voice) => (
                  <option key={voice} value={voice}>
                    {formatPocketTtsVoiceLabel(voice)}
                  </option>
                ))}
              </select>
            </Field>

            {!selectedClip.noTitle ? (
              <Field label="Title">
                <input
                  value={selectedClip.title}
                  onChange={(e) => updateClip(selectedClip.id, { title: e.target.value })}
                  placeholder="First line becomes the title"
                  className={cn(inputClassName, 'xx--tts-clip-title')}
                />
              </Field>
            ) : null}

            <Field label="Text">
              <textarea
                value={selectedClip.text}
                onChange={(e) => updateClip(selectedClip.id, { text: e.target.value })}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData('text');
                  if (!pasted || selectedClip.noTitle) return;
                  e.preventDefault();
                  handlePasteText(pasted);
                }}
                rows={12}
                placeholder="Paste or type text here…"
                className={cn(
                  inputClassName,
                  'xx--tts-clip-text min-h-48 resize-y whitespace-pre-wrap wrap-break-word leading-relaxed',
                )}
              />
              {!selectedClip.noTitle ? (
                <p className="mt-2 text-meta text-(--text-faint)">
                  Pasting multi-line text uses the first line as the title.
                </p>
              ) : null}
            </Field>

            <div className="flex flex-wrap gap-2">
              <Button variant="destructive" className="xx--tts-clip-delete" onClick={deleteSelectedClip}>
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

const inputClassName =
  'w-full rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 text-body text-(--text-primary) outline-none placeholder:text-(--text-faint) focus:border-(--accent-cyan)';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="C--Field">
      <div className="mb-2 text-meta font-bold uppercase tracking-[0.08em] text-(--text-dim)">
        {label}
      </div>
      {children}
    </div>
  );
}
