# Deployment

evo-quest deploys to **Cloudflare Workers** via **Wrangler**, with
**GitHub Actions** automating CI and preview deploys. The deployment
account is `kenlane33` (already authenticated for `gh`).

This doc covers the full operations story: Wrangler config, environment
strategy, secrets, CI gates, preview-per-PR, custom domains, and what
to do when things break.

---

## 1. Stack summary

| Layer | Tool | Why |
|---|---|---|
| Build | Vite (via TanStack Start) | Fast HMR, modern bundle |
| SSR / edge runtime | TanStack Start's Nitro-style adapter | First-class Cloudflare Workers support |
| Hosting | Cloudflare Workers (Modules format) | Global edge, free tier generous |
| Static assets | Workers Assets binding | Co-located with the worker |
| Deploy CLI | Wrangler (latest) | Official Cloudflare tool |
| CI | GitHub Actions | Free, integrates with `gh` |
| Repository | github.com/kenlane33/evo-quest | Public (configurable) |

---

## 2. Account and credentials

### 2.1 GitHub

- Org / user: `kenlane33`
- Repo: `kenlane33/evo-quest`
- Visibility: public (per default; can change to private)
- `gh` CLI authentication: already configured (verified via
  `gh auth status` showing `kenlane33` with `repo`, `admin:public_key`,
  `gist`, `read:org` scopes)

### 2.2 Cloudflare

- Account: `kenlane33`'s Cloudflare account
- Required permissions for the deploy API token:
  - `Workers Scripts: Edit`
  - `Workers KV: Edit` (not needed in v1 but reserved for v1.x)
  - `Account: Read` (for `whoami`)
- Wrangler login: `bunx wrangler login` (opens browser; one-time)
  OR an API token in CI

### 2.3 Initial setup steps

Before first deploy, manual steps the user runs:

```bash
# Check current state
gh auth status                              # confirm kenlane33
bun add -d wrangler                           # already in devDependencies
bunx wrangler login                         # interactive
bunx wrangler whoami                        # confirm account

# Then push the initial commit
gh repo create kenlane33/evo-quest --public --source=. --remote=origin --push
```

For CI (GitHub Actions), create a Cloudflare API token with the
permissions above and add it as a repository secret named
`CF_API_TOKEN`. Also add `CF_ACCOUNT_ID` (visible in the Cloudflare
dashboard).

---

## 3. Wrangler config

`wrangler.toml` at repo root:

```toml
name = "evo-quest"
main = ".output/server/index.mjs"
compatibility_date = "2026-05-01"
compatibility_flags = ["nodejs_compat"]

# Static assets binding — Workers Sites's successor
[assets]
directory = ".output/public"
binding = "ASSETS"

# Observability (free tier)
[observability]
enabled = true
head_sampling_rate = 1.0          # 100% in v1 since traffic is low

# Production environment (default)
# Routes / custom domain added later

# Preview / staging
[env.preview]
name = "evo-quest-preview"

# PR-specific environments are created dynamically by the CI action,
# using the format: name = "evo-quest-pr-<number>"
```

Notes:

- `compatibility_date` is set to the deploy date; bumped quarterly
- `compatibility_flags = ["nodejs_compat"]` enables Node.js APIs that
  some libraries assume (debounce, ulid, etc.)
- The `.output/` paths come from Nitro's output structure (TanStack
  Start's Cloudflare preset uses it)
- The exact `[assets]` binding shape may vary slightly with Wrangler
  versions — confirm at scaffold time and pin Wrangler version in
  `package.json` to avoid drift

---

## 4. Environments

Three environments managed by Wrangler:

| Environment | Worker name | URL | Purpose |
|---|---|---|---|
| `production` | `evo-quest` | `evo-quest.kenlane33.workers.dev` | Live |
| `preview` | `evo-quest-preview` | `evo-quest-preview.kenlane33.workers.dev` | Persistent staging |
| `pr-<n>` | `evo-quest-pr-<n>` | `evo-quest-pr-<n>.kenlane33.workers.dev` | Per-PR preview |

### 4.1 Production

Deployed automatically on push to `main` via GitHub Actions. Manual
deploy if needed:

```bash
bun run build
bunx wrangler deploy
```

### 4.2 Preview (persistent staging)

Deployed automatically on push to `staging` branch (if used). Manual:

```bash
bunx wrangler deploy --env preview
```

### 4.3 PR previews

Created on PR open / push; destroyed on PR close. See §6 below.

