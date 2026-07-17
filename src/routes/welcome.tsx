'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { Repeat } from 'lucide-react';
import { AchievementGrid } from '@/components/achievements/AchievementGrid';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ToggleField } from '@/components/common/ToggleField';
import { EtymologyCard } from '@/components/etymology/EtymologyCard';
import { useDevPageLabel } from '@/components/dev/DevPageLabel';
import { HintRevealer } from '@/components/hint/HintRevealer';
import { usePageReadAloud } from '@/tts';
import { devMark } from '@/lib/dev-mark';
import { useAppStore } from '@/store/app-store';

export const Route = createFileRoute('/welcome')({
  component: WelcomePage,
});

const DEMO_QUESTION_PROMPT =
  'Lynn Margulis proposed the _____ Theory for eukaryotic cell evolution.';

const DEMO_HINT = {
  root: 'Greek: endo (within) + sym (together) + bios (life)',
  mnemonic: 'ENDO=INSIDE. SYM=TOGETHER. Prokaryotes moved IN — roommates for 2 billion years.',
};

const DEMO_PROMPT_PARTS = DEMO_QUESTION_PROMPT.split('_____');

function WelcomePage() {
  const navigate = useNavigate();
  const completeFirstRun = useAppStore((s) => s.completeFirstRun);
  const setSettings = useAppStore((s) => s.setSettings);
  const settings = useAppStore((s) => s.settings);
  const [step, setStep] = useState(0);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [demoReplayKey, setDemoReplayKey] = useState(0);

  useDevPageLabel(`wel:${step}`);

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setShowMnemonic(true), 400);
      return () => clearTimeout(t);
    }
  }, [step]);

  function finish() {
    completeFirstRun();
    navigate({ to: '/' });
  }

  function skip() {
    completeFirstRun();
    navigate({ to: '/' });
  }

  function replayDemo() {
    setDemoReplayKey((k) => k + 1);
  }

  const stepReadText = useMemo(() => {
    if (step === 0) {
      const base = DEMO_QUESTION_PROMPT.replace('_____', 'blank');
      const hint = showMnemonic
        ? `${DEMO_HINT.root}. ${DEMO_HINT.mnemonic}`
        : DEMO_HINT.root;
      return `Let's EvoQuest. Check out this example. ${base} Hint: ${hint}. An idea unfolds.`;
    }
    if (step === 1) {
      return 'Your achievement grid. Every cell is a piece of biology.';
    }
    const confidenceLine =
      settings.practice.confidenceFrequency !== 'never'
        ? ', confidence check-ins'
        : '';
    return `A few choices. Audio stings, read it with voice Azelma, full motion${confidenceLine}.`;
  }, [step, showMnemonic, settings.practice.confidenceFrequency]);

  usePageReadAloud(stepReadText, { autoRead: true, autoReadKey: `welcome-${step}-${demoReplayKey}` });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="absolute right-6 top-6">
        <Button variant="text" {...devMark('skip')} onClick={skip} className="text-meta">
          Skip
        </Button>
      </div>

      {step === 0 && (
        <div className="w-full max-w-(--w-narrow) animate-slide-up text-center">
          <header {...devMark('intro')} className="mb-8">
            <h1 className="text-headline-lg font-black text-(--text-primary)">
              Let&apos;s EvoQuest…
            </h1>
            <p className="mt-2 text-body text-(--text-dim)">
              …check out this example.
            </p>
          </header>

          <Card {...devMark('q')} className="mb-6 text-left">
            <p className="text-body-lg leading-relaxed text-(--text-primary)">
              {DEMO_PROMPT_PARTS[0]}
              <span className="mx-1 inline-block min-w-16 border-b-2 border-(--accent-cyan) px-1 font-bold text-(--accent-cyan)">
                ?????
              </span>
              {DEMO_PROMPT_PARTS[1]}
            </p>
          </Card>

          <div data-wing="origin" {...devMark('hint')} className="mb-8 text-left">
            <p className="mb-3 text-meta uppercase tracking-[0.08em] text-(--text-dim)">
              Hint for this question
            </p>
            <EtymologyCard root={DEMO_HINT.root} compact />
            {showMnemonic && (
              <div {...devMark('mnem')}>
                <HintRevealer
                key={demoReplayKey}
                hint={DEMO_HINT}
                showRoot={false}
                countdownSec={2}
                revealMs={3000}
                className="animate-slide-up"
                />
              </div>
            )}
          </div>
          <p {...devMark('tagline')} className="mb-8 text-body italic text-(--text-dim)">An idea unfolds.</p>
          <Button variant="primary" fullWidth {...devMark('start')} onClick={() => setStep(1)}>
            Start
          </Button>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link to="/about" className="text-meta text-(--text-dim) no-underline hover:text-(--text-secondary)">
              What is this?
            </Link>
            <Button
              variant="icon"
              {...devMark('replay')}
              onClick={replayDemo}
              disabled={!showMnemonic}
              aria-label="Replay demo"
            >
              <Repeat size={18} />
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="w-full max-w-(--w-wide) animate-slide-up text-center">
          <div {...devMark('grid')}>
            <AchievementGrid unitProgress={{}} preview />
          </div>
          <p {...devMark('gridtxt')} className="my-8 text-body italic text-(--text-dim)">
            Every cell is a piece of biology.
          </p>
          <Button variant="primary" fullWidth {...devMark('cont')} className="mx-auto max-w-(--w-narrow)" onClick={() => setStep(2)}>
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-(--w-narrow) animate-slide-up">
          <h2 className="mb-6 text-headline-lg font-black text-(--text-primary)">
            A few choices
          </h2>
          <div {...devMark('prefs')} className="space-y-4">
            <ToggleField
              variant="card"
              label="Audio stings"
              description="Short sounds on reveal and unlock"
              checked={settings.audio.enabled}
              onChange={(v) =>
                setSettings({ audio: { ...settings.audio, enabled: v } })
              }
            />
            <ToggleField
              variant="card"
              label="Read it"
              description="Pocket TTS reads teach blocks (voice: Azelma)"
              checked={settings.reading.enabled}
              onChange={(v) =>
                setSettings({ reading: { ...settings.reading, enabled: v } })
              }
            />
            <ToggleField
              variant="card"
              label="Auto-read"
              description="Speak page content automatically when it changes"
              checked={settings.reading.autoRead}
              onChange={(v) =>
                setSettings({ reading: { ...settings.reading, autoRead: v } })
              }
            />
            <ToggleField
              variant="card"
              label="Full motion"
              description="Animations and glow effects"
              checked={settings.motion === 'full'}
              onChange={(v) => setSettings({ motion: v ? 'full' : 'reduced' })}
            />
            <ToggleField
              variant="card"
              label="Confidence check-ins"
              description="Rate certainty before seeing answers"
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
          </div>
          <Button variant="primary" fullWidth {...devMark('begin')} className="mt-8" onClick={finish}>
            Begin
          </Button>
        </div>
      )}
    </main>
  );
}
