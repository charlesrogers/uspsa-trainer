# USPSA Trainer — Full Build Spec: Live iPhone App + Population Pull

**Audience:** An executing agent (Opus) working without further guidance, plus Charles for the gated decisions. Every ambiguous decision is decided here. Where it isn't, the rule stands: **STOP and ask Charles — never improvise shooting-domain behavior or a data-source contract.**

**Goal:** Ship the *real* app — a native iPhone app (App Store) that captures runs from the AMG timer at the range **and** grades them against real population data pulled from PractiScore/USPSA and our own users. Not a prototype. Not a PWA-with-caveats. The full build, live.

**The governing constraint (Charles): we only build non-regrettable work.** See Part 0. Every architectural choice below is justified against it. The test for each decision: *if we changed our mind in six months, how much do we throw away?* We build so the answer is "almost nothing."

---

## Current state (what's already done)

| Layer | Status |
|---|---|
| Skill engine, corpus, planner (`src/lib/`) | Done, 214 tests |
| Data durability: IndexedDB + backup + validation (M1) | Done, merged |
| Sync schema (`uspsa` on self-hosted Supabase) | **Applied + verified in prod** |
| Sync engine (outbox + LWW + clock-skew safety) | Done, tested; **not yet wired to the store** (branch `m2-accounts-sync`) |
| PWA: offline service worker + wake lock + installable manifest | Done (branch `m4-pwa-range-mode`) |
| AMG timer over BLE | Works on desktop Chrome (Web Bluetooth) only — **not on iOS** |

**Charles-dependencies already cleared:** Apple Developer Program ✅, Xcode ✅. What remains of "his hands" is code-signing + pressing Run, and the gated decisions flagged ⛔ below.

---

## Part 0 — Non-regrettable operating principles

These are the rules that make every choice below low-regret. They are not optional.

1. **Every external boundary sits behind an interface.** The timer, the population data source, and the benchmark lookup each get a TypeScript interface with swappable implementations. We never hard-wire to Web Bluetooth, to PractiScore specifically, or to the seed corpus. Swapping an implementation must never touch a call site.
2. **One implementation of the math, forever.** The scoring engine, the AMG protocol decoder, and the corpus exist exactly once, in TypeScript. iOS runs *that* code (via Capacitor), never a Swift re-implementation. A second implementation of scoring is the single most regrettable thing we could build — it doubles the surface and guarantees the two drift.
3. **Never build on an unverified data contract.** The PractiScore/USPSA pull method is unproven until a feasibility spike proves it. We design the ingestion behind an interface and gate the concrete source on the spike. No pipeline is written against an assumed API shape.
4. **Population data is aggregate-only and privacy-safe.** We publish a benchmark only when it is computed from at least `K` distinct shooters (k-anonymity). No individual's runs are ever exposed. This is both ethical and non-regrettable — a privacy walk-back after launch is catastrophic.
5. **Offline-first is permanent.** Every capability must work at the range with no signal. Population benchmarks are downloaded when online and cached in IndexedDB; the app grades offline against the last cached snapshot. Anything that requires connectivity at the range is a bug.
6. **Server clock is truth; client UUIDs are permanent** (locked by M2 — do not revisit).
7. **The bundle identifier and data contracts are permanent.** Bundle id, table names, and the population-snapshot schema are versioned and never casually renamed. Pick them once, deliberately (⛔ gates below).

