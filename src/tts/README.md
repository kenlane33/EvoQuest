# Read-Aloud TTS Library

Portable text-to-speech library for React apps. Copy this entire `src/tts/` folder (plus `public/pocket-tts/` assets) into another project to get:

- **Pocket TTS** (Kyutai ONNX/WASM) with Web Speech API fallback
- **Hooks** for speak, bootstrap, voices, word-sync progress, page registration, and full playback control
- **Providers** for settings and page/question coordination
- **Components** — ReadAloudButton, VoicePickerButton, GlobalReadAloudBar, AutoReadToggle, SpokenTextHighlight
- **HOCs** — `withReadAloudProviders`, `withPageReadAloud`, `ReadAloudRoot`
- **Text prep** — abbreviations, emoji, math symbols → natural speech

## Quick start

### 1. Copy files

```
src/tts/              → your-project/src/tts/
public/pocket-tts/    → your-project/public/pocket-tts/
```

### 2. Runtime requirements

Pocket TTS needs **cross-origin isolation** (SharedArrayBuffer):

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Serve ONNX models through a **same-origin proxy** (avoids Hugging Face CORS). Wire the proxy in your server middleware:

```ts
import { isPocketTtsProxyPath, proxyPocketTtsRequest } from '@/tts/server/pocket-tts-proxy';

// In your request middleware:
if (isPocketTtsProxyPath(pathname)) {
  return proxyPocketTtsRequest(request);
}
```

### 3. Optional configuration

Defaults match EvoQuest. Override at app startup if paths differ:

```ts
import { configureReadAloud } from '@/tts';

configureReadAloud({
  workerUrl: '/pocket-tts/inference-worker.js',
  bundleProxyPrefix: '/api/pocket-tts/onnx',
  defaultVoice: 'azelma',
});
```

### 4. Provider setup

Wire your app store (or local state) into `ReadAloudProvider`:

```tsx
import { ReadAloudRoot } from '@/tts';

function App() {
  const [settings, setSettings] = useState({
    enabled: true,
    autoRead: false,
    voice: 'azelma',
    volume: 0.6,
  });

  return (
    <ReadAloudRoot
      enabled={settings.enabled}
      autoRead={settings.autoRead}
      voice={settings.voice}
      volume={settings.volume}
      setVoice={(voice) => setSettings((s) => ({ ...s, voice }))}
      setAutoRead={(autoRead) => setSettings((s) => ({ ...s, autoRead }))}
    >
      <YourApp />
    </ReadAloudRoot>
  );
}
```

`ReadAloudRoot` wraps both `ReadAloudProvider` (settings) and `PageReadAloudProvider` (global Read-it bar).

---

## Examples

### HOC — wrap your app root

```tsx
import { withReadAloudProviders } from '@/tts';

const App = withReadAloudProviders(MyApp, {
  enabled: true,
  autoRead: true,
  voice: 'azelma',
  volume: 0.6,
  setVoice: () => {},
  setAutoRead: () => {},
});
```

### `usePocketTts` — minimal speak button

```tsx
import { usePocketTts } from '@/tts';

function SpeakDemo({ text }: { text: string }) {
  const { status, error, toggle } = usePocketTts({ voice: 'azelma', volume: 0.6 });

  return (
    <button type="button" onClick={() => toggle(text)} disabled={!text.trim()}>
      {status === 'playing' ? 'Stop' : 'Read it'}
      {error ? ` — ${error}` : ''}
    </button>
  );
}
```

### `ReadAloudButton` — styled control

```tsx
import { ReadAloudButton, usePocketTts } from '@/tts';

function ArticleReader({ text }: { text: string }) {
  const tts = usePocketTts();

  return (
    <ReadAloudButton
      text={text}
      status={tts.status}
      error={tts.error}
      onToggle={() => tts.toggle(text)}
      label="Read it"
    />
  );
}
```

### Global Read-it bar + page registration

```tsx
import { GlobalReadAloudBar, usePageReadAloud } from '@/tts';

function ArticlePage({ title, body }: { title: string; body: string }) {
  const text = `${title}. ${body}`;
  usePageReadAloud(text, { autoRead: true });

  return (
    <article>
      <h1>{title}</h1>
      <p>{body}</p>
      {/* GlobalReadAloudBar is mounted once in your app shell */}
    </article>
  );
}

// In app shell (alongside routes):
<GlobalReadAloudBar onHome={pathname === '/'} onPlayRoute={pathname.startsWith('/play/')} />
```

### HOC — auto-register page text

