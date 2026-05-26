import { describe, expect, it } from 'vitest';
import { CONTENT_MODULES } from '@/content';
import { isPlayableQuizKind } from '@/engine/playable-kinds';
import '@/engine/templates';
import type { KnowledgeUnit, QuizTemplate } from '@/types';

function walkUnits(
  nodes: Array<{ children?: unknown[] } & Partial<KnowledgeUnit>>,
  out: KnowledgeUnit[] = [],
): KnowledgeUnit[] {
  for (const node of nodes) {
    if ('quizzes' in node && Array.isArray(node.quizzes)) {
      out.push(node as KnowledgeUnit);
    }
    if (Array.isArray(node.children)) {
      walkUnits(node.children as Array<{ children?: unknown[] } & Partial<KnowledgeUnit>>, out);
    }
  }
  return out;
}

function allQuizzes(): QuizTemplate[] {
  const units: KnowledgeUnit[] = [];
  for (const mod of CONTENT_MODULES) {
    walkUnits(mod.tree, units);
  }
  return units.flatMap((u) => u.quizzes);
}

describe('quiz kinds in bundled content', () => {
  it('uses only playable template kinds', () => {
    const kinds = new Set(allQuizzes().map((q) => q.kind));
    for (const kind of kinds) {
      expect(isPlayableQuizKind(kind), `missing renderer for ${kind}`).toBe(true);
    }
  });

  it('includes fill quizzes used by biochemistry units', () => {
    expect(allQuizzes().some((q) => q.kind === 'fill')).toBe(true);
  });
});
