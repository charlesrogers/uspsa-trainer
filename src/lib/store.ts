// Client-side data store using localStorage for Stage 1 MVP
// Will be replaced with Drizzle + Postgres in production

import { drills, skills, sources, drillSkillMaps, allBenchmarks } from "@/data/seed";
import type { DrillBenchmark } from "@/data/seed";

// ─────────────────────────────────────────
// USER PROFILE
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

export function getProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  const raw = localStorage.getItem("uspsa_profile");
  return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem("uspsa_profile", JSON.stringify(profile));
}

// ─────────────────────────────────────────
// SESSIONS & RUNS
// ─────────────────────────────────────────
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

export function getSessions(): Session[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("uspsa_sessions");
  return raw ? JSON.parse(raw) : [];
}

function saveSessions(sessions: Session[]) {
  localStorage.setItem("uspsa_sessions", JSON.stringify(sessions));
}

export function createSession(session: Session) {
  const sessions = getSessions();
  sessions.unshift(session);
  saveSessions(sessions);
}

export function endSession(sessionId: string) {
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.endedAt = new Date().toISOString();
    saveSessions(sessions);
  }
}

export function getRuns(): SessionRun[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("uspsa_runs");
  return raw ? JSON.parse(raw) : [];
}

function saveRuns(runs: SessionRun[]) {
  localStorage.setItem("uspsa_runs", JSON.stringify(runs));
}

export function addRun(run: SessionRun) {
  const runs = getRuns();
  runs.push(run);
  saveRuns(runs);
}

export function updateRun(runId: string, updates: Partial<SessionRun>) {
  const runs = getRuns();
  const idx = runs.findIndex(r => r.id === runId);
  if (idx >= 0) {
    runs[idx] = { ...runs[idx], ...updates };
    saveRuns(runs);
  }
}

export function getSessionRuns(sessionId: string): SessionRun[] {
  return getRuns().filter(r => r.sessionId === sessionId);
}

// ─────────────────────────────────────────
// DRILL LOOKUPS
// ─────────────────────────────────────────
export function getDrill(id: string) {
  return drills.find(d => d.id === id);
}

export function getDrillBenchmarks(drillId: string, fireMode: string = "live_fire"): DrillBenchmark[] {
  return allBenchmarks.filter(b => b.drillId === drillId && b.fireMode === fireMode);
}

export function getDrillBenchmarkAtDistance(drillId: string, classification: string, distance: number, fireMode: string = "live_fire"): DrillBenchmark | undefined {
  return allBenchmarks.find(
    b => b.drillId === drillId && b.classification === classification && b.distanceYards === distance && b.fireMode === fireMode
  );
}

export function getDrillSkills(drillId: string) {
  const maps = drillSkillMaps.filter(m => m.drillId === drillId);
  return maps.map(m => ({
    ...m,
    skill: skills.find(s => s.id === m.skillId)!,
  })).filter(m => m.skill);
}

export function getRunsForDrill(drillId: string): SessionRun[] {
  return getRuns().filter(r => r.drillId === drillId && r.isValid);
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
  if (distance) runs = runs.filter(r => r.distanceYards === distance);
  if (runs.length === 0) return null;
  return runs.reduce((best, r) => r.totalTime < best.totalTime ? r : best);
}

export function getSessionStats(sessionId: string) {
  const runs = getSessionRuns(sessionId);
  const validRuns = runs.filter(r => r.isValid);
  const totalRounds = validRuns.reduce((sum, r) => {
    const drill = getDrill(r.drillId);
    return sum + (drill?.roundCount || 0);
  }, 0);
  const drillIds = [...new Set(validRuns.map(r => r.drillId))];
  return {
    totalRuns: runs.length,
    validRuns: validRuns.length,
    totalRounds,
    drillCount: drillIds.length,
    drillNames: drillIds.map(id => getDrill(id)?.name || "Unknown"),
  };
}

export function getTodaySessions(): Session[] {
  const today = new Date().toISOString().slice(0, 10);
  return getSessions().filter(s => s.startedAt.slice(0, 10) === today);
}

export function getTodayStats() {
  const sessions = getTodaySessions();
  let totalRuns = 0;
  let totalRounds = 0;
  let totalDrills = new Set<string>();

  for (const session of sessions) {
    const runs = getSessionRuns(session.id).filter(r => r.isValid);
    totalRuns += runs.length;
    for (const run of runs) {
      totalDrills.add(run.drillId);
      const drill = getDrill(run.drillId);
      totalRounds += drill?.roundCount || 0;
    }
  }

  return { drills: totalDrills.size, rounds: totalRounds, runs: totalRuns };
}

// Re-export seed data for direct access
export { drills, skills, sources, drillSkillMaps, allBenchmarks };
