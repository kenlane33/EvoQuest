/** Deterministic pick from a phrase pool (stable for the same seed). */
export function pickFromPool(pool: readonly string[], seed: string): string {
  if (pool.length === 0) return '';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length] ?? pool[0];
}
