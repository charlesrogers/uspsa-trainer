// Durability, migration and backup — the real IndexedDB path via fake-indexeddb.
// Unlike the engine tests, these do NOT seed the cache directly: they write
// through the store, drop the connection, and hydrate from IndexedDB to prove
// the data actually persisted.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as db from "../storage/db";
import {
  hydrateStore, flushPendingWrites, __resetCacheForTests,
  getProfile, saveProfile, getRuns, addRun, getSessions, createSession,
} from "../store";
import { getConstraints } from "../recommendations";
import { computeAllSkillEstimates } from "../skillEstimation";
import { makeRun, makeSession } from "./harness";
import { buildBackup, serializeBackup, parseBackup, importBackup, backupFilename } from "../backup";

const getConstraintsProbe = getConstraints;
const computeAllSkillEstimatesProbe = computeAllSkillEstimates;

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(k: string) { return this.map.has(k) ? this.map.get(k)! : null; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  removeItem(k: string) { this.map.delete(k); }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
}

let ls: MemoryStorage;

beforeEach(async () => {
  await db.deleteDatabase();
  __resetCacheForTests();
  ls = new MemoryStorage();
  vi.stubGlobal("localStorage", ls);
  vi.stubGlobal("window", { localStorage: ls });
});

afterEach(async () => {
  vi.unstubAllGlobals();
  await db.deleteDatabase();
});

describe("durability round-trip", () => {
  it("survives dropping the in-memory cache (data is in IndexedDB)", async () => {
    await hydrateStore();
    saveProfile({ ...getProfile(), displayName: "Charles", targetClassification: "A" });
    createSession(makeSession({ id: "s1" }));
    addRun(makeRun({ id: "r1", sessionId: "s1", totalTime: 1.8 }));
    await flushPendingWrites();

    // Simulate a fresh page load: cache gone, IndexedDB intact.
    __resetCacheForTests();
    expect(getRuns()).toEqual([]); // cache really is empty
    await hydrateStore();

    expect(getProfile().displayName).toBe("Charles");
    expect(getProfile().targetClassification).toBe("A");
    expect(getSessions().map((s) => s.id)).toEqual(["s1"]);
    expect(getRuns().map((r) => r.id)).toEqual(["r1"]);
  });

  it("clearing localStorage does not lose data", async () => {
    await hydrateStore();
    addRun(makeRun({ id: "r1" }));
    await flushPendingWrites();

    ls.clear(); // the exact failure M1 exists to prevent
    __resetCacheForTests();
    await hydrateStore();
    expect(getRuns().map((r) => r.id)).toEqual(["r1"]);
  });
});

describe("legacy localStorage migration", () => {
  it("copies legacy keys into IndexedDB and preserves originals renamed", async () => {
    ls.setItem("uspsa_profile", JSON.stringify({ displayName: "Legacy", targetClassification: "M" }));
    ls.setItem("uspsa_sessions", JSON.stringify([{ id: "s1", startedAt: "2026-01-01T00:00:00Z", endedAt: null, fireMode: "live_fire", location: "R", notes: "" }]));
    ls.setItem("uspsa_runs", JSON.stringify([{ id: "r1", sessionId: "s1", drillId: "dr-pairs", runNumber: 1, isValid: true, isCold: false, fireMode: "live_fire", distanceYards: 7, totalTime: 2, firstShotTime: 1, splits: [], pointsDown: 0, dryFireCallPct: null, capturedAt: "2026-01-01T00:00:00Z" }]));
    ls.setItem("uspsa_constraints", JSON.stringify({ fireMode: "dry_fire", movementAvailable: false, timeMinutes: 45, maxDistance: 10 }));

    await hydrateStore();

    expect(getProfile().displayName).toBe("Legacy");
    expect(getProfile().targetClassification).toBe("M");
    expect(getRuns().map((r) => r.id)).toEqual(["r1"]);
    expect(getSessions().map((s) => s.id)).toEqual(["s1"]);
    expect(getConstraintsProbe().timeMinutes).toBe(45);

    // Originals preserved under a _migrated_ prefix, not deleted.
    expect(ls.getItem("uspsa_runs")).toBeNull();
    expect(ls.getItem("_migrated_uspsa_runs")).not.toBeNull();
  });

  it("is idempotent — a second hydrate does not double-import or wipe new data", async () => {
    ls.setItem("uspsa_runs", JSON.stringify([{ id: "r1", sessionId: "s1", drillId: "dr-pairs", runNumber: 1, isValid: true, isCold: false, fireMode: "live_fire", distanceYards: 7, totalTime: 2, firstShotTime: 1, splits: [], pointsDown: 0, dryFireCallPct: null, capturedAt: "2026-01-01T00:00:00Z" }]));
    ls.setItem("uspsa_sessions", JSON.stringify([{ id: "s1", startedAt: "2026-01-01T00:00:00Z", endedAt: null, fireMode: "live_fire", location: "R", notes: "" }]));
    await hydrateStore();
    addRun(makeRun({ id: "r2", sessionId: "s1" }));
    await flushPendingWrites();

    __resetCacheForTests();
    await hydrateStore(); // second load — migration must be a no-op now
    expect(getRuns().map((r) => r.id).sort()).toEqual(["r1", "r2"]);
  });
});

