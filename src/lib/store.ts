// Client-side data store.
//
// DURABILITY MODEL (M1): IndexedDB (storage/db.ts) is the source of truth. This
// module keeps an in-memory cache that mirrors it, so the synchronous compute
// engine (skillEstimation, trends, recommendations, sessionPlanner) can read
// without awaiting IO. Reads are sync (cache); writes update the cache
// synchronously and persist to IndexedDB asynchronously through ONE choke-point
// that surfaces QuotaExceededError instead of silently dropping the write.
//
// hydrateStore() must run once on the client before data-dependent UI reads —
// AppShell gates on it. Until then the cache holds defaults/empties, which is
// exactly the existing first-paint empty state.

import { drills, skills, sources, drillSkillMaps, allBenchmarks } from "@/data/seed";
import type { DrillBenchmark } from "@/data/seed";
import * as db from "./storage/db";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface UserProfile {
  displayName: string;
  uspsa_number: string;
  classification: string;
  targetClassification: string;
  division: string;
  equipment: string;
  optic: "iron" | "red_dot";
  dailyXpGoal: number;
}

const DEFAULT_PROFILE: UserProfile = {
  displayName: "",
  uspsa_number: "",
  classification: "C",
  targetClassification: "B",
  division: "Production",
  equipment: "",
  optic: "iron",
  dailyXpGoal: 30,
};

export interface Session {
  id: string;
  startedAt: string;
  endedAt: string | null;
  fireMode: "live_fire" | "dry_fire";
  location: string;
  notes: string;
}

export interface SessionRun {
  id: string;
  sessionId: string;
  drillId: string;
  runNumber: number;
  isValid: boolean;
  isCold: boolean;
  fireMode: "live_fire" | "dry_fire";
  distanceYards: number;
  totalTime: number;
  firstShotTime: number | null;
  splits: number[];
  pointsDown: number | null;
  dryFireCallPct: number | null; // 0-100, % of reps with acceptable sight picture at break
  capturedAt: string;
}

// ─────────────────────────────────────────
// IN-MEMORY CACHE
// ─────────────────────────────────────────
interface Cache {
  profile: UserProfile;
  sessions: Session[];
  runs: SessionRun[];
  plans: Map<string, unknown>;
  meta: Map<string, unknown>;
  hydrated: boolean;
}

const cache: Cache = {
  profile: { ...DEFAULT_PROFILE },
  sessions: [],
  runs: [],
  plans: new Map(),
  meta: new Map(),
  hydrated: false,
};

export function isHydrated(): boolean {
  return cache.hydrated;
}

// ── QuotaExceeded banner pub/sub — a full disk must be visible, never silent ──
type QuotaListener = () => void;
const quotaListeners = new Set<QuotaListener>();
let quotaHit = false;

export function onStorageFull(fn: QuotaListener): () => void {
  quotaListeners.add(fn);
  return () => quotaListeners.delete(fn);
}
export function isStorageFull(): boolean {
  return quotaHit;
}

// In-flight persistence promises, so durability can be awaited (tests, and a
// flush on page-hide) even though writes are otherwise fire-and-forget.
const inFlight = new Set<Promise<void>>();

/** The single write choke-point. Cache is already updated by the caller; this
 *  persists to IndexedDB and makes a quota failure loud. */
function persist(run: () => Promise<void>): void {
  const p = run()
    .catch((err: unknown) => {
      const name = (err as { name?: string })?.name;
      if (name === "QuotaExceededError") {
        quotaHit = true;
        quotaListeners.forEach((fn) => fn());
        console.error("[store] storage full — write not persisted", err);
      } else {
        console.error("[store] persist failed", err);
      }
    })
    .finally(() => inFlight.delete(p));
  inFlight.add(p);
}

/** Await all pending IndexedDB writes. Call before relying on durability. */
export async function flushPendingWrites(): Promise<void> {
  await Promise.allSettled([...inFlight]);
}

