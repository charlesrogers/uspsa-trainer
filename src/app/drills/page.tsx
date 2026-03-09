"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { drills, getDrillBenchmarks, getBestTimeForDrill, sources } from "@/lib/store";
import { categoryColor, categoryLabel } from "@/lib/utils";

export default function DrillLibraryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const categories = ["All", "Marksmanship", "Transitions", "Movement", "Special"];
  const levels = ["All", "1", "2", "3", "4"];

  const categoryMap: Record<string, string> = {
    Marksmanship: "marksmanship",
    Transitions: "transition_vision",
    Movement: "stage_movement",
    Special: "special",
  };

  const filtered = useMemo(() => {
    return drills.filter((d) => {
      if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== "All" && d.category !== categoryMap[category]) return false;
      if (level !== "All" && d.levelIntroduced > parseInt(level)) return false;
      return true;
    });
  }, [search, category, level]);

  return (
    <div className="p-4">
      {/* Search */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search drills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`tab-btn px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              category === cat ? "active" : "bg-surface-100 text-surface-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Level filter */}
      <div className="flex gap-2 mb-4">
        <span className="text-xs text-surface-400 self-center mr-1">Level:</span>
        {levels.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`tab-btn px-2.5 py-1 rounded-lg text-xs font-medium ${
              level === l ? "active" : "bg-surface-100 text-surface-600"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Drill count */}
      <div className="text-xs text-surface-400 mb-3">{filtered.length} drills</div>

      {/* Drill Cards */}
      <div className="space-y-2">
        {filtered.map((drill) => {
          const cc = categoryColor(drill.category);
          const source = sources.find((s) => s.id === drill.sourceId);
          const benchmarks7 = getDrillBenchmarks(drill.id, "live_fire").filter(
            (b) => b.distanceYards === 7
          );
          const best = mounted ? getBestTimeForDrill(drill.id) : null;

          const modeLabel =
            drill.mode === "both"
              ? "Live + Dry"
              : drill.mode === "live_fire"
              ? "Live"
              : "Dry";

          return (
            <Link
              key={drill.id}
              href={`/drills/${drill.id}`}
              className="bg-white rounded-xl border border-surface-200 p-3 block hover:border-brand-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{drill.name}</div>
                  <div className="text-xs text-surface-400 mt-0.5">
                    {drill.roundCount} rounds · {drill.targetCount} target{drill.targetCount !== 1 ? "s" : ""} · {source?.name || "Unknown"}
                  </div>
                </div>
                <span className={`text-xs ${cc.bg} ${cc.text} px-1.5 py-0.5 rounded font-medium`}>
                  {categoryLabel(drill.category)}
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-surface-500">
                <span>{drill.distances.map((d) => `${d}`).join(", ")} yd</span>
                <span className="text-surface-300">|</span>
                <span>{modeLabel}</span>
                <span className="text-surface-300">|</span>
                <span>Level {drill.levelIntroduced}+</span>
              </div>
              {benchmarks7.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {["B", "A", "M", "GM"].map((cls) => {
                    const bm = benchmarks7.find((b) => b.classification === cls);
                    if (!bm) return null;
                    return (
                      <div key={cls} className="text-xs">
                        <span className="text-surface-400">{cls}:</span>{" "}
                        <span className="font-mono font-medium">{bm.targetTime.toFixed(2)}s</span>
                      </div>
                    );
                  })}
                  <div className="flex-1" />
                  {best ? (
                    <div className="text-xs">
                      <span className="text-surface-400">Your best:</span>{" "}
                      <span className="font-mono font-medium text-brand-600">
                        {best.totalTime.toFixed(2)}s
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-surface-400">No data yet</div>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