---

## 5. Edge cache strategy

evo-quest is **local-first** — all per-user state lives in the
browser. The Worker is pure HTML/JS rendering. This makes the edge
cache strategy straightforward:

| Asset type | Cache-Control |
|---|---|
| Fingerprinted JS/CSS (`assets/index.[hash].js`) | `public, max-age=31536000, immutable` |
| Fonts (self-hosted in v1.1+) | `public, max-age=31536000, immutable` |
| SSR'd HTML | `public, max-age=0, s-maxage=300, stale-while-revalidate=60` |
| `/robots.txt`, `/sitemap.xml`, `/favicon.ico` | `public, max-age=86400` |

Why `s-maxage=300` on HTML:

- HTML is identical per route (no per-user data — that's hydrated
  client-side from localStorage)
- 5 minutes of edge cache means even a small traffic burst is served
  from Cloudflare's edge, not from the origin Worker
- `stale-while-revalidate` lets the cache serve slightly-stale content
  while refreshing in the background — students never wait

Cache headers are set in the Worker handler (`src/server/handler.ts`)
based on request URL pattern.

### 5.1 No per-user cache leakage

The Worker reads zero user data. There's nothing to leak. We log this
in the About / Privacy page as a guarantee.

---

## 6. GitHub Actions workflows

### 6.1 `.github/workflows/ci.yml`

Runs on every push and PR. Quality gates.

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run typecheck
      - run: bun run validate-content
      - run: bun run test
      - run: bun run build
```

### 6.2 `.github/workflows/deploy-production.yml`

Runs on push to `main`. Deploys to production after CI passes.

```yaml
name: Deploy Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    needs: []
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: deploy
```

### 6.3 `.github/workflows/preview-pr.yml`

Per-PR preview deploys.

```yaml
name: Preview
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run build
      - name: Deploy preview
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: deploy --name "evo-quest-pr-${{ github.event.pull_request.number }}"
      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            const url = `https://evo-quest-pr-${context.issue.number}.kenlane33.workers.dev`;
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `🚀 Preview: ${url}`
            });
