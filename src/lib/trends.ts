// Mastery timeline computation
// Replays the skill estimation engine at weekly intervals to produce historical snapshots

import { getRuns, getProfile, skills, drills, drillSkillMaps, allBenchmarks } from "./store";
import type { SessionRun } from "./store";
import type { DrillBenchmark } from "@/data/seed";

export interface MasterySnapshot {
  date: string;   // ISO date string (YYYY-MM-DD)
  skillId: string;
  mastery: number;
  confidence: number;
}

interface SkillSignal {
  pctOfBenchmark: number;
  weight: number;
  timestamp: string;
}

// ─── Internal helpers (mirrors skillEstimation.ts but accepts filtered runs) ───

function findBenchmark(
  drillId: string,
  classification: string,
  distance: number,
  fireMode: string
): DrillBenchmark | undefined {
  let bm = allBenchmarks.find(
    (b) =>
      b.drillId === drillId &&
      b.classification === classification &&
      b.distanceYards === distance &&
      b.fireMode === fireMode
  );
  if (bm) return bm;
  const candidates = allBenchmarks.filter(
    (b) =>
      b.drillId === drillId &&
      b.classification === classification &&
      b.fireMode === fireMode
  );
  if (candidates.length === 0) return undefined;
  candidates.sort(
    (a, c) => Math.abs(a.distanceYards - distance) - Math.abs(c.distanceYards - distance)
  );
  return candidates[0];
}

function collectSignalsFromRuns(
  runs: SessionRun[],
  targetClass: string,
  asOfDate: Date
): Map<string, SkillSignal[]> {
  const now = asOfDate.getTime();
  const signals = new Map<string, SkillSignal[]>();

  for (const run of runs) {
    if (!run.isValid) continue;
    const mappings = drillSkillMaps.filter((m) => m.drillId === run.drillId);
    if (mappings.length === 0) continue;

    const bm = findBenchmark(run.drillId, targetClass, run.distanceYards, run.fireMode);
    if (!bm) continue;

    const drill = drills.find((d) => d.id === run.drillId);
    const maxPoints = (drill?.roundCount || 6) * 5;
    let accuracyMult = 1.0;
    if (run.fireMode === "live_fire" && run.pointsDown !== null && run.pointsDown !== undefined) {
      accuracyMult = Math.max(0.1, (maxPoints - run.pointsDown) / maxPoints);
    } else if (run.fireMode === "dry_fire" && run.dryFireCallPct !== null && run.dryFireCallPct !== undefined) {
      accuracyMult = run.dryFireCallPct / 100;
    }
    const pctOfBenchmark = (bm.targetTime / run.totalTime) * accuracyMult * 100;
    const daysSince = (now - new Date(run.capturedAt).getTime()) / 86400000;
    const recencyWeight = Math.pow(0.97, daysSince);
    const coldBonus = run.isCold ? 1.2 : 1.0;

    for (const mapping of mappings) {
      const weight = mapping.encompassingWeight * recencyWeight * coldBonus;
      const signal: SkillSignal = {
        pctOfBenchmark: Math.min(pctOfBenchmark, 150),
        weight,
        timestamp: run.capturedAt,
      };
      const arr = signals.get(mapping.skillId) || [];
      arr.push(signal);
      signals.set(mapping.skillId, arr);
    }
  }

  return signals;
}

function aggregateSignals(sigs: SkillSignal[]): { mastery: number; confidence: number } {
  if (sigs.length === 0) return { mastery: 0, confidence: 0 };
  let weightSum = 0;
  let valueSum = 0;
  for (const s of sigs) {
    valueSum += s.pctOfBenchmark * s.weight;
    weightSum += s.weight;
  }
  const mastery = Math.min(100, weightSum > 0 ? valueSum / weightSum : 0);
  const confidence = Math.min(1.0, sigs.length / 5);
  return { mastery, confidence };
}

function computeSkillMasteryAtDate(
  skillId: string,
  runs: SessionRun[],
  targetClass: string,
  asOfDate: Date
): { mastery: number; confidence: number } {
  const signals = collectSignalsFromRuns(runs, targetClass, asOfDate);
  const sigs = signals.get(skillId) || [];

  // For parent skills with children, aggregate children if no direct signals
  const skill = skills.find((s) => s.id === skillId);
  if (skill) {
    const children = skills.filter((s) => s.parentId === skillId);
    if (children.length > 0 && sigs.length === 0) {
      const childEstimates = children
        .map((c) => {
          const childSigs = signals.get(c.id) || [];
          return aggregateSignals(childSigs);
        })
        .filter((e) => e.confidence > 0);

      if (childEstimates.length > 0) {
        const avgMastery =
          childEstimates.reduce((s, e) => s + e.mastery, 0) / childEstimates.length;
        const avgConf =
          childEstimates.reduce((s, e) => s + e.confidence, 0) / childEstimates.length;
        return { mastery: avgMastery, confidence: avgConf };
      }
    }
  }

  return aggregateSignals(sigs);
}

