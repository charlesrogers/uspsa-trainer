"use client";

import { useState, useCallback, useRef } from "react";

// ── Constants ──
const AZONE_WIDTH = 6; // inches
const AZONE_HEIGHT = 11; // inches
const FULL_TARGET_WIDTH = 18; // inches
const FULL_TARGET_HEIGHT = 30; // inches

const COMMON_LIVE_DISTANCES = [3, 5, 7, 10, 15, 20, 25] as const;

// ── Types ──
export interface DryFireSetup {
  liveDistanceYards: number;
  roomDistanceFeet: number;
  scaleFactor: number;
  scaledAZoneWidth: number;
  scaledAZoneHeight: number;
  scaledTargetWidth: number;
  scaledTargetHeight: number;
}

// ── Calculator Logic ──
export function calculateDryFireSetup(
  liveDistanceYards: number,
  roomDistanceFeet: number
): DryFireSetup {
  const liveDistanceFeet = liveDistanceYards * 3;
  const scaleFactor = roomDistanceFeet / liveDistanceFeet;

  return {
    liveDistanceYards,
    roomDistanceFeet,
    scaleFactor,
    scaledAZoneWidth: AZONE_WIDTH * scaleFactor,
    scaledAZoneHeight: AZONE_HEIGHT * scaleFactor,
    scaledTargetWidth: FULL_TARGET_WIDTH * scaleFactor,
    scaledTargetHeight: FULL_TARGET_HEIGHT * scaleFactor,
  };
}

// ── Fraction Display ──
function toFractionString(inches: number): string {
  const whole = Math.floor(inches);
  const remainder = inches - whole;

  // Common fractions: 1/8, 1/4, 3/8, 1/2, 5/8, 3/4, 7/8
  const fractions: [number, string][] = [
    [0, ""],
    [1 / 8, "\u215B"],    // ⅛
    [1 / 4, "\u00BC"],    // ¼
    [3 / 8, "\u215C"],    // ⅜
    [1 / 2, "\u00BD"],    // ½
    [5 / 8, "\u215D"],    // ⅝
    [3 / 4, "\u00BE"],    // ¾
    [7 / 8, "\u215E"],    // ⅞
    [1, ""],
  ];

  let closest = fractions[0];
  let minDiff = Math.abs(remainder - fractions[0][0]);
  for (const f of fractions) {
    const diff = Math.abs(remainder - f[0]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = f;
    }
  }

  if (closest[0] === 1) {
    return `${whole + 1}"`;
  }
  if (closest[0] === 0) {
    return whole === 0 ? '<1"' : `${whole}"`;
  }
  if (whole === 0) {
    return `${closest[1]}"`;
  }
  return `${whole}${closest[1]}"`;
}

