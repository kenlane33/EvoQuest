import type {
  KnowledgeUnit,
  QuizTemplate,
  ScheduledItem,
  SelectionDescriptor,
  UserState,
  World,
} from '@/types';
import { isTrouble } from '@/engine/scoring';
import { REGISTRY } from '@/engine/templates/registry';
import {
  collectUnitsUnderNode,
  findDrawerContaining,
  findUnit,
  flattenUnits,
} from '@/engine/world';

export type PickMode = 'fast-lane' | 'mixed' | 'microworld' | 'adaptive' | 'force';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysSince(timestamp: number): number {
  if (!timestamp) return Infinity;
  return (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
}

function sampleN<T>(items: T[], n: number): T[] {
  return shuffle(items).slice(0, Math.min(n, items.length));
}

function weightedSample(
  scored: Array<{ unit: KnowledgeUnit; score: number }>,
  n: number,
): KnowledgeUnit[] {
  const pool = [...scored];
  const picks: KnowledgeUnit[] = [];
  while (picks.length < n && pool.length > 0) {
    const total = pool.reduce((sum, p) => sum + p.score, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].score;
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    picks.push(pool[idx].unit);
    pool.splice(idx, 1);
  }
  return picks;
}

export function collectEnabledUnits(world: World, state: UserState): KnowledgeUnit[] {
  const disabled = new Set(state.disabledUnitIds ?? []);
  return flattenUnits(world.modules).filter((u) => u.enabled && !disabled.has(u.id));
}

function pickPreferredOrRandom(qs: QuizTemplate[]): QuizTemplate {
  const preferred = qs.filter((q) => q.preferred);
  return preferred.length ? randomOf(preferred) : randomOf(qs);
}

export function pickTemplate(
  unit: KnowledgeUnit,
  state: UserState,
  mode: PickMode,
  force?: string,
): QuizTemplate {
  const seen = new Set(state.units[unit.id]?.templatesEncountered ?? []);
  const candidates = unit.quizzes.filter((q) => {
    const reg = REGISTRY[q.kind];
    if (!reg) return true;
    if (mode === 'fast-lane') return reg.classifications.fastLane;
    if (mode === 'microworld') return reg.classifications.microworld;
    if (mode === 'force') return q.kind === force;
    return true;
  });
  if (!candidates.length) return unit.quizzes[0];

  if (mode === 'adaptive') {
    const unseen = candidates.filter((q) => !seen.has(q.id) && !seen.has(q.kind));
    if (unseen.length) return pickPreferredOrRandom(unseen);
  }

  return pickPreferredOrRandom(candidates);
}

function toScheduledItem(
  unit: KnowledgeUnit,
  state: UserState,
  mode: PickMode,
): ScheduledItem {
  const quiz = pickTemplate(unit, state, mode);
  return {
    unitId: unit.id,
    templateKind: quiz.kind,
    templateId: quiz.id,
  };
}

function quickMix(world: World, state: UserState, length: number): ScheduledItem[] {
  const enabledUnits = collectEnabledUnits(world, state);
  const scored = enabledUnits.map((u) => ({
    unit: u,
    score: 1 / (1 + daysSince(state.units[u.id]?.lastSeenAt ?? 0)),
  }));
  const picks = weightedSample(scored, length);
  return picks.map((u) => toScheduledItem(u, state, 'adaptive'));
}

function troubleTour(world: World, state: UserState, length: number): ScheduledItem[] {
  const trouble = collectEnabledUnits(world, state)
    .map((u) => ({ unit: u, prog: state.units[u.id] }))
    .filter(({ prog }) => prog && isTrouble(prog));
  const picks = sampleN(trouble, length);
  return picks.map(({ unit }) => toScheduledItem(unit, state, 'adaptive'));
}

function resolveBranchUnits(world: World, state: UserState, nodeId: string): KnowledgeUnit[] {
  const disabled = new Set(state.disabledUnitIds ?? []);
  const single = findUnit(world.modules, nodeId);
  if (single?.enabled && !disabled.has(single.id)) {
    return [single];
  }

  const module = world.modules.find((m) => m.id === nodeId);
  const units = module
    ? flattenUnits([module])
    : collectUnitsUnderNode(world.modules, nodeId);
  return units.filter((u) => u.enabled && !disabled.has(u.id));
}

function isScheduledItemEncountered(item: ScheduledItem, state: UserState): boolean {
  const seen = new Set(state.units[item.unitId]?.templatesEncountered ?? []);
  return seen.has(item.templateId) || seen.has(item.templateKind);
}

function scheduledItemsForUnits(units: KnowledgeUnit[], state: UserState): ScheduledItem[] {
  const fresh: ScheduledItem[] = [];
  const review: ScheduledItem[] = [];

  for (const unit of units) {
    for (const quiz of unit.quizzes) {
      const item: ScheduledItem = {
        unitId: unit.id,
        templateKind: quiz.kind,
        templateId: quiz.id,
      };
      if (isScheduledItemEncountered(item, state)) {
        review.push(item);
      } else {
        fresh.push(item);
      }
    }
  }

  return [...shuffle(fresh), ...shuffle(review)];
}

function branchSweep(world: World, state: UserState, nodeId: string): ScheduledItem[] {
  return scheduledItemsForUnits(resolveBranchUnits(world, state, nodeId), state);
}

function getQuizAttemptCount(state: UserState, unitId: string, quizId: string): number {
  return state.units[unitId]?.quizAttemptCounts?.[quizId] ?? 0;
}

function revisitTour(world: World, state: UserState, length: number): ScheduledItem[] {
  const units = collectEnabledUnits(world, state);
  const ranked: Array<{ count: number; item: ScheduledItem }> = [];

  for (const unit of units) {
    for (const quiz of unit.quizzes) {
      ranked.push({
        count: getQuizAttemptCount(state, unit.id, quiz.id),
        item: {
          unitId: unit.id,
          templateKind: quiz.kind,
          templateId: quiz.id,
        },
      });
    }
  }

  ranked.sort(
    (a, b) =>
      a.count - b.count ||
      a.item.unitId.localeCompare(b.item.unitId) ||
      a.item.templateId.localeCompare(b.item.templateId),
  );

  return ranked.slice(0, length).map((r) => r.item);
}

export function buildQueue(
  selection: SelectionDescriptor,
  world: World,
  state: UserState,
): ScheduledItem[] {
  switch (selection.kind) {
    case 'quick-mix':
      return quickMix(world, state, selection.length);
    case 'trouble':
      return troubleTour(world, state, selection.length);
    case 'branch':
      return branchSweep(world, state, selection.nodeId);
    case 'revisit':
      return revisitTour(world, state, selection.length);
    case 'deep-dive': {
      const module = world.modules.find((m) => m.id === selection.nodeId);
      const units = (
        module ? flattenUnits([module]) : collectUnitsUnderNode(world.modules, selection.nodeId)
      ).filter((u) => u.enabled);
      return sampleN(units, selection.length).map((u) => toScheduledItem(u, state, 'mixed'));
    }
    case 'mixed-trouble': {
      const queue: ScheduledItem[] = [];
      const trouble = findUnit(world.modules, selection.troubleUnitId);
      if (!trouble) return [];
      const drawer = findDrawerContaining(world.modules, selection.troubleUnitId);
      const siblings =
        drawer?.siblings.filter((u) => u.id !== selection.troubleUnitId) ?? [];
      const related = sampleN(siblings, selection.relatedCount);
      for (let i = 0; i < related.length; i++) {
        queue.push(toScheduledItem(related[i], state, 'mixed'));
        if (i === Math.floor(related.length / 2)) {
          queue.push(toScheduledItem(trouble, state, 'adaptive'));
        }
      }
      if (!queue.some((q) => q.unitId === trouble.id)) {
        queue.push(toScheduledItem(trouble, state, 'adaptive'));
      }
      return queue;
    }
    default:
      return quickMix(world, state, 10);
  }
}
