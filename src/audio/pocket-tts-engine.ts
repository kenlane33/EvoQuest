/**
 * In-browser Pocket TTS via ONNX Runtime Web (WASM).
 * Based on KevinAHM/pocket-tts-web — models load from Hugging Face on first use.
 */

import { POCKET_TTS_DEFAULT_VOICE } from '@/audio/pocket-tts';
import {
  POCKET_TTS_BUNDLE_BASE,
  POCKET_TTS_MODEL_CACHE_NAME,
  prefetchPocketTtsBundle,
} from '@/audio/pocket-tts-model-cache';
import { prepareTextForSpeech } from '@/audio/speech-substitutions';
import {
  ttsLogReadySummary,
  ttsMark,
  ttsMeasure,
  ttsTimelineEnabled,
  ttsWorkerMark,
} from '@/audio/pocket-tts-timeline';
import { PCMPlayerWorklet } from '@/vendor/pocket-tts/PCMPlayerWorklet.js';

const SAMPLE_RATE = 24_000;
const WORKER_URL = '/pocket-tts/inference-worker.js';
const DEFAULT_LANGUAGE = 'english_2026-04';

export type PocketTtsEngineStatus =
  | 'uninitialized'
  | 'loading'
  | 'ready'
  | 'speaking'
  | 'error';

type WorkerMessage = {
  type: string;
  error?: string;
  data?: Float32Array;
  label?: string;
  sinceOrigin?: number;
  sincePrev?: number;
  detail?: Record<string, unknown>;
};

type PendingSpeak = {
  resolve: () => void;
  reject: (err: Error) => void;
};

type PendingCollect = {
  key: string;
  chunks: Float32Array[];
  resolve: () => void;
  reject: (err: Error) => void;
};

type CachedAudio = Float32Array[];

