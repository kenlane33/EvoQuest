/**
 * Persistent Cache API storage for Pocket TTS ONNX bundle assets.
 * Shared between the main thread (prefetch) and inference worker (load).
 */

import { POCKET_TTS_DEFAULT_LANGUAGE } from '@/audio/pocket-tts';
import { ttsMark } from '@/audio/pocket-tts-timeline';

export const POCKET_TTS_BUNDLE_BASE =
  'https://huggingface.co/spaces/KevinAHM/pocket-tts-web/resolve/main/onnx';

/** Matches evo-quest storage namespace; Cache API bucket, not localStorage. */
export const POCKET_TTS_MODEL_CACHE_NAME = 'evo-quest.v1.pocket-tts';

const BUNDLE_MODEL_STEMS = [
  'mimi_encoder_int8.onnx',
  'text_conditioner_int8.onnx',
  'flow_lm_main_int8.onnx',
  'flow_lm_flow_int8.onnx',
  'mimi_decoder_int8.onnx',
] as const;

type BundleMetadata = {
  tokenizer_file?: string;
  bos_before_voice_file?: string | null;
};

export function pocketTtsBundleDir(language = POCKET_TTS_DEFAULT_LANGUAGE): string {
  return `${POCKET_TTS_BUNDLE_BASE}/${language}`;
}

export function pocketTtsBundleAssetUrl(
  language: string,
  filename: string,
): string {
  return `${pocketTtsBundleDir(language)}/${filename}`;
}

/** Asset URLs for a language bundle (after bundle.json is known). */
export function pocketTtsBundleAssetUrls(
  language: string,
  metadata: BundleMetadata,
): string[] {
  const urls = [
    pocketTtsBundleAssetUrl(language, 'bundle.json'),
    pocketTtsBundleAssetUrl(language, 'voices.bin'),
    ...BUNDLE_MODEL_STEMS.map((stem) => pocketTtsBundleAssetUrl(language, stem)),
  ];

  if (metadata.tokenizer_file) {
    urls.push(pocketTtsBundleAssetUrl(language, metadata.tokenizer_file));
  }
  if (metadata.bos_before_voice_file) {
    urls.push(pocketTtsBundleAssetUrl(language, metadata.bos_before_voice_file));
  }

  return urls;
}

async function openModelCache(): Promise<Cache | null> {
  if (typeof caches === 'undefined') return null;
  try {
    return await caches.open(POCKET_TTS_MODEL_CACHE_NAME);
  } catch {
    return null;
  }
}

/** Store one remote asset in the page cache (no-op if already present). */
export async function cachePocketTtsAsset(url: string): Promise<void> {
  const cache = await openModelCache();
  if (!cache) return;

  if (await cache.match(url)) return;

  const response = await fetch(url);
  if (!response.ok) return;

  try {
    await cache.put(url, response);
  } catch {
    /* quota exceeded or private mode */
  }
}

/**
 * Prefetch the English ONNX bundle into the Cache API.
 * Safe to call from the app shell before the inference worker starts.
 */
export async function prefetchPocketTtsBundle(
  language = POCKET_TTS_DEFAULT_LANGUAGE,
): Promise<void> {
  if (typeof window === 'undefined' || !window.crossOriginIsolated) return;

  ttsMark('prefetch-start', { language });
  const metadataUrl = pocketTtsBundleAssetUrl(language, 'bundle.json');
  await cachePocketTtsAsset(metadataUrl);

  const cache = await openModelCache();
  const metadataResponse =
    (await cache?.match(metadataUrl)) ?? (await fetch(metadataUrl));
  if (!metadataResponse?.ok) return;

  const metadata = (await metadataResponse.json()) as BundleMetadata;
  const urls = pocketTtsBundleAssetUrls(language, metadata);

  await Promise.all(urls.map((url) => cachePocketTtsAsset(url)));
  ttsMark('prefetch-done', { language, assets: urls.length });
}
