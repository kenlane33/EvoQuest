import type { TeachBlock } from '@/types';

/** Strip common markdown for TTS (headings, links, images, tables). */
export function stripMarkdown(md: string): string {
  return md
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/^\|.+\|$/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function teachToPlainText(
  teach: TeachBlock,
  opts?: { includeBody?: boolean; includePoweredIdea?: boolean },
): string {
  const includeBody = opts?.includeBody !== false;
  const includePoweredIdea = opts?.includePoweredIdea !== false;
  const parts: string[] = [teach.headline];
  if (includeBody && teach.body) {
    parts.push(stripMarkdown(teach.body));
  }
  if (includePoweredIdea && teach.poweredIdea) {
    parts.push(teach.poweredIdea);
  }
  return parts.filter((p) => p.length > 0).join('. ');
}
