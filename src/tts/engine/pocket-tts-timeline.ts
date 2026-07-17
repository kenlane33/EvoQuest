/**
 * Dev-only TTS timeline — logs performance.now() marks with deltas for DX profiling.
 * Format: [TTS +2424ms] playback-started Δ+120ms from first-audio-chunk
 */

import { getReadAloudConfig } from '../config';

const ORIGIN = 'session-start';
const marks = new Map<string, number>();
let lastMarkMs: number | null = null;

export function ttsTimelineEnabled(): boolean {
  return getReadAloudConfig().timelineEnabled;
}

function formatDetail(detail?: Record<string, unknown>): string {
  if (!detail || Object.keys(detail).length === 0) return '';
  return ` ${JSON.stringify(detail)}`;
}

/** Mark a milestone on the main thread (page origin). */
export function ttsMark(label: string, detail?: Record<string, unknown>): number {
  if (!ttsTimelineEnabled() || typeof performance === 'undefined') {
    return performance?.now?.() ?? 0;
  }

  const now = performance.now();
  if (!marks.has(ORIGIN)) {
    marks.set(ORIGIN, now);
    lastMarkMs = now;
    console.info('[TTS +0ms] session-start');
    try {
      performance.mark('tts:session-start');
    } catch {
      /* ignore */
    }
  }

  const origin = marks.get(ORIGIN)!;
  const sinceOrigin = now - origin;
  const delta =
    lastMarkMs != null ? ` Δ+${(now - lastMarkMs).toFixed(0)}ms` : '';
  marks.set(label, now);
  lastMarkMs = now;

  console.info(
    `[TTS +${sinceOrigin.toFixed(0)}ms] ${label}${delta}${formatDetail(detail)}`,
  );
  try {
    performance.mark(`tts:${label}`);
  } catch {
    /* ignore */
  }
  return now;
}

/** Log a worker-thread milestone correlated to the page session. */
export function ttsWorkerMark(
  label: string,
  workerSinceOrigin: number,
  workerSincePrev: number,
  detail?: Record<string, unknown>,
): void {
  if (!ttsTimelineEnabled() || typeof performance === 'undefined') return;

  const origin = marks.get(ORIGIN);
  const pageMs = origin != null ? performance.now() - origin : null;
  const pagePrefix = pageMs != null ? `+${pageMs.toFixed(0)}ms` : '?';
  console.info(
    `[TTS ${pagePrefix}] worker:${label} (worker +${workerSinceOrigin.toFixed(0)}ms Δ+${workerSincePrev.toFixed(0)}ms)${formatDetail(detail)}`,
  );
}

/** Log elapsed time between two prior main-thread marks. */
export function ttsMeasure(from: string, to: string, label?: string): void {
  if (!ttsTimelineEnabled()) return;
  const start = marks.get(from);
  const end = marks.get(to);
  if (start == null || end == null) return;
  console.info(`[TTS measure] ${label ?? `${from} → ${to}`}: ${(end - start).toFixed(0)}ms`);
}

/** Summarize cold-start cadence once the engine is ready to speak. */
export function ttsLogReadySummary(): void {
  if (!ttsTimelineEnabled()) return;
  ttsMeasure('session-start', 'engine-ready', 'cold-start (session → engine-ready)');
}
