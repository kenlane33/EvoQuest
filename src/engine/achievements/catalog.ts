export type HiddenAchievementDef = {
  id: string;
  emoji: string;
  shortLabel: string;
  longLabel: string;
  flavor: string;
  /** Guaranteed rare power-up reward (optional). */
  powerUpReward?: string;
};

export const HIDDEN_ACHIEVEMENTS: Record<string, HiddenAchievementDef> = {
  'hidden.streak-15': {
    id: 'hidden.streak-15',
    emoji: '🔥',
    shortLabel: 'On Fire',
    longLabel: 'On Fire',
    flavor: 'Fifteen in a row. The neurons are warmed up.',
    powerUpReward: 'pu.mitochondrion-shield',
  },
  'hidden.streak-25': {
    id: 'hidden.streak-25',
    emoji: '🌋',
    shortLabel: 'Eruption',
    longLabel: 'Eruption',
    flavor: 'Twenty-five. The expert state.',
  },
  'hidden.daily-7': {
    id: 'hidden.daily-7',
    emoji: '📅',
    shortLabel: 'Habit',
    longLabel: 'Habit',
    flavor: 'Seven days running. The practice has become a rhythm.',
  },
  'hidden.daily-30': {
    id: 'hidden.daily-30',
    emoji: '🎓',
    shortLabel: 'Discipline',
    longLabel: 'Discipline',
    flavor: 'Thirty days. You are someone who studies biology.',
  },
  'hidden.zero-power-up': {
    id: 'hidden.zero-power-up',
    emoji: '🦅',
    shortLabel: 'Unaided',
    longLabel: 'Unaided',
    flavor: 'No shortcuts. The achievement was the work.',
  },
  'hidden.roommate': {
    id: 'hidden.roommate',
    emoji: '🧬',
    shortLabel: 'Roommate',
    longLabel: 'Roommate',
    flavor: 'Two billion years of cohabitation. Worth a celebration.',
  },
  'hidden.bricoleur': {
    id: 'hidden.bricoleur',
    emoji: '🛠️',
    shortLabel: 'Bricoleur',
    longLabel: 'Bricoleur',
    flavor: 'You build to think. The materials taught back.',
    powerUpReward: 'pu.palace-portal',
  },
  'hidden.master-builder': {
    id: 'hidden.master-builder',
    emoji: '🏗️',
    shortLabel: 'Master Builder',
    longLabel: 'Master Builder',
    flavor: 'Your notebook is a museum.',
  },
  'hidden.calibrator': {
    id: 'hidden.calibrator',
    emoji: '🎯',
    shortLabel: 'Calibrator',
    longLabel: 'Calibrator',
    flavor: 'You know what you know. And what you don\'t.',
  },
  'hidden.etymologist': {
    id: 'hidden.etymologist',
    emoji: '📜',
    shortLabel: 'Etymologist',
    longLabel: 'Etymologist',
    flavor: 'You read Greek and Latin through biology.',
  },
  'hidden.morphologist': {
    id: 'hidden.morphologist',
    emoji: '🏛️',
    shortLabel: 'Morphologist',
    longLabel: 'Morphologist',
    flavor: 'Every term decomposes for you now.',
  },
  'hidden.cascade-prophet': {
    id: 'hidden.cascade-prophet',
    emoji: '🌊',
    shortLabel: 'Cascade Prophet',
    longLabel: 'Cascade Prophet',
    flavor: 'You see the second-order effects.',
    powerUpReward: 'pu.rna-flashback',
  },
};

export type AggregateAchievementDef = {
  id: string;
  scope: 'drawer' | 'room' | 'wing';
  nodeId: string;
  emoji: string;
  shortLabel: string;
  longLabel: string;
  flavor: string;
  wingId: string;
};

/** Endosymbiosis unit id pattern for roommate hidden achievement. */
export const ROOMMATE_UNIT_PATTERN = /endosym/i;