function ttsCacheKey(voice: string, text: string): string {
  return `${voice}\0${text.trim()}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PCMPlayer = any;

function isolationError(): Error {
  return new Error(
    'Read it requires cross-origin isolation (COOP/COEP). Reload over localhost or HTTPS.',
  );
}

/** Detach when speech finishes so a later abort() cannot stop unrelated playback. */
function bindAbortSignal(signal: AbortSignal | undefined, onAbort: () => void): () => void {
  if (!signal) return () => {};
  if (signal.aborted) {
    onAbort();
    return () => {};
  }
  signal.addEventListener('abort', onAbort);
  return () => signal.removeEventListener('abort', onAbort);
}

export class PocketTtsEngine {
  private status: PocketTtsEngineStatus = 'uninitialized';
  private statusError: string | null = null;
  private initPromise: Promise<void> | null = null;
  /** Serializes model load + voice setup so speak cannot race setVoice. */
  private bootstrapPromise: Promise<void> | null = null;
  private bootstrappedVoice: string | null = null;
  private worker: Worker | null = null;
  private player: PCMPlayer | null = null;
  private audioContext: AudioContext | null = null;
  private activeVoice = POCKET_TTS_DEFAULT_VOICE;
  private pendingSpeak: PendingSpeak | null = null;
  private pendingCollect: PendingCollect | null = null;
  private audioCache = new Map<string, CachedAudio>();
  private preloadTasks = new Map<string, Promise<void>>();
  /** Serializes speak calls so chained handoffs wait for playback to finish. */
  private speakChain: Promise<void> = Promise.resolve();
  private markedFirstChunkThisSpeak = false;

  getStatus(): PocketTtsEngineStatus {
    return this.status;
  }

  /** Resolves when all queued speech through the engine has finished. */
  waitUntilIdle(): Promise<void> {
    return this.speakChain;
  }

  isSpeaking(): boolean {
    return this.pendingSpeak !== null || this.status === 'speaking';
  }

  getError(): string | null {
    return this.statusError;
  }

  async ensureReady(voice = POCKET_TTS_DEFAULT_VOICE): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('TTS is only available in the browser');
    }
    if (!window.crossOriginIsolated) {
      throw isolationError();
    }

    if (this.bootstrapPromise && this.bootstrappedVoice === voice) {
      return this.bootstrapPromise;
    }

    if (this.bootstrapPromise && this.bootstrappedVoice !== voice) {
      await this.bootstrapPromise;
      if (this.activeVoice !== voice) {
        await this.setVoice(voice);
        this.bootstrappedVoice = voice;
      }
      return;
    }

    this.bootstrappedVoice = voice;
    this.bootstrapPromise = this.bootstrap(voice);
    try {
      await this.bootstrapPromise;
    } catch (err) {
      this.bootstrapPromise = null;
      this.bootstrappedVoice = null;
      throw err;
    }
  }

  private async bootstrap(voice: string): Promise<void> {
    ttsMark('bootstrap-start', { voice });
    if (!this.initPromise) {
      this.initPromise = this.init();
    }
    await this.initPromise;
    await this.setVoice(voice);
    this.status = 'ready';
    ttsMark('engine-ready', { voice });
    ttsLogReadySummary();
  }

  private async init(): Promise<void> {
    this.status = 'loading';
    this.statusError = null;

    try {
      this.audioContext = new AudioContext({
        sampleRate: SAMPLE_RATE,
        latencyHint: 'interactive',
      });
      ttsMark('audio-context', { state: this.audioContext.state });
      this.player = new PCMPlayerWorklet(this.audioContext);
      this.player.addEventListener('firstPlayback', (event: { detail?: { bufferedSamples?: number } }) => {
        ttsMark('playback-started', {
          audioContextTime: this.audioContext?.currentTime,
          bufferedSamples: event.detail?.bufferedSamples,
        });
        ttsMeasure(
          'speak-request',
          'playback-started',
          'speak latency (request → first sound)',
        );
        ttsMeasure('speak-cached', 'playback-started', 'cached speak latency');
      });
      this.player.addEventListener('audioEnded', () => {
        ttsMark('playback-ended');
      });
      await this.player.initPromise;
      ttsMark('pcm-worklet-ready');

      this.worker = new Worker(WORKER_URL, { type: 'module' });
      ttsMark('worker-spawn');
      this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        this.handleWorkerMessage(event.data);
      };

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timed out loading Pocket TTS models'));
        }, 600_000);

        const onMessage = (event: MessageEvent<WorkerMessage>) => {
          const { type, error } = event.data;
          if (type === 'loaded') {
            clearTimeout(timeout);
            this.worker?.removeEventListener('message', onMessage);
            ttsMark('models-loaded');
            resolve();
          } else if (type === 'error') {
            clearTimeout(timeout);
            this.worker?.removeEventListener('message', onMessage);
            reject(new Error(error ?? 'Failed to load Pocket TTS'));
          }
        };
        this.worker!.addEventListener('message', onMessage);
        this.worker!.postMessage({
          type: 'configure',
          data: {
            bundleBase: POCKET_TTS_BUNDLE_BASE,
            modelCacheName: POCKET_TTS_MODEL_CACHE_NAME,
            timelineEnabled: ttsTimelineEnabled(),
          },
        });
        this.worker!.postMessage({
          type: 'load',
          data: { language: DEFAULT_LANGUAGE },
        });
      });

      // ready is set after setVoice in bootstrap()
    } catch (err) {
      this.status = 'error';
      this.statusError = err instanceof Error ? err.message : 'TTS init failed';
      this.initPromise = null;
      throw err;
    }
  }

  private async setVoice(voiceName: string): Promise<void> {
    if (!this.worker) return;
    await new Promise<void>((resolve, reject) => {
      const onMessage = (event: MessageEvent<WorkerMessage>) => {
        const { type, error } = event.data;
        if (type === 'voice_set') {
          this.worker?.removeEventListener('message', onMessage);
          this.activeVoice = voiceName;
          ttsMark('voice-set', { voice: voiceName });
          resolve();
        } else if (type === 'error') {
          this.worker?.removeEventListener('message', onMessage);
          reject(new Error(error ?? 'Failed to set voice'));
        }
      };
      this.worker!.addEventListener('message', onMessage);
      this.worker!.postMessage({ type: 'set_voice', data: { voiceName } });
    });
  }

  async speak(
    text: string,
    options?: { voice?: string; volume?: number; signal?: AbortSignal },
  ): Promise<void> {
    const waitFor = this.speakChain;
    let advance!: () => void;
    this.speakChain = new Promise<void>((resolve) => {
      advance = resolve;
    });

    await waitFor;

    try {
      if (options?.signal?.aborted) return;
      await this.speakInternal(text, options);
    } finally {
      advance();
    }
  }

  private async speakInternal(
    text: string,
    options?: { voice?: string; volume?: number; signal?: AbortSignal },
  ): Promise<void> {
    const trimmed = prepareTextForSpeech(text);
    if (!trimmed) return;

    const voice = options?.voice ?? this.activeVoice;
    await this.ensureReady(voice);

    if (this.pendingCollect) {
      this.finishPendingCollect();
    }
    if (options?.signal?.aborted) return;

    const key = ttsCacheKey(voice, trimmed);
    const cached = this.audioCache.get(key);
    if (cached) {
      ttsMark('speak-cached', { chars: trimmed.length, voice });
      this.markedFirstChunkThisSpeak = false;
      await this.playCached(cached, options);
      return;
    }

    ttsMark('speak-request', { chars: trimmed.length, voice });
    this.markedFirstChunkThisSpeak = false;

    this.status = 'speaking';
    this.player?.reset();
    if (this.player && options?.volume != null) {
      this.player.volume = Math.min(1, Math.max(0, options.volume));
    }
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    let unbindAbort = () => {};
    try {
      await new Promise<void>((resolve, reject) => {
        this.pendingSpeak = { resolve, reject };

        const onAbort = () => {
          this.worker?.postMessage({ type: 'stop' });
          this.player?.reset();
          this.rejectPending();
        };
        unbindAbort = bindAbortSignal(options?.signal, onAbort);

        this.worker!.postMessage({
          type: 'generate',
          data: { text: trimmed, voice },
        });
      });
    } finally {
      unbindAbort();
    }
  }

  /** Synthesize audio in the background when idle; skipped if already cached. */
  async preload(text: string, options?: { voice?: string }): Promise<void> {
    const trimmed = prepareTextForSpeech(text);
    if (!trimmed || typeof window === 'undefined' || !window.crossOriginIsolated) {
      return;
    }

    const voice = options?.voice ?? this.activeVoice;
    const key = ttsCacheKey(voice, trimmed);
    if (this.audioCache.has(key)) return;

    const existing = this.preloadTasks.get(key);
    if (existing) return existing;

    const task = this.runPreload(trimmed, voice, key);
    this.preloadTasks.set(key, task);
    try {
      await task;
    } finally {
      this.preloadTasks.delete(key);
    }
  }

  private async runPreload(text: string, voice: string, key: string): Promise<void> {
    await this.ensureReady(voice);
    if (this.pendingSpeak || this.pendingCollect || this.status === 'speaking') {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      this.pendingCollect = { key, chunks: [], resolve, reject };
      this.worker!.postMessage({
        type: 'generate',
        data: { text, voice },
      });
    });
  }

  private async playCached(
    chunks: CachedAudio,
    options?: { volume?: number; signal?: AbortSignal },
  ): Promise<void> {
    if (options?.signal?.aborted) return;

    this.status = 'speaking';
    this.player?.reset();
    if (this.player && options?.volume != null) {
      this.player.volume = Math.min(1, Math.max(0, options.volume));
    }
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    for (const chunk of chunks) {
      if (options?.signal?.aborted) {
        this.player?.reset();
        this.status = 'ready';
        return;
      }
      this.player?.playAudio(new Float32Array(chunk));
    }

    if (this.player?.notifyStreamEnded) {
      this.player.notifyStreamEnded();
    }

    let unbindAbort = () => {};
    try {
      await new Promise<void>((resolve, reject) => {
        this.pendingSpeak = { resolve, reject };
        const onAbort = () => {
          this.player?.reset();
          this.rejectPending();
        };
        unbindAbort = bindAbortSignal(options?.signal, onAbort);
        this.player?.addEventListener('audioEnded', () => this.resolvePending(), {
          once: true,
        });
      });
    } finally {
      unbindAbort();
    }
  }

  stop(): void {
    this.worker?.postMessage({ type: 'stop' });
    this.player?.reset();
    this.rejectPending();
    this.rejectCollect();
    if (this.status === 'speaking') {
      this.status = 'ready';
    }
  }

  private rejectPending(err?: Error): void {
    const pending = this.pendingSpeak;
    if (!pending) return;
    this.pendingSpeak = null;
    if (this.status === 'speaking') {
      this.status = 'ready';
    }
    if (err) {
      pending.reject(err);
    } else {
      pending.resolve();
    }
  }

  private resolvePending(): void {
    const pending = this.pendingSpeak;
    if (!pending) return;
    this.pendingSpeak = null;
    this.status = 'ready';
    pending.resolve();
  }

  private finishPendingCollect(): void {
    const pending = this.pendingCollect;
    if (!pending) return;
    this.pendingCollect = null;
    pending.resolve();
  }

  private rejectCollect(err?: Error): void {
    const pending = this.pendingCollect;
    if (!pending) return;
    this.pendingCollect = null;
    if (err) {
      pending.reject(err);
    } else {
      pending.resolve();
    }
  }

  private resolveCollect(): void {
    const pending = this.pendingCollect;
    if (!pending) return;
    this.pendingCollect = null;
    if (pending.chunks.length > 0) {
      this.audioCache.set(pending.key, pending.chunks);
    }
    pending.resolve();
  }

  private handleWorkerMessage(msg: WorkerMessage): void {
    const { type, error, data } = msg;

    switch (type) {
      case 'timeline':
        if (msg.label != null && msg.sinceOrigin != null && msg.sincePrev != null) {
          ttsWorkerMark(msg.label, msg.sinceOrigin, msg.sincePrev, msg.detail);
        }
        break;
      case 'audio_chunk':
        if (!data) break;
        if (!this.markedFirstChunkThisSpeak && this.pendingSpeak && !this.pendingCollect) {
          ttsMark('first-audio-chunk');
          this.markedFirstChunkThisSpeak = true;
        }
        if (this.pendingCollect) {
          this.pendingCollect.chunks.push(new Float32Array(data));
        } else if (this.player && this.pendingSpeak) {
          this.player.playAudio(data);
        }
        break;
      case 'stream_ended':
        if (this.pendingCollect) {
          this.resolveCollect();
          break;
        }
        ttsMark('stream-ended');
        if (this.pendingSpeak && this.player) {
          if (this.player.notifyStreamEnded) {
            this.player.notifyStreamEnded();
          }
          this.player.addEventListener(
            'audioEnded',
            () => this.resolvePending(),
            { once: true },
          );
        }
        break;
      case 'error': {
        const message = error ?? 'TTS error';
        if (this.pendingCollect) {
          this.rejectCollect(new Error(message));
        } else if (this.pendingSpeak) {
          this.rejectPending(new Error(message));
        }
        break;
      }
      default:
        break;
    }
  }
}

let sharedEngine: PocketTtsEngine | null = null;

export function getPocketTtsEngine(): PocketTtsEngine {
  if (!sharedEngine) {
    sharedEngine = new PocketTtsEngine();
  }
  return sharedEngine;
}

export function stopPocketTtsEngine(): void {
  sharedEngine?.stop();
}

/** Wait until queued speech finishes (for play → feedback handoffs). */
export async function waitForPocketTtsIdle(maxMs = 15000): Promise<void> {
  if (typeof window === 'undefined') return;

  const engine = getPocketTtsEngine();
  await Promise.race([
    engine.waitUntilIdle(),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, maxMs);
    }),
  ]);
}

export function preloadPocketTts(voice = POCKET_TTS_DEFAULT_VOICE): void {
  if (typeof window === 'undefined' || !window.crossOriginIsolated) return;
  void prefetchPocketTtsBundle().catch(() => {
    /* optional optimization */
  });
  void getPocketTtsEngine()
    .ensureReady(voice)
    .catch(() => {
      /* surfaced when user taps Read it */
    });
}

/** Preload spoken text when the engine is idle (e.g. next question). */
export function preloadPocketTtsText(
  text: string,
  voice = POCKET_TTS_DEFAULT_VOICE,
): void {
  if (!text.trim()) return;
  void getPocketTtsEngine()
    .preload(text, { voice })
    .catch(() => {
      /* optional optimization */
    });
}
