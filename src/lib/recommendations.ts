// Recommendation Engine
// Given skill estimates + constraints, builds prioritized training plans

import { drills, skills, drillSkillMaps, allBenchmarks } from "./store";
import { computeAllSkillEstimates, type SkillEstimate } from "./skillEstimation";
import { getProfile } from "./store";

export interface SessionConstraints {
  fireMode: "dry_fire" | "live_fire";
  movementAvailable: boolean;
  timeMinutes: number;
  maxDistance: number;
}

export interface DrillRecommendation {
  drillId: string;
  drillName: string;
  distance: number;
  reason: string;
  targetSkillIds: string[];
  targetSkillNames: string[];
  priority: number; // higher = more urgent
  estimatedMinutes: number;
  roundCount: number;
}

export interface SessionPlan {
  constraints: SessionConstraints;
  drills: DrillRecommendation[];
  totalMinutes: number;
  totalRounds: number;
}

const DEFAULT_CONSTRAINTS: SessionConstraints = {
  fireMode: "live_fire",
  movementAvailable: true,
  timeMinutes: 30,
  maxDistance: 25,
};

// Save/load constraints from localStorage
export function getConstraints(): SessionConstraints {
  if (typeof window === "undefined") return DEFAULT_CONSTRAINTS;
  const raw = localStorage.getItem("uspsa_constraints");
  return raw ? { ...DEFAULT_CONSTRAINTS, ...JSON.parse(raw) } : DEFAULT_CONSTRAINTS;
}

export function saveConstraints(c: SessionConstraints) {
  localStorage.setItem("uspsa_constraints", JSON.stringify(c));
}

// ─── Drill filtering ───

function isDrillEligible(
  drillId: string,
  constraints: SessionConstraints,
  fundamentalMastery: number
): boolean {
  const drill = drills.find(d => d.id === drillId);
  if (!drill) return false;

  // Fire mode compatibility
  if (drill.mode !== "both" && drill.mode !== constraints.fireMode) return false;

  // Distance check
  const hasValidDistance = drill.distances.some(d => d <= constraints.maxDistance);
  if (!hasValidDistance) return false;

  // Movement constraint
  if (!constraints.movementAvailable && drill.category === "stage_movement") return false;

  // Level gating based on fundamental mastery
  if (fundamentalMastery < 30 && drill.levelIntroduced > 1) return false;
  if (fundamentalMastery < 50 && drill.levelIntroduced > 2) return false;
  if (fundamentalMastery < 70 && drill.levelIntroduced > 3) return false;

  return true;
}

function pickDistance(drillId: string, maxDist: number, targetClass: string, fireMode: string): number {
  const drill = drills.find(d => d.id === drillId);
  if (!drill) return 7;

  const validDists = drill.distances.filter(d => d <= maxDist);
  if (validDists.length === 0) return drill.distances[0] || 7;

  // Prefer distance with a benchmark, closest to 7yd
  const withBenchmark = validDists.filter(d =>
    allBenchmarks.some(b => b.drillId === drillId && b.classification === targetClass &&
                            b.distanceYards === d && b.fireMode === fireMode)
  );

  const pool = withBenchmark.length > 0 ? withBenchmark : validDists;
  pool.sort((a, b) => Math.abs(a - 7) - Math.abs(b - 7));
  return pool[0];
}

function estimateDrillMinutes(drillId: string): number {
  const drill = drills.find(d => d.id === drillId);
  if (!drill) return 3;
  // ~3 runs per drill, each run takes roundCount * ~3 seconds + setup
  const runsPerDrill = 3;
  const timePerRun = Math.max(0.5, drill.roundCount * 0.05 + 0.3); // minutes
  return Math.ceil(timePerRun * runsPerDrill + 1); // +1 min setup
}

// ─── Core recommendation ───

