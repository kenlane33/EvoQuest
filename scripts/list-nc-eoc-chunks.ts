#!/usr/bin/env bun
/** List NC EOC chunks (no template registry needed). */
import { NC_EOC_CHUNKS } from '../src/content/authoring/nc-eoc-chunks';

console.log('NC Biology EOC chunks:\n');
for (const c of NC_EOC_CHUNKS) {
  console.log(`  ${c.id.padEnd(22)} ${c.status === 'done' ? '✓' : ' '}  bio-eoc-${c.outFileSlug}.json`);
}
console.log('\nPrint prompts (requires vitest — loads quiz template registry):');
console.log('  bun run print-nc-eoc-prompt master');
console.log('  bun run print-nc-eoc-prompt macromolecules');
