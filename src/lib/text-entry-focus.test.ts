import { describe, expect, it } from 'vitest';
import { isTextEntryFocused } from '@/lib/text-entry-focus';

describe('isTextEntryFocused', () => {
  it('returns false when nothing is focused', () => {
    document.body.innerHTML = '<input id="i" />';
    expect(isTextEntryFocused()).toBe(false);
  });

  it('returns true when an input is focused', () => {
    document.body.innerHTML = '<input id="i" />';
    const input = document.getElementById('i') as HTMLInputElement;
    input.focus();
    expect(isTextEntryFocused()).toBe(true);
  });
});
