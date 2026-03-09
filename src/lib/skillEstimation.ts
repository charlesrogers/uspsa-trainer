// Skill Estimation Engine
// Computes per-skill mastery scores from run history

import {
  getRuns, getProfile, getDrill,
  drills, skills, drillSkillMaps, allBenchmarks,
} from "./store";
import type { SessionRun } from "./store";
import type { DrillBenchmark } from "@/data/seed";

export interface SkillEstimate {
  skillId: string;
  name: string;
  category: string;
  mastery: number;       // 0-100, % of target classification benchmark
  confidence: number;    // 0-1, based on signal count
  signalCount: number;
  lastAssessed: string | null;
  trend: "improving" | "stable" | "declining" | "unknown";
}

export interface CategoryEstimate {
  category: string;
  mastery: number;
  confidence: number;
  skillCount: number;
}

interface SkillSignal {
  pctOfBenchmark: number;
  weight: number;
  timestamp: string;
}

// ─── Core computation ───

function findBenchmark(drillId: string, classification: string, distance: number, fireMode: string): DrillBenchmark | undefined {
  // Exact match first
  let bm = allBenchmarks.find(
    b => b.drillId === drillId && b.classification === classification &&
         b.distanceYards === distance && b.fireMode === fireMode
  );
  if (bm) return bm;

  // Fallback: nearest distance for same drill/class/mode
  const candidates = allBenchmarks.filter(
    b => b.drillId === drillId && b.classification === classification && b.fireMode === fireMode
  );
  if (candidates.length === 0) return undefined;
  candidates.sort((a, c) => Math.abs(a.distanceYards - distance) - Math.abs(c.distanceYards - distance));
  return candidates[0];
}

function collectSignals(targetClass: string): Map<string, SkillSignal[]> {
  const runs = getRuns().filter(r => r.isValid);
  const now = Date.now();
  const signals = new Map<string, SkillSignal[]>();

  for (const run of runs) {
    const mappings = drillSkillMaps.filter(m => m.drillId === run.drillId);
    if (mappings.length === 0) continue;

    const bm = findBenchmark(run.drillId, targetClass, run.distanceYards, run.fireMode);
    if (!bm) continue;

    const pctOfBenchmark = (bm.targetTime / run.totalTime) * 100;
    const daysSince = (now - new Date(run.capturedAt).getTime()) / 86400000;
    const recencyWeight = Math.pow(0.97, daysSince); // gentle decay
    const coldBonus = run.isCold ? 1.2 : 1.0;

    for (const mapping of mappings) {
      const weight = mapping.encompassingWeight * recencyWeight * coldBonus;
      const signal: SkillSignal = {
        pctOfBenchmark: Math.min(pctOfBenchmark, 150), // cap at 150%
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

function aggregateSignals(sigs: SkillSignal[]): { mastery: number; confidence: number; trend: SkillEstimate["trend"] } {
  if (sigs.length === 0) {
    return { mastery: 0, confidence: 0, trend: "unknown" };
  }

  // Weighted average
  let weightSum = 0;
  let valueSum = 0;
  for (const s of sigs) {
    valueSum += s.pctOfBenchmark * s.weight;
    weightSum += s.weight;
  }
  const mastery = Math.min(100, weightSum > 0 ? valueSum / weightSum : 0);
  const confidence = Math.min(1.0, sigs.length / 5);

  // Trend: compare recent vs older
  let trend: SkillEstimate["trend"] = "unknown";
  if (sigs.length >= 4) {
    const sorted = [...sigs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentAvg = sorted.slice(0, Math.ceil(sorted.length / 2))
      .reduce((s, x) => s + x.pctOfBenchmark, 0) / Math.ceil(sorted.length / 2);
    const olderAvg = sorted.slice(Math.ceil(sorted.length / 2))
      .reduce((s, x) => s + x.pctOfBenchmark, 0) / Math.floor(sorted.length / 2);
    const delta = recentAvg - olderAvg;
    if (delta > 5) trend = "improving";
    else if (delta < -5) trend = "declining";
    else trend = "stable";
  }

  return { mastery, confidence, trend };
}

// ─── Public API ───

export function computeAllSkillEstimates(): SkillEstimate[] {
  const profile = getProfile();
  const targetClass = profile.targetClassification || "B";
  const signals = collectSignals(targetClass);

  return skills.map(skill => {
    const sigs = signals.get(skill.id) || [];

    // For parent skills with children, also aggregate children signals
    const children = skills.filter(s => s.parentId === skill.id);
    if (children.length > 0 && sigs.length === 0) {
      // Parent with no direct signals: average children
      const childEstimates = children.map(c => {
        const childSigs = signals.get(c.id) || [];
        return aggregateSignals(childSigs);
      }).filter(e => e.confidence > 0);

      if (childEstimates.length > 0) {
        const avgMastery = childEstimates.reduce((s, e) => s + e.mastery, 0) / childEstimates.length;
        const avgConf = childEstimates.reduce((s, e) => s + e.confidence, 0) / childEstimates.length;
        return {
          skillId: skill.id,
          name: skill.name,
          category: skill.category,
          mastery: avgMastery,
          confidence: avgConf,
          signalCount: childEstimates.length,
          lastAssessed: null,
          trend: "unknown" as const,
        };
      }
    }

    const agg = aggregateSignals(sigs);
    const lastSig = sigs.length > 0
      ? sigs.reduce((latest, s) => new Date(s.timestamp) > new Date(latest.timestamp) ? s : latest).timestamp
      : null;

    return {
      skillId: skill.id,
      name: skill.name,
      category: skill.category,
      mastery: agg.mastery,
      confidence: agg.confidence,
      signalCount: sigs.length,
      lastAssessed: lastSig,
      trend: agg.trend,
    };
  });
}

export function computeCategoryEstimates(): CategoryEstimate[] {
  const estimates = computeAllSkillEstimates();

  // Only top-level skills (no parentId) for category rollup
  const topLevel = estimates.filter(e => {
    const skill = skills.find(s => s.id === e.skillId);
    return skill && !skill.parentId;
  });

  const categories = [...new Set(topLevel.map(e => e.category))];
  return categories.map(cat => {
    const catSkills = topLevel.filter(e => e.category === cat);
    const withData = catSkills.filter(e => e.confidence > 0);
    const mastery = withData.length > 0
      ? withData.reduce((s, e) => s + e.mastery, 0) / withData.length
      : 0;
    const confidence = withData.length > 0
      ? withData.reduce((s, e) => s + e.confidence, 0) / catSkills.length
      : 0;
    return { category: cat, mastery, confidence, skillCount: catSkills.length };
  });
}

export function getWeakestSkills(count: number = 5): SkillEstimate[] {
  const estimates = computeAllSkillEstimates();
  // Only top-level skills with some assessability
  const topLevel = estimates.filter(e => {
    const skill = skills.find(s => s.id === e.skillId);
    return skill && !skill.parentId;
  });

  // Score: lower mastery = more urgent, low confidence = slightly more urgent (unknown is bad)
  return topLevel
    .map(e => ({ ...e, urgency: (100 - e.mastery) + (1 - e.confidence) * 15 }))
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, count);
}

export function hasAnyData(): boolean {
  return getRuns().filter(r => r.isValid).length > 0;
}