```

### 6.4 `.github/workflows/cleanup-pr.yml`

Destroys the preview when PR closes.

```yaml
name: Cleanup PR Preview
on:
  pull_request:
    types: [closed]

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - name: Delete preview worker
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: delete --name "evo-quest-pr-${{ github.event.pull_request.number }}"
```

---

## 7. Quality gates

CI blocks merge if:

- `bun run typecheck` fails
- `bun run lint` fails (Biome / ESLint)
- `bun run test` fails (unit + integration via Vitest)
- `bun run validate-content` fails (Zod-validates every content module)
- `bun run build` fails
- `bun test:a11y` reports axe violations
- The resume invariant tests fail (see [`testing.md`](./testing.md) §3)
- Bundle size budget is exceeded (>200 KB gzipped first-route JS)

The bundle size check uses a custom script:

```ts
// scripts/check-bundle-size.ts
import { statSync, readdirSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

const ASSETS = '.output/public/assets';
const FIRST_ROUTE_BUDGET = 200 * 1024;

// Identify the first-route entry chunk (by manifest)
// Sum its size + the size of its statically imported chunks
// Fail if gzipped > FIRST_ROUTE_BUDGET
```

---

## 8. Secrets

### 8.1 What's in `wrangler.toml`

Public configuration only — no secrets. The file is committed.

### 8.2 What's in GitHub Secrets

| Secret | Purpose |
|---|---|
| `CF_API_TOKEN` | Wrangler API token for deploys |
| `CF_ACCOUNT_ID` | Cloudflare account id |
| (future) | None in v1 |

### 8.3 What's NOT in either

Since v1 has no backend API:

- No database credentials
- No third-party API keys
- No analytics tokens

If v2 adds Cloud Sync (D1 + R2), secrets would live in
`bunx wrangler secret put` (encrypted, never in source).

---

## 9. Custom domain

V1 ships on the `*.kenlane33.workers.dev` subdomain. A custom domain
(e.g., `evoquest.com`) is post-v1 polish — purely cosmetic.

Steps when adding:

1. Buy the domain
2. Add to Cloudflare DNS (free)
3. In `wrangler.toml`:

   ```toml
   routes = [
     { pattern = "evoquest.com/*", custom_domain = true },
     { pattern = "www.evoquest.com/*", custom_domain = true },
   ]
   ```

4. Redeploy

The Worker keeps serving as before; just two more hostnames.

---

## 10. Observability

### 10.1 Cloudflare's built-in

`[observability]` enabled in `wrangler.toml`. Provides:

- Real-time invocation counts
- Error rates
- p50/p99 latency
- CPU time per request

Visible in Cloudflare dashboard. Free tier sufficient for v1 traffic.

### 10.2 Application-level logging

The Worker's request handler logs:

- Path + method
- Response status
- SSR render time (ms)
- Cache hit/miss

No PII. No user identifiers. Logs are visible in `wrangler tail` and in
the Cloudflare dashboard's Logs section.

### 10.3 Anonymous crash reports (opt-in)

If a user opts in (Settings → Privacy):

- Uncaught errors POST to `/api/crash-report` on the Worker
- Payload: `{ stack, route, schemaVersion, appVersion, ts }`
- No user content, no IP storage
- Server logs to console (visible in `wrangler tail`); v1.x adds a
  simple D1 table for persistence

Default OFF. The opt-in is checked in the client before any POST.

---

## 11. Rollbacks

### 11.1 Wrangler versioning

Every deploy creates a versioned Worker. To roll back:

```bash
bunx wrangler deployments list
bunx wrangler rollback <deployment-id>
```

This swaps production traffic back to the prior version within
seconds, globally.

### 11.2 GitHub revert

For a more durable rollback:

```bash
git revert <bad-commit>
git push origin main
# CI redeploys automatically
```

### 11.3 Database / storage migrations

V1 has no server-side storage. Rolling back a client-side schema
change is more subtle:

- If the new app version added a migration (v2), and a user's
  localStorage was migrated to v2, then rolling back the app to v1 will
  trigger the future-version preservation path
  ([`storage.md`](./storage.md) §10) — preserved + warning.
- This is by design. Rollbacks never wipe user data.

### 11.4 The "broken main" emergency

If a CI miss lands broken code on main:

```bash
git revert HEAD                              # revert the bad commit
git push                                     # auto-redeploy
bunx wrangler rollback <last-good-id>        # immediate traffic switch while CI runs
```

The Wrangler rollback is the fast path; the git revert is the durable
fix.

---

## 12. Performance monitoring

### 12.1 Per-deploy baseline

CI runs a Lighthouse pass against the preview URL. Scores are posted
to the PR. Targets:

- Performance: ≥95
- Accessibility: ≥95
- Best Practices: ≥95
- SEO: ≥90

A drop ≥5 points in any category from the previous main commit triggers
a comment but doesn't block merge (could be flaky network).

### 12.2 Real-User Monitoring (post-v1)

A future RUM endpoint would aggregate (anonymous, sampled) FCP, LCP,
INP, CLS from real users. Out of scope for v1.

---

## 13. Cost

Cloudflare Workers free tier:

- 100,000 requests / day
- 10ms CPU time per request
- 30 GB egress / month

Realistic projections for v1:

- Active student visits ≤ 1,000 / day (generous)
- Each visit: ~30 SSR requests + ~50 static asset requests
- Total: ~80,000 requests / day → fits free tier comfortably

If we exceed: Workers Paid is $5/month for 10M requests. Still cheap.

---

## 14. The "first deploy" runbook

The very first time the app is deployed, the operator runs:

```bash
# 0. Preconditions: gh authed as kenlane33, wrangler installed
gh auth status
bunx wrangler whoami

# 1. Build
bun install --frozen-lockfile
bun run build

# 2. Smoke test locally
bunx wrangler dev                            # opens localhost:8787

# 3. Push to a fresh repo
gh repo create kenlane33/evo-quest --public --source=. --remote=origin --push

# 4. Add CI secrets
gh secret set CF_API_TOKEN --body "<token>"
gh secret set CF_ACCOUNT_ID --body "<id>"

# 5. First deploy
bunx wrangler deploy

# 6. Visit https://evo-quest.kenlane33.workers.dev — should load
# 7. The next push to main will trigger CI-driven deploy
```

---

## 15. Decommission / data takeout

If the app is sunset:

1. The Worker is left running indefinitely (free tier; no harm)
2. A banner is added: "*This site is no longer being updated. Your data
   remains exportable via Settings → Data → Export All.*"
3. The Worker can be deleted via `bunx wrangler delete` after a
   transition period

Since user data is local-first, decommissioning the server doesn't
delete anyone's progress. They can keep playing offline (after
service-worker cache, v1.x) or export and walk away.
