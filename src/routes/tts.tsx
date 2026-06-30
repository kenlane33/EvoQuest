'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ChevronLeft, Plus, Settings2, Square, Trash2 } from 'lucide-react';
import { formatPocketTtsVoiceLabel } from '@/audio/pocket-tts';
import type { PocketTtsStatus } from '@/audio/use-pocket-tts';
import { usePocketTts } from '@/audio/use-pocket-tts';
import { ReadAloudButton } from '@/components/content/ReadAloudButton';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ToggleField } from '@/components/common/ToggleField';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useReadAloudBootstrap } from '@/hooks/use-read-aloud-bootstrap';
import { cn } from '@/lib/cn';
import { ulid } from '@/lib/id';
import { useAppStore } from '@/store/app-store';

export const Route = createFileRoute('/tts')({
  component: TtsPage,
});

const STORAGE_KEY = 'evo-quest.v1.tts-workbench';

type TtsClip = {
  id: string;
  name: string;
  title: string;
  text: string;
  noTitle: boolean;
  updatedAt: number;
};

type TtsWorkbenchState = {
  clips: TtsClip[];
  selectedId: string | null;
};

const EMPTY_WORKBENCH: TtsWorkbenchState = {
  clips: [],
  selectedId: null,
};

function createClip(name = 'New clip'): TtsClip {
  return {
    id: ulid(),
    name,
    title: '',
    text: '',
    noTitle: false,
    updatedAt: Date.now(),
  };
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

function buildSpeakText(clip: TtsClip): string {
  const body = clip.text.trim();
  if (clip.noTitle) return body;
  const title = clip.title.trim();
  if (!title) return body;
  if (!body) return title;
  return `${title}. ${body}`;
}

function defaultNameForTitle(title: string, currentName: string): string {
  const trimmed = title.trim();
  if (!trimmed) return currentName;
  if (!currentName.trim() || currentName === 'New clip') return trimmed;
  return currentName;
}

/** Rough duration for progress UI — not exact for every voice or engine. */
function estimateSpeakDurationMs(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const words = trimmed.split(/\s+/).length;
  const chars = trimmed.length;
  const byWords = (words / 2.4) * 1000;
  const byChars = (chars / 12) * 1000;
  const pauseMs = (trimmed.match(/[.,!?;:]/g)?.length ?? 0) * 200;
  return Math.max(1000, (byWords + byChars) / 2 + pauseMs);
}

type SpeakWord = { text: string; start: number };

function tokenizeSpeakWords(text: string): SpeakWord[] {
  const words: SpeakWord[] = [];
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    words.push({ text: match[0], start: match.index });
  }
  return words;
}

function clampWordIndex(index: number, wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.min(wordCount - 1, Math.max(0, index));
}

function speakTextFromWordIndex(text: string, words: SpeakWord[], wordIndex: number): string {
  if (!text.trim() || words.length === 0) return text.trim();
  const idx = clampWordIndex(wordIndex, words.length);
  if (idx === 0) return text.trim();
  return text.slice(words[idx]!.start).trim();
}

function wordIndexFromSlider(value: number, wordCount: number): number {
  if (wordCount <= 1) return 0;
  return Math.round((value / 100) * (wordCount - 1));
}

function sliderValueFromWordIndex(wordIndex: number, wordCount: number): number {
  if (wordCount <= 1) return 0;
  return Math.round((wordIndex / (wordCount - 1)) * 100);
}

function formatPlaybackClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function spokenWordHighlightClass(distance: number): string {
  if (distance === 0) {
    return 'rounded-[0.2em] bg-[color-mix(in_oklab,var(--accent-cyan)_22%,transparent)] text-(--text-primary) font-semibold';
  }
  if (distance === 1) return 'text-(--text-secondary)';
  return 'text-(--text-faint)';
}

type SpeakFieldRange = {
  field: 'title' | 'text';
  speakStart: number;
  speakEnd: number;
  fieldValue: string;
  /** Character offset in the clip field where `fieldValue` begins. */
  fieldOffset: number;
};

