// Run validation — the guard between raw timer/manual input and the skill math.
//
// A mis-triggered timer (0.12s "run") or a fat-fingered manual entry silently
// poisons every downstream skill estimate. validateRun returns a list of
// human-readable problems; an empty list means the run is clean. Callers block
// the save on any problem, but always offer "save anyway, marked invalid"
// (isValid:false) so a real-but-weird run is never lost.

import type { SessionRun } from "./store";
import { getDrill } from "./store";

// Bounds. Times in seconds, distance in yards.
export const MIN_TOTAL_TIME = 0.3;
export const MAX_TOTAL_TIME = 600;
export const MIN_SPLIT = 0.05;
export const MIN_DISTANCE = 1;
export const MAX_DISTANCE = 100;
const SPLIT_SUM_TOLERANCE = 0.05; // seconds

type RunInput = Pick<
  SessionRun,
  | "drillId"
  | "fireMode"
  | "distanceYards"
  | "totalTime"
  | "firstShotTime"
  | "splits"
  | "pointsDown"
  | "dryFireCallPct"
>;

export function validateRun(run: RunInput): string[] {
  const problems: string[] = [];

  // ── Total time ──
  if (!Number.isFinite(run.totalTime)) {
    problems.push("Total time is missing.");
  } else if (run.totalTime < MIN_TOTAL_TIME) {
    problems.push(
      `Total time ${run.totalTime.toFixed(2)}s is below the ${MIN_TOTAL_TIME}s minimum — mis-triggered timer?`
    );
  } else if (run.totalTime > MAX_TOTAL_TIME) {
    problems.push(`Total time ${run.totalTime.toFixed(2)}s exceeds the ${MAX_TOTAL_TIME}s maximum.`);
  }

  // ── Splits ──
  if (Array.isArray(run.splits)) {
    run.splits.forEach((s, i) => {
      if (!Number.isFinite(s) || s <= MIN_SPLIT) {
        problems.push(`Split ${i + 1} (${Number.isFinite(s) ? s.toFixed(2) : "—"}s) is at or below the ${MIN_SPLIT}s minimum.`);
      }
    });

    // Consistency: first shot + all splits should reconstruct total time, when
    // all three are present. A mismatch means the pieces don't belong together.
    if (
      run.firstShotTime !== null &&
      Number.isFinite(run.firstShotTime) &&
      run.splits.length > 0 &&
      Number.isFinite(run.totalTime)
    ) {
      const reconstructed = run.firstShotTime + run.splits.reduce((a, b) => a + b, 0);
      if (Math.abs(reconstructed - run.totalTime) > SPLIT_SUM_TOLERANCE) {
        problems.push(
          `First shot (${run.firstShotTime.toFixed(2)}s) plus splits (${run.splits
            .reduce((a, b) => a + b, 0)
            .toFixed(2)}s) = ${reconstructed.toFixed(2)}s, which does not match the total time ${run.totalTime.toFixed(2)}s.`
        );
      }
    }
  }

  // ── Points down (live fire) ──
  if (run.pointsDown !== null && run.pointsDown !== undefined) {
    const roundCount = getDrill(run.drillId)?.roundCount ?? 0;
    const maxPointsDown = roundCount * 5;
    if (!Number.isInteger(run.pointsDown)) {
      problems.push(`Points down (${run.pointsDown}) must be a whole number.`);
    } else if (run.pointsDown < 0) {
      problems.push(`Points down (${run.pointsDown}) cannot be negative.`);
    } else if (maxPointsDown > 0 && run.pointsDown > maxPointsDown) {
      problems.push(
        `Points down (${run.pointsDown}) exceeds the maximum ${maxPointsDown} for a ${roundCount}-round drill.`
      );
    }
  }

  // ── Dry-fire call % ──
  if (run.dryFireCallPct !== null && run.dryFireCallPct !== undefined) {
    if (!Number.isFinite(run.dryFireCallPct) || run.dryFireCallPct < 0 || run.dryFireCallPct > 100) {
      problems.push(`Call percentage (${run.dryFireCallPct}) must be between 0 and 100.`);
    }
  }

  // ── Distance ──
  if (!Number.isFinite(run.distanceYards) || run.distanceYards < MIN_DISTANCE || run.distanceYards > MAX_DISTANCE) {
    problems.push(`Distance (${run.distanceYards} yd) must be between ${MIN_DISTANCE} and ${MAX_DISTANCE} yards.`);
  }

  return problems;
}
