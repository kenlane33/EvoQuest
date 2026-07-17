'use client';

import { useEffect, useRef, useState } from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ChevronLeft, Download, Upload } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ClearProgressConfirm } from '@/components/common/ClearProgressConfirm';
import { ToggleField } from '@/components/common/ToggleField';
import { Card } from '@/components/common/Card';
import { cn } from '@/lib/cn';
import { insertTextAtSelection, normalizePastedText } from '@/lib/normalize-pasted-text';
import {
  BODY_FONT_OPTIONS,
  HEADLINE_FONT_OPTIONS,
  ensureGoogleFontLoaded,
  ensureHeadlineFontLoaded,
} from '@/lib/google-fonts';
import { useAppStore } from '@/store/app-store';
import type { Settings } from '@/types';
import { HINT_COUNTDOWN_SEC, HINT_REVEAL_SEC } from '@/types/schemas';
import { useDevPageLabelsEnabled } from '@/components/dev/DevPageLabel';
import { usePageReadAloud } from '@/tts';
import {
  usePocketTtsVoices,
} from '@/tts';
import { formatPocketTtsVoiceLabel } from '@/tts';
import { getPocketTtsFallbackReason } from '@/tts';
import { isPocketTtsAvailable } from '@/tts';
import { useReadAloudBootstrap } from '@/tts';
import { devMark } from '@/lib/dev-mark';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

const SETTINGS_PAGE_READ_TEXT =
  'Settings. Appearance: contrast, font size, display font, reading font. Hints: countdown before reveal, mnemonic reveal speed. Audio: sound effects, volume, read it voice in your browser. Data: export, import backup, reset all progress.';

const HEADLINE_FONT_CORE = HEADLINE_FONT_OPTIONS.filter((f) => f.group === 'core');
const HEADLINE_FONT_FUN = HEADLINE_FONT_OPTIONS.filter((f) => f.group === 'fun');