function leadingTrimOffset(raw: string): number {
  const match = raw.match(/^\s*/);
  return match ? match[0].length : 0;
}

function getSpeakFieldRanges(clip: TtsClip): { speakText: string; ranges: SpeakFieldRange[] } {
  const speakText = buildSpeakText(clip);
  const ranges: SpeakFieldRange[] = [];

  if (clip.noTitle) {
    const body = clip.text.trim();
    if (body) {
      ranges.push({
        field: 'text',
        speakStart: 0,
        speakEnd: speakText.length,
        fieldValue: body,
        fieldOffset: leadingTrimOffset(clip.text),
      });
    }
    return { speakText, ranges };
  }

  const title = clip.title.trim();
  const body = clip.text.trim();

  if (title && body) {
    ranges.push({
      field: 'title',
      speakStart: 0,
      speakEnd: title.length,
      fieldValue: title,
      fieldOffset: leadingTrimOffset(clip.title),
    });
    ranges.push({
      field: 'text',
      speakStart: title.length + 2,
      speakEnd: speakText.length,
      fieldValue: body,
      fieldOffset: leadingTrimOffset(clip.text),
    });
  } else if (title) {
    ranges.push({
      field: 'title',
      speakStart: 0,
      speakEnd: speakText.length,
      fieldValue: title,
      fieldOffset: leadingTrimOffset(clip.title),
    });
  } else if (body) {
    ranges.push({
      field: 'text',
      speakStart: 0,
      speakEnd: speakText.length,
      fieldValue: body,
      fieldOffset: leadingTrimOffset(clip.text),
    });
  }

  return { speakText, ranges };
}

function activeWordIndexForField(
  field: 'title' | 'text',
  fieldValue: string,
  ranges: SpeakFieldRange[],
  words: SpeakWord[],
  globalWordIndex: number,
): number | null {
  const word = words[globalWordIndex];
  if (!word) return null;

  const range = ranges.find(
    (entry) => entry.field === field && word.start >= entry.speakStart && word.start < entry.speakEnd,
  );
  if (!range) return null;

  const fieldWords = tokenizeSpeakWords(fieldValue);
  const charInField = word.start - range.speakStart + range.fieldOffset;
  const idx = fieldWords.findIndex((entry) => entry.start === charInField);
  return idx >= 0 ? idx : null;
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
    parts.push(
      <span
        key={`${word.start}-${word.text}`}
        ref={index === active ? activeWordRef : undefined}
        className={spokenWordHighlightClass(Math.abs(index - active))}
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
    activeWordRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeWordIndex]);

  if (words.length === 0) {
    return (
      <div className="rounded-(--r-lg) border border-(--border-light) bg-[color-mix(in_oklab,var(--bg-card-hi)_70%,transparent)] px-3 py-2 text-body leading-relaxed text-(--text-faint)">
        No text to speak yet
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="max-h-[calc(3*1.625*1em+1rem)] overflow-y-auto overscroll-y-contain scroll-smooth rounded-(--r-lg) border border-(--border-light) bg-[color-mix(in_oklab,var(--bg-card-hi)_70%,transparent)] px-3 py-2 text-body leading-relaxed scrollbar-thin"
    >
      <p className="whitespace-pre-wrap wrap-break-word">
        {renderHighlightedPlainText(text, words, activeWordIndex, activeWordRef)}
      </p>
    </div>
  );
}

