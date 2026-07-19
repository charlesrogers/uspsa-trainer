# M2 — Accounts & Cloud Sync (AIRTIGHT — sync bugs eat user data)

Roadmap decisions are FIXED (do not revisit): local-first + server-mirror;
IndexedDB stays the UI source of truth; runs/sessions append-only +
field-patchable; per-row `updated_at` (server clock) last-write-wins; soft
deletes (`deleted_at`); anonymous-first (never forced); client UUIDs are PKs
forever (no id remapping). Schema `uspsa` on self-hosted Supabase.

## ⛔ Infra gates
- [x] Apply migration → `uspsa` schema on shared Supabase. APPLIED & VERIFIED
      2026-07-19 (Charles ran it via `!`): 4 tables, RLS on all, 3 policies each
      (no delete), updated_at triggers present. SQL now proven against real PG.
- [ ] Expose `uspsa` to PostgREST: env is `public,storage,graphql_public` →
      add `,uspsa` + restart supabase-rest. THIS BLIPS ALL APPS' API briefly.
      Pick a coordinated moment. Needed before the real end-to-end sync test.
- [ ] Configure magic-link SMTP on Supabase auth (Charles said yes) — do in M2.2
- [ ] RLS two-user test against the real instance (after exposure)

## M2.1 — Schema + mapper  ✅ built (migration not yet applied)
- [x] `migrations/0001_uspsa_sync.sql` — written, carefully; UNVERIFIED until run
      (no local Postgres). Server-clock updated_at trigger, soft-delete, RLS.
- [x] `src/lib/sync/mapper.ts` + 11 tests — round-trips every type, pins columns.

## M2.2 — Auth (magic link only; no OAuth/password this milestone)
- [ ] Supabase browser client (`src/lib/sync/supabase.ts`), env-var keyed
- [ ] Sign up / sign in (magic link) + signed-in state in Settings
- [ ] Sync status line: "up to date / N pending / offline"

## M2.3 — Sync engine (`src/lib/sync/engine.ts`) — ✅ ALGORITHM done + tested
- [x] Decoupled engine behind RemoteClient/LocalStore interfaces
- [x] Cycle: push outbox (idempotent upsert by pk) → pull > watermark → LWW merge
- [x] Exhaustive matrix (10 tests, fake Supabase): fresh-device pull, two-device
      LWW convergence, offline-queue-survives-restart, idempotent partial-push
      retry, soft-delete propagation, clock-skew-can't-resurrect, watermark.
- [ ] WIRE into store.ts (still to do, no-infra, testable w/ fake-indexeddb):
      outbox idb store (schema v2), enqueue on every local write, apply-remote
      path that writes cache+idb WITHOUT re-enqueuing, watermark/version meta.
- [ ] Real supabase RemoteClient impl (`sync/supabase.ts`) — needs API exposed
- [ ] Triggers: app start, `online`, session end, manual "Sync now" (not per-write)

## M2.4 — Account upgrade path
- [ ] Local anon data + fresh sign-in → everything uploads
- [ ] Sign-in on device with BOTH local anon data AND existing server data →
      merge by id, zero loss, no dupes (UUIDs). Test both.

## Acceptance (roadmap)
- [ ] Airplane-mode capture → reconnect → rows in Supabase (psql output in PR)
- [ ] Second browser profile → identical history + skill estimates
- [ ] RLS: user A JWT selecting user B rows → 0 rows (automated, real instance)
- [ ] Sync suite green
- [ ] Zero secrets in git (`git log -p | grep -iE 'service_role|anon.*eyJ'` clean)

---

## Parallel thread — population benchmarks (NOT M2; awaiting Charles sign-off)
- [ ] Drill data-source categorization (below) — Charles to approve
- [ ] PractiScore ingestion feasibility spike (API vs scrape vs USPSA data; ToS)
- [ ] Only ~3 drills are PractiScore-derivable (classifier/El Prez/mock stage);
      the rest need our own users. Design so both sources feed findBenchmark().

## Review (filled at end)
