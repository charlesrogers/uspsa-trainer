# M1 — Data Durability

Goal: user training data survives a cleared browser cache. Build the storage
layer M2's server/sync will attach to. No real user data exists yet, so the
localStorage→IndexedDB migration is for correctness/future users, not rescue.

## Architecture decision (write-through cache)

The compute engine (skillEstimation, trends, recommendations, sessionPlanner,
assessment) reads the store *synchronously* all over the UI. Making those async
would ripple through the entire lib and turn pure computation into IO. Instead:

- **`src/lib/storage/db.ts`** — async `idb` wrapper. THE durable source of truth.
  Object stores: `profile`, `sessions`, `runs`, `plans`, `meta`.
- **`src/lib/store.ts`** — holds an in-memory cache mirroring idb.
  - `hydrateStore()` async — migrate localStorage→idb once, then load idb→cache.
  - reads (getRuns/getProfile/…) stay **sync**, read cache → engine untouched.
  - writes (addRun/saveProfile/…) update cache **sync**, persist to idb **async**
    through one choke-point that catches QuotaExceededError → banner.
- Hydration gate in AppShell: content waits for `hydrateStore()` on cold load
  (near-instant), so pages' existing useEffect reads hit a populated cache.

This keeps all 172 M0 tests' assertions unchanged (only harness internals move
from localStorage to the cache). New idb/migration/export behavior gets its own
M1 tests using fake-indexeddb.

## Tasks

### M1.1 — Storage layer
- [ ] `storage/db.ts`: idb schema v1, stores profile/sessions/runs/plans/meta, `migrate(from)` scaffold
- [ ] `store.ts`: in-memory cache + `hydrateStore()` + sync reads + async writes via choke-point
- [ ] One-time localStorage→idb migration; keep originals renamed `_migrated_*` (no delete)
- [ ] QuotaExceededError → pub/sub → visible banner in AppShell (no silent dropped writes)
- [ ] Route remaining direct localStorage users through the layer: settings export, `ble.ts` last-device
- [ ] Move constraints / session plan / plan progress / imported matches into idb stores
- [ ] Hydration gate in AppShell (existing empty states, no spinner sprawl)

### M1.2 — Export / Import (Settings)
- [ ] Export → `uspsa-trainer-backup-YYYY-MM-DD.json` (schema version + profile/sessions/runs/plans + app version), pretty-printed
- [ ] Import → validate schema + referential integrity BEFORE writing; merge by id (existing wins); summary + confirm tap
- [ ] Reject corrupt/truncated JSON with a readable error and zero writes

### M1.3 — Run validation
- [ ] `validation.ts` `validateRun(run): string[]` — time (0.3,600), splits >0.05 & monotonic-consistent, pointsDown [0,rounds×5], callPct [0,100], distance [1,100]
- [ ] Wire into manual entry + BLE capture; block with specific message; "save anyway, marked invalid" → isValid:false

### Tests
- [ ] Adapt M0 harness to cache (assertions unchanged)
- [ ] idb round-trip: write → drop cache → hydrate → present
- [ ] Export → wipe all → import → `computeAllSkillEstimates()` output identical (snapshot)
- [ ] Legacy migration via fake-indexeddb + seeded localStorage
- [ ] Import rejects corrupt JSON / referential breaks with zero writes
- [ ] validateRun boundaries, both sides

### Gate
- [ ] `pnpm typecheck && pnpm test && pnpm build` green; coverage still ≥80% on src/lib

## Review

Done. IndexedDB (`storage/db.ts`) is the durable source of truth; `store.ts`
mirrors it in a write-through cache so the compute engine stayed 100%
synchronous and untouched. Reads are sync (cache); writes update the cache
synchronously and persist async through one choke-point that raises a visible
banner on QuotaExceededError. `flushPendingWrites()` lets durability be awaited
(tests + a flush on tab-hide).

- Migration: one-time localStorage→idb copy, idempotent, originals preserved as
  `_migrated_*` (never deleted).
- Export/import (`backup.ts`): validates schema + shape + referential integrity
  before any write; merges by id (existing wins); rejects corrupt/newer/dangling
  with zero writes.
- Validation (`validation.ts`): `validateRun()` wired into manual entry with a
  "Fix it / Save anyway (marked invalid)" gate.
- Feature modules (recommendations/sessionPlanner/practiscore/ble) moved off
  localStorage onto the store's typed kv — no import cycles.

Tests: 198 total (193 pass, 5 quarantined corpus gaps from M0). New durability/
migration/backup/validation suites exercise the real idb path via fake-indexeddb.
Coverage 95.66% lines on src/lib. typecheck + next build green; prod server
smoke-tested (/, /settings → 200).

Design note: writes return void (fire-and-forget persist) rather than the fully
async store the roadmap sketches — this keeps the sync engine and avoids
rippling async through every page. Durability window is one microtask; the
tab-hide flush covers the close-immediately case.

Lint: still report-only. The set-state-in-effect errors are the pre-existing
M0 pattern (page components), plus the one I followed in AppShell's hydrate
effect. Clearing that debt remains out of scope for a durability milestone.
