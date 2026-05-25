/** Runtime instance id derived from crypto.randomUUID(). */
export function ulid(): string {
  if (typeof crypto === 'undefined' || !crypto.randomUUID) {
    throw new Error('ulid() requires crypto.randomUUID (client-only)');
  }
  return crypto.randomUUID().replace(/-/g, '');
}
