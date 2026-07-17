/**
 * Runtime configuration for the read-aloud library.
 * Call configureReadAloud() before first use when copying into another project.
 */

export type ReadAloudConfig = {
  /** Path to the Pocket TTS inference worker (served from public/). */
  workerUrl: string;
  /** Same-origin proxy prefix for ONNX bundle assets. */
  bundleProxyPrefix: string;
  /** Upstream Hugging Face bundle base (used by the server proxy). */
  hfBundleBase: string;
  /** Cache API bucket name for ONNX bundle assets. */
  modelCacheName: string;
  /** Default ONNX language bundle id. */
  defaultLanguage: string;
  /** Default built-in voice id. */
  defaultVoice: string;
  /** Extra voices cloned from reference audio (voice id → prompt path). */
  extraVoices: Readonly<Record<string, string>>;
  /** Enable dev-only TTS timeline logging. */
  timelineEnabled: boolean;
};

const DEFAULT_CONFIG: ReadAloudConfig = {
  workerUrl: '/pocket-tts/inference-worker.js',
  bundleProxyPrefix: '/api/pocket-tts/onnx',
  hfBundleBase:
    'https://huggingface.co/spaces/KevinAHM/pocket-tts-web/resolve/main/onnx',
  modelCacheName: 'evo-quest.v1.pocket-tts',
  defaultLanguage: 'english_2026-04',
  defaultVoice: 'azelma',
  extraVoices: {
    a_janelle_risa: '/pocket-tts/voices/a_janelle_risa.f32',
    alan_davis_drake: '/pocket-tts/voices/alan_davis_drake.f32',
    amy_koenig: '/pocket-tts/voices/amy_koenig.f32',
  },
  timelineEnabled: import.meta.env.PROD !== true,
};

let config: ReadAloudConfig = { ...DEFAULT_CONFIG };

export function getReadAloudConfig(): ReadAloudConfig {
  return config;
}

/** Override defaults — call once at app startup before TTS is used. */
export function configureReadAloud(partial: Partial<ReadAloudConfig>): void {
  config = { ...config, ...partial };
}
