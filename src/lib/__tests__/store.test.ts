import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { installBrowserEnv, uninstallBrowserEnv, makeRun, makeSession, seedRuns, seedSessions } from "./harness";
import {
  getProfile, saveProfile,
  getSessions, createSession, endSession,
  getRuns, addRun, updateRun, getSessionRuns,
  getDrill, getDrillBenchmarks, getDrillBenchmarkAtDistance, getDrillSkills,
  getRunsForDrill, computeClassificationPct, getBestTimeForDrill,
  getSessionStats, getTodaySessions, getTodayStats,
  allBenchmarks,
} from "../store";

beforeEach(() => installBrowserEnv());
afterEach(() => uninstallBrowserEnv());

describe("profile", () => {
  it("returns defaults when nothing is stored", () => {
    const p = getProfile();
    expect(p.classification).toBe("C");
    expect(p.targetClassification).toBe("B");
    expect(p.dailyXpGoal).toBe(30);
  });

  it("merges stored values over defaults (partial profiles survive)", () => {
    localStorage.setItem("uspsa_profile", JSON.stringify({ displayName: "Charles" }));
    const p = getProfile();
    expect(p.displayName).toBe("Charles");
    expect(p.targetClassification).toBe("B"); // default preserved
  });

  it("round-trips a saved profile", () => {
    saveProfile({ ...getProfile(), displayName: "C", targetClassification: "A" });
    expect(getProfile().targetClassification).toBe("A");
  });
});

describe("sessions", () => {
  it("returns an empty list when nothing is stored", () => {
    expect(getSessions()).toEqual([]);
  });

  it("createSession prepends (newest first)", () => {
    createSession(makeSession({ id: "s1" }));
    createSession(makeSession({ id: "s2" }));
    expect(getSessions().map(s => s.id)).toEqual(["s2", "s1"]);
  });

  it("endSession stamps endedAt", () => {
    createSession(makeSession({ id: "s1" }));
    endSession("s1");
    expect(getSessions()[0].endedAt).not.toBeNull();
  });

  it("endSession on an unknown id is a no-op", () => {
    createSession(makeSession({ id: "s1" }));
    endSession("nope");
    expect(getSessions()[0].endedAt).toBeNull();
  });
});

describe("runs", () => {
  it("addRun appends, getSessionRuns filters by session", () => {
    addRun(makeRun({ id: "r1", sessionId: "s1" }));
    addRun(makeRun({ id: "r2", sessionId: "s2" }));
    expect(getRuns()).toHaveLength(2);
    expect(getSessionRuns("s1").map(r => r.id)).toEqual(["r1"]);
  });

  it("updateRun patches an existing run and ignores unknown ids", () => {
    addRun(makeRun({ id: "r1", totalTime: 2.0 }));
    updateRun("r1", { totalTime: 1.5 });
    expect(getRuns()[0].totalTime).toBe(1.5);

    updateRun("ghost", { totalTime: 9 });
    expect(getRuns()).toHaveLength(1);
  });

  it("getRunsForDrill excludes invalid runs", () => {
    seedRuns([
      makeRun({ id: "r1", drillId: "dr-pairs", isValid: true }),
      makeRun({ id: "r2", drillId: "dr-pairs", isValid: false }),
      makeRun({ id: "r3", drillId: "dr-bill", isValid: true }),
    ]);
    expect(getRunsForDrill("dr-pairs").map(r => r.id)).toEqual(["r1"]);
  });
});

describe("drill lookups", () => {
  it("getDrill resolves a known drill and returns undefined otherwise", () => {
    expect(getDrill("dr-pairs")?.name).toBeTruthy();
    expect(getDrill("dr-does-not-exist")).toBeUndefined();
  });

  it("getDrillBenchmarks filters by fire mode", () => {
    const live = getDrillBenchmarks("dr-pairs", "live_fire");
    expect(live.length).toBeGreaterThan(0);
    expect(live.every(b => b.fireMode === "live_fire")).toBe(true);
  });

  it("getDrillBenchmarkAtDistance requires an exact distance match", () => {
    const bm = getDrillBenchmarkAtDistance("dr-pairs", "B", 7, "live_fire");
    expect(bm).toBeDefined();
    // 8 yards is not a benchmarked distance — no nearest-neighbour fallback here.
    expect(getDrillBenchmarkAtDistance("dr-pairs", "B", 8, "live_fire")).toBeUndefined();
  });

  it("getDrillSkills joins maps to real skills", () => {
    const joined = getDrillSkills("dr-pairs");
    expect(joined.length).toBeGreaterThan(0);
    expect(joined.every(j => j.skill && j.skill.id === j.skillId)).toBe(true);
  });
});