// ─────────────────────────────────────────
// HYDRATION + MIGRATION
// ─────────────────────────────────────────
const LEGACY_KEYS = {
  profile: "uspsa_profile",
  sessions: "uspsa_sessions",
  runs: "uspsa_runs",
  session_plan: "uspsa_session_plan",
  plan_progress: "uspsa_plan_progress",
  constraints: "uspsa_constraints",
  imported_matches: "uspsa_imported_matches",
  ble_last_device: "ble_last_device",
} as const;

/** One-time copy of any legacy localStorage data into IndexedDB. Belt-and-
 *  suspenders: originals are renamed with a `_migrated_` prefix, never deleted. */
async function migrateFromLocalStorage(): Promise<void> {
  if (typeof localStorage === "undefined") return;
  if (await db.getKV<boolean>("meta", "ls_migrated")) return;

  const read = (k: string): unknown => {
    const raw = localStorage.getItem(k);
    if (raw === null) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  };

  const profile = read(LEGACY_KEYS.profile);
  if (profile && typeof profile === "object") {
    await db.putKV("profile", "current", { ...DEFAULT_PROFILE, ...(profile as object) });
  }
  const sessions = read(LEGACY_KEYS.sessions);
  if (Array.isArray(sessions)) await db.putAll("sessions", sessions);
  const runs = read(LEGACY_KEYS.runs);
  if (Array.isArray(runs)) await db.putAll("runs", runs);

  for (const key of ["session_plan", "plan_progress", "constraints"] as const) {
    const v = read(LEGACY_KEYS[key]);
    if (v !== undefined) await db.putKV("plans", key, v);
  }
  const imported = read(LEGACY_KEYS.imported_matches);
  if (imported !== undefined) await db.putKV("meta", "imported_matches", imported);
  const bleDevice = localStorage.getItem(LEGACY_KEYS.ble_last_device);
  if (bleDevice) await db.putKV("meta", "ble_last_device", bleDevice);

  // Rename originals so a re-run can't double-migrate, but the data is never lost.
  for (const k of Object.values(LEGACY_KEYS)) {
    const raw = localStorage.getItem(k);
    if (raw !== null) {
      localStorage.setItem(`_migrated_${k}`, raw);
      localStorage.removeItem(k);
    }
  }
  await db.putKV("meta", "ls_migrated", true);
}

/** Load IndexedDB into the in-memory cache. Idempotent; call once on the client
 *  before data-dependent UI renders. Safe to fail (e.g. SSR) — cache stays at
 *  defaults and the app shows its empty state. */
export async function hydrateStore(): Promise<void> {
  try {
    await migrateFromLocalStorage();
    const [profile, sessions, runs, plans, meta] = await Promise.all([
      db.getKV<UserProfile>("profile", "current"),
      db.getAll<Session>("sessions"),
      db.getAll<SessionRun>("runs"),
      db.getAllKV<unknown>("plans"),
      db.getAllKV<unknown>("meta"),
    ]);
    cache.profile = { ...DEFAULT_PROFILE, ...(profile ?? {}) };
    cache.sessions = sessions;
    cache.runs = runs;
    cache.plans = new Map(plans);
    cache.meta = new Map(meta);
  } catch (err) {
    console.error("[store] hydrate failed — using in-memory defaults", err);
  } finally {
    cache.hydrated = true;
  }
}

// ─────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────
export function getProfile(): UserProfile {
  return cache.profile;
}

export function saveProfile(profile: UserProfile): void {
  cache.profile = profile;
  persist(() => db.putKV("profile", "current", profile));
}

// ─────────────────────────────────────────
// SESSIONS & RUNS
// ─────────────────────────────────────────
export function getSessions(): Session[] {
  // Newest first — createSession maintains this order in the cache.
  return cache.sessions;
}

export function createSession(session: Session): void {
  cache.sessions.unshift(session);
  persist(() => db.put("sessions", session));
}

