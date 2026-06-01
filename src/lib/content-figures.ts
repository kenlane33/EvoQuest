import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ContentModule, KnowledgeUnit } from '@/types';
import { flattenUnits } from '@/engine/world';

/** Known PNG figures (default extension is svg). */
export const FIGURE_EXT: Record<string, 'svg' | 'png'> = {
  p07_dna_hierarchy: 'png',
};

const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/g;
const FIGURE_ID_FROM_PATH_RE = /([^/]+)\.(svg|png)$/i;

export type FigureReference = {
  figureId: string;
  src: string;
  ext: 'svg' | 'png';
};

export type UnitFigureStatus = {
  unitId: string;
  unitTitle: string;
  moduleId: string;
  figureIds: string[];
  markdownFigureIds: string[];
  missingFromBody: string[];
  missingFromMetadata: string[];
  missingFiles: string[];
};

export type FigureCoverageReport = {
  modules: Array<{
    moduleId: string;
    moduleTitle: string;
    totalUnits: number;
    unitsWithFigures: number;
    unitsWithoutFigures: string[];
  }>;
  units: UnitFigureStatus[];
  orphanFigureIds: string[];
};

function figureExt(figureId: string): 'svg' | 'png' {
  return FIGURE_EXT[figureId] ?? 'svg';
}

export function figureIdFromPath(src: string): string | undefined {
  const match = src.match(FIGURE_ID_FROM_PATH_RE);
  return match?.[1];
}

export function publicPathFromFigureSrc(src: string, publicRoot = 'public'): string {
  const normalized = src.startsWith('/') ? src.slice(1) : src;
  return join(publicRoot, normalized);
}

export function extractMarkdownFigureRefs(body: string): FigureReference[] {
  const refs: FigureReference[] = [];
  for (const match of body.matchAll(MARKDOWN_IMAGE_RE)) {
    const src = match[1]?.trim();
    if (!src) continue;
    const figureId = figureIdFromPath(src);
    if (!figureId) continue;
    const ext = src.toLowerCase().endsWith('.png') ? 'png' : 'svg';
    refs.push({ figureId, src, ext });
  }
  return refs;
}

export function resolveFigureFile(
  figureId: string,
  src?: string,
  publicRoot = 'public',
): { path: string; exists: boolean } {
  if (src) {
    const path = publicPathFromFigureSrc(src, publicRoot);
    return { path, exists: existsSync(path) };
  }
  const ext = figureExt(figureId);
  const path = join(publicRoot, 'content', 'biochemistry', 'figures', `${figureId}.${ext}`);
  return { path, exists: existsSync(path) };
}

export function analyzeUnitFigures(
  unit: KnowledgeUnit,
  moduleId: string,
  publicRoot = 'public',
): UnitFigureStatus {
  const metadataIds = unit.teach.figures?.map((f) => f.id) ?? [];
  const markdownRefs = extractMarkdownFigureRefs(unit.teach.body);
  const markdownFigureIds = markdownRefs.map((r) => r.figureId);

  const metadataSet = new Set(metadataIds);
  const markdownSet = new Set(markdownFigureIds);

  const missingFromBody = metadataIds.filter((id) => !markdownSet.has(id));
  const missingFromMetadata = markdownFigureIds.filter((id) => !metadataSet.has(id));

  const allFigureIds = [...new Set([...metadataIds, ...markdownFigureIds])];
  const missingFiles: string[] = [];

  for (const figureId of allFigureIds) {
    const markdownSrc = markdownRefs.find((r) => r.figureId === figureId)?.src;
    const { exists } = resolveFigureFile(figureId, markdownSrc, publicRoot);
    if (!exists) {
      missingFiles.push(figureId);
    }
  }

  return {
    unitId: unit.id,
    unitTitle: unit.title,
    moduleId,
    figureIds: metadataIds,
    markdownFigureIds,
    missingFromBody,
    missingFromMetadata,
    missingFiles,
  };
}

export function buildFigureCoverageReport(
  modules: ContentModule[],
  publicRoot = 'public',
): FigureCoverageReport {
  const units: UnitFigureStatus[] = [];

  for (const mod of modules) {
    for (const unit of flattenUnits([mod])) {
      units.push(analyzeUnitFigures(unit, mod.id, publicRoot));
    }
  }

  const modulesSummary = modules.map((mod) => {
    const modUnits = units.filter((u) => u.moduleId === mod.id);
    const withFigures = modUnits.filter((u) => u.figureIds.length > 0);
    return {
      moduleId: mod.id,
      moduleTitle: mod.title,
      totalUnits: modUnits.length,
      unitsWithFigures: withFigures.length,
      unitsWithoutFigures: modUnits
        .filter((u) => u.figureIds.length === 0)
        .map((u) => u.unitId),
    };
  });

  const referencedIds = new Set(units.flatMap((u) => [...u.figureIds, ...u.markdownFigureIds]));
  const orphanFigureIds = units.flatMap((u) => u.missingFromBody);

  return {
    modules: modulesSummary,
    units,
    orphanFigureIds: [...new Set(orphanFigureIds.filter((id) => referencedIds.has(id)))],
  };
}

export type FigureValidationIssue = {
  unitId: string;
  kind: 'missing-file' | 'metadata-without-body' | 'body-without-metadata';
  figureId: string;
  detail: string;
};

export function validateFigureReferences(
  modules: ContentModule[],
  publicRoot = 'public',
): FigureValidationIssue[] {
  const issues: FigureValidationIssue[] = [];

  for (const mod of modules) {
    for (const unit of flattenUnits([mod])) {
      const status = analyzeUnitFigures(unit, mod.id, publicRoot);

      for (const figureId of status.missingFiles) {
        issues.push({
          unitId: unit.id,
          kind: 'missing-file',
          figureId,
          detail: `Referenced figure file not found under ${publicRoot}/`,
        });
      }

      for (const figureId of status.missingFromBody) {
        issues.push({
          unitId: unit.id,
          kind: 'metadata-without-body',
          figureId,
          detail: 'Listed in teach.figures but no matching markdown image in teach.body',
        });
      }

      for (const figureId of status.missingFromMetadata) {
        issues.push({
          unitId: unit.id,
          kind: 'body-without-metadata',
          figureId,
          detail: 'Markdown image in teach.body but missing from teach.figures',
        });
      }
    }
  }

  return issues;
}
