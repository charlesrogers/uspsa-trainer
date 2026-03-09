"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessions, getSessionStats, getDrill } from "@/lib/store";
import type { Session } from "@/lib/store";
import { formatDate, minutesBetween } from "@/lib/utils";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSessions(getSessions());
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Session History</h1>
      {sessions.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-xl border border-surface-200 p-6 text-center">
          <p className="text-sm text-surface-400 mb-4">No sessions recorded yet.</p>
          <Link
            href="/session"
            className="text-sm text-brand-600 font-medium"
          >
            Start your first session
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => {
            const stats = getSessionStats(session.id);
            const duration = session.endedAt
              ? minutesBetween(session.startedAt, session.endedAt)
              : 0;
            const isLive = session.fireMode === "live_fire";
            const isActive = !session.endedAt;

            return (
              <Link
                key={session.id}
                href={isActive ? `/session/active` : `/history/${session.id}`}
                className="bg-[var(--bg-card)] rounded-xl border border-surface-200 p-3 block hover:border-brand-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {formatDate(session.startedAt)} &mdash;{" "}
                      {isLive ? "Live Fire" : "Dry Fire"}
                      {isActive && (
                        <span className="text-xs bg-green-900/30 text-green-400 px-1.5 rounded ml-2">ACTIVE</span>
                      )}
                    </div>
                    <div className="text-xs text-surface-400">
                      {session.location || "No location"}
                      {stats.drillNames.length > 0 ? ` · ${stats.drillNames.join(", ")}` : ""}
                      {stats.totalRounds > 0 ? ` · ${stats.totalRounds} rds` : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${isLive ? "text-brand-600" : "text-blue-400"}`}>
                      {stats.validRuns} XP
                    </div>
                    <div className="text-xs text-surface-400">
                      {duration} min · {stats.totalRuns} runs
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
