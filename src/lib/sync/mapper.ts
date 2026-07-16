// The single translation point between the app's camelCase TypeScript models
// and the snake_case `uspsa` Postgres rows. Sync code touches nothing but this
// module for shape conversion, so the mapping lives in exactly one tested place.
//
// updated_at is deliberately NOT written from the client — the DB trigger sets
// it with the server clock. On read it comes back from the server and drives
// last-write-wins. deleted_at carries soft deletes in both directions.

import type { UserProfile, Session, SessionRun } from "../store";

export type SyncTable = "profiles" | "sessions" | "runs" | "plans";

// ── Row shapes (what crosses the wire to/from Supabase) ──

export interface ProfileRow {
  user_id: string;
  display_name: string;
  uspsa_number: string;
  classification: string;
  target_classification: string;
  division: string;
  equipment: string;
  optic: string;
  daily_xp_goal: number;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface SessionRow {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  fire_mode: string;
  location: string;
  notes: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface RunRow {
  id: string;
  user_id: string;
  session_id: string;
  drill_id: string;
  run_number: number;
  is_valid: boolean;
  is_cold: boolean;
  fire_mode: string;
  distance_yards: number;
  total_time: number;
  first_shot_time: number | null;
  splits: number[];
  points_down: number | null;
  dry_fire_call_pct: number | null;
  captured_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PlanRow {
  user_id: string;
  key: string;
  value: unknown;
  updated_at?: string;
  deleted_at?: string | null;
}

// ── profiles ──

export function profileToDb(profile: UserProfile, userId: string): ProfileRow {
  return {
    user_id: userId,
    display_name: profile.displayName,
    uspsa_number: profile.uspsa_number,
    classification: profile.classification,
    target_classification: profile.targetClassification,
    division: profile.division,
    equipment: profile.equipment,
    optic: profile.optic,
    daily_xp_goal: profile.dailyXpGoal,
  };
}

export function profileFromDb(row: ProfileRow): UserProfile {
  return {
    displayName: row.display_name,
    uspsa_number: row.uspsa_number,
    classification: row.classification,
    targetClassification: row.target_classification,
    division: row.division,
    equipment: row.equipment,
    optic: row.optic === "red_dot" ? "red_dot" : "iron",
    dailyXpGoal: row.daily_xp_goal,
  };
}

// ── sessions ──

export function sessionToDb(session: Session, userId: string): SessionRow {
  return {
    id: session.id,
    user_id: userId,
    started_at: session.startedAt,
    ended_at: session.endedAt,
    fire_mode: session.fireMode,
    location: session.location,
    notes: session.notes,
  };
}

export function sessionFromDb(row: SessionRow): Session {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    fireMode: row.fire_mode === "dry_fire" ? "dry_fire" : "live_fire",
    location: row.location,
    notes: row.notes,
  };
}

// ── runs ──

export function runToDb(run: SessionRun, userId: string): RunRow {
  return {
    id: run.id,
    user_id: userId,
    session_id: run.sessionId,
    drill_id: run.drillId,
    run_number: run.runNumber,
    is_valid: run.isValid,
    is_cold: run.isCold,
    fire_mode: run.fireMode,
    distance_yards: run.distanceYards,
    total_time: run.totalTime,
    first_shot_time: run.firstShotTime,
    splits: run.splits,
    points_down: run.pointsDown,
    dry_fire_call_pct: run.dryFireCallPct,
    captured_at: run.capturedAt,
  };
}

export function runFromDb(row: RunRow): SessionRun {
  return {
    id: row.id,
    sessionId: row.session_id,
    drillId: row.drill_id,
    runNumber: row.run_number,
    isValid: row.is_valid,
    isCold: row.is_cold,
    fireMode: row.fire_mode === "dry_fire" ? "dry_fire" : "live_fire",
    distanceYards: Number(row.distance_yards),
    totalTime: Number(row.total_time),
    firstShotTime: row.first_shot_time === null ? null : Number(row.first_shot_time),
    splits: Array.isArray(row.splits) ? row.splits.map(Number) : [],
    pointsDown: row.points_down === null ? null : row.points_down,
    dryFireCallPct: row.dry_fire_call_pct === null ? null : row.dry_fire_call_pct,
    capturedAt: row.captured_at,
  };
}

// ── plans (kv) ──

export function planToDb(key: string, value: unknown, userId: string): PlanRow {
  return { user_id: userId, key, value };
}

export function planFromDb(row: PlanRow): { key: string; value: unknown } {
  return { key: row.key, value: row.value };
}
