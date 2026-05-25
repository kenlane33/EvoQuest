/** Spread onto any element: {...devMark('grid')} */
export function devMark(id: string): { 'data-dev': string } {
  return { 'data-dev': id };
}

const LABEL_HEIGHT_PX = 18;
const LABEL_MAX_WIDTH_PX = 192;

function isInDevMarkLabelZone(host: HTMLElement, clientX: number, clientY: number): boolean {
  const rect = host.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.left + Math.min(LABEL_MAX_WIDTH_PX, rect.width) &&
    clientY >= rect.top &&
    clientY <= rect.top + LABEL_HEIGHT_PX
  );
}

/** Resolve a data-dev label when the click landed on its badge (top-left). */
export function devMarkLabelAtClick(event: MouseEvent): string | null {
  const seen = new Set<HTMLElement>();

  for (const el of document.elementsFromPoint(event.clientX, event.clientY)) {
    if (!(el instanceof HTMLElement)) continue;
    const host = el.closest('[data-dev]') as HTMLElement | null;
    if (!host || seen.has(host)) continue;
    seen.add(host);

    const label = host.getAttribute('data-dev');
    if (!label || !isInDevMarkLabelZone(host, event.clientX, event.clientY)) continue;
    return label;
  }

  return null;
}
