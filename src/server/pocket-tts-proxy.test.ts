import { describe, expect, it } from 'vitest';
import {
  POCKET_TTS_HF_BUNDLE_BASE,
  POCKET_TTS_PROXY_PREFIX,
  isPocketTtsProxyPath,
  pocketTtsProxyUpstreamUrl,
} from '@/server/pocket-tts-proxy';

describe('pocket-tts-proxy', () => {
  it('recognizes proxy paths', () => {
    expect(isPocketTtsProxyPath('/api/pocket-tts/onnx')).toBe(true);
    expect(isPocketTtsProxyPath('/api/pocket-tts/onnx/english_2026-04/bundle.json')).toBe(true);
    expect(isPocketTtsProxyPath('/api/pocket-tts/onnx-evil/bundle.json')).toBe(false);
    expect(isPocketTtsProxyPath('/pocket-tts/inference-worker.js')).toBe(false);
  });

  it('maps valid bundle assets to Hugging Face URLs', () => {
    expect(
      pocketTtsProxyUpstreamUrl(`${POCKET_TTS_PROXY_PREFIX}/english_2026-04/bundle.json`),
    ).toBe(`${POCKET_TTS_HF_BUNDLE_BASE}/english_2026-04/bundle.json`);

    expect(
      pocketTtsProxyUpstreamUrl(`${POCKET_TTS_PROXY_PREFIX}/english_2026-04/mimi_encoder_int8.onnx`),
    ).toBe(`${POCKET_TTS_HF_BUNDLE_BASE}/english_2026-04/mimi_encoder_int8.onnx`);
  });

  it('rejects path traversal and unknown languages', () => {
    expect(
      pocketTtsProxyUpstreamUrl(`${POCKET_TTS_PROXY_PREFIX}/english_2026-04/../bundle.json`),
    ).toBeNull();
    expect(
      pocketTtsProxyUpstreamUrl(`${POCKET_TTS_PROXY_PREFIX}/klingon/bundle.json`),
    ).toBeNull();
    expect(
      pocketTtsProxyUpstreamUrl(`${POCKET_TTS_PROXY_PREFIX}/english_2026-04/evil.exe`),
    ).toBeNull();
  });
});
