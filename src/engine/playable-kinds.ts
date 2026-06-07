import { REGISTRY } from '@/engine/templates/registry';

/** Quiz kinds rendered directly in PlaySession (not template registry files). */
export const BASIC_QUIZ_KINDS = [
  'speed-reveal-mnemonic',
  'fill',
  'match',
  'scenario',
] as const;

export type BasicQuizKind = (typeof BASIC_QUIZ_KINDS)[number];

export function isPlayableQuizKind(kind: string): boolean {
  return (
    (BASIC_QUIZ_KINDS as readonly string[]).includes(kind) || kind in REGISTRY
  );
}

export function listRegistryKinds(): string[] {
  return Object.keys(REGISTRY).sort();
}

/** Every shipped quiz template kind (basic + registry). */
export const ALL_QUIZ_TEMPLATE_KINDS = [
  ...BASIC_QUIZ_KINDS,
  ...listRegistryKinds(),
] as const;
