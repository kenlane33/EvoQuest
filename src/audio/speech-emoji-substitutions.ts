/**
 * Emoji and decorative symbol → spoken phrases for Pocket TTS.
 * Keys use exact grapheme clusters as they appear in content (with or without U+FE0F).
 */

/** Match one emoji sequence (ZWJ compounds, optional variation selectors). */
export const EMOJI_SEQUENCE_RE =
  /\p{Extended_Pictographic}(?:\uFE0F|\uFE0E|\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*|\p{Regional_Indicator}{2}/gu;

export const EMOJI_SPEECH_REPLACEMENTS: Readonly<Record<string, string>> = {
  // Biology & science
  '🧬': 'DNA',
  '🦠': 'microbe',
  '🧫': 'petri dish',
  '🧪': 'test tube',
  '🔬': 'microscope',
  '🔭': 'telescope',
  '⚗️': 'chemistry flask',
  '⚗': 'chemistry flask',
  '🧠': 'brain',
  '🦴': 'bone',
  '🪱': 'worm',
  '🦈': 'shark',
  '🐸': 'frog',
  '🐭': 'mouse',
  '🐰': 'rabbit',
  '🐌': 'snail',
  '🐢': 'turtle',
  '🐦': 'bird',
  '🦅': 'eagle',
  '🦋': 'butterfly',
  '🦕': 'dinosaur',
  '🦎': 'lizard',
  '🦑': 'squid',
  '🦒': 'giraffe',
  '🦌': 'deer',
  '🐺': 'wolf',
  '🪲': 'beetle',
  '🕸️': 'web',
  '🕸': 'web',
  '🌱': 'plant',
  '🌿': 'leaf',
  '🌳': 'tree',
  '🌸': 'flower',
  '🍲': 'soup',
  '🍬': 'sugar',
  '🧈': 'fat',
  '🥚': 'egg',
  '🧱': 'building block',
  '🧶': 'fiber',
  '🍎': 'apple',
  '🥦': 'broccoli',
  '🌽': 'corn',
  '🌾': 'grain',
  '🐄': 'cow',
  '🦁': 'lion',
  '🐘': 'elephant',
  '💉': 'syringe',
  '💊': 'pill',
  '🩺': 'stethoscope',

  // Cell & chemistry
  '🔋': 'battery',
  '⚡': 'energy',
  '💧': 'water',
  '💨': 'gas',
  '💪': 'muscle',
  '🌡️': 'temperature',
  '🌡': 'temperature',
  '☀️': 'sun',
  '☀': 'sun',
  '☁️': 'cloud',
  '☁': 'cloud',
  '🌊': 'ocean',
  '🌋': 'volcano',
  '🌍': 'Earth',
  '🌎': 'Earth',
  '🌏': 'Earth',
  '🏝️': 'island',
  '🏝': 'island',
  '🔥': 'fire',
  '🧹': 'cleanup',
  '🚪': 'door',
  '🛡️': 'shield',
  '🛡': 'shield',
  '🔑': 'key',
  '🧲': 'magnet',

  // Genetics & data
  '🔀': 'crossing over',
  '✂️': 'scissors',
  '✂': 'scissors',
  '🎲': 'random chance',
  '👪': 'family',
  '🟣': 'purple',
  '🟢': 'green',
  '⚪': 'white',
  '🔵': 'blue',
  '♀': 'female',
  '♀️': 'female',
  '♂': 'male',
  '♂️': 'male',
  '↔️': 'versus',
  '↔': 'versus',
  '🔁': 'cycle',
  '🔄': 'cycle',
  '⭕': 'circle',

  // Ecology & charts
  '🔺': 'pyramid',
  '♻️': 'recycle',
  '♻': 'recycle',
  '📈': 'growth chart',
  '📊': 'chart',
  '⚖️': 'balance',
  '⚖': 'balance',

  // Study & navigation
  '📋': 'checklist',
  '📜': 'scroll',
  '📝': 'notes',
  '🔤': 'letters',
  '📓': 'notebook',
  '📚': 'books',
  '📦': 'box',
  '📁': 'folder',
  '📌': 'pin',
  '📅': 'calendar',
  '🎓': 'graduation',
  '🔍': 'magnifier',
  '🧭': 'compass',
  '🧐': 'inspect',
  '🎯': 'target',
  '🎁': 'gift',
  '🎛️': 'controls',
  '🎛': 'controls',
  '✏️': 'pencil',
  '✏': 'pencil',
  '📎': 'paperclip',
  '🖊️': 'pen',
  '🖊': 'pen',
  '🗒️': 'notepad',
  '🗒': 'notepad',

  // Feedback & game chrome
  '💡': 'tip',
  '✨': 'sparkle',
  '⚠️': 'warning',
  '⚠': 'warning',
  '🏆': 'trophy',
  '⭐': 'star',
  '🌟': 'star',
  '💯': 'perfect score',
  '🥇': 'gold medal',
  '🎖️': 'medal',
  '🎖': 'medal',
  '⏳': 'time',
  '⏰': 'clock',
  '⏱️': 'timer',
  '⏱': 'timer',
  '❤️': 'heart',
  '❤': 'heart',
  '💚': 'green heart',
  '💙': 'blue heart',
  '👍': 'thumbs up',
  '👎': 'thumbs down',
  '🙌': 'celebration',
  '👏': 'applause',
  '🎉': 'celebration',

  // Power-ups & misc
  '🛠️': 'tools',
  '🛠': 'tools',
  '🏗️': 'construction',
  '🏗': 'construction',
  '🏛️': 'institution',
  '🏛': 'institution',
  '🌀': 'portal',
  '🧙': 'wizard',
  '🤖': 'robot',
  '🔗': 'link',
  '🪞': 'mirror',
  '🚀': 'rocket',
  '🛸': 'UFO',
  '🌈': 'rainbow',
  '🌙': 'moon',
  '💫': 'dizzy',
  '🛑': 'stop',

  // Faces & UI (docs / occasional UI copy)
  '✅': 'check',
  '❌': 'cross',
  '👑': 'crown',
  '🦊': 'fox',
  '👾': 'space invader',
  '😈': 'devil',
  '🤔': 'thinking',
  '🤚': 'hand',
  '🧒': 'child',
  '👁️': 'eye',
  '👁': 'eye',

  // Objects & places (plan docs + future content)
  '🪟': 'window',
  '🩸': 'blood',
  '📂': 'open folder',
  '⚙️': 'gear',
  '⚙': 'gear',
  '🎊': 'confetti',
  '🔝': 'top',
  '💎': 'gem',
  '➡️': 'to',
  '➡': 'to',
  '🦚': 'peacock',
  '☄️': 'comet',
  '☄': 'comet',
  '🪡': 'needle',
  '🌬️': 'wind',
  '🌬': 'wind',
  '🎰': 'slot machine',
  '🐔': 'chicken',
  '🎨': 'palette',
  '📸': 'camera',
  '🪜': 'ladder',
  '🚶': 'walking',
  '🔧': 'wrench',
};

/** Single-character symbols often used beside words (not always Extended_Pictographic). */
export const SYMBOL_SPEECH_REPLACEMENTS: Readonly<Record<string, string>> = {
  '✓': 'check',
  '✔': 'check',
  '✗': 'cross',
  '✖': 'cross',
  '☑': 'checked',
  '☐': 'unchecked',
  '•': 'bullet',
  '·': 'dot',
  '…': 'dot dot dot',
  '©': 'copyright',
  '®': 'registered',
  '™': 'trademark',
};

function lookupEmojiSpeech(emoji: string): string | undefined {
  const direct = EMOJI_SPEECH_REPLACEMENTS[emoji];
  if (direct) return direct;

  const noVs = emoji.replace(/\uFE0F/g, '');
  if (noVs !== emoji && EMOJI_SPEECH_REPLACEMENTS[noVs]) {
    return EMOJI_SPEECH_REPLACEMENTS[noVs];
  }

  const withVs = noVs + '\uFE0F';
  if (EMOJI_SPEECH_REPLACEMENTS[withVs]) {
    return EMOJI_SPEECH_REPLACEMENTS[withVs];
  }

  return undefined;
}

/** Replace emoji and decorative symbols with spoken words. */
export function replaceEmojisForSpeech(text: string): string {
  let out = text;

  for (const [symbol, spoken] of Object.entries(SYMBOL_SPEECH_REPLACEMENTS)) {
    if (out.includes(symbol)) {
      out = out.split(symbol).join(` ${spoken} `);
    }
  }

  out = out.replace(EMOJI_SEQUENCE_RE, (match) => {
    const spoken = lookupEmojiSpeech(match);
    return spoken ? ` ${spoken} ` : ' ';
  });

  return out;
}

/** Collect unique emoji in text that have no spoken mapping. */
export function findUnmappedEmojis(text: string): string[] {
  const missing = new Set<string>();
  for (const match of text.matchAll(EMOJI_SEQUENCE_RE)) {
    if (!lookupEmojiSpeech(match[0])) {
      missing.add(match[0]);
    }
  }
  return [...missing];
}

/** All emoji keys we can speak (for audit scripts). */
export function knownEmojiSpeechKeys(): string[] {
  return Object.keys(EMOJI_SPEECH_REPLACEMENTS);
}
