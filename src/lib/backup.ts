// Backup export / import.
//
// Export produces a self-describing JSON snapshot. Import is defensive by
// design: it parses and FULLY VALIDATES (schema version + shape + referential
// integrity) before a single write, then merges by id — existing records win,
// new ones are added — so an import can never clobber or partially corrupt
// live data. A truncated or malformed file is rejected with a readable message
// and zero writes.

import {
  getProfile, getSessions, getRuns, replaceAll, snapshotForExport,
  type UserProfile, type Session, type SessionRun, type BackupSnapshot,
} from "./store";
import { getPlanValue } from "./store";
import { DB_VERSION } from "./storage/db";

export type { BackupSnapshot };

const DEFAULT_PROFILE: UserProfile = {
  displayName: "", uspsa_number: "", classification: "C", targetClassification: "B",
  division: "Production", equipment: "", optic: "iron", dailyXpGoal: 30,
};

const PLAN_KEYS = ["session_plan", "plan_progress", "constraints"];

export interface ImportSummary {
  importedSessions: number;
  importedRuns: number;
  skippedSessions: number; // id already present — existing kept
  skippedRuns: number;
  profileRestored: boolean;
}

export function buildBackup(appVersion: string, exportedAt: string): BackupSnapshot {
  return snapshotForExport(appVersion, exportedAt);
}

export function serializeBackup(snapshot: BackupSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

/** Parse + validate a backup file. Throws Error with a readable message on any
 *  problem; never touches storage. */
export function parseBackup(text: string): BackupSnapshot {
  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error("This file isn't valid JSON — it may be truncated or corrupted.");
  }

  const problems = validateShape(obj);
  if (problems.length > 0) {
    throw new Error(`This backup can't be imported:\n• ${problems.join("\n• ")}`);
  }
  return obj as BackupSnapshot;
}

function validateShape(obj: unknown): string[] {
  const problems: string[] = [];
  if (typeof obj !== "object" || obj === null) {
    return ["The file is not a backup object."];
  }
  const b = obj as Record<string, unknown>;

  if (typeof b.schemaVersion !== "number") {
    problems.push("Missing schema version.");
  } else if (b.schemaVersion > DB_VERSION) {
    problems.push(
      `Backup schema v${b.schemaVersion} is newer than this app supports (v${DB_VERSION}). Update the app first.`
    );
  }
  if (typeof b.profile !== "object" || b.profile === null) problems.push("Missing profile.");
  if (!Array.isArray(b.sessions)) problems.push("Missing sessions list.");
  if (!Array.isArray(b.runs)) problems.push("Missing runs list.");

  // Referential integrity: every run must belong to a session in the file.
  if (Array.isArray(b.sessions) && Array.isArray(b.runs)) {
    const sessionIds = new Set((b.sessions as Session[]).map((s) => s?.id));
    const orphanCount = (b.runs as SessionRun[]).filter((r) => !sessionIds.has(r?.sessionId)).length;
    if (orphanCount > 0) {
      problems.push(`${orphanCount} run(s) reference a session that isn't in the backup.`);
    }
  }
  return problems;
}

/** Merge a validated snapshot into current data (existing ids win) and persist.
 *  Returns a summary for user confirmation feedback. */
export function importBackup(snapshot: BackupSnapshot): ImportSummary {
  const currentProfile = getProfile();
  const currentSessions = getSessions();
  const currentRuns = getRuns();

  const sessionIds = new Set(currentSessions.map((s) => s.id));
  const runIds = new Set(currentRuns.map((r) => r.id));

  const newSessions = snapshot.sessions.filter((s) => !sessionIds.has(s.id));
  const newRuns = snapshot.runs.filter((r) => !runIds.has(r.id));

  // Sessions render newest-first; keep that ordering after the merge.
  const mergedSessions = [...currentSessions, ...newSessions].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt)
  );
  const mergedRuns = [...currentRuns, ...newRuns];

  // Profile: only adopt the backup's profile if the current one is untouched
  // (fresh/wiped device). Otherwise the existing profile wins.
  const profileIsDefault = JSON.stringify(currentProfile) === JSON.stringify(DEFAULT_PROFILE);
  const profileRestored = profileIsDefault && !!snapshot.profile;
  const mergedProfile = profileRestored ? snapshot.profile : currentProfile;

  // Plans: restore only keys not already present locally.
  const mergedPlans = new Map<string, unknown>();
  for (const key of PLAN_KEYS) {
    const current = getPlanValue<unknown>(key, undefined);
    if (current !== undefined) mergedPlans.set(key, current);
    else if (snapshot.plans && snapshot.plans[key] !== undefined) mergedPlans.set(key, snapshot.plans[key]);
  }

  replaceAll({
    profile: mergedProfile,
    sessions: mergedSessions,
    runs: mergedRuns,
    plans: mergedPlans,
  });

  return {
    importedSessions: newSessions.length,
    importedRuns: newRuns.length,
    skippedSessions: snapshot.sessions.length - newSessions.length,
    skippedRuns: snapshot.runs.length - newRuns.length,
    profileRestored,
  };
}

export function backupFilename(dateISO: string): string {
  return `uspsa-trainer-backup-${dateISO.slice(0, 10)}.json`;
}
