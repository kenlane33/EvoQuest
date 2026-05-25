import type { InheritancePattern, PedigreeDetectiveData } from '@/types/schemas';

export type PedigreeInconsistency = {
  personId: string;
  message: string;
};

const PATTERN_LABELS: Record<InheritancePattern, string> = {
  'autosomal-dominant': 'Autosomal dominant',
  'autosomal-recessive': 'Autosomal recessive',
  'x-linked-dominant': 'X-linked dominant',
  'x-linked-recessive': 'X-linked recessive',
  'y-linked': 'Y-linked',
  'mitochondrial': 'Mitochondrial',
};

export { PATTERN_LABELS };

function byId(data: PedigreeDetectiveData) {
  return new Map(data.people.map((p) => [p.id, p]));
}

export function findInconsistencies(
  data: PedigreeDetectiveData,
  pattern: InheritancePattern,
): PedigreeInconsistency[] {
  const people = byId(data);
  const out: PedigreeInconsistency[] = [];

  for (const person of data.people) {
    if (!person.affected) continue;
    const mother = person.motherId ? people.get(person.motherId) : undefined;
    const father = person.fatherId ? people.get(person.fatherId) : undefined;

    if (pattern === 'autosomal-dominant' && mother && father) {
      if (!mother.affected && !father.affected) {
        out.push({
          personId: person.id,
          message: `${person.label} is affected, but both parents are unaffected — unlikely for autosomal dominant.`,
        });
      }
    }

    if (pattern === 'y-linked' && person.sex === 'F') {
      out.push({
        personId: person.id,
        message: `${person.label} is female — Y-linked traits do not appear in females.`,
      });
    }

    if (pattern === 'y-linked' && person.sex === 'M' && father && !father.affected) {
      out.push({
        personId: person.id,
        message: `${person.label} is affected but father is unaffected — Y-linked traits pass father to son.`,
      });
    }

    if (pattern === 'mitochondrial' && person.sex === 'M' && mother && !mother.affected) {
      out.push({
        personId: person.id,
        message: `${person.label} is affected but mother is unaffected — mitochondrial DNA comes from the mother.`,
      });
    }

    if (pattern === 'x-linked-recessive' && person.sex === 'M' && father?.affected) {
      out.push({
        personId: person.id,
        message: `${person.label} is an affected male with an affected father — X-linked recessive rarely passes this way.`,
      });
    }

    if (pattern === 'x-linked-dominant' && person.sex === 'M' && father?.affected) {
      out.push({
        personId: person.id,
        message: `${person.label} is an affected male with an affected father — X-linked dominant does not pass father to son.`,
      });
    }
  }

  return out;
}

export function isPatternConsistent(
  data: PedigreeDetectiveData,
  pattern: InheritancePattern,
): boolean {
  return findInconsistencies(data, pattern).length === 0;
}
