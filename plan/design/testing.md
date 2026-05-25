# Testing

evo-quest's testing strategy has one central principle: **the resume
invariant is sacred.** Every other test exists to keep the app working
nicely; the resume invariant test exists to keep a real user from ever
losing real progress. It blocks merge regardless of other priorities.

This doc covers: test layers, the invariant suite, the per-game-type
test patterns, e2e flows, visual regression, and the pre-merge gate.

---

## 1. Test layers

| Layer | Tool | Speed | Coverage target |
|---|---|---|---|
| Unit | Vitest | <50ms each | engine + storage 95%+, content 100%, UI smoke only |
| Component | Vitest + Testing Library | <200ms each | one happy-path per component |
| Property | Vitest + fast-check | <500ms each | storage round-trip, ID uniqueness, migration purity |
| Integration | Vitest + Testing Library | <1s each | one per route |
| E2E | Playwright | 5-30s each | 5 critical flows |
| Visual regression | Playwright snapshots | varies | key surfaces |
| A11y | axe-core via Playwright | varies | every route |
| Performance | Lighthouse CI | 30-60s | targets per route |

Total target test suite runtime: **<3 minutes** on CI for the
non-Playwright portion; **<8 minutes** with Playwright.

---

## 2. Unit tests

### 2.1 Storage layer — 100% required

`src/storage/*` is the most critical code in the app. Tests cover:

- `save()` → `load()` round-trip for every key
- Schema versioning: every `LATEST_VERSIONS[key]` matches a Zod schema
- Migration chain: every `MIGRATIONS[key]` has continuous versions
- Backup rotation: `session` writes shift prior to `session.backup`
- Quarantine: corrupt JSON, missing migration, validation failure, and
  future-version each route correctly

Required setup utilities:

```ts
// src/storage/__tests__/helpers.ts
export function withFakeLocalStorage<T>(test: () => T): T;
export function buildBlob<T>(payload: T, schemaVersion: number, ago = 0): StoredBlob<T>;
export function expectQuarantined(key: string, reason: QuarantineEntry['reason']): void;
```

### 2.2 Engine layer — 95% required

`src/engine/*` is pure logic, easy to test exhaustively:

- Reducer transitions: every action × every phase pair, expected
  next-state shape verified
- `pickTemplate`: for each mode × unit-with-N-templates, verify
  selection is correct or correctly weighted
- `buildQueue`: for each `SelectionDescriptor.kind`, verify the queue
  contents
- `computeTier`: every input shape produces the right tier
- `processAchievements`: hidden + aggregate + first-unlock cases
  fire correctly

### 2.3 Content layer — 100% required

Every bundled content module Zod-validates. The test:

```ts
import { CONTENT_MODULES } from '@/content';
import { ContentModuleSchema } from '@/storage/schema';

test.each(CONTENT_MODULES)('module $id validates', (mod) => {
  ContentModuleSchema.parse(mod);
});
```

Plus build-time content validation runs via `bun run validate-content`
([`authoring.md`](./authoring.md) §5).

### 2.4 UI components — smoke only

For each component:

- It renders without crashing given valid props
- Its accessibility attributes are present (e.g., button has
  `aria-label` if icon-only)

Component-level interaction tests are integration tests (§4), not unit
tests.

---

## 3. The resume invariant test suite

The single most important test file in the codebase:
`src/storage/__tests__/resume.invariant.test.ts`.

### 3.1 What it pins

