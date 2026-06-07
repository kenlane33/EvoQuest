'use client';

import { createFileRoute } from '@tanstack/react-router';
import { ReaderQuiz } from '@/components/reader/ReaderQuiz';
import { T2_GROUPS, T2_QUESTIONS, T2_QUIZ_TITLE } from './-t2-quiz-data';

export const Route = createFileRoute('/t2')({
  component: T2Page,
});

function T2Page() {
  return (
    <ReaderQuiz
      storageKey="t2"
      eyebrow="Test as Reader · T2"
      title={T2_QUIZ_TITLE}
      intro="The full released form, read aloud. With Auto on it plays straight through — reads each question, counts 3 · 2 · 1, then reads and highlights the answer. Tap a choice any time to answer early: wrong turns red, green is the way forward. Use Pause (left) to think, or turn Auto off to go fully by tap. Passages and figures have their own play button."
      questions={T2_QUESTIONS}
      groups={T2_GROUPS}
    />
  );
}
