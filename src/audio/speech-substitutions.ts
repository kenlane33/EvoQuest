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
  // role/function sense (jahb) — Pocket TTS often reads job like biblical Job (Johb)
  [/\bjobs\b/gi, (match) => respellToken(match, 'jahbs')],
  [/\bjob\b/gi, (match) => respellToken(match, 'jahb')],
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

const ONES_UNDER_TWENTY = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
] as const;

const TENS_WORDS = ['', '', 'twenty', 'thirty', 'forty', 'fifty'] as const;

function numberUnder100ToWords(n: number): string {
  if (n < 20) return ONES_UNDER_TWENTY[n] ?? String(n);
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const tensWord = TENS_WORDS[tens] ?? String(tens * 10);
  return ones === 0 ? tensWord : `${tensWord} ${ONES_UNDER_TWENTY[ones]}`;
}

function hourToWords(hour: number): string {
  const hour12 = hour % 12 || 12;
  return numberUnder100ToWords(hour12);
}

function formatClockTimeForSpeech(hour: number, minute: number): string {
  const hourWord = hourToWords(hour);
  if (minute === 0) return hourWord;
  if (minute < 10) return `${hourWord} oh ${numberUnder100ToWords(minute)}`;
  return `${hourWord} ${numberUnder100ToWords(minute)}`;
}

/** HH:MM clock times — must run before digit-colon-digit ratio rules. */
function expandClockTimes(text: string): string {
  return text.replace(/\b(\d{1,2}):(\d{2})\b/g, (match, hourStr: string, minuteStr: string) => {
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    if (hour > 23 || minute > 59) return match;
    return formatClockTimeForSpeech(hour, minute);
  });
}

/** Short all-caps tokens that are common English words, not abbreviations. */
const ACRONYM_BLOCKLIST = new Set([
  'AM', 'AN', 'AS', 'AT', 'BE', 'BY', 'DO', 'GO', 'HE', 'IF', 'IN', 'IS', 'IT', 'ME', 'MY',
  'NO', 'OF', 'OK', 'ON', 'OR', 'SO', 'TO', 'UP', 'US', 'WE',
]);

const VOWEL_RE = /[aeiouAEIOU]/;

/** Pocket TTS has no spell-out mode — space-separate letters for letter-by-letter reading. */
function expandAcronymLetters(token: string): string {
  return [...token].join(' ');
}

/**
 * Heuristic acronym detection for biology/education text (2–5 letters).
 * Signals: all caps, no vowels, bio-style mixed case (mRNA), or short all-caps token.
 */
function isLikelyAcronym(token: string): boolean {
  if (!/^[A-Za-z]{2,5}$/.test(token)) return false;
  if (ACRONYM_BLOCKLIST.has(token.toUpperCase())) return false;

  if (/^[a-z]{1,2}[A-Z]{2,}[a-z]*$/.test(token) || /^[a-z][A-Z]$/.test(token)) {
    return true;
  }

  if (token !== token.toUpperCase()) return false;

  if (!VOWEL_RE.test(token)) return true;
  if (token.length <= 3) return true;

  return false;
}

/** Expand likely acronyms to spaced letters (DNA → D N A). Runs after symbol substitutions. */
function expandAcronyms(text: string): string {
  return text.replace(/\b([A-Za-z]{2,5})\b/g, (match) =>
    isLikelyAcronym(match) ? expandAcronymLetters(match) : match,
  );
}

/** Normalize text for Pocket TTS — safe to call repeatedly. */
export function prepareTextForSpeech(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  let out = expandUnicodeScript(trimmed);
  out = replaceEmojisForSpeech(out);
  out = expandClockTimes(out);
  for (const [pattern, replacement] of SPEECH_SUBSTITUTIONS) {
    out = out.replace(pattern, replacement);
  }
  out = expandAcronyms(out);
  out = applyPronunciationHints(out);
  return collapseWhitespace(out);
}