```ts
import { fc } from 'fast-check';
import { saveState, loadState, applyMigrations } from '@/storage';

describe('Resume Invariant', () => {

  it('every save → load round-trips losslessly (Session)', () => {
    fc.assert(fc.property(sessionArbitrary(), (session) => {
      saveState('evo-quest.v1.session', session);
      const loaded = loadState<Session>('evo-quest.v1.session');
      expect(loaded.ok).toBe(true);
      expect(loaded.value).toEqual(session);
    }));
  });

  it('every migration is pure (same input → same output)', () => {
    for (const [key, chain] of Object.entries(MIGRATIONS)) {
      for (const m of chain) {
        fc.assert(fc.property(payloadArbitrary(key, m.fromVersion), (input) => {
          const a = m.forward(structuredClone(input));
          const b = m.forward(structuredClone(input));
          expect(a).toEqual(b);
        }));
      }
    }
  });

  it('every migration preserves user identity (no field disappears uncovered)', () => {
    for (const [key, chain] of Object.entries(MIGRATIONS)) {
      for (const m of chain) {
        fc.assert(fc.property(payloadArbitrary(key, m.fromVersion), (input) => {
          const out = m.forward(input);
          // Every user-data field in `input` must be reachable from `out`
          // OR explicitly migrated to a documented new location.
          // Check via the migration's `describe` text matching a
          // known pattern, or an allow-list of forgotten-but-deprecated fields.
          assertNoUntrackedFieldLoss(input, out, m.describe);
        }));
      }
    }
  });

  it('walks the chain from any prior version to current', () => {
    for (const [key, chain] of Object.entries(MIGRATIONS)) {
      const versions = [1, ...chain.map(m => m.toVersion)];
      for (const v of versions) {
        const sample = sampleFor(key, v);
        const blob = buildBlob(sample, v);
        localStorage.setItem(key, JSON.stringify(blob));
        const result = loadState(key);
        expect(result.ok).toBe(true);
        expect(result.fromVersion).toBe(v);
        expect(result.toVersion).toBe(LATEST_VERSIONS[key]);
      }
    }
  });

  it('quarantines on parse failure (no silent wipe)', () => {
    localStorage.setItem('evo-quest.v1.session', '{not valid json');
    const result = loadState('evo-quest.v1.session');
    expect(result.ok).toBe(false);
    expect(result.quarantined).toBe(true);
    expect(localStorage.getItem('evo-quest.v1.session')).toBeTruthy();   // not wiped
    const corrupt = JSON.parse(localStorage.getItem('evo-quest.v1.corrupt')!);
    expect(corrupt.payload).toContainEqual(expect.objectContaining({
      key: 'evo-quest.v1.session',
      reason: 'parse-fail',
    }));
  });

  it('quarantines on Zod validation failure', () => { /* similar */ });
  it('quarantines on missing migration', () => { /* similar */ });
  it('preserves on future-version blob', () => { /* similar */ });

  it('mid-session backup recovers from a write-mid-flight crash', () => {
    const good = sampleSession();
    saveState('evo-quest.v1.session', good);
    // simulate next write that corrupts
    localStorage.setItem('evo-quest.v1.session', '{not valid');
    const result = loadState('evo-quest.v1.session');
    // Should auto-recover from .backup
    expect(result.ok).toBe(true);
    expect(result.value).toEqual(good);
    expect(result.recoveredFromBackup).toBe(true);
  });

  it('hard reset clears every evo-quest.v1.* key', () => {
    // Pre-populate every key with sample data
    populateAllKeysSamples();
    hardReset();
    for (const key of ALL_STORAGE_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });

  it('ID immutability: no shipped KnowledgeUnit id ever disappears', () => {
    // The CI checks the SHIPPED_IDS snapshot. If a unit id is removed,
    // its aliases must include the prior id.
    const snapshot = readSnapshotFile('shipped-ids.snapshot.json');
    const current = collectAllUnitIds(CONTENT_MODULES);
    const aliases = collectAllAliases(CONTENT_MODULES);
    for (const shipped of snapshot) {
      const reachable = current.includes(shipped) || aliases.includes(shipped);
      expect(reachable).toBe(true);
    }
  });

  it('Migration ID immutability: shipped migrations never modified', () => {
    const snapshot = readSnapshotFile('shipped-migrations.snapshot.json');
    for (const m of snapshot) {
      const live = MIGRATIONS[m.key].find(x => x.fromVersion === m.fromVersion);
      expect(live).toBeDefined();
      expect(live!.describe).toBe(m.describe);                  // exact match
      // Cannot easily compare forward functions; rely on snapshot of behavior
      const out = live!.forward(m.testInput);
      expect(out).toEqual(m.expectedOutput);
    }
  });
});
```

### 3.2 Snapshot files

Two append-only snapshot files:

- `src/storage/__tests__/snapshots/shipped-ids.snapshot.json` — every
  unit / achievement / morpheme id that has ever shipped
- `src/storage/__tests__/snapshots/shipped-migrations.snapshot.json` —
  every migration that has ever shipped, with a known input/output pair

These are updated on every release, **never** edited retroactively.
A PR that needs to retire an ID must add the id to the unit's `aliases`
array, not remove it from the snapshot.

### 3.3 What this catches

| Bug | Caught how |
|---|---|
| Renaming `Session.ci` to `currentIndex` without migration | round-trip test fails (loaded value differs from saved) |
| Adding a new field without default | property test on existing snapshots fails (missing field) |
| Modifying a shipped migration | shipped-migrations snapshot fails |
| Removing a unit without aliasing | shipped-ids snapshot fails |
| Catching parse errors and silently clearing | quarantine test fails (localStorage was cleared) |
| Forgetting to write `.backup` before overwriting | mid-session-backup test fails |

---

## 4. Integration tests

Per-route happy path. Each route has one test file:
`src/routes/__tests__/<route>.integration.test.tsx`.

Pattern:

