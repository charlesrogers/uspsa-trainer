"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTodayStats, getSessions, getSessionStats, getProfile } from "@/lib/store";
import type { Session } from "@/lib/store";
import { formatDate, minutesBetween, pctBgColor } from "@/lib/utils";
import { computeCategoryEstimates, getWeakestSkills, hasAnyData } from "@/lib/skillEstimation";
import type { CategoryEstimate, SkillEstimate } from "@/lib/skillEstimation";
import { getAssessmentPlan, isAnyAssessmentComplete } from "@/lib/assessment";
import type { AssessmentPlan } from "@/lib/assessment";
import { getConstraints, saveConstraints, getTopRecommendations, buildSessionPlan } from "@/lib/recommendations";
import type { SessionConstraints, DrillRecommendation, SessionPlan } from "@/lib/recommendations";
import ConstraintSelector from "./components/ConstraintSelector";
import DryFireDistanceCalc from "./components/DryFireDistanceCalc";

const CATEGORY_LABELS: Record<string, string> = {
  fundamentals: "Fundamentals",
  transitions: "Transitions",
  reloads: "Reloads",
  movement: "Movement",
  stage_craft: "Stage Craft",
  single_hand: "SHO/WHO",
  confirmation: "Confirmation",
  other: "Other Skills",
};

function CrosshairSVG() {
  return (
    <svg
      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none"
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      stroke="#f0f0f5"
      strokeWidth="1"
    >
      <circle cx="90" cy="90" r="70" />
      <circle cx="90" cy="90" r="45" />
      <circle cx="90" cy="90" r="20" />
      <line x1="90" y1="0" x2="90" y2="60" />
      <line x1="90" y1="120" x2="90" y2="180" />
      <line x1="0" y1="90" x2="60" y2="90" />
      <line x1="120" y1="90" x2="180" y2="90" />
      <circle cx="90" cy="90" r="3" fill="#f0f0f5" stroke="none" />
    </svg>
  );
}

function skillBarGradient(pct: number): string {
  if (pct >= 75) return "from-emerald-500 to-emerald-400";
  if (pct >= 50) return "from-yellow-500 to-amber-400";
  if (pct >= 25) return "from-orange-500 to-amber-500";
  return "from-red-500 to-rose-400";
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateStr);
}

