// Session Planner
// Generates structured, timed session plans from the recommendation engine

import { generateRecommendations, type SessionConstraints, type DrillRecommendation } from "./recommendations";
import { getDrill, skills } from "./store";

export interface PlannedDrill {
  drillId: string;
  drillName: string;
  distanceYards: number;
  reps: number;
  purpose: "weakness" | "maintenance" | "assessment";
  estimatedMinutes: number;
  targetSkills: string[]; // skill IDs
  targetSkillNames: string[];
  reason: string;
  roundCount: number; // rounds per rep
  priority: number;
}

export interface SessionPlan {
  id: string;
  createdAt: string;
  totalMinutes: number;
  fireMode: "live_fire" | "dry_fire";
  drills: PlannedDrill[];
  estimatedRounds: number;
  focusAreas: string[]; // top 3 skill category names
  constraints: SessionConstraints;
}

const STORAGE_KEY = "uspsa_session_plan";

// Time per rep estimates (minutes)
function timePerRep(drillId: string, fireMode: "live_fire" | "dry_fire"): number {
  const drill = getDrill(drillId);
  if (!drill) return 2;
  const base = fireMode === "live_fire" ? 2.5 : 1.5;
  // More rounds = more time per rep
  const roundFactor = Math.max(1, drill.roundCount / 6);
  return base * roundFactor;
}

function pickReps(fireMode: "live_fire" | "dry_fire"): number {
  // Live fire: 3-4 reps, dry fire: 4-5 reps
  return fireMode === "live_fire" ? 3 : 5;
}

function getCategoryDisplayName(category: string): string {
  switch (category) {
    case "fundamentals": return "Fundamentals";
    case "transitions": return "Transitions";
    case "reloads": return "Reloads";
    case "movement": return "Movement";
    case "stage_craft": return "Stage Craft";
    case "confirmation": return "Confirmation";
    case "single_hand": return "Single Hand";
    default: return category;
  }
}

export function generateSessionPlan(options: {
  totalMinutes: number;
  fireMode: "live_fire" | "dry_fire";
  maxDistance: number;
  hasMovementSpace: boolean;
}): SessionPlan {
  const constraints: SessionConstraints = {
    fireMode: options.fireMode,
    movementAvailable: options.hasMovementSpace,
    timeMinutes: options.totalMinutes,
    maxDistance: options.maxDistance,
  };

  const recommendations = generateRecommendations(constraints);
  if (recommendations.length === 0) {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
      totalMinutes: 0,
      fireMode: options.fireMode,
      drills: [],
      estimatedRounds: 0,
      focusAreas: [],
      constraints,
    };
  }

  const weaknessTimeBudget = options.totalMinutes * 0.7;
  const totalTimeBudget = options.totalMinutes;

  const planned: PlannedDrill[] = [];
  let usedTime = 0;
  const usedDrillIds = new Set<string>();
  // Track skill coverage to ensure variety
  const coveredPrimarySkills = new Set<string>();

  // Phase 1: Weakness drills (top priority gaps)
  for (const rec of recommendations) {
    if (usedTime >= weaknessTimeBudget) break;
    if (usedDrillIds.has(rec.drillId)) continue;

    // Prefer variety: skip if we already cover this drill's primary skill
    const primarySkill = rec.targetSkillIds[0];
    if (primarySkill && coveredPrimarySkills.has(primarySkill) && planned.length >= 2) {
      continue;
    }

    const reps = pickReps(options.fireMode);
    const estTime = timePerRep(rec.drillId, options.fireMode) * reps + 1; // +1 min setup

    if (usedTime + estTime > weaknessTimeBudget + 3) break; // small overflow allowed

    const drill = getDrill(rec.drillId);
    planned.push({
      drillId: rec.drillId,
      drillName: rec.drillName,
      distanceYards: rec.distance,
      reps,
      purpose: "weakness",
      estimatedMinutes: Math.round(estTime),
      targetSkills: rec.targetSkillIds,
      targetSkillNames: rec.targetSkillNames,
      reason: rec.reason,
      roundCount: drill?.roundCount || 6,
      priority: rec.priority,
    });

    usedDrillIds.add(rec.drillId);
    usedTime += estTime;
    for (const sid of rec.targetSkillIds) {
      coveredPrimarySkills.add(sid);
    }
  }

  // Phase 2: Maintenance drills (lower priority = stronger skills)
  const maintenance = recommendations
    .filter(r => !usedDrillIds.has(r.drillId))
    .slice(-15) // weakest priority = strongest skills
    .reverse();

  for (const rec of maintenance) {
    if (usedTime >= totalTimeBudget) break;
    if (usedDrillIds.has(rec.drillId)) continue;

    const reps = Math.max(2, pickReps(options.fireMode) - 1); // fewer reps for maintenance
    const estTime = timePerRep(rec.drillId, options.fireMode) * reps + 1;

    if (usedTime + estTime > totalTimeBudget + 2) break;

    const drill = getDrill(rec.drillId);
    planned.push({
      drillId: rec.drillId,
      drillName: rec.drillName,
      distanceYards: rec.distance,
      reps,
      purpose: "maintenance",
      estimatedMinutes: Math.round(estTime),
      targetSkills: rec.targetSkillIds,
      targetSkillNames: rec.targetSkillNames,
      reason: rec.reason.startsWith("Maintain:") ? rec.reason : "Maintain: " + rec.reason.replace("Build ", ""),
      roundCount: drill?.roundCount || 6,
      priority: rec.priority,
    });

    usedDrillIds.add(rec.drillId);
    usedTime += estTime;
  }

  // Compute focus areas from top skill categories
  const categoryCount = new Map<string, number>();
  for (const pd of planned) {
    for (const sid of pd.targetSkills) {
      const skill = skills.find(s => s.id === sid);
      if (skill && !skill.parentId) {
        const cat = getCategoryDisplayName(skill.category);
        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
      }
    }
  }
  const focusAreas = [...categoryCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  const estimatedRounds = planned.reduce(
    (sum, d) => sum + d.roundCount * d.reps,
    0
  );

  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    totalMinutes: planned.reduce((s, d) => s + d.estimatedMinutes, 0),
    fireMode: options.fireMode,
    drills: planned,
    estimatedRounds,
    focusAreas,
    constraints,
  };
}

