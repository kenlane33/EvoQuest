export const DEV_PAGE_LABELS_KEY = 'evo-quest.dev.page-labels';
export const DEV_PAGE_LABELS_EVENT = 'evo-quest:dev-page-labels';

export function devPageLabelsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEV_PAGE_LABELS_KEY) === '1';
}

export function setDevPageLabelsEnabled(on: boolean): void {
  if (typeof window === 'undefined') return;
  if (on) localStorage.setItem(DEV_PAGE_LABELS_KEY, '1');
  else localStorage.removeItem(DEV_PAGE_LABELS_KEY);
  if (!on) resetDevLabelCopyBuffer();
  window.dispatchEvent(new Event(DEV_PAGE_LABELS_EVENT));
}

let devLabelCopyBuffer: string[] = [];

/** Append a label to the dev copy buffer and write the joined text to the clipboard. */
export function copyDevLabel(label: string): readonly string[] {
  const trimmed = label.trim();
  if (!trimmed || typeof navigator === 'undefined') return devLabelCopyBuffer;
  devLabelCopyBuffer.push(trimmed);
  void navigator.clipboard.writeText(devLabelCopyBuffer.join('\n'));
  return devLabelCopyBuffer;
}

export function resetDevLabelCopyBuffer(): void {
  devLabelCopyBuffer = [];
}

export function devLabelCopyCount(): number {
  return devLabelCopyBuffer.length;
}

export function getDevLabelCopyStack(): readonly string[] {
  return devLabelCopyBuffer;
}

const PLAY_PHASE_LABEL: Record<string, string> = {
  brief: 'play:brief',
  play: 'play:q',
  feedback: 'play:fb',
  paused: 'play:pause',
  end: 'play:end',
  loading: 'play:load',
  menu: 'play:menu',
};

export function resolveDevPageLabel(pathname: string, sessionPhase?: string): string {
  if (pathname === '/') return 'home';
  if (pathname === '/welcome') return 'wel';
  if (pathname.startsWith('/play/')) {
    if (sessionPhase && PLAY_PHASE_LABEL[sessionPhase]) {
      return PLAY_PHASE_LABEL[sessionPhase];
    }
    return 'play';
  }
  if (pathname === '/journeys' || pathname === '/journeys/') return 'journeys';
  if (pathname.startsWith('/journeys/')) return 'journey';
  if (pathname === '/content' || pathname === '/content/') return 'content';
  if (pathname === '/content/import') return 'c:import';
  if (pathname === '/content/format') return 'c:format';
  if (pathname === '/content/stats') return 'c:stats';
  if (pathname === '/content/modules') return 'c:modules';
  if (pathname === '/notebook') return 'notebook';
  if (pathname === '/garden') return 'garden';
  if (pathname === '/about') return 'about';
  if (pathname === '/settings') return 'settings';
  return pathname.slice(1).replace(/\//g, ':') || '?';
}