export function generateRecommendations(constraints: SessionConstraints): DrillRecommendation[] {
  const estimates = computeAllSkillEstimates();
  const profile = getProfile();
  const targetClass = profile.targetClassification || "B";

  // Build skill gap map (only top-level skills)
  const skillGaps = new Map<string, number>();
  const skillNames = new Map<string, string>();
  for (const est of estimates) {
    const skill = skills.find(s => s.id === est.skillId);
    if (!skill || skill.parentId) continue;
    // Gap = how far from 100%, with uncertainty penalty
    const gap = (100 - est.mastery) + (1 - est.confidence) * 15;
    skillGaps.set(est.skillId, gap);
    skillNames.set(est.skillId, est.name);
  }

  // Compute fundamental mastery for level gating
  const fundamentalEstimates = estimates.filter(e => {
    const s = skills.find(sk => sk.id === e.skillId);
    return s && s.category === "fundamentals" && !s.parentId;
  });
  const fundamentalMastery = fundamentalEstimates.length > 0
    ? fundamentalEstimates.reduce((sum, e) => sum + e.mastery, 0) / fundamentalEstimates.length
    : 0;

  // Score each eligible drill
  const scored: DrillRecommendation[] = [];

  for (const drill of drills) {
    if (!isDrillEligible(drill.id, constraints, fundamentalMastery)) continue;

    const mappings = drillSkillMaps.filter(m => m.drillId === drill.id);
    if (mappings.length === 0) continue;

    let priority = 0;
    const targetSkillIds: string[] = [];
    const targetSkillNamesList: string[] = [];
    let topGapSkill = "";
    let topGap = 0;

    for (const m of mappings) {
      const gap = skillGaps.get(m.skillId) || 0;
      priority += gap * m.encompassingWeight;
      if (gap > 0) {
        targetSkillIds.push(m.skillId);
        targetSkillNamesList.push(skillNames.get(m.skillId) || m.skillId);
      }
      if (gap > topGap) {
        topGap = gap;
        topGapSkill = skillNames.get(m.skillId) || m.skillId;
      }
    }

    if (priority <= 0) continue;

    const distance = pickDistance(drill.id, constraints.maxDistance, targetClass, constraints.fireMode);
    const est = computeSkillMasteryForReason(topGapSkill, estimates);

    scored.push({
      drillId: drill.id,
      drillName: drill.name,
      distance,
      reason: topGapSkill ? `Build ${topGapSkill}${est !== null ? ` (${Math.round(est)}%)` : ""}` : "General practice",
      targetSkillIds,
      targetSkillNames: targetSkillNamesList,
      priority,
      estimatedMinutes: estimateDrillMinutes(drill.id),
      roundCount: drill.roundCount,
    });
  }

  // Sort by priority descending, deduplicate by not recommending drills too similar
  scored.sort((a, b) => b.priority - a.priority);
  return scored;
}

function computeSkillMasteryForReason(skillName: string, estimates: SkillEstimate[]): number | null {
  const est = estimates.find(e => e.name === skillName);
  return est ? est.mastery : null;
}

// ─── Session plan builder ───

export function buildSessionPlan(constraints: SessionConstraints): SessionPlan {
  const recommendations = generateRecommendations(constraints);
  const timebudget = constraints.timeMinutes;

  // Allocate: 70% weakness work, 30% maintenance
  const weaknessTime = timebudget * 0.7;
  const maintenanceTime = timebudget * 0.3;

  const plan: DrillRecommendation[] = [];
  let usedTime = 0;
  const usedDrillIds = new Set<string>();

  // Phase 1: Fill weakness drills
  for (const rec of recommendations) {
    if (usedTime >= weaknessTime) break;
    if (usedDrillIds.has(rec.drillId)) continue;
    plan.push(rec);
    usedDrillIds.add(rec.drillId);
    usedTime += rec.estimatedMinutes;
  }

  // Phase 2: Maintenance (strong skills, lower priority drills)
  const maintenance = recommendations
    .filter(r => !usedDrillIds.has(r.drillId))
    .slice(-10) // lower priority = stronger skills
    .reverse();

  for (const rec of maintenance) {
    if (usedTime >= timebudget) break;
    if (usedDrillIds.has(rec.drillId)) continue;
    plan.push({ ...rec, reason: "Maintain: " + rec.reason.replace("Build ", "") });
    usedDrillIds.add(rec.drillId);
    usedTime += rec.estimatedMinutes;
  }

  return {
    constraints,
    drills: plan,
    totalMinutes: plan.reduce((s, d) => s + d.estimatedMinutes, 0),
    totalRounds: plan.reduce((s, d) => s + d.roundCount * 3, 0), // assume 3 runs each
  };
}

export function getTopRecommendations(constraints: SessionConstraints, count: number = 3): DrillRecommendation[] {
  return generateRecommendations(constraints).slice(0, count);
}
