#!/usr/bin/env bun
/**
 * Validates that every figure referenced in bundled content exists on disk
 * and that teach.figures metadata matches teach.body markdown images.
 */
import { CONTENT_MODULES } from '../src/content';
import { validateFigureReferences } from '../src/lib/content-figures';

const issues = validateFigureReferences(CONTENT_MODULES);

if (issues.length === 0) {
  console.log(`✓ All figure references valid (${CONTENT_MODULES.length} module(s)).`);
  process.exit(0);
}

let failed = false;

for (const issue of issues) {
  failed = true;
  console.error(`✗ ${issue.unitId} — ${issue.figureId}: ${issue.detail} [${issue.kind}]`);
}

process.exit(failed ? 1 : 0);
