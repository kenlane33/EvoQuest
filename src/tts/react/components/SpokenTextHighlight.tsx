'use client';

import { useEffect, useRef } from 'react';
import type { SpeakWord } from '../../engine/speak-word-sync';
import { clampWordIndex } from '../../engine/speak-word-sync';
import { cn } from '../../internal/cn';

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
  if (distance <= 2) return 'text-(--text-secondary)';
  if (distance <= 3) return 'text-(--text-dim)';
  return 'text-(--text-faint)';
}

function renderHighlightedPlainText(
  text: string,
  words: SpeakWord[],
  activeWordIndex: number | null,
  activeWordRef?: React.RefObject<HTMLSpanElement | null>,
  onWordClick?: (wordIndex: number) => void,
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
        role={onWordClick ? 'button' : undefined}
        tabIndex={onWordClick ? 0 : undefined}
        onClick={
          onWordClick
            ? (event) => {
                event.stopPropagation();
                onWordClick(index);
              }
            : undefined
        }
        onKeyDown={
          onWordClick
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onWordClick(index);
                }
              }
            : undefined
        }
        className={cn(
          spokenWordHighlightClass(distance),
          distance === 0 ? 'oo--spoken-text-word' : undefined,
          onWordClick &&
            'cursor-pointer rounded-[0.2em] hover:bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)]',
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

export type SpokenTextHighlightProps = {
  text: string;
  words: SpeakWord[];
  activeWordIndex: number;
  onWordClick?: (wordIndex: number) => void;
  className?: string;
  emptyClassName?: string;
  emptyMessage?: string;
};

export function SpokenTextHighlight({
  text,
  words,
  activeWordIndex,
  onWordClick,
  className,
  emptyClassName,
  emptyMessage = 'No text to speak yet',
}: SpokenTextHighlightProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!scrollRef.current || !activeWordRef.current) return;
    scrollElementToVerticalCenter(scrollRef.current, activeWordRef.current);
  }, [activeWordIndex, text]);

  if (words.length === 0) {
    return (
      <div
        className={cn(
          'oo--tts-spoken-text-empty rounded-(--r-lg) border border-(--border-light) bg-[color-mix(in_oklab,var(--bg-card-hi)_70%,transparent)] px-3 py-2 text-body leading-relaxed text-(--text-faint)',
          emptyClassName,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={cn(
        'oo--tts-spoken-text max-h-[calc(3*1.625*1em+1rem)] overflow-y-auto overscroll-y-contain scroll-smooth rounded-(--r-lg) border border-(--border-light) bg-[color-mix(in_oklab,var(--bg-card-hi)_70%,transparent)] px-3 py-2 text-body leading-relaxed scrollbar-thin',
        className,
      )}
    >
      <p className="whitespace-pre-wrap wrap-break-word">
        {renderHighlightedPlainText(text, words, activeWordIndex, activeWordRef, onWordClick)}
      </p>
    </div>
  );
}

export function formatPlaybackClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}
