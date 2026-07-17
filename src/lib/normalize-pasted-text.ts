/** Normalize line endings from clipboard text for reliable textarea paste. */
export function normalizePastedText(text: string): string {
  return text.replace(/\r\n?/g, '\n').replace(/[\u2028\u2029]/g, '\n');
}

export function insertTextAtSelection(
  current: string,
  insert: string,
  selectionStart: number,
  selectionEnd: number = selectionStart,
): { text: string; caret: number } {
  const text = current.slice(0, selectionStart) + insert + current.slice(selectionEnd);
  const caret = selectionStart + insert.length;
  return { text, caret };
}
