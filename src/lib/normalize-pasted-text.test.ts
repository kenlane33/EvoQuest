import { describe, expect, it } from 'bun:test';
import { insertTextAtSelection, normalizePastedText } from './normalize-pasted-text';

describe('normalizePastedText', () => {
  it('normalizes CRLF and lone CR', () => {
    expect(normalizePastedText('a\r\nb\rc')).toBe('a\nb\nc');
  });

  it('normalizes Unicode line separators', () => {
    expect(normalizePastedText('a\u2028b\u2029c')).toBe('a\nb\nc');
  });

  it('leaves LF-only text unchanged', () => {
    expect(normalizePastedText('a\nb')).toBe('a\nb');
  });
});

describe('insertTextAtSelection', () => {
  it('inserts at cursor', () => {
    expect(insertTextAtSelection('hello', ' world', 5)).toEqual({
      text: 'hello world',
      caret: 11,
    });
  });

  it('replaces selection', () => {
    expect(insertTextAtSelection('hello world', ' there', 5, 11)).toEqual({
      text: 'hello there',
      caret: 11,
    });
  });
});