function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const exportAllData = useAppStore((s) => s.exportAllData);
  const importAllData = useAppStore((s) => s.importAllData);
  const clearAllProgress = useAppStore((s) => s.clearAllProgress);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [devPageLabels, setDevPageLabels] = useDevPageLabelsEnabled();
  const [tryReadText, setTryReadText] = useState('');
  const [tryReadNonce, setTryReadNonce] = useState(0);
  const tryReadTextRef = useRef<HTMLTextAreaElement>(null);
  const pendingTryReadCaretRef = useRef<number | null>(null);

  const trimmedTryRead = tryReadText.trim();
  const pageReadText = trimmedTryRead || SETTINGS_PAGE_READ_TEXT;

  const readAloudBootstrap = useReadAloudBootstrap(
    settings.reading.enabled,
    settings.reading.voice,
  );
  const pocketFallbackReason =
    readAloudBootstrap.pocketFallbackReason ?? getPocketTtsFallbackReason();

  const {
    voices: pocketTtsVoices,
    status: pocketTtsVoicesStatus,
    error: pocketTtsVoicesError,
  } = usePocketTtsVoices({
    enabled: settings.reading.enabled,
    voice: settings.reading.voice,
  });

  usePageReadAloud(pageReadText, {
    autoRead: Boolean(trimmedTryRead),
    autoReadKey: trimmedTryRead ? `settings-try-${tryReadNonce}` : undefined,
  });

  useEffect(() => {
    const caret = pendingTryReadCaretRef.current;
    if (caret === null || !tryReadTextRef.current) return;
    pendingTryReadCaretRef.current = null;
    tryReadTextRef.current.setSelectionRange(caret, caret);
  }, [tryReadText]);

  useEffect(() => {
    for (const font of BODY_FONT_OPTIONS) {
      ensureGoogleFontLoaded(font.id);
    }
    for (const font of HEADLINE_FONT_OPTIONS) {
      ensureHeadlineFontLoaded(font.id);
    }
  }, []);

  function patchAppearance(patch: Partial<Settings['appearance']>) {
    setSettings({ appearance: { ...settings.appearance, ...patch } });
  }

  function handleExport() {
    const blob = new Blob([exportAllData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evo-quest-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importAllData(String(reader.result));
      setImportMsg(ok ? 'Import successful.' : 'Import failed — invalid file.');
    };
    reader.readAsText(file);
  }

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-meta text-(--text-dim) no-underline hover:text-(--text-secondary)"
      >
        <ChevronLeft size={16} />
        Home
      </Link>

      <h1 className="text-display-lg mb-8 font-black">Settings</h1>

      <section {...devMark('appear')} className="mb-10">
        <h2 className="mb-4 text-headline-md font-bold">Appearance</h2>
        <Card className="space-y-5">
          <Field label="Contrast">
            <div className="flex gap-2">
              {(['normal', 'high'] as const).map((v) => (
                <Button
                  key={v}
                  onClick={() => patchAppearance({ contrast: v })}
                  className={cn(
                    'rounded-(--r-md) px-4 py-2 text-meta font-bold uppercase',
                    settings.appearance.contrast === v
                      ? 'border-0 bg-(--accent-violet) text-(--bg-deep)'
                      : 'border-0 bg-(--bg-card-active) text-(--text-dim)',
                  )}
                >
                  {v}
                </Button>
              ))}
            </div>
          </Field>

          <Field label="Font size">
            <div className="flex gap-2">
              {(['sm', 'md', 'lg'] as const).map((v) => (
                <Button
                  key={v}
                  onClick={() => patchAppearance({ fontSize: v })}
                  className={cn(
                    'rounded-(--r-md) px-4 py-2 text-meta font-bold uppercase',
                    settings.appearance.fontSize === v
                      ? 'border-0 bg-(--accent-cyan) text-(--bg-deep)'
                      : 'border-0 bg-(--bg-card-active) text-(--text-dim)',
                  )}
                >
                  {v}
                </Button>
              ))}
            </div>
          </Field>

          <Field label="Display font">
            <p className="mb-3 text-meta text-(--text-faint)">
              Titles, questions, and buttons.
            </p>
            <p className="mb-2 text-meta font-bold uppercase tracking-[0.08em] text-(--text-dim)">
              Core
            </p>
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {HEADLINE_FONT_CORE.map((font) => (
                <Button
                  key={font.id}
                  onClick={() => patchAppearance({ headlineFont: font.id })}
                  className={cn(
                    'rounded-(--r-md) px-3 py-2.5 text-left text-headline-md font-bold',
                    settings.appearance.headlineFont === font.id
                      ? 'border-0 bg-(--accent-cyan) text-(--bg-deep)'
                      : 'border-0 bg-(--bg-card-active) text-(--text-dim)',
                  )}
                  style={{ fontFamily: `"${font.family}", ui-sans-serif, system-ui, sans-serif` }}
                >
                  {font.label}
                </Button>
              ))}
            </div>
            <p className="mb-2 text-meta font-bold uppercase tracking-[0.08em] text-(--text-dim)">
              Fun
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {HEADLINE_FONT_FUN.map((font) => (
                <Button
                  key={font.id}
                  onClick={() => patchAppearance({ headlineFont: font.id })}
                  className={cn(
                    'rounded-(--r-md) px-3 py-2.5 text-left text-headline-md font-bold',
                    settings.appearance.headlineFont === font.id
                      ? 'border-0 bg-(--accent-amber) text-(--bg-deep)'
                      : 'border-0 bg-(--bg-card-active) text-(--text-dim)',
                  )}
                  style={{ fontFamily: `"${font.family}", ui-sans-serif, system-ui, sans-serif` }}
                >
                  {font.label}
                </Button>
              ))}
            </div>
          </Field>

          <Field label="Reading font">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BODY_FONT_OPTIONS.map((font) => (
                <Button
                  key={font.id}
                  onClick={() => patchAppearance({ bodyFont: font.id })}
                  className={cn(
                    'rounded-(--r-md) px-3 py-2.5 text-left text-body font-semibold',
                    settings.appearance.bodyFont === font.id
                      ? 'border-0 bg-(--accent-violet) text-(--bg-deep)'
                      : 'border-0 bg-(--bg-card-active) text-(--text-dim)',
                  )}
                  style={{ fontFamily: `"${font.family}", ui-sans-serif, system-ui, sans-serif` }}
                >
                  {font.label}
                </Button>
              ))}
            </div>
          </Field>

          {/* TODO: wire up per accessibility.md §5.2 before re-enabling
          <ToggleField
            label="Color-blind safe accents"
            checked={settings.appearance.colorBlindSafe}
            onChange={(v) => patchAppearance({ colorBlindSafe: v })}
          />
          */}
        </Card>
        <p className="mt-3 text-meta text-(--text-faint)">
          EvoQuest is vibrant dark only — no light theme.
        </p>
      </section>

      <section {...devMark('practice')} className="mb-10">
        <h2 className="mb-4 text-headline-md font-bold">Practice</h2>
        <Card className="space-y-5">
          <Field label="Questions per revisit pass">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={settings.practice.revisitLength}
                onChange={(e) =>
                  setSettings({
                    practice: {
                      ...settings.practice,
                      revisitLength: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-(--accent-violet)"
              />
              <span className="w-10 shrink-0 text-right text-meta font-bold tabular-nums text-(--text-secondary)">
                {settings.practice.revisitLength}
              </span>
            </div>
            <p className="mt-2 text-meta text-(--text-faint)">
              How many least-covered questions to queue when you tap Next lap on the home overview.
            </p>
          </Field>

          <ToggleField
            label="Confidence check-ins"
            description="Rate certainty before answering (Lock in prediction)"
            checked={settings.practice.confidenceFrequency !== 'never'}
            onChange={(v) =>
              setSettings({
                practice: {
                  ...settings.practice,
                  confidenceFrequency: v ? 'every-3' : 'never',
                },
              })
            }
          />
        </Card>
      </section>

      <section {...devMark('hints')} className="mb-10">
        <h2 className="mb-4 text-headline-md font-bold">Hints</h2>
        <Card className="space-y-5">
          <Field label="Countdown before reveal">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={HINT_COUNTDOWN_SEC.min}
                max={HINT_COUNTDOWN_SEC.max}
                step={1}
                value={Math.round(settings.reveals.countdownMs / 1000)}
                onChange={(e) =>
                  setSettings({
                    reveals: {
                      ...settings.reveals,
                      countdownMs: Number(e.target.value) * 1000,
                    },
                  })
                }
                className="w-full accent-(--accent-violet)"
              />
              <span className="w-10 shrink-0 text-right text-meta font-bold tabular-nums text-(--text-secondary)">
                {Math.round(settings.reveals.countdownMs / 1000)}s
              </span>
            </div>
            <p className="mt-2 text-meta text-(--text-faint)">
              How long to wait before the mnemonic starts appearing ({HINT_COUNTDOWN_SEC.min}–{HINT_COUNTDOWN_SEC.max}s).
            </p>
          </Field>

          <Field label="Mnemonic reveal speed">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={HINT_REVEAL_SEC.min}
                max={HINT_REVEAL_SEC.max}
                step={1}
                value={Math.round(settings.reveals.revealMs / 1000)}
                onChange={(e) =>
                  setSettings({
                    reveals: {
                      ...settings.reveals,
                      revealMs: Number(e.target.value) * 1000,
                    },
                  })
                }
                className="w-full accent-(--accent-violet)"
              />
              <span className="w-10 shrink-0 text-right text-meta font-bold tabular-nums text-(--text-secondary)">
                {Math.round(settings.reveals.revealMs / 1000)}s
              </span>
            </div>
            <p className="mt-2 text-meta text-(--text-faint)">
              How long the mnemonic takes to fully appear after the countdown ({HINT_REVEAL_SEC.min}–{HINT_REVEAL_SEC.max}s).
            </p>
          </Field>
        </Card>
      </section>

      <section {...devMark('audio')} className="mb-10">
        <h2 className="mb-4 text-headline-md font-bold">Audio</h2>
        <Card className="space-y-5">
          <ToggleField
            label="Sound effects"
            checked={settings.audio.enabled}
            onChange={(v) =>
              setSettings({ audio: { ...settings.audio, enabled: v } })
            }
          />
          <Field label="Volume">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.audio.volume * 100)}
              onChange={(e) =>
                setSettings({
                  audio: {
                    ...settings.audio,
                    volume: Number(e.target.value) / 100,
                  },
                })
              }
              className="w-full accent-(--accent-cyan)"
            />
          </Field>
          <ToggleField
            label="Read it (Pocket TTS)"
            checked={settings.reading.enabled}
            onChange={(v) =>
              setSettings({ reading: { ...settings.reading, enabled: v } })
            }
          />
          <ToggleField
            label="Auto-read"
            checked={settings.reading.autoRead}
            onChange={(v) =>
              setSettings({ reading: { ...settings.reading, autoRead: v } })
            }
          />
          <p className="text-meta text-(--text-faint) -mt-2">
            Also available in the app header. Speaks page content automatically when it
            changes (briefs, feedback, welcome steps).
          </p>
          <Field label="Voice">
            {!isPocketTtsAvailable() && settings.reading.enabled && (
              <p className="text-meta text-(--text-faint)">
                This browser uses your device&apos;s built-in voice (Settings →
                Accessibility → Spoken Content on iPad).
              </p>
            )}
            {pocketFallbackReason && settings.reading.enabled && (
              <p className="text-meta text-(--status-wrong)">
                Pocket voice could not load ({pocketFallbackReason}). Using your
                device&apos;s built-in voice instead.
              </p>
            )}
            {pocketTtsVoicesStatus === 'loading' && (
              <p className="text-meta text-(--text-faint)">
                Loading voices… first use downloads the English model (~200&nbsp;MB).
              </p>
            )}
            {pocketTtsVoicesStatus === 'error' && (
              <p className="text-meta text-(--status-wrong)">
                {pocketTtsVoicesError ?? 'Could not load voices.'}
              </p>
            )}
            {pocketTtsVoices.length > 0 && (
              <select
                value={settings.reading.voice}
                onChange={(e) =>
                  setSettings({
                    reading: { ...settings.reading, voice: e.target.value },
                  })
                }
                className="w-full rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 text-body text-(--text-primary) outline-none focus:border-(--accent-cyan)"
              >
                {pocketTtsVoices.map((voiceId) => (
                  <option key={voiceId} value={voiceId}>
                    {formatPocketTtsVoiceLabel(voiceId)}
                  </option>
                ))}
              </select>
            )}
            {pocketTtsVoicesStatus === 'idle' && !settings.reading.enabled && (
              <p className="text-meta text-(--text-faint)">
                Enable Read it to choose a voice.
              </p>
            )}
            <p className="mt-2 text-meta text-(--text-faint)">
              {isPocketTtsAvailable()
                ? 'Runs in your browser (WASM). Built-in English voices ship with the model.'
                : 'Uses your device speech engine when Pocket TTS is unavailable.'}
            </p>
          </Field>
          <Field label="SillyReader">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={settings.reading.sillyReader}
                onChange={(e) =>
                  setSettings({
                    reading: {
                      ...settings.reading,
                      sillyReader: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-(--accent-violet)"
              />
              <span className="w-10 shrink-0 text-right text-meta font-bold tabular-nums text-(--text-secondary)">
                {settings.reading.sillyReader}
              </span>
            </div>
            <p className="mt-2 text-meta text-(--text-faint)">
              How often the reader drops a silly interjection on the T1/T2 reader pages
              (0 = never, 10 = constant). 🤖
            </p>
          </Field>
          <Field label="Try read-aloud">
            <textarea
              ref={tryReadTextRef}
              value={tryReadText}
              onChange={(e) => setTryReadText(e.target.value)}
              onPaste={(e) => {
                const raw = e.clipboardData.getData('text');
                if (!raw) return;
                const pasted = normalizePastedText(raw);
                if (!pasted) return;
                e.preventDefault();
                const start = e.currentTarget.selectionStart ?? tryReadText.length;
                const end = e.currentTarget.selectionEnd ?? start;
                const { text, caret } = insertTextAtSelection(tryReadText, pasted, start, end);
                pendingTryReadCaretRef.current = caret;
                setTryReadText(text);
                queueMicrotask(() => setTryReadNonce((n) => n + 1));
              }}
              rows={4}
              placeholder="Paste text here to hear it…"
              className="w-full resize-y whitespace-pre-wrap wrap-break-word rounded-(--r-lg) border border-(--border-light) bg-(--bg-card-hi) px-4 py-3 text-body leading-relaxed text-(--text-primary) outline-none placeholder:text-(--text-faint) focus:border-(--accent-cyan)"
            />
            <p className="mt-2 text-meta text-(--text-faint)">
              Not saved. With auto-read on, pasted text is spoken; use Read it in the
              corner anytime. Cleared when you leave this page.
            </p>
          </Field>
        </Card>
      </section>

      <section {...devMark('dev')} className="mb-10">
        <h2 className="mb-4 text-headline-md font-bold">Developer</h2>
        <Card>
          <ToggleField
            label="Show state labels for debugging"
            description="Page code bottom-left + element tags (e.g. home, play:q, grid)"
            checked={devPageLabels}
            onChange={setDevPageLabels}
          />
        </Card>
      </section>

      <section {...devMark('data')} className="mb-10">
        <h2 className="mb-4 text-headline-md font-bold">Data</h2>
        <Card className="space-y-4">
          <Button variant="secondary" fullWidth onClick={handleExport}>
            <Download size={16} />
            Export all data
          </Button>
          <Button variant="secondary" fullWidth onClick={() => fileRef.current?.click()}>
            <Upload size={16} />
            Import backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
            }}
          />
          {importMsg && (
            <p className="text-meta text-(--text-secondary)">{importMsg}</p>
          )}
          {!confirmReset ? (
            <Button variant="destructive" fullWidth onClick={() => setConfirmReset(true)}>
              Reset all progress
            </Button>
          ) : (
            <ClearProgressConfirm
              onConfirm={() => {
                clearAllProgress();
                setConfirmReset(false);
              }}
              onCancel={() => setConfirmReset(false)}
            />
          )}
        </Card>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-meta font-bold uppercase tracking-[0.08em] text-(--text-dim)">
        {label}
      </div>
      {children}
    </div>
  );
}
