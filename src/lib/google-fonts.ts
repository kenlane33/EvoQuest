/** Body font presets — Google Fonts (CDN) and bundled self-hosted faces. */

import '@fontsource/opendyslexic/400.css';
import '@fontsource/opendyslexic/700.css';

type GoogleBodyFontOption = {
  id: string;
  label: string;
  family: string;
  cssParam: string;
  bundled?: false;
};

type BundledBodyFontOption = {
  id: string;
  label: string;
  family: string;
  bundled: true;
};

export type BodyFontOption = GoogleBodyFontOption | BundledBodyFontOption;

export const BODY_FONT_OPTIONS = [
  {
    id: 'nunito',
    label: 'Nunito',
    family: 'Nunito',
    cssParam: 'Nunito:wght@400;600;700;800',
  },
  {
    id: 'inter',
    label: 'Inter',
    family: 'Inter',
    cssParam: 'Inter:wght@400;600;700;800',
  },
  {
    id: 'lora',
    label: 'Lora',
    family: 'Lora',
    cssParam: 'Lora:wght@400;600;700',
  },
  {
    id: 'source-serif-4',
    label: 'Source Serif 4',
    family: 'Source Serif 4',
    cssParam: 'Source+Serif+4:wght@400;600;700',
  },
  {
    id: 'fira-sans',
    label: 'Fira Sans',
    family: 'Fira Sans',
    cssParam: 'Fira+Sans:wght@400;600;700;800',
  },
  {
    id: 'literata',
    label: 'Literata',
    family: 'Literata',
    cssParam: 'Literata:wght@400;600;700',
  },
  {
    id: 'atkinson-hyperlegible',
    label: 'Atkinson Hyperlegible',
    family: 'Atkinson Hyperlegible',
    cssParam: 'Atkinson+Hyperlegible:wght@400;700',
  },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    family: 'Space Grotesk',
    cssParam: 'Space+Grotesk:wght@400;600;700',
  },
  {
    id: 'dm-sans',
    label: 'DM Sans',
    family: 'DM Sans',
    cssParam: 'DM+Sans:wght@400;600;700',
  },
  {
    id: 'crimson-pro',
    label: 'Crimson Pro',
    family: 'Crimson Pro',
    cssParam: 'Crimson+Pro:wght@400;600;700',
  },
  {
    id: 'opendyslexic',
    label: 'OpenDyslexic',
    family: 'OpenDyslexic',
    bundled: true,
  },
] as const satisfies readonly BodyFontOption[];

export type BodyFontId = (typeof BODY_FONT_OPTIONS)[number]['id'];

export const BODY_FONT_IDS = BODY_FONT_OPTIONS.map((f) => f.id) as [
  BodyFontId,
  ...BodyFontId[],
];

type HeadlineFontOption = {
  id: string;
  label: string;
  family: string;
  cssParam: string;
  group: 'core' | 'fun';
};

/** Display / headline fonts — titles, questions, buttons. */
export const HEADLINE_FONT_OPTIONS = [
  {
    id: 'syne',
    label: 'Syne',
    family: 'Syne',
    cssParam: 'Syne:wght@700;800;900',
    group: 'core',
  },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    family: 'Space Grotesk',
    cssParam: 'Space+Grotesk:wght@600;700',
    group: 'core',
  },
  {
    id: 'outfit',
    label: 'Outfit',
    family: 'Outfit',
    cssParam: 'Outfit:wght@600;700;800',
    group: 'core',
  },
  {
    id: 'bricolage-grotesque',
    label: 'Bricolage Grotesque',
    family: 'Bricolage Grotesque',
    cssParam: 'Bricolage+Grotesque:opsz,wght@12..96,600;700;800',
    group: 'core',
  },
  {
    id: 'fraunces',
    label: 'Fraunces',
    family: 'Fraunces',
    cssParam: 'Fraunces:opsz,wght@9..144,600;700;900',
    group: 'core',
  },
  {
    id: 'playfair-display',
    label: 'Playfair Display',
    family: 'Playfair Display',
    cssParam: 'Playfair+Display:wght@700;800;900',
    group: 'core',
  },
  {
    id: 'libre-baskerville',
    label: 'Libre Baskerville',
    family: 'Libre Baskerville',
    cssParam: 'Libre+Baskerville:wght@700',
    group: 'core',
  },
  {
    id: 'bungee',
    label: 'Bungee',
    family: 'Bungee',
    cssParam: 'Bungee',
    group: 'fun',
  },
  {
    id: 'bangers',
    label: 'Bangers',
    family: 'Bangers',
    cssParam: 'Bangers',
    group: 'fun',
  },
  {
    id: 'righteous',
    label: 'Righteous',
    family: 'Righteous',
    cssParam: 'Righteous',
    group: 'fun',
  },
  {
    id: 'fredoka',
    label: 'Fredoka',
    family: 'Fredoka',
    cssParam: 'Fredoka:wght@600;700',
    group: 'fun',
  },
  {
    id: 'permanent-marker',
    label: 'Permanent Marker',
    family: 'Permanent Marker',
    cssParam: 'Permanent+Marker',
    group: 'fun',
  },
] as const satisfies readonly HeadlineFontOption[];

