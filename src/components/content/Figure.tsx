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

export function Figure({ src, alt, caption, className }: FigureProps) {
  return (
    <figure className={cn('my-5 min-w-0', className)}>
      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="mx-auto block h-auto max-w-full min-w-0 w-full"
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-meta text-(--text-dim)">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
