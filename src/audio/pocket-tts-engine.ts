/**
 * In-browser Pocket TTS via ONNX Runtime Web (WASM).
 * Based on KevinAHM/pocket-tts-web — models load from Hugging Face on first use.
 */

import { POCKET_TTS_DEFAULT_VOICE, POCKET_TTS_EXTRA_VOICES } from '@/audio/pocket-tts';
import { isPocketTtsAvailable } from '@/audio/read-aloud';
import {
  POCKET_TTS_BUNDLE_BASE,
  POCKET_TTS_MODEL_CACHE_NAME,
} from '@/audio/pocket-tts-model-cache';
import {
  progressForWorkerStatus,
  setReadAloudBootstrapProgress,
  startReadAloudBootstrap,
} from '@/audio/read-aloud-bootstrap';
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
const SPEECH_ONSET_THRESHOLD = 0.02;
const WORKER_URL = '/pocket-tts/inference-worker.js';
const DEFAULT_LANGUAGE = 'english_2026-04';

export type PocketTtsEngineStatus =
  | 'uninitialized'
  | 'loading'
  | 'ready'
  | 'speaking'
  | 'error';

type WorkerChunkMetrics = {
  chunkStart?: boolean;
  wordOffset?: number;
  charOffset?: number;
  isSilence?: boolean;
};

type WorkerMessage = {
  type: string;
  error?: string;
  status?: string;
  data?: Float32Array;
  metrics?: WorkerChunkMetrics;
  voices?: string[];
  defaultVoice?: string | null;
  label?: string;
  sinceOrigin?: number;
  sincePrev?: number;
  detail?: Record<string, unknown>;
};

type PendingSpeak = {
  resolve: () => void;
  reject: (err: Error) => void;
};

type SpeakWordAnchor = {
  sampleOffset: number;
  charOffset: number;
  wordOffset: number;
};

type PendingCollect = {
  key: string;
  chunks: Float32Array[];
  anchors: SpeakWordAnchor[];
  sampleOffset: number;
  resolve: () => void;
  reject: (err: Error) => void;
};

type CachedAudio = {
  chunks: Float32Array[];
  anchors: SpeakWordAnchor[];
};

function detectSpeechOnsetSamples(pcm: Float32Array): number {
  for (let i = 0; i < pcm.length; i++) {
    if (Math.abs(pcm[i]!) >= SPEECH_ONSET_THRESHOLD) return i;
  }
  return 0;
}

function recordAnchorFromChunk(
  anchors: SpeakWordAnchor[],
  sampleOffset: number,
  metrics: WorkerChunkMetrics | undefined,
  chunk: Float32Array,
): void {
  if (!metrics?.chunkStart) return;
  if (metrics.wordOffset == null && metrics.charOffset == null) return;
  const onset = detectSpeechOnsetSamples(chunk);
  anchors.push({
    sampleOffset: sampleOffset + onset,
    charOffset: metrics.charOffset ?? 0,
    wordOffset: metrics.wordOffset ?? 0,
  });
}

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

