'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type FigureMeta = {
  id: string;
  alt: string;
  caption?: string;
};

type FigureProps = {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
};

export function figureIdFromSrc(src: string): string | undefined {
  const name = src.split('/').pop()?.replace(/\.svg$/i, '');
  return name ?? undefined;
}

function FigureImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn('mx-auto block h-auto max-w-full min-w-0 w-full', className)}
    />
  );
}

export function Figure({ src, alt, caption, className }: FigureProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollable(el.scrollWidth > el.clientWidth + 2);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, src]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  return (
    <>
      <figure className={cn('my-5 min-w-0', className)}>
        <div
          ref={scrollRef}
          className="overflow-x-auto [-webkit-overflow-scrolling:touch]"
        >
          <button
            type="button"
            className="block w-full cursor-zoom-in text-left sm:cursor-default"
            onClick={() => {
              if (window.matchMedia('(max-width: 639px)').matches) {
                setExpanded(true);
              }
            }}
            aria-label={`Expand diagram: ${alt}`}
          >
            <FigureImage src={src} alt={alt} />
          </button>
        </div>
        {scrollable ? (
          <p className="mt-1 text-center text-micro text-(--text-dim) sm:hidden">
            Swipe sideways or tap to expand
          </p>
        ) : null}
        {caption ? (
          <figcaption className="mt-2 text-center text-meta text-(--text-dim)">
            {caption}
          </figcaption>
        ) : null}
      </figure>

      {expanded ? (
        <div
          className="fixed inset-0 z-60 flex flex-col bg-black/85 safe-top safe-bottom"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
            <p className="min-w-0 flex-1 text-body font-semibold text-(--text-primary)">{alt}</p>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--border-light) bg-(--bg-card) text-(--text-secondary)"
              aria-label="Close expanded diagram"
            >
              <X size={18} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 [-webkit-overflow-scrolling:touch]">
            <FigureImage src={src} alt={alt} className="max-w-none w-max min-w-full" />
            {caption ? (
              <p className="mt-3 text-center text-meta text-(--text-dim)">{caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