function HighlightedTextField({
  value,
  onChange,
  activeWordIndex,
  highlight,
  multiline = false,
  className,
  placeholder,
  rows,
  onPaste,
}: {
  value: string;
  onChange: (value: string) => void;
  activeWordIndex: number | null;
  highlight: boolean;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  rows?: number;
  onPaste?: React.ClipboardEventHandler<HTMLTextAreaElement>;
}) {
  const fieldWords = useMemo(() => tokenizeSpeakWords(value), [value]);
  const overlayScrollRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const showHighlight = highlight && activeWordIndex != null && fieldWords.length > 0;

  const syncOverlayScroll = useCallback(() => {
    const field = fieldRef.current;
    const overlay = overlayScrollRef.current;
    if (!field || !overlay) return;
    overlay.scrollTop = field.scrollTop;
    overlay.scrollLeft = field.scrollLeft;
  }, []);

  useEffect(() => {
    if (!showHighlight) return;
    activeWordRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    syncOverlayScroll();
  }, [activeWordIndex, showHighlight, syncOverlayScroll, value]);

  const overlayClassName = cn(
    inputClassName,
    'pointer-events-none col-start-1 row-start-1 overflow-hidden whitespace-pre-wrap wrap-break-word leading-relaxed',
    multiline ? 'min-h-48' : '',
  );

  const sharedFieldClassName = cn(
    inputClassName,
    'col-start-1 row-start-1 w-full bg-transparent leading-relaxed',
    showHighlight && 'text-transparent caret-(--text-primary) selection:bg-[color-mix(in_oklab,var(--accent-cyan)_30%,transparent)]',
    multiline ? 'min-h-48 resize-y whitespace-pre-wrap wrap-break-word' : '',
    className,
  );

  return (
    <div className="grid *:col-start-1 *:row-start-1">
      {showHighlight ? (
        <div ref={overlayScrollRef} aria-hidden className={overlayClassName}>
          {renderHighlightedPlainText(value, fieldWords, activeWordIndex, activeWordRef)}
        </div>
      ) : null}
      {multiline ? (
        <textarea
          ref={fieldRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          rows={rows}
          placeholder={placeholder}
          onPaste={onPaste}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncOverlayScroll}
          className={sharedFieldClassName}
        />
      ) : (
        <input
          ref={fieldRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncOverlayScroll}
          className={sharedFieldClassName}
        />
      )}
    </div>
  );
}

function useEstimatedSpeakProgress(
  text: string,
  words: SpeakWord[],
  status: PocketTtsStatus,
  startWordIndex: number,
) {
  const remainingText = useMemo(
    () => speakTextFromWordIndex(text, words, startWordIndex),
    [text, words, startWordIndex],
  );
  const estimatedMs = useMemo(() => estimateSpeakDurationMs(remainingText), [remainingText]);
  const remainingWordCount = Math.max(0, words.length - startWordIndex);
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === 'playing') {
      startedAtRef.current = performance.now();
      const tick = () => {
        if (startedAtRef.current == null) return;
        const elapsed = performance.now() - startedAtRef.current;
        setElapsedMs(elapsed);
        setProgress(estimatedMs > 0 ? Math.min(1, elapsed / estimatedMs) : 0);
      };
      tick();
      const id = window.setInterval(tick, 100);
      return () => clearInterval(id);
    }

    startedAtRef.current = null;
    setElapsedMs(0);
    setProgress(0);
  }, [estimatedMs, status]);

  const offsetInRemaining =
    remainingWordCount > 0
      ? Math.min(remainingWordCount - 1, Math.floor(progress * remainingWordCount))
      : 0;
  const estWordIndex =
    words.length > 0 ? clampWordIndex(startWordIndex + offsetInRemaining, words.length) : 0;

  return { progress, elapsedMs, estimatedMs, estWordIndex };
}

