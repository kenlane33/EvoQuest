import { describe, expect, it } from 'vitest';
import {
  buildSpeakLayout,
  clipSpeakRawText,
  resolveSpeakWordSyncFrame,
  speakTextFromWordIndex,
  tokenizeSpeakWords,
  wordIndexFromCharIndex,
  wordIndexFromProgress,
} from '@/audio/speak-word-sync';

describe('buildSpeakLayout', () => {
  it('expands speech substitutions and increases word count', () => {
    const layout = buildSpeakLayout('Cells appeared 5 mya.');
    expect(layout.spokenText).toContain('million years ago');
    expect(layout.words.length).toBeGreaterThan(tokenizeSpeakWords('Cells appeared 5 mya.').length);
  });

  it('tokenizes spoken text, not raw abbreviations', () => {
    const layout = buildSpeakLayout('5 mya');
    expect(layout.words.some((w) => w.text === 'million')).toBe(true);
  });
});

describe('speakTextFromWordIndex', () => {
  it('slices at spoken word boundaries', () => {
    const layout = buildSpeakLayout('one two three four');
    const slice = speakTextFromWordIndex(layout.spokenText, layout.words, 2);
    expect(slice).toBe('three four');
  });

  it('returns full spoken text from word zero', () => {
    const layout = buildSpeakLayout('hello world');
    expect(speakTextFromWordIndex(layout.spokenText, layout.words, 0)).toBe(layout.spokenText);
  });
});

describe('wordIndexFromProgress', () => {
  it('returns start index at zero progress', () => {
    const layout = buildSpeakLayout('alpha beta gamma delta');
    expect(wordIndexFromProgress(0, layout.weights, 0)).toBe(0);
    expect(wordIndexFromProgress(0, layout.weights, 2)).toBe(2);
  });

  it('returns last index at full progress', () => {
    const layout = buildSpeakLayout('alpha beta gamma');
    expect(wordIndexFromProgress(1, layout.weights, 0)).toBe(layout.words.length - 1);
  });

  it('advances monotonically with increasing progress', () => {
    const layout = buildSpeakLayout('one two three four five six seven eight');
    let prev = 0;
    for (let p = 0; p <= 1; p += 0.1) {
      const idx = wordIndexFromProgress(p, layout.weights, 0);
      expect(idx).toBeGreaterThanOrEqual(prev);
      prev = idx;
    }
  });
});

describe('wordIndexFromCharIndex', () => {
  it('maps boundary offsets from a mid-text anchor', () => {
    const layout = buildSpeakLayout('one two three four five');
    const anchor = 2;
    const anchorStart = layout.words[anchor]!.start;
    const partial = speakTextFromWordIndex(layout.spokenText, layout.words, anchor);
    const partialWords = tokenizeSpeakWords(partial);
    const boundaryAtThirdPartialWord = partialWords[2]!.start;

    expect(
      wordIndexFromCharIndex(anchorStart + boundaryAtThirdPartialWord, layout.words),
    ).toBe(anchor + 2);
  });
});

describe('clipSpeakRawText', () => {
  it('includes title and body when both are present', () => {
    expect(
      clipSpeakRawText({ title: 'Chapter One', text: 'Hello world.', noTitle: false }),
    ).toBe('Chapter One\nHello world.');
    const layout = buildSpeakLayout(
      clipSpeakRawText({ title: 'Chapter One', text: 'Hello world.', noTitle: false }),
    );
    expect(layout.words[0]?.text).toBe('Chapter');
    expect(layout.words.some((w) => w.text === 'Hello')).toBe(true);
  });

  it('uses body only when noTitle is set', () => {
    expect(
      clipSpeakRawText({ title: 'Ignored', text: 'Body only.', noTitle: true }),
    ).toBe('Body only.');
  });
});

describe('resolveSpeakWordSyncFrame', () => {
  it('holds Pocket highlight until audio has actually started playing', () => {
    const layout = buildSpeakLayout('one two three four five six seven eight');
    const start = 0;
    const estimatedMs = 8000;

    const waiting = resolveSpeakWordSyncFrame({
      pocketBackend: true,
      pocketPlayedMs: null,
      boundaryCharIndex: null,
      timeProgress: 0.45,
      wallElapsedMs: 3600,
      estimatedMs,
      words: layout.words,
      weights: layout.weights,
      startWordIndex: start,
      lastProgress: 0,
    });
    expect(waiting.wordIndex).toBe(start);
    expect(waiting.elapsedMs).toBe(0);

    const notYetPlaying = resolveSpeakWordSyncFrame({
      pocketBackend: true,
      pocketPlayedMs: 0,
      boundaryCharIndex: null,
      timeProgress: 0.45,
      wallElapsedMs: 3600,
      estimatedMs,
      words: layout.words,
      weights: layout.weights,
      startWordIndex: start,
      lastProgress: 0,
    });
    expect(notYetPlaying.wordIndex).toBe(start);
    expect(notYetPlaying.elapsedMs).toBe(0);
  });

  it('tracks Pocket highlight from heard ms, not partial-stream sample ratio', () => {
    const layout = buildSpeakLayout('one two three four five six seven eight');
    const estimatedMs = 8000;

    const synced = resolveSpeakWordSyncFrame({
      pocketBackend: true,
      pocketPlayedMs: 2800,
      boundaryCharIndex: null,
      timeProgress: 0.8,
      wallElapsedMs: 6400,
      estimatedMs,
      words: layout.words,
      weights: layout.weights,
      startWordIndex: 0,
      lastProgress: 0,
    });

    const clockOnly = resolveSpeakWordSyncFrame({
      pocketBackend: false,
      pocketPlayedMs: null,
      boundaryCharIndex: null,
      timeProgress: 0.8,
      wallElapsedMs: 6400,
      estimatedMs,
      words: layout.words,
      weights: layout.weights,
      startWordIndex: 0,
      lastProgress: 0,
    });

    expect(synced.wordIndex).toBeLessThan(clockOnly.wordIndex);
    expect(synced.elapsedMs).toBe(2800);
  });

  it('does not jump ahead when only the first streamed chunk has finished', () => {
    const layout = buildSpeakLayout('one two three four five six seven eight');
    const estimatedMs = 8000;

    const earlyChunkDone = resolveSpeakWordSyncFrame({
      pocketBackend: true,
      pocketPlayedMs: 400,
      boundaryCharIndex: null,
      timeProgress: 1,
      wallElapsedMs: 4000,
      estimatedMs,
      words: layout.words,
      weights: layout.weights,
      startWordIndex: 0,
      lastProgress: 0,
    });

    expect(earlyChunkDone.wordIndex).toBeLessThan(layout.words.length - 1);
    expect(earlyChunkDone.progress).toBeLessThan(0.1);
  });
});
