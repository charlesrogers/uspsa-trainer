// Shared test harness.
//
// M1: the store now reads from an in-memory cache backed by IndexedDB, not
// localStorage. Engine tests seed that cache directly and synchronously via the
// store's __seed hook — the compute math is identical regardless of how the
// data got there, and this keeps the M0 assertions untouched. The real
// IndexedDB/migration/export paths are exercised in storage.test.ts using
// fake-indexeddb.

import "fake-indexeddb/auto"; // gives write-through persistence somewhere to go
import { vi } from "vitest";
import type { Session, SessionRun } from "../store";
import { __resetCacheForTests, __seedCacheForTests } from "../store";

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value));
  }
}

/** Reset the store cache and stub browser globals. Call in beforeEach. */
export function installBrowserEnv(): Storage {
  __resetCacheForTests();
  const storage = new MemoryStorage();
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage });
  return storage;
}

export function uninstallBrowserEnv() {
  vi.unstubAllGlobals();
}

// ─── Fixture factories ───

let runSeq = 0;

export function makeRun(overrides: Partial<SessionRun> = {}): SessionRun {
  runSeq++;
  return {
    id: `run-${runSeq}`,
    sessionId: "sess-1",
    drillId: "dr-pairs",
    runNumber: runSeq,
    isValid: true,
    isCold: false,
    fireMode: "live_fire",
    distanceYards: 7,
    totalTime: 2.0,
    firstShotTime: 1.0,
    splits: [0.25],
    pointsDown: 0,
    dryFireCallPct: null,
    capturedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "sess-1",
    startedAt: new Date().toISOString(),
    endedAt: null,
    fireMode: "live_fire",
    location: "Range",
    notes: "",
    ...overrides,
  };
}

// Seed the store cache directly (synchronous). Sessions are stored newest-first
// to match createSession()'s ordering.
export function seedRuns(runs: SessionRun[]) {
  __seedCacheForTests({ runs });
}

export function seedSessions(sessions: Session[]) {
  __seedCacheForTests({ sessions });
}

export function seedProfile(profile: Record<string, unknown>) {
  __seedCacheForTests({ profile });
}