// ── Print Target ──
function openPrintTarget(setup: DryFireSetup) {
  const w = setup.scaledTargetWidth;
  const h = setup.scaledTargetHeight;
  const aw = setup.scaledAZoneWidth;
  const ah = setup.scaledAZoneHeight;

  // Convert inches to pixels at 96 DPI for screen (print will use inches)
  const DPI = 96;
  const pxW = w * DPI;
  const pxH = h * DPI;
  const pxAW = aw * DPI;
  const pxAH = ah * DPI;

  const html = `<!DOCTYPE html>
<html>
<head>
<title>Dry Fire Target - ${setup.liveDistanceYards}yd at ${setup.roomDistanceFeet}ft</title>
<style>
  @page { margin: 0.5in; }
  body {
    margin: 0; padding: 20px;
    font-family: 'Inter', system-ui, sans-serif;
    display: flex; flex-direction: column; align-items: center;
    background: #fff; color: #000;
  }
  .info { text-align: center; margin-bottom: 20px; font-size: 12px; }
  .info h2 { font-size: 16px; margin: 0 0 4px; }
  .info p { margin: 2px 0; color: #666; }
  .target-container { position: relative; }
  .target {
    width: ${w}in; height: ${h}in;
    border: 2px solid #000;
    position: relative;
    display: flex; align-items: center; justify-content: center;
    background: #f5deb3;
    border-radius: ${Math.min(w, h) * 0.08}in;
  }
  .azone {
    width: ${aw}in; height: ${ah}in;
    border: 2px solid #000;
    position: absolute;
    top: ${(h - ah) * 0.35}in;
    left: 50%; transform: translateX(-50%);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: bold;
  }
  .azone-label { font-size: 8px; color: #333; }
  .cut-line {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    border: 1px dashed #999;
    margin: -4px;
  }
  .dims { font-size: 10px; color: #666; text-align: center; margin-top: 8px; }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="info">
  <h2>Scaled Dry Fire Target</h2>
  <p>Simulating <strong>${setup.liveDistanceYards} yards</strong> at <strong>${setup.roomDistanceFeet} feet</strong> (scale: ${(setup.scaleFactor * 100).toFixed(1)}%)</p>
  <p>Place this target ${setup.roomDistanceFeet} feet away</p>
</div>
<div class="target-container">
  <div class="cut-line"></div>
  <div class="target">
    <div class="azone">
      <span class="azone-label">A</span>
    </div>
  </div>
</div>
<div class="dims">
  Target: ${w.toFixed(2)}" x ${h.toFixed(2)}" &nbsp;|&nbsp; A-zone: ${aw.toFixed(2)}" x ${ah.toFixed(2)}"
</div>
<button class="no-print" onclick="window.print()" style="margin-top:20px;padding:8px 24px;font-size:14px;cursor:pointer;border:1px solid #ccc;border-radius:6px;background:#f5f5f5;">
  Print Target
</button>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ── SVG Target Preview ──
function TargetPreview({ setup }: { setup: DryFireSetup }) {
  // Normalize: full target fits in a max height of 160px
  const maxH = 160;
  const displayScale = maxH / FULL_TARGET_HEIGHT;
  const tw = FULL_TARGET_WIDTH * displayScale;
  const th = FULL_TARGET_HEIGHT * displayScale;
  const aw = AZONE_WIDTH * displayScale;
  const ah = AZONE_HEIGHT * displayScale;

  // Scaled target overlay
  const stw = setup.scaledTargetWidth * displayScale;
  const sth = setup.scaledTargetHeight * displayScale;
  const saw = setup.scaledAZoneWidth * displayScale;
  const sah = setup.scaledAZoneHeight * displayScale;

  const svgW = tw + 40;
  const svgH = th + 30;
  const cx = svgW / 2;
  const topY = 10;

  // A-zone positioned ~35% from top of target
  const azoneTop = topY + th * 0.3;
  const scaledAzoneTop = topY + sth * 0.3;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="max-w-[200px] mx-auto"
    >
      {/* Full-size target (ghost) */}
      <rect
        x={cx - tw / 2}
        y={topY}
        width={tw}
        height={th}
        rx={4}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      {/* Full-size A-zone (ghost) */}
      <rect
        x={cx - aw / 2}
        y={azoneTop}
        width={aw}
        height={ah}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
        strokeDasharray="3 2"
      />

      {/* Scaled target */}
      <rect
        x={cx - stw / 2}
        y={topY}
        width={stw}
        height={sth}
        rx={3}
        fill="rgba(0,220,130,0.08)"
        stroke="var(--brand-600)"
        strokeWidth={1.5}
      />
      {/* Scaled A-zone */}
      <rect
        x={cx - saw / 2}
        y={scaledAzoneTop}
        width={saw}
        height={sah}
        fill="rgba(0,220,130,0.15)"
        stroke="var(--brand-600)"
        strokeWidth={1.5}
      />
      {/* A label */}
      {sah > 12 && (
        <text
          x={cx}
          y={scaledAzoneTop + sah / 2 + 3}
          textAnchor="middle"
          fill="var(--brand-600)"
          fontSize={Math.min(sah * 0.4, 12)}
          fontWeight="600"
        >
          A
        </text>
      )}

      {/* Dimension labels */}
      <text
        x={cx}
        y={svgH - 2}
        textAnchor="middle"
        fill="var(--surface-400)"
        fontSize="8"
        fontFamily="monospace"
      >
        {toFractionString(setup.scaledTargetWidth)} x{" "}
        {toFractionString(setup.scaledTargetHeight)}
      </text>
    </svg>
  );
}

// ── Main Component ──
interface DryFireDistanceCalcProps {
  presetDistances?: number[]; // For drill detail pages
  compact?: boolean;         // Smaller layout for inline use
}

export default function DryFireDistanceCalc({
  presetDistances,
  compact = false,
}: DryFireDistanceCalcProps) {
  const [expanded, setExpanded] = useState(false);
  const [roomDistance, setRoomDistance] = useState(10);
  const [selectedLiveDistance, setSelectedLiveDistance] = useState(7);
  const [showTable, setShowTable] = useState(true);

  const distances = presetDistances || [...COMMON_LIVE_DISTANCES];
  const setup = calculateDryFireSetup(selectedLiveDistance, roomDistance);

  // All setups for the quick reference table
  const allSetups = distances.map((d) => calculateDryFireSetup(d, roomDistance));

  if (!expanded && !compact) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2 text-xs py-2 transition-colors"
        style={{ color: "var(--surface-500)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--surface-300)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--surface-500)")}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Dry Fire Distance Calculator — scale targets for your room
      </button>
    );
  }

  return (
    <div
      className={compact ? "" : "border-t pt-4 mt-4"}
      style={compact ? {} : { borderColor: "rgba(255,255,255,0.05)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--surface-500)" }}
        >
          {compact ? "Dry Fire Setup" : "Distance Calculator"}
        </h4>
        {!compact && (
          <button
            onClick={() => setExpanded(false)}
            className="text-xs transition-colors"
            style={{ color: "var(--surface-400)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--surface-600)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--surface-400)")
            }
          >
            Hide
          </button>
        )}
      </div>

      <p
        className="text-xs mb-4"
        style={{ color: "var(--surface-400)" }}
      >
        Set your room distance, then see scaled target sizes that maintain the
        same angular size as a real IPSC target.
      </p>

      {/* Room Distance Input */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label
            className="text-xs font-medium"
            style={{ color: "var(--surface-500)" }}
          >
            Room Distance
          </label>
          <span
            className="text-sm font-mono font-semibold"
            style={{ color: "var(--surface-50)" }}
          >
            {roomDistance} ft
          </span>
        </div>
        <input
          type="range"
          min={3}
          max={20}
          step={0.5}
          value={roomDistance}
          onChange={(e) => setRoomDistance(parseFloat(e.target.value))}
          className="w-full"
        />
        <div
          className="flex justify-between text-[10px] mt-1"
          style={{ color: "var(--surface-400)" }}
        >
          <span>3 ft</span>
          <span>20 ft</span>
        </div>
      </div>

      {/* Live Distance Selector */}
      <div className="mb-4">
        <label
          className="text-xs font-medium block mb-2"
          style={{ color: "var(--surface-500)" }}
        >
          Simulated Live Distance
        </label>
        <div className="flex flex-wrap gap-1.5">
          {distances.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedLiveDistance(d)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                selectedLiveDistance === d
                  ? {
                      backgroundColor: "var(--brand-600)",
                      color: "#0a0a10",
                      boxShadow: "0 0 8px rgba(0,220,130,0.25)",
                    }
                  : {
                      backgroundColor: "var(--surface-100)",
                      color: "var(--surface-500)",
                    }
              }
              onMouseEnter={(e) => {
                if (selectedLiveDistance !== d) {
                  e.currentTarget.style.backgroundColor = "var(--surface-200)";
                  e.currentTarget.style.color = "var(--surface-700)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedLiveDistance !== d) {
                  e.currentTarget.style.backgroundColor = "var(--surface-100)";
                  e.currentTarget.style.color = "var(--surface-500)";
                }
              }}
            >
              {d} yd
            </button>
          ))}
        </div>
      </div>

      {/* Results Display */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* Scale Factor */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs"
            style={{ color: "var(--surface-400)" }}
          >
            Scale Factor
          </span>
          <span
            className="text-lg font-bold font-mono"
            style={{ color: "var(--brand-600)" }}
          >
            {(setup.scaleFactor * 100).toFixed(1)}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* A-Zone */}
          <div>
            <div
              className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--surface-400)" }}
            >
              Scaled A-Zone
            </div>
            <div
              className="text-sm font-mono font-semibold"
              style={{ color: "var(--surface-50)" }}
            >
              {toFractionString(setup.scaledAZoneWidth)} x{" "}
              {toFractionString(setup.scaledAZoneHeight)}
            </div>
            <div
              className="text-[10px] mt-0.5"
              style={{ color: "var(--surface-400)" }}
            >
              was {AZONE_WIDTH}" x {AZONE_HEIGHT}"
            </div>
          </div>

          {/* Full Target */}
          <div>
            <div
              className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--surface-400)" }}
            >
              Scaled Target
            </div>
            <div
              className="text-sm font-mono font-semibold"
              style={{ color: "var(--surface-50)" }}
            >
              {toFractionString(setup.scaledTargetWidth)} x{" "}
              {toFractionString(setup.scaledTargetHeight)}
            </div>
            <div
              className="text-[10px] mt-0.5"
              style={{ color: "var(--surface-400)" }}
            >
              was {FULL_TARGET_WIDTH}" x {FULL_TARGET_HEIGHT}"
            </div>
          </div>
        </div>

        {/* Visual Target Preview */}
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-center"
            style={{ color: "var(--surface-400)" }}
          >
            Preview (scaled vs. full)
          </div>
          <TargetPreview setup={setup} />
        </div>
      </div>

      {/* Quick Reference Table */}
      <div className="mb-3">
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-1.5 text-xs font-medium mb-2 transition-colors"
          style={{ color: "var(--surface-500)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--surface-300)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--surface-500)")
          }
        >
          <svg
            className={`w-3 h-3 transition-transform ${showTable ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
          Quick Reference — All Distances at {roomDistance} ft
        </button>

        {showTable && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: "var(--bg-elevated)" }}
          >
            <div
              className="grid text-[10px] font-semibold px-3 py-2"
              style={{
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                color: "var(--surface-400)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span>Live Dist</span>
              <span className="text-center">Scale</span>
              <span className="text-center">A-Zone</span>
              <span className="text-right">Target</span>
            </div>
            {allSetups.map((s) => {
              const isSelected = s.liveDistanceYards === selectedLiveDistance;
              return (
                <button
                  key={s.liveDistanceYards}
                  onClick={() => setSelectedLiveDistance(s.liveDistanceYards)}
                  className="grid w-full text-xs px-3 py-1.5 transition-colors text-left"
                  style={{
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    color: isSelected ? "var(--surface-50)" : "var(--surface-500)",
                    backgroundColor: isSelected
                      ? "rgba(0,220,130,0.06)"
                      : "transparent",
                  }}
                >
                  <span className={isSelected ? "font-semibold" : ""}>
                    {s.liveDistanceYards} yd
                  </span>
                  <span className="text-center font-mono">
                    {(s.scaleFactor * 100).toFixed(0)}%
                  </span>
                  <span className="text-center font-mono">
                    {toFractionString(s.scaledAZoneWidth)} x{" "}
                    {toFractionString(s.scaledAZoneHeight)}
                  </span>
                  <span className="text-right font-mono">
                    {toFractionString(s.scaledTargetWidth)} x{" "}
                    {toFractionString(s.scaledTargetHeight)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Print Target Button */}
      <button
        onClick={() => openPrintTarget(setup)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all"
        style={{
          border: "1px solid rgba(0,220,130,0.2)",
          color: "var(--brand-600)",
          backgroundColor: "rgba(0,220,130,0.05)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0,220,130,0.1)";
          e.currentTarget.style.borderColor = "rgba(0,220,130,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0,220,130,0.05)";
          e.currentTarget.style.borderColor = "rgba(0,220,130,0.2)";
        }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Scaled Target for {selectedLiveDistance} yd
      </button>
    </div>
  );
}