describe("export / import", () => {
  // Skill estimates carry a time-dependent recency decay (0.97^daysSince using
  // Date.now()), so two computations milliseconds apart differ in FP noise.
  // Losslessness is about the DATA; estimates are asserted to a tight tolerance.
  const masteries = () =>
    computeAllSkillEstimatesProbe().map((e) => ({ id: e.skillId, m: e.mastery, s: e.signalCount }));

  it("round-trips losslessly, including skill estimates", async () => {
    await hydrateStore();
    saveProfile({ ...getProfile(), targetClassification: "B" });
    createSession(makeSession({ id: "s1" }));
    const originalRuns = [
      makeRun({ id: "r1", sessionId: "s1", drillId: "dr-pairs", distanceYards: 7, totalTime: 1.6, pointsDown: 0 }),
      makeRun({ id: "r2", sessionId: "s1", drillId: "dr-pairs", distanceYards: 7, totalTime: 2.0, pointsDown: 2 }),
    ];
    originalRuns.forEach(addRun);
    await flushPendingWrites();

    const beforeRuns = structuredClone(getRuns());
    const beforeMasteries = masteries();
    const json = serializeBackup(buildBackup("1.0.0", "2026-07-16T00:00:00.000Z"));

    // Wipe everything, then import.
    await db.deleteDatabase();
    ls.clear();
    __resetCacheForTests();
    await hydrateStore();
    expect(getRuns()).toEqual([]);

    const summary = importBackup(parseBackup(json));
    await flushPendingWrites();

    expect(summary.importedRuns).toBe(2);
    expect(summary.importedSessions).toBe(1);
    expect(summary.profileRestored).toBe(true);
    expect(getProfile().targetClassification).toBe("B");
    // Data is bit-for-bit identical (the real losslessness guarantee).
    expect(getRuns()).toEqual(beforeRuns);
    // Estimates match to tolerance.
    const after = masteries();
    expect(after.map((e) => e.id)).toEqual(beforeMasteries.map((e) => e.id));
    after.forEach((e, i) => {
      expect(e.s).toBe(beforeMasteries[i].s);
      expect(e.m).toBeCloseTo(beforeMasteries[i].m, 6);
    });

    // And it's durable: reload from IndexedDB, data still identical.
    __resetCacheForTests();
    await hydrateStore();
    expect(getRuns()).toEqual(beforeRuns);
  });

  it("merges by id — existing wins, new added, duplicates skipped", async () => {
    await hydrateStore();
    createSession(makeSession({ id: "s1", startedAt: "2026-01-01T00:00:00Z" }));
    addRun(makeRun({ id: "r1", sessionId: "s1", totalTime: 1.5 }));
    await flushPendingWrites();

    // A backup that has r1 (dup, different time) and r2 (new).
    const snapshot = {
      schemaVersion: 1, appVersion: "1.0.0", exportedAt: "2026-07-16T00:00:00.000Z",
      profile: getProfile(),
      sessions: [
        makeSession({ id: "s1", startedAt: "2026-01-01T00:00:00Z" }),
        makeSession({ id: "s2", startedAt: "2026-02-01T00:00:00Z" }),
      ],
      runs: [
        makeRun({ id: "r1", sessionId: "s1", totalTime: 99 }), // dup — must be ignored
        makeRun({ id: "r2", sessionId: "s2", totalTime: 2.2 }),
      ],
      plans: {},
    };
    const summary = importBackup(snapshot);
    await flushPendingWrites();

    expect(summary.importedRuns).toBe(1);
    expect(summary.skippedRuns).toBe(1);
    expect(getRuns().find((r) => r.id === "r1")!.totalTime).toBe(1.5); // existing won
    expect(getRuns().map((r) => r.id).sort()).toEqual(["r1", "r2"]);
    expect(getSessions().map((s) => s.id).sort()).toEqual(["s1", "s2"]);
  });

  it("rejects corrupt JSON with zero writes", async () => {
    await hydrateStore();
    addRun(makeRun({ id: "r1" }));
    await flushPendingWrites();

    expect(() => parseBackup("{ truncated")).toThrow(/valid JSON/i);
    expect(getRuns().map((r) => r.id)).toEqual(["r1"]); // untouched
  });

  it("rejects a backup with dangling run references", () => {
    const bad = JSON.stringify({
      schemaVersion: 1, appVersion: "x", exportedAt: "x",
      profile: getProfile(), sessions: [{ id: "s1" }],
      runs: [{ id: "r1", sessionId: "GHOST" }], plans: {},
    });
    expect(() => parseBackup(bad)).toThrow(/session that isn't in the backup/i);
  });

  it("rejects a backup from a newer schema", () => {
    const future = JSON.stringify({
      schemaVersion: db.DB_VERSION + 1, appVersion: "x", exportedAt: "x",
      profile: {}, sessions: [], runs: [], plans: {},
    });
    expect(() => parseBackup(future)).toThrow(/newer than this app supports/i);
  });

  it("names the backup file by date", () => {
    expect(backupFilename("2026-07-16T12:00:00.000Z")).toBe("uspsa-trainer-backup-2026-07-16.json");
  });
});
