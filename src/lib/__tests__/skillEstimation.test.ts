// Characterization tests for the skill estimation engine.
//
// Expected values are derived from the corpus at runtime (benchmark target
// times, drill round counts, encompassing weights) rather than hardcoded, so
// these tests assert the ALGORITHM, not the seed numbers. If a benchmark
// changes, these still pass; if the math changes, they fail. That is deliberate
// — the corpus is Charles's to change, the math is not.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { installBrowserEnv, uninstallBrowserEnv, makeRun, seedRuns, seedProfile } from "./harness";
import {
  computeAllSkillEstimates, computeCategoryEstimates, getWeakestSkills,
  hasAnyData, getDiagnosticNeeds,
} from "../skillEstimation";
import { allBenchmarks, drills, drillSkillMaps, skills } from "../store";

const DRILL = "dr-pairs";
const TARGET_CLASS = "B";

const liveBm = allBenchmarks.find(
  b => b.drillId === DRILL && b.classification === TARGET_CLASS && b.distanceYards === 7 && b.fireMode === "live_fire"
)!;
const dryBm = allBenchmarks.find(
  b => b.drillId === DRILL && b.classification === TARGET_CLASS && b.distanceYards === 7 && b.fireMode === "dry_fire"
)!;
const roundCount = drills.find(d => d.id === DRILL)!.roundCount;
const maxPoints = roundCount * 5;

/** Skills this drill feeds signals into. */
const mappedSkillIds = drillSkillMaps.filter(m => m.drillId === DRILL).map(m => m.skillId);
const PRIMARY = "sk-cadence"; // mapped to dr-pairs, weight 1.0

function masteryOf(skillId: string) {
  return computeAllSkillEstimates().find(e => e.skillId === skillId)!;
}

beforeEach(() => {
  installBrowserEnv();
  seedProfile({ targetClassification: TARGET_CLASS });
});
afterEach(() => uninstallBrowserEnv());

describe("preconditions on the corpus", () => {
  it("dr-pairs has the benchmarks and mappings these tests rely on", () => {
    expect(liveBm).toBeDefined();
    expect(dryBm).toBeDefined();
    expect(mappedSkillIds).toContain(PRIMARY);
  });
});

describe("no data", () => {
  it("hasAnyData is false and every skill reads 0 / unknown", () => {
    expect(hasAnyData()).toBe(false);
    const estimates = computeAllSkillEstimates();
    expect(estimates.length).toBe(skills.length);
    expect(estimates.every(e => e.mastery === 0 && e.confidence === 0 && e.trend === "unknown")).toBe(true);
  });

  it("invalid runs contribute nothing", () => {
    seedRuns([makeRun({ drillId: DRILL, isValid: false, totalTime: liveBm.targetTime })]);
    expect(hasAnyData()).toBe(false);
    expect(masteryOf(PRIMARY).signalCount).toBe(0);
  });

  it("runs on a drill with no skill mappings contribute nothing", () => {
    seedRuns([makeRun({ drillId: "dr-not-a-real-drill", totalTime: 1.0 })]);
    expect(masteryOf(PRIMARY).signalCount).toBe(0);
  });
});

describe("live-fire accuracy multiplier (points-down path)", () => {
  it("pointsDown = 0 gives a 1.0 multiplier: a benchmark-time run reads 100%", () => {
    seedRuns([makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime, pointsDown: 0 })]);
    expect(masteryOf(PRIMARY).mastery).toBeCloseTo(100, 4);
  });

  it("pointsDown = maxPoints floors the multiplier at 0.1, not 0", () => {
    seedRuns([makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime, pointsDown: maxPoints })]);
    // (target/target) * 0.1 * 100 = 10
    expect(masteryOf(PRIMARY).mastery).toBeCloseTo(10, 4);
  });

  it("scales linearly between the two", () => {
    const pointsDown = Math.floor(maxPoints / 2);
    const expectedMult = (maxPoints - pointsDown) / maxPoints;
    seedRuns([makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime, pointsDown })]);
    expect(masteryOf(PRIMARY).mastery).toBeCloseTo(100 * expectedMult, 4);
  });

  it("a null pointsDown leaves the multiplier at 1.0 (accuracy is not penalised when unrecorded)", () => {
    seedRuns([makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime, pointsDown: null })]);
    expect(masteryOf(PRIMARY).mastery).toBeCloseTo(100, 4);
  });
});

