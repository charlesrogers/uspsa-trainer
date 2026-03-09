// Cold Start Assessment
// Defines minimal drill batteries to seed initial skill estimates

import { getRuns } from "./store";

// The assessment batteries use the Standard Practice Setup (3 targets, 1yd apart, 7yd)
// These drills collectively cover: draw, cadence, recoil, transitions, reloads, SHO, WHO

const DRY_FIRE_BATTERY = [
  { drillId: "dr-pairs", name: "Pairs", why: "Draw speed + cadence" },
  { drillId: "dr-blake", name: "Blake Drill", why: "Transitions + splits" },
  { drillId: "dr-singles", name: "Singles", why: "Pure transition speed" },
  { drillId: "dr-4aces", name: "4 Aces", why: "Reload speed" },
];

const LIVE_FIRE_BATTERY = [
  { drillId: "dr-pairs", name: "Pairs", why: "Draw speed + cadence" },
  { drillId: "dr-bill", name: "Bill Drill", why: "Grip + recoil control" },
  { drillId: "dr-blake", name: "Blake Drill", why: "Transitions + splits" },
  { drillId: "dr-4aces", name: "4 Aces", why: "Reload speed" },
  { drillId: "dr-sho", name: "Strong Hand Only", why: "SHO baseline" },
  { drillId: "dr-who", name: "Weak Hand Only", why: "WHO baseline" },
];

export interface AssessmentDrill {
  drillId: string;
  name: string;
  why: string;
  isComplete: boolean;
}

export interface AssessmentPlan {
  fireMode: "dry_fire" | "live_fire";
  drills: AssessmentDrill[];
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
  nextDrillId: string | null;
}

function checkCompletion(battery: typeof DRY_FIRE_BATTERY, fireMode: "dry_fire" | "live_fire"): AssessmentDrill[] {
  const runs = getRuns().filter(r => r.isValid && r.fireMode === fireMode);

  return battery.map(d => ({
    ...d,
    isComplete: runs.some(r => r.drillId === d.drillId && r.distanceYards === 7),
  }));
}

export function getAssessmentPlan(fireMode: "dry_fire" | "live_fire"): AssessmentPlan {
  const battery = fireMode === "dry_fire" ? DRY_FIRE_BATTERY : LIVE_FIRE_BATTERY;
  const drills = checkCompletion(battery, fireMode);
  const completedCount = drills.filter(d => d.isComplete).length;
  const nextDrill = drills.find(d => !d.isComplete);

  return {
    fireMode,
    drills,
    completedCount,
    totalCount: drills.length,
    isComplete: completedCount >= drills.length,
    nextDrillId: nextDrill?.drillId || null,
  };
}

export function isAssessmentComplete(fireMode: "dry_fire" | "live_fire"): boolean {
  return getAssessmentPlan(fireMode).isComplete;
}

export function isAnyAssessmentComplete(): boolean {
  return isAssessmentComplete("dry_fire") || isAssessmentComplete("live_fire");
}

export function getAssessmentDrillIds(fireMode: "dry_fire" | "live_fire"): string[] {
  const battery = fireMode === "dry_fire" ? DRY_FIRE_BATTERY : LIVE_FIRE_BATTERY;
  return battery.map(d => d.drillId);
}