```tsx
test('home: shows resume nudge when a session is in flight', async () => {
  // Seed localStorage with a partial session
  populate('evo-quest.v1.session', sampleActiveSession({ currentIndex: 3 }));

  // Render the route
  const { getByRole, getByText } = renderRoute('/');

  await waitFor(() => {
    expect(getByText(/Continue/i)).toBeInTheDocument();
    expect(getByText(/Round 4\/15/i)).toBeInTheDocument();
  });

  // Click continue → should navigate to /play/:sessionId
  fireEvent.click(getByRole('button', { name: /Continue/i }));
  expect(window.location.pathname).toMatch(/^\/play\//);
});
```

Routes covered:

- `/` — home with and without saved session
- `/play/:sessionId` — renders the active session correctly on mount
- `/journeys` — renders the journeys timeline + Embark panel
- `/journeys/:id` — renders a specific journey detail
- `/content` (all sub-tabs) — modules toggle, import validates,
  stats tree expands, format docs render schema
- `/notebook` — artifacts render
- `/garden` — graph renders with morphemes
- `/about` — static, just renders
- `/settings` — every section is reachable, settings save
- `/welcome` — onboarding flow walks 3 screens

---

## 5. Game-type tests

Each template kind has a `src/engine/templates/__tests__/<kind>.test.tsx`
covering:

- Renders given valid `data`
- Calls `onResult` with `correct: true` on a correct interaction
- Calls `onResult` with `correct: false` on a wrong interaction
- Snapshots its render to disk for visual regression
- Keyboard interaction works (Tab → Enter → expected result)
- Honors `prefers-reduced-motion`

Per-game-type a11y is verified at the integration layer with axe-core.

---

## 6. E2E tests (Playwright)

Five critical scenarios, run on every CI build.

### 6.1 First-run flow

```ts
test('first-run welcome → tutorial → first unlock', async ({ page }) => {
  await page.goto('/');
  // Should redirect to /welcome
  await expect(page).toHaveURL(/\/welcome/);
  await page.getByRole('button', { name: /Start/i }).click();
  // Tutorial journey begins
  await expect(page.getByText(/Question 1 of 5/)).toBeVisible();
  // Answer correctly
  await page.getByRole('button', { name: /amino acids/i }).click();
  await expect(page.getByText(/Locked In/)).toBeVisible();
  // Continue through all 5
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: /NEXT/i }).click();
    await page.getByRole('button').first().click();   // pick any answer
  }
  // End screen with at least one achievement
  await expect(page.getByText(/Achievement/)).toBeVisible();
});
```

### 6.2 Resume mid-question

```ts
test('refresh mid-Punnett restores exact state', async ({ page }) => {
  // Start a journey containing a punnett-builder question
  await embarkWithSeed(page, { kind: 'punnett-builder', /* ... */ });
  // Place 2 of 4 alleles into headers
  await dragAllele(page, 'P', 'top-left');
  await dragAllele(page, 'p', 'top-right');
  await page.reload();
  // After reload, alleles should still be in place
  await expect(page.getByTestId('header-tl')).toContainText('P');
  await expect(page.getByTestId('header-tr')).toContainText('p');
});
```

### 6.3 Import a known-good module

```ts
test('import flow validates and adds a custom module', async ({ page }) => {
  await page.goto('/content/import');
  const json = await fs.readFile('test/fixtures/sample-module.json', 'utf-8');
  await page.getByRole('textbox').fill(json);
  await page.getByRole('button', { name: /Validate/i }).click();
  await expect(page.getByText(/Valid module/)).toBeVisible();
  await page.getByRole('button', { name: /Add to library/i }).click();
  // Module now appears on /content/modules
  await page.goto('/content/modules');
  await expect(page.getByText(/Sample Module/)).toBeVisible();
});
```

### 6.4 Import a malformed module — recovery

```ts
test('import flow surfaces Zod errors with paths', async ({ page }) => {
  await page.goto('/content/import');
  const bad = JSON.stringify({ tree: 'not-an-array' });
  await page.getByRole('textbox').fill(bad);
  await page.getByRole('button', { name: /Validate/i }).click();
  await expect(page.getByText(/tree/i)).toBeVisible();
  await expect(page.getByText(/Expected array/i)).toBeVisible();
  // Add to library button should be disabled
  await expect(page.getByRole('button', { name: /Add to library/i })).toBeDisabled();
});
```

### 6.5 Hard reset

```ts
test('hard reset clears all data and routes to /welcome', async ({ page }) => {
  await populateState(page);
  await page.goto('/settings');
  await page.getByRole('button', { name: /Hard Reset/i }).click();
  await page.getByRole('textbox').fill('delete all my data');
  await page.getByRole('button', { name: /Confirm/i }).click();
  // Reloads to /welcome with empty state
  await expect(page).toHaveURL(/\/welcome/);
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys.filter(k => k.startsWith('evo-quest.v1'))).toEqual([]);
});
```

---

## 7. Visual regression

