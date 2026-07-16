-- M2.1 — Accounts & cloud sync schema.
--
-- NOT YET APPLIED. Applying this touches the SHARED self-hosted Supabase, which
-- is a ⛔ ASK CHARLES infra change. Apply with:
--   ssh root@95.216.205.160 "docker exec -i supabase-db psql -U postgres -d postgres" < migrations/0001_uspsa_sync.sql
--
-- Design invariants (fixed by the roadmap):
--   * Client-generated UUIDs are the primary keys everywhere. No id remapping.
--   * updated_at is ALWAYS the server clock (BEFORE trigger now()), never the
--     client — a device with a wrong clock must not win a last-write-wins race
--     or resurrect a deleted row.
--   * Deletes are soft (deleted_at). No row is ever physically removed by the
--     app, so deletions propagate through sync. Hence NO delete RLS policy.
--   * RLS scopes every row to its owner: user_id = auth.uid().

create schema if not exists uspsa;

-- ── shared updated_at trigger — server clock is the single source of truth ──
create or replace function uspsa.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ─────────────────────────────────────────
-- profiles (one row per user)
-- ─────────────────────────────────────────
create table if not exists uspsa.profiles (
  user_id               uuid primary key references auth.users (id) on delete cascade,
  display_name          text        not null default '',
  uspsa_number          text        not null default '',
  classification        text        not null default 'C',
  target_classification text        not null default 'B',
  division              text        not null default 'Production',
  equipment             text        not null default '',
  optic                 text        not null default 'iron',
  daily_xp_goal         integer     not null default 30,
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);

-- ─────────────────────────────────────────
-- sessions
-- ─────────────────────────────────────────
create table if not exists uspsa.sessions (
  id          uuid primary key,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  started_at  timestamptz not null,
  ended_at    timestamptz,
  fire_mode   text        not null,
  location    text        not null default '',
  notes       text        not null default '',
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index if not exists sessions_user_updated_idx on uspsa.sessions (user_id, updated_at);

-- ─────────────────────────────────────────
-- runs
-- ─────────────────────────────────────────
create table if not exists uspsa.runs (
  id                uuid primary key,
  user_id           uuid        not null references auth.users (id) on delete cascade,
  session_id        uuid        not null,
  drill_id          text        not null,
  run_number        integer     not null,
  is_valid          boolean     not null default true,
  is_cold           boolean     not null default false,
  fire_mode         text        not null,
  distance_yards    numeric     not null,
  total_time        numeric     not null,
  first_shot_time   numeric,
  splits            jsonb       not null default '[]'::jsonb,
  points_down       integer,
  dry_fire_call_pct integer,
  captured_at       timestamptz not null,
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);
create index if not exists runs_user_updated_idx on uspsa.runs (user_id, updated_at);
create index if not exists runs_session_idx on uspsa.runs (user_id, session_id);

-- ─────────────────────────────────────────
-- plans (kv: session_plan / plan_progress / constraints), value as jsonb
-- ─────────────────────────────────────────
create table if not exists uspsa.plans (
  user_id     uuid        not null references auth.users (id) on delete cascade,
  key         text        not null,
  value       jsonb       not null,
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  primary key (user_id, key)
);

-- ── updated_at triggers ──
drop trigger if exists profiles_set_updated_at on uspsa.profiles;
create trigger profiles_set_updated_at before insert or update on uspsa.profiles
  for each row execute function uspsa.set_updated_at();
drop trigger if exists sessions_set_updated_at on uspsa.sessions;
create trigger sessions_set_updated_at before insert or update on uspsa.sessions
  for each row execute function uspsa.set_updated_at();
drop trigger if exists runs_set_updated_at on uspsa.runs;
create trigger runs_set_updated_at before insert or update on uspsa.runs
  for each row execute function uspsa.set_updated_at();
drop trigger if exists plans_set_updated_at on uspsa.plans;
create trigger plans_set_updated_at before insert or update on uspsa.plans
  for each row execute function uspsa.set_updated_at();

-- ─────────────────────────────────────────
-- Row-level security: a user sees and writes only their own rows.
-- select/insert/update only — deletes are soft, so there is deliberately no
-- delete policy (physical deletes are impossible through the API).
-- ─────────────────────────────────────────
alter table uspsa.profiles enable row level security;
alter table uspsa.sessions enable row level security;
alter table uspsa.runs     enable row level security;
alter table uspsa.plans    enable row level security;

-- profiles keyed by user_id itself
drop policy if exists profiles_select on uspsa.profiles;
create policy profiles_select on uspsa.profiles for select using (user_id = auth.uid());
drop policy if exists profiles_insert on uspsa.profiles;
create policy profiles_insert on uspsa.profiles for insert with check (user_id = auth.uid());
drop policy if exists profiles_update on uspsa.profiles;
create policy profiles_update on uspsa.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['sessions', 'runs', 'plans'] loop
    execute format('drop policy if exists %I_select on uspsa.%I', t, t);
    execute format('create policy %I_select on uspsa.%I for select using (user_id = auth.uid())', t, t);
    execute format('drop policy if exists %I_insert on uspsa.%I', t, t);
    execute format('create policy %I_insert on uspsa.%I for insert with check (user_id = auth.uid())', t, t);
    execute format('drop policy if exists %I_update on uspsa.%I', t, t);
    execute format('create policy %I_update on uspsa.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t, t);
  end loop;
end $$;

-- Expose the schema to PostgREST (Supabase API). The role grants let RLS do the
-- actual per-row gating; without table grants the API returns 401 before RLS.
grant usage on schema uspsa to anon, authenticated, service_role;
grant select, insert, update on all tables in schema uspsa to authenticated;
grant select, insert, update on all tables in schema uspsa to service_role;
