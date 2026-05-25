'use client';

import { Fragment, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { TemplateRegistration } from '@/engine/templates/registry';
import { cn } from '@/lib/cn';
import {
  PunnettBuilderDataSchema,
  type PunnettBuilderData,
} from '@/types/schemas';

type CellState = {
  genotype: string | null;
  phenotype: string | null;
};

function phenotypeForGenotype(data: PunnettBuilderData, genotype: string): string {
  const sorted = genotype.split('').sort().join('');
  const direct = data.phenotypeMap[genotype] ?? data.phenotypeMap[sorted];
  return direct?.label ?? genotype;
}

function PunnettBuilderRenderer({
  data,
  onResult,
}: {
  data: PunnettBuilderData;
  onResult: (result: { correct: boolean; ms: number }) => void;
}) {
  const startMs = useRef(Date.now());
  const [rowAlleles, setRowAlleles] = useState<[string | null, string | null]>([null, null]);
  const [colAlleles, setColAlleles] = useState<[string | null, string | null]>([null, null]);
  const [cells, setCells] = useState<CellState[]>(() =>
    Array.from({ length: 4 }, () => ({ genotype: null, phenotype: null })),
  );
  const [dragging, setDragging] = useState<{ allele: string; parent: 0 | 1 } | null>(null);
  const [selected, setSelected] = useState<{ allele: string; parent: 0 | 1 } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const finishedRef = useRef(false);

  const labels = useMemo(() => {
    const set = new Set<string>();
    for (const meta of Object.values(data.phenotypeMap)) set.add(meta.label);
    return [...set];
  }, [data.phenotypeMap]);

  const gridReady =
    rowAlleles.every(Boolean) &&
    colAlleles.every(Boolean) &&
    cells.every((c) => c.phenotype !== null);

  const tallies = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cell of cells) {
      if (!cell.phenotype) continue;
      counts[cell.phenotype] = (counts[cell.phenotype] ?? 0) + 1;
    }
    return counts;
  }, [cells]);

  function fillGrid(nextRow: [string | null, string | null], nextCol: [string | null, string | null]) {
    if (!nextRow.every(Boolean) || !nextCol.every(Boolean)) return;
    const combos = [
      `${nextRow[0]}${nextCol[0]}`,
      `${nextRow[0]}${nextCol[1]}`,
      `${nextRow[1]}${nextCol[0]}`,
      `${nextRow[1]}${nextCol[1]}`,
    ];
    setCells((prev) =>
      prev.map((cell, i) => ({
        genotype: combos[i],
        phenotype: cell.phenotype,
      })),
    );
  }

  function assignHeader(parentIndex: 0 | 1, slot: 0 | 1, allele: string) {
    if (parentIndex === 0) {
      const next: [string | null, string | null] = [...rowAlleles];
      next[slot] = allele;
      setRowAlleles(next);
      fillGrid(next, colAlleles);
    } else {
      const next: [string | null, string | null] = [...colAlleles];
      next[slot] = allele;
      setColAlleles(next);
      fillGrid(rowAlleles, next);
    }
    setDragging(null);
    setSelected(null);
  }

  function onHeaderDrop(parentIndex: 0 | 1, slot: 0 | 1) {
    const source = dragging ?? selected;
    if (!source || source.parent !== parentIndex) return;
    assignHeader(parentIndex, slot, source.allele);
  }

  function setPhenotype(index: number, phenotype: string) {
    setCells((prev) =>
      prev.map((cell, i) => (i === index ? { ...cell, phenotype } : cell)),
    );
  }

  function autoFillPhenotypes() {
    setCells((prev) =>
      prev.map((cell) =>
        cell.genotype
          ? { ...cell, phenotype: phenotypeForGenotype(data, cell.genotype) }
          : cell,
      ),
    );
  }

  function submit() {
    if (!gridReady || finishedRef.current) return;
    const parts = data.expectedRatio.split(':').map((n) => parseInt(n, 10));
    const dominantCount = tallies[data.dominantPhenotype] ?? 0;
    const recessiveLabel = labels.find((l) => l !== data.dominantPhenotype);
    const recessiveCount = recessiveLabel ? (tallies[recessiveLabel] ?? 0) : 0;
    const correct =
      parts.length === 2 &&
      dominantCount === parts[0] &&
      recessiveCount === parts[1];
    finishedRef.current = true;
    setSubmitted(true);
    onResult({ correct, ms: Date.now() - startMs.current });
  }

  return (
    <div className="space-y-5">
      <p className="text-body-lg text-(--text-secondary)">{data.scenario}</p>
      <p className="text-meta text-(--text-dim)">
        Drag alleles into headers, label each cell&apos;s phenotype, then commit.
      </p>

      <div className="grid grid-cols-[auto_1fr_1fr] gap-1">
        <div />
        {[0, 1].map((slot) => (
          <div
            key={`col-${slot}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onHeaderDrop(1, slot as 0 | 1);
            }}
            onClick={() => selected?.parent === 1 && assignHeader(1, slot as 0 | 1, selected.allele)}
            className={cn(
              'flex min-h-10 items-center justify-center rounded border border-dashed px-2 font-bold',
              colAlleles[slot]
                ? 'border-(--accent-violet) bg-[color-mix(in_oklab,var(--accent-violet)_10%,transparent)]'
                : 'border-(--border-light) bg-(--bg-card)',
            )}
          >
            {colAlleles[slot] ?? `♀ ${slot + 1}`}
          </div>
        ))}

        {[0, 1].map((row) => (
          <Fragment key={`row-${row}`}>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onHeaderDrop(0, row as 0 | 1);
              }}
              onClick={() => selected?.parent === 0 && assignHeader(0, row as 0 | 1, selected.allele)}
              className={cn(
                'flex min-h-10 items-center justify-center rounded border border-dashed px-2 font-bold',
                rowAlleles[row]
                  ? 'border-(--accent-cyan) bg-[color-mix(in_oklab,var(--accent-cyan)_10%,transparent)]'
                  : 'border-(--border-light) bg-(--bg-card)',
              )}
            >
              {rowAlleles[row] ?? `♂ ${row + 1}`}
            </div>
            {[0, 1].map((col) => {
              const index = row * 2 + col;
              const cell = cells[index];
              return (
                <div
                  key={`cell-${row}-${col}`}
                  className="min-h-16 rounded border border-(--border-light) bg-(--bg-card-hi) p-2"
                >
                  <p className="text-micro font-bold text-(--text-dim)">{cell.genotype ?? '?'}</p>
                  {cell.genotype ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {labels.map((label) => {
                        const meta = Object.values(data.phenotypeMap).find((m) => m.label === label);
                        return (
                          <button
                            key={label}
                            type="button"
                            disabled={submitted}
                            onClick={() => setPhenotype(index, label)}
                            className={cn(
                              'rounded px-1.5 py-0.5 text-micro font-semibold',
                              cell.phenotype === label
                                ? 'ring-1 ring-(--border-medium)'
                                : 'opacity-70 hover:opacity-100',
                            )}
                            style={{
                              backgroundColor: `color-mix(in oklab, ${meta?.color ?? '#888'} 20%, transparent)`,
                              color: meta?.color ?? 'inherit',
                            }}
                          >
                            {meta?.icon ? `${meta.icon} ` : ''}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        {data.parents.map((parent, parentIndex) => (
          <div key={parent.label}>
            <p className="mb-1 text-micro font-bold uppercase text-(--text-dim)">{parent.label}</p>
            <div className="flex gap-2">
              {parent.alleles.map((allele) => (
                <button
                  key={`${parentIndex}-${allele}`}
                  type="button"
                  draggable
                  onDragStart={() => setDragging({ allele, parent: parentIndex as 0 | 1 })}
                  onDragEnd={() => setDragging(null)}
                  onClick={() =>
                    setSelected((prev) =>
                      prev?.allele === allele && prev.parent === parentIndex
                        ? null
                        : { allele, parent: parentIndex as 0 | 1 },
                    )
                  }
                  className={cn(
                    'cursor-grab rounded-(--r-lg) border px-3 py-2 font-bold active:cursor-grabbing',
                    selected?.allele === allele && selected.parent === parentIndex
                      ? 'border-(--accent-cyan) bg-[color-mix(in_oklab,var(--accent-cyan)_12%,transparent)]'
                      : 'border-(--border-light) bg-(--bg-card)',
                  )}
                >
                  {allele}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {rowAlleles.every(Boolean) && colAlleles.every(Boolean) ? (
        <Button variant="text" onClick={autoFillPhenotypes} className="text-(--text-dim)">
          Auto-label from genotypes
        </Button>
      ) : null}

      {Object.keys(tallies).length > 0 ? (
        <Card>
          <p className="text-micro font-bold uppercase tracking-widest text-(--text-dim)">Live tally</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {Object.entries(tallies).map(([label, count]) => (
              <span key={label} className="text-body font-semibold text-(--text-primary)">
                {label}: {count}/4
              </span>
            ))}
          </div>
        </Card>
      ) : null}

      {!submitted ? (
        <Button variant="primary" disabled={!gridReady} onClick={submit}>
          Commit ratio
        </Button>
      ) : (
        <Card variant={(tallies[data.dominantPhenotype] ?? 0) > 0 ? 'correct' : 'wrong'}>
          <p className="text-body text-(--text-secondary)">
            Expected ratio for {data.dominantPhenotype}: {data.expectedRatio.replace(':', ' purple : ')} white
          </p>
          {data.notes ? <p className="mt-2 text-meta text-(--text-dim)">{data.notes}</p> : null}
        </Card>
      )}
    </div>
  );
}

const exemplar: PunnettBuilderData = {
  scenario: 'Cross Pp × pp. What ratio of purple to white offspring?',
  parents: [
    { label: 'Parent 1 (heterozygous)', alleles: ['P', 'p'] },
    { label: 'Parent 2 (homozygous recessive)', alleles: ['p', 'p'] },
  ],
  phenotypeMap: {
    PP: { label: 'Purple', color: '#a855f7', icon: '🟣' },
    Pp: { label: 'Purple', color: '#a855f7', icon: '🟣' },
    pp: { label: 'White', color: '#94a3b8', icon: '⚪' },
  },
  dominantPhenotype: 'Purple',
  expectedRatio: '2:2',
  notes: 'Half the offspring inherit a dominant P allele — 1:1 purple to white.',
};

const registration: TemplateRegistration<PunnettBuilderData> = {
  kind: 'punnett-builder',
  schema: PunnettBuilderDataSchema,
  exemplar,
  classifications: {
    fastLane: true,
    microworld: true,
    constructionist: true,
    bodySyntonic: false,
    debugStyle: false,
  },
  Renderer: PunnettBuilderRenderer,
  describePrompt: (data) => `Punnett builder: ${data.scenario.slice(0, 50)}…`,
  estimateMs: () => 90_000,
  defaultConfidenceMs: 60_000,
};

export default registration;