```tsx
import { withPageReadAloud } from '@/tts';

const AboutPage = withPageReadAloud(
  function About({ content }: { content: string }) {
    return <p>{content}</p>;
  },
  (props) => props.content,
  { autoRead: true },
);
```

### `useReadAloudPlayer` + `SpokenTextHighlight` — workbench player

```tsx
import {
  useReadAloudPlayer,
  SpokenTextHighlight,
  ReadAloudButton,
  formatPlaybackClock,
  useReadAloudSettings,
} from '@/tts';

function MiniPlayer({ text }: { text: string }) {
  const { voice, volume } = useReadAloudSettings();
  const player = useReadAloudPlayer({ text, voice, volume });

  return (
    <div>
      <input
        type="range"
        min={0}
        max={100}
        value={player.sliderPct}
        onPointerDown={player.handleSliderPointerDown}
        onChange={(e) => player.handleSliderChange(Number(e.target.value))}
        onPointerUp={player.finishScrub}
      />
      <SpokenTextHighlight
        text={player.speakLayout.spokenText}
        words={player.speakLayout.words}
        activeWordIndex={player.displayWordIndex}
        onWordClick={player.handleWordClick}
      />
      <ReadAloudButton
        text={player.speakLayout.spokenText}
        status={player.status}
        error={player.error}
        onToggle={player.handlePlaybackToggle}
        disabled={player.playbackLocked}
      />
      <span>{formatPlaybackClock(player.elapsedMs)}</span>
    </div>
  );
}
```

### `prepareTextForSpeech` — standalone text prep

```ts
import { prepareTextForSpeech } from '@/tts';

const spoken = prepareTextForSpeech('DNA replicates in ~3.5 Ga rocks 🧬');
// → "D N A replicates in about 3.5 billion years ago rocks DNA"
```

---

## Theming

Components use Tailwind v4 with CSS custom properties. Provide these in your global styles for matching EvoQuest chrome:

```css
:root {
  --accent-cyan: #00d4ff;
  --accent-coral: #ff6b6b;
  --bg-card: #1a1a2e;
  --bg-card-hi: #22223a;
  --bg-card-active: #2a2a44;
  --bg-deep: #0f0f1a;
  --border-light: #ffffff18;
  --border-medium: #ffffff30;
  --text-primary: #f0f0f5;
  --text-secondary: #c0c0d0;
  --text-dim: #8888a0;
  --text-faint: #606078;
  --status-correct: #4ade80;
  --status-wrong: #f87171;
  --r-md: 0.5rem;
  --r-lg: 0.75rem;
  --r-xl: 1rem;
  --r-full: 9999px;
}
```

All components accept `className` overrides for custom styling.

---

## Public API

Import from `@/tts` (or relative `./tts`):

| Category | Exports |
|----------|---------|
| Config | `configureReadAloud`, `getReadAloudConfig` |
| Text | `prepareTextForSpeech`, `replaceEmojisForSpeech` |
| Engine | `speakReadAloud`, `stopReadAloud`, `preloadReadAloud`, `isReadAloudAvailable` |
| Hooks | `usePocketTts`, `useReadAloudBootstrap`, `usePocketTtsVoices`, `useSpeakWordProgress`, `usePageReadAloud`, `useReadAloudPlayer` |
| Providers | `ReadAloudProvider`, `ReadAloudRoot`, `PageReadAloudProvider`, `QuestionSpeakProvider` |
| Components | `ReadAloudButton`, `VoicePickerButton`, `GlobalReadAloudBar`, `AutoReadToggle`, `SpokenTextHighlight` |
| HOCs | `withReadAloudProviders`, `withPageReadAloud` |
| Server | `@/tts/server/pocket-tts-proxy` |

---

## Folder structure

```
src/tts/
├── config.ts              # Runtime URLs and defaults
├── index.ts               # Public barrel export
├── README.md
├── engine/                # Pocket TTS + Web Speech engines
├── text/                  # Speech substitutions
├── hooks/                 # React hooks
├── react/
│   ├── ReadAloudProvider.tsx
│   ├── page-read-aloud-context.tsx
│   ├── question-speak-context.tsx
│   ├── components/        # UI components
│   └── hoc/                 # Higher-order components
├── server/                # ONNX proxy for server middleware
└── internal/              # cn(), Button, ToggleSwitch (vendored)
```

## Tests

```bash
bun test src/tts/
```

## Dependencies

- `react` (hooks, providers, components)
- `lucide-react` (icons in components)
- Browser: `AudioContext`, `speechSynthesis`, `caches` (Cache API)
- Server: fetch proxy for Hugging Face ONNX bundles
