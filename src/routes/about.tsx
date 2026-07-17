'use client';

import { Link, createFileRoute } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { usePageReadAloud } from '@/tts';
import { devMark } from '@/lib/dev-mark';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

const ABOUT_READ_TEXT =
  'About EvoQuest. Powerful ideas in mind-size bites, Seymour Papert. Simple things should be simple, complex things should be possible, Alan Kay. EvoQuest converts information into knowledge for epic biology students. Each unit is a mind-size bite: etymology, a mnemonic that unfolds on its own schedule, and active recall. The home achievement grid is your memory palace. Philosophy: hard fun over empty gamification; local-first progress in your browser; no analytics in version one; Latin and Greek roots as compositional meaning.';

function AboutPage() {
  usePageReadAloud(ABOUT_READ_TEXT);

  return (
    <main className="page-wrap max-w-(--w-medium) px-4 py-8">
      <Link
        to="/"
        {...devMark('back')}
        className="mb-6 inline-flex items-center gap-1 text-meta text-(--text-dim) no-underline hover:text-(--text-secondary)"
      >
        <ChevronLeft size={16} />
        Home
      </Link>

      <h1 {...devMark('title')} className="text-display-lg mb-6 font-black text-(--text-primary)">
        About EvoQuest
      </h1>

      <div className="space-y-6 text-body leading-relaxed text-(--text-secondary)">
        <Card {...devMark('quote1')}>
          <blockquote className="border-l-4 border-(--accent-violet) pl-4 italic">
            &ldquo;Powerful ideas in mind-size bites.&rdquo;
            <footer className="mt-2 text-meta not-italic text-(--text-dim)">
              — Seymour Papert
            </footer>
          </blockquote>
        </Card>

        <Card {...devMark('quote2')}>
          <blockquote className="border-l-4 border-(--accent-cyan) pl-4 italic">
            &ldquo;Simple things should be simple. Complex things should be possible.&rdquo;
            <footer className="mt-2 text-meta not-italic text-(--text-dim)">
              — Alan Kay
            </footer>
          </blockquote>
        </Card>

        <div {...devMark('body')}>
        <p>
          EvoQuest converts information into knowledge for epic biology students.
          Each unit is a mind-size bite: etymology, a mnemonic that unfolds on its own
          schedule, and active recall that respects how memory actually works.
        </p>

        <p>
          The home achievement grid is your memory palace — every tile is a piece of
          biology, not a generic trophy. Vibrant dark is the only mode: glow against
          deep blue is part of the design, not a preference.
        </p>
        </div>

        <h2 {...devMark('phil')} className="text-headline-lg font-bold text-(--text-primary)">Philosophy</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Hard fun over empty gamification — every mechanic ties to a concept.</li>
          <li>Local-first — your progress lives in your browser, not on our servers.</li>
          <li>No analytics in v1 — we mean it.</li>
          <li>Latin and Greek roots as compositional meaning, not trivia.</li>
        </ul>

        <p {...devMark('replay')} className="text-meta text-(--text-dim)">
          <Link to="/welcome" className="text-(--accent-violet)">
            Replay onboarding
          </Link>
          {' · '}
          Design docs live in the project&apos;s <code>plan/design/</code> folder.
        </p>
      </div>
    </main>
  );
}
