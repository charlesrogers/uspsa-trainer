"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getDrill,
  getDrillBenchmarks,
  getDrillSkills,
  getRunsForDrill,
  getBestTimeForDrill,
  getProfile,
  sources,
  getSessions,
  computeClassificationPct,
} from "@/lib/store";
import type { SessionRun } from "@/lib/store";
import { coachingQuotes } from "@/data/seed";
import { categoryColor, categoryLabel, formatDate, formatTime, pctColor } from "@/lib/utils";
import DryFireDistanceCalc from "@/app/components/DryFireDistanceCalc";

export default function DrillDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [mounted, setMounted] = useState(false);
  const [runs, setRuns] = useState<SessionRun[]>([]);
  const [classification, setClassification] = useState("B");

  useEffect(() => {
    setMounted(true);
    setRuns(getRunsForDrill(id).sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()));
    setClassification(getProfile().classification);
  }, [id]);

  const drill = getDrill(id);
  if (!drill) {
    return (
      <div className="p-4 text-center text-surface-400">Drill not found.</div>
    );
  }

  const source = sources.find((s) => s.id === drill.sourceId);
  const cc = categoryColor(drill.category);
  const skillMaps = getDrillSkills(drill.id);
  const liveBenchmarks = getDrillBenchmarks(drill.id, "live_fire");
  const modeLabel = drill.mode === "both" ? "Live + Dry" : drill.mode === "live_fire" ? "Live Fire" : "Dry Fire";

  // Build benchmark table: distances as rows, classifications as columns
  const distances = drill.distances;
  const classes = ["C", "B", "A", "M", "GM"] as const;

  // Find breakpoint: distance where user's best drops below 85% of target classification benchmark
  let breakpoint: { distance: number; userTime: number; targetTime: number } | null = null;
  if (mounted) {
    for (const dist of distances) {
      const best = getBestTimeForDrill(drill.id, dist);
      if (best) {
        const pct = computeClassificationPct(best.totalTime, drill.id, dist, classification);
        if (pct !== null && pct < 85 && !breakpoint) {
          const bm = liveBenchmarks.find(
            (b) => b.distanceYards === dist && b.classification === classification
          );
          if (bm) {
            breakpoint = { distance: dist, userTime: best.totalTime, targetTime: bm.targetTime };
          }
        }
      }
    }
  }

  // Check for active session
  const hasActiveSession = mounted
    ? getSessions().some((s) => !s.endedAt)
    : false;

  return (
    <div>
      {/* Back */}
      <div className="px-4 py-3 flex items-center gap-2">
        <Link href="/drills" className="text-brand-600 flex items-center gap-1 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Drills
        </Link>
      </div>

      <div className="px-4">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-2xl font-bold">{drill.name}</h1>
          <span className={`text-xs ${cc.bg} ${cc.text} px-2 py-1 rounded-lg font-medium mt-1`}>
            {categoryLabel(drill.category)}
          </span>
        </div>
        <p className="text-sm text-surface-500 mb-4">
          {source?.name} · {source?.attribution}
        </p>

        {/* Setup */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-surface-200 p-4 mb-3">
          <h3 className="font-semibold text-sm mb-2">Setup</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div>
              <span className="text-surface-400">Targets:</span> {drill.targetCount} USPSA
            </div>
            <div>
              <span className="text-surface-400">Rounds:</span> {drill.roundCount}
            </div>
            <div>
              <span className="text-surface-400">Distances:</span> {drill.distances[0]}&ndash;{drill.distances[drill.distances.length - 1]} yd
            </div>
            <div>
              <span className="text-surface-400">Mode:</span> {modeLabel}
            </div>
            <div>
              <span className="text-surface-400">Start:</span> Hands relaxed
            </div>
            <div>
              <span className="text-surface-400">Scoring:</span> Time + Accuracy
            </div>
          </div>
          <p className="text-sm text-surface-600 mt-3">{drill.description}</p>

          {/* Coaching Quotes */}
          {(() => {
            const quotes = coachingQuotes.filter((q) => q.targetId === id);
            if (quotes.length === 0) return null;
            return (
              <div className="mt-3 space-y-2">
                {quotes.map((q, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3 text-xs leading-relaxed"
                    style={{
                      background: "var(--bg-elevated)",
                      borderLeft: "2px solid rgba(0,220,130,0.3)",
                    }}
                  >
                    <p style={{ color: "#c5c5d5" }}>&ldquo;{q.quote}&rdquo;</p>
                    <p className="mt-1 text-[10px]" style={{ color: "#6b6b80" }}>
                      — {q.source === "SDR"
                        ? "Skills & Drills Reloaded"
                        : q.source === "DFR"
                        ? "Dry Fire Reloaded"
                        : "Practical Shooting Training"}
                      {q.context && ` · ${q.context}`}
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Skills Tested */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-surface-200 p-4 mb-3">
          <h3 className="font-semibold text-sm mb-2">Skills Tested</h3>
          <div className="flex flex-wrap gap-2">
            {skillMaps
              .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
              .map((sm) => (
                <div
                  key={sm.skillId}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
                    sm.isPrimary
                      ? "bg-[rgba(0,220,130,0.1)] border border-brand-900"
                      : "bg-[var(--bg-elevated)]"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      sm.isPrimary ? "bg-brand-400" : "bg-brand-500"
                    }`}
                  />
                  <span className={sm.isPrimary ? "font-medium text-brand-400" : ""}>
                    {sm.skill.name}
                  </span>
                  <span className={sm.isPrimary ? "text-brand-500" : "text-surface-400"}>
                    ({sm.encompassingWeight})
                    {sm.isPrimary ? " PRIMARY" : ""}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Benchmark Table */}
        {liveBenchmarks.length > 0 && (
          <div className="bg-[var(--bg-card)] rounded-xl border border-surface-200 p-4 mb-3">
            <h3 className="font-semibold text-sm mb-3">
              Live Fire Benchmarks <span className="text-surface-400 font-normal">(seconds)</span>
            </h3>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-surface-400 border-b border-surface-200">
                    <th className="text-left py-2 px-1 font-medium">Dist</th>
                    {classes.map((cls) => (
                      <th
                        key={cls}
                        className={`text-center py-2 px-1 font-medium ${
                          cls === classification ? "bg-[rgba(0,220,130,0.1)] rounded-t" : ""
                        }`}
                      >
                        {cls}
                      </th>
                    ))}
                    <th className="text-center py-2 px-1 font-medium text-brand-600">You</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {distances.map((dist) => {
                    const best = mounted ? getBestTimeForDrill(drill.id, dist) : null;
                    const pct = best
                      ? computeClassificationPct(best.totalTime, drill.id, dist, classification)
                      : null;
                    const pctClass = pct
                      ? pct >= 100
                        ? "text-green-600"
                        : pct >= 90
                        ? "text-yellow-600"
                        : "text-red-600"
                      : "text-surface-300";

                    return (
                      <tr key={dist} className="border-b border-surface-200 benchmark-cell">
                        <td className="py-2 px-1 font-sans font-medium">{dist} yd</td>
                        {classes.map((cls) => {
                          const bm = liveBenchmarks.find(
                            (b) => b.distanceYards === dist && b.classification === cls
                          );
                          return (
                            <td
                              key={cls}
                              className={`text-center py-2 px-1 ${
                                cls === classification ? "bg-[rgba(0,220,130,0.05)]" : ""
                              } ${!bm ? "text-surface-300" : ""}`}
                            >
                              {bm ? bm.targetTime.toFixed(2) : "\u2014"}
                            </td>
                          );
                        })}
                        <td className={`text-center py-2 px-1 font-semibold ${pctClass}`}>
                          {best ? best.totalTime.toFixed(2) : "\u2014"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-xs text-surface-400">
              <p>
                <span className="font-medium text-surface-500">Standard:</span> All A-zone, 9 of 10 attempts, warmed up
              </p>
            </div>
          </div>
        )}

        {/* Breakpoint Warning */}
        {breakpoint && (
          <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-4 mb-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <div className="font-semibold text-amber-300 text-sm">
                  Breakpoint: {breakpoint.distance} yards
                </div>
                <p className="text-xs text-amber-400 mt-1">
                  Your {drill.name} score drops below 85% of the {classification}-class benchmark at{" "}
                  {breakpoint.distance} yards ({breakpoint.userTime.toFixed(2)}s vs.{" "}
                  {breakpoint.targetTime.toFixed(2)}s target). Focus training here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User History */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-surface-200 p-4 mb-4">
          <h3 className="font-semibold text-sm mb-3">Your History</h3>
          {runs.length === 0 ? (
            <p className="text-sm text-surface-400">No runs recorded for this drill yet.</p>
          ) : (
            <div className="space-y-2">
              {runs.slice(0, 10).map((run) => {
                const pct = computeClassificationPct(
                  run.totalTime,
                  drill.id,
                  run.distanceYards,
                  classification
                );
                return (
                  <div
                    key={run.id}
                    className="flex items-center justify-between text-sm p-2 rounded-lg odd:bg-[var(--bg-elevated)]"
                  >
                    <div>
                      <div className="font-medium">
                        {formatDate(run.capturedAt)}{" "}
                        <span className="text-xs text-surface-400">@ {run.distanceYards}yd</span>
                        {run.isCold && (
                          <span className="text-xs bg-blue-900/30 text-blue-400 px-1 rounded ml-1">
                            COLD
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-surface-400">
                        {run.fireMode === "live_fire" ? "Live" : "Dry"} ·{" "}
                        {run.isCold ? "Cold" : "Warm"} · {drill.roundCount} rds
                        {run.pointsDown !== null && run.pointsDown > 0
                          ? ` · ${run.pointsDown} pts down`
                          : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold">{formatTime(run.totalTime)}s</div>
                      {pct !== null && (
                        <div className={`text-xs ${pctColor(pct)}`}>
                          {Math.round(pct)}% of {classification}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dry Fire Setup — for drills that support dry fire */}
        {(drill.mode === "dry_fire" || drill.mode === "both") && (
          <div className="bg-[var(--bg-card)] rounded-xl border border-surface-200 p-4 mb-3">
            <DryFireDistanceCalc
              presetDistances={drill.distances}
              compact
            />
          </div>
        )}

        {/* Run This Drill */}
        {hasActiveSession ? (
          <Link
            href={`/session/active?drillId=${drill.id}`}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl mb-4 transition-colors block text-center"
          >
            Run This Drill
          </Link>
        ) : (
          <Link
            href={`/session?drillId=${drill.id}`}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl mb-4 transition-colors block text-center"
          >
            Run This Drill
          </Link>
        )}
      </div>
    </div>
  );
}
