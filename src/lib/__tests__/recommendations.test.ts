import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { installBrowserEnv, uninstallBrowserEnv, makeRun, seedRuns, seedProfile } from "./harness";
import {
  getConstraints, saveConstraints, generateRecommendations, buildSessionPlan,
  getTopRecommendations, type SessionConstraints,
} from "../recommendations";
import { drills, allBenchmarks } from "../store";

const LIVE: SessionConstraints = {
  fireMode: "live_fire", movementAvailable: true, timeMinutes: 30, maxDistance: 25,
};

beforeEach(() => {
  installBrowserEnv();
  seedProfile({ targetClassification: "B" });
});
afterEach(() => uninstallBrowserEnv());

describe("constraints persistence", () => {
  it("returns defaults, then merges saved values over them", () => {
    expect(getConstraints()).toEqual({
      fireMode: "live_fire", movementAvailable: true, timeMinutes: 30, maxDistance: 25,
    });
    saveConstraints({ ...LIVE, timeMinutes: 45, fireMode: "dry_fire" });
    const c = getConstraints();
    expect(c.timeMinutes).toBe(45);
    expect(c.fireMode).toBe("dry_fire");
    expect(c.maxDistance).toBe(25); // untouched default survives
  });
});

describe("generateRecommendations", () => {
  it("recommends drills even with zero history (unknown skills are treated as gaps)", () => {
    const recs = generateRecommendations(LIVE);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every(r => r.priority > 0)).toBe(true);
  });

  it("is sorted by priority, highest first", () => {
    const recs = generateRecommendations(LIVE);
    const priorities = recs.map(r => r.priority);
    expect([...priorities].sort((a, b) => b - a)).toEqual(priorities);
  });

  it("only offers drills compatible with the requested fire mode", () => {
    for (const rec of generateRecommendations({ ...LIVE, fireMode: "dry_fire" })) {
      const drill = drills.find(d => d.id === rec.drillId)!;
      expect(["dry_fire", "both"]).toContain(drill.mode);
    }
  });

  it("never picks a distance beyond maxDistance", () => {
    const recs = generateRecommendations({ ...LIVE, maxDistance: 10 });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every(r => r.distance <= 10)).toBe(true);
  });

  it("excludes movement drills when there is no room to move", () => {
    const recs = generateRecommendations({ ...LIVE, movementAvailable: false });
    const categories = recs.map(r => drills.find(d => d.id === r.drillId)!.category);
    expect(categories).not.toContain("stage_movement");
  });

  it("gates advanced drills behind fundamental mastery (a cold user gets level-1 drills only)", () => {
    // No runs => fundamental mastery 0 => everything above level 1 is gated out.
    const recs = generateRecommendations(LIVE);
    expect(recs.every(r => drills.find(d => d.id === r.drillId)!.levelIntroduced <= 1)).toBe(true);
  });

  it("prefers a distance that actually has a benchmark for the target class", () => {
    for (const rec of generateRecommendations(LIVE)) {
      const hasBm = allBenchmarks.some(
        b => b.drillId === rec.drillId && b.classification === "B" &&
             b.distanceYards === rec.distance && b.fireMode === "live_fire"
      );
      const anyBm = allBenchmarks.some(
        b => b.drillId === rec.drillId && b.classification === "B" && b.fireMode === "live_fire"
      );
      if (anyBm) expect(hasBm).toBe(true);
    }
  });

  it("explains itself — every recommendation carries a reason", () => {
    expect(generateRecommendations(LIVE).every(r => r.reason.length > 0)).toBe(true);
  });

  it("boosts drills that target a declining skill and relabels the reason", () => {
    // Six runs getting steadily worse on dr-pairs => sk-draw/sk-cadence decline.
    const bm = allBenchmarks.find(
      b => b.drillId === "dr-pairs" && b.classification === "B" && b.distanceYards === 7 && b.fireMode === "live_fire"
    )!;
    const at = (daysAgo: number, mult: number) =>
      makeRun({
        drillId: "dr-pairs", distanceYards: 7, totalTime: bm.targetTime * mult, pointsDown: 0,
        capturedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      });
    seedRuns([at(20, 1), at(18, 1), at(16, 1), at(3, 3), at(2, 3), at(1, 3)]);

    const pairs = generateRecommendations(LIVE).find(r => r.drillId === "dr-pairs")!;
    expect(pairs.reason).toMatch(/^(Diagnose|Unstick):/);
  });
});

describe("getTopRecommendations", () => {
  it("returns at most `count`", () => {
    expect(getTopRecommendations(LIVE, 3)).toHaveLength(3);
    expect(getTopRecommendations(LIVE, 1)).toHaveLength(1);
  });
});

describe("buildSessionPlan", () => {
  it("fills a plan without repeating drills", () => {
    const plan = buildSessionPlan(LIVE);
    expect(plan.drills.length).toBeGreaterThan(0);
    const ids = plan.drills.map(d => d.drillId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps the plan roughly inside the time budget", () => {
    const plan = buildSessionPlan({ ...LIVE, timeMinutes: 30 });
    // Phase 1 fills to 70% then stops, phase 2 tops up — one drill may overshoot.
    expect(plan.totalMinutes).toBeLessThanOrEqual(30 + 10);
  });

  it("scales with the time budget", () => {
    const short = buildSessionPlan({ ...LIVE, timeMinutes: 15 });
    const long = buildSessionPlan({ ...LIVE, timeMinutes: 90 });
    expect(long.drills.length).toBeGreaterThanOrEqual(short.drills.length);
  });

  it("labels maintenance drills distinctly from weakness drills", () => {
    const plan = buildSessionPlan({ ...LIVE, timeMinutes: 30 });
    expect(plan.drills.some(d => d.reason.startsWith("Maintain:"))).toBe(true);
  });

  it("has nothing left for maintenance once the budget can fit every eligible drill", () => {
    // Phase 1 fills to 70% of the budget from the priority list; phase 2 works
    // the leftovers. A cold user only has ~12 eligible (level-1) drills, so a
    // 90-minute budget swallows all of them as weakness work and phase 2 is a
    // no-op. Pinned because it is surprising: a LONGER session has LESS variety
    // of intent, not more.
    const plan = buildSessionPlan({ ...LIVE, timeMinutes: 90 });
    expect(plan.drills.some(d => d.reason.startsWith("Maintain:"))).toBe(false);
  });

  it("reports totals consistent with its own drills", () => {
    const plan = buildSessionPlan(LIVE);
    expect(plan.totalMinutes).toBe(plan.drills.reduce((s, d) => s + d.estimatedMinutes, 0));
    expect(plan.totalRounds).toBe(plan.drills.reduce((s, d) => s + d.roundCount * 3, 0));
  });
});
