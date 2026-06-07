import { beforeEach, describe, expect, it, vi } from 'vitest';

const speakPocket = vi.fn(async () => {});
const stopPocket = vi.fn();
const stopWeb = vi.fn();

function mockSpeakWeb(
  _text: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (options?.signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    options?.signal?.addEventListener(
      'abort',
      () => reject(new DOMException('Aborted', 'AbortError')),
      { once: true },
    );
    // Never resolves unless aborted — simulates long playback.
  });
}

const speakWeb = vi.fn(mockSpeakWeb);

vi.mock('@/audio/pocket-tts-engine', () => ({
  getPocketTtsEngine: () => ({ speak: speakPocket }),
  preloadPocketTtsText: vi.fn(),
  stopPocketTtsEngine: stopPocket,
  waitForPocketTtsIdle: vi.fn(async () => {}),
}));

vi.mock('@/audio/read-aloud', () => ({
  isPocketTtsAvailable: () => false,
}));

vi.mock('@/audio/read-aloud-bootstrap', () => ({
  resetReadAloudBootstrap: vi.fn(),
  shouldUsePocketTts: () => false,
  startReadAloudBootstrap: vi.fn(async () => {}),
  subscribePocketBackendReady: vi.fn(() => () => {}),
}));

vi.mock('@/audio/web-speech-engine', () => ({
  isWebSpeechAvailable: () => true,
  primeWebSpeechVoices: vi.fn(),
  speakWebSpeech: speakWeb,
  stopWebSpeech: stopWeb,
  waitForWebSpeechIdle: vi.fn(async () => {}),
}));

import { speakReadAloud, stopReadAloud } from '@/audio/read-aloud-engine';

describe('speakReadAloud preemption', () => {
  beforeEach(() => {
    speakPocket.mockReset().mockResolvedValue(undefined);
    stopPocket.mockReset();
    stopWeb.mockReset();
    speakWeb.mockReset().mockImplementation(mockSpeakWeb);
  });

  it('halts prior speech when a new utterance starts', async () => {
    speakWeb
      .mockImplementationOnce(mockSpeakWeb)
      .mockResolvedValueOnce(undefined);

    const first = speakReadAloud('first line');
    await Promise.resolve();
    expect(speakWeb).toHaveBeenCalledTimes(1);

    await speakReadAloud('second line');

    expect(stopPocket).toHaveBeenCalled();
    expect(stopWeb).toHaveBeenCalled();
    expect(speakWeb).toHaveBeenCalledTimes(2);

    await expect(first).resolves.toBeUndefined();
  });

  it('stopReadAloud aborts the active session', async () => {
    const pending = speakReadAloud('hello');
    await Promise.resolve();
    stopReadAloud();

    await expect(pending).resolves.toBeUndefined();
    expect(stopPocket).toHaveBeenCalled();
    expect(stopWeb).toHaveBeenCalled();
  });
});
