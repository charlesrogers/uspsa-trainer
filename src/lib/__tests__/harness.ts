// Shared test harness.
//
// store.ts and friends read the browser globals `window` and `localStorage`
// directly. Rather than pull in a DOM environment (jsdom is not on M0's
// approved dependency list), we stub both globals with an in-memory Storage.

import { vi } from "vitest";
import type { Session, SessionRun } from "../store";

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

export function installBrowserEnv(): Storage {
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

/** Write runs straight to the backing store the way the app persists them. */
export function seedRuns(runs: SessionRun[]) {
  localStorage.setItem("uspsa_runs", JSON.stringify(runs));
}

export function seedSessions(sessions: Session[]) {
  localStorage.setItem("uspsa_sessions", JSON.stringify(sessions));
}

export function seedProfile(profile: Record<string, unknown>) {
  localStorage.setItem("uspsa_profile", JSON.stringify(profile));
}
