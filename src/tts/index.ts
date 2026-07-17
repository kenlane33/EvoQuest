// Configuration
export { configureReadAloud, getReadAloudConfig } from './config';
export type { ReadAloudConfig } from './config';

// Text preparation
export { prepareTextForSpeech, SPEECH_SUBSTITUTIONS } from './text/speech-substitutions';
export {
  replaceEmojisForSpeech,
  EMOJI_SPEECH_REPLACEMENTS,
  findUnmappedEmojis,
} from './text/speech-emoji-substitutions';

// Engine
export {
  POCKET_TTS_DEFAULT_VOICE,
  POCKET_TTS_DEFAULT_LANGUAGE,
  POCKET_TTS_EXTRA_VOICES,
  POCKET_TTS_EXTRA_VOICE_IDS,
  formatPocketTtsVoiceLabel,
  PocketTtsError,
} from './engine/pocket-tts';
export {
  isPocketTtsAvailable,
  isReadAloudAvailable,
  canAutoReadAloud,
  REACTION_SPEAK_TIMEOUT_MS,
} from './engine/read-aloud';
export {
  speakReadAloud,
  prepareReadAloud,
  stopReadAloud,
  preloadReadAloud,
  preloadReadAloudText,
  clearTtsCache,
  beginReadAloudAudioFromUserGesture,
  ensureReadAloudAudioOutputReady,
  getReadAloudPlayedMs,
  getReadAloudTotalMs,
  getReadAloudWordAnchors,
  getReadAloudBoundaryCharIndex,
  waitForReadAloudIdle,
} from './engine/read-aloud-engine';
export type { ReadAloudSpeakOptions } from './engine/read-aloud-engine';
export {
  getReadAloudBootstrapState,
  startReadAloudBootstrap,
  shouldUsePocketTts,
  subscribeReadAloudBootstrap,
  subscribePocketBackendReady,
  resetReadAloudBootstrap,
  getPocketTtsFallbackReason,
} from './engine/read-aloud-bootstrap';
export type {
  ReadAloudBootstrapState,
  ReadAloudBootstrapStatus,
  ReadAloudBackend,
} from './engine/read-aloud-bootstrap';
export {
  isWebSpeechAvailable,
  primeWebSpeechVoices,
  speakWebSpeech,
  stopWebSpeech,
} from './engine/web-speech-engine';
export {
  buildSpeakLayout,
  clipSpeakRawText,
  clampWordIndex,
  estimateMsAtWordIndex,
  sliderValueFromWordIndex,
  speakTextFromWordIndex,
  wordIndexFromMs,
  wordIndexFromSlider,
  tokenizeSpeakWords,
  estimateSpeakDurationMs,
  resolveSpeakWordSyncFrame,
  wordIndexFromCharIndex,
  wordIndexFromPocketAnchors,
  wordIndexFromProgress,
  buildWordDurationWeights,
} from './engine/speak-word-sync';
export type { SpeakWord, SpeakLayout } from './engine/speak-word-sync';

// Hooks
export { usePocketTts, stopPocketTts } from './hooks/use-pocket-tts';
export type { PocketTtsStatus, UsePocketTtsOptions } from './hooks/use-pocket-tts';
export { useReadAloudBootstrap } from './hooks/use-read-aloud-bootstrap';
export {
  usePocketTtsVoices,
  resolvePocketTtsVoice,
} from './hooks/use-pocket-tts-voices';
export type { PocketTtsVoicesStatus } from './hooks/use-pocket-tts-voices';
export { useSpeakWordProgress } from './hooks/use-speak-word-progress';
export { usePageReadAloud } from './hooks/use-page-read-aloud';
export { useReadAloudPlayer } from './hooks/use-read-aloud-player';
export type {
  UseReadAloudPlayerOptions,
  UseReadAloudPlayerResult,
} from './hooks/use-read-aloud-player';

// Providers & contexts
export {
  ReadAloudProvider,
  useReadAloudSettings,
  useReadAloudSettingsOptional,
  useValidateStoredVoice,
} from './react/ReadAloudProvider';
export type {
  ReadAloudSettings,
  ReadAloudSettingsActions,
  ReadAloudContextValue,
  ReadAloudProviderProps,
} from './react/ReadAloudProvider';
export {
  PageReadAloudProvider,
  usePageReadAloudContext,
} from './react/page-read-aloud-context';
export type { PageReadAloudState } from './react/page-read-aloud-context';
export {
  QuestionSpeakProvider,
  useQuestionSpeak,
  useQuestionSpeakOptional,
} from './react/question-speak-context';
export type {
  QuestionSpeakSlot,
  QuestionSpeakStatus,
} from './react/question-speak-context';

// Components
export { ReadAloudButton } from './react/components/ReadAloudButton';
export { VoicePickerButton } from './react/components/VoicePickerButton';
export { GlobalReadAloudBar } from './react/components/GlobalReadAloudBar';
export type { GlobalReadAloudBarProps } from './react/components/GlobalReadAloudBar';
export { AutoReadToggle } from './react/components/AutoReadToggle';
export {
  SpokenTextHighlight,
  formatPlaybackClock,
} from './react/components/SpokenTextHighlight';
export type { SpokenTextHighlightProps } from './react/components/SpokenTextHighlight';

// HOCs
export {
  withReadAloudProviders,
  withPageReadAloud,
  ReadAloudRoot,
} from './react/hoc/withReadAloud';

// Server (import from @/tts/server/pocket-tts-proxy in your app middleware)
export {
  isPocketTtsProxyPath,
  pocketTtsProxyUpstreamUrl,
  proxyPocketTtsRequest,
  POCKET_TTS_PROXY_PREFIX,
  POCKET_TTS_HF_BUNDLE_BASE,
} from './server/pocket-tts-proxy';
