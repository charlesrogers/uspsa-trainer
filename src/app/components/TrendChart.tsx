"use client";

import { useState, useRef, useCallback } from "react";

interface DataPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showLabels?: boolean;
  showXLabels?: boolean;
  /** Compact sparkline mode (no labels, no tooltip) */
  sparkline?: boolean;
}

function lineColor(value: number): string {
  if (value >= 70) return "#22c55e";
  if (value >= 50) return "#eab308";
  if (value >= 30) return "#f97316";
  return "#ef4444";
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TrendChart({
  data,
  width = 280,
  height = 120,
  color,
  showLabels = false,
  showXLabels = false,
  sparkline = false,
}: TrendChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const padLeft = showLabels ? 32 : sparkline ? 0 : 4;
  const padRight = sparkline ? 0 : 4;
  const padTop = sparkline ? 2 : 8;
  const padBottom = showXLabels ? 20 : sparkline ? 2 : 8;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Filter out zero-confidence points for a cleaner chart
  const hasAnyValue = data.some((d) => d.value > 0);

  if (data.length < 2 || !hasAnyValue) {
    return (
      <div
        className="flex items-center justify-center text-xs"
        style={{
          width,
          height: sparkline ? height : Math.max(height, 40),
          color: "#6b6b80",
        }}
      >
        {sparkline ? (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <line
              x1={0}
              y1={height / 2}
              x2={width}
              y2={height / 2}
              stroke="#2a2a38"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          </svg>
        ) : (
          "Complete drills to see trends"
        )}
      </div>
    );
  }

  // Scale data points
  const maxVal = 100; // mastery is always 0-100
  const minVal = 0;

  const points = data.map((d, i) => ({
    x: padLeft + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2),
    y: padTop + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH,
    date: d.date,
    value: d.value,
  }));

  // Build smooth path using cardinal spline approximation
  const buildPath = (pts: typeof points): string => {
    if (pts.length < 2) return "";
    let d = `M${pts[0].x},${pts[0].y}`;

    if (pts.length === 2) {
      d += ` L${pts[1].x},${pts[1].y}`;
      return d;
    }

    // Catmull-Rom to Bezier conversion for smooth curves
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const tension = 0.3;
      const cp1x = p1.x + ((p2.x - p0.x) * tension);
      const cp1y = p1.y + ((p2.y - p0.y) * tension);
      const cp2x = p2.x - ((p3.x - p1.x) * tension);
      const cp2y = p2.y - ((p3.y - p1.y) * tension);

      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const linePath = buildPath(points);

  // Gradient fill path (close the area under the line)
  const fillPath =
    linePath +
    ` L${points[points.length - 1].x},${padTop + chartH}` +
    ` L${points[0].x},${padTop + chartH} Z`;

  // Determine line color from the latest value
  const lastValue = data[data.length - 1].value;
  const strokeColor = color || lineColor(lastValue);

  const gradientId = `trend-grad-${Math.random().toString(36).slice(2, 8)}`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (sparkline) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      // Find nearest data point
      let nearest = 0;
      let minDist = Infinity;
      for (let i = 0; i < points.length; i++) {
        const dist = Math.abs(points[i].x - mouseX);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      }
      setHoverIdx(nearest);
    },
    [points, sparkline]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverIdx(null);
  }, []);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ overflow: "visible" }}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis labels */}
      {showLabels && (
        <>
          <text x={padLeft - 4} y={padTop + 4} textAnchor="end" fill="#6b6b80" fontSize="9" fontFamily="monospace">
            100%
          </text>
          <text x={padLeft - 4} y={padTop + chartH / 2 + 3} textAnchor="end" fill="#6b6b80" fontSize="9" fontFamily="monospace">
            50%
          </text>
          <text x={padLeft - 4} y={padTop + chartH + 4} textAnchor="end" fill="#6b6b80" fontSize="9" fontFamily="monospace">
            0%
          </text>
          {/* Grid lines */}
          <line x1={padLeft} y1={padTop} x2={padLeft + chartW} y2={padTop} stroke="#1c1c27" strokeWidth="0.5" />
          <line
            x1={padLeft}
            y1={padTop + chartH / 2}
            x2={padLeft + chartW}
            y2={padTop + chartH / 2}
            stroke="#1c1c27"
            strokeWidth="0.5"
            strokeDasharray="3,3"
          />
          <line x1={padLeft} y1={padTop + chartH} x2={padLeft + chartW} y2={padTop + chartH} stroke="#1c1c27" strokeWidth="0.5" />
        </>
      )}

      {/* X-axis labels */}
      {showXLabels &&
        points
          .filter((_, i) => i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2))
          .map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 2}
              textAnchor="middle"
              fill="#6b6b80"
              fontSize="9"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {formatShortDate(p.date)}
            </text>
          ))}

      {/* Fill area */}
      <path d={fillPath} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth={sparkline ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round" />

      {/* Hover indicator */}
      {hoverIdx !== null && !sparkline && (
        <>
          {/* Vertical guide line */}
          <line
            x1={points[hoverIdx].x}
            y1={padTop}
            x2={points[hoverIdx].x}
            y2={padTop + chartH}
            stroke="#3a3a4a"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          {/* Dot */}
          <circle
            cx={points[hoverIdx].x}
            cy={points[hoverIdx].y}
            r={4}
            fill={strokeColor}
            stroke="#0a0a0f"
            strokeWidth="2"
          />
          {/* Glow */}
          <circle
            cx={points[hoverIdx].x}
            cy={points[hoverIdx].y}
            r={8}
            fill={strokeColor}
            opacity="0.15"
          />
          {/* Tooltip */}
          {(() => {
            const pt = points[hoverIdx];
            const tooltipW = 72;
            const tooltipH = 32;
            let tx = pt.x - tooltipW / 2;
            const ty = pt.y - tooltipH - 10;
            // Keep tooltip in bounds
            if (tx < 0) tx = 0;
            if (tx + tooltipW > width) tx = width - tooltipW;
            return (
              <g>
                <rect
                  x={tx}
                  y={ty}
                  width={tooltipW}
                  height={tooltipH}
                  rx={6}
                  fill="#1c1c27"
                  stroke="#2a2a38"
                  strokeWidth="1"
                />
                <text
                  x={tx + tooltipW / 2}
                  y={ty + 12}
                  textAnchor="middle"
                  fill="#f0f0f5"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {Math.round(pt.value)}%
                </text>
                <text
                  x={tx + tooltipW / 2}
                  y={ty + 24}
                  textAnchor="middle"
                  fill="#6b6b80"
                  fontSize="8"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {formatShortDate(pt.date)}
                </text>
              </g>
            );
          })()}
        </>
      )}

      {/* End dot (always visible for sparklines) */}
      {sparkline && points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={2}
          fill={strokeColor}
        />
      )}
    </svg>
  );
}
