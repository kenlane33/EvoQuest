import type { Components } from 'react-markdown';
import type { Element } from 'hast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/cn';
import { Figure, figureIdFromSrc, type FigureMeta } from '@/components/content/Figure';

type MarkdownContentProps = {
  content: string;
  figures?: FigureMeta[];
  compact?: boolean;
  className?: string;
};

function lookupFigure(figures: FigureMeta[] | undefined, src: string, alt: string) {
  const id = figureIdFromSrc(src);
  const match = figures?.find((f) => f.id === id || f.id === src);
  return {
    alt: match?.alt ?? alt,
    caption: match?.caption,
  };
}

function isBlockOnlyParagraph(node: { children?: unknown[] } | undefined) {
  if (!node?.children || node.children.length !== 1) return false;
  const child = node.children[0];
  if (typeof child !== 'object' || child === null || !('type' in child)) return false;
  if (child.type !== 'element') return false;
  const tag = (child as Element).tagName;
  return tag === 'img' || tag === 'figure';
}

export function MarkdownContent({
  content,
  figures,
  compact = false,
  className,
}: MarkdownContentProps) {
  const components: Components = {
    p: ({ node, children, ...props }) => {
      if (isBlockOnlyParagraph(node)) {
        return <div className="my-4">{children}</div>;
      }
      return <p {...props}>{children}</p>;
    },
    img: ({ src, alt }) => {
      if (!src) return null;
      const meta = lookupFigure(figures, src, alt ?? '');
      return <Figure src={src} alt={meta.alt} caption={meta.caption} />;
    },
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-max border-collapse text-left text-body">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-(--border-light) bg-(--bg-card-hi) px-3 py-2 font-bold text-(--text-primary)">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-(--border-faint) px-3 py-2 text-(--text-secondary)">
        {children}
      </td>
    ),
  };

  return (
    <div
      className={cn(
        'prose prose-invert max-w-none',
        compact ? 'prose-sm' : 'prose-base',
        'prose-headings:font-headline prose-headings:text-(--text-primary)',
        'prose-p:text-(--text-secondary) prose-li:text-(--text-secondary)',
        'prose-strong:text-(--text-primary) prose-a:text-(--accent-cyan)',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