**Why Capacitor is the non-regrettable iOS choice** (and native Swift is not): the entire product is the client-side engine + corpus, which must run offline and drive a BLE timer. Capacitor runs that exact code in a native shell — one codebase, one engine, all 214 tests still apply — and swaps only the timer transport for native BLE. Native Swift would force a second implementation of the scoring math (violates #2). And because of principle #1, even the packaging choice is low-regret: the transport/engine abstractions mean a future native-Swift UI could reuse the same engine via JavaScriptCore without a rewrite. We are not painting ourselves into a corner; we are building the abstractions that keep every door open.

---

## Part A — The iPhone app (Capacitor + native BLE)

### A1 — Timer transport abstraction (do FIRST; zero-regret)

Refactor `src/lib/ble.ts` so the protocol and the transport are separate:

- **`src/lib/timer/amgProtocol.ts`** — pure functions only: `convertTime()` (already exported + tested), notification frame decoding (shot / started / stopped), hex helpers. No I/O. The existing M0 `convertTime` tests move here unchanged.
- **`src/lib/timer/transport.ts`** — `interface TimerTransport { connect(): Promise<void>; disconnect(): Promise<void>; readonly state; onShot(cb); onTimerEvent(cb); onStateChange(cb); }`
- **`src/lib/timer/webBluetooth.ts`** — the current Web Bluetooth implementation, unchanged behavior, for desktop Chrome dev.
- **`src/lib/timer/capacitorBle.ts`** — native implementation using `@capacitor-community/bluetooth-le`, same Nordic UART UUIDs, feeding bytes into `amgProtocol`.
- **`useBle`** selects the transport: `Capacitor.isNativePlatform() ? capacitorBle : webBluetooth`.

**Acceptance:** existing timer behavior on desktop Chrome unchanged; `amgProtocol` unit-tested in isolation; `useBle` has no direct Web Bluetooth references. This step ships on its own and is valuable regardless of iOS.

### A2 — Static, bundle-able build

Capacitor ships the web assets *inside* the app bundle (required for App Store + true offline). The app must export to static assets.

- Add a Capacitor build mode: `output: 'export'` producing `out/`. Guard it so the Coolify web deploy (which uses server features) is unaffected — use an env flag (`BUILD_TARGET=capacitor`) in `next.config.ts`.
- **Server routes in export mode:** `/api/version` cannot exist in a static export. Replace its use with the build-time `APP_VERSION` constant (already in `src/lib/version.ts`). The deploy-verification endpoint stays for the *web* build only.
- **Dynamic routes** (`/drills/[id]`, `/history/[id]`) are already `"use client"` reading from IndexedDB. Under static export they must render as client-routed shells — verify Next 16 export handles them (likely `generateStaticParams` returning `[]` + client-side param read, or convert to query-param routing). ⛔ If static export fights the dynamic routes in a way that needs restructuring the router, STOP and write up options before changing routing.

**Acceptance:** `BUILD_TARGET=capacitor pnpm build` emits `out/` with every route as a client-navigable static shell; the web build (`pnpm build`) is unchanged and still deploys to Coolify.

### A3 — Capacitor iOS project

- `pnpm add @capacitor/core @capacitor/cli @capacitor/ios @capacitor-community/bluetooth-le`
- `npx cap init` with **appId `com.autotrainer.app`**, appName "AutoTrainer" (Charles: "call it autotrainer for now" — note the store listing/bundle id is effectively permanent once published; a rename before first submission is free, after is a new listing), `webDir: 'out'`.
- `npx cap add ios`. Commit the generated `ios/` project to the repo.
- `Info.plist`: `NSBluetoothAlwaysUsageDescription` = "Connect to your shot timer to record run times." Portrait lock. Status bar style to match the dark theme.
- No secrets in the iOS project or Xcode build settings (infra rule).

**Acceptance:** `npx cap open ios` opens a project that builds in Xcode against Charles's signing team.

### A4 — Native BLE

Implement `capacitorBle.ts` with `@capacitor-community/bluetooth-le`: request permission, scan for the AMG by NUS service UUID `6e400001-b5a3-f393-e0a9-e50e24dcca9e`, connect, subscribe to the TX characteristic, hand raw bytes to `amgProtocol`. Auto-reconnect on disconnect (mirrors the M4.4 resilience pass), always degrade to manual entry on failure.

**Acceptance:** on a physical iPhone, connecting to the AMG Lab Commander and firing a string records a run with the same times the web version produces from identical byte frames (compare against the `amgProtocol` test vectors).

### A5 — Ship

- Xcode: signing team (Charles's), bundle id, marketing version + build number derived from git.
- **TestFlight** build first — Charles runs a real range session (live fire + AMG) and a dry-fire session on it. His punch list is fixed before store submission. **This real-world session is the non-negotiable gate** (mirrors roadmap M4 acceptance).
- App Store: screenshots, description, privacy nutrition label (declare: training data stored on device + optional account sync; no third-party tracking).

**Acceptance:** app approved and live on the App Store; Charles installs it from the store and captures a run with the timer.

---

## Part B — The pull capability (population benchmarks)

**What it is:** grade a shooter's runs against *real* distributions — "your 1.9s draw is median for B class" — instead of only Stoeger's single GM goal times. Two data sources feed it, per the categorization Charles reviewed:

- **PractiScore / USPSA** — whole-stage hit factors: classifiers and field courses. Maps to ~3 drills (`dr-classifier`, `dr-elprez`, `dr-mock-stage`) + the stage-craft skills. Also the only realistic source for the **missing C and A benchmarks**.
- **Our own users** — every other drill (draws, dry fire, discrete marksmanship/transitions/movement), which never appear in match data. Delivered by M2 sync landing runs in `uspsa.runs`.

### B0 — Feasibility spike (⛔ GATE — do before any pipeline code)

Prove *how* the external data is obtained before building anything on it:
- Is there a PractiScore results API? A USPSA classifier-scores API/export? Or is it HTML scraping?
- What are the ToS / rate limits / legal constraints? (Scraping a third party is a real risk — get this right once.)
- Deliverable: a short written finding + a decision on the concrete source, and a `PopulationSource` interface the pipeline codes against so the source can change without downstream rework.

**Non-regrettable rule:** if the spike is inconclusive, we ship the app (Part A) on seed benchmarks + our-users data only, and add external data when the contract is proven. We do NOT block the app on an unverified pull.

### B1 — Ingestion + aggregation (server-side, on Hetzner)

- A scheduled job (light periodic ingestion — obeys infra rules: modest, alert-on-failure, no heavy compute on the prod host) pulls external data via the `PopulationSource` impl and reads our-users runs from `uspsa.runs`.
- Aggregates into percentile times per **(drillId or classifier, classification, distanceYards, fireMode)**: p10/p25/p50/p75/p90 and n.
- **Privacy gate (principle #4):** emit a cell only when `n >= K` distinct users. `K` is a configurable constant `POPULATION_MIN_SHOOTERS`, **default 20** (Charles: "make the 20 a variable, but 20 is fine for now").
- Writes to `uspsa.population_benchmarks` (server-owned; read-only to clients).

### B2 — Distribution: versioned, cached snapshot

- The server publishes a compact **versioned snapshot** (`population-benchmarks` with a `version` integer) — either a generated JSON asset or a client-queryable table. Shape mirrors the seed `DrillBenchmark` so the client treats it identically.
- Client downloads when online, stores in IndexedDB (a new `population` store, schema-bumped), records the version, and uses it **offline**. Refresh policy: check on app start when online; snapshots change slowly.

### B3 — Client integration: source-aware benchmarks

- Introduce **`interface BenchmarkSource { find(drillId, classification, distance, fireMode): Benchmark | undefined }`** with provenance on every result (`{ source: 'population' | 'seed', n?: number }`).
- `findBenchmark()` (today in `skillEstimation.ts`/`store.ts`) becomes a resolver: prefer a population benchmark **when it clears the sample threshold**, else fall back to seed. This is the mechanism that **fills the C/A gap** automatically once population data exists — without hand-authoring Stoeger numbers he never published.
- UI shows provenance: "Benchmark: 340 GM shooters" vs "Benchmark: Stoeger (GM goal time)". This is the credibility payload — the evidence trail IS the pitch.

**Acceptance:** with a seeded population snapshot fixture, `findBenchmark` returns the population value where n≥K and the seed value otherwise; skill estimates recompute against population benchmarks; a C-class target (no seed benchmark today) now grades against population data; everything still works offline against the cached snapshot.

---

## Part C — M2 dependency (the substrate)

The pull's "our users" input requires runs on the server, i.e. **M2 must finish**: wire the sync engine into the store (outbox store, enqueue-on-write, apply-remote), magic-link auth, and the one-time PostgREST schema-exposure restart (the ~seconds all-apps blip — pick a coordinated moment). Schema + engine are already done and verified. Full detail lives in `docs/pre-monetization-roadmap.md` M2 and `tasks/todo.md`.

---

## Sequencing to live

1. **A1 — timer transport abstraction.** Zero-regret, unblocks iOS, ships standalone.
2. **A2–A4 — static export + Capacitor iOS + native BLE.** → timer works on the phone.
3. **A5 (TestFlight)** — real app in Charles's hands with the timer. Range-session gate.
4. **Finish M2** (Part C) — runs reach the server.
5. **B0 spike → B1–B3** — the pull capability. Fills C/A gaps as a side effect.
6. **A5 (App Store)** — live.

Parts A and B are largely independent after M2; A can reach TestFlight before B0 even runs. The app is never blocked on the external-data spike.

---

## Gated decisions — RESOLVED (2026-07-20)

1. **Bundle id** → `com.autotrainer.app`, app name "AutoTrainer" ("for now").
2. **k-anonymity threshold** → constant `POPULATION_MIN_SHOOTERS`, default 20.
3. **External source** → yes, PractiScore/USPSA. **Vision: every competition, live.**
   Concrete method still decided by the B0 spike; Charles signs off if scraping.
4. **Drill categorization** → LOCKED to the reviewed proposal (Charles delegated:
   "do whatever is right"). ~3 population-derivable drills + stage-craft; the
   rest our-users. The agent owns keeping this correct as the corpus grows.
5. **PostgREST restart** → agent executes at a low-traffic window and verifies
   all apps recover (Charles delegated: "just do the right thing").

---

## Synopsis

Ship the real iPhone app by wrapping the existing engine in Capacitor (one codebase, native BLE for the timer) and add a privacy-safe population-benchmark pull (PractiScore/USPSA + our users) behind swappable interfaces, so grading uses real distributions and the C/A gaps fill themselves. Every boundary is an interface and the scoring math exists once — nothing here is regrettable. ROI: this is the difference between a prototype and a chargeable product a shooter actually carries to the range.
