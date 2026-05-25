# AGENTS.md — Storage & Resume Invariants

This file enforces the non-negotiable invariants that protect a real
user's saved state. Read before modifying any code under `src/storage/`
or any storage-touching code in `src/store/`.

## Hard rules

1. NEVER delete or rename a localStorage key under `evo-quest.v1.*`.
2. NEVER remove a field from a stored type. Deprecate by leaving it
   optional and ignored.
3. NEVER reuse a removed field name for a different purpose.
4. NEVER reuse a retired ID (KnowledgeUnit, Morpheme, Achievement,
   etc.). Add aliases instead.
5. NEVER modify a shipped migration. Migrations are append-only and
   pure.
6. NEVER silently wipe data on a parse / validation / version mismatch.
   The only paths are: migrate forward, quarantine, or preserve-and-warn.
7. EVERY new storage key must:
   - Start with `evo-quest.v1.`
   - Use `StoredBlob<T>` envelope
   - Have a `LATEST_VERSIONS[key]` entry
   - Have a (possibly empty) `MIGRATIONS[key]` entry
   - Have a Zod schema in `src/types/schemas.ts`
8. EVERY new field on a stored type must come with a migration that
   sets a default for existing data.

## Package manager

Use **Bun only** for this project:

```bash
bun install
bun run dev
bun run build
bun run deploy
bun test
```

Do not add npm/pnpm/yarn lockfiles or scripts.

## Design docs

- [`plan/design/index.md`](plan/design/index.md) — navigation hub
- [`plan/game-types/`](plan/game-types/) — quiz template specs
- When docs and code disagree, update docs first, then code.

## Review checklist

Before merging a storage-touching PR:

- [ ] New keys are namespaced and registered
- [ ] Migrations are pure and preserve data
- [ ] No shipped migration was modified
- [ ] No ID was reused
- [ ] `bun run validate-content` passes
- [ ] `bun run build` passes