describe("dry-fire accuracy multiplier (call-pct path)", () => {
  const dryRun = (dryFireCallPct: number | null, totalTime = dryBm.targetTime) =>
    makeRun({
      drillId: DRILL, fireMode: "dry_fire", distanceYards: 7,
      totalTime, pointsDown: null, dryFireCallPct,
    });

  it("callPct = 100 gives a 1.0 multiplier", () => {
    seedRuns([dryRun(100)]);
    expect(masteryOf(PRIMARY).mastery).toBeCloseTo(100, 4);
  });

  it("callPct = 0 zeroes the signal (no 0.1 floor on this path)", () => {
    seedRuns([dryRun(0)]);
    expect(masteryOf(PRIMARY).mastery).toBeCloseTo(0, 4);
    // ...but it IS a signal: confidence is non-zero even though mastery is 0.
    expect(masteryOf(PRIMARY).signalCount).toBe(1);
  });

  it("callPct = 50 halves the signal", () => {
    seedRuns([dryRun(50)]);
    expect(masteryOf(PRIMARY).mastery).toBeCloseTo(50, 4);
  });

  it("a null callPct leaves the multiplier at 1.0", () => {
    seedRuns([dryRun(null)]);
    expect(masteryOf(PRIMARY).mastery).toBeCloseTo(100, 4);
  });
});

describe("benchmark distance fallback", () => {
  it("falls back to the nearest benchmarked distance when there is no exact match", () => {
    // 8yd is not benchmarked; 7yd is the nearest.
    seedRuns([makeRun({ drillId: DRILL, distanceYards: 8, totalTime: liveBm.targetTime, pointsDown: 0 })]);
    expect(masteryOf(PRIMARY).mastery).toBeCloseTo(100, 4);
  });

  it("drops the run entirely when the drill has no benchmark for the target class at all", () => {
    seedRuns([makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime })]);
    seedProfile({ targetClassification: "ZZ" }); // no benchmarks for a bogus class
    expect(masteryOf(PRIMARY).signalCount).toBe(0);
  });
});

describe("the 150% signal cap", () => {
  it("caps a single blazing run before averaging, so it cannot drag the mean up without limit", () => {
    const now = new Date().toISOString();
    seedRuns([
      // 4x faster than benchmark -> raw 400%, capped to 150
      makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime / 4, pointsDown: 0, capturedAt: now }),
      // 5x slower -> 20%
      makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime * 5, pointsDown: 0, capturedAt: now }),
      makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime * 5, pointsDown: 0, capturedAt: now }),
      makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime * 5, pointsDown: 0, capturedAt: now }),
    ]);
    // Equal weights (same drill, distance, timestamp, none cold):
    //   capped:   (150 + 20 + 20 + 20) / 4 = 52.5
    //   uncapped: (400 + 20 + 20 + 20) / 4 = 115 -> would clamp to 100
    expect(masteryOf(PRIMARY).mastery).toBeCloseTo(52.5, 3);
  });

  it("clamps final mastery to 100 even when every signal is above benchmark", () => {
    seedRuns([makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime / 2, pointsDown: 0 })]);
    expect(masteryOf(PRIMARY).mastery).toBe(100);
  });
});

describe("cold bonus", () => {
  it("weights a cold run 1.2x, pulling the average toward it", () => {
    const now = new Date().toISOString();
    seedRuns([
      makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime, pointsDown: 0, isCold: true, capturedAt: now }),   // 100%, weight w*1.2
      makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime * 2, pointsDown: 0, isCold: false, capturedAt: now }), // 50%, weight w
    ]);
    // (100*1.2 + 50*1.0) / 2.2 = 77.27...
    expect(masteryOf(PRIMARY).mastery).toBeCloseTo((100 * 1.2 + 50) / 2.2, 3);
  });
});

describe("recency decay", () => {
  it("weights an old run less than a fresh one (0.97^days)", () => {
    const fresh = new Date().toISOString();
    const old = new Date(Date.now() - 30 * 86400000).toISOString();
    seedRuns([
      makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime, pointsDown: 0, capturedAt: fresh }),      // 100%
      makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime * 2, pointsDown: 0, capturedAt: old }),    // 50%, decayed
    ]);
    const decay = Math.pow(0.97, 30);
    const expected = (100 * 1 + 50 * decay) / (1 + decay);
    expect(masteryOf(PRIMARY).mastery).toBeCloseTo(expected, 1);
    // Sanity: the fresh run dominates, so we sit above the naive 75% midpoint.
    expect(masteryOf(PRIMARY).mastery).toBeGreaterThan(75);
  });
});

describe("confidence", () => {
  it("is signalCount / 5, capped at 1.0", () => {
    const run = () => makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime, pointsDown: 0 });
    seedRuns([run(), run()]);
    expect(masteryOf(PRIMARY).confidence).toBeCloseTo(0.4, 5);

    seedRuns([run(), run(), run(), run(), run(), run(), run()]);
    expect(masteryOf(PRIMARY).confidence).toBe(1);
  });
});