/** Get alternative drills to swap in for a given planned drill */
export function getAlternatives(
  plan: SessionPlan,
  drillIndex: number,
  count: number = 5
): DrillRecommendation[] {
  const currentDrill = plan.drills[drillIndex];
  if (!currentDrill) return [];

  const usedIds = new Set(plan.drills.map(d => d.drillId));
  const allRecs = generateRecommendations(plan.constraints);

  return allRecs
    .filter(r => !usedIds.has(r.drillId))
    .slice(0, count);
}

/** Swap a drill in the plan at the given index */
export function swapDrill(plan: SessionPlan, drillIndex: number, replacement: DrillRecommendation): SessionPlan {
  const newDrills = [...plan.drills];
  const old = newDrills[drillIndex];
  if (!old) return plan;

  const reps = old.reps;
  const estTime = timePerRep(replacement.drillId, plan.fireMode) * reps + 1;
  const drill = getDrill(replacement.drillId);

  newDrills[drillIndex] = {
    drillId: replacement.drillId,
    drillName: replacement.drillName,
    distanceYards: replacement.distance,
    reps,
    purpose: old.purpose,
    estimatedMinutes: Math.round(estTime),
    targetSkills: replacement.targetSkillIds,
    targetSkillNames: replacement.targetSkillNames,
    reason: replacement.reason,
    roundCount: drill?.roundCount || 6,
    priority: replacement.priority,
  };

  const estimatedRounds = newDrills.reduce((s, d) => s + d.roundCount * d.reps, 0);
  const totalMinutes = newDrills.reduce((s, d) => s + d.estimatedMinutes, 0);

  return { ...plan, drills: newDrills, estimatedRounds, totalMinutes };
}

// localStorage persistence
export function savePlan(plan: SessionPlan) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function loadPlan(): SessionPlan | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPlan() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// Track progress through a plan during active session
const PROGRESS_KEY = "uspsa_plan_progress";

export interface PlanProgress {
  planId: string;
  sessionId: string;
  completedDrillIndices: number[];
  skippedDrillIndices: number[];
}

export function savePlanProgress(progress: PlanProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function loadPlanProgress(): PlanProgress | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPlanProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROGRESS_KEY);
}
