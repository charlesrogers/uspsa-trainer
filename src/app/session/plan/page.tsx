"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  generateSessionPlan,
  getAlternatives,
  swapDrill,
  savePlan,
  loadPlan,
  savePlanProgress,
  type SessionPlan,
  type PlannedDrill,
} from "@/lib/sessionPlanner";
import { getConstraints } from "@/lib/recommendations";
import type { DrillRecommendation } from "@/lib/recommendations";
import { createSession } from "@/lib/store";
import { generateId } from "@/lib/utils";

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [mounted, setMounted] = useState(false);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [alternatives, setAlternatives] = useState<DrillRecommendation[]>([]);

  useEffect(() => {
    setMounted(true);
    // Try to load existing plan first
    const existing = loadPlan();
    if (existing) {
      setPlan(existing);
    } else {
      regenerate();
    }
  }, []);

  const regenerate = () => {
    const constraints = getConstraints();
    const newPlan = generateSessionPlan({
      totalMinutes: constraints.timeMinutes,
      fireMode: constraints.fireMode,
      maxDistance: constraints.maxDistance,
      hasMovementSpace: constraints.movementAvailable,
    });
    setPlan(newPlan);
    savePlan(newPlan);
    setSwapIndex(null);
    setAlternatives([]);
  };

  const handleSwapOpen = (index: number) => {
    if (swapIndex === index) {
      setSwapIndex(null);
      setAlternatives([]);
      return;
    }
    if (!plan) return;
    setSwapIndex(index);
    const alts = getAlternatives(plan, index, 5);
    setAlternatives(alts);
  };

  const handleSwapSelect = (alt: DrillRecommendation) => {
    if (!plan || swapIndex === null) return;
    const newPlan = swapDrill(plan, swapIndex, alt);
    setPlan(newPlan);
    savePlan(newPlan);
    setSwapIndex(null);
    setAlternatives([]);
  };

  const handleStartSession = () => {
    if (!plan) return;

    // Create a session
    const session = {
      id: generateId(),
      startedAt: new Date().toISOString(),
      endedAt: null,
      fireMode: plan.fireMode,
      location: "",
      notes: `Planned workout: ${plan.focusAreas.join(", ")}`,
    };
    createSession(session);

    // Save plan progress tracker
    savePlanProgress({
      planId: plan.id,
      sessionId: session.id,
      completedDrillIndices: [],
      skippedDrillIndices: [],
    });

    // Navigate to active session with plan flag
    router.push("/session/active?plan=true");
  };

  if (!mounted) return null;

  if (!plan || plan.drills.length === 0) {
    return (
      <div className="px-4 pt-8 text-center">
        <div className="text-surface-400 text-sm mb-4">
          No drills available for your current constraints. Try adjusting fire mode, distance, or time.
        </div>
        <Link href="/session" className="text-brand-600 text-sm font-medium">
          Back to Setup
        </Link>
      </div>
    );
  }

  const weaknessDrills = plan.drills.filter(d => d.purpose === "weakness");
  const maintenanceDrills = plan.drills.filter(d => d.purpose === "maintenance");

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2">
        <Link href="/session" className="text-brand-600 flex items-center gap-1 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>

      <div className="px-4">
        <h1 className="text-2xl font-bold mb-1">Today&apos;s Workout</h1>
        <p className="text-surface-500 text-sm mb-4">
          {plan.fireMode === "live_fire" ? "Live Fire" : "Dry Fire"} Plan
        </p>

        {/* Summary card */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-surface-200 p-4 mb-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-400">{plan.totalMinutes}</div>
              <div className="text-xs text-surface-500">minutes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-surface-800">{plan.drills.length}</div>
              <div className="text-xs text-surface-500">drills</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-surface-800">
                {plan.fireMode === "live_fire" ? plan.estimatedRounds : "--"}
              </div>
              <div className="text-xs text-surface-500">
                {plan.fireMode === "live_fire" ? "rounds" : ""}
              </div>
            </div>
          </div>
          {plan.focusAreas.length > 0 && (
            <div className="mt-3 pt-3 border-t border-surface-200">
              <div className="text-xs text-surface-500 mb-1.5">Focus Areas</div>
              <div className="flex flex-wrap gap-1.5">
                {plan.focusAreas.map(area => (
                  <span key={area} className="text-xs bg-brand-600/15 text-brand-400 px-2 py-0.5 rounded-full">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Weakness drills section */}
        {weaknessDrills.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider">
                Weakness Work
              </h2>
              <span className="text-xs text-surface-400">
                {weaknessDrills.reduce((s, d) => s + d.estimatedMinutes, 0)} min
              </span>
            </div>
            <div className="space-y-2">
              {weaknessDrills.map((drill, i) => {
                const globalIndex = plan.drills.indexOf(drill);
                return (
                  <DrillCard
                    key={drill.drillId + i}
                    drill={drill}
                    index={globalIndex}
                    isSwapping={swapIndex === globalIndex}
                    onSwapOpen={() => handleSwapOpen(globalIndex)}
                    fireMode={plan.fireMode}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Maintenance drills section */}
        {maintenanceDrills.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-brand-600" />
              <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider">
                Maintenance
              </h2>
              <span className="text-xs text-surface-400">
                {maintenanceDrills.reduce((s, d) => s + d.estimatedMinutes, 0)} min
              </span>
            </div>
            <div className="space-y-2">
              {maintenanceDrills.map((drill, i) => {
                const globalIndex = plan.drills.indexOf(drill);
                return (
                  <DrillCard
                    key={drill.drillId + i}
                    drill={drill}
                    index={globalIndex}
                    isSwapping={swapIndex === globalIndex}
                    onSwapOpen={() => handleSwapOpen(globalIndex)}
                    fireMode={plan.fireMode}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Swap alternatives panel */}
        {swapIndex !== null && alternatives.length > 0 && (
          <div className="fixed inset-x-0 bottom-0 bg-[var(--bg-elevated)] border-t border-surface-200 rounded-t-2xl p-4 pb-8 max-w-md mx-auto z-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Swap Drill</h3>
              <button
                onClick={() => { setSwapIndex(null); setAlternatives([]); }}
                className="text-xs text-surface-400 hover:text-surface-600"
              >
                Cancel
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {alternatives.map(alt => (
                <button
                  key={alt.drillId}
                  onClick={() => handleSwapSelect(alt)}
                  className="w-full text-left bg-[var(--bg-card)] rounded-xl border border-surface-200 p-3 hover:border-brand-600/50 active:bg-[var(--bg-elevated)]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{alt.drillName}</div>
                      <div className="text-xs text-surface-500">{alt.distance}yd &middot; {alt.roundCount} rds</div>
                    </div>
                    <div className="text-xs text-surface-400">{alt.reason}</div>
                  </div>
                </button>
              ))}
              {alternatives.length === 0 && (
                <div className="text-xs text-surface-400 text-center py-4">
                  No alternative drills available
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 mt-6">
          <button
            onClick={handleStartSession}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-4 rounded-xl text-lg"
          >
            Start Session
          </button>
          <button
            onClick={regenerate}
            className="w-full bg-surface-100 hover:bg-surface-200 text-surface-600 font-medium py-3 rounded-xl text-sm"
          >
            Regenerate Plan
          </button>
        </div>
      </div>
    </div>
  );
}

function DrillCard({
  drill,
  index,
  isSwapping,
  onSwapOpen,
  fireMode,
}: {
  drill: PlannedDrill;
  index: number;
  isSwapping: boolean;
  onSwapOpen: () => void;
  fireMode: string;
}) {
  const isWeakness = drill.purpose === "weakness";
  const accentBorder = isWeakness ? "border-amber-500/30" : "border-brand-600/30";
  const badgeBg = isWeakness ? "bg-amber-500/15 text-amber-400" : "bg-brand-600/15 text-brand-400";

  return (
    <div
      className={`bg-[var(--bg-card)] rounded-xl border ${accentBorder} ${
        isSwapping ? "ring-2 ring-brand-600/50" : ""
      } p-3`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Number badge */}
          <div className="w-7 h-7 rounded-lg bg-surface-100 flex items-center justify-center text-xs font-bold text-surface-600 shrink-0 mt-0.5">
            {index + 1}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm leading-tight">{drill.drillName}</div>
            <div className="text-xs text-surface-500 mt-0.5">
              {drill.distanceYards}yd &middot; {drill.reps} reps &middot; ~{drill.estimatedMinutes} min
              {fireMode === "live_fire" && (
                <> &middot; {drill.roundCount * drill.reps} rds</>
              )}
            </div>
            <div className="text-xs text-surface-400 mt-1">{drill.reason}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badgeBg}`}>
            {isWeakness ? "WEAK" : "MAINT"}
          </span>
          <button
            onClick={onSwapOpen}
            className="w-7 h-7 rounded-lg bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-surface-400 hover:text-surface-600"
            title="Swap drill"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>
      </div>
      {/* Skill tags */}
      {drill.targetSkillNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-10">
          {drill.targetSkillNames.slice(0, 3).map(name => (
            <span key={name} className="text-[10px] bg-surface-100 text-surface-500 px-1.5 py-0.5 rounded">
              {name}
            </span>
          ))}
          {drill.targetSkillNames.length > 3 && (
            <span className="text-[10px] text-surface-400">+{drill.targetSkillNames.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