export type PocketTtsSpeakOptions = {
  voice?: string;
  volume?: number;
  signal?: AbortSignal;
};

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
  /** Deferred until first playback — avoids iOS AudioWorklet failures during background bootstrap. */
  private audioInitPromise: Promise<void> | null = null;
  /** Resume kicked off during the last user gesture; awaited before playback. */
  private gestureResumePromise: Promise<void> | null = null;
  private activeVoice = POCKET_TTS_DEFAULT_VOICE;
  private pendingSpeak: PendingSpeak | null = null;
  private pendingCollect: PendingCollect | null = null;
  private audioCache = new Map<string, CachedAudio>();
  private preloadTasks = new Map<string, Promise<void>>();
  /** Serializes speak calls so chained handoffs wait for playback to finish. */
  private speakChain: Promise<void> = Promise.resolve();
  private markedFirstChunkThisSpeak = false;
  private utteranceSubmittedSamples = 0;
  private utteranceTotalSamples = 0;
  private utteranceFinalized = false;
  private lastUtteranceProgress = 0;
  private utteranceAnchors: SpeakWordAnchor[] = [];
  private utteranceAudioStartTime: number | null = null;
  private availableVoices: string[] = [];
  private bundleDefaultVoice: string | null = null;
  private voiceListeners = new Set<() => void>();

  getAvailableVoices(): readonly string[] {
    return this.availableVoices;
  }

  getBundleDefaultVoice(): string | null {
    return this.bundleDefaultVoice;
  }

  /** Notified when the worker reports built-in voices after bundle load. */
  subscribeVoices(listener: () => void): () => void {
    this.voiceListeners.add(listener);
    return () => {
      this.voiceListeners.delete(listener);
    };
  }

  private notifyVoicesChanged(): void {
    for (const listener of this.voiceListeners) {
      listener();
    }
  }

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

  /** Samples heard so far for the active utterance; null when nothing is playing. */
  getUtterancePlayedSamples(): number | null {
    if (!this.pendingSpeak && this.status !== 'speaking') return null;
    if (this.utteranceSubmittedSamples <= 0) return 0;

    // Nothing heard until the worklet actually starts output (firstPlayback).
    if (this.utteranceAudioStartTime == null || !this.audioContext) {
      return 0;
    }

    const clockPlayed = Math.max(
      0,
      (this.audioContext.currentTime - this.utteranceAudioStartTime) * SAMPLE_RATE,
    );

    // While streaming, submitted − buffered counts queued audio as "heard" and races
    // the highlight ahead by seconds. Use the AudioContext clock until finalized.
    if (!this.utteranceFinalized) {
      return Math.min(this.utteranceSubmittedSamples, clockPlayed);
    }

    const bufferedContext = this.player?.getPlaybackStatus().worklet.bufferLevelSamples ?? 0;
    const contextRate = this.audioContext.sampleRate;
    const bufferedSource = Math.round((bufferedContext * SAMPLE_RATE) / contextRate);
    const bufferPlayed = Math.max(0, this.utteranceSubmittedSamples - bufferedSource);
    return Math.min(this.utteranceSubmittedSamples, Math.min(clockPlayed, bufferPlayed));
  }

  /** Ms of audio heard so far; null when nothing is playing. */
  getUtterancePlayedMs(): number | null {
    const played = this.getUtterancePlayedSamples();
    if (played == null) return null;
    return (played / SAMPLE_RATE) * 1000;
  }

  /** 0–1 through the active utterance; null when nothing is playing. */
  getUtteranceAudioProgress(): number | null {
    if (!this.pendingSpeak && this.status !== 'speaking') return null;
    if (this.utteranceSubmittedSamples <= 0) return 0;

    const played = this.getUtterancePlayedSamples() ?? 0;
    const total = this.utteranceFinalized
      ? Math.max(this.utteranceTotalSamples, this.utteranceSubmittedSamples)
      : Math.max(this.utteranceSubmittedSamples, played + (this.player?.getPlaybackStatus().worklet.bufferLevelSamples ?? 0));
    if (total <= 0) return 0;
    const raw = Math.min(1, played / total);
    this.lastUtteranceProgress = Math.max(this.lastUtteranceProgress, raw);
    return this.lastUtteranceProgress;
  }

  isUtteranceFinalized(): boolean {
    return this.utteranceFinalized;
  }

  /** Real audio→text anchors for the active utterance; null when idle or unavailable. */
  getUtteranceWordAnchors(): Array<{ ms: number; charOffset: number; wordOffset: number }> | null {
    if (!this.pendingSpeak && this.status !== 'speaking') return null;
    if (this.utteranceAnchors.length === 0) return null;
    return this.utteranceAnchors.map(({ sampleOffset, charOffset, wordOffset }) => ({
      ms: (sampleOffset / SAMPLE_RATE) * 1000,
      charOffset,
      wordOffset,
    }));
  }

  /** Total ms of the active utterance once all audio is known; null while streaming. */
  getUtteranceTotalMs(): number | null {
    if (!this.pendingSpeak && this.status !== 'speaking') return null;
    if (!this.utteranceFinalized) return null;
    return (this.utteranceTotalSamples / SAMPLE_RATE) * 1000;
  }

  private resetUtteranceProgress(): void {
    this.utteranceSubmittedSamples = 0;
    this.utteranceTotalSamples = 0;
    this.utteranceFinalized = false;
    this.lastUtteranceProgress = 0;
    this.utteranceAnchors = [];
    this.utteranceAudioStartTime = null;
  }

  private recordWordAnchor(metrics: WorkerChunkMetrics | undefined, chunk: Float32Array): void {
    recordAnchorFromChunk(
      this.utteranceAnchors,
      this.utteranceSubmittedSamples,
      metrics,
      chunk,
    );
  }

  private addUtteranceSamples(count: number): void {
    if (count <= 0) return;
    this.utteranceSubmittedSamples += count;
    if (this.utteranceFinalized) {
      this.utteranceTotalSamples = this.utteranceSubmittedSamples;
    } else {
      this.utteranceTotalSamples = Math.max(this.utteranceTotalSamples, this.utteranceSubmittedSamples);
    }
  }

  private finalizeUtteranceSamples(): void {
    this.utteranceTotalSamples = Math.max(this.utteranceTotalSamples, this.utteranceSubmittedSamples);
    this.utteranceFinalized = true;
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

  /**
   * Create/resume the AudioContext synchronously during a user gesture.
   * Worklet setup still completes async; call this before the first await in speak().
   */
  beginAudioFromUserGesture(): void {
    if (typeof window === 'undefined') return;
    if (!this.audioContext) {
      this.audioContext = new AudioContext({
        sampleRate: SAMPLE_RATE,
        latencyHint: 'interactive',
      });
      ttsMark('audio-context', { state: this.audioContext.state });
    }
    if (this.audioContext.state === 'suspended') {
      this.gestureResumePromise = this.audioContext.resume().then(() => undefined);
    } else {
      this.gestureResumePromise = Promise.resolve();
    }
    if (!this.player && !this.audioInitPromise) {
      this.audioInitPromise = this.initAudio();
    }
  }

  /**
   * Ensure audio output is running before submitting PCM — may wait for a tap
   * when model load outlasts the original click (uncached cold start).
   */
  async ensureAudioOutputReady(signal?: AbortSignal): Promise<void> {
    await this.ensureAudioPlayer();
    if (this.gestureResumePromise) {
      try {
        await this.gestureResumePromise;
      } catch {
        /* resume rejected — fall through to retry / gesture wait */
      }
    }
    await this.resumeAudioOutput();
    if (this.isAudioOutputRunning()) return;
    await this.waitForUserGestureToResumeAudio(signal);
    if (!this.isAudioOutputRunning()) {
      throw new Error('Audio output blocked — tap Play again to hear speech.');
    }
  }

  private isAudioOutputRunning(): boolean {
    return this.audioContext?.state === 'running';
  }

  private waitForUserGestureToResumeAudio(signal?: AbortSignal): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }
    if (signal?.aborted) {
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    }

    return new Promise<void>((resolve, reject) => {
      const onGesture = () => {
        cleanup();
        this.beginAudioFromUserGesture();
        void this.resumeAudioOutput().then(resolve, reject);
      };

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        onGesture();
      };

      const onAbort = () => {
        cleanup();
        reject(new DOMException('Aborted', 'AbortError'));
      };

      const cleanup = () => {
        window.removeEventListener('pointerdown', onGesture, true);
        window.removeEventListener('keydown', onKeyDown, true);
        signal?.removeEventListener('abort', onAbort);
      };

      window.addEventListener('pointerdown', onGesture, true);
      window.addEventListener('keydown', onKeyDown, true);
      signal?.addEventListener('abort', onAbort, { once: true });
    });
  }

  private async ensureAudioPlayer(): Promise<void> {
    if (this.player) return;
    if (this.audioInitPromise) {
      await this.audioInitPromise;
      return;
    }
    this.audioInitPromise = this.initAudio();
    try {
      await this.audioInitPromise;
    } catch (err) {
      this.audioInitPromise = null;
      throw err;
    }
  }

  private async initAudio(): Promise<void> {
    if (this.player) return;
    if (!this.audioContext) {
      this.audioContext = new AudioContext({
        sampleRate: SAMPLE_RATE,
        latencyHint: 'interactive',
      });
      ttsMark('audio-context', { state: this.audioContext.state });
    }
    this.player = new PCMPlayerWorklet(this.audioContext, {
      sourceSampleRate: SAMPLE_RATE,
    });
    this.player.addEventListener('firstPlayback', (event: { detail?: { bufferedSamples?: number } }) => {
      ttsMark('playback-started', {
        audioContextTime: this.audioContext?.currentTime,
        bufferedSamples: event.detail?.bufferedSamples,
      });
      if (this.pendingSpeak || this.status === 'speaking') {
        this.utteranceAudioStartTime = this.audioContext?.currentTime ?? null;
      }
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
  }

  private async init(): Promise<void> {
    this.status = 'loading';
    this.statusError = null;

    try {
      setReadAloudBootstrapProgress(0.38);
      this.worker = new Worker(WORKER_URL, { type: 'module' });
      ttsMark('worker-spawn');
      setReadAloudBootstrapProgress(0.42);
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
            extraVoices: POCKET_TTS_EXTRA_VOICES,
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
    options?: PocketTtsSpeakOptions,
  ): Promise<void> {
    if (this.pendingSpeak || this.status === 'speaking') {
      this.stop();
    }

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

  /** Stop an in-flight preload so speak can own the worker (preload is best-effort). */
  private cancelPendingCollect(): void {
    const pending = this.pendingCollect;
    if (!pending) return;
    this.pendingCollect = null;
    this.worker?.postMessage({ type: 'stop' });
    pending.resolve();
  }

  /**
   * Avoid racing preload synthesis: wait for a matching preload, or cancel
   * any other in-flight collect before starting playback.
   */
  private async prepareForSpeak(voice: string, trimmed: string): Promise<void> {
    const key = ttsCacheKey(voice, trimmed);
    const inFlightPreload = this.preloadTasks.get(key);
    if (inFlightPreload) {
      await inFlightPreload.catch(() => {
        /* preload is optional */
      });
      return;
    }
    if (this.pendingCollect) {
      this.cancelPendingCollect();
    }
  }

  private async speakInternal(
    text: string,
    options?: PocketTtsSpeakOptions,
  ): Promise<void> {
    const trimmed = prepareTextForSpeech(text);
    if (!trimmed) return;

    const voice = options?.voice ?? this.activeVoice;
    await this.ensureReady(voice);
    await this.prepareForSpeak(voice, trimmed);
    if (options?.signal?.aborted) return;

    await this.ensureAudioOutputReady(options?.signal);

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
    this.resetUtteranceProgress();
    this.player?.reset();
    if (this.player && options?.volume != null) {
      this.player.volume = Math.min(1, Math.max(0, options.volume));
    }

    let unbindAbort = () => {};
    try {
      await new Promise<void>((resolve, reject) => {
        this.pendingSpeak = { resolve, reject };

        const onAbort = () => {
          this.worker?.postMessage({ type: 'stop' });
          this.player?.reset();
          this.resetUtteranceProgress();
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
      this.pendingCollect = { key, chunks: [], anchors: [], sampleOffset: 0, resolve, reject };
      this.worker!.postMessage({
        type: 'generate',
        data: { text, voice },
      });
    });
  }

  private async playCached(
    cached: CachedAudio,
    options?: PocketTtsSpeakOptions,
  ): Promise<void> {
    if (options?.signal?.aborted) return;

    this.status = 'speaking';
    this.resetUtteranceProgress();
    this.utteranceAnchors = cached.anchors.map((anchor) => ({ ...anchor }));
    this.player?.reset();
    if (this.player && options?.volume != null) {
      this.player.volume = Math.min(1, Math.max(0, options.volume));
    }

    for (const chunk of cached.chunks) {
      if (options?.signal?.aborted) {
        this.player?.reset();
        this.resetUtteranceProgress();
        this.status = 'ready';
        return;
      }
      this.addUtteranceSamples(chunk.length);
      this.player?.playAudio(new Float32Array(chunk));
    }
    this.finalizeUtteranceSamples();

    if (this.player?.notifyStreamEnded) {
      this.player.notifyStreamEnded();
    }

    let unbindAbort = () => {};
    try {
      await new Promise<void>((resolve, reject) => {
        this.pendingSpeak = { resolve, reject };
        const onAbort = () => {
          this.player?.reset();
          this.resetUtteranceProgress();
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

  private async resumeAudioOutput(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
    await this.player?.resume();
  }

  stop(): void {
    this.worker?.postMessage({ type: 'stop' });
    this.player?.reset();
    this.resetUtteranceProgress();
    this.rejectPending();
    this.rejectCollect();
    if (this.status === 'speaking') {
      this.status = 'ready';
    }
  }

  /** Drop synthesized utterance buffers (model bundle cache is separate). */
  clearSpeechCache(): void {
    this.audioCache.clear();
    this.preloadTasks.clear();
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
      this.audioCache.set(pending.key, {
        chunks: pending.chunks,
        anchors: pending.anchors,
      });
    }
    pending.resolve();
  }

  private handleWorkerMessage(msg: WorkerMessage): void {
    const { type, error, data } = msg;

    switch (type) {
      case 'status': {
        if (msg.status) {
          const workerProgress = progressForWorkerStatus(msg.status);
          if (workerProgress != null) {
            setReadAloudBootstrapProgress(workerProgress);
          }
        }
        break;
      }
      case 'timeline':
        if (msg.label != null && msg.sinceOrigin != null && msg.sincePrev != null) {
          ttsWorkerMark(msg.label, msg.sinceOrigin, msg.sincePrev, msg.detail);
        }
        break;
      case 'voices_loaded':
        if (msg.voices && msg.voices.length > 0) {
          this.availableVoices = [...msg.voices].sort((a, b) => a.localeCompare(b));
          this.bundleDefaultVoice = msg.defaultVoice ?? null;
          this.notifyVoicesChanged();
        }
        break;
      case 'audio_chunk':
        if (!data) break;
        if (!this.markedFirstChunkThisSpeak && this.pendingSpeak && !this.pendingCollect) {
          ttsMark('first-audio-chunk');
          this.markedFirstChunkThisSpeak = true;
        }
        if (this.pendingCollect) {
          const chunk = new Float32Array(data);
          recordAnchorFromChunk(
            this.pendingCollect.anchors,
            this.pendingCollect.sampleOffset,
            msg.metrics,
            chunk,
          );
          this.pendingCollect.chunks.push(chunk);
          this.pendingCollect.sampleOffset += chunk.length;
        } else if (this.player && this.pendingSpeak) {
          const chunk = new Float32Array(data);
          this.recordWordAnchor(msg.metrics, chunk);
          this.addUtteranceSamples(chunk.length);
          this.player.playAudio(chunk);
        }
        break;
      case 'stream_ended':
        if (this.pendingCollect) {
          this.resolveCollect();
          break;
        }
        ttsMark('stream-ended');
        this.finalizeUtteranceSamples();
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

/** 0–1 progress through the active Pocket utterance; null when idle. */
export function getPocketTtsUtteranceProgress(): number | null {
  return sharedEngine?.getUtteranceAudioProgress() ?? null;
}

/** Ms of Pocket audio heard so far; null when idle. */
export function getPocketTtsUtterancePlayedMs(): number | null {
  return sharedEngine?.getUtterancePlayedMs() ?? null;
}

/** Per-sentence audio→text anchors for the active utterance; null when idle. */
export function getPocketTtsUtteranceWordAnchors(): Array<{
  ms: number;
  charOffset: number;
  wordOffset: number;
}> | null {
  return sharedEngine?.getUtteranceWordAnchors() ?? null;
}

/** Total ms of the active utterance once finalized; null while streaming. */
export function getPocketTtsUtteranceTotalMs(): number | null {
  return sharedEngine?.getUtteranceTotalMs() ?? null;
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
  if (typeof window === 'undefined') return;
  void startReadAloudBootstrap(voice);
}

/** Unlock Pocket audio output during a click/keypress — before any await in speak(). */
export function beginPocketTtsAudioFromUserGesture(): void {
  if (!isPocketTtsAvailable()) return;
  getPocketTtsEngine().beginAudioFromUserGesture();
}

/** Await running audio output; waits for a tap if the first gesture expired during model load. */
export async function ensurePocketTtsAudioOutputReady(signal?: AbortSignal): Promise<void> {
  if (!isPocketTtsAvailable()) return;
  await getPocketTtsEngine().ensureAudioOutputReady(signal);
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
