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

  return (
    <div>
      {/* Today's Summary */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">Today</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 border border-surface-200 text-center">
            <div className="text-2xl font-bold text-brand-600">{todayStats.drills}</div>
            <div className="text-xs text-surface-500 mt-1">Drills</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-surface-200 text-center">
            <div className="text-2xl font-bold text-surface-900">{todayStats.rounds}</div>
            <div className="text-xs text-surface-500 mt-1">Rounds</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-surface-200 text-center">
            <div className="text-2xl font-bold text-surface-900">
              {todayStats.runs}
              <span className="text-sm font-normal text-surface-400">/{dailyGoal}</span>
            </div>
            <div className="text-xs text-surface-500 mt-1">XP Goal</div>
          </div>
        </div>
      </div>

      {/* Assessment Banner (cold start) */}
      {assessment && !assessment.isComplete && (
        <div className="px-4 mb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="font-semibold text-amber-800">Initial Assessment</h3>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              Complete {assessment.totalCount} baseline drills at 7yd so we can build your skill profile and recommend training.
            </p>
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${(assessment.completedCount / assessment.totalCount) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-amber-700">
                {assessment.completedCount}/{assessment.totalCount}
              </span>
            </div>
            {/* Drill checklist */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {assessment.drills.map((d) => (
                <div
                  key={d.drillId}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                    d.isComplete ? "text-green-700 bg-green-50" : "text-amber-700"
                  }`}
                >
                  {d.isComplete ? (
                    <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="w-3.5 h-3.5 border border-amber-400 rounded-sm" />
                  )}
                  <span>{d.name}</span>
                  <span className="text-amber-500 ml-auto">{d.why}</span>
                </div>
              ))}
            </div>
            {assessment.nextDrillId && (
              <Link
                href={`/session?guided=assessment&fireMode=${assessment.fireMode}&drillId=${assessment.nextDrillId}`}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
              >
                Start: {assessment.drills.find(d => d.drillId === assessment.nextDrillId)?.name}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Guided Session Builder */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Train</h3>
            <span className="text-xs text-surface-400">What can you do today?</span>
          </div>

          <ConstraintSelector
            constraints={constraints}
            onChange={handleConstraintChange}
            compact
          />

          {/* Top Recommendations */}
          {hasData && topRecs.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {topRecs.map((rec, i) => (
                <div key={rec.drillId} className="flex items-center gap-2 text-sm">
                  <span className="text-xs font-bold text-surface-400 w-4">{i + 1}</span>
                  <Link
                    href={`/drills/${rec.drillId}`}
                    className="text-brand-600 font-medium hover:underline"
                  >
                    {rec.drillName}
                  </Link>
                  <span className="text-xs text-surface-400">@ {rec.distance}yd</span>
                  <span className="text-xs text-surface-500 ml-auto truncate max-w-[140px]">{rec.reason}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <Link
              href="/session"
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
            >
              Start Session
            </Link>
            {hasData && (
              <button
                onClick={handleBuildPlan}
                className="px-4 py-3 bg-surface-100 hover:bg-surface-200 text-surface-700 font-medium rounded-xl text-sm transition-colors"
              >
                Build Plan
              </button>
            )}
          </div>

          {/* Dry Fire Distance Calculator */}
          {constraints.fireMode === "dry_fire" && <DryFireDistanceCalc />}

          {/* Session Plan */}
          {plan && showPlanBuilder && (
            <div className="mt-3 border-t border-surface-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-surface-500 uppercase">Session Plan</span>
                <span className="text-xs text-surface-400">
                  ~{plan.totalMinutes} min · ~{plan.totalRounds} rds
                </span>
              </div>
              <div className="space-y-1">
                {plan.drills.map((d, i) => (
                  <div key={d.drillId} className="flex items-center gap-2 text-xs py-1">
                    <span className="font-bold text-surface-400 w-4">{i + 1}</span>
                    <span className="font-medium">{d.drillName}</span>
                    <span className="text-surface-400">@ {d.distance}yd</span>
                    <span className="text-surface-400 ml-auto">{d.reason}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowPlanBuilder(false)}
                className="text-xs text-surface-400 mt-2 hover:text-surface-600"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Skill Overview */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Skill Overview</h3>
            <span className="text-xs text-surface-400">vs. target classification</span>
          </div>
          <div className="space-y-2">
            {categories.map((cat) => {
              const label = CATEGORY_LABELS[cat.category] || cat.category;
              const pct = Math.round(cat.mastery);
              const barColor = cat.confidence > 0 ? pctBgColor(pct) : "bg-surface-200";
              return (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-sm text-surface-600 w-24 truncate">{label}</span>
                  <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all`}
                      style={{ width: `${Math.max(pct, cat.confidence > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-surface-400 w-10 text-right">
                    {cat.confidence > 0 ? `${pct}%` : "\u2014"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Weakest Skills */}
          {weakSkills.length > 0 && weakSkills[0].confidence > 0 && (
            <div className="mt-3 border-t border-surface-100 pt-3">
              <h4 className="text-xs font-semibold text-surface-500 uppercase mb-2">Focus Areas</h4>
              <div className="space-y-1.5">
                {weakSkills.filter(s => s.confidence > 0).slice(0, 3).map((skill) => (
                  <div key={skill.skillId} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      skill.mastery >= 80 ? "bg-green-400" :
                      skill.mastery >= 50 ? "bg-yellow-400" :
                      "bg-red-400"
                    }`} />
                    <span className="text-sm text-surface-700">{skill.name}</span>
                    <span className="text-xs font-mono text-surface-400 ml-auto">
                      {Math.round(skill.mastery)}%
                    </span>
                    {skill.trend === "improving" && <span className="text-xs text-green-500">+</span>}
                    {skill.trend === "declining" && <span className="text-xs text-red-500">-</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasData && (
            <p className="text-xs text-surface-400 mt-3 italic">
              Complete the initial assessment to populate skill data.
            </p>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Recent Sessions</h3>
          <Link href="/history" className="text-sm text-brand-600 font-medium">
            View All
          </Link>
        </div>
        {recentSessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-surface-200 p-6 text-center">
            <p className="text-sm text-surface-400">No sessions yet. Start your first training session!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-surface-200 divide-y divide-surface-100">
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
                  className="p-3 flex items-center gap-3 hover:bg-surface-50 block"
                >
                  <div
                    className={`w-10 h-10 ${isLive ? "bg-brand-50" : "bg-blue-50"} rounded-lg flex items-center justify-center`}
                  >
                    {isLive ? (
                      <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {isLive ? "Live Fire" : "Dry Fire"}
                      {session.location ? ` \u2014 ${session.location}` : ""}
                    </div>
                    <div className="text-xs text-surface-400">
                      {formatDate(session.startedAt)} · {stats.drillNames.join(", ") || "No drills"} · {stats.totalRounds} rounds
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${isLive ? "text-brand-600" : "text-blue-600"}`}>
                      {stats.validRuns} XP
                    </div>
                    <div className="text-xs text-surface-400">{duration} min</div>
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