// ─── Cache for computed timelines ───
const timelineCache = new Map<string, { key: string; data: MasterySnapshot[] }>();

function cacheKey(skillId: string, weeks: number, runCount: number): string {
  return `${skillId}:${weeks}:${runCount}`;
}

// ─── Public API ───

/**
 * Compute weekly mastery snapshots for a single skill.
 * Replays the estimation engine with runs filtered up to each week boundary.
 */
export function computeMasteryTimeline(
  skillId: string,
  weeks: number = 8
): MasterySnapshot[] {
  const allRuns = getRuns();
  const ck = cacheKey(skillId, weeks, allRuns.length);
  const cached = timelineCache.get(skillId);
  if (cached && cached.key === ck) return cached.data;

  const profile = getProfile();
  const targetClass = profile.targetClassification || "B";

  const now = new Date();
  const snapshots: MasterySnapshot[] = [];

  for (let w = weeks; w >= 0; w--) {
    const asOfDate = new Date(now);
    asOfDate.setDate(asOfDate.getDate() - w * 7);
    const dateStr = asOfDate.toISOString().slice(0, 10);

    // Filter runs that existed by this date
    const runsUpToDate = allRuns.filter(
      (r) => new Date(r.capturedAt) <= asOfDate
    );

    if (runsUpToDate.length === 0) {
      snapshots.push({ date: dateStr, skillId, mastery: 0, confidence: 0 });
      continue;
    }

    const { mastery, confidence } = computeSkillMasteryAtDate(
      skillId,
      runsUpToDate,
      targetClass,
      asOfDate
    );
    snapshots.push({ date: dateStr, skillId, mastery, confidence });
  }

  timelineCache.set(skillId, { key: ck, data: snapshots });
  return snapshots;
}

/**
 * Compute a category-level timeline by averaging all top-level skills in the category.
 */
export function computeCategoryTimeline(
  category: string,
  weeks: number = 8
): MasterySnapshot[] {
  const topLevelSkills = skills.filter(
    (s) => s.category === category && !s.parentId
  );

  if (topLevelSkills.length === 0) return [];

  // Get timelines for each skill
  const skillTimelines = topLevelSkills.map((s) =>
    computeMasteryTimeline(s.id, weeks)
  );

  // Average across skills at each time point
  const weekCount = weeks + 1;
  const result: MasterySnapshot[] = [];

  for (let i = 0; i < weekCount; i++) {
    const dateStr = skillTimelines[0]?.[i]?.date || "";
    const withData = skillTimelines
      .map((tl) => tl[i])
      .filter((snap) => snap && snap.confidence > 0);

    const mastery =
      withData.length > 0
        ? withData.reduce((s, snap) => s + snap.mastery, 0) / withData.length
        : 0;
    const confidence =
      withData.length > 0
        ? withData.reduce((s, snap) => s + snap.confidence, 0) /
          topLevelSkills.length
        : 0;

    result.push({ date: dateStr, skillId: category, mastery, confidence });
  }

  return result;
}

/**
 * Compute overall mastery timeline across ALL skills.
 */
export function computeOverallTimeline(weeks: number = 8): MasterySnapshot[] {
  const categories = [
    ...new Set(skills.filter((s) => !s.parentId).map((s) => s.category)),
  ];
  const catTimelines = categories.map((c) => computeCategoryTimeline(c, weeks));

  if (catTimelines.length === 0) return [];

  const weekCount = weeks + 1;
  const result: MasterySnapshot[] = [];

  for (let i = 0; i < weekCount; i++) {
    const dateStr = catTimelines[0]?.[i]?.date || "";
    const withData = catTimelines
      .map((tl) => tl[i])
      .filter((snap) => snap && snap.confidence > 0);

    const mastery =
      withData.length > 0
        ? withData.reduce((s, snap) => s + snap.mastery, 0) / withData.length
        : 0;
    const confidence =
      withData.length > 0
        ? withData.reduce((s, snap) => s + snap.confidence, 0) /
          categories.length
        : 0;

    result.push({ date: dateStr, skillId: "overall", mastery, confidence });
  }

  return result;
}

/**
 * Compute the trend delta for a timeline (change from first data point to last).
 */
export function computeTrendDelta(snapshots: MasterySnapshot[]): {
  delta: number;
  weeksWithData: number;
} {
  const withData = snapshots.filter((s) => s.confidence > 0);
  if (withData.length < 2) return { delta: 0, weeksWithData: withData.length };

  const first = withData[0];
  const last = withData[withData.length - 1];
  return {
    delta: last.mastery - first.mastery,
    weeksWithData: withData.length,
  };
}
