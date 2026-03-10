"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { skills, drills, drillSkillMaps } from "@/lib/store";
import { computeAllSkillEstimates } from "@/lib/skillEstimation";
import type { SkillEstimate } from "@/lib/skillEstimation";
import type { Skill } from "@/data/seed";

// ─── Layout constants ───
const NODE_W = 150;
const NODE_H = 32;
const NODE_GAP_Y = 6;
const COL_GAP = 40;
const HEADER_H = 40;
const PAD = 20;

const CATEGORY_ORDER = [
  "fundamentals",
  "confirmation",
  "transitions",
  "reloads",
  "movement",
  "stage_craft",
  "single_hand",
  "other",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  fundamentals: "Fundamentals",
  confirmation: "Confirmation",
  transitions: "Transitions",
  reloads: "Reloads",
  movement: "Movement",
  stage_craft: "Stage Craft",
  single_hand: "Single Hand",
  other: "Other",
};

interface NodePos {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  skill: Skill;
  estimate: SkillEstimate | null;
  isChild: boolean;
}

interface Edge {
  from: string;
  to: string;
  type: "parent" | "prerequisite";
  weight?: number;
}

function masteryColor(mastery: number, confidence: number): string {
  if (confidence === 0) return "#2a2a38"; // no data
  if (mastery >= 90) return "#22c55e";
  if (mastery >= 70) return "#4ade80";
  if (mastery >= 50) return "#eab308";
  if (mastery >= 30) return "#f97316";
  return "#ef4444";
}

function masteryBorder(mastery: number, confidence: number): string {
  if (confidence === 0) return "#3a3a4a";
  if (mastery >= 90) return "#16a34a";
  if (mastery >= 70) return "#22c55e";
  if (mastery >= 50) return "#ca8a04";
  if (mastery >= 30) return "#ea580c";
  return "#dc2626";
}

function trendArrow(trend: string): string {
  if (trend === "improving") return "▲";
  if (trend === "declining") return "▼";
  if (trend === "stable") return "●";
  return "";
}

function trendColor(trend: string): string {
  if (trend === "improving") return "#22c55e";
  if (trend === "declining") return "#ef4444";
  if (trend === "stable") return "#6b6b80";
  return "#3a3a4a";
}

