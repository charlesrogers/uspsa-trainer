# M2 — Accounts & Cloud Sync (AIRTIGHT — sync bugs eat user data)

Roadmap decisions are FIXED (do not revisit): local-first + server-mirror;
IndexedDB stays the UI source of truth; runs/sessions append-only +
field-patchable; per-row `updated_at` (server clock) last-write-wins; soft
deletes (`deleted_at`); anonymous-first (never forced); client UUIDs are PKs
forever (no id remapping). Schema `uspsa` on self-hosted Supabase.

## ⛔ Infra gates — ASK CHARLES before any of these (build first, apply later)
- [ ] Create `uspsa` schema + tables on the shared Supabase (capacity/other-apps)
- [ ] Configure magic-link SMTP on Supabase auth
- [ ] Run the RLS two-user test against the real dev instance
Everything below the gates is built and tested WITHOUT the server, then applied.

## M2.1 — Schema + mapper  (server-agnostic; build now)
- [ ] `migrations/0001_uspsa_sync.sql`: schema `uspsa`; tables profiles/sessions/
      runs/plans mirroring src/lib/store.ts + user_id/updated_at/deleted_at;
      snake_case; `updated_at` via BEFORE trigger `now()` (never client-set);
      RLS `user_id = auth.uid()` select/insert/update; NO delete policy.
- [ ] `src/lib/sync/mapper.ts`: toDb/fromDb for profile/session/run/plan. Tests:
      round-trip every type; snake/camel exactness; splits + nullable fields.

## M2.2 — Auth (magic link only; no OAuth/password this milestone)
- [ ] Supabase browser client (`src/lib/sync/supabase.ts`), env-var keyed
- [ ] Sign up / sign in (magic link) + signed-in state in Settings
- [ ] Sync status line: "up to date / N pending / offline"

## M2.3 — Sync engine (`src/lib/sync/engine.ts`) — THE risky part
- [ ] Outbox store in IndexedDB: every local write appends {table,id,updated_at}
- [ ] Cycle: push outbox (idempotent upsert by PK) → pull where server
      updated_at > watermark → merge into IndexedDB (LWW per row)
- [ ] Triggers: app start, `online` event, session end, manual "Sync now".
      NOT per-write.
- [ ] Failure: outbox persists across restarts; errors non-blocking indicator
- [ ] Exhaustive tests (against a fake Supabase, no server needed for logic):
  - [ ] fresh-device pull rebuilds identical local state
  - [ ] two-device LWW converges
  - [ ] offline queue survives restart
  - [ ] partial-push failure retries idempotently (upsert by PK)
  - [ ] soft delete propagates
  - [ ] clock skew (client +1hr) cannot resurrect deleted rows — trust server
        updated_at from the DB trigger, never client time

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
