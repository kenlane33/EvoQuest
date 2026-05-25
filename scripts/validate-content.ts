#!/usr/bin/env bun
/**
 * Validates all bundled ContentModules against Zod schemas at build time.
 */
import { ContentModuleSchema } from '../src/types/schemas';
import { CONTENT_MODULES } from '../src/content';

let failed = false;

for (const mod of CONTENT_MODULES) {
  const result = ContentModuleSchema.safeParse(mod);
  if (!result.success) {
    failed = true;
    console.error(`✗ ${mod.id}`);
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
  } else {
    console.log(`✓ ${mod.id} — ${mod.title}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`\n${CONTENT_MODULES.length} module(s) validated.`);