function TtsPage() {
  const [workbench, setWorkbench, hydrated] = useLocalStorage<TtsWorkbenchState>(
    STORAGE_KEY,
    EMPTY_WORKBENCH,
  );
  const settings = useAppStore((s) => s.settings);
  const bootstrap = useReadAloudBootstrap(true, settings.reading.voice);
  const { status, error, speak, stop } = usePocketTts({
    voice: settings.reading.voice,
    volume: settings.audio.volume,
  });
  const [cursorWordIndex, setCursorWordIndex] = useState(0);
  const [playbackAnchorWordIndex, setPlaybackAnchorWordIndex] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const scrubRef = useRef(false);
  const scrubWordRef = useRef(0);

  const selectedClip = useMemo(
    () => workbench.clips.find((clip) => clip.id === workbench.selectedId) ?? null,
    [workbench.clips, workbench.selectedId],
  );

  const sortedClips = useMemo(
    () => [...workbench.clips].sort((a, b) => b.updatedAt - a.updatedAt),
    [workbench.clips],
  );

  const speakLayout = useMemo(
    () => (selectedClip ? getSpeakFieldRanges(selectedClip) : { speakText: '', ranges: [] as SpeakFieldRange[] }),
    [selectedClip],
  );
  const speakText = speakLayout.speakText;
  const speakWords = useMemo(() => tokenizeSpeakWords(speakText), [speakText]);
  const wordCount = speakWords.length;
  const { elapsedMs, estimatedMs, estWordIndex } = useEstimatedSpeakProgress(
    speakText,
    speakWords,
    status,
    playbackAnchorWordIndex,
  );
  const canPlay = Boolean(speakText.trim());
  const isActive = status === 'loading' || status === 'playing';
  const displayWordIndex = isScrubbing ? cursorWordIndex : estWordIndex;
  const sliderPct = sliderValueFromWordIndex(displayWordIndex, wordCount);
  const voiceLoading = status === 'loading' && bootstrap.status === 'loading' && !isScrubbing;
  const showFieldHighlight = isActive || isScrubbing;
  const titleActiveWordIndex = useMemo(() => {
    if (!showFieldHighlight || !selectedClip) return null;
    return activeWordIndexForField(
      'title',
      selectedClip.title,
      speakLayout.ranges,
      speakWords,
      displayWordIndex,
    );
  }, [displayWordIndex, selectedClip, showFieldHighlight, speakLayout.ranges, speakWords]);
  const textActiveWordIndex = useMemo(() => {
    if (!showFieldHighlight || !selectedClip) return null;
    return activeWordIndexForField(
      'text',
      selectedClip.text,
      speakLayout.ranges,
      speakWords,
      displayWordIndex,
    );
  }, [displayWordIndex, selectedClip, showFieldHighlight, speakLayout.ranges, speakWords]);

  useEffect(() => {
    setCursorWordIndex(0);
    setPlaybackAnchorWordIndex(0);
    setIsScrubbing(false);
    scrubRef.current = false;
    scrubWordRef.current = 0;
  }, [selectedClip?.id]);

  useEffect(() => {
    setCursorWordIndex((index) => clampWordIndex(index, wordCount));
  }, [wordCount]);

  useEffect(() => {
    if (status === 'playing' && !isScrubbing) {
      setCursorWordIndex(estWordIndex);
    }
  }, [estWordIndex, isScrubbing, status]);

  const speakFromWord = useCallback(
    (wordIndex: number) => {
      const clamped = clampWordIndex(wordIndex, wordCount);
      const text = speakTextFromWordIndex(speakText, speakWords, clamped);
      if (!text) return;
      setPlaybackAnchorWordIndex(clamped);
      setCursorWordIndex(clamped);
      void speak(text);
    },
    [speak, speakText, speakWords, wordCount],
  );

  const handleSliderPointerDown = useCallback(() => {
    if (!canPlay || wordCount === 0) return;
    scrubRef.current = true;
    scrubWordRef.current = cursorWordIndex;
    setIsScrubbing(true);
    if (isActive) stop();
  }, [canPlay, cursorWordIndex, isActive, stop, wordCount]);

  const handleSliderChange = useCallback(
    (value: number) => {
      if (!canPlay || wordCount === 0) return;
      const index = wordIndexFromSlider(value, wordCount);
      scrubWordRef.current = index;
      setCursorWordIndex(index);
    },
    [canPlay, wordCount],
  );

  const finishScrub = useCallback(() => {
    if (!scrubRef.current || !canPlay || wordCount === 0) return;
    scrubRef.current = false;
    setIsScrubbing(false);
    speakFromWord(scrubWordRef.current);
  }, [canPlay, speakFromWord, wordCount]);

  const handlePlaybackToggle = useCallback(() => {
    if (status === 'playing' || status === 'loading') {
      stop();
      return;
    }
    speakFromWord(cursorWordIndex);
  }, [cursorWordIndex, speakFromWord, status, stop]);

  const updateClip = useCallback(
    (clipId: string, patch: Partial<TtsClip>) => {
      setWorkbench((prev) => ({
        ...prev,
        clips: prev.clips.map((clip) =>
          clip.id === clipId ? { ...clip, ...patch, updatedAt: Date.now() } : clip,
        ),
      }));
    },
    [setWorkbench],
  );

  const selectClip = useCallback(
    (clipId: string) => {
      stop();
      setWorkbench((prev) => ({ ...prev, selectedId: clipId }));
    },
    [setWorkbench, stop],
  );

  const createNewClip = useCallback(() => {
    stop();
    const clip = createClip();
    setWorkbench((prev) => ({
      clips: [clip, ...prev.clips],
      selectedId: clip.id,
    }));
  }, [setWorkbench, stop]);

  const deleteSelectedClip = useCallback(() => {
    if (!selectedClip) return;
    stop();
    setWorkbench((prev) => {
      const clips = prev.clips.filter((clip) => clip.id !== selectedClip.id);
      return {
        clips,
        selectedId: clips[0]?.id ?? null,
      };
    });
  }, [selectedClip, setWorkbench, stop]);

  useEffect(() => {
    if (!hydrated || workbench.clips.length === 0) return;
    if (workbench.selectedId && workbench.clips.some((clip) => clip.id === workbench.selectedId)) {
      return;
    }
    setWorkbench((prev) => ({ ...prev, selectedId: prev.clips[0]!.id }));
  }, [hydrated, setWorkbench, workbench.clips, workbench.selectedId]);

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
      <main className="page-wrap px-4 py-8">
        <p className="text-body text-(--text-dim)">Loading…</p>
      </main>
    );
  }

  if (workbench.clips.length === 0) {
    return (
      <main className="page-wrap px-4 py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-meta text-(--text-dim) no-underline hover:text-(--text-secondary)"
        >
          <ChevronLeft size={16} />
          Home
        </Link>
        <h1 className="text-display-lg mb-4 font-black">TTS Workbench</h1>
        <Card className="max-w-(--w-medium) space-y-4">
          <p className="text-body text-(--text-secondary)">
            Paste text, pick a name, and try read-aloud voices.
          </p>
          <Button variant="primary" onClick={createNewClip}>
            <Plus size={16} />
            New clip
          </Button>
        </Card>
      </main>
    );
  }

  if (!selectedClip) {
    return (
      <main className="page-wrap px-4 py-8">
        <p className="text-body text-(--text-dim)">Loading…</p>
      </main>
    );
  }

  return (
    <main className="page-wrap px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-meta text-(--text-dim) no-underline hover:text-(--text-secondary)"
      >
        <ChevronLeft size={16} />
        Home
      </Link>

      <h1 className="text-display-lg mb-6 font-black">TTS Workbench</h1>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="min-h-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-headline-md font-bold">Saved clips</h2>
            <Button variant="secondary" onClick={createNewClip}>
              <Plus size={16} />
              New
            </Button>
          </div>
          <Card className="max-h-[min(70vh,720px)] overflow-y-auto p-2">
            <ul className="space-y-1">
              {sortedClips.map((clip) => {
                const active = clip.id === selectedClip.id;
                return (
                  <li key={clip.id}>
                    <button
                      type="button"
                      onClick={() => selectClip(clip.id)}
                      className={cn(
                        'w-full rounded-(--r-lg) px-4 py-3 text-left transition-colors',
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
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>

        <section className="space-y-5">
          <Card className="glass-md glass-bg-header sticky top-16 z-30 space-y-4 border-(--border-light) shadow-[0_8px_24px_color-mix(in_oklab,var(--bg-deep)_40%,transparent)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-headline-md font-bold">Playback</h2>
                <p className="mt-1 text-meta text-(--text-faint)">
                  {formatPocketTtsVoiceLabel(settings.reading.voice)} ·{' '}
                  {Math.round(settings.audio.volume * 100)}% volume
                </p>
              </div>
              <Link
                to="/settings"
                className="inline-flex shrink-0 items-center gap-1 rounded-(--r-lg) px-2 py-1.5 text-meta text-(--text-dim) no-underline hover:bg-(--bg-card-active) hover:text-(--text-secondary)"
              >
                <Settings2 size={14} aria-hidden />
                Settings
              </Link>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={sliderPct}
                disabled={!canPlay || wordCount === 0}
                onPointerDown={handleSliderPointerDown}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                onPointerUp={finishScrub}
                onPointerCancel={finishScrub}
                onBlur={finishScrub}
                aria-label="Seek through spoken text by word"
                aria-valuetext={`Word ${displayWordIndex + 1} of ${wordCount}`}
                className="w-full accent-(--accent-cyan) disabled:opacity-40"
              />
              <div className="flex items-center justify-between gap-3 text-meta tabular-nums text-(--text-faint)">
                <span>{formatPlaybackClock(elapsedMs)}</span>
                <span className="truncate text-center">
                  {canPlay
                    ? voiceLoading
                      ? `Loading voice… ${Math.round(bootstrap.progress * 100)}%`
                      : `Word ${displayWordIndex + 1}/${wordCount} (est.)`
                    : 'Add text to preview'}
                </span>
                <span>{formatPlaybackClock(estimatedMs)}</span>
              </div>
            </div>

            <SpokenTextHighlight
              text={speakText}
              words={speakWords}
              activeWordIndex={displayWordIndex}
            />

            <div className="flex flex-wrap items-center gap-2">
              <ReadAloudButton
                text={speakText}
                status={status}
                error={error}
                onToggle={handlePlaybackToggle}
                label="Play clip"
                className="min-w-38"
              />
              <Button
                variant="ghost"
                disabled={!isActive}
                onClick={stop}
                aria-label="Stop playback"
                className="gap-2"
              >
                <Square size={14} aria-hidden />
                Stop
              </Button>
            </div>
          </Card>

          <Card className="space-y-5">
            <Field label="Name">
              <input
                value={selectedClip.name}
                onChange={(e) => updateClip(selectedClip.id, { name: e.target.value })}
                placeholder="Clip name"
                className={inputClassName}
              />
            </Field>

            <ToggleField
              label="No title"
              description="Skip the title line when speaking"
              checked={selectedClip.noTitle}
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

            {!selectedClip.noTitle ? (
              <Field label="Title">
                <HighlightedTextField
                  value={selectedClip.title}
                  onChange={(title) => updateClip(selectedClip.id, { title })}
                  placeholder="First line becomes the title"
                  activeWordIndex={titleActiveWordIndex}
                  highlight={showFieldHighlight}
                />
              </Field>
            ) : null}

            <Field label="Text">
              <HighlightedTextField
                value={selectedClip.text}
                onChange={(text) => updateClip(selectedClip.id, { text })}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData('text');
                  if (!pasted || selectedClip.noTitle) return;
                  e.preventDefault();
                  handlePasteText(pasted);
                }}
                rows={12}
                placeholder="Paste or type text here…"
                activeWordIndex={textActiveWordIndex}
                highlight={showFieldHighlight}
                multiline
              />
              {!selectedClip.noTitle ? (
                <p className="mt-2 text-meta text-(--text-faint)">
                  Pasting multi-line text uses the first line as the title.
                </p>
              ) : null}
            </Field>

            <div className="flex flex-wrap gap-2">
              <Button variant="destructive" onClick={deleteSelectedClip}>
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
    <div>
      <div className="mb-2 text-meta font-bold uppercase tracking-[0.08em] text-(--text-dim)">
        {label}
      </div>
      {children}
    </div>
  );
}
