# USPSA Trainer

A practical-shooting training app that turns drill times into a per-skill mastery estimate, then plans the session you should actually run next.

Live: **https://uspsa.imprevista.com**

## What it does

You run drills, record the times, and the app estimates how strong you are on each underlying skill (draw, transitions, reloads, movement, single-hand, stage craft, …) by comparing your runs against published benchmarks for your classification and division. The recommendation engine finds your weakest skills, and the session planner turns those into a timed, structured practice plan that fits the constraints you have today — dry fire vs. live fire, minutes available, whether you can move, and how much distance you've got.

The decision surface is the session plan: it tells you what to shoot today and why, rather than just showing you your history.

### Screens

| Route | Purpose |
| --- | --- |
| `/` | Dashboard — current skill picture and entry point |
| `/drills` `/drills/[id]` | Drill library with per-drill detail and benchmarks |
| `/session` `/session/plan` `/session/active` | Build a session plan from your constraints, then run it rep by rep |
| `/history` `/history/[id]` | Past sessions and individual runs |
| `/graph` | Mastery over time (skill estimates replayed at weekly intervals) |
| `/settings` | Profile: classification, target classification, division, equipment, optic |
| `/api/version` | Returns the git SHA of the running image — used by the deploy health check |

### Core logic (`src/lib/`)

- `skillEstimation.ts` — the model. Computes per-skill mastery + confidence from run history against the seeded benchmarks.
- `recommendations.ts` — given skill estimates and session constraints, builds a prioritized drill list (weakness / maintenance / assessment).
- `sessionPlanner.ts` — turns recommendations into a structured, timed plan with rep counts.
- `assessment.ts` — cold-start drill batteries (dry fire and live fire) that seed initial skill estimates for a new user.
- `trends.ts` — replays the estimation engine at weekly intervals to produce the mastery timeline.
- `practiscoreImport.ts` — parses PractiScore CSV/text match results into sessions and runs.
- `ble.ts` / `useBle.ts` — Web Bluetooth integration with an **AMG Lab Commander** shot timer over the Nordic UART Service; reads total time, first-shot time, and splits straight off the timer.
- `store.ts` — persistence.

### Data

Everything is **client-side**: profile, sessions, and runs live in the browser's `localStorage`, and the drill / skill / benchmark seed data is compiled in from `src/data/seed.ts` (sourced from Ben Stoeger & Joel Park, *Practical Shooting Training*; *Skills and Drills Reloaded*; *Dry Fire Reloaded*). There is no database, no backend, and no auth — the only server route is `/api/version`. `store.ts` is written as a Stage-1 MVP with a Postgres swap in mind; that swap has not happened.

BLE shot-timer support needs a Web Bluetooth–capable browser (Chrome/Edge on desktop or Android; not iOS Safari).

## Local development

```bash
npm ci
npm run dev     # http://localhost:3000
npm run build   # production build — run this before pushing
npm run lint
```

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4.

## Deploy — Coolify / GHCR (not Vercel)

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) runs:

1. **Build gate** — `npm ci && npx next build`. Type and build errors fail here, fast, instead of surfacing as a slow Docker failure.
2. **Image build** — pushes `ghcr.io/charlesrogers/uspsa-trainer:latest` and `:<sha>`, baking the commit SHA into the image as `APP_VERSION` (`--build-arg GIT_SHA`).
3. **Deploy** — triggers the Coolify app via `vars.COOLIFY_UUID` (a repo variable, so a recreated app only needs the variable updated — the UUID is never hardcoded).
4. **Verify** — polls `https://uspsa.imprevista.com/api/version` 20× at 10s intervals until it reports the SHA that was just pushed. A plain 200 proves nothing: a Next.js error boundary returns 200 while every request errors.
5. **On failure** — dumps the last 100 lines of container logs from the Coolify API into the run, and posts a Discord alert.

Infra:

| | |
| --- | --- |
| Coolify app | `uspsa-trainer-v2`, build pack `dockerimage` (pulls from GHCR; never builds on the server) |
| Memory limit | 1G — the host has 16GB, no swap, and 50+ containers, and an unbounded container has OOM-killed its neighbours before |
| Monitoring | Uptime Kuma, Tier 3: 120s interval, dashboard-only, no alerting (internal tool) — https://status.imprevista.com |

Required GitHub config:

- Variable `COOLIFY_UUID` — the Coolify application UUID.
- Secret `COOLIFY_TOKEN` — Coolify API token.
- Secret `DISCORD_WEBHOOK` — **not currently set.** Until it is, a failed deploy still fails the Actions run and logs a warning, but nobody gets pinged.