export default function DashboardPage() {
  const [todayStats, setTodayStats] = useState({ drills: 0, rounds: 0, runs: 0 });
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [dailyGoal, setDailyGoal] = useState(30);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<CategoryEstimate[]>([]);
  const [weakSkills, setWeakSkills] = useState<SkillEstimate[]>([]);
  const [hasData, setHasData] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentPlan | null>(null);
  const [constraints, setConstraints] = useState<SessionConstraints>(getConstraints());
  const [topRecs, setTopRecs] = useState<DrillRecommendation[]>([]);
  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTodayStats(getTodayStats());
    setRecentSessions(getSessions().slice(0, 5));
    setDailyGoal(getProfile().dailyXpGoal);

    const data = hasAnyData();
    setHasData(data);
    setCategories(computeCategoryEstimates());
    setWeakSkills(getWeakestSkills(3));

    if (!isAnyAssessmentComplete()) {
      setAssessment(getAssessmentPlan("live_fire"));
    }

    const c = getConstraints();
    setConstraints(c);
    if (data) {
      setTopRecs(getTopRecommendations(c, 3));
    }
  }, []);

  const handleConstraintChange = (c: SessionConstraints) => {
    setConstraints(c);
    saveConstraints(c);
    if (hasData) {
      setTopRecs(getTopRecommendations(c, 3));
      if (showPlanBuilder) {
        setPlan(buildSessionPlan(c));
      }
    }
    if (!isAnyAssessmentComplete()) {
      setAssessment(getAssessmentPlan(c.fireMode));
    }
  };

  const handleBuildPlan = () => {
    const p = buildSessionPlan(constraints);
    setPlan(p);
    setShowPlanBuilder(true);
  };

  if (!mounted) return null;

  const xpPct = dailyGoal > 0 ? Math.min((todayStats.runs / dailyGoal) * 100, 100) : 0;

  return (
    <div className="min-h-screen pb-8">
      {/* ── Hero Stats ── */}
      <div className="relative px-6 pt-8 pb-6 overflow-hidden">
        <CrosshairSVG />
        <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "#6b6b80" }}>
          Today
        </p>
        <div className="flex items-end gap-6">
          {/* Primary stat */}
          <div>
            <span className="text-5xl font-bold tracking-tight" style={{ color: "#f0f0f5" }}>
              {todayStats.runs}
            </span>
            <span className="text-xl font-light ml-1" style={{ color: "#6b6b80" }}>
              / {dailyGoal}
            </span>
            <p className="text-xs mt-1" style={{ color: "#8b8ba0" }}>XP earned today</p>
          </div>
          {/* Secondary stats */}
          <div className="flex gap-6 mb-1.5">
            <div>
              <span className="text-xl font-semibold" style={{ color: "#f0f0f5" }}>
                {todayStats.drills}
              </span>
              <p className="text-[11px]" style={{ color: "#6b6b80" }}>drills</p>
            </div>
            <div>
              <span className="text-xl font-semibold" style={{ color: "#f0f0f5" }}>
                {todayStats.rounds}
              </span>
              <p className="text-[11px]" style={{ color: "#6b6b80" }}>rounds</p>
            </div>
          </div>
        </div>
        {/* XP progress bar */}
        <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#1a1a25" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${xpPct}%`,
              background: "linear-gradient(90deg, #22c55e, #4ade80)",
            }}
          />
        </div>
      </div>

      {/* ── Assessment Banner ── */}
      {assessment && !assessment.isComplete && (
        <div className="px-6 mb-8">
          <div
            className="relative rounded-xl p-5 border-l-2 border-emerald-500 overflow-hidden"
            style={{ backgroundColor: "#1a1a25", borderColor: "#22c55e22", borderLeftColor: "#22c55e" }}
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <svg className="w-4 h-4" style={{ color: "#22c55e" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-sm font-semibold" style={{ color: "#f0f0f5" }}>Initial Assessment</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: "#8b8ba0" }}>
              Complete {assessment.totalCount} baseline drills at 7yd so we can build your skill profile and recommend training.
            </p>
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#252530" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(assessment.completedCount / assessment.totalCount) * 100}%`,
                    background: "linear-gradient(90deg, #22c55e, #4ade80)",
                  }}
                />
              </div>
              <span className="text-xs font-medium font-mono" style={{ color: "#8b8ba0" }}>
                {assessment.completedCount}/{assessment.totalCount}
              </span>
            </div>
            {/* Drill checklist */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {assessment.drills.map((d) => (
                <div
                  key={d.drillId}
                  className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md"
                  style={{
                    color: d.isComplete ? "#4ade80" : "#8b8ba0",
                    backgroundColor: d.isComplete ? "rgba(34,197,94,0.08)" : "transparent",
                  }}
                >
                  {d.isComplete ? (
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="w-3.5 h-3.5 flex-shrink-0 rounded-sm" style={{ border: "1px solid #6b6b80" }} />
                  )}
                  <span className="truncate">{d.name}</span>
                  <span className="ml-auto flex-shrink-0" style={{ color: "#6b6b80" }}>{d.why}</span>
                </div>
              ))}
            </div>
            {assessment.nextDrillId && (
              <Link
                href={`/session?guided=assessment&fireMode=${assessment.fireMode}&drillId=${assessment.nextDrillId}`}
                className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: "#22c55e", color: "#0a0a10" }}
              >
                Start: {assessment.drills.find(d => d.drillId === assessment.nextDrillId)?.name}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Train Card ── */}
      <div className="px-6 mb-8">
        <div
          className="rounded-xl p-5 backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(26,26,37,0.8)",
            border: "1px solid rgba(255,255,255,0.04)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "#f0f0f5" }}>Train</h3>
            <span className="text-[11px] font-medium" style={{ color: "#6b6b80" }}>What can you do today?</span>
          </div>

          <ConstraintSelector
            constraints={constraints}
            onChange={handleConstraintChange}
            compact
          />

          {/* Top Recommendations */}
          {hasData && topRecs.length > 0 && (
            <div className="mt-4 space-y-1">
              {topRecs.map((rec, i) => (
                <div
                  key={rec.drillId}
                  className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                >
                  <span
                    className="w-1 h-6 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: i === 0 ? "#22c55e" : i === 1 ? "#eab308" : "#6b6b80",
                    }}
                  />
                  <span className="text-xs font-mono w-4 flex-shrink-0" style={{ color: "#6b6b80" }}>
                    {i + 1}
                  </span>
                  <Link
                    href={`/drills/${rec.drillId}`}
                    className="font-medium hover:underline decoration-1 underline-offset-2"
                    style={{ color: "#f0f0f5" }}
                  >
                    {rec.drillName}
                  </Link>
                  <span className="text-xs" style={{ color: "#6b6b80" }}>@ {rec.distance}yd</span>
                  <span className="text-xs ml-auto truncate max-w-[140px]" style={{ color: "#6b6b80" }}>
                    {rec.reason}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <Link
              href="/session"
              className="flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 hover:brightness-110 hover:shadow-lg"
              style={{
                backgroundColor: "#22c55e",
                color: "#0a0a10",
                boxShadow: "0 2px 12px rgba(34,197,94,0.25)",
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              Start Session
            </Link>
            {hasData && (
              <button
                onClick={handleBuildPlan}
                className="px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-125"
                style={{
                  color: "#8b8ba0",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backgroundColor: "transparent",
                }}
              >
                Build Plan
              </button>
            )}
          </div>

          {/* Dry Fire Distance Calculator */}
          {constraints.fireMode === "dry_fire" && <DryFireDistanceCalc />}

          {/* Session Plan */}
          {plan && showPlanBuilder && (
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "#6b6b80" }}>
                  Session Plan
                </span>
                <span className="text-xs font-mono" style={{ color: "#6b6b80" }}>
                  ~{plan.totalMinutes} min · ~{plan.totalRounds} rds
                </span>
              </div>
              <div className="space-y-0.5">
                {plan.drills.map((d, i) => (
                  <div
                    key={d.drillId}
                    className="flex items-center gap-3 text-xs py-2 px-3 rounded-md"
                    style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  >
                    <span className="font-mono w-4 flex-shrink-0" style={{ color: "#6b6b80" }}>{i + 1}</span>
                    <span className="font-medium" style={{ color: "#f0f0f5" }}>{d.drillName}</span>
                    <span style={{ color: "#6b6b80" }}>@ {d.distance}yd</span>
                    <span className="ml-auto" style={{ color: "#6b6b80" }}>{d.reason}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowPlanBuilder(false)}
                className="text-xs mt-3 transition-colors hover:brightness-150"
                style={{ color: "#6b6b80" }}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Skill Overview ── */}
      <div className="px-6 mb-8">
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: "#1a1a25",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold" style={{ color: "#f0f0f5" }}>Skill Overview</h3>
            <span className="text-[11px] font-medium" style={{ color: "#6b6b80" }}>vs. target classification</span>
          </div>
          <div className="space-y-3">
            {categories.map((cat) => {
              const label = CATEGORY_LABELS[cat.category] || cat.category;
              const pct = Math.round(cat.mastery);
              const hasConfidence = cat.confidence > 0;
              return (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-xs w-24 truncate" style={{ color: "#8b8ba0" }}>{label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#252530" }}>
                    {hasConfidence && (
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${skillBarGradient(pct)} transition-all duration-500`}
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-mono w-10 text-right" style={{ color: hasConfidence ? "#8b8ba0" : "#6b6b80" }}>
                    {hasConfidence ? `${pct}%` : "\u2014"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Weakest Skills / Focus Areas */}
          {weakSkills.length > 0 && weakSkills[0].confidence > 0 && (
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <h4 className="text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#6b6b80" }}>
                Focus Areas
              </h4>
              <div className="space-y-2.5">
                {weakSkills.filter(s => s.confidence > 0).slice(0, 3).map((skill) => (
                  <div key={skill.skillId} className="flex items-center gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          skill.mastery >= 80 ? "#22c55e" :
                          skill.mastery >= 50 ? "#eab308" :
                          "#ef4444",
                      }}
                    />
                    <span className="text-sm" style={{ color: "#f0f0f5" }}>{skill.name}</span>
                    <span className="text-xs font-mono ml-auto" style={{ color: "#8b8ba0" }}>
                      {Math.round(skill.mastery)}%
                    </span>
                    {skill.trend === "improving" && (
                      <svg className="w-3.5 h-3.5" style={{ color: "#22c55e" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                    {skill.trend === "declining" && (
                      <svg className="w-3.5 h-3.5" style={{ color: "#ef4444" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasData && (
            <p className="text-xs mt-4 italic" style={{ color: "#6b6b80" }}>
              Complete the initial assessment to populate skill data.
            </p>
          )}
        </div>
      </div>

      {/* ── Recent Sessions ── */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: "#f0f0f5" }}>Recent Sessions</h3>
          <Link
            href="/history"
            className="text-xs font-medium transition-colors hover:brightness-150"
            style={{ color: "#8b8ba0" }}
          >
            View All
          </Link>
        </div>
        {recentSessions.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ backgroundColor: "#1a1a25", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-sm" style={{ color: "#6b6b80" }}>No sessions yet. Start your first training session!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentSessions.map((session) => {
              const stats = getSessionStats(session.id);
              const duration = session.endedAt
                ? minutesBetween(session.startedAt, session.endedAt)
                : 0;
              const isLive = session.fireMode === "live_fire";
              return (
                <Link
                  key={session.id}
                  href={`/history/${session.id}`}
                  className="flex items-center gap-4 py-3 px-4 rounded-lg transition-all duration-150"
                  style={{ backgroundColor: "transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: isLive ? "rgba(34,197,94,0.1)" : "rgba(59,130,246,0.1)",
                    }}
                  >
                    {isLive ? (
                      <svg className="w-4 h-4" style={{ color: "#22c55e" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" style={{ color: "#3b82f6" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: "#f0f0f5" }}>
                      {isLive ? "Live Fire" : "Dry Fire"}
                      {session.location ? ` \u2014 ${session.location}` : ""}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "#6b6b80" }}>
                      {timeAgo(session.startedAt)} · {stats.drillNames.join(", ") || "No drills"} · {stats.totalRounds} rds
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className="text-sm font-semibold"
                      style={{ color: isLive ? "#22c55e" : "#3b82f6" }}
                    >
                      {stats.validRuns} XP
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "#6b6b80" }}>{duration} min</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
