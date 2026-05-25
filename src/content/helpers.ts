import { KnowledgeUnitSchema, type KnowledgeUnit } from '@/types';

export function unit(u: Omit<KnowledgeUnit, 'enabled'>): KnowledgeUnit {
  return KnowledgeUnitSchema.parse({ ...u, enabled: true });
}