describe("trend detection", () => {
  const at = (daysAgo: number, totalTime: number) =>
    makeRun({
      drillId: DRILL, distanceYards: 7, totalTime, pointsDown: 0,
      capturedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    });

  it("is unknown with fewer than 4 signals", () => {
    seedRuns([at(3, liveBm.targetTime), at(2, liveBm.targetTime), at(1, liveBm.targetTime)]);
    expect(masteryOf(PRIMARY).trend).toBe("unknown");
  });

  it("reads improving when the recent half is >5pp better", () => {
    seedRuns([
      at(20, liveBm.targetTime * 2), at(18, liveBm.targetTime * 2),   // ~50%
      at(2, liveBm.targetTime), at(1, liveBm.targetTime),             // 100%
    ]);
    expect(masteryOf(PRIMARY).trend).toBe("improving");
  });

  it("reads declining when the recent half is >5pp worse", () => {
    seedRuns([
      at(20, liveBm.targetTime), at(18, liveBm.targetTime),           // 100%
      at(2, liveBm.targetTime * 2), at(1, liveBm.targetTime * 2),     // ~50%
    ]);
    expect(masteryOf(PRIMARY).trend).toBe("declining");
  });

  it("reads stable inside the +/-5pp band", () => {
    seedRuns([
      at(20, liveBm.targetTime), at(18, liveBm.targetTime),
      at(2, liveBm.targetTime), at(1, liveBm.targetTime),
    ]);
    expect(masteryOf(PRIMARY).trend).toBe("stable");
  });
});

describe("parent-skill rollup", () => {
  // sk-cadence's parent is sk-trigger, which has no direct dr-pairs mapping.
  const PARENT = skills.find(s => s.id === PRIMARY)!.parentId!;

  it("precondition: the parent has children and no direct mapping to this drill", () => {
    expect(PARENT).toBe("sk-trigger");
    expect(drillSkillMaps.some(m => m.drillId === DRILL && m.skillId === PARENT)).toBe(false);
  });

  it("a parent with no direct signals averages its children that DO have signals", () => {
    seedRuns([makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime * 2, pointsDown: 0 })]);
    const child = masteryOf(PRIMARY);
    const parent = masteryOf(PARENT);

    expect(child.mastery).toBeCloseTo(50, 3);
    // Only one child has data, so the parent mirrors it.
    expect(parent.mastery).toBeCloseTo(child.mastery, 5);
    expect(parent.confidence).toBeCloseTo(child.confidence, 5);
    // signalCount on a rolled-up parent counts CHILDREN, not runs.
    expect(parent.signalCount).toBe(1);
    expect(parent.lastAssessed).toBeNull();
    expect(parent.trend).toBe("unknown");
  });

  it("a parent whose children have no data stays at 0", () => {
    const parent = masteryOf(PARENT);
    expect(parent.mastery).toBe(0);
    expect(parent.confidence).toBe(0);
  });
});

describe("rollups and selectors", () => {
  beforeEach(() => {
    seedRuns([makeRun({ drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime * 2, pointsDown: 0 })]);
  });

  it("computeCategoryEstimates only rolls up top-level skills", () => {
    const cats = computeCategoryEstimates();
    expect(cats.length).toBeGreaterThan(0);
    const topLevelCategories = new Set(skills.filter(s => !s.parentId).map(s => s.category));
    expect(cats.every(c => topLevelCategories.has(c.category as never))).toBe(true);
  });

  it("getWeakestSkills returns top-level skills sorted by urgency, honouring the count", () => {
    const weakest = getWeakestSkills(3);
    expect(weakest).toHaveLength(3);
    expect(weakest.every(e => !skills.find(s => s.id === e.skillId)!.parentId)).toBe(true);
    // Zero-data skills (mastery 0, confidence 0) are the most urgent of all.
    expect(weakest[0].mastery).toBe(0);
  });

  it("getDiagnosticNeeds ignores low-confidence skills", () => {
    // One run => confidence 0.2, below every diagnostic gate.
    expect(getDiagnosticNeeds().length).toBe(0);
  });

  it("getDiagnosticNeeds surfaces a stagnating top-level skill below the threshold", () => {
    // sk-draw is top-level and mapped to dr-pairs. Six flat runs at ~50% =>
    // trend "stable", confidence 1.0, mastery < 70.
    const flat = (daysAgo: number) =>
      makeRun({
        drillId: DRILL, distanceYards: 7, totalTime: liveBm.targetTime * 2, pointsDown: 0,
        capturedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      });
    seedRuns([flat(6), flat(5), flat(4), flat(3), flat(2), flat(1)]);

    const needs = getDiagnosticNeeds(70);
    expect(needs.some(n => n.skillId === "sk-draw")).toBe(true);
    expect(needs.every(n => !skills.find(s => s.id === n.skillId)!.parentId)).toBe(true);
  });
});
