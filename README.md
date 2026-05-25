# evo-quest

Understanding-growth biology study for high school students — vibrant
dark mode, speed-reveal mnemonics, topic-shaped achievements, and
robust local-first progress.

## Stack

- [TanStack Start](https://tanstack.com/start) + React 19 + TypeScript
- Tailwind CSS v4
- Zod + Zustand
- Cloudflare Workers (via Wrangler)
- **Bun** for install, dev, build, test, deploy

## Quick start

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---------|---------|
| `bun run dev` | Local dev server |
| `bun run build` | Production build |
| `bun run deploy` | Build + deploy to Cloudflare Workers |
| `bun run test` | Vitest |
| `bun run typecheck` | TypeScript check |
| `bun run validate-content` | Zod-validate bundled content modules |

## Deploy to Cloudflare

One-time setup:

```bash
bunx wrangler login
```

Then:

```bash
bun run deploy
```

Production URL: `https://evo-quest.<your-subdomain>.workers.dev`

For CI, set GitHub secrets `CF_API_TOKEN` and `CF_ACCOUNT_ID`.

## Design docs

All design lives in [`plan/design/`](plan/design/) and
[`plan/game-types/`](plan/game-types/). Start at
[`plan/design/index.md`](plan/design/index.md).

## Progress storage

All user progress is stored in the browser (`localStorage` under
`evo-quest.v1.*`). Nothing is sent to a server. Export/import via
Settings → Data.

See [`AGENTS.md`](AGENTS.md) for storage invariants.
