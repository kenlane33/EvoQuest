/**
 * Central substitutions so quiz and teach text sounds natural when read aloud.
 * Applied automatically in the Pocket TTS engine before synthesis.
 */

import { replaceEmojisForSpeech } from '@/audio/speech-emoji-substitutions';

/** Em-dash → comma: prosodic pause in prose (not for pronunciation hints). */
const TTS_PAUSE = ', ';

const SUBSCRIPT_CHARS: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
  'ₓ': 'x',
  'ₕ': 'h',
  'ₖ': 'k',
  'ₗ': 'l',
  'ₘ': 'm',
  'ₙ': 'n',
  'ₚ': 'p',
  'ₑ': 'e',
  'ₒ': 'o',
};

const SUPERSCRIPT_CHARS: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁺': '+',
  '⁻': '-',
  '⁼': '=',
  '⁽': '(',
  '⁾': ')',
  'ⁿ': 'n',
};

/** Ordered [pattern, replacement] rules — earlier rules win on overlap. */
export const SPEECH_SUBSTITUTIONS: ReadonlyArray<readonly [RegExp, string]> = [
  // Geologic / historical time (number + unit, then bare units)
  [/\b(\d+(?:\.\d+)?)\s*bya\b/gi, '$1 billion years ago'],
  [/\b(\d+(?:\.\d+)?)\s*mya\b/gi, '$1 million years ago'],
  [/\b(\d+(?:\.\d+)?)\s*kya\b/gi, '$1 thousand years ago'],
  [/\b(\d+(?:\.\d+)?)\s*Ga\b/g, '$1 billion years ago'],
  [/\b(\d+(?:\.\d+)?)\s*Ma\b/g, '$1 million years ago'],
  [/\b(\d+(?:\.\d+)?)\s*ka\b/g, '$1 thousand years ago'],
  [/\bbya\b/gi, 'billion years ago'],
  [/\bmya\b/gi, 'million years ago'],
  [/\bkya\b/gi, 'thousand years ago'],
  [/\bBP\b/g, 'years before present'],
  [/\bBCE\b/g, 'before common era'],
  [/\bBC\b/g, 'B C'],
  [/\bCE\b/g, 'common era'],
  [/\bAD\b/g, 'A D'],

  // Approximation and ranges
  [/~\s*/g, 'about '],
  [/(\d+(?:\.\d+)?)\s*–\s*(\d+(?:\.\d+)?)/g, '$1 to $2'],

  // Genetics / chemistry notation
  [/(\d)\s*′/g, '$1 prime'],
  [/(\d)\s*″/g, '$1 double prime'],
  [/(\d+(?:\.\d+)?)\s*%/g, '$1 percent'],
  [/(\d+(?:\.\d+)?)\s*°C/g, '$1 degrees Celsius'],
  [/(\d+(?:\.\d+)?)\s*°F/g, '$1 degrees Fahrenheit'],
  [/(\d+(?:\.\d+)?)\s*°/g, '$1 degrees'],

  // Ratios and operators (digits and letters around symbols)
  [/(\d)\s*:\s*(\d)/g, '$1 to $2'],
  [/(\d)\s*\/\s*(\d)/g, '$1 over $2'],
  [/(\d)\s*-\s*(\d)/g, '$1 minus $2'],
  [/(\S)\s*\+\s*(\S)/g, '$1 plus $2'],

  // Arrows and relations
  [/⇒/g, ' therefore '],
  [/→/g, ' to '],
  [/←/g, ' from '],
  [/↔/g, ' and '],
  [/≠/g, ' does not equal '],
  [/≈/g, ' approximately '],
  [/±/g, ' plus or minus '],
  [/×/g, ' times '],
  [/÷/g, ' divided by '],
  [/≤/g, ' less than or equal to '],
  [/≥/g, ' greater than or equal to '],
  [/[<]/g, ' less than '],
  [/[>]/g, ' greater than '],
  [/=/g, ' equals '],

  // Punctuation that TTS reads awkwardly
  [/&/g, ' and '],
  [/\s*\u2014\s*/g, TTS_PAUSE],
  [/\s*–\s*/g, ' to '],
];

/**
 * Pocket TTS has no phoneme/SSML input — steer pronunciation via single-token respellings.
 * Do not insert commas, hyphens, or spaces between hint parts; those become real pauses.
 */
const PRONUNCIATION_HINTS: ReadonlyArray<readonly [RegExp, (match: string, ...groups: string[]) => string]> = [
  [/\bribosom(\w*)\b/gi, (_match, suffix) => respellToken(_match, `rybosom${suffix}`)],
  [/\bmitochondri(\w*)\b/gi, (_match, suffix) => respellToken(_match, `mydoughchondri${suffix}`)],
];

function respellToken(original: string, spoken: string): string {
  if (original === original.toUpperCase()) {
    return spoken.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return spoken[0].toUpperCase() + spoken.slice(1);
  }
  return spoken;
}

function applyPronunciationHints(text: string): string {
  let out = text;
  for (const [pattern, replace] of PRONUNCIATION_HINTS) {
    out = out.replace(pattern, replace);
  }
  return out;
}

function expandUnicodeScript(text: string): string {
  return text
    .replace(/[₀-₉ₓₕₖₗₘₙₚₑₒ]/g, (ch) => SUBSCRIPT_CHARS[ch] ?? ch)
    .replace(/[⁰-⁹⁺⁻⁼⁽⁾ⁿ]/g, (ch) => SUPERSCRIPT_CHARS[ch] ?? ch);
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Normalize text for Pocket TTS — safe to call repeatedly. */
export function prepareTextForSpeech(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  let out = expandUnicodeScript(trimmed);
  out = replaceEmojisForSpeech(out);
  for (const [pattern, replacement] of SPEECH_SUBSTITUTIONS) {
    out = out.replace(pattern, replacement);
  }
  out = applyPronunciationHints(out);
  return collapseWhitespace(out);
}
