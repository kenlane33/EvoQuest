import type { CanonicalEdge, ConceptMapBuilderData } from '@/types/schemas';

export type StudentEdge = {
  from: string;
  to: string;
  label: string;
};

export type EdgeDiff = {
  matched: CanonicalEdge[];
  missing: CanonicalEdge[];
  extra: StudentEdge[];
  wrongLabel: Array<{ edge: StudentEdge; expected: CanonicalEdge }>;
};

export function diffConceptMap(
  data: ConceptMapBuilderData,
  studentEdges: StudentEdge[],
): EdgeDiff {
  const matched: CanonicalEdge[] = [];
  const missing: CanonicalEdge[] = [];
  const wrongLabel: EdgeDiff['wrongLabel'] = [];
  const usedStudent = new Set<number>();

  for (const canonical of data.canonicalEdges) {
    const idx = studentEdges.findIndex(
      (s, i) =>
        !usedStudent.has(i) &&
        s.from === canonical.from &&
        s.to === canonical.to &&
        s.label === canonical.label,
    );
    if (idx >= 0) {
      matched.push(canonical);
      usedStudent.add(idx);
      continue;
    }

    const partial = studentEdges.findIndex(
      (s, i) => !usedStudent.has(i) && s.from === canonical.from && s.to === canonical.to,
    );
    if (partial >= 0) {
      wrongLabel.push({ edge: studentEdges[partial], expected: canonical });
      usedStudent.add(partial);
    } else {
      missing.push(canonical);
    }
  }

  const extra = studentEdges.filter((_, i) => !usedStudent.has(i));
  return { matched, missing, extra, wrongLabel };
}

export function passesConceptMap(
  data: ConceptMapBuilderData,
  studentEdges: StudentEdge[],
): boolean {
  const diff = diffConceptMap(data, studentEdges);
  const critical = data.canonicalEdges.filter((e) => e.importance === 'critical');
  return critical.every((edge) =>
    diff.matched.some(
      (m) => m.from === edge.from && m.to === edge.to && m.label === edge.label,
    ),
  );
}