Playwright takes snapshots of key surfaces. Snapshots stored in
`tests/visual/__snapshots__/`. Per-platform (Linux + Darwin CI runners).

Surfaces:

- Home (locked state)
- Home (50% unlocked state)
- Home (100% unlocked state — full Wing aggregates)
- Each game type's briefing
- Each game type's prompt (just after briefing fades)
- Feedback panel (correct + wrong variants)
- Achievement unlock animation — first frame + last frame
- Journey card on journeys timeline
- Embark panel

Tolerance: 0.05 (5% pixel difference allowed for font subpixel
rendering).

---

## 8. A11y tests

`tests/a11y/all-routes.test.ts` walks every route and runs axe-core.

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/welcome', '/journeys', '/content', '/content/import',
  '/content/format', '/content/stats', '/content/modules', '/notebook',
  '/garden', '/about', '/settings'];

for (const route of routes) {
  test(`a11y: ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa-color-contrast'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```

Active-session routes (`/play/:sessionId`) are tested via the e2e
suite with pre-seeded state.

---

## 9. Performance tests

Lighthouse CI runs against the deployed PR preview.

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse
on: deployment_status

jobs:
  lhci:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @lhci/cli
      - run: lhci autorun --collect.url=${{ github.event.deployment_status.target_url }} --upload.target=temporary-public-storage
```

Targets per route:

| Route | Performance | A11y | Best Practices |
|---|---|---|---|
| `/` | ≥95 | ≥98 | ≥95 |
| `/play/:sessionId` (loaded with state) | ≥90 | ≥95 | ≥95 |
| `/journeys` | ≥95 | ≥98 | ≥95 |
| `/content/format` | ≥90 | ≥95 | ≥95 |
| `/garden` (the force-directed graph) | ≥80 | ≥95 | ≥95 |

A regression of ≥5 points against the prior main commit posts a
warning comment on the PR. ≥10 points blocks merge.

---

## 10. Pre-merge gate

A PR cannot merge unless:

- [ ] Unit + integration tests pass
- [ ] **Resume invariant tests pass** (the hard rule)
- [ ] E2E tests pass
- [ ] axe-core: zero violations across all routes
- [ ] Lighthouse: no >10-point regression
- [ ] Bundle size budget: first-route gzipped JS ≤ 200KB
- [ ] Typecheck passes
- [ ] Lint passes (Biome / ESLint)
- [ ] Content validation passes (`bun run validate-content`)
- [ ] If storage code touched: AGENTS.md checklist filled in PR
  description

GitHub branch protection rules enforce this.

---

## 11. Local dev testing

```bash
bun run test                          # all unit + integration (vitest)
bun run test:watch                    # vitest watch mode
bun run test:storage                  # just storage layer (fast)
bun run test:engine                   # just engine layer
bun run test:resume-invariant         # just the critical file
bun run test:e2e                      # playwright (headless)
bun run test:e2e:ui                   # playwright with UI
bun run test:a11y                     # axe across routes
bun run test:visual                   # visual regression
bun run test:perf                     # lighthouse local
bun run validate-content              # build-time content validation
```

Pre-commit hook (Husky):

```sh
bun run typecheck && bun run lint && bun run test:storage && bun run validate-content
```

The pre-commit suite is fast (<30s) and catches the most common
mistakes.

---

## 12. Test fixtures

`test/fixtures/`:

- `sample-module.json` — a valid `ContentModule` for import tests
- `sample-malformed.json` — multiple Zod errors for validation tests
- `sample-active-session.json` — a half-completed `Session` for resume tests
- `sample-completed-journey.json` — for journey detail tests
- `sample-corrupted-session.json` — bytes that don't parse, for
  quarantine tests
- `legacy-v1-storage.json` — a snapshot of v1-schema storage for
  migration tests

These fixtures are committed and version-controlled.

---

## 13. Continuous test improvement

After every released bug:

1. Write the test that would have caught it
2. Add to the relevant layer (usually integration or e2e)
3. Verify the test fails against the pre-fix commit (`git checkout
   HEAD~1`)
4. Confirm the test passes against the fix
5. Land both fix + test in the same PR

Bugs that escape testing become tests. The suite gets stronger over
time.

---

## 14. What we don't test

Honestly admitted gaps:

- **Cross-browser**: v1 tests Chromium only. Firefox + WebKit in v1.1.
- **Real devices**: CI runs in containers. Manual device testing
  pre-release.
- **Internationalization**: v1 is English-only. Localization tests in
  v2.
- **Network failures**: the app is local-first and works offline; we
  don't simulate flaky networks because there's no server-side
  dependency in v1.
- **Concurrent multi-tab editing**: we listen to storage events but
  don't aggressively test cross-tab conflict resolution. V1.x.

These gaps are documented in `docs/testing-gaps.md` (to be created at
scaffold time).
