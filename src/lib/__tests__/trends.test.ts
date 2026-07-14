import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { installBrowserEnv, uninstallBrowserEnv, makeRun, seedRuns, seedProfile } from "./harness";
import {
  computeMasteryTimeline, computeCategoryTimeline, computeOverallTimeline, computeTrendDelta,
} from "../trends";
import { allBenchmarks } from "../store";

const DRILL = "dr-pairs";
const SKILL = "sk-cadence";
const bm = allBenchmarks.find(
  b => b.drillId === DRILL && b.classification === "B" && b.distanceYards === 7 && b.fireMode === "live_fire"
)!;

const runAt = (daysAgo: number, mult: number) =>
  makeRun({
    drillId: DRILL, distanceYards: 7, totalTime: bm.targetTime * mult, pointsDown: 0,
    capturedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  });

beforeEach(() => {
  installBrowserEnv();
  seedProfile({ targetClassification: "B" });
});
afterEach(() => uninstallBrowserEnv());

describe("computeMasteryTimeline", () => {
  it("returns weeks + 1 snapshots, oldest first", () => {
    const snaps = computeMasteryTimeline(SKILL, 8);
    expect(snaps).toHaveLength(9);
    const dates = snaps.map(s => s.date);
    expect([...dates].sort()).toEqual(dates);
  });

  it("is flat zero with no runs", () => {
    const snaps = computeMasteryTimeline(SKILL, 4);
    expect(snaps.every(s => s.mastery === 0 && s.confidence === 0)).toBe(true);
  });

  it("only counts runs that existed as of each snapshot date", () => {
    // A single run 10 days ago: weeks 8..2 ago predate it, the last two include it.
    seedRuns([runAt(10, 2)]); // ~50% mastery
    const snaps = computeMasteryTimeline(SKILL, 8);

    expect(snaps[0].confidence).toBe(0); // 8 weeks ago — run did not exist
    const latest = snaps[snaps.length - 1];
    expect(latest.confidence).toBeGreaterThan(0);
    expect(latest.mastery).toBeCloseTo(50, 0);
  });

  it("shows improvement over time as newer, faster runs land", () => {
    seedRuns([runAt(35, 3), runAt(28, 3), runAt(5, 1), runAt(2, 1)]);
    const snaps = computeMasteryTimeline(SKILL, 8);
    const early = snaps.find(s => s.confidence > 0)!;
    const latest = snaps[snaps.length - 1];
    expect(latest.mastery).toBeGreaterThan(early.mastery);
  });

  it("caches by (skill, weeks, run count) and recomputes when runs change", () => {
    seedRuns([runAt(3, 2)]);
    const first = computeMasteryTimeline(SKILL, 4);
    expect(computeMasteryTimeline(SKILL, 4)).toBe(first); // same object — cache hit

    seedRuns([runAt(3, 2), runAt(2, 1)]);
    const second = computeMasteryTimeline(SKILL, 4);
    expect(second).not.toBe(first);
    expect(second[second.length - 1].mastery).toBeGreaterThan(first[first.length - 1].mastery);
  });

  it("rolls a parent skill up from its children", () => {
    seedRuns([runAt(3, 2)]);
    const child = computeMasteryTimeline(SKILL, 4);
    const parent = computeMasteryTimeline("sk-trigger", 4); // sk-cadence's parent
    expect(parent[parent.length - 1].mastery).toBeCloseTo(child[child.length - 1].mastery, 5);
  });
});

describe("computeCategoryTimeline", () => {
  it("returns an empty timeline for an unknown category", () => {
    expect(computeCategoryTimeline("not-a-category")).toEqual([]);
  });

  it("averages the top-level skills in a category", () => {
    seedRuns([runAt(3, 2)]);
    const snaps = computeCategoryTimeline("fundamentals", 4);
    expect(snaps).toHaveLength(5);
    expect(snaps[snaps.length - 1].skillId).toBe("fundamentals");
    expect(snaps[snaps.length - 1].mastery).toBeGreaterThan(0);
  });
});

describe("computeOverallTimeline", () => {
  it("returns weeks + 1 snapshots tagged 'overall'", () => {
    seedRuns([runAt(3, 2)]);
    const snaps = computeOverallTimeline(4);
    expect(snaps).toHaveLength(5);
    expect(snaps.every(s => s.skillId === "overall")).toBe(true);
    expect(snaps[snaps.length - 1].mastery).toBeGreaterThan(0);
  });
});

describe("computeTrendDelta", () => {
  it("is zero when fewer than two snapshots carry data", () => {
    expect(computeTrendDelta([])).toEqual({ delta: 0, weeksWithData: 0 });
    expect(
      computeTrendDelta([{ date: "2026-01-01", skillId: "x", mastery: 50, confidence: 0.5 }])
    ).toEqual({ delta: 0, weeksWithData: 1 });
  });

  it("ignores zero-confidence snapshots and measures first to last", () => {
    const delta = computeTrendDelta([
      { date: "2026-01-01", skillId: "x", mastery: 0, confidence: 0 },
      { date: "2026-01-08", skillId: "x", mastery: 40, confidence: 0.4 },
      { date: "2026-01-15", skillId: "x", mastery: 65, confidence: 0.8 },
    ]);
    expect(delta).toEqual({ delta: 25, weeksWithData: 2 });
  });

  it("goes negative on regression", () => {
    const { delta } = computeTrendDelta([
      { date: "2026-01-01", skillId: "x", mastery: 70, confidence: 1 },
      { date: "2026-01-08", skillId: "x", mastery: 55, confidence: 1 },
    ]);
    expect(delta).toBe(-15);
  });
});
