import { describe, expect, it } from 'vitest';
import {
  calibrationNote,
  shouldAskConfidence,
  summarizeCalibration,
} from '@/engine/calibration';
import type { CalibrationRecord } from '@/types/schemas';

describe('calibration', () => {
  it('skips confidence prompts when disabled', () => {
    expect(shouldAskConfidence('never', 0)).toBe(false);
    expect(shouldAskConfidence('never', 3)).toBe(false);
  });

  it('samples every third question when set to every-3', () => {
    expect(shouldAskConfidence('every-3', 0)).toBe(true);
    expect(shouldAskConfidence('every-3', 1)).toBe(false);
    expect(shouldAskConfidence('every-3', 3)).toBe(true);
  });

  it('notes overconfidence after a miss', () => {
    expect(calibrationNote(0.9, false)).toContain('overconfident');
  });

  it('summarizes bins from records', () => {
    const records: CalibrationRecord[] = [
      {
        id: '1',
        attemptId: 'a1',
        unitId: 'u1',
        templateKind: 'fill',
        confidence: 0.75,
        correct: true,
        recordedAt: 1,
      },
      {
        id: '2',
        attemptId: 'a2',
        unitId: 'u1',
        templateKind: 'fill',
        confidence: 0.75,
        correct: false,
        recordedAt: 2,
      },
    ];
    const summary = summarizeCalibration(records);
    expect(summary.total).toBe(2);
    expect(summary.bins.find((b) => b.predicted === 0.75)?.attempts).toBe(2);
  });
});