export type HeadlineFontId = (typeof HEADLINE_FONT_OPTIONS)[number]['id'];

export const HEADLINE_FONT_IDS = HEADLINE_FONT_OPTIONS.map((f) => f.id) as [
  HeadlineFontId,
  ...HeadlineFontId[],
];

const LINK_ID_PREFIX = 'evo-quest-font-';
const HEADLINE_LINK_ID_PREFIX = 'evo-quest-headline-font-';

export function bodyFontById(id: BodyFontId) {
  return BODY_FONT_OPTIONS.find((f) => f.id === id) ?? BODY_FONT_OPTIONS[0];
}

export function bodyFontFamilyStack(id: BodyFontId): string {
  const { family } = bodyFontById(id);
  return `"${family}", ui-sans-serif, system-ui, sans-serif`;
}

export function headlineFontById(id: HeadlineFontId) {
  return HEADLINE_FONT_OPTIONS.find((f) => f.id === id) ?? HEADLINE_FONT_OPTIONS[0];
}

export function headlineFontFamilyStack(id: HeadlineFontId): string {
  const { family } = headlineFontById(id);
  return `"${family}", ui-sans-serif, system-ui, sans-serif`;
}

export function googleFontStylesheetUrl(cssParam: string): string {
  return `https://fonts.googleapis.com/css2?family=${cssParam}&display=swap`;
}

/** Base fonts always present in the document shell (headline + mono + default body). */
export const BASE_GOOGLE_FONTS_URL = googleFontStylesheetUrl(
  'Syne:wght@700;800;900&family=Nunito:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700',
);

/**
 * Inject a Google Fonts stylesheet with crossOrigin so it loads under
 * Cross-Origin-Embedder-Policy: require-corp (fonts.gstatic.com sends CORP).
 */
export function ensureGoogleFontLoaded(id: BodyFontId): void {
  if (typeof document === 'undefined') return;

  const font = bodyFontById(id);
  if (('bundled' in font && font.bundled) || id === 'nunito') return;
  if (!('cssParam' in font)) return;

  const linkId = `${LINK_ID_PREFIX}${id}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = googleFontStylesheetUrl(font.cssParam);
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

export function ensureHeadlineFontLoaded(id: HeadlineFontId): void {
  if (typeof document === 'undefined') return;
  if (id === 'syne') return;

  const font = headlineFontById(id);
  const linkId = `${HEADLINE_LINK_ID_PREFIX}${id}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = googleFontStylesheetUrl(font.cssParam);
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

export function applyBodyFont(id: BodyFontId): void {
  if (typeof document === 'undefined') return;
  ensureGoogleFontLoaded(id);
  document.documentElement.style.setProperty(
    '--font-body',
    bodyFontFamilyStack(id),
  );
}

export function applyHeadlineFont(id: HeadlineFontId): void {
  if (typeof document === 'undefined') return;
  ensureHeadlineFontLoaded(id);
  document.documentElement.style.setProperty(
    '--font-headline',
    headlineFontFamilyStack(id),
  );
}
