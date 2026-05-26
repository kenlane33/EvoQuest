import type { CalibrationRecord } from '@/types/schemas';

export const CONFIDENCE_MARKS = [0.25, 0.5, 0.75, 0.9, 0.99] as const;

export function shouldAskConfidence(
  frequency: 'every' | 'every-3' | 'never',
  questionIndex: number,
): boolean {
  if (frequency === 'never') return false;
  if (frequency === 'every') return true;
  return questionIndex % 3 === 0;
}

export function calibrationNote(
  predicted: number,
  correct: boolean,
): string {
  const pct = Math.round(predicted * 100);
  if (correct) {
    if (predicted >= 0.75) {
      return `You predicted ${pct}% and got it right — consistent with your calibration.`;
    }
    return `You predicted ${pct}%, but you got it right — you may be underconfident here.`;
  }
  if (predicted >= 0.75) {
    return `You predicted ${pct}%, but missed this one — your model may be overconfident here.`;
  }
  return `You predicted ${pct}% and missed — your uncertainty matched the outcome.`;
}

export type CalibrationBin = {
  predicted: number;
  attempts: number;
  correct: number;
  accuracy: number;
};

export function summarizeCalibration(records: CalibrationRecord[]): {
  bins: CalibrationBin[];
  total: number;
  meaningful: boolean;
} {
  const bins = CONFIDENCE_MARKS.map((predicted) => ({
    predicted,
    attempts: 0,
    correct: 0,
    accuracy: 0,
  }));

  for (const record of records) {
    const bin =
      bins.find((b) => Math.abs(b.predicted - record.confidence) < 0.01) ??
      bins.reduce((best, cur) =>
        Math.abs(cur.predicted - record.confidence) <
        Math.abs(best.predicted - record.confidence)
          ? cur
          : best,
      );
    bin.attempts++;
    if (record.correct) bin.correct++;
  }

  for (const bin of bins) {
    bin.accuracy = bin.attempts > 0 ? bin.correct / bin.attempts : 0;
  }

  return { bins, total: records.length, meaningful: records.length >= 8 };
}

export function findOverconfidenceTopics(
  records: CalibrationRecord[],
  minAttempts = 3,
): string[] {
  const byUnit = new Map<string, { high: number; highCorrect: number }>();
  for (const r of records) {
    const cur = byUnit.get(r.unitId) ?? { high: 0, highCorrect: 0 };
    if (r.confidence >= 0.75) {
      cur.high++;
      if (r.correct) cur.highCorrect++;
    }
    byUnit.set(r.unitId, cur);
  }
  const out: string[] = [];
  for (const [unitId, stats] of byUnit) {
    if (stats.high >= minAttempts && stats.highCorrect / stats.high < 0.6) {
      out.push(unitId);
    }
  }
  return out.slice(0, 3);
}