export function endSession(sessionId: string): void {
  const session = cache.sessions.find((s) => s.id === sessionId);
  if (!session) return;
  session.endedAt = new Date().toISOString();
  persist(() => db.put("sessions", session));
}

export function getRuns(): SessionRun[] {
  return cache.runs;
}

export function addRun(run: SessionRun): void {
  cache.runs.push(run);
  persist(() => db.put("runs", run));
}

export function updateRun(runId: string, updates: Partial<SessionRun>): void {
  const idx = cache.runs.findIndex((r) => r.id === runId);
  if (idx < 0) return;
  cache.runs[idx] = { ...cache.runs[idx], ...updates };
  const updated = cache.runs[idx];
  persist(() => db.put("runs", updated));
}

export function getSessionRuns(sessionId: string): SessionRun[] {
  return cache.runs.filter((r) => r.sessionId === sessionId);
}

// ─────────────────────────────────────────
// GENERIC KV — plans (session plan / progress / constraints) and meta
// (imported matches / ble device). Typed by the caller, so no import cycles.
// ─────────────────────────────────────────
export function getPlanValue<T>(key: string, fallback: T): T {
  return cache.plans.has(key) ? (cache.plans.get(key) as T) : fallback;
}
export function setPlanValue<T>(key: string, value: T): void {
  cache.plans.set(key, value);
  persist(() => db.putKV("plans", key, value));
}
export function removePlanValue(key: string): void {
  cache.plans.delete(key);
  persist(() => db.removeKV("plans", key));
}
export function getMetaValue<T>(key: string, fallback: T): T {
  return cache.meta.has(key) ? (cache.meta.get(key) as T) : fallback;
}
export function setMetaValue<T>(key: string, value: T): void {
  cache.meta.set(key, value);
  persist(() => db.putKV("meta", key, value));
}

// ─────────────────────────────────────────
// EXPORT / IMPORT snapshot (used by Settings backup)
// ─────────────────────────────────────────
export interface BackupSnapshot {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  profile: UserProfile;
  sessions: Session[];
  runs: SessionRun[];
  plans: Record<string, unknown>;
}

export function snapshotForExport(appVersion: string, exportedAt: string): BackupSnapshot {
  return {
    schemaVersion: db.DB_VERSION,
    appVersion,
    exportedAt,
    profile: cache.profile,
    sessions: cache.sessions,
    runs: cache.runs,
    plans: Object.fromEntries(cache.plans),
  };
}

/** Replace all durable data with a snapshot (used after an import merge builds
 *  the final state). Writes cache first, then persists every store. */
export function replaceAll(next: {
  profile: UserProfile;
  sessions: Session[];
  runs: SessionRun[];
  plans: Map<string, unknown>;
}): void {
  cache.profile = next.profile;
  cache.sessions = next.sessions;
  cache.runs = next.runs;
  cache.plans = next.plans;
  persist(async () => {
    await Promise.all([
      db.clear("sessions"),
      db.clear("runs"),
      db.clear("plans"),
    ]);
    await Promise.all([
      db.putKV("profile", "current", next.profile),
      db.putAll("sessions", next.sessions),
      db.putAll("runs", next.runs),
      ...[...next.plans].map(([k, v]) => db.putKV("plans", k, v)),
    ]);
  });
}

// ─────────────────────────────────────────
// DRILL LOOKUPS
// ─────────────────────────────────────────
export function getDrill(id: string) {
  return drills.find((d) => d.id === id);
}

export function getDrillBenchmarks(drillId: string, fireMode: string = "live_fire"): DrillBenchmark[] {
  return allBenchmarks.filter((b) => b.drillId === drillId && b.fireMode === fireMode);
}

export function getDrillBenchmarkAtDistance(drillId: string, classification: string, distance: number, fireMode: string = "live_fire"): DrillBenchmark | undefined {
  return allBenchmarks.find(
    (b) => b.drillId === drillId && b.classification === classification && b.distanceYards === distance && b.fireMode === fireMode
  );
}

