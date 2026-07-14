import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { installBrowserEnv, uninstallBrowserEnv, makeRun, seedRuns } from "./harness";
import {
  getAssessmentPlan, isAssessmentComplete, isAnyAssessmentComplete, getAssessmentDrillIds,
} from "../assessment";

beforeEach(() => installBrowserEnv());
afterEach(() => uninstallBrowserEnv());

const dryIds = getAssessmentDrillIds("dry_fire");
const liveIds = getAssessmentDrillIds("live_fire");

/** A run that counts toward the battery: valid, right fire mode, exactly 7yd. */
const batteryRun = (drillId: string, fireMode: "dry_fire" | "live_fire") =>
  makeRun({ drillId, fireMode, distanceYards: 7, pointsDown: fireMode === "live_fire" ? 0 : null });

describe("battery definitions", () => {
  it("dry fire and live fire have distinct batteries", () => {
    expect(dryIds.length).toBeGreaterThan(0);
    expect(liveIds.length).toBeGreaterThan(dryIds.length);
  });
});

describe("getAssessmentPlan", () => {
  it("is empty and incomplete with no runs, pointing at the first drill", () => {
    const plan = getAssessmentPlan("dry_fire");
    expect(plan.completedCount).toBe(0);
    expect(plan.totalCount).toBe(dryIds.length);
    expect(plan.isComplete).toBe(false);
    expect(plan.nextDrillId).toBe(dryIds[0]);
    expect(plan.drills.every(d => !d.isComplete)).toBe(true);
  });

  it("marks a drill complete once it has a valid 7yd run in that fire mode", () => {
    seedRuns([batteryRun(dryIds[0], "dry_fire")]);
    const plan = getAssessmentPlan("dry_fire");
    expect(plan.completedCount).toBe(1);
    expect(plan.drills[0].isComplete).toBe(true);
    expect(plan.nextDrillId).toBe(dryIds[1]);
  });

  it("ignores runs at other distances", () => {
    seedRuns([makeRun({ drillId: dryIds[0], fireMode: "dry_fire", distanceYards: 10 })]);
    expect(getAssessmentPlan("dry_fire").completedCount).toBe(0);
  });

  it("ignores invalid runs", () => {
    seedRuns([{ ...batteryRun(dryIds[0], "dry_fire"), isValid: false }]);
    expect(getAssessmentPlan("dry_fire").completedCount).toBe(0);
  });

  it("does not let a live-fire run complete the dry-fire battery", () => {
    seedRuns([batteryRun(dryIds[0], "live_fire")]);
    expect(getAssessmentPlan("dry_fire").completedCount).toBe(0);
    expect(getAssessmentPlan("live_fire").completedCount).toBeGreaterThan(0);
  });

  it("completes when every drill in the battery has a run, and nextDrillId goes null", () => {
    seedRuns(dryIds.map(id => batteryRun(id, "dry_fire")));
    const plan = getAssessmentPlan("dry_fire");
    expect(plan.isComplete).toBe(true);
    expect(plan.completedCount).toBe(plan.totalCount);
    expect(plan.nextDrillId).toBeNull();
    expect(isAssessmentComplete("dry_fire")).toBe(true);
  });
});

describe("isAnyAssessmentComplete", () => {
  it("is false with nothing done", () => {
    expect(isAnyAssessmentComplete()).toBe(false);
  });

  it("is true once either battery is finished", () => {
    seedRuns(dryIds.map(id => batteryRun(id, "dry_fire")));
    expect(isAnyAssessmentComplete()).toBe(true);
    expect(isAssessmentComplete("live_fire")).toBe(false);
  });
});
