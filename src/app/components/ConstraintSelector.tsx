"use client";

import type { SessionConstraints } from "@/lib/recommendations";

interface Props {
  constraints: SessionConstraints;
  onChange: (c: SessionConstraints) => void;
  compact?: boolean;
}

export default function ConstraintSelector({ constraints, onChange, compact }: Props) {
  const update = (key: keyof SessionConstraints, value: string | number | boolean) => {
    onChange({ ...constraints, [key]: value });
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => update("fireMode", constraints.fireMode === "live_fire" ? "dry_fire" : "live_fire")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            constraints.fireMode === "live_fire"
              ? "bg-red-900/30 text-red-400"
              : "bg-blue-900/30 text-blue-400"
          }`}
        >
          {constraints.fireMode === "live_fire" ? "Live Fire" : "Dry Fire"}
        </button>
        <select
          value={constraints.timeMinutes}
          onChange={(e) => update("timeMinutes", parseInt(e.target.value))}
          className="px-2 py-1.5 rounded-lg text-xs font-medium bg-surface-100 text-surface-600 border-none"
        >
          <option value={10}>10 min</option>
          <option value={20}>20 min</option>
          <option value={30}>30 min</option>
          <option value={60}>60 min</option>
        </select>
        <button
          onClick={() => update("movementAvailable", !constraints.movementAvailable)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            constraints.movementAvailable
              ? "bg-green-900/30 text-green-400"
              : "bg-surface-100 text-surface-400 line-through"
          }`}
        >
          Movement
        </button>
        <select
          value={constraints.maxDistance}
          onChange={(e) => update("maxDistance", parseInt(e.target.value))}
          className="px-2 py-1.5 rounded-lg text-xs font-medium bg-surface-100 text-surface-600 border-none"
        >
          <option value={7}>7yd max</option>
          <option value={10}>10yd max</option>
          <option value={15}>15yd max</option>
          <option value={25}>25yd max</option>
          <option value={50}>50yd max</option>
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Fire Mode */}
      <div>
        <label className="text-xs font-medium text-surface-500 mb-1 block">Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => update("fireMode", "dry_fire")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              constraints.fireMode === "dry_fire"
                ? "bg-blue-600 text-white"
                : "bg-surface-100 text-surface-600"
            }`}
          >
            Dry Fire
          </button>
          <button
            onClick={() => update("fireMode", "live_fire")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              constraints.fireMode === "live_fire"
                ? "bg-red-600 text-white"
                : "bg-surface-100 text-surface-600"
            }`}
          >
            Live Fire
          </button>
        </div>
      </div>

      {/* Time */}
      <div>
        <label className="text-xs font-medium text-surface-500 mb-1 block">Time Available</label>
        <div className="flex gap-1.5">
          {[10, 20, 30, 60].map((t) => (
            <button
              key={t}
              onClick={() => update("timeMinutes", t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                constraints.timeMinutes === t
                  ? "bg-surface-900 text-white"
                  : "bg-surface-100 text-surface-600"
              }`}
            >
              {t}m
            </button>
          ))}
        </div>
      </div>

      {/* Movement */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-surface-500">Movement space available?</label>
        <button
          onClick={() => update("movementAvailable", !constraints.movementAvailable)}
          className={`relative w-10 h-6 rounded-full transition-colors ${
            constraints.movementAvailable ? "bg-green-500" : "bg-surface-300"
          }`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            constraints.movementAvailable ? "translate-x-4.5 left-0" : "left-0.5"
          }`} style={{ left: constraints.movementAvailable ? "18px" : "2px" }} />
        </button>
      </div>

      {/* Distance */}
      <div>
        <label className="text-xs font-medium text-surface-500 mb-1 block">Max Distance: {constraints.maxDistance}yd</label>
        <input
          type="range"
          min={5}
          max={50}
          step={5}
          value={constraints.maxDistance}
          onChange={(e) => update("maxDistance", parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-surface-400">
          <span>5yd</span>
          <span>25yd</span>
          <span>50yd</span>
        </div>
      </div>
    </div>
  );
}