describe("computeClassificationPct", () => {
  const bm = allBenchmarks.find(
    b => b.drillId === "dr-pairs" && b.classification === "B" && b.distanceYards === 7 && b.fireMode === "live_fire"
  )!;

  it("returns null when no benchmark exists for the distance", () => {
    expect(computeClassificationPct(2.0, "dr-pairs", 8, "B", "live_fire")).toBeNull();
  });

  it("returns null when no benchmark exists for the drill", () => {
    expect(computeClassificationPct(2.0, "dr-nonexistent", 7, "B", "live_fire")).toBeNull();
  });

  it("is 100% when the run matches the benchmark exactly", () => {
    expect(computeClassificationPct(bm.targetTime, "dr-pairs", 7, "B", "live_fire")).toBeCloseTo(100, 5);
  });

  it("exceeds 100% when faster than benchmark, and is uncapped", () => {
    const pct = computeClassificationPct(bm.targetTime / 2, "dr-pairs", 7, "B", "live_fire")!;
    expect(pct).toBeCloseTo(200, 5);
  });

  it("is below 100% when slower than benchmark", () => {
    const pct = computeClassificationPct(bm.targetTime * 2, "dr-pairs", 7, "B", "live_fire")!;
    expect(pct).toBeCloseTo(50, 5);
  });
});

describe("getBestTimeForDrill", () => {
  it("returns null with no runs", () => {
    expect(getBestTimeForDrill("dr-pairs")).toBeNull();
  });

  it("returns the fastest valid run", () => {
    seedRuns([
      makeRun({ id: "slow", drillId: "dr-pairs", totalTime: 3.0 }),
      makeRun({ id: "fast", drillId: "dr-pairs", totalTime: 1.8 }),
      makeRun({ id: "fastest-but-invalid", drillId: "dr-pairs", totalTime: 0.9, isValid: false }),
    ]);
    expect(getBestTimeForDrill("dr-pairs")!.id).toBe("fast");
  });

  it("filters by distance when given one", () => {
    seedRuns([
      makeRun({ id: "at7", drillId: "dr-pairs", distanceYards: 7, totalTime: 2.5 }),
      makeRun({ id: "at25", drillId: "dr-pairs", distanceYards: 25, totalTime: 1.2 }),
    ]);
    expect(getBestTimeForDrill("dr-pairs", 7)!.id).toBe("at7");
    expect(getBestTimeForDrill("dr-pairs")!.id).toBe("at25"); // unfiltered picks the raw fastest
  });
});

describe("session stats", () => {
  it("counts valid runs, rounds and distinct drills", () => {
    const pairs = getDrill("dr-pairs")!;
    seedRuns([
      makeRun({ id: "r1", sessionId: "s1", drillId: "dr-pairs" }),
      makeRun({ id: "r2", sessionId: "s1", drillId: "dr-pairs" }),
      makeRun({ id: "r3", sessionId: "s1", drillId: "dr-pairs", isValid: false }),
    ]);
    const stats = getSessionStats("s1");
    expect(stats.totalRuns).toBe(3);
    expect(stats.validRuns).toBe(2);
    expect(stats.totalRounds).toBe(pairs.roundCount * 2);
    expect(stats.drillCount).toBe(1);
  });

  it("getTodaySessions / getTodayStats only count today", () => {
    const today = new Date().toISOString();
    const old = new Date(Date.now() - 5 * 86400000).toISOString();
    seedSessions([
      makeSession({ id: "s-today", startedAt: today }),
      makeSession({ id: "s-old", startedAt: old }),
    ]);
    seedRuns([
      makeRun({ id: "r1", sessionId: "s-today", drillId: "dr-pairs" }),
      makeRun({ id: "r2", sessionId: "s-old", drillId: "dr-pairs" }),
    ]);
    expect(getTodaySessions().map(s => s.id)).toEqual(["s-today"]);
    const stats = getTodayStats();
    expect(stats.runs).toBe(1);
    expect(stats.drills).toBe(1);
    expect(stats.rounds).toBe(getDrill("dr-pairs")!.roundCount);
  });
});
