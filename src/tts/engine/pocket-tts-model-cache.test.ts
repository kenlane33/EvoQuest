import { describe, expect, it } from 'vitest';
import {
  POCKET_TTS_BUNDLE_BASE,
  POCKET_TTS_MODEL_CACHE_NAME,
  pocketTtsBundleAssetUrl,
  pocketTtsBundleAssetUrls,
} from '@/tts/engine/pocket-tts-model-cache';

describe('pocket-tts-model-cache', () => {
  it('uses the evo-quest cache bucket name', () => {
    expect(POCKET_TTS_MODEL_CACHE_NAME).toBe('evo-quest.v1.pocket-tts');
  });

  it('lists all bundle assets for english', () => {
    const urls = pocketTtsBundleAssetUrls('english_2026-04', {
      tokenizer_file: 'tokenizer.model',
      bos_before_voice_file: 'bos_before_voice.npy',
    });

    expect(urls).toContain(
      `${POCKET_TTS_BUNDLE_BASE}/english_2026-04/bundle.json`,
    );
    expect(urls).toContain(
      pocketTtsBundleAssetUrl('english_2026-04', 'mimi_encoder_int8.onnx'),
    );
    expect(urls).toContain(
      pocketTtsBundleAssetUrl('english_2026-04', 'tokenizer.model'),
    );
    expect(urls).toContain(
      pocketTtsBundleAssetUrl('english_2026-04', 'voices.bin'),
    );
  });
});
