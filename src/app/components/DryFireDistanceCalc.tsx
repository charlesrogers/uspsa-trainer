"use client";

import { useState } from "react";

type TargetScale = "full" | "1/3" | "1/6" | "custom";

interface ScaleOption {
  label: string;
  scale: number; // feet per yard
  description: string;
}

const SCALES: Record<Exclude<TargetScale, "custom">, ScaleOption> = {
  full: { label: "Full Size", scale: 3, description: "Standard USPSA target" },
  "1/3": { label: "1/3 Scale", scale: 1, description: "1 ft = 1 yd" },
  "1/6": { label: "1/6 Scale", scale: 0.5, description: "1 ft = 2 yd" },
};

function feetToDisplay(feet: number): string {
  const wholeFeet = Math.floor(feet);
  const inches = Math.round((feet - wholeFeet) * 12);
  if (inches === 12) return `${wholeFeet + 1} ft`;
  if (inches === 0) return `${wholeFeet} ft`;
  return `${wholeFeet}' ${inches}"`;
}

export default function DryFireDistanceCalc() {
  const [targetScale, setTargetScale] = useState<TargetScale>("1/3");
  const [expanded, setExpanded] = useState(false);

  const distances = [3, 5, 7, 10, 15, 20, 25, 50];

  const getActualFeet = (yardDistance: number): number => {
    if (targetScale === "custom") return yardDistance * 3; // fallback
    return yardDistance * SCALES[targetScale].scale;
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2 text-xs text-surface-500 hover:text-surface-300 py-2 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Target Distance Calculator — how far to stand from scaled targets
      </button>
    );
  }

  return (
    <div className="border-t border-surface-200 pt-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-surface-500 uppercase">Distance Calculator</h4>
        <button
          onClick={() => setExpanded(false)}
          className="text-xs text-surface-400 hover:text-surface-600"
        >
          Hide
        </button>
      </div>
      <p className="text-xs text-surface-400 mb-3">
        Select your target size to see how far back to stand.
      </p>

      {/* Target scale selector */}
      <div className="flex gap-1.5 mb-3">
        {(Object.keys(SCALES) as Exclude<TargetScale, "custom">[]).map((key) => (
          <button
            key={key}
            onClick={() => setTargetScale(key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              targetScale === key
                ? "bg-blue-600 text-white"
                : "bg-surface-100 text-surface-600"
            }`}
          >
            {SCALES[key].label}
          </button>
        ))}
      </div>

      {targetScale !== "full" && (
        <p className="text-xs text-blue-400 mb-3">
          {targetScale === "1/3" ? "1/3 scale: 1 foot of distance = 1 yard simulated" : "1/6 scale: 1 foot of distance = 2 yards simulated"}
        </p>
      )}

      {/* Distance table */}
      <div className="bg-[var(--bg-elevated)] rounded-lg overflow-hidden">
        <div className="grid grid-cols-2 text-xs font-semibold text-surface-500 px-3 py-2 border-b border-surface-200">
          <span>Simulated</span>
          <span className="text-right">Stand At</span>
        </div>
        {distances.map((yd) => {
          const feet = getActualFeet(yd);
          const isCommon = [7, 10, 15, 25].includes(yd);
          return (
            <div
              key={yd}
              className={`grid grid-cols-2 text-xs px-3 py-1.5 ${
                isCommon ? "font-medium text-surface-800" : "text-surface-500"
              }`}
            >
              <span>{yd} yd</span>
              <span className="text-right font-mono">{feetToDisplay(feet)}</span>
            </div>
          );
        })}
      </div>

      {targetScale === "full" && (
        <p className="text-xs text-surface-400 mt-2 italic">
          Full-size targets need real distance (3 ft per yard). Consider 1/3 or 1/6 scale targets for home use.
        </p>
      )}
    </div>
  );
}
