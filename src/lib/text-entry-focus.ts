/** True when the user is typing in a field (defer heavy UI work). */
export function isTextEntryFocused(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.activeElement;
  if (!el) return false;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return !el.disabled && !el.readOnly;
  }
  return el instanceof HTMLElement && el.isContentEditable === true;
}
