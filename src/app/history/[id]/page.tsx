"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getSessions,
  getSessionRuns,
  getSessionStats,
  getDrill,
  computeClassificationPct,
  getProfile,
} from "@/lib/store";
import type { Session, SessionRun } from "@/lib/store";
import { formatDateTime, minutesBetween, formatTime, pctColor } from "@/lib/utils";

export default function SessionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [session, setSession] = useState<Session | null>(null);
  const [runs, setRuns] = useState<SessionRun[]>([]);
  const [mounted, setMounted] = useState(false);
  const [classification, setClassification] = useState("B");

  useEffect(() => {
    setMounted(true);
    const sessions = getSessions();
    const s = sessions.find((s) => s.id === id);
    if (s) {
      setSession(s);
      setRuns(getSessionRuns(s.id));
    }
    setClassification(getProfile().classification);
  }, [id]);

  if (!mounted || !session) return null;

  const stats = getSessionStats(session.id);
  const duration = session.endedAt
    ? minutesBetween(session.startedAt, session.endedAt)
    : 0;
  const validRuns = runs.filter((r) => r.isValid);
  const coldRuns = validRuns.filter((r) => r.isCold);
  const warmRuns = validRuns.filter((r) => !r.isCold);

  // Cold vs Warm comparison
  const coldRun = coldRuns.length > 0 ? coldRuns[0] : null;
  const bestWarm =
    warmRuns.length > 0
      ? warmRuns.reduce((best, r) => (r.totalTime < best.totalTime ? r : best))
      : null;

  const ownership =
    coldRun && bestWarm
      ? ((bestWarm.totalTime / coldRun.totalTime) * 100).toFixed(0)
      : null;

  const ownershipLabel = (pct: number) => {
    if (pct >= 97) return "Owned";
    if (pct >= 92) return "Functional but fragile";
    if (pct >= 85) return "Needs more reps";
    return "Not yet owned";
  };

  return (
    <div>
      <div className="px-4 py-3 flex items-center gap-2">
        <Link href="/history" className="text-brand-600 flex items-center gap-1 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          History
        </Link>
      </div>

      <div className="px-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Session Summary</h1>
            <p className="text-sm text-surface-400">
              {formatDateTime(session.startedAt)} ·{" "}
              {session.fireMode === "live_fire" ? "Live Fire" : "Dry Fire"}
              {session.location ? ` · ${session.location}` : ""}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-brand-600">{stats.validRuns} XP</div>
            <div className="text-xs text-surface-400">{duration} min</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-white rounded-xl border border-surface-200 p-2 text-center">
            <div className="text-lg font-bold">{stats.totalRuns}</div>
            <div className="text-xs text-surface-400">Runs</div>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-2 text-center">
            <div className="text-lg font-bold">{stats.validRuns}</div>
            <div className="text-xs text-surface-400">Valid</div>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-2 text-center">
            <div className="text-lg font-bold">{stats.totalRounds}</div>
            <div className="text-xs text-surface-400">Rounds</div>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-2 text-center">
            <div className="text-lg font-bold">{stats.drillCount}</div>
            <div className="text-xs text-surface-400">Drills</div>
          </div>
        </div>

        {/* Run breakdown */}
        <div className="bg-white rounded-xl border border-surface-200 divide-y divide-surface-100 mb-4">
          {runs.map((run) => {
            const drill = getDrill(run.drillId);
            const pct = run.isValid
              ? computeClassificationPct(
                  run.totalTime,
                  run.drillId,
                  run.distanceYards,
                  classification,
                  run.fireMode
                )
              : null;

            return (
              <div key={run.id} className={`p-3 ${!run.isValid ? "opacity-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-medium text-sm ${!run.isValid ? "line-through" : ""}`}>
                      {drill?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-surface-400 ml-1">@ {run.distanceYards}yd</span>
                    {run.isCold && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded ml-1">COLD</span>
                    )}
                    {!run.isValid && (
                      <span className="text-xs bg-red-100 text-red-700 px-1 rounded ml-1">INVALID</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        !run.isValid ? "text-surface-400 line-through" : ""
                      }`}
                    >
                      {formatTime(run.totalTime)}s
                    </span>
                    {run.isValid && pct !== null && (
                      <span className={`text-xs ml-2 ${pctColor(pct)}`}>{Math.round(pct)}%</span>
                    )}
                  </div>
                </div>
                {run.isValid && (
                  <div className="text-xs text-surface-400 mt-1">
                    {run.firstShotTime ? `1st: ${formatTime(run.firstShotTime)}s · ` : ""}
                    {run.splits.length > 0
                      ? `Splits: ${run.splits.map((s) => s.toFixed(2)).join(", ")} · `
                      : ""}
                    {run.fireMode === "dry_fire" && run.dryFireCallPct !== null
                      ? `${run.dryFireCallPct}% calls good`
                      : run.pointsDown === 0
                      ? "Clean"
                      : run.pointsDown !== null
                      ? `${run.pointsDown} pt${run.pointsDown > 1 ? "s" : ""} down`
                      : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cold vs Warm */}
        {coldRun && bestWarm && (
          <div className="bg-white rounded-xl border border-surface-200 p-4 mb-4">
            <h3 className="font-semibold text-sm mb-2">Cold vs. Warm</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-surface-400 mb-1">Cold (1st run)</div>
                <div className="font-mono text-xl font-bold text-blue-600">
                  {formatTime(coldRun.totalTime)}s
                </div>
                <div className="text-xs text-surface-500">
                  {getDrill(coldRun.drillId)?.name} @ {coldRun.distanceYards}yd
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-surface-400 mb-1">Warm (best)</div>
                <div className="font-mono text-xl font-bold text-green-600">
                  {formatTime(bestWarm.totalTime)}s
                </div>
                <div className="text-xs text-surface-500">
                  {getDrill(bestWarm.drillId)?.name} @ {bestWarm.distanceYards}yd
                </div>
              </div>
            </div>
            {ownership && (
              <div className="mt-3 text-center">
                <span className="text-xs text-surface-400">Ownership:</span>
                <span
                  className={`text-sm font-semibold ml-1 ${
                    parseInt(ownership) >= 97
                      ? "text-green-600"
                      : parseInt(ownership) >= 92
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {ownership}% ({formatTime(bestWarm.totalTime)} / {formatTime(coldRun.totalTime)})
                </span>
                <span className="text-xs text-surface-400 ml-1">
                  &mdash; {ownershipLabel(parseInt(ownership))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Session notes */}
        {session.notes && (
          <div className="bg-white rounded-xl border border-surface-200 p-4 mb-4">
            <h3 className="font-semibold text-sm mb-2">Notes</h3>
            <p className="text-sm text-surface-600">{session.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