export default function KnowledgeGraphPage() {
  const [estimates, setEstimates] = useState<SkillEstimate[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"tree" | "dag">("dag");
  const svgRef = useRef<SVGSVGElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  useEffect(() => {
    setMounted(true);
    setEstimates(computeAllSkillEstimates());
  }, []);

  // ─── Layout computation ───
  const computeLayout = useCallback(() => {
    const nodes: NodePos[] = [];
    const edges: Edge[] = [];
    let colX = PAD;

    for (const cat of CATEGORY_ORDER) {
      const catSkills = skills.filter((s) => s.category === cat);
      const topLevel = catSkills.filter((s) => !s.parentId);
      let nodeY = PAD + HEADER_H;

      for (const skill of topLevel) {
        const est = estimates.find((e) => e.skillId === skill.id) || null;
        nodes.push({
          id: skill.id,
          x: colX,
          y: nodeY,
          w: NODE_W,
          h: NODE_H,
          skill,
          estimate: est,
          isChild: false,
        });
        nodeY += NODE_H + NODE_GAP_Y;

        // Children
        const children = catSkills.filter((s) => s.parentId === skill.id);
        for (const child of children) {
          const childEst = estimates.find((e) => e.skillId === child.id) || null;
          nodes.push({
            id: child.id,
            x: colX + 12,
            y: nodeY,
            w: NODE_W - 12,
            h: NODE_H - 4,
            skill: child,
            estimate: childEst,
            isChild: true,
          });
          edges.push({ from: skill.id, to: child.id, type: "parent" });
          nodeY += NODE_H - 4 + NODE_GAP_Y;
        }
        nodeY += 4; // extra space between top-level groups
      }

      // Store column info for header
      nodes.push({
        id: `header-${cat}`,
        x: colX,
        y: PAD,
        w: NODE_W,
        h: HEADER_H,
        skill: { id: `header-${cat}`, name: CATEGORY_LABELS[cat], category: cat } as Skill,
        estimate: null,
        isChild: false,
      });

      colX += NODE_W + COL_GAP;
    }

    // Cross-category prerequisite edges (DAG)
    if (viewMode === "dag") {
      for (const skill of skills) {
        if (skill.prerequisites && skill.prerequisites.length > 0) {
          for (const prereqId of skill.prerequisites) {
            edges.push({
              from: prereqId,
              to: skill.id,
              type: "prerequisite",
            });
          }
        }
      }
    }

    // Drill-skill edges for selected skill
    if (selectedSkill) {
      const mappings = drillSkillMaps.filter((m) => m.skillId === selectedSkill);
      for (const m of mappings) {
        edges.push({
          from: selectedSkill,
          to: `drill-${m.drillId}`,
          type: "parent",
          weight: m.encompassingWeight,
        });
      }
    }

    return { nodes, edges };
  }, [estimates, viewMode, selectedSkill]);

  if (!mounted) return null;

  const { nodes, edges } = computeLayout();
  const realNodes = nodes.filter((n) => !n.id.startsWith("header-"));
  const headerNodes = nodes.filter((n) => n.id.startsWith("header-"));
  const maxX = Math.max(...nodes.map((n) => n.x + n.w)) + PAD;
  const maxY = Math.max(...nodes.map((n) => n.y + n.h)) + PAD;

  // Selected skill info
  const selectedNode = selectedSkill
    ? realNodes.find((n) => n.id === selectedSkill)
    : null;
  const selectedDrills = selectedSkill
    ? drillSkillMaps
        .filter((m) => m.skillId === selectedSkill)
        .map((m) => ({
          ...m,
          drill: drills.find((d) => d.id === m.drillId),
        }))
        .filter((m) => m.drill)
        .sort((a, b) => b.encompassingWeight - a.encompassingWeight)
    : [];

  // Prerequisites for selected skill
  const selectedPrereqs = selectedSkill
    ? (skills.find((s) => s.id === selectedSkill)?.prerequisites || [])
        .map((id) => skills.find((s) => s.id === id))
        .filter(Boolean) as Skill[]
    : [];

  // Skills that depend on selected skill
  const selectedDependents = selectedSkill
    ? skills.filter(
        (s) => s.prerequisites && s.prerequisites.includes(selectedSkill)
      )
    : [];

  // Pan/zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  };

  const handleMouseUp = () => setDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.3, Math.min(2, z * delta)));
  };

  // Edge path helper
  const getNodeCenter = (id: string): { x: number; y: number } | null => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return null;
    return { x: node.x + node.w / 2, y: node.y + node.h / 2 };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-52px)]">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-brand-400 flex items-center gap-1 text-sm font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-sm font-semibold" style={{ color: "#f0f0f5" }}>
            Knowledge Graph
          </h1>
          <span className="text-xs" style={{ color: "#6b6b80" }}>
            {skills.length} skills · {drillSkillMaps.length} mappings
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("tree")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium ${
              viewMode === "tree"
                ? "bg-brand-600 text-white"
                : "text-surface-500"
            }`}
          >
            Tree
          </button>
          <button
            onClick={() => setViewMode("dag")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium ${
              viewMode === "dag"
                ? "bg-brand-600 text-white"
                : "text-surface-500"
            }`}
          >
            DAG
          </button>
          <div className="w-px h-4 bg-surface-200 mx-1" />
          <button
            onClick={() => {
              setPan({ x: 0, y: 0 });
              setZoom(1);
            }}
            className="text-xs text-surface-500 hover:text-surface-300"
          >
            Reset
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(2, z * 1.2))}
            className="text-xs text-surface-500 hover:text-surface-300 w-6 h-6 flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.3, z * 0.8))}
            className="text-xs text-surface-500 hover:text-surface-300 w-6 h-6 flex items-center justify-center"
          >
            −
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Graph canvas */}
        <div
          className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ background: "var(--bg-base)" }}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ minWidth: "100%", minHeight: "100%" }}
          >
            <g
              transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
            >
              {/* Category column headers */}
              {headerNodes.map((h) => (
                <g key={h.id}>
                  <text
                    x={h.x + h.w / 2}
                    y={h.y + 24}
                    textAnchor="middle"
                    fill="#8b8ba0"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="Inter, system-ui, sans-serif"
                    letterSpacing="0.05em"
                  >
                    {h.skill.name.toUpperCase()}
                  </text>
                  <line
                    x1={h.x}
                    y1={h.y + HEADER_H - 4}
                    x2={h.x + h.w}
                    y2={h.y + HEADER_H - 4}
                    stroke="#2a2a38"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {/* Edges */}
              {edges
                .filter((e) => e.type === "parent")
                .map((edge, i) => {
                  const from = getNodeCenter(edge.from);
                  const to = getNodeCenter(edge.to);
                  if (!from || !to) return null;
                  return (
                    <line
                      key={`pe-${i}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="#2a2a38"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  );
                })}

              {/* DAG prerequisite edges */}
              {edges
                .filter((e) => e.type === "prerequisite")
                .map((edge, i) => {
                  const fromNode = nodes.find((n) => n.id === edge.from);
                  const toNode = nodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const isHighlighted =
                    selectedSkill &&
                    (edge.from === selectedSkill || edge.to === selectedSkill);

                  // Curved path for cross-category edges
                  const x1 = fromNode.x + fromNode.w;
                  const y1 = fromNode.y + fromNode.h / 2;
                  const x2 = toNode.x;
                  const y2 = toNode.y + toNode.h / 2;
                  const midX = (x1 + x2) / 2;
                  const cp1x = midX;
                  const cp2x = midX;

                  return (
                    <g key={`de-${i}`}>
                      <path
                        d={`M${x1},${y1} C${cp1x},${y1} ${cp2x},${y2} ${x2},${y2}`}
                        fill="none"
                        stroke={isHighlighted ? "#00dc82" : "#4a4a5a"}
                        strokeWidth={isHighlighted ? 2 : 1}
                        strokeDasharray={isHighlighted ? "none" : "4,3"}
                        opacity={isHighlighted ? 1 : 0.4}
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}

              {/* Arrow marker definition */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L8,3 L0,6 Z" fill="#6b6b80" />
                </marker>
                <marker
                  id="arrowhead-green"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L8,3 L0,6 Z" fill="#00dc82" />
                </marker>
              </defs>

              {/* Skill nodes */}
              {realNodes.map((node) => {
                const est = node.estimate;
                const mastery = est?.mastery || 0;
                const confidence = est?.confidence || 0;
                const trend = est?.trend || "unknown";
                const isSelected = selectedSkill === node.id;
                const isConnected =
                  selectedSkill &&
                  edges.some(
                    (e) =>
                      (e.from === selectedSkill && e.to === node.id) ||
                      (e.to === selectedSkill && e.from === node.id)
                  );
                const hasPrereqs =
                  node.skill.prerequisites && node.skill.prerequisites.length > 0;

                return (
                  <g
                    key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSkill(
                        selectedSkill === node.id ? null : node.id
                      );
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Node background */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.w}
                      height={node.h}
                      rx={6}
                      fill={isSelected ? "#1c1c30" : "#13131a"}
                      stroke={
                        isSelected
                          ? "#00dc82"
                          : isConnected
                          ? "#00dc82"
                          : masteryBorder(mastery, confidence)
                      }
                      strokeWidth={isSelected ? 2 : 1}
                      opacity={
                        selectedSkill && !isSelected && !isConnected ? 0.4 : 1
                      }
                    />

                    {/* Mastery bar at bottom of node */}
                    {confidence > 0 && (
                      <rect
                        x={node.x + 2}
                        y={node.y + node.h - 3}
                        width={Math.max(1, (node.w - 4) * (mastery / 100))}
                        height={2}
                        rx={1}
                        fill={masteryColor(mastery, confidence)}
                        opacity={0.8}
                      />
                    )}

                    {/* Skill name */}
                    <text
                      x={node.x + (node.isChild ? 8 : 8)}
                      y={node.y + (node.isChild ? 13 : 14)}
                      fill={
                        confidence > 0
                          ? "#e0e0ea"
                          : selectedSkill && !isSelected && !isConnected
                          ? "#4a4a5a"
                          : "#8b8ba0"
                      }
                      fontSize={node.isChild ? "9" : "10"}
                      fontWeight={node.isChild ? "400" : "500"}
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {node.skill.name.length > 20
                        ? node.skill.name.slice(0, 19) + "…"
                        : node.skill.name}
                    </text>

                    {/* Mastery % */}
                    {confidence > 0 && (
                      <text
                        x={node.x + node.w - 8}
                        y={node.y + (node.isChild ? 13 : 14)}
                        textAnchor="end"
                        fill={masteryColor(mastery, confidence)}
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="Inter, system-ui, sans-serif"
                      >
                        {Math.round(mastery)}%
                      </text>
                    )}

                    {/* Trend indicator */}
                    {confidence > 0 && trend !== "unknown" && (
                      <text
                        x={node.x + node.w - 28}
                        y={node.y + (node.isChild ? 13 : 14)}
                        textAnchor="end"
                        fill={trendColor(trend)}
                        fontSize="7"
                        fontFamily="Inter, system-ui, sans-serif"
                      >
                        {trendArrow(trend)}
                      </text>
                    )}

                    {/* Level badge */}
                    {!node.isChild && (
                      <text
                        x={node.x + 8}
                        y={node.y + node.h - 6}
                        fill="#4a4a5a"
                        fontSize="7"
                        fontFamily="Inter, system-ui, sans-serif"
                      >
                        L{node.skill.levelIntroduced}
                        {hasPrereqs ? " · DAG" : ""}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Detail panel */}
        {selectedNode && (
          <div
            className="w-72 flex-shrink-0 overflow-y-auto p-4 space-y-4"
            style={{
              background: "var(--bg-card)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Skill info */}
            <div>
              <h2
                className="text-sm font-semibold mb-1"
                style={{ color: "#f0f0f5" }}
              >
                {selectedNode.skill.name}
              </h2>
              <p className="text-xs" style={{ color: "#8b8ba0" }}>
                {selectedNode.skill.description}
              </p>
              <div
                className="flex items-center gap-2 mt-2 text-xs"
                style={{ color: "#6b6b80" }}
              >
                <span>
                  Level {selectedNode.skill.levelIntroduced}
                </span>
                <span>·</span>
                <span>{selectedNode.skill.category}</span>
              </div>
            </div>

            {/* Mastery */}
            {selectedNode.estimate && selectedNode.estimate.confidence > 0 && (
              <div
                className="rounded-lg p-3"
                style={{ background: "var(--bg-elevated)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: "#8b8ba0" }}>
                    Mastery
                  </span>
                  <span
                    className="text-sm font-bold font-mono"
                    style={{
                      color: masteryColor(
                        selectedNode.estimate.mastery,
                        selectedNode.estimate.confidence
                      ),
                    }}
                  >
                    {Math.round(selectedNode.estimate.mastery)}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "#252530" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${selectedNode.estimate.mastery}%`,
                      background: masteryColor(
                        selectedNode.estimate.mastery,
                        selectedNode.estimate.confidence
                      ),
                    }}
                  />
                </div>
                <div
                  className="flex items-center justify-between mt-2 text-xs"
                  style={{ color: "#6b6b80" }}
                >
                  <span>
                    Confidence: {Math.round(selectedNode.estimate.confidence * 100)}%
                  </span>
                  <span
                    style={{ color: trendColor(selectedNode.estimate.trend) }}
                  >
                    {trendArrow(selectedNode.estimate.trend)}{" "}
                    {selectedNode.estimate.trend}
                  </span>
                </div>
                <div className="text-xs mt-1" style={{ color: "#6b6b80" }}>
                  {selectedNode.estimate.signalCount} signals
                </div>
              </div>
            )}

            {/* Prerequisites (DAG edges) */}
            {selectedPrereqs.length > 0 && (
              <div>
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "#6b6b80" }}
                >
                  Prerequisites
                </h3>
                <div className="space-y-1">
                  {selectedPrereqs.map((s) => {
                    const est = estimates.find((e) => e.skillId === s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSkill(s.id)}
                        className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs"
                        style={{ background: "var(--bg-elevated)" }}
                      >
                        <span style={{ color: "#e0e0ea" }}>{s.name}</span>
                        {est && est.confidence > 0 && (
                          <span
                            className="font-mono font-medium"
                            style={{
                              color: masteryColor(est.mastery, est.confidence),
                            }}
                          >
                            {Math.round(est.mastery)}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dependents */}
            {selectedDependents.length > 0 && (
              <div>
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "#6b6b80" }}
                >
                  Unlocks
                </h3>
                <div className="space-y-1">
                  {selectedDependents.map((s) => {
                    const est = estimates.find((e) => e.skillId === s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSkill(s.id)}
                        className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs"
                        style={{ background: "var(--bg-elevated)" }}
                      >
                        <span style={{ color: "#e0e0ea" }}>{s.name}</span>
                        {est && est.confidence > 0 && (
                          <span
                            className="font-mono font-medium"
                            style={{
                              color: masteryColor(est.mastery, est.confidence),
                            }}
                          >
                            {Math.round(est.mastery)}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Connected drills */}
            {selectedDrills.length > 0 && (
              <div>
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "#6b6b80" }}
                >
                  Drills ({selectedDrills.length})
                </h3>
                <div className="space-y-1">
                  {selectedDrills.map((m) => (
                    <Link
                      key={m.drillId}
                      href={`/drills/${m.drillId}`}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs hover:brightness-125"
                      style={{ background: "var(--bg-elevated)" }}
                    >
                      <span style={{ color: "#e0e0ea" }}>
                        {m.drill!.name}
                        {m.isPrimary && (
                          <span
                            className="ml-1 text-[9px] font-medium px-1 py-0.5 rounded"
                            style={{
                              background: "rgba(0,220,130,0.1)",
                              color: "#00dc82",
                            }}
                          >
                            PRIMARY
                          </span>
                        )}
                      </span>
                      <span className="font-mono" style={{ color: "#6b6b80" }}>
                        {m.encompassingWeight.toFixed(1)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div
              className="rounded-lg p-3"
              style={{
                background: "var(--bg-elevated)",
                borderTop: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <h4
                className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#6b6b80" }}
              >
                Legend
              </h4>
              <div className="space-y-1.5 text-[10px]" style={{ color: "#8b8ba0" }}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: "#22c55e" }}
                  />
                  <span>90%+ mastery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: "#eab308" }}
                  />
                  <span>50–70% mastery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: "#ef4444" }}
                  />
                  <span>&lt;30% mastery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: "#2a2a38", border: "1px solid #3a3a4a" }}
                  />
                  <span>No data</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "#4a4a5a" }}>- - -</span>
                  <span>DAG prerequisite edge</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom legend bar when nothing selected */}
      {!selectedSkill && (
        <div
          className="flex items-center justify-center gap-6 px-4 py-2 flex-shrink-0 text-[10px]"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            color: "#6b6b80",
          }}
        >
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: "#22c55e" }}
            />
            90%+
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: "#4ade80" }}
            />
            70%+
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: "#eab308" }}
            />
            50%+
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: "#f97316" }}
            />
            30%+
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: "#ef4444" }}
            />
            &lt;30%
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: "#2a2a38", border: "1px solid #3a3a4a" }}
            />
            No data
          </span>
          <span>Click a skill to inspect</span>
        </div>
      )}
    </div>
  );
}
