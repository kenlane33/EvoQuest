'use client';

import { Card } from '@/components/common/Card';
import { SpeakButton } from '@/components/content/SpeakButton';
import {
  findOverconfidenceTopics,
  summarizeCalibration,
} from '@/engine/calibration';
import { getUnitById } from '@/content/catalog';
import type { CalibrationRecord } from '@/types/schemas';

type CalibrationPanelProps = {
  records: CalibrationRecord[];
};

export function CalibrationPanel({ records }: CalibrationPanelProps) {
  const summary = summarizeCalibration(records);
  const overconfident = findOverconfidenceTopics(records);

  const readText = summary.meaningful
    ? `Calibration plot with ${summary.total} predictions recorded.`
    : 'Calibration needs more data. Keep playing with confidence check-ins enabled.';

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-headline-md font-bold text-(--text-primary)">
          Self-calibration
        </h2>
        <SpeakButton text={readText} label="Read calibration summary" />
      </div>

      {!summary.meaningful ? (
        <Card>
          <p className="text-body text-(--text-dim)">
            Answer a few more questions with confidence check-ins to see your calibration curve.
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-5 gap-2">
            {summary.bins.map((bin) => (
              <div
                key={bin.predicted}
                className="rounded-(--r-lg) border border-(--border-faint) bg-(--bg-card) p-3 text-center"
              >
                <p className="text-micro text-(--text-dim)">
                  Predicted {Math.round(bin.predicted * 100)}%
                </p>
                <p className="mt-1 text-headline-md font-black text-(--accent-cyan)">
                  {bin.attempts > 0 ? Math.round(bin.accuracy * 100) : '—'}%
                </p>
                <p className="text-micro text-(--text-dim)">actual ({bin.attempts})</p>
              </div>
            ))}
          </div>

          {overconfident.length > 0 ? (
            <Card>
              <p className="text-micro font-bold uppercase tracking-widest text-(--accent-amber)">
                Bug catcher
              </p>
              <ul className="mt-2 space-y-1">
                {overconfident.map((unitId) => {
                  const unit = getUnitById(unitId);
                  return (
                    <li key={unitId} className="text-body text-(--text-secondary)">
                      High confidence but low accuracy on{' '}
                      <span className="font-semibold text-(--text-primary)">
                        {unit?.shortLabel ?? unitId}
                      </span>{' '}
                      — review this topic.
                    </li>
                  );
                })}
              </ul>
            </Card>
          ) : null}
        </>
      )}
    </section>
  );
}
