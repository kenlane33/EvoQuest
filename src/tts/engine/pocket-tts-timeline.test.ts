import { afterEach, describe, expect, it, vi } from 'vitest';
import { ttsMark, ttsTimelineEnabled } from '@/tts/engine/pocket-tts-timeline';

describe('pocket-tts-timeline', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is enabled in test/dev builds', () => {
    expect(ttsTimelineEnabled()).toBe(true);
  });

  it('logs session-start then labeled marks', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    let now = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => {
      now += 500;
      return now;
    });

    ttsMark('bootstrap-start');
    ttsMark('engine-ready');

    expect(info.mock.calls[0]?.[0]).toBe('[TTS +0ms] session-start');
    expect(info.mock.calls[1]?.[0]).toContain('bootstrap-start');
    expect(info.mock.calls[2]?.[0]).toContain('engine-ready');
    expect(info.mock.calls[2]?.[0]).toContain('Δ+500ms');
    expect(info.mock.calls[2]?.[0]).toContain('[TTS +500ms]');
  });
});
