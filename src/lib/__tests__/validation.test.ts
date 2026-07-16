import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { installBrowserEnv, uninstallBrowserEnv, makeRun } from "./harness";
import {
  validateRun, MIN_TOTAL_TIME, MAX_TOTAL_TIME, MIN_SPLIT, MIN_DISTANCE, MAX_DISTANCE,
} from "../validation";
import { getDrill } from "../store";

beforeEach(() => installBrowserEnv());
afterEach(() => uninstallBrowserEnv());

// A clean run: total = firstShot + splits, so the consistency check passes.
const clean = () =>
  makeRun({ totalTime: 2.0, firstShotTime: 1.0, splits: [0.5, 0.5], pointsDown: 0, distanceYards: 7 });

describe("validateRun — clean input", () => {
  it("passes a well-formed run with no problems", () => {
    expect(validateRun(clean())).toEqual([]);
  });

  it("passes when splits are absent (nothing to reconcile)", () => {
    expect(validateRun(makeRun({ totalTime: 2.0, firstShotTime: null, splits: [], pointsDown: 0 }))).toEqual([]);
  });
});

describe("total time bounds", () => {
  it("rejects just below the minimum, accepts the boundary", () => {
    expect(validateRun(clean0(MIN_TOTAL_TIME - 0.01))).not.toEqual([]);
    expect(validateRun(makeRun({ totalTime: MIN_TOTAL_TIME, firstShotTime: null, splits: [], pointsDown: 0 }))).toEqual([]);
  });

  it("rejects just above the maximum, accepts the boundary", () => {
    expect(validateRun(clean0(MAX_TOTAL_TIME + 0.01))).not.toEqual([]);
    expect(validateRun(makeRun({ totalTime: MAX_TOTAL_TIME, firstShotTime: null, splits: [], pointsDown: 0 }))).toEqual([]);
  });

  it("names the mis-trigger case specifically", () => {
    const [msg] = validateRun(clean0(0.12));
    expect(msg).toMatch(/mis-triggered timer/i);
  });

  function clean0(totalTime: number) {
    return makeRun({ totalTime, firstShotTime: null, splits: [], pointsDown: 0 });
  }
});

describe("splits", () => {
  it("rejects a split at or below the minimum", () => {
    expect(validateRun(makeRun({ totalTime: 2, firstShotTime: null, splits: [MIN_SPLIT], pointsDown: 0 }))).not.toEqual([]);
    expect(validateRun(makeRun({ totalTime: 2, firstShotTime: null, splits: [0.04], pointsDown: 0 }))).not.toEqual([]);
  });

  it("flags first-shot + splits that don't reconstruct the total", () => {
    const problems = validateRun(
      makeRun({ totalTime: 5.0, firstShotTime: 1.0, splits: [0.5, 0.5], pointsDown: 0 })
    );
    expect(problems.some((p) => /does not match the total/i.test(p))).toBe(true);
  });

  it("accepts reconstruction within the tolerance", () => {
    // 1.0 + 0.48 + 0.5 = 1.98, total 2.0 -> within 0.05s
    expect(
      validateRun(makeRun({ totalTime: 2.0, firstShotTime: 1.0, splits: [0.48, 0.5], pointsDown: 0 }))
    ).toEqual([]);
  });
});

describe("points down", () => {
  const roundCount = getDrill("dr-pairs")!.roundCount;
  const maxDown = roundCount * 5;

  it("accepts 0 and the maximum", () => {
    expect(validateRun(clean())).toEqual([]);
    expect(validateRun(makeRun({ totalTime: 2, firstShotTime: null, splits: [], pointsDown: maxDown }))).toEqual([]);
  });

  it("rejects negative, non-integer and over-max", () => {
    expect(validateRun(makeRun({ totalTime: 2, firstShotTime: null, splits: [], pointsDown: -1 }))).not.toEqual([]);
    expect(validateRun(makeRun({ totalTime: 2, firstShotTime: null, splits: [], pointsDown: 1.5 }))).not.toEqual([]);
    expect(validateRun(makeRun({ totalTime: 2, firstShotTime: null, splits: [], pointsDown: maxDown + 1 }))).not.toEqual([]);
  });

  it("ignores points down when null (dry fire)", () => {
    expect(validateRun(makeRun({ totalTime: 2, firstShotTime: null, splits: [], pointsDown: null, fireMode: "dry_fire", dryFireCallPct: 80 }))).toEqual([]);
  });
});

describe("dry-fire call %", () => {
  const dry = (dryFireCallPct: number) =>
    makeRun({ totalTime: 2, firstShotTime: null, splits: [], pointsDown: null, fireMode: "dry_fire", dryFireCallPct });

  it("accepts 0 and 100", () => {
    expect(validateRun(dry(0))).toEqual([]);
    expect(validateRun(dry(100))).toEqual([]);
  });

  it("rejects below 0 and above 100", () => {
    expect(validateRun(dry(-1))).not.toEqual([]);
    expect(validateRun(dry(101))).not.toEqual([]);
  });
});

describe("distance", () => {
  const atDist = (distanceYards: number) =>
    makeRun({ totalTime: 2, firstShotTime: null, splits: [], pointsDown: 0, distanceYards });

  it("accepts the boundaries", () => {
    expect(validateRun(atDist(MIN_DISTANCE))).toEqual([]);
    expect(validateRun(atDist(MAX_DISTANCE))).toEqual([]);
  });

  it("rejects below and above", () => {
    expect(validateRun(atDist(MIN_DISTANCE - 1))).not.toEqual([]);
    expect(validateRun(atDist(MAX_DISTANCE + 1))).not.toEqual([]);
  });
});

describe("multiple problems", () => {
  it("reports every violation at once", () => {
    const problems = validateRun(
      makeRun({ totalTime: 0.1, firstShotTime: null, splits: [0.01], pointsDown: -5, distanceYards: 200 })
    );
    expect(problems.length).toBeGreaterThanOrEqual(4);
  });
});
