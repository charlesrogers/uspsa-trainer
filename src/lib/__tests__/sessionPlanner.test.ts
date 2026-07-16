import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { installBrowserEnv, uninstallBrowserEnv, seedProfile } from "./harness";
import {
  generateSessionPlan, getAlternatives, swapDrill,
  savePlan, loadPlan, clearPlan,
  savePlanProgress, loadPlanProgress, clearPlanProgress,
} from "../sessionPlanner";

const OPTS = {
  totalMinutes: 45,
  fireMode: "live_fire" as const,
  maxDistance: 25,
  hasMovementSpace: true,
};

beforeEach(() => {
  installBrowserEnv();
  seedProfile({ targetClassification: "B" });
});
afterEach(() => uninstallBrowserEnv());

describe("generateSessionPlan", () => {
  it("produces a plan with weakness work up front", () => {
    const plan = generateSessionPlan(OPTS);
    expect(plan.drills.length).toBeGreaterThan(0);
    expect(plan.drills[0].purpose).toBe("weakness");
    expect(plan.fireMode).toBe("live_fire");
    expect(plan.id).toBeTruthy();
    expect(plan.createdAt).toBeTruthy();
  });

  it("never repeats a drill", () => {
    const ids = generateSessionPlan(OPTS).drills.map(d => d.drillId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives dry fire more reps per drill than live fire", () => {
    const live = generateSessionPlan(OPTS);
    const dry = generateSessionPlan({ ...OPTS, fireMode: "dry_fire" });
    expect(live.drills[0].reps).toBe(3);
    expect(dry.drills[0].reps).toBe(5);
  });

  it("stays within the time budget plus the documented small overflow", () => {
    const plan = generateSessionPlan({ ...OPTS, totalMinutes: 30 });
    expect(plan.totalMinutes).toBeLessThanOrEqual(30 + 5);
  });

  it("reports estimatedRounds as rounds x reps across the plan", () => {
    const plan = generateSessionPlan(OPTS);
    const expected = plan.drills.reduce((s, d) => s + d.roundCount * d.reps, 0);
    expect(plan.estimatedRounds).toBe(expected);
  });

  it("names up to three focus areas drawn from the planned drills", () => {
    const plan = generateSessionPlan(OPTS);
    expect(plan.focusAreas.length).toBeGreaterThan(0);
    expect(plan.focusAreas.length).toBeLessThanOrEqual(3);
  });

  it("returns an empty plan (not a crash) when nothing is eligible", () => {
    // A 1-yard cap eliminates every drill.
    const plan = generateSessionPlan({ ...OPTS, maxDistance: 0 });
    expect(plan.drills).toEqual([]);
    expect(plan.totalMinutes).toBe(0);
    expect(plan.estimatedRounds).toBe(0);
    expect(plan.focusAreas).toEqual([]);
  });
});

describe("getAlternatives / swapDrill", () => {
  it("offers alternatives that are not already in the plan", () => {
    const plan = generateSessionPlan(OPTS);
    const alts = getAlternatives(plan, 0, 5);
    const planned = new Set(plan.drills.map(d => d.drillId));
    expect(alts.every(a => !planned.has(a.drillId))).toBe(true);
    expect(alts.length).toBeLessThanOrEqual(5);
  });

  it("returns nothing for an out-of-range index", () => {
    const plan = generateSessionPlan(OPTS);
    expect(getAlternatives(plan, 999)).toEqual([]);
  });

  it("swaps a drill in place, preserving reps and purpose, and recomputes totals", () => {
    const plan = generateSessionPlan(OPTS);
    const alt = getAlternatives(plan, 0, 1)[0];
    const original = plan.drills[0];

    const swapped = swapDrill(plan, 0, alt);
    expect(swapped.drills[0].drillId).toBe(alt.drillId);
    expect(swapped.drills[0].reps).toBe(original.reps);
    expect(swapped.drills[0].purpose).toBe(original.purpose);
    expect(swapped.drills).toHaveLength(plan.drills.length);
    expect(swapped.totalMinutes).toBe(swapped.drills.reduce((s, d) => s + d.estimatedMinutes, 0));
    expect(swapped.estimatedRounds).toBe(swapped.drills.reduce((s, d) => s + d.roundCount * d.reps, 0));
    // Original plan is not mutated.
    expect(plan.drills[0].drillId).toBe(original.drillId);
  });

  it("returns the plan untouched when swapping an out-of-range index", () => {
    const plan = generateSessionPlan(OPTS);
    const alt = getAlternatives(plan, 0, 1)[0];
    expect(swapDrill(plan, 999, alt)).toBe(plan);
  });
});

describe("persistence", () => {
  it("round-trips a plan and clears it", () => {
    const plan = generateSessionPlan(OPTS);
    savePlan(plan);
    expect(loadPlan()!.id).toBe(plan.id);
    clearPlan();
    expect(loadPlan()).toBeNull();
  });

  it("returns null when no plan or progress is stored", () => {
    // Plan/progress now persist as structured clones in IndexedDB, so there is
    // no JSON string to corrupt here; the parse-failure concern moved to Import.
    expect(loadPlan()).toBeNull();
    expect(loadPlanProgress()).toBeNull();
  });

  it("round-trips plan progress and clears it", () => {
    savePlanProgress({
      planId: "p1", sessionId: "s1",
      completedDrillIndices: [0, 1], skippedDrillIndices: [2],
    });
    const loaded = loadPlanProgress()!;
    expect(loaded.planId).toBe("p1");
    expect(loaded.completedDrillIndices).toEqual([0, 1]);
    clearPlanProgress();
    expect(loadPlanProgress()).toBeNull();
  });
});
