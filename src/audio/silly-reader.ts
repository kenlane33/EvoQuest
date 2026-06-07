/**
 * SillyReader — short, school-safe funny interjections the TTS can sprinkle in
 * to bring a smile. Teen / Minecraft / backrooms / meta-bot energy.
 *
 * The frequency is driven by settings.reading.sillyReader (0–10): 0 is off,
 * 10 means it fires basically every time.
 */

/** Said before reading a question. */
export const SILLY_QUESTION_INTROS: string[] = [
  'Okay okay okay, focus up.',
  'Plot twist incoming.',
  'Bestie, look alive.',
  'Brain cells, assemble.',
  'No cap, this one matters.',
  'Lock in.',
  'Big brain time.',
  'Sheesh, here we go.',
  'Beep boop, question loading.',
  'My circuits are tingling for this one.',
  'Quick, before the Creeper gets here.',
  "Don't dig straight down on this one.",
  'Mine the answer, not the diamonds.',
  'Redstone brain activated.',
  'Loading wisdom, please wait. Done.',
  'This is not a drill, well, kind of.',
  'Pop quiz energy.',
  'Deep breath. You got this.',
  'Speedrun this answer.',
  'Bet you know this one.',
  'Level up time.',
  'Stay out of the backrooms, stay on task.',
  'Almond water break? No, question first.',
  'As your humble robot, I present:',
  'Nerd mode, engaged.',
  'Let him cook.',
  'Eyes up, scholar.',
  'Achievement unlocked: reading the question.',
];

/** Said right before revealing the answer. */
export const SILLY_ANSWER_INTROS: string[] = [
  'Drumroll, please.',
  'And the answer is, dramatically,',
  'Boom.',
  'Here it comes.',
  'Calling it now.',
  'The prophecy foretold:',
  'Trust me, I am a robot.',
  'My training data says:',
  'According to my big robot brain,',
  'Mojang would approve of this answer.',
  'Crafting the answer, nine, eight, seven, just kidding:',
  'GG, the answer is:',
  'Pog. The answer:',
  'Noclip into knowledge:',
  'Survival mode answer:',
  'Easy peasy:',
  'Galaxy brain says:',
  'No skill issue here:',
  'The chosen one is:',
  'Spoiler alert:',
  'Locked in:',
  'Final answer:',
  'Hot take, but correct:',
  'Robot wisdom dispensing now:',
];

/** Short bridge between questions when Auto advances to the next one. */
export const SILLY_TRANSITIONS: string[] = [
  'Next question, let\'s go.',
  'Rolling right along.',
  'Onward, scholar.',
  'Queueing up the next one.',
  'Speedrun continues.',
  'Level loading, done.',
  'Plot twist number two.',
  'Brain cells, round two.',
  'No pause menu here, next.',
  'Achievement unlocked: next question.',
  'Beep boop, next stop.',
  'Redstone signal received, advancing.',
  'Backrooms door closed, moving on.',
  'Crafting the next challenge.',
  'Respawned at the next question.',
  'GG, next round.',
  'Pog, keep the streak alive.',
  'Galaxy brain reload complete.',
  'Lock in for the next one.',
  'Sheesh, here comes another.',
];

/** Short audio feedback when a wrong choice is picked (Auto off). */
export const WRONG_CUES: string[] = [
  'Not quite. Try again.',
  'Nope, give it another go.',
  'Close! Try another.',
  'Hmm, not that one.',
  'Try again, you got this.',
  'Oof, not it. Keep going.',
  'Almost! Pick another.',
];

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Returns a random interjection from `list`, or '' if SillyReader is off or the
 * roll fails. Chance scales linearly: level 0 → never, level 10 → always.
 */
export function maybeSilly(list: string[], level: number): string {
  if (!level || level <= 0) return '';
  const chance = Math.min(level / 10, 1);
  if (Math.random() > chance) return '';
  return pick(list);
}

/** Always returns a short line for Auto question-to-question transitions. */
export function autoTransitionLine(level: number): string {
  return maybeSilly(SILLY_TRANSITIONS, level) || pick(SILLY_TRANSITIONS);
}