export function getDrillSkills(drillId: string) {
  const maps = drillSkillMaps.filter((m) => m.drillId === drillId);
  return maps.map((m) => ({
    ...m,
    skill: skills.find((s) => s.id === m.skillId)!,
  })).filter((m) => m.skill);
}

export function getRunsForDrill(drillId: string): SessionRun[] {
  return cache.runs.filter((r) => r.drillId === drillId && r.isValid);
}

// ─────────────────────────────────────────
// COMPUTED METRICS
// ─────────────────────────────────────────
export function computeClassificationPct(time: number, drillId: string, distance: number, targetClass: string, fireMode: string = "live_fire"): number | null {
  const benchmark = getDrillBenchmarkAtDistance(drillId, targetClass, distance, fireMode);
  if (!benchmark) return null;
  return (benchmark.targetTime / time) * 100;
}

export function getBestTimeForDrill(drillId: string, distance?: number): SessionRun | null {
  let runs = getRunsForDrill(drillId);
  if (distance) runs = runs.filter((r) => r.distanceYards === distance);
  if (runs.length === 0) return null;
  return runs.reduce((best, r) => (r.totalTime < best.totalTime ? r : best));
}

export function getSessionStats(sessionId: string) {
  const runs = getSessionRuns(sessionId);
  const validRuns = runs.filter((r) => r.isValid);
  const totalRounds = validRuns.reduce((sum, r) => {
    const drill = getDrill(r.drillId);
    return sum + (drill?.roundCount || 0);
  }, 0);
  const drillIds = [...new Set(validRuns.map((r) => r.drillId))];
  return {
    totalRuns: runs.length,
    validRuns: validRuns.length,
    totalRounds,
    drillCount: drillIds.length,
    drillNames: drillIds.map((id) => getDrill(id)?.name || "Unknown"),
  };
}

export function getTodaySessions(): Session[] {
  const today = new Date().toISOString().slice(0, 10);
  return getSessions().filter((s) => s.startedAt.slice(0, 10) === today);
}

export function getTodayStats() {
  const sessions = getTodaySessions();
  let totalRuns = 0;
  let totalRounds = 0;
  const totalDrills = new Set<string>();

  for (const session of sessions) {
    const runs = getSessionRuns(session.id).filter((r) => r.isValid);
    totalRuns += runs.length;
    for (const run of runs) {
      totalDrills.add(run.drillId);
      const drill = getDrill(run.drillId);
      totalRounds += drill?.roundCount || 0;
    }
  }

  return { drills: totalDrills.size, rounds: totalRounds, runs: totalRuns };
}

// ─────────────────────────────────────────
// TEST-ONLY cache control (bypasses IndexedDB for fast, pure engine tests).
// Prefixed `__` and never called by app code.
// ─────────────────────────────────────────
export function __resetCacheForTests(): void {
  cache.profile = { ...DEFAULT_PROFILE };
  cache.sessions = [];
  cache.runs = [];
  cache.plans = new Map();
  cache.meta = new Map();
  cache.hydrated = false;
  quotaHit = false;
  quotaListeners.clear();
}

export function __seedCacheForTests(seed: {
  profile?: Partial<UserProfile>;
  sessions?: Session[];
  runs?: SessionRun[];
  plans?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}): void {
  if (seed.profile) cache.profile = { ...DEFAULT_PROFILE, ...seed.profile };
  if (seed.sessions) cache.sessions = seed.sessions;
  if (seed.runs) cache.runs = seed.runs;
  if (seed.plans) cache.plans = new Map(Object.entries(seed.plans));
  if (seed.meta) cache.meta = new Map(Object.entries(seed.meta));
  cache.hydrated = true;
}

// Re-export seed data for direct access
export { drills, skills, sources, drillSkillMaps, allBenchmarks };
