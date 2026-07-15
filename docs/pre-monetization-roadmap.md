# USPSA Trainer — Pre-Monetization Product Roadmap

**Audience:** An executing agent (Opus) working WITHOUT further guidance. Every decision that could be ambiguous is decided in this document. If something is genuinely not covered here, the rule is: STOP and ask Charles — do not improvise domain behavior.

**Scope:** ONLY the product improvements required before we can charge money. No Stripe, no marketing site, no growth features. The end state is defined by the Ready-to-Monetize Checklist at the bottom. When every box is checked, this roadmap is complete.

**Repo:** `/Users/charlesrogers/Documents/uspsa_trainer/uspsa-trainer` (Next.js 16, React 19, Tailwind v4, TypeScript). Source docs live one level up: `uspsa-training-app-spec.md` (the product spec), `practical-shooting-training.txt` (Stoeger/Park source text), `uspsa-trainer/docs/KNOWLEDGE_GRAPH_SPEC.md`.

---

## Part 0 — Operating Rules for the Executing Agent

These are not suggestions. Violating them is how this project fails.

1. **Read first, in this order, before writing any code:** `uspsa-training-app-spec.md`, `docs/KNOWLEDGE_GRAPH_SPEC.md`, then every file in `src/lib/` and `src/data/seed.ts` (skim seed.ts — it's 1,806 lines; read the interfaces at the top and sample each array).
2. **Execute milestones strictly in order** (M0 → M8). Do not start a milestone until the previous one's acceptance criteria all pass. Do not interleave.
3. **One milestone = one branch = one PR.** Commit messages describe the change. Run `npx next build` AND `npx vitest run` before every push. A milestone is not done if the build or tests fail.
4. **Domain mechanics gate:** Anywhere this document says **⛔ ASK CHARLES**, stop and ask him the listed question in plain language before writing that code. His answer becomes a spec comment at the top of the relevant file. Never research-and-assume shooting domain behavior (par times, drill procedures, scoring rules, classification math). This rule comes from his global CLAUDE.md and has caused failures before.
5. **Never change benchmark numbers, drill definitions, encompassing weights, or skill-graph structure in `src/data/seed.ts`** except where a milestone explicitly says to, and then only with Charles's sign-off on the specific numbers. The corpus is the product's credibility.
6. **`src/data/seed.ts` is over 500 lines: surgical edits only.** Never rewrite the file.
7. **Do not add dependencies** beyond the approved list in each milestone. If you believe you need something else, ask first. Specifically banned without approval: state-management libraries (Redux/Zustand/Jotai), ORMs other than what M2 specifies, UI kits, chart libraries (the app has a hand-rolled `TrendChart.tsx` — extend it).
8. **Do not redesign the UI.** Extend the existing visual style in place. Layout/UX changes are allowed only where a milestone calls for them, and they follow the house design language in Charles's global CLAUDE.md (Geist fonts, OKLch tokens, `rounded-xl` cards, `text-[13px]` body).
9. **Preserve local-first behavior forever.** The app must remain 100% functional with no network. Ranges have no signal. Any feature that requires connectivity at the range is a bug.
10. **Every algorithm change ships with tests.** Skill estimation, benchmarks, and planning logic are the product's "financial logic" equivalent — the global rule applies: no untested threshold logic.
11. If a task fails twice the same way, stop and write up what's failing and 2–3 alternatives for Charles. Do not attempt a third identical try.

**Definitions used throughout:**
- "Run" = one scored attempt at a drill (`SessionRun` in `src/lib/store.ts`).
- "Cold" = first attempt of the day on that drill, before warmup (`isCold`).
- "Mastery" = % of the target-classification benchmark time, accuracy-adjusted (see `src/lib/skillEstimation.ts:75`).
- "Corpus" = the seed data: sources, skills, drills, drill-skill maps, benchmarks.

---

## Current State (verified against code, July 2026)

**What exists and works (prototype quality):**
- Drill corpus: ~40 drills, skill taxonomy with parent/child, drill→skill maps with encompassing weights, live-fire + dry-fire benchmarks per classification per distance (`src/data/seed.ts`).
- Skill estimation engine: hit-factor-weighted signals, recency decay (0.97^days), cold bonus (1.2×), trend detection (`src/lib/skillEstimation.ts`).
- Cold-start assessment batteries for dry/live fire (`src/lib/assessment.ts`).
- Recommendation engine + constrained session planner (`src/lib/recommendations.ts`, `src/lib/sessionPlanner.ts`).
- AMG Lab Commander BLE via Web Bluetooth, protocol from the DenisZhadan reverse-engineering (`src/lib/ble.ts`).
- PractiScore import (`src/lib/practiscoreImport.ts`).
- Pages: dashboard, drills, drill detail, session plan, active session, history, skill graph, settings.

**What does not exist (the gaps this roadmap closes):**
- No git repo. No tests. No CI.
- All data in `localStorage` — one cleared browser cache destroys a user's entire training history. No export. No accounts. No sync. No second device.
- No onboarding — a new user lands on a dashboard with zero explanation.
- Not a PWA — no manifest, no service worker, no offline guarantee, no install, screen sleeps mid-drill.
- One timer supported (AMG). No Garmin Xero C1 (the market's dominant timer). No in-app dry-fire par timer.
- Recommendations state conclusions without evidence — users can't see WHY a drill was prescribed, so they won't trust it enough to pay.
- No multi-session training plan, no staleness/decay surfacing, no plateau detection.
- PractiScore import exists but has no tests and doesn't close the loop into recommendations.
- Corpus never audited against the source book.

---

## Milestone M0 — Engineering Baseline

**Goal:** The codebase becomes safe to change. Nothing user-visible.
**Estimated effort:** 2–3 days.
**Approved new dev-dependencies:** `vitest`, `@vitest/coverage-v8`, `fake-indexeddb` (for later milestones' tests).

### Tasks

**M0.1 — Version control.**
- `git init` in `uspsa-trainer/`, sensible `.gitignore` (node_modules, .next, .env*, tsconfig.tsbuildinfo), initial commit of current state BEFORE any other change.
- Create private GitHub repo `uspsa-trainer` under Charles's account (`gh repo create`), push.
- Copy `uspsa-training-app-spec.md` and this roadmap into `docs/` so the repo is self-contained.

**M0.2 — Test harness + characterization tests.** Write tests that pin CURRENT behavior (even where behavior looks questionable — do not "fix" anything in M0):
- `convertTime()` in `src/lib/ble.ts` — table-driven byte-pair cases including the signed-byte edge cases (b2 = 0, b2 = 128, b2 = 255).
- `skillEstimation.ts`: `collectSignals` accuracy multiplier (live: points-down path incl. pointsDown=0 and pointsDown=maxPoints; dry: callPct path incl. 0 and 100), benchmark distance fallback, 150% cap, cold bonus, parent-skill rollup when the parent has no direct signals.
- `store.ts`: `computeClassificationPct` (returns null when no benchmark), `getBestTimeForDrill`.
- `practiscoreImport.ts`: parse at least one synthetic fixture file covering the format branches the parser handles (read the parser to learn the expected format; construct fixtures from its own logic).
- Seed-data integrity test (this one is load-bearing forever): every `drillSkillMaps.drillId` exists in `drills`; every `skillId` exists in `skills`; every benchmark's `drillId` exists; every `skills.parentId` refers to a real skill with no cycles; every drill referenced by `assessment.ts` batteries exists AND has a 7-yard benchmark for every classification (C, B, A, M, GM) in its fire mode — this test failing means the assessment flow dead-ends for some user class.
- Target: ≥80% line coverage on `src/lib/` (excluding `ble.ts` runtime I/O and `useBle.ts`).

**M0.3 — CI.** GitHub Actions workflow on push/PR: install (pnpm — the repo has `pnpm-lock.yaml`; remove `package-lock.json` to end the dual-lockfile ambiguity), `lint`, `tsc --noEmit`, `vitest run`, `next build`. Per Charles's infra rules, the workflow must have an `if: failure()` Discord-webhook alert step once the `DISCORD_WEBHOOK` secret exists — add the step guarded so it skips when the secret is absent, and note in the PR that Charles needs to add the secret.

### Acceptance criteria
- [ ] `git log` shows initial-state commit distinct from changes; repo on GitHub, private.
- [ ] `npx vitest run` green locally and in CI; coverage report ≥80% on `src/lib/` (stated exclusions allowed).
- [ ] Seed integrity test passes (if it fails, list the broken references in the PR and ⛔ ASK CHARLES before editing seed.ts).
- [ ] CI green on the PR.

---

## Milestone M1 — Data Durability

**Goal:** A user can never lose training data short of deliberately deleting it. This is table stakes before anyone pays.
**Estimated effort:** 1 week.
**Approved dependencies:** `idb` (thin IndexedDB promise wrapper). Nothing else.

### Tasks

**M1.1 — Storage layer extraction.** Create `src/lib/storage/` with an interface that mirrors the current store API (`getSessions`, `addRun`, `getRuns`, `getProfile`, …) but is **async**. Implement it on IndexedDB via `idb` with object stores: `profile`, `sessions`, `runs`, `plans`, `meta`. Then refactor callers to the async API. Rules:
- Schema version lives in `meta`; write a `migrate(fromVersion)` scaffold now (v1 = initial).
- One-time migration on first load: if `localStorage` keys (`uspsa_profile`, `uspsa_sessions`, `uspsa_runs`, `uspsa_session_plan`) exist and IndexedDB is empty, copy them in, verify counts match, then leave the localStorage copies in place renamed with a `_migrated_` prefix (belt-and-suspenders — do NOT delete them).
- All writes go through one choke-point function that catches `QuotaExceededError` and surfaces a visible banner ("Storage full — export your data") rather than silently dropping writes.
- This refactor touches many components. Do it mechanically, one page at a time, building after each page. Loading states: pages show their existing empty-state UI until data resolves; do not add spinners everywhere.

**M1.2 — Export / Import.** In Settings:
- "Export backup" → downloads `uspsa-trainer-backup-YYYY-MM-DD.json` containing schema version, profile, sessions, runs, plans, and app version. Pretty-printed.
- "Import backup" → file picker; validates schema version and referential integrity (every run's `sessionId` exists) BEFORE writing anything; import strategy is **merge by id** (existing ids win, new ids are added) — never wholesale replace; shows a summary ("Imported 214 runs, 31 sessions, skipped 12 duplicates") and requires a confirm tap before committing.
- Tests: round-trip export→import is lossless; corrupt/truncated JSON is rejected with a readable error and zero writes.

**M1.3 — Input validation at run entry.** Central `validateRun(run): string[]` used by both manual entry and BLE capture:
- `totalTime` in (0.3, 600) seconds; splits all > 0.05s and monotonic-consistent (sum of first shot + splits ≈ totalTime within 0.05s when all three are present); `pointsDown` in [0, roundCount×5] integers; `dryFireCallPct` in [0, 100]; `distanceYards` in [1, 100].
- Violations block save with a specific message ("Total time 0.12s is below the 0.3s minimum — mis-triggered timer?") and offer "save anyway, marked invalid" which stores the run with `isValid:false`.
- Tests: every boundary above, both sides.

### Acceptance criteria
- [ ] Kill and reload the app with devtools "clear site data" on localStorage only → all data still present (it lives in IndexedDB).
- [ ] Export → clear ALL site data → import → dashboard, history, and skill estimates are identical (verify skill estimates by snapshotting `computeAllSkillEstimates()` output before/after in a test).
- [ ] Legacy-user migration test passes using `fake-indexeddb` + seeded localStorage fixtures.
- [ ] All M0 tests still green (the estimation engine's inputs are now async — adapt test plumbing, not assertions).

---

## Milestone M2 — Accounts & Cloud Sync

**Goal:** Data survives device loss; a user can move phone → tablet. Accounts are the substrate monetization will attach to later (no payment code in this milestone).
**Estimated effort:** 2–3 weeks. This is the riskiest milestone — sync bugs eat user data. Go slow, test hard.
**Approved dependencies:** `@supabase/supabase-js`, `@supabase/ssr`.
**Infrastructure:** Self-hosted Supabase per Charles's global CLAUDE.md (API `http://db.imprevista.com`; keys are in that file; migrations via `ssh root@95.216.205.160 "docker exec -i supabase-db psql -U postgres -d postgres" < migration.sql`). Use a dedicated schema `uspsa`. Keys go in Coolify/`.env.local` env vars, NEVER in git. ⛔ ASK CHARLES before creating anything on the server that could cost money or affect other apps' capacity.

### Design decisions (already made — do not revisit)

- **Local-first, server-mirror.** IndexedDB remains the source of truth for the UI. Sync is a background mirror. The app never blocks on network.
- **Runs and sessions are append-only + field-patchable.** Conflict rule: per-row `updated_at` (server clock on upsert), **last-write-wins**. This is acceptable because a single user editing the same run on two devices simultaneously is not a real scenario; do not build CRDTs or operational transforms.
- **Deletes are soft** (`deleted_at` timestamp) so they propagate through sync.
- **Anonymous-first.** The app works forever without an account. "Create account to back up your data" is offered, never forced (forcing it happens at monetization time, not now). On sign-up, all local data uploads under the new user id.
- **IDs:** keep client-generated UUIDs (the app already uses `uuid`) as primary keys everywhere. No id remapping, ever.

### Tasks

**M2.1 — Schema + RLS.** Migration file creating in schema `uspsa`: `profiles` (user_id PK → auth.users), `sessions`, `runs`, `plans` — columns mirror the TypeScript interfaces in `src/lib/store.ts` plus `user_id`, `updated_at`, `deleted_at`. Snake_case columns; write a single `toDb/fromDb` mapper module with tests. RLS on every table: `user_id = auth.uid()` for select/insert/update; no deletes (soft only). Corpus tables (drills/benchmarks) stay client-side in seed.ts — do NOT move them to the server in this milestone.

**M2.2 — Auth.** Email magic-link (Supabase built-in) only — no OAuth in this milestone (Google OAuth needs console setup; defer). Screens: sign up / sign in / signed-in state in Settings showing email + "sync: up to date / N pending / offline". No password flows.

**M2.3 — Sync engine** (`src/lib/sync.ts`):
- Outbox pattern: every local write also appends `{table, id, updated_at}` to an `outbox` store. A sync cycle pushes outbox rows (upsert to Supabase), then pulls rows where server `updated_at` > last-pull watermark, merging into IndexedDB (LWW per row).
- Triggers: app start, network regain (`online` event), after session end, manual "Sync now" button. NOT on every write (battery).
- Failure behavior: outbox persists across restarts; sync errors are logged to console and shown as a small non-blocking indicator, never a modal.
- Tests (this is where the bugs live — be exhaustive): fresh-device pull rebuilds identical local state; two-device LWW converges; offline queue survives restart; partial-push failure retries idempotently (upserts must be idempotent by PK); soft delete propagates; clock skew (client clock 1hr wrong) cannot resurrect deleted rows (always trust server `updated_at` — set it with a DB trigger `now()`, never from the client).

**M2.4 — Account upgrade path.** Local anonymous data + fresh sign-in → everything uploads; sign in on device that has BOTH local anonymous data AND an existing account with server data → merge by id (no data loss, duplicates impossible because UUIDs). Test both.

### Acceptance criteria
- [ ] Airplane-mode session capture → land, reconnect → data appears in Supabase (verify with a `psql` query, paste output in PR).
- [ ] Sign in on a second browser profile → full history and identical skill estimates appear.
- [ ] RLS verified: with user A's JWT, selecting user B's runs returns zero rows (write this as an automated test against the real dev instance, using two test users).
- [ ] Sync test suite (M2.3 list) green.
- [ ] Zero secrets in git history (`git log -p | grep -iE 'service_role|anon.*eyJ'` is clean).

---

## Milestone M3 — Onboarding & First-Run Experience

**Goal:** A stranger goes from "installed" to "I can see my weaknesses" in one session, unaided. Today they land on an empty dashboard.
**Estimated effort:** 1 week.

### Tasks

**M3.1 — Welcome flow** (new route `src/app/onboarding/`, triggered when profile has no `displayName` and no runs):
1. "What do you shoot?" → division picker (use the division list already in Settings), optic (iron/red dot).
2. "Where are you now?" → current classification (C default, U/unclassified option) — plus optional classifier percentage number entry.
3. "Where are you headed?" → target classification (default: one above current).
4. "How will you train?" → dry fire at home / live fire at range / both → sets default fire mode.
5. Lands on the dashboard which now shows ONE clear call to action: "Take your baseline assessment (~20 min dry fire / ~30 min live fire)".
- ⛔ ASK CHARLES: for an Unclassified shooter, which target classification should benchmarks default to, and should the app suggest one from their baseline results? Get exact behavior.

**M3.2 — Baseline assessment flow.** `src/lib/assessment.ts` already defines the batteries; build the guided UX: a stepper that walks drill-by-drill (setup instructions, rep capture, next), shows progress ("3 of 6 drills"), tolerates partial completion (resume later from dashboard), and on completion routes to a **results reveal**: skill category bars + "your 3 biggest gaps vs [target] class" with the specific numbers ("Draw: your 1.9s vs B-class 1.4s at 7yd"). This reveal is the product's first-impression moment — spend UI effort here.

**M3.3 — Empty states with next actions.** Every page (history, graph, drills-progress views) gets an empty state that says what to do, not just "no data". Dashboard pre-assessment shows the assessment card; post-assessment shows "today's recommendation" (from the existing engine).

**M3.4 — Sample-data mode.** "Explore with sample data" link on the welcome flow loads a clearly-labeled demo dataset (generate a realistic 8-week B-class training history as a fixture — times drawn from seed benchmarks ± noise, improving trend) so a prospect can see what six weeks of use looks like before doing a single drill. A persistent amber banner "Sample data — clear to start training" with a one-tap clear. Sample data must never sync to the server (guard in the sync engine: a `meta.sampleMode` flag suppresses the outbox).

### Acceptance criteria
- [ ] Fresh profile (cleared site data) → welcome flow → complete a simulated dry-fire baseline via manual entry → results reveal renders correct gap math against seed benchmarks (assert in a test using a scripted set of entry times).
- [ ] Abandoning the baseline halfway and reopening the app resumes at the right drill.
- [ ] Sample mode: loads, banner shows, sync suppressed (test), clears completely.
- [ ] Charles has personally run the onboarding on his phone and approved it (visual work — his sign-off is the gate, per his global rules on visual verification).

---

## Milestone M4 — Range-Mode Hardening (PWA + Session UX)

**Goal:** The app is reliable in the hand of a shooter at an outdoor range: no signal, bright sun, gloves, timer beeping. This is where "prototype" becomes "product".
**Estimated effort:** 1.5 weeks.
**Approved dependencies:** none new (Next.js PWA via hand-rolled manifest + service worker or `serwist` — prefer `serwist` if hand-rolling fights Next 16; ask via PR note, not a blocker).

### Tasks

**M4.1 — PWA.** `manifest.json` (name, icons — generate a simple monochrome target-and-timer icon set, maskable), service worker precaching the app shell + all routes + seed data so **every screen loads with zero network**, `display: standalone`, install prompt hint in Settings. Version-stamped SW with skip-waiting update flow and a "new version available — reload" toast (never silently break an active session with an update; defer activation until no session is active).

**M4.2 — Active session screen hardening** (`src/app/session/active/page.tsx`):
- **Wake lock** (`navigator.wakeLock`) held while a session is active; re-acquired on `visibilitychange`.
- Touch targets ≥48px on every control a shooter hits between strings; primary capture actions reachable one-handed in the bottom half of the screen.
- High-contrast "sunlight" consideration: the active-session screen uses full-strength foreground colors and larger type (timer values `text-[28px]` or larger) — verify against the house dark/light tokens rather than inventing a new palette.
- Manual time entry optimized: numeric keypad input mode (`inputMode="decimal"`), previous run's distance/settings pre-filled, enter-time→save in ≤3 taps.
- Run management: swipe-or-button to mark a run invalid (mis-start, gun issue), edit a run's time/points within the session, delete (soft) with undo toast.
- Crash-safe: the in-progress session and every captured run persist immediately (they already do via store writes — verify no in-memory-only state exists on this screen; capture-then-die-then-reopen must lose nothing).

**M4.3 — Session summary.** Ending a session routes to a summary: duration, runs, rounds, per-drill best/avg vs benchmark, which skills got signal, any PRs ("Best-ever Bill Drill"). One primary action: "Done". (Sharing images is post-monetization — do NOT build it now.)

**M4.4 — BLE resilience pass** on `src/lib/ble.ts` / `useBle.ts`:
- Auto-reconnect on `gattserverdisconnected` (3 attempts, backoff), with connection state always visible in the active-session header (green dot / amber reconnecting / gray manual mode).
- Every BLE failure path degrades to manual entry with the keyboard already open — a timer glitch must never block recording a run.
- A hidden debug screen (Settings → long-press version number) showing the raw hex notification log (`rawBytes` is already captured) — this is how remote users report protocol bugs later.

### Acceptance criteria
- [ ] Lighthouse PWA install check passes; airplane mode → cold start → every route renders with data.
- [ ] Screen stays awake through a 10-minute idle active session (manual test, note result in PR).
- [ ] Mid-session force-kill → reopen → session and all runs intact (manual test + automated store test).
- [ ] Charles runs one real range session (live fire, AMG timer) and one dry-fire session on the build and signs off. His punch list gets fixed before the milestone closes. **This gate is non-negotiable — it is the only real-world test in the plan.**

---

## Milestone M5 — Timer Coverage

**Goal:** Support the timers the market actually owns, and make dry fire self-sufficient with an in-app par timer.
**Estimated effort:** 2 weeks (high uncertainty on Garmin — see gate).

### Tasks

**M5.1 — Timer abstraction.** Refactor `src/lib/ble.ts` behind a `TimerAdapter` interface: `connect()`, `disconnect()`, `onShotString(cb)`, `onStateChange(cb)`, `capabilities: {liveShots, parTime, sensitivity}`. `AmgCommanderAdapter` is the first implementation — pure refactor, existing behavior pinned by M0's `convertTime` tests plus new adapter-level tests using recorded notification byte fixtures (capture real fixtures from the debug log during M4's range session).

**M5.2 — Garmin Xero C1 Pro adapter.** The C1 is the most-owned timer in the sport as of 2026; supporting it likely doubles the addressable hardware base.
- **Research first, code second:** find existing open-source BLE work for the Xero C1 (GitHub, home-assistant integrations, shot-timer projects; PractiScore Competitor interoperates with it, proving the BLE surface exists). Document findings — service/characteristic UUIDs, packet format, whether shot events stream live or transfer post-string — in `docs/GARMIN_BLE.md` with links.
- **⛔ HARD GATE:** if you cannot find a credible, verifiable protocol reference, STOP. Write up what you found and ask Charles whether to (a) buy/borrow a C1 and reverse-engineer against the debug screen, or (b) defer Garmin and proceed. Do NOT write an adapter against a guessed protocol.
- If protocol confirmed: implement `GarminXeroAdapter`, fixtures + tests same as AMG. Charles (or a club mate) validates against real hardware before the milestone closes.

**M5.3 — In-app dry-fire par timer.** This makes dry fire zero-hardware and is the single highest-leverage feature for the at-home market.
- Web Audio API (not `<audio>` elements — timing must be sample-accurate): start beep after a random delay (range 1.0–4.0s, configurable), par beep at the drill's par time, optional second par for reload drills.
- Par time source: the user's target-classification dry-fire benchmark for the selected drill/distance (from `dryFireBenchmarks`), user-overridable per drill with the override persisted.
- Flow: user runs N reps against the par; after each rep, one-tap log — "made it / didn't / didn't call it" — which maps to the existing `dryFireCallPct` model per the spec.
- ⛔ ASK CHARLES before building: exact desired rep flow (does he log every rep or a batch summary at the end? what does "made the par" mean for scoring — is a made-par rep recorded as totalTime = par?). His answers become the spec comment in `src/lib/parTimer.ts`.
- Audio must keep working with the screen locked where the platform allows; where it can't (browser limitation), keep the screen awake via the M4 wake lock and document the limitation.

### Acceptance criteria
- [ ] AMG behavior byte-identical after refactor (fixture tests).
- [ ] Garmin: adapter validated against real hardware, OR a documented deferral decision from Charles. No third state.
- [ ] Par timer: beep latency subjectively tight (Charles tests it dry firing at home — sign-off gate), reps flow into runs/`dryFireCallPct` exactly per his spec answers, benchmarks drive default pars correctly (test).

---

## Milestone M6 — Diagnostic Trust & the Training Loop

**Goal:** The engine's output becomes something a shooter believes and follows. This is the difference between "drill logger" (free apps exist) and "coach" (worth $80/yr). Nothing here is new ML — it is surfacing, explaining, and scheduling what the engine already computes.
**Estimated effort:** 2 weeks.

### Tasks

**M6.1 — Evidence trail on every recommendation.** Extend `DrillRecommendation` with a structured `evidence` object rendered as an expandable "Why this?" on every recommended drill:
- The skill(s) targeted, current mastery vs target benchmark with the actual numbers ("Transitions: 64% of B-class standard — your avg Blake Drill 3.1s vs 2.4s benchmark at 7yd"), the trend and its data basis ("declining across your last 6 signals"), and staleness ("last trained 11 days ago").
- Rule: every sentence in the evidence must be computable from stored runs — no vague coach-speak. If confidence < 0.4, say so plainly: "Low data — this is a guess until you log more [skill] work."

**M6.2 — Staleness & review scheduling (memory decay surfaced).** The estimator already decays signals; now schedule against it: per top-level skill, compute days-since-last-signal and a review-due flag when decayed confidence drops below 0.4. Dashboard gets a "Due for review" row feeding the session planner as `purpose: "maintenance"` items (plumbing already exists in `PlannedDrill.purpose`). ⛔ ASK CHARLES: what feels right for review cadence by skill category (e.g., "draws go stale in ~a week, position entries in ~two")? Encode his answer as per-category half-life constants with a spec comment; do not invent them.

**M6.3 — Weekly training plan.** Today the planner produces one session at a time. Add a 7-day plan: given the user's declared schedule (how many dry/live sessions per week — add to profile via a settings card), allocate the week: gaps first (weight 60%), review-due (30%), one "stretch" drill above current level (10%). Persist the plan; each completed session checks off against it; dashboard shows "Week: 2 of 4 sessions, on plan". Regenerate only on Monday or on explicit "replan" (stability builds trust; a plan that reshuffles daily reads as random).
- ⛔ ASK CHARLES: validate the 60/30/10 split and the week structure with him before building — one question, his numbers win.

**M6.4 — Plateau detection v1.** Per drill (min 10 valid runs across ≥3 weeks): fit a simple linear trend on the last 8 runs' benchmark-%; flat-or-negative slope while below 100% of target = plateaued. Surface on the drill page and dashboard: "Bill Drill has been flat for 3 weeks at ~78%" plus the engine's sub-skill hypothesis: among the drill's mapped skills, name the one with lowest mastery ("your grip/recoil signals lag your draw signals — likely limiter") and recommend that skill's most-isolating drill (highest encompassing weight for that skill, fewest other skills). Keep it exactly this simple — no changepoint detection, no ML.

**M6.5 — Progress dashboard.** One page (extend `/graph` or dashboard) answering "am I getting better?": per-category mastery bars with 30-day delta arrows, per-skill trend sparklines (extend `TrendChart.tsx`), cold-vs-warm gap per skill (the ownership concept — both averages shown side by side), and a classification progress line: overall mastery-vs-target over time with a dashed linear projection to 100% ("at this rate: ~14 weeks to B-class pace"). Projection shows only with ≥4 weeks of data and is labeled "projection, not a promise".

### Acceptance criteria
- [ ] Every recommendation on every surface has a populated evidence object; a test asserts evidence numbers equal the estimator's outputs for a fixture history.
- [ ] Weekly plan: generated, persisted, check-off works, Monday regeneration works (mock the clock in tests), respects declared session counts and fire modes.
- [ ] Plateau: synthetic fixture histories (improving / flat / declining / sparse) classify correctly in tests; sparse data produces NO plateau flag (false alarms destroy trust faster than misses).
- [ ] All thresholds (0.4 confidence, 60/30/10, half-lives, plateau windows) live in one `src/lib/tuning.ts` constants file with the Charles-approved values and spec comments.
- [ ] Charles reviews the dashboard with his own real training data from M4/M5 usage and confirms the numbers pass his sniff test as a shooter. If any number reads wrong to him, root-cause it — his domain instinct is the test oracle here.

---

## Milestone M7 — Close the Match Loop (PractiScore)

**Goal:** Match results flow in and change what the app tells you to train. This is the "training connects to matches" promise from the spec.
**Estimated effort:** 1 week.

### Tasks

**M7.1 — Importer hardening.** ⛔ ASK CHARLES for 3–5 real PractiScore export files from his own matches (formats vary by export path — `.psc`, web CSV, etc.). Fix the parser against real files; keep sanitized versions as test fixtures (strip other competitors' names — replace with "Shooter N"). Malformed files fail with a readable error naming what was wrong, never a white screen.

**M7.2 — Match review screen.** Post-import: per-stage results with hit factor, points, time, penalties; stage-over-stage comparison vs the user's match average; flag the 2 worst stages by relative finish.

**M7.3 — Stage → skill decomposition v1.** Keep it deliberately crude and honest: classify each stage by observable features available in the file (round count, string count, stage points/type) into coarse buckets (short/medium/long course, standards), and map buckets → skill categories via a static table. ⛔ ASK CHARLES to fill in that table ("a 32-round field course is mostly movement/transitions; an 8-round standards stage is mostly draw/accuracy…") — his words become the table's spec comments. Output feeds M6.1's evidence: "Your last 2 matches lost the most ground on long field courses — consistent with your low movement-skill mastery" and bumps those skills' priority in the planner by a bounded factor (cap at 1.5×, constant in `tuning.ts`).
- Do NOT attempt per-target or per-string skill attribution from match data — the data doesn't support it and false precision here poisons trust in everything else.

### Acceptance criteria
- [ ] All of Charles's real files import correctly (his verification).
- [ ] Fixture tests for each supported format + malformed-file cases.
- [ ] A match import visibly changes the next generated plan in the expected direction (test with a fixture match weak in a specific bucket).

---

## Milestone M8 — Corpus Audit & Drill Experience

**Goal:** The content is complete, correct against the source material, and each drill page teaches the drill well enough to run it without the book.
**Estimated effort:** 1 week.

### Tasks

**M8.1 — Corpus audit.** Cross-check every drill in `seed.ts` against `practical-shooting-training.txt` (in the project root, one level above the app): name, setup, round count, procedure, par/benchmark times, distances. Produce `docs/CORPUS_AUDIT.md` — a table of every drill with ✅/❌ per field and the source line reference. **Do not correct seed.ts yourself.** Present discrepancies to Charles; edit only the ones he confirms, one commit per correction batch, surgical edits.

**M8.2 — Benchmark coverage matrix.** Extend M0's integrity test: for every (drill in any assessment battery or with a skill map) × (classification C/B/A/M/GM) × (fire mode it supports), a benchmark must exist at the drill's canonical distance or the estimator's nearest-distance fallback must have somewhere to land. Emit the gap list; ⛔ ASK CHARLES for numbers to fill gaps (he supplies or approves every benchmark value — never interpolate benchmarks silently; if he approves interpolation, mark those rows `source: "interpolated"` in the data).

**M8.3 — Drill pages that teach.** Each drill detail page gets: setup description with a simple SVG diagram (targets/positions to scale — generate programmatically from structured setup data added per drill: target count, spacing, distance; keep the schema minimal), procedure steps, start position, the par table for every classification at every distance (already in data — render it fully), and "what this trains" from the skill map with weights. No videos, no photos — out of scope.

**M8.4 — Content QA pass with the seed integrity suite** extended to enforce: every drill has ≥1 skill mapping, description, round count > 0 (or explicitly dry-fire-only), and setup data for the diagram.

### Acceptance criteria
- [ ] `docs/CORPUS_AUDIT.md` complete; every ❌ resolved with a Charles-approved correction or an explicit "leave as is" note.
- [ ] Coverage matrix test green with zero silent gaps.
- [ ] Charles spot-checks 5 drill pages against the book and signs off.

---

## Ready-to-Monetize Checklist

Monetization work (pricing, Stripe, gating) begins ONLY when every line is checked:

**Durability & trust**
- [ ] Data survives: cache clear, device loss (via account sync), app update mid-session.
- [ ] Export/import round-trips losslessly.
- [ ] RLS proven with a two-user test.

**The product works where it's used**
- [ ] Full offline: every screen, airplane mode, cold start.
- [ ] One real live-fire range session and one real dry-fire session completed by Charles on the final build with zero data loss and no workaround needed.
- [ ] AMG connect → capture → disconnect → reconnect works; every failure degrades to manual entry.
- [ ] Garmin Xero C1 supported OR explicitly deferred by Charles's written decision.
- [ ] In-app par timer approved by Charles after real dry-fire use.

**The paid value is visible**
- [ ] New user reaches the gap-reveal moment in one guided session with no explanation from a human.
- [ ] Every recommendation shows computable evidence; zero unexplained prescriptions.
- [ ] Weekly plan generates, persists, and tracks completion.
- [ ] Progress dashboard answers "am I improving?" with Charles's real data and passes his shooter sniff test.
- [ ] Match import demonstrably changes training priorities.

**Engineering floor**
- [ ] CI green: lint, typecheck, tests (≥80% coverage on `src/lib/`), build.
- [ ] All tuning constants in `tuning.ts`, each with a Charles-approved value.
- [ ] Corpus audit closed out.
- [ ] Zero secrets in the repo.

**Deliberately NOT in scope before monetization** (do not build these, even if they seem quick): Stripe/paywalls, XP polish/leagues/streaks beyond what exists, share images, iOS/Capacitor wrapper, IPSC/IDPA modes, instructor/coach features, community content, video/AI scoring, marketing site, email, analytics/telemetry beyond error logging.

---

## Sequence & Effort Summary

| # | Milestone | Effort | Hard gates (⛔) |
|---|---|---|---|
| M0 | Engineering baseline | 2–3 days | seed integrity failures → ask |
| M1 | Data durability | 1 wk | — |
| M2 | Accounts & sync | 2–3 wks | server resources → ask |
| M3 | Onboarding | 1 wk | unclassified-shooter behavior; Charles UX sign-off |
| M4 | Range-mode PWA | 1.5 wks | Charles real range session sign-off |
| M5 | Timer coverage | 2 wks | Garmin protocol gate; par-timer rep-flow spec |
| M6 | Diagnostic trust | 2 wks | review cadence + plan-split numbers; data sniff test |
| M7 | Match loop | 1 wk | real .psc files; stage→skill table |
| M8 | Corpus audit | 1 wk | every seed correction approved |

**Total: ~11–13 focused weeks.** The ⛔ gates are the only places execution must pause for Charles; everything else is decided in this document.

---

## Synopsis

Eight ordered milestones take the prototype to a chargeable product: make data unlosable (M0–M2), make the first session sell itself (M3), make it work at a real range (M4–M5), make the diagnosis trustworthy enough to pay for (M6–M7), and certify the content (M8). ~12 weeks of focused execution, with every domain judgment call routed to Charles at explicit gates instead of guessed.
