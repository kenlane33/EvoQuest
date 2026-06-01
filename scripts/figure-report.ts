#!/usr/bin/env bun
/**
 * Reports diagram coverage across bundled ContentModules.
 */
import { CONTENT_MODULES } from '../src/content';
import { buildFigureCoverageReport } from '../src/lib/content-figures';

const report = buildFigureCoverageReport(CONTENT_MODULES);

console.log('# Figure coverage report\n');

for (const mod of report.modules) {
  const pct =
    mod.totalUnits === 0
      ? 0
      : Math.round((mod.unitsWithFigures / mod.totalUnits) * 100);
  console.log(`## ${mod.moduleTitle} (${mod.moduleId})`);
  console.log(
    `- ${mod.unitsWithFigures}/${mod.totalUnits} units with figures (${pct}%)`,
  );

  if (mod.unitsWithoutFigures.length > 0) {
    console.log(`- Missing diagrams (${mod.unitsWithoutFigures.length}):`);
    for (const unitId of mod.unitsWithoutFigures) {
      console.log(`  - ${unitId}`);
    }
  }
  console.log('');
}

const mismatched = report.units.filter(
  (u) =>
    u.missingFromBody.length > 0 ||
    u.missingFromMetadata.length > 0 ||
    u.missingFiles.length > 0,
);

if (mismatched.length > 0) {
  console.log('## Issues\n');
  for (const unit of mismatched) {
    console.log(`### ${unit.unitTitle} (${unit.unitId})`);
    if (unit.missingFiles.length > 0) {
      console.log(`- Missing files: ${unit.missingFiles.join(', ')}`);
    }
    if (unit.missingFromBody.length > 0) {
      console.log(`- In metadata only: ${unit.missingFromBody.join(', ')}`);
    }
    if (unit.missingFromMetadata.length > 0) {
      console.log(`- In body only: ${unit.missingFromMetadata.join(', ')}`);
    }
    console.log('');
  }
} else {
  console.log('## Issues\nNone — all figure metadata matches body and files exist.\n');
}

const totalUnits = report.modules.reduce((n, m) => n + m.totalUnits, 0);
const withFigures = report.modules.reduce((n, m) => n + m.unitsWithFigures, 0);
console.log(
  `Total: ${withFigures}/${totalUnits} units with diagrams across ${report.modules.length} module(s).`,
);

const bioEocUnits = report.units.filter((u) => u.unitId.startsWith('bio.eoc.'));
if (bioEocUnits.length > 0) {
  const byRoom = new Map<string, { withFigures: number; total: number }>();
  for (const unit of bioEocUnits) {
    const room = unit.unitId.split('.').slice(0, 3).join('.');
    const entry = byRoom.get(room) ?? { withFigures: 0, total: 0 };
    entry.total += 1;
    if (unit.figureIds.length > 0) entry.withFigures += 1;
    byRoom.set(room, entry);
  }

  console.log('\n## Bio EOC rooms (active content)\n');
  for (const [room, stats] of [...byRoom.entries()].sort()) {
    const pct = Math.round((stats.withFigures / stats.total) * 100);
    const bar = stats.withFigures >= 1 ? 'has diagram anchor' : 'no diagram yet';
    console.log(`- ${room}: ${stats.withFigures}/${stats.total} units (${pct}%) — ${bar}`);
  }
}
